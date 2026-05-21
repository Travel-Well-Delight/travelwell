"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  X,
  Compass,
  ChevronDown,
  Send,
  Waves,
  Mountain,
  Globe,
  Users,
  Plane,
  Map,
  Sunset,
} from "lucide-react";

// ── Rotating welcome prompts ──────────────────────────────────────────────────

const WELCOME_PROMPTS: { icon: React.ReactNode; text: string }[] = [
  {
    icon: <Globe size={14} />,
    text: "Where would you like to go this vacation season?",
  },
  {
    icon: <Plane size={14} />,
    text: "Got a destination in mind? I can help plan your perfect trip.",
  },
  {
    icon: <Waves size={14} />,
    text: "Thinking about a getaway? Tell me your dream destination.",
  },
  {
    icon: <Map size={14} />,
    text: "Planning a holiday? I'll find the right package for you.",
  },
  {
    icon: <Sunset size={14} />,
    text: "Beach, hills, or culture? Let's find your next adventure.",
  },
];

const CHIPS: { icon: React.ReactNode; label: string; value: string }[] = [
  { icon: <Waves size={12} />, label: "Beach holiday", value: "Beach holiday" },
  {
    icon: <Mountain size={12} />,
    label: "Hill station",
    value: "Hill station",
  },
  {
    icon: <Globe size={12} />,
    label: "International",
    value: "International trip",
  },
  { icon: <Users size={12} />, label: "Family tour", value: "Family tour" },
];

// ── Rotating speech-bubble teaser lines ──────────────────────────────────────

interface TeaserLine {
  icon: React.ReactNode;
  text: string;
  href: string;
}

const TEASER_LINES: TeaserLine[] = [
  {
    icon: <Map size={13} />,
    text: "Browse 23 handcrafted packages",
    href: "/packages",
  },
  {
    icon: <Globe size={13} />,
    text: "Beach · Hills · International",
    href: "/packages",
  },
  {
    icon: <Compass size={13} />,
    text: "Try our AI Trip Planner",
    href: "/planner",
  },
  {
    icon: <Plane size={13} />,
    text: "Custom itineraries, zero fees",
    href: "/about",
  },
  {
    icon: <Users size={13} />,
    text: "150+ happy travellers & counting",
    href: "/about",
  },
  {
    icon: <Mountain size={13} />,
    text: "Hill stations from ₹12,000",
    href: "/packages",
  },
  {
    icon: <Waves size={13} />,
    text: "Beach escapes from ₹18,000",
    href: "/packages",
  },
  {
    icon: <Sunset size={13} />,
    text: "Plan your trip — reply in 24hrs",
    href: "/enquiry",
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function TravelGuideButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const [teaserVisible, setTeaserVisible] = useState(true);
  const [promptIndex] = useState(() =>
    Math.floor(Math.random() * WELCOME_PROMPTS.length),
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hidden = pathname?.startsWith("/packages/") && pathname !== "/packages";

  // 30-second nudge timer
  useEffect(() => {
    const dismissed = sessionStorage.getItem("tg_nudge_dismissed") === "true";
    if (dismissed) {
      setNudgeDismissed(true);
      return;
    }
    const timer = setTimeout(() => {
      if (!open) setNudgeVisible(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  // Cycle teaser text every 3s with fade
  useEffect(() => {
    if (open) return;
    const interval = setInterval(() => {
      setTeaserVisible(false);
      setTimeout(() => {
        setTeaserIndex((i) => (i + 1) % TEASER_LINES.length);
        setTeaserVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  function handleOpen() {
    if (messages.length === 0) {
      setMessages([
        {
          id: "greet-1",
          role: "assistant",
          content: "Hi there! I'm your TravelWell Guide.",
        },
        {
          id: "greet-2",
          role: "assistant",
          content: WELCOME_PROMPTS[promptIndex].text,
        },
      ]);
    }
    setNudgeVisible(false);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function dismissNudge() {
    setNudgeVisible(false);
    setNudgeDismissed(true);
    sessionStorage.setItem("tg_nudge_dismissed", "true");
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Thanks for sharing! Our AI planner is coming soon and will help you find the perfect trip. Until then, feel free to browse our packages or reach out via the enquiry page.",
      },
    ]);
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  if (hidden) return null;

  const prompt = WELCOME_PROMPTS[promptIndex];

  return (
    <>
      {/* ── Nudge popup ───────────────────────────────────────────────────── */}
      {nudgeVisible && !nudgeDismissed && !open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            zIndex: 9997,
            width: "248px",
            background: "#fff",
            border: "1px solid rgba(200,57,43,0.18)",
            borderRadius: "14px",
            padding: "16px 16px 14px",
            boxShadow: "0 10px 36px rgba(28,10,0,0.13)",
            animation: "tg-rise 0.4s cubic-bezier(.22,.68,0,1.2) both",
          }}
        >
          <button
            onClick={dismissNudge}
            aria-label="Dismiss"
            style={{
              position: "absolute",
              top: "8px",
              right: "10px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#A8967E",
              padding: "2px",
              lineHeight: 1,
            }}
          >
            <X size={13} />
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#C8392B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Compass size={16} color="#fff" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#1C0A00",
                  fontFamily: "Georgia, serif",
                }}
              >
                Travel Guide
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#7A4A2A",
                  letterSpacing: "0.04em",
                }}
              >
                TravelWell Delight
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginBottom: "12px",
              paddingRight: "10px",
            }}
          >
            <span style={{ color: "#C8392B", flexShrink: 0, marginTop: "2px" }}>
              {prompt.icon}
            </span>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#1C0A00",
                fontFamily: "Georgia, serif",
                lineHeight: 1.5,
              }}
            >
              {prompt.text}
            </p>
          </div>
          <button
            onClick={() => {
              dismissNudge();
              handleOpen();
            }}
            style={{
              width: "100%",
              background: "#C8392B",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "9px 0",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Let's Plan
          </button>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "-8px",
              right: "26px",
              width: "16px",
              height: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#fff",
                border: "1px solid rgba(200,57,43,0.18)",
                transform: "rotate(45deg)",
                position: "absolute",
                top: "-7px",
                left: "2px",
                boxShadow: "2px 2px 4px rgba(28,10,0,0.06)",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Chat panel ────────────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            zIndex: 9998,
            width: "340px",
            height: "480px",
            display: "flex",
            flexDirection: "column",
            background: "#FDF6ED",
            border: "1.5px solid rgba(200,57,43,0.2)",
            borderRadius: "16px",
            boxShadow: "0 20px 56px rgba(28,10,0,0.16)",
            overflow: "hidden",
            animation: "tg-rise 0.35s cubic-bezier(.22,.68,0,1.2) both",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#C8392B",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Compass size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "Georgia, serif",
                  letterSpacing: "0.02em",
                }}
              >
                Travel Guide
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "1px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#4ADE80",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.8)",
                    letterSpacing: "0.05em",
                  }}
                >
                  AI · Always available
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Minimise chat"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                padding: "5px",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px 10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              scrollbarWidth: "none",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  animation: "tg-msg 0.28s ease both",
                  animationDelay: `${i * 0.07}s`,
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: "#C8392B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginRight: "7px",
                      alignSelf: "flex-end",
                    }}
                  >
                    <Compass size={12} color="#fff" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "10px 13px",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    background: msg.role === "user" ? "#C8392B" : "#fff",
                    border:
                      msg.role === "user"
                        ? "none"
                        : "1px solid rgba(200,57,43,0.14)",
                    boxShadow: "0 2px 8px rgba(28,10,0,0.06)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      lineHeight: 1.6,
                      color: msg.role === "user" ? "#fff" : "#1C0A00",
                      fontFamily: "Georgia, serif",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips */}
          {messages.filter((m) => m.role === "user").length === 0 && (
            <div
              style={{
                padding: "0 14px 10px",
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                flexShrink: 0,
              }}
            >
              {CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setInput(chip.value);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(200,57,43,0.25)",
                    borderRadius: "20px",
                    padding: "5px 11px",
                    fontSize: "11px",
                    color: "#C8392B",
                    fontFamily: "DM Sans, sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "background 0.15s, border-color 0.15s",
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
                      "rgba(200,57,43,0.25)";
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>
                    {chip.icon}
                  </span>
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "1px solid rgba(200,57,43,0.1)",
              background: "#fff",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a destination or ask anything…"
              style={{
                flex: 1,
                border: "1px solid rgba(200,57,43,0.18)",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "13px",
                fontFamily: "Georgia, serif",
                color: "#1C0A00",
                background: "#FDF6ED",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(200,57,43,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(200,57,43,0.18)")
              }
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: input.trim() ? "#C8392B" : "rgba(200,57,43,0.2)",
                border: "none",
                cursor: input.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <Send size={14} color="#fff" />
            </button>
          </div>

          {/* Footer */}
          <div
            style={{
              background: "#FDF6ED",
              padding: "5px 0 8px",
              textAlign: "center",
              fontSize: "10px",
              color: "#A8967E",
              letterSpacing: "0.07em",
              fontFamily: "DM Sans, sans-serif",
              flexShrink: 0,
              borderTop: "1px solid rgba(200,57,43,0.07)",
            }}
          >
            TravelWell Delight · AI coming soon
          </div>
        </div>
      )}

      {/* ── Speech bubble above FAB ───────────────────────────────────────── */}
      {!open && (
        <a
          href={TEASER_LINES[teaserIndex].href}
          style={{
            position: "fixed",
            bottom: "92px",
            right: "16px",
            zIndex: 9998,
            background: "#1C0A00",
            color: "#FDF6ED",
            borderRadius: "10px 10px 10px 2px",
            padding: "7px 12px 7px 10px",
            fontSize: "11px",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(28,10,0,0.18)",
            opacity: teaserVisible ? 1 : 0,
            transform: teaserVisible ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            userSelect: "none",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{ opacity: 0.75, display: "flex", alignItems: "center" }}
          >
            {TEASER_LINES[teaserIndex].icon}
          </span>
          {TEASER_LINES[teaserIndex].text}
          {/* Tail pointing down-right toward FAB */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "-6px",
              right: "22px",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "0px solid transparent",
              borderTop: "6px solid #1C0A00",
            }}
          />
        </a>
      )}

      {/* ── FAB button ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          width: "56px",
          height: "56px",
        }}
      >
        {/* "Chat with us" badge — pinned to top-left corner of FAB */}
        {!open && (
          <div
            style={{
              position: "absolute",
              top: "-10px",
              left: "-38px",
              background: "#E8621A",
              color: "#fff",
              fontSize: "9px",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(232,98,26,0.4)",
              animation: "tg-badge-bob 2s ease-in-out infinite",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            Chat with us
          </div>
        )}

        <button
          onClick={open ? handleClose : handleOpen}
          aria-label="Open Travel Guide"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: open ? "#1C0A00" : "#C8392B",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 22px rgba(200,57,43,0.4)",
            transition: "background 0.25s, transform 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.transform =
              "scale(1.08)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.transform =
              "scale(1)")
          }
        >
          {open ? (
            <X size={20} color="#fff" />
          ) : (
            <Compass size={22} color="#fff" />
          )}
        </button>
      </div>

      {/* Pulse ring */}
      {!open && (
        <span
          aria-hidden="true"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9998,
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "2px solid rgba(200,57,43,0.4)",
            pointerEvents: "none",
            animation: "tg-pulse 2.6s ease-out infinite",
          }}
        />
      )}
    </>
  );
}
