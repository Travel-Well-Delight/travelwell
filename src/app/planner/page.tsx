"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  Send,
  Loader2,
  Map,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useGuestId } from "@/hooks/useGuestId";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavBtn {
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
  primary?: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  navButtons?: NavBtn[];
}

// ── Nav button ────────────────────────────────────────────────────────────────

function NavButton({ btn }: { btn: NavBtn }) {
  return (
    <a
      href={btn.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        background: btn.primary ? "#C8392B" : "#FDF6ED",
        border: `1px solid ${btn.primary ? "#C8392B" : "rgba(200,57,43,0.2)"}`,
        borderRadius: "8px",
        textDecoration: "none",
        transition: "all 0.15s ease",
        marginTop: "6px",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.background = btn.primary ? "#b03224" : "rgba(200,57,43,0.07)";
        el.style.borderColor = "#C8392B";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.background = btn.primary ? "#C8392B" : "#FDF6ED";
        el.style.borderColor = btn.primary ? "#C8392B" : "rgba(200,57,43,0.2)";
      }}
    >
      <span
        style={{
          color: btn.primary ? "#fff" : "#C8392B",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {btn.icon}
      </span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: btn.primary ? "#fff" : "#1C0A00",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {btn.label}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: btn.primary ? "rgba(255,255,255,0.75)" : "#7A4A2A",
            marginTop: "1px",
          }}
        >
          {btn.sub}
        </div>
      </div>
      <ArrowRight
        size={13}
        color={btn.primary ? "rgba(255,255,255,0.7)" : "#C8392B"}
      />
    </a>
  );
}

// ── Inner planner ─────────────────────────────────────────────────────────────

function PlannerInner() {
  const searchParams = useSearchParams();
  const guestId = useGuestId();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(80);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Measure real navbar height ────────────────────────────────────────────
  useEffect(() => {
    const nav = document.querySelector("header") as HTMLElement;
    if (nav) setNavbarHeight(nav.offsetHeight);
  }, []);

  // ── Hide/show global navbar based on chat state ───────────────────────────
  useEffect(() => {
    const nav = document.querySelector("header") as HTMLElement;
    if (!nav) return;

    if (chatStarted) {
      // Slide navbar up out of view
      nav.style.transition = "transform 0.35s ease, opacity 0.35s ease";
      nav.style.transform = "translateY(-100%)";
      nav.style.opacity = "0";
      nav.style.pointerEvents = "none";
    } else {
      // Restore navbar
      nav.style.transition = "transform 0.35s ease, opacity 0.35s ease";
      nav.style.transform = "translateY(0)";
      nav.style.opacity = "1";
      nav.style.pointerEvents = "auto";
    }

    return () => {
      // Always restore on unmount
      nav.style.transform = "translateY(0)";
      nav.style.opacity = "1";
      nav.style.pointerEvents = "auto";
    };
  }, [chatStarted]);

  // ── On mount: greet + handle ?q= ─────────────────────────────────────────
  useEffect(() => {
    if (welcomed) return;
    setWelcomed(true);

    const incoming = searchParams.get("q");

    const greetings: Message[] = [
      {
        id: "planner-greet-1",
        role: "assistant",
        content:
          "Welcome to your AI Trip Planner!\nI'm Travel Guide — tell me where you'd like to go, your budget, travel dates, and who's travelling. I'll build a complete itinerary just for you.",
      },
    ];

    if (incoming) {
      greetings.push({
        id: "planner-greet-2",
        role: "assistant",
        content: `I can see you were planning: "${incoming}"\n\nLet me take care of that right away!`,
      });
      setMessages(greetings);
      setChatStarted(true);
      setTimeout(() => autoSend(incoming, greetings), 800);
    } else {
      setMessages(greetings);
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, []);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Auto-send for ?q= ────────────────────────────────────────────────────
  async function autoSend(text: string, priorMessages: Message[]) {
    const withUser: Message[] = [
      ...priorMessages,
      { id: crypto.randomUUID(), role: "user", content: text },
    ];
    setMessages(withUser);
    setLoading(true);
    await streamReply(text, withUser);
  }

  // ── Manual send ──────────────────────────────────────────────────────────
  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Hide navbar on first user message
    if (!chatStarted) setChatStarted(true);

    const withUser: Message[] = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
    ];
    setMessages(withUser);
    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);
    await streamReply(trimmed, withUser);
  }

  // ── Core streaming ────────────────────────────────────────────────────────
  async function streamReply(userText: string, currentMessages: Message[]) {
    const history = currentMessages
      .filter((m) => !m.id.startsWith("planner-greet-"))
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, source: "planner", guestId }),
      });

      if (!res.ok) throw new Error("API error");

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const { text } = JSON.parse(line.slice(6));
              if (text) {
                fullText += text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullText } : m,
                  ),
                );
              }
            } catch {
              /* skip malformed */
            }
          }
        }
      }

      const packageMatches = [...fullText.matchAll(/\[PACKAGE:([^\]]+)\]/g)];
      const clean = fullText.replace(/\[PACKAGE:[^\]]+\]/g, "").trim();

      const navButtons: NavBtn[] = packageMatches.map((m, idx) => ({
        icon: <Map size={14} />,
        label: "View package",
        sub: m[1],
        href: `/packages/${m[1]}`,
        primary: idx === 0,
      }));

      navButtons.push({
        icon: <MessageSquare size={14} />,
        label: "Enquire about this trip",
        sub: "Our team replies within 24 hrs",
        href: `/enquiry?trip=${encodeURIComponent(userText.slice(0, 80))}`,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: clean,
                navButtons: navButtons.length > 1 ? navButtons : undefined,
              }
            : m,
        ),
      );
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, something went wrong. Our team is happy to help plan your trip manually.",
          navButtons: [
            {
              icon: <MessageSquare size={14} />,
              label: "Contact our team",
              sub: "We'll plan it for you",
              href: "/enquiry",
              primary: true,
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    // Outer: full viewport height, offset by navbar when visible
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: chatStarted ? "100vh" : `calc(100vh - ${navbarHeight}px)`,
        transition: "height 0.35s ease",
        background: "#FDF6ED",
        fontFamily: "Georgia, serif",
        position: "fixed",
        top: chatStarted ? 0 : `${navbarHeight}px`,
        left: 0,
        right: 0,
        bottom: 0,
        transitionBehavior: "smooth",
        zIndex: 50,
      }}
    >
      {/* ── Planner header ── */}
      <div
        style={{
          background: "#C8392B",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexShrink: 0,
          boxShadow: "0 2px 12px rgba(28,10,0,0.15)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Compass size={20} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.02em",
            }}
          >
            AI Trip Planner
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "2px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: loading ? "#FBBF24" : "#4ADE80",
                display: "inline-block",
                transition: "background 0.3s",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.8)",
                letterSpacing: "0.05em",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {loading
                ? "Travel Guide is thinking…"
                : "Travel Guide · Always available"}
            </span>
          </div>
        </div>
        {/* Back to site — only when chat started and navbar is hidden */}
        {chatStarted && (
          <a
            href="/"
            onClick={() => setChatStarted(false)}
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "6px 14px",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "4px",
              fontFamily: "DM Sans, sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color =
                "rgba(255,255,255,0.7)";
            }}
          >
            ← Back
          </a>
        )}
      </div>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(200,57,43,0.2) transparent",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            width: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                animation: "tg-msg 0.28s ease both",
                animationDelay: `${Math.min(i, 3) * 0.08}s`,
              }}
            >
              {msg.role === "assistant" && (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#C8392B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginRight: "10px",
                    alignSelf: "flex-start",
                    marginTop: "2px",
                  }}
                >
                  <Compass size={15} color="#fff" />
                </div>
              )}
              <div
                style={{
                  maxWidth: "72%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    padding: "13px 16px",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background: msg.role === "user" ? "#C8392B" : "#fff",
                    border:
                      msg.role === "user"
                        ? "none"
                        : "1px solid rgba(200,57,43,0.14)",
                    boxShadow: "0 2px 12px rgba(28,10,0,0.07)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: 1.7,
                      color: msg.role === "user" ? "#fff" : "#1C0A00",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.content}
                    {loading &&
                      msg.role === "assistant" &&
                      msg === messages[messages.length - 1] &&
                      msg.content && (
                        <span
                          style={{
                            display: "inline-block",
                            width: "2px",
                            height: "14px",
                            background: "#C8392B",
                            marginLeft: "2px",
                            verticalAlign: "text-bottom",
                            animation: "tg-blink 0.8s step-end infinite",
                          }}
                        />
                      )}
                  </p>
                </div>
                {msg.navButtons && msg.navButtons.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {msg.navButtons.map((btn) => (
                      <NavButton key={btn.href + btn.label} btn={btn} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#C8392B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginRight: "10px",
                }}
              >
                <Compass size={15} color="#fff" />
              </div>
              <div
                style={{
                  padding: "13px 16px",
                  borderRadius: "16px 16px 16px 4px",
                  background: "#fff",
                  border: "1px solid rgba(200,57,43,0.14)",
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span
                    key={i}
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#C8392B",
                      opacity: 0.5,
                      animation: `tg-dot 1.2s ${delay}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div
        style={{
          padding: "14px 20px 20px",
          borderTop: "1px solid rgba(200,57,43,0.12)",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-end",
            maxWidth: "760px",
            margin: "0 auto",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 140) + "px";
            }}
            onKeyDown={handleKey}
            placeholder="Describe your dream trip — destination, dates, budget, group size…"
            disabled={loading}
            rows={1}
            style={{
              flex: 1,
              border: "1px solid rgba(200,57,43,0.2)",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "14px",
              fontFamily: "Georgia, serif",
              color: "#1C0A00",
              background: "#FDF6ED",
              outline: "none",
              resize: "none",
              lineHeight: 1.6,
              minHeight: "46px",
              maxHeight: "140px",
              transition: "border-color 0.2s",
              opacity: loading ? 0.6 : 1,
              overflow: "hidden",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(200,57,43,0.5)")
            }
            onBlur={(e) => (e.target.style.borderColor = "rgba(200,57,43,0.2)")}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Send"
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "10px",
              background:
                input.trim() && !loading ? "#C8392B" : "rgba(200,57,43,0.2)",
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            {loading ? (
              <Loader2
                size={18}
                color="#fff"
                style={{ animation: "tg-spin 1s linear infinite" }}
              />
            ) : (
              <Send size={18} color="#fff" />
            )}
          </button>
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: "10px",
            color: "#A8967E",
            margin: "8px 0 0",
            letterSpacing: "0.06em",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Press Enter to send · Shift+Enter for new line · Powered by Travel
          Guide AI
        </p>
      </div>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#FDF6ED",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Compass
              size={36}
              color="#C8392B"
              style={{
                animation: "tg-spin 1.5s linear infinite",
                marginBottom: "12px",
              }}
            />
            <p
              style={{
                fontSize: "13px",
                color: "#7A4A2A",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Loading planner…
            </p>
          </div>
        </div>
      }
    >
      <PlannerInner />
    </Suspense>
  );
}
