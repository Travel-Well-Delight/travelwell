"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  Search,
  MessageSquare,
  ArrowRight,
  Loader2,
  IndianRupee,
} from "lucide-react";
import { useGuestId } from "@/hooks/useGuestId";
import BudgetEstimatorWidget from "@/components/planner/BudgetEstimatorWidget";

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

// ── Suggestion chips ──────────────────────────────────────────────────────────

const CHIPS: { icon: React.ReactNode; label: string; value: string }[] = [
  { icon: <Waves size={12} />, label: "Beach holiday", value: "Beach holiday" },
  {
    icon: <Mountain size={12} />,
    label: "Hill station",
    value: "Hill station",
  },
  {
    icon: <IndianRupee size={12} />,
    label: "Estimate budget",
    value: "__OPEN_BUDGET_WIDGET__",
  },
  { icon: <Users size={12} />, label: "Family tour", value: "Family tour" },
];

// ── Teaser lines ──────────────────────────────────────────────────────────────

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

// ── Nav buttons ───────────────────────────────────────────────────────────────

interface NavBtn {
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
  primary?: boolean;
}

const ALL_NAV_BTNS: NavBtn[] = [
  {
    icon: <Map size={14} />,
    label: "Browse Packages",
    sub: "23 curated trips",
    href: "/packages",
    primary: true,
  },
  {
    icon: <Search size={14} />,
    label: "Search & Filter",
    sub: "By dates, budget & type",
    href: "/?search=1",
  },
  {
    icon: <Compass size={14} />,
    label: "AI Trip Planner",
    sub: "Full itinerary builder",
    href: "/planner",
  },
  {
    icon: <MessageSquare size={14} />,
    label: "Make an Enquiry",
    sub: "Reply within 24 hrs",
    href: "/enquiry",
  },
  {
    icon: <Globe size={14} />,
    label: "Our Story",
    sub: "About TravelWell",
    href: "/about",
  },
];

function getNavButtons(text: string): NavBtn[] {
  if (/beach|goa|bali|maldiv|sea|coastal|ocean|island/i.test(text))
    return [ALL_NAV_BTNS[0], ALL_NAV_BTNS[1], ALL_NAV_BTNS[3]];
  if (
    /hill|mountain|manali|kashmir|shimla|mussoorie|ooty|munnar|trek/i.test(text)
  )
    return [ALL_NAV_BTNS[0], ALL_NAV_BTNS[1], ALL_NAV_BTNS[3]];
  if (/international|abroad|europe|dubai|thailand|singapore|maldiv/i.test(text))
    return [ALL_NAV_BTNS[0], ALL_NAV_BTNS[2], ALL_NAV_BTNS[3]];
  if (/family|kids|child|parents|couple|honeymoon/i.test(text))
    return [ALL_NAV_BTNS[0], ALL_NAV_BTNS[1], ALL_NAV_BTNS[3]];
  if (/budget|cheap|afford|price|cost|₹|rupee/i.test(text))
    return [ALL_NAV_BTNS[1], ALL_NAV_BTNS[0], ALL_NAV_BTNS[3]];
  if (/plan|planner|ai|custom|itinerary/i.test(text))
    return [ALL_NAV_BTNS[2], ALL_NAV_BTNS[0], ALL_NAV_BTNS[3]];
  if (/enquir|contact|call|talk|speak/i.test(text))
    return [ALL_NAV_BTNS[3], ALL_NAV_BTNS[0]];
  return [ALL_NAV_BTNS[0], ALL_NAV_BTNS[3], ALL_NAV_BTNS[2]];
}

// ── Detect prompts too complex for the bubble ─────────────────────────────────

function isComplexPrompt(text: string): boolean {
  const wordCount = text.trim().split(/\s+/).length;
  const complexKeywords =
    /itinerary|day.by.day|full.plan|plan.my.trip|build.a.trip|detailed|schedule|day \d|night|nights|budget.for|how.many.days|what.should.i|suggest.a.complete|plan.a.complete|entire.trip|whole.trip|week.in|days.in/i;
  return wordCount >= 15 || complexKeywords.test(text);
}

// ── Detect budget-related language for auto-trigger ───────────────────────────

function isBudgetQuery(text: string): boolean {
  return /budget|how much|price range|afford|under ₹|cost of|estimate.*(cost|price|budget)|what.*budget/i.test(
    text,
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  navButtons?: NavBtn[];
  widget?: "budgetEstimator";
}

// ── NavButton component ───────────────────────────────────────────────────────

function NavButton({ btn }: { btn: NavBtn }) {
  return (
    <a
      href={btn.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        background: btn.primary ? "#C8392B" : "#FDF6ED",
        border: `1px solid ${btn.primary ? "#C8392B" : "rgba(200,57,43,0.2)"}`,
        borderRadius: "8px",
        textDecoration: "none",
        transition: "all 0.15s ease",
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
            fontSize: "12px",
            fontWeight: 600,
            color: btn.primary ? "#fff" : "#1C0A00",
            fontFamily: "DM Sans, sans-serif",
            lineHeight: 1.2,
          }}
        >
          {btn.label}
        </div>
        <div
          style={{
            fontSize: "10px",
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

// ── Main component ────────────────────────────────────────────────────────────

export default function TravelGuideButton() {
  const pathname = usePathname();
  const router = useRouter();
  const guestId = useGuestId();

  const [open, setOpen] = useState(false);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const [teaserVisible, setTeaserVisible] = useState(true);
  const [promptIndex] = useState(() =>
    Math.floor(Math.random() * WELCOME_PROMPTS.length),
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hidden =
    (pathname?.startsWith("/packages/") && pathname !== "/packages") ||
    pathname === "/planner" ||
    pathname?.startsWith("/planner/");

  // Auto-open once per session
  useEffect(() => {
    const alreadyOpened = sessionStorage.getItem("tg_auto_opened") === "true";
    if (alreadyOpened) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem("tg_auto_opened", "true");
      setMessages([
        {
          id: "greet-1",
          role: "assistant",
          content: "Hi there! I'm your TravelWell Guide.",
        },
        {
          id: "greet-2",
          role: "assistant",
          content:
            WELCOME_PROMPTS[Math.floor(Math.random() * WELCOME_PROMPTS.length)]
              .text,
        },
      ]);
      setOpen(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Cycle teaser every 3s
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

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
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
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  // ── Open the Budget Estimator widget inline in chat ─────────────────────────
  function openBudgetWidget() {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sure! Let's find trips that fit your budget:",
        widget: "budgetEstimator",
      },
    ]);
  }

  // ── Navigate to packages page filtered by matched package ids ───────────────
  function handleViewAllMatches(ids: string[]) {
    if (ids.length === 0) {
      router.push("/packages");
      return;
    }
    router.push(`/packages?ids=${ids.join(",")}`);
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // ── Manual trigger chip for budget widget ──────────────────────────────────
    if (trimmed === "__OPEN_BUDGET_WIDGET__") {
      setInput("");
      openBudgetWidget();
      return;
    }

    // ── Redirect complex prompts to the planner page ──────────────────────────
    if (isComplexPrompt(trimmed)) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: trimmed },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "That sounds like a full trip plan! I'm just a quick guide — our AI Trip Planner is built exactly for this. Let me take you there with your request ready to go.",
          navButtons: [
            {
              icon: <Compass size={14} />,
              label: "Open AI Trip Planner",
              sub: "Your message will be waiting",
              href: `/planner?q=${encodeURIComponent(trimmed)}`,
              primary: true,
            },
          ],
        },
      ]);
      setInput("");
      return;
    }

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
    ]);
    setInput("");

    // ── Auto-trigger budget widget on budget-related language ──────────────────
    if (isBudgetQuery(trimmed)) {
      setTimeout(() => openBudgetWidget(), 300);
      return;
    }

    setLoading(true);

    // Build history exclude greeting messages, keep last 6 turns
    const history = messages
      .filter((m) => !m.id.startsWith("greet-"))
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: trimmed }],
          source: "bubble",
          guestId,
        }),
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
              /* skip malformed chunks */
            }
          }
        }
      }

      const clean = fullText.replace(/\[PACKAGE:[^\]]+\]/g, "").trim();
      const navButtons = getNavButtons(trimmed);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: clean, navButtons } : m,
        ),
      );
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again or visit our enquiry page.",
          navButtons: [ALL_NAV_BTNS[3]],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  if (hidden) return null;

  return (
    <>
      {/* ── Chat panel ────────────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            zIndex: 9998,
            width: "340px",
            height: "500px",
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
                    background: loading ? "#FBBF24" : "#4ADE80",
                    display: "inline-block",
                    transition: "background 0.3s",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.8)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {loading ? "Thinking…" : "AI · Always available"}
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
                      alignSelf: "flex-start",
                      marginTop: "2px",
                    }}
                  >
                    <Compass size={12} color="#fff" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: msg.widget ? "94%" : "82%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
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
                      {loading &&
                        msg.role === "assistant" &&
                        msg === messages[messages.length - 1] &&
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

                  {/* Budget Estimator widget */}
                  {msg.widget === "budgetEstimator" && (
                    <BudgetEstimatorWidget {...({ onViewAll: handleViewAllMatches } as any)} />
                  )}

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
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "#C8392B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginRight: "7px",
                  }}
                >
                  <Compass size={12} color="#fff" />
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px 14px 14px 4px",
                    background: "#fff",
                    border: "1px solid rgba(200,57,43,0.14)",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span
                      key={i}
                      style={{
                        width: "6px",
                        height: "6px",
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

          {/* Suggestion chips — before user types */}
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
                    if (chip.value === "__OPEN_BUDGET_WIDGET__") {
                      openBudgetWidget();
                      return;
                    }
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
              disabled={loading}
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
                opacity: loading ? 0.6 : 1,
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
              disabled={!input.trim() || loading}
              aria-label="Send"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
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
                  size={14}
                  color="#fff"
                  style={{ animation: "tg-spin 1s linear infinite" }}
                />
              ) : (
                <Send size={14} color="#fff" />
              )}
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
            TravelWell Delight · Powered by Travel Guide AI
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

      {/* ── FAB ───────────────────────────────────────────────────────────── */}
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
