import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { ChatSessionModel, IContext } from "@/models/ChatSession";
import {
  buildBubblePrompt,
  buildPlannerPrompt,
  CONTEXT_EXTRACTION_PROMPT,
} from "@/lib/plannerPrompts";

// ── Config ────────────────────────────────────────────────────────────────────

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // swap to mixtral-8x7b if needed

// ── POST /api/planner ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      source = "bubble", // "bubble" | "planner"
      guestId, // client-generated uuid for guest sessions
    } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      source: "bubble" | "planner";
      guestId?: string;
    };

    // ── 1. Auth ───────────────────────────────────────────────────────────────
    const user = await getSession(); // reads tw_session cookie via auth.ts

    // ── 2. Load prior context from DB ─────────────────────────────────────────
    await connectDB();

    let sessionDoc = null;
    let priorContext: IContext = {};

    if (user) {
      sessionDoc = await ChatSessionModel.findOne({
        userId: user.id,
        source,
      }).sort({ updatedAt: -1 });
      priorContext = sessionDoc?.context ?? {};
    } else if (guestId) {
      sessionDoc = await ChatSessionModel.findOne({
        guestId,
        source,
      }).sort({ updatedAt: -1 });
      priorContext = sessionDoc?.context ?? {};
    }

    // ── 3. Build system prompt ────────────────────────────────────────────────
    const systemPrompt =
      source === "bubble"
        ? buildBubblePrompt(
            priorContext,
            user ? `${user.firstName} ${user.lastName}` : undefined,
          )
        : buildPlannerPrompt(
            priorContext,
            user ? `${user.firstName} ${user.lastName}` : undefined,
          );

    // ── 4. Call Groq with streaming ───────────────────────────────────────────
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        stream: true,
        max_tokens: source === "bubble" ? 200 : 1500,
        temperature: 0.7,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "AI unavailable" }, { status: 502 });
    }

    // ── 5. Stream back to client + collect full response ──────────────────────
    const encoder = new TextEncoder();
    let fullAssistantReply = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = groqRes.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content ?? "";
                if (delta) {
                  fullAssistantReply += delta;
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ text: delta })}\n\n`,
                    ),
                  );
                }
              } catch {
                // malformed chunk — skip
              }
            }
          }
        } finally {
          controller.close();
          // ── 6. Persist session + extract context (non-blocking) ────────────
          persistSession({
            user,
            guestId,
            source,
            messages,
            assistantReply: fullAssistantReply,
            existingSessionId: sessionDoc?._id?.toString(),
          }).catch(console.error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("/api/planner error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── Session persistence + context extraction ──────────────────────────────────

async function persistSession({
  user,
  guestId,
  source,
  messages,
  assistantReply,
  existingSessionId,
}: {
  user: Awaited<ReturnType<typeof getSession>>;
  guestId?: string;
  source: string;
  messages: { role: string; content: string }[];
  assistantReply: string;
  existingSessionId?: string;
}) {
  await connectDB();

  // Build message array to append
  const lastUserMsg = messages[messages.length - 1];
  const newMessages = [
    {
      role: lastUserMsg.role,
      content: lastUserMsg.content,
      timestamp: new Date(),
    },
    { role: "assistant", content: assistantReply, timestamp: new Date() },
  ];

  // Extract context from full conversation (run only if 4+ turns to save API calls)
  let extractedContext: IContext = {};
  const totalMessages = messages.length + 1;

  if (totalMessages >= 4) {
    extractedContext = await extractContext([
      ...messages,
      { role: "assistant", content: assistantReply },
    ]);
  }

  if (existingSessionId) {
    // Append to existing session
    await ChatSessionModel.findByIdAndUpdate(existingSessionId, {
      $push: { messages: { $each: newMessages } },
      ...(Object.keys(extractedContext).length > 0 && {
        $set: {
          context: { ...extractedContext, lastUpdated: new Date() },
        },
      }),
    });
  } else {
    // Create new session
    const sessionData: Record<string, unknown> = {
      source,
      messages: [
        ...messages.map((m) => ({ ...m, timestamp: new Date() })),
        { role: "assistant", content: assistantReply, timestamp: new Date() },
      ],
      context:
        Object.keys(extractedContext).length > 0
          ? { ...extractedContext, lastUpdated: new Date() }
          : {},
    };

    if (user) sessionData.userId = user.id;
    else if (guestId) sessionData.guestId = guestId;

    await ChatSessionModel.create(sessionData);
  }
}

// ── Context extraction via a second (non-streaming) Groq call ─────────────────

async function extractContext(
  messages: { role: string; content: string }[],
): Promise<IContext> {
  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // use faster/cheaper model for extraction
        stream: false,
        max_tokens: 300,
        temperature: 0,
        messages: [
          ...messages,
          { role: "user", content: CONTEXT_EXTRACTION_PROMPT },
        ],
      }),
    });

    if (!res.ok) return {};
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as IContext;
  } catch {
    return {};
  }
}
