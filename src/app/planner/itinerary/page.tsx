"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Clock,
  Sun,
  Sunset,
  Coffee,
  ArrowLeft,
  Calendar,
  Users,
  Loader2,
} from "lucide-react";
import type { Package } from "@/types/package";
import { packages as ALL_PACKAGES } from "@/data/packages";
import PlannerPackageCard from "@/components/planner/PlannerPackageCard";
import { useGuestId } from "@/hooks/useGuestId";

// ── Parsed day from AI stream ─────────────────────────────────────────────────

interface AIDay {
  day: number;
  title: string;
  description: string;
  highlights: string[];
}

// ── Parse AI-generated itinerary text into structured days ───────────────────
// AI is prompted to use:  "## Day 1: Title\n...\n- highlight"

function parseAIItinerary(text: string): AIDay[] {
  const days: AIDay[] = [];
  // Split on Day headers
  const sections = text.split(/\n(?=##?\s*Day\s*\d)/i).filter(Boolean);
  for (const section of sections) {
    const headerMatch = section.match(/##?\s*Day\s*(\d+)[:\s–-]+(.+)/i);
    if (!headerMatch) continue;
    const dayNum = parseInt(headerMatch[1]);
    const title = headerMatch[2].trim();
    const rest = section.replace(/##?\s*Day\s*\d+[:\s–-]+.+/, "").trim();
    // First paragraph = description
    const lines = rest
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const descLines: string[] = [];
    const highlights: string[] = [];
    for (const line of lines) {
      if (/^[-•*]/.test(line)) {
        highlights.push(line.replace(/^[-•*]\s*/, ""));
      } else {
        descLines.push(line);
      }
    }
    days.push({
      day: dayNum,
      title,
      description: descLines.join(" "),
      highlights,
    });
  }
  return days;
}

// ── Time-of-day icon ──────────────────────────────────────────────────────────

function TimeIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  if (l.includes("morning")) return <Coffee size={13} color="#C8392B" />;
  if (l.includes("afternoon")) return <Sun size={13} color="#E8621A" />;
  if (l.includes("evening") || l.includes("night"))
    return <Sunset size={13} color="#7A4A2A" />;
  return <Clock size={13} color="#A8967E" />;
}

// ── Single day card ───────────────────────────────────────────────────────────

function DayCard({
  day,
  index,
  isLast,
}: {
  day: AIDay | Package["itinerary"][0];
  index: number;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        animation: "tg-msg 0.35s ease both",
        animationDelay: `${index * 0.05}s`,
      }}
    >
      {/* Timeline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: index === 0 ? "#C8392B" : "#FDF6ED",
            border: `2px solid ${index === 0 ? "#C8392B" : "rgba(200,57,43,0.25)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: index === 0 ? "#fff" : "#C8392B",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {day.day}
          </span>
        </div>
        {!isLast && (
          <div
            style={{
              flex: 1,
              width: "1px",
              background: "rgba(200,57,43,0.15)",
              margin: "4px 0",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? "0" : "28px" }}>
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#C8392B",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Day {day.day}
        </span>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#1C0A00",
            margin: "3px 0 6px",
            fontFamily: "Georgia, serif",
            lineHeight: 1.3,
          }}
        >
          {day.title}
        </h3>
        {day.description && (
          <p
            style={{
              fontSize: "13px",
              color: "#6B5B45",
              lineHeight: 1.7,
              margin: "0 0 10px",
            }}
          >
            {day.description}
          </p>
        )}
        {day.highlights && day.highlights.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {day.highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span style={{ flexShrink: 0, marginTop: "2px" }}>
                  <TimeIcon label={h} />
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#1C0A00",
                    lineHeight: 1.5,
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {h}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Streaming itinerary generator ─────────────────────────────────────────────

function StreamingItinerary({
  pkg,
  context,
}: {
  pkg: Package;
  context: string;
}) {
  const guestId = useGuestId();
  const [rawText, setRawText] = useState("");
  const [days, setDays] = useState<AIDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    generate();
  }, []);

  // Re-parse days whenever rawText grows
  useEffect(() => {
    if (rawText) setDays(parseAIItinerary(rawText));
  }, [rawText]);

  async function generate() {
    const prompt = `Generate a detailed day-by-day itinerary for the "${pkg.title}" package (${pkg.destination}, ${pkg.duration.nights} nights / ${pkg.duration.days} days).

${context ? `Additional context from the traveller: ${context}` : ""}

Format each day EXACTLY like this:
## Day 1: Arrival & First Impressions
Brief 1-2 sentence description of the day.
- Morning: activity or experience
- Afternoon: activity or experience  
- Evening: activity or experience

Include specific hotel names, restaurant recommendations, and transport details where relevant.
Cover all ${pkg.duration.days} days. Be detailed and specific.`;

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          source: "planner",
          guestId,
        }),
      });
      if (!res.ok) throw new Error();
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
                setRawText(full);
              }
            } catch {
              /* skip */
            }
          }
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          background: "#fff",
          border: "1px solid rgba(200,57,43,0.15)",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "13px", color: "#7A4A2A", margin: "0 0 12px" }}>
          Couldn't generate the itinerary right now.
        </p>
        <Link
          href="/enquiry"
          style={{
            fontSize: "12px",
            color: "#C8392B",
            textDecoration: "none",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
          }}
        >
          Contact our team →
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            fontSize: "9px",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#C8392B",
            margin: "0 0 6px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Day by Day
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#1C0A00",
              margin: 0,
              fontFamily: "Georgia, serif",
            }}
          >
            Your Journey
          </h2>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Loader2
                size={14}
                color="#C8392B"
                style={{ animation: "tg-spin 1s linear infinite" }}
              />
              <span
                style={{
                  fontSize: "11px",
                  color: "#A8967E",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Travel Guide is writing your itinerary…
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Render days as they stream in */}
      {days.length > 0 && (
        <div>
          {days.map((day, i) => (
            <DayCard
              key={day.day}
              day={day}
              index={i}
              isLast={!loading && i === days.length - 1}
            />
          ))}
        </div>
      )}

      {/* Loading skeleton while first day hasn't parsed yet */}
      {loading && days.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: "20px", opacity: 1 - i * 0.25 }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(200,57,43,0.08)",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: "8px",
                    background: "rgba(200,57,43,0.08)",
                    borderRadius: "4px",
                    width: "60px",
                    marginBottom: "10px",
                  }}
                />
                <div
                  style={{
                    height: "16px",
                    background: "rgba(200,57,43,0.1)",
                    borderRadius: "4px",
                    width: "200px",
                    marginBottom: "8px",
                  }}
                />
                <div
                  style={{
                    height: "12px",
                    background: "rgba(200,57,43,0.06)",
                    borderRadius: "4px",
                    width: "100%",
                    marginBottom: "6px",
                  }}
                />
                <div
                  style={{
                    height: "12px",
                    background: "rgba(200,57,43,0.06)",
                    borderRadius: "4px",
                    width: "80%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blinking cursor while streaming */}
      {loading && days.length > 0 && (
        <div style={{ padding: "8px 0 0 56px" }}>
          <span
            style={{
              display: "inline-block",
              width: "2px",
              height: "14px",
              background: "#C8392B",
              animation: "tg-blink 0.8s step-end infinite",
              verticalAlign: "middle",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Custom plan generator — when no package matched ───────────────────────────

function CustomPlanGenerator({ context }: { context: string }) {
  const guestId = useGuestId();
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    generate();
  }, []);

  async function generate() {
    const prompt = context
      ? `The traveller asked: "${context}"

Since we don't have an exact matching package, create a complete custom travel plan for them. Include:
1. A suggested itinerary title and destination
2. Estimated duration
3. Day-by-day plan using this format:

## Day 1: Title
Description.
- Morning: activity
- Afternoon: activity
- Evening: activity

Also include honest pricing guidance (land costs + flight estimate from major Indian cities), and recommend the closest matching TravelWell package if any exists. Be detailed and specific.`
      : `Create a sample custom 5-day travel plan for a couple interested in a beach holiday in India under ₹60,000 for two. Use this format for each day:

## Day 1: Title
Description.
- Morning: activity
- Afternoon: activity
- Evening: activity`;

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          source: "planner",
          guestId,
        }),
      });
      if (!res.ok) throw new Error();
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
                setRawText(full);
              }
            } catch {
              /* skip */
            }
          }
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <p style={{ fontSize: "13px", color: "#7A4A2A", marginBottom: "16px" }}>
          Couldn't generate a plan right now.
        </p>
        <Link
          href="/enquiry"
          style={{
            fontSize: "12px",
            color: "#C8392B",
            textDecoration: "none",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
          }}
        >
          Contact our team →
        </Link>
      </div>
    );
  }

  const days = parseAIItinerary(rawText);

  return (
    <div>
      {/* Custom plan header */}
      <div
        style={{
          marginBottom: "28px",
          padding: "20px 24px",
          background: "#fff",
          border: "1px solid rgba(200,57,43,0.12)",
          borderRadius: "12px",
        }}
      >
        <p
          style={{
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#C8392B",
            margin: "0 0 6px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Custom AI Plan
        </p>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#1C0A00",
            margin: "0 0 6px",
            fontFamily: "Georgia, serif",
          }}
        >
          {context ? `Your Personalised Trip Plan` : "Sample Custom Trip"}
        </h2>
        {context && (
          <p
            style={{
              fontSize: "12px",
              color: "#7A4A2A",
              margin: 0,
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            Based on: "{context.slice(0, 120)}
            {context.length > 120 ? "…" : ""}"
          </p>
        )}
      </div>

      {/* Days */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#1C0A00",
              margin: 0,
              fontFamily: "Georgia, serif",
            }}
          >
            Day by Day
          </h3>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Loader2
                size={13}
                color="#C8392B"
                style={{ animation: "tg-spin 1s linear infinite" }}
              />
              <span
                style={{
                  fontSize: "11px",
                  color: "#A8967E",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Travel Guide is building your plan…
              </span>
            </div>
          )}
        </div>

        {/* Skeleton */}
        {loading && days.length === 0 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: "20px", opacity: 1 - i * 0.2 }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(200,57,43,0.08)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: "8px",
                      background: "rgba(200,57,43,0.08)",
                      borderRadius: "4px",
                      width: "50px",
                      marginBottom: "10px",
                    }}
                  />
                  <div
                    style={{
                      height: "16px",
                      background: "rgba(200,57,43,0.1)",
                      borderRadius: "4px",
                      width: "220px",
                      marginBottom: "8px",
                    }}
                  />
                  <div
                    style={{
                      height: "12px",
                      background: "rgba(200,57,43,0.06)",
                      borderRadius: "4px",
                      width: "100%",
                      marginBottom: "6px",
                    }}
                  />
                  <div
                    style={{
                      height: "12px",
                      background: "rgba(200,57,43,0.06)",
                      borderRadius: "4px",
                      width: "75%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {days.map((day, i) => (
          <DayCard
            key={day.day}
            day={day}
            index={i}
            isLast={!loading && i === days.length - 1}
          />
        ))}

        {loading && days.length > 0 && (
          <div style={{ padding: "8px 0 0 56px" }}>
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "14px",
                background: "#C8392B",
                animation: "tg-blink 0.8s step-end infinite",
                verticalAlign: "middle",
              }}
            />
          </div>
        )}
      </div>

      {/* CTA */}
      {!loading && (
        <div
          style={{
            padding: "24px",
            background: "#C8392B",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#fff",
              fontFamily: "Georgia, serif",
              margin: "0 0 6px",
            }}
          >
            Want us to make this real?
          </h3>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.8)",
              margin: "0 0 18px",
            }}
          >
            Share this plan with our team — we'll price it, book it, and
            personalise it further.
          </p>
          <Link
            href={`/enquiry?trip=${encodeURIComponent(context.slice(0, 80) || "Custom trip plan")}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#fff",
              color: "#C8392B",
              padding: "11px 28px",
              textDecoration: "none",
              fontSize: "12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 700,
              borderRadius: "4px",
            }}
          >
            <Calendar size={13} /> Enquire Now
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Inner itinerary page ──────────────────────────────────────────────────────

function ItineraryInner() {
  const searchParams = useSearchParams();
  const pkgParam = searchParams.get("pkg");
  const context = searchParams.get("session") ?? "";

  const pkg = pkgParam
    ? ALL_PACKAGES.find((p) => p.slug === pkgParam || p.id === pkgParam)
    : null;

  // Decide whether to use pre-built or AI-generated itinerary
  const hasBuiltIn = pkg && pkg.itinerary && pkg.itinerary.length > 0;

  return (
    <div
      style={{
        background: "#FDF6ED",
        minHeight: "100vh",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Hero */}
      <div
        style={{
          position: "relative",
          height: "280px",
          overflow: "hidden",
          background: "#1C0A00",
        }}
      >
        {pkg?.images.hero && (
          <img
            src={pkg.images.hero}
            alt={pkg.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.55,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(28,10,0,0.9) 0%, rgba(28,10,0,0.3) 60%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "760px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <Compass size={13} color="#C8392B" />
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {hasBuiltIn ? "Curated Itinerary" : "AI Generated Itinerary"}
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(1.6rem,4vw,2.4rem)",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 10px",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {pkg ? pkg.title : "Your Trip Plan"}
          </h1>
          {pkg && (
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { icon: <MapPin size={11} />, text: pkg.destination },
                {
                  icon: <Clock size={11} />,
                  text: `${pkg.duration.nights}N / ${pkg.duration.days}D`,
                },
                {
                  icon: <Users size={11} />,
                  text: `${pkg.groupSize.min}–${pkg.groupSize.max} people`,
                },
              ].map((item, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {item.icon} {item.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* Back */}
        <Link
          href="/planner"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            color: "#C8392B",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "DM Sans, sans-serif",
            marginBottom: "32px",
          }}
        >
          <ArrowLeft size={12} /> Back to Planner
        </Link>

        {/* No package found — AI generates a custom plan */}
        {!pkg && <CustomPlanGenerator context={context} />}

        {pkg && (
          <>
            {/* Package card */}
            <div style={{ marginBottom: "40px" }}>
              <PlannerPackageCard pkg={pkg} compact={false} />
            </div>

            {/* Itinerary — pre-built or AI generated */}
            {hasBuiltIn ? (
              <>
                <div style={{ marginBottom: "28px" }}>
                  <p
                    style={{
                      fontSize: "9px",
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: "#C8392B",
                      margin: "0 0 6px",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Day by Day
                  </p>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#1C0A00",
                      margin: 0,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    Your Journey
                  </h2>
                </div>
                <div>
                  {pkg.itinerary.map((day, i) => (
                    <DayCard
                      key={day.day}
                      day={day}
                      index={i}
                      isLast={i === pkg.itinerary.length - 1}
                    />
                  ))}
                </div>
              </>
            ) : (
              // AI generates it live
              <StreamingItinerary pkg={pkg} context={context} />
            )}

            {/* Highlights */}
            {pkg.highlights.length > 0 && (
              <div
                style={{
                  marginTop: "40px",
                  padding: "24px",
                  background: "#fff",
                  border: "1px solid rgba(200,57,43,0.12)",
                  borderRadius: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#C8392B",
                    margin: "0 0 14px",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Trip Highlights
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  {pkg.highlights.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "#C8392B",
                          flexShrink: 0,
                          marginTop: "7px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#1C0A00",
                          lineHeight: 1.6,
                        }}
                      >
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions / Exclusions */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginTop: "16px",
              }}
            >
              {[
                { title: "Inclusions", items: pkg.inclusions, dot: "#4ADE80" },
                { title: "Exclusions", items: pkg.exclusions, dot: "#EF4444" },
              ].map((section) => (
                <div
                  key={section.title}
                  style={{
                    padding: "20px",
                    background: "#fff",
                    border: "1px solid rgba(200,57,43,0.12)",
                    borderRadius: "12px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "9px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#6B5B45",
                      margin: "0 0 12px",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {section.title}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                    }}
                  >
                    {section.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: section.dot,
                            flexShrink: 0,
                            marginTop: "5px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#1C0A00",
                            lineHeight: 1.5,
                          }}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div
              style={{
                marginTop: "40px",
                padding: "28px",
                background: "#C8392B",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "Georgia, serif",
                  margin: "0 0 6px",
                }}
              >
                Ready to book this trip?
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.8)",
                  margin: "0 0 20px",
                }}
              >
                Our team will confirm availability and final pricing within 24
                hours.
              </p>
              <Link
                href={`/enquiry?trip=${encodeURIComponent(pkg.title)}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#fff",
                  color: "#C8392B",
                  padding: "12px 32px",
                  textDecoration: "none",
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 700,
                  borderRadius: "4px",
                }}
              >
                <Calendar size={14} /> Enquire Now
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function ItineraryPage() {
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
              Loading itinerary…
            </p>
          </div>
        </div>
      }
    >
      <ItineraryInner />
    </Suspense>
  );
}
