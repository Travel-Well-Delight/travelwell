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
  Waves,
  Mountain,
  Globe,
  Users,
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

// ── Starter chips ─────────────────────────────────────────────────────────────

const STARTERS = [
  { icon: <Waves size={13} />, text: "Beach holiday in Goa for 5 nights" },
  { icon: <Mountain size={13} />, text: "Hill stations under ₹25,000 for 2" },
  { icon: <Globe size={13} />, text: "Honeymoon in Kerala or Maldives" },
  { icon: <Users size={13} />, text: "Family trip to Rajasthan in December" },
];

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
        background: btn.primary ? "#C8392B" : "#fff",
        border: `1px solid ${btn.primary ? "#C8392B" : "rgba(200,57,43,0.2)"}`,
        borderRadius: "10px",
        textDecoration: "none",
        transition: "all 0.15s ease",
        marginTop: "4px",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.background = btn.primary ? "#b03224" : "rgba(200,57,43,0.06)";
        el.style.borderColor = "#C8392B";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.background = btn.primary ? "#C8392B" : "#fff";
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
        size={12}
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
  const [navH, setNavH] = useState(80);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Measure navbar ────────────────────────────────────────────────────────
  useEffect(() => {
    const nav = document.querySelector("header") as HTMLElement;
    if (nav) setNavH(nav.offsetHeight);
  }, []);

  // ── Hide navbar + footer when chat starts ─────────────────────────────────
  useEffect(() => {
    const nav = document.querySelector("header") as HTMLElement;
    const footer = document.querySelector("footer") as HTMLElement;
    if (chatStarted) {
      [nav, footer].forEach((el) => {
        if (!el) return;
        el.style.transition = "opacity 0.3s ease";
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        el.style.visibility = "hidden";
      });
    } else {
      [nav, footer].forEach((el) => {
        if (!el) return;
        el.style.transition = "opacity 0.3s ease";
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
        el.style.visibility = "visible";
      });
    }
    return () => {
      [nav, footer].forEach((el) => {
        if (!el) return;
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
        el.style.visibility = "visible";
        el.style.transition = "";
      });
    };
  }, [chatStarted]);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Greet on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    if (welcomed) return;
    setWelcomed(true);
    const incoming = searchParams.get("q");
    const greet: Message = {
      id: "greet-1",
      role: "assistant",
      content:
        "Hi! I'm Travel Guide — your personal trip planner.\n\nTell me where you'd like to go, your budget, who's travelling, and when. I'll find the perfect journey for you.",
    };
    if (incoming) {
      setMessages([
        greet,
        {
          id: "greet-2",
          role: "assistant",
          content: `I can see you were planning: "${incoming}" — let me take care of that right away!`,
        },
      ]);
      setChatStarted(true);
      setTimeout(() => autoSend(incoming, [greet]), 800);
    } else {
      setMessages([greet]);
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, []);

  async function autoSend(text: string, prior: Message[]) {
    const withUser = [
      ...prior,
      { id: crypto.randomUUID(), role: "user" as const, content: text },
    ];
    setMessages(withUser);
    setLoading(true);
    await streamReply(text, withUser);
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    if (!chatStarted) setChatStarted(true);
    const withUser = [
      ...messages,
      { id: crypto.randomUUID(), role: "user" as const, content: trimmed },
    ];
    setMessages(withUser);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);
    await streamReply(trimmed, withUser);
  }

  async function streamReply(userText: string, current: Message[]) {
    const history = current
      .filter((m) => !m.id.startsWith("greet-"))
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, source: "planner", guestId }),
      });
      if (!res.ok) throw new Error();
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder
            .decode(value, { stream: true })
            .split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const { text } = JSON.parse(line.slice(6));
              if (text) {
                full += text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: full } : m,
                  ),
                );
              }
            } catch {
              /* skip */
            }
          }
        }
      }
      const pkgs = [...full.matchAll(/\[PACKAGE:([^\]]+)\]/g)];
      const clean = full.replace(/\[PACKAGE:[^\]]+\]/g, "").trim();
      const navButtons: NavBtn[] = [
        ...pkgs.map((m, i) => ({
          icon: <Map size={13} />,
          label: "View package",
          sub: m[1],
          href: `/packages/${m[1]}`,
          primary: i === 0,
        })),
        {
          icon: <MessageSquare size={13} />,
          label: "Enquire about this trip",
          sub: "Our team replies within 24 hrs",
          href: `/enquiry?trip=${encodeURIComponent(userText.slice(0, 80))}`,
        },
      ];
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
            "Sorry, something went wrong. Our team is happy to help plan your trip.",
          navButtons: [
            {
              icon: <MessageSquare size={13} />,
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

  function useStarter(text: string) {
    setInput(text);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  return (
    <div
      style={{
        position: chatStarted ? "fixed" : "relative",
        top: chatStarted ? 0 : "auto",
        left: chatStarted ? 0 : "auto",
        right: chatStarted ? 0 : "auto",
        bottom: chatStarted ? 0 : "auto",
        zIndex: chatStarted ? 50 : "auto",
        marginTop: chatStarted ? 0 : navH,
        height: chatStarted ? "100vh" : `calc(100vh - ${navH}px)`,
        display: "flex",
        flexDirection: "column",
        background: "#FDF6ED",
        fontFamily: "Georgia, serif",
        overflow: "hidden",
      }}
    >
      {/* ── Slim top bar — only when chat is fullscreen ── */}
      {chatStarted && (
        <div
          style={{
            flexShrink: 0,
            background: "#C8392B",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Compass size={13} color="#fff" />
          </div>
          <span
            style={{
              flex: 1,
              fontSize: "13px",
              fontWeight: 700,
              color: "#fff",
              fontFamily: "Georgia, serif",
            }}
          >
            AI Trip Planner
            <span
              style={{
                fontWeight: 400,
                fontSize: "11px",
                color: "rgba(255,255,255,0.7)",
                marginLeft: "10px",
              }}
            >
              {loading ? "Thinking…" : "Travel Guide · Always available"}
            </span>
            <span
              style={{
                display: "inline-block",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: loading ? "#FBBF24" : "#4ADE80",
                marginLeft: "6px",
                verticalAlign: "middle",
                transition: "background 0.3s",
              }}
            />
          </span>
          <a
            href="/"
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.65)",
              textDecoration: "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 12px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "3px",
              fontFamily: "DM Sans, sans-serif",
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
                "rgba(255,255,255,0.65)";
            }}
          >
            ← Back
          </a>
        </div>
      )}

      {/* ── Scroll area ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(200,57,43,0.15) transparent",
        }}
      >
        {/* Inner wrapper — min-height forces content to bottom */}
        <div
          style={{
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "32px 20px 16px",
            maxWidth: "720px",
            margin: "0 auto",
            gap: "16px",
          }}
        >
          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                animation: "tg-msg 0.25s ease both",
                animationDelay: `${Math.min(i, 2) * 0.06}s`,
              }}
            >
              {msg.role === "assistant" && (
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "#C8392B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginRight: "10px",
                    alignSelf: "flex-end",
                    marginBottom: "2px",
                  }}
                >
                  <Compass size={14} color="#fff" />
                </div>
              )}
              <div
                style={{
                  maxWidth: "74%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background: msg.role === "user" ? "#C8392B" : "#fff",
                    border:
                      msg.role === "user"
                        ? "none"
                        : "1px solid rgba(200,57,43,0.12)",
                    boxShadow: "0 1px 8px rgba(28,10,0,0.06)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: 1.7,
                      color: msg.role === "user" ? "#fff" : "#1C0A00",
                      whiteSpace: "pre-line",
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {msg.content}
                    {loading &&
                      msg.role === "assistant" &&
                      i === messages.length - 1 &&
                      msg.content && (
                        <span
                          style={{
                            display: "inline-block",
                            width: "2px",
                            height: "13px",
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
                      gap: "5px",
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

          {/* Typing dots */}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div
              style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#C8392B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Compass size={14} color="#fff" />
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "18px 18px 18px 4px",
                  background: "#fff",
                  border: "1px solid rgba(200,57,43,0.12)",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                {[0, 0.18, 0.36].map((d, i) => (
                  <span
                    key={i}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#C8392B",
                      opacity: 0.5,
                      animation: `tg-dot 1.2s ${d}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Starter chips — shown before user types ── */}
      {!chatStarted &&
        messages.filter((m) => m.role === "user").length === 0 && (
          <div
            style={{
              flexShrink: 0,
              padding: "0 20px 16px",
              maxWidth: "720px",
              width: "100%",
              margin: "0 auto",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {STARTERS.map((s, i) => (
              <button
                key={i}
                onClick={() => useStarter(s.text)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 13px",
                  background: "#fff",
                  border: "1px solid rgba(200,57,43,0.2)",
                  borderRadius: "20px",
                  fontSize: "12px",
                  color: "#C8392B",
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(200,57,43,0.07)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(200,57,43,0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#fff";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(200,57,43,0.2)";
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  {s.icon}
                </span>
                {s.text}
              </button>
            ))}
          </div>
        )}

      {/* ── Input bar ── */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid rgba(200,57,43,0.1)",
          background: "#fff",
          padding: "14px 20px 18px",
        }}
      >
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            display: "flex",
            gap: "10px",
            alignItems: "flex-end",
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
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              fontFamily: "Georgia, serif",
              color: "#1C0A00",
              background: "#FDF6ED",
              outline: "none",
              resize: "none",
              lineHeight: 1.6,
              minHeight: "48px",
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
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              flexShrink: 0,
              background:
                input.trim() && !loading ? "#C8392B" : "rgba(200,57,43,0.18)",
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              size={32}
              color="#C8392B"
              style={{
                animation: "tg-spin 1.5s linear infinite",
                marginBottom: "10px",
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
