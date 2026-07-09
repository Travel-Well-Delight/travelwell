import { useMemo, useState } from "react";
import {
  IndianRupee, MapPin, Users, ArrowRight,
  Compass, MessageSquare, ChevronDown, Check,
} from "lucide-react";

// ── Destination data ──────────────────────────────────────────────────────────

interface Dest {
  id: string;
  name: string;
  flag: string;
  region: "domestic" | "international";
  land_min: number;   // per person
  land_max: number;
  flight: number;     // per person return
  nights: string;
  vibe: string;
}

const DESTINATIONS: Dest[] = [
  { id: "goa",        name: "Goa",             flag: "🇮🇳", region: "domestic",      land_min: 12000,  land_max: 45000,  flight: 6000,  nights: "4–6N", vibe: "Beach & Nightlife" },
  { id: "kerala",     name: "Kerala",           flag: "🇮🇳", region: "domestic",      land_min: 18000,  land_max: 80000,  flight: 7000,  nights: "5–8N", vibe: "Backwaters & Nature" },
  { id: "kashmir",    name: "Kashmir",          flag: "🇮🇳", region: "domestic",      land_min: 20000,  land_max: 70000,  flight: 8000,  nights: "6–8N", vibe: "Hills & Snow" },
  { id: "manali",     name: "Manali",           flag: "🇮🇳", region: "domestic",      land_min: 12000,  land_max: 40000,  flight: 5500,  nights: "5–7N", vibe: "Adventure & Trek" },
  { id: "rajasthan",  name: "Rajasthan",        flag: "🇮🇳", region: "domestic",      land_min: 18000,  land_max: 90000,  flight: 6500,  nights: "7–9N", vibe: "Culture & Heritage" },
  { id: "andaman",    name: "Andaman",          flag: "🇮🇳", region: "domestic",      land_min: 20000,  land_max: 65000,  flight: 9000,  nights: "5–7N", vibe: "Islands & Diving" },
  { id: "ladakh",     name: "Leh–Ladakh",       flag: "🇮🇳", region: "domestic",      land_min: 22000,  land_max: 75000,  flight: 10000, nights: "7–9N", vibe: "Offbeat & Scenic" },
  { id: "ooty",       name: "Ooty",             flag: "🇮🇳", region: "domestic",      land_min: 8000,   land_max: 28000,  flight: 4500,  nights: "3–5N", vibe: "Hills & Greenery" },
  { id: "rishikesh",  name: "Rishikesh",        flag: "🇮🇳", region: "domestic",      land_min: 5000,   land_max: 20000,  flight: 4500,  nights: "2–4N", vibe: "Spiritual & Adventure" },
  { id: "dubai",      name: "Dubai",            flag: "🇦🇪", region: "international", land_min: 35000,  land_max: 150000, flight: 18000, nights: "4–6N", vibe: "Luxury & Shopping" },
  { id: "bali",       name: "Bali",             flag: "🇮🇩", region: "international", land_min: 30000,  land_max: 120000, flight: 20000, nights: "6–8N", vibe: "Beach & Wellness" },
  { id: "thailand",   name: "Thailand",         flag: "🇹🇭", region: "international", land_min: 25000,  land_max: 100000, flight: 16000, nights: "5–7N", vibe: "Culture & Beaches" },
  { id: "singapore",  name: "Singapore",        flag: "🇸🇬", region: "international", land_min: 40000,  land_max: 130000, flight: 22000, nights: "4–6N", vibe: "City & Family" },
  { id: "maldives",   name: "Maldives",         flag: "🇲🇻", region: "international", land_min: 60000,  land_max: 300000, flight: 25000, nights: "4–6N", vibe: "Luxury Overwater" },
  { id: "europe",     name: "Europe",           flag: "🌍", region: "international", land_min: 80000,  land_max: 350000, flight: 55000, nights: "10–14N", vibe: "Culture & History" },
  { id: "vietnam",    name: "Vietnam",          flag: "🇻🇳", region: "international", land_min: 22000,  land_max: 80000,  flight: 18000, nights: "6–8N", vibe: "Street Food & Culture" },
  { id: "nepal",      name: "Nepal",            flag: "🇳🇵", region: "international", land_min: 15000,  land_max: 60000,  flight: 8000,  nights: "5–7N", vibe: "Trek & Spirituality" },
  { id: "srilanka",   name: "Sri Lanka",        flag: "🇱🇰", region: "international", land_min: 20000,  land_max: 80000,  flight: 10000, nights: "5–7N", vibe: "Beach & Wildlife" },
];

// ── Group presets ─────────────────────────────────────────────────────────────

const GROUPS = [
  { id: "solo",   label: "Solo",   n: 1 },
  { id: "couple", label: "Couple", n: 2 },
  { id: "small",  label: "3–4",    n: 3 },
  { id: "group",  label: "5+",     n: 6 },
];

// ── Formatting ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 100000) return `₹${+(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${+(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function fmtInput(raw: string) {
  const num = parseInt(raw.replace(/,/g, ""), 10);
  if (isNaN(num)) return raw;
  return num.toLocaleString("en-IN");
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onOpenPlanner?: (query: string) => void;
}

// ── Styles (shared) ───────────────────────────────────────────────────────────

const C = {
  red:    "#C8392B",
  redDim: "#a82d21",
  dark:   "#1C0A00",
  muted:  "#7A4A2A",
  faint:  "#A8967E",
  cream:  "#FDF6ED",
  border: "rgba(200,57,43,0.18)",
};

// ── Main widget ────────────────────────────────────────────────────────────────

export default function BudgetEstimatorWidget({ onOpenPlanner }: Props) {
  // Step 1 — inputs
  const [totalInput,  setTotalInput]  = useState("");        // raw rupee string
  const [groupId,     setGroupId]     = useState("couple");
  const [region,      setRegion]      = useState<"all"|"domestic"|"international">("all");
  const [destOpen,    setDestOpen]    = useState(false);
  const [selectedDest,setSelectedDest]= useState<string>("");

  // Step 2 — results
  const [showResults, setShowResults] = useState(false);

  // Derived
  const totalNum  = parseInt(totalInput.replace(/,/g, ""), 10) || 0;
  const groupN    = GROUPS.find(g => g.id === groupId)?.n ?? 2;
  const perHead   = totalNum > 0 ? Math.floor(totalNum / groupN) : 0;

  const canEstimate = totalNum >= 5000;

  // Filter + score destinations
  const matches = useMemo(() => {
    if (!showResults || perHead === 0) return [];
    return DESTINATIONS
      .filter(d => {
        if (region !== "all" && d.region !== region) return false;
        if (selectedDest && d.id !== selectedDest) return false;
        return (d.land_min + d.flight) <= perHead * 1.2;
      })
      .sort((a, b) => {
        const aGap = Math.abs((a.land_min + a.flight) - perHead);
        const bGap = Math.abs((b.land_min + b.flight) - perHead);
        return aGap - bGap;
      })
      .slice(0, 4);
  }, [showResults, perHead, region, selectedDest]);

  function handleEstimate() {
    if (canEstimate) setShowResults(true);
  }

  function handleReset() {
    setShowResults(false);
  }

  const plannerQuery = selectedDest
    ? `I have a total budget of ₹${totalNum.toLocaleString("en-IN")} for ${groupN} people. We want to go to ${DESTINATIONS.find(d => d.id === selectedDest)?.name}. What can we plan?`
    : `I have a total budget of ₹${totalNum.toLocaleString("en-IN")} for ${groupN} people. What destinations can we explore?`;

  // ── STEP 1: Input form ──────────────────────────────────────────────────────
  if (!showResults) return (
    <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginTop: 8 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IndianRupee size={14} color="#fff" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif" }}>Budget Estimator</p>
          <p style={{ margin: 0, fontSize: 10, color: C.muted, fontFamily: "DM Sans, sans-serif" }}>Enter your total budget — we'll split it per head</p>
        </div>
      </div>

      {/* Total amount input */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif", display: "block", marginBottom: 6 }}>
          Total trip budget (₹)
        </label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.red, display: "flex", alignItems: "center" }}>
            <IndianRupee size={14} />
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 1,50,000"
            value={totalInput}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setTotalInput(raw ? parseInt(raw).toLocaleString("en-IN") : "");
            }}
            style={{
              width: "100%", padding: "10px 12px 10px 30px",
              border: `1.5px solid ${totalNum > 0 ? C.red : C.border}`,
              borderRadius: 8, fontSize: 15, fontWeight: 700,
              color: C.dark, background: "#fff", outline: "none",
              fontFamily: "DM Sans, sans-serif",
              boxSizing: "border-box", transition: "border-color 0.2s",
            }}
          />
        </div>
        {/* Per head preview */}
        {perHead > 0 && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: C.faint, fontFamily: "DM Sans, sans-serif" }}>Per person:</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{fmt(perHead)}</span>
            <span style={{ fontSize: 10, color: C.faint, fontFamily: "DM Sans, sans-serif" }}>({groupN} {groupN === 1 ? "person" : "people"})</span>
          </div>
        )}
      </div>

      {/* Group size */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif", display: "block", marginBottom: 6 }}>
          Group size
        </label>
        <div style={{ display: "flex", gap: 5 }}>
          {GROUPS.map(g => {
            const active = groupId === g.id;
            return (
              <button key={g.id} onClick={() => setGroupId(g.id)} style={{
                flex: 1, padding: "7px 0", borderRadius: 7,
                border: `1px solid ${active ? C.red : C.border}`,
                background: active ? C.red : "#fff",
                color: active ? "#fff" : C.red,
                fontSize: 11, fontFamily: "DM Sans, sans-serif",
                fontWeight: active ? 700 : 400,
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif", display: "block", marginBottom: 6 }}>
          Where to?
        </label>
        <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
          {(["all", "domestic", "international"] as const).map(r => {
            const active = region === r;
            const label  = r === "all" ? "Anywhere" : r === "domestic" ? "India" : "International";
            return (
              <button key={r} onClick={() => { setRegion(r); setSelectedDest(""); }} style={{
                flex: 1, padding: "7px 0", borderRadius: 7,
                border: `1px solid ${active ? C.red : C.border}`,
                background: active ? C.red : "#fff",
                color: active ? "#fff" : C.red,
                fontSize: 11, fontFamily: "DM Sans, sans-serif",
                fontWeight: active ? 700 : 400,
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Specific destination */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDestOpen(o => !o)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 6,
              padding: "8px 10px", borderRadius: 8,
              border: `1px solid ${selectedDest ? C.red : C.border}`,
              background: "#fff", cursor: "pointer",
              fontSize: 11, color: selectedDest ? C.dark : C.faint,
              fontFamily: "DM Sans, sans-serif", textAlign: "left",
            }}
          >
            <MapPin size={11} color={selectedDest ? C.red : C.faint} />
            <span style={{ flex: 1 }}>
              {selectedDest
                ? DESTINATIONS.find(d => d.id === selectedDest)?.name
                : "Specific destination (optional)"}
            </span>
            <ChevronDown size={11} color={C.faint} style={{ transform: destOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
          </button>
          {destOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, zIndex: 100, boxShadow: "0 8px 24px rgba(28,10,0,0.1)", maxHeight: 180, overflowY: "auto" }}>
              <button
                onClick={() => { setSelectedDest(""); setDestOpen(false); }}
                style={{ width: "100%", padding: "8px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 11, color: C.faint, fontFamily: "DM Sans, sans-serif", textAlign: "left" }}
              >
                Any destination
              </button>
              {DESTINATIONS.filter(d => region === "all" || d.region === region).map(d => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDest(d.id); setDestOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px", border: "none", background: selectedDest === d.id ? "rgba(200,57,43,0.06)" : "none",
                    cursor: "pointer", fontSize: 11, color: C.dark,
                    fontFamily: "DM Sans, sans-serif", textAlign: "left",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,57,43,0.05)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = selectedDest === d.id ? "rgba(200,57,43,0.06)" : "none"}
                >
                  <span>{d.flag}</span>
                  <span style={{ flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 9, color: C.faint }}>{d.vibe}</span>
                  {selectedDest === d.id && <Check size={10} color={C.red} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleEstimate}
        disabled={!canEstimate}
        style={{
          width: "100%", padding: "11px 0", borderRadius: 8,
          background: canEstimate ? C.red : "rgba(200,57,43,0.2)",
          border: "none", color: "#fff",
          fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", fontFamily: "DM Sans, sans-serif",
          cursor: canEstimate ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "background 0.2s",
        }}
        onMouseEnter={e => { if (canEstimate) (e.currentTarget as HTMLButtonElement).style.background = C.redDim; }}
        onMouseLeave={e => { if (canEstimate) (e.currentTarget as HTMLButtonElement).style.background = C.red; }}
      >
        Show What's Possible <ArrowRight size={13} />
      </button>
      {!canEstimate && totalInput && (
        <p style={{ textAlign: "center", fontSize: 10, color: C.faint, margin: "6px 0 0", fontFamily: "DM Sans, sans-serif" }}>
          Minimum budget ₹5,000
        </p>
      )}
    </div>
  );

  // ── STEP 2: Results ─────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginTop: 8 }}>

      {/* Budget summary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 14 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, color: C.faint, fontFamily: "DM Sans, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total budget</p>
          <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif" }}>₹{totalNum.toLocaleString("en-IN")}</p>
        </div>
        <div style={{ width: 1, height: 32, background: C.border }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 10, color: C.faint, fontFamily: "DM Sans, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Per person</p>
          <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: C.red, fontFamily: "Georgia, serif" }}>{fmt(perHead)}</p>
        </div>
        <div style={{ width: 1, height: 32, background: C.border }} />
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 10, color: C.faint, fontFamily: "DM Sans, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Travellers</p>
          <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif" }}>{groupN}</p>
        </div>
      </div>

      {/* Results */}
      {matches.length > 0 ? (
        <>
          <p style={{ margin: "0 0 10px", fontSize: 11, color: C.muted, fontFamily: "DM Sans, sans-serif" }}>
            {matches.length} destination{matches.length > 1 ? "s" : ""} within your budget:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
            {matches.map(d => {
              const minTotal   = (d.land_min + d.flight) * groupN;
              const fits       = (d.land_min + d.flight) <= perHead;
              return (
                <div key={d.id} style={{ background: "#fff", border: `1px solid ${fits ? "rgba(200,57,43,0.22)" : C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 16 }}>{d.flag}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif" }}>{d.name}</p>
                        <p style={{ margin: 0, fontSize: 10, color: C.faint, fontFamily: "DM Sans, sans-serif" }}>{d.vibe} · {d.nights}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, fontFamily: "DM Sans, sans-serif", fontWeight: 700, background: fits ? "rgba(74,222,128,0.12)" : "rgba(251,191,36,0.12)", color: fits ? "#15803D" : "#92400E" }}>
                      {fits ? "Fits" : "Close"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12, paddingTop: 7, borderTop: "1px dashed rgba(200,57,43,0.1)" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 9, color: C.faint, fontFamily: "DM Sans, sans-serif" }}>Land/person</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 600, color: C.dark }}>{fmt(d.land_min)}–{fmt(d.land_max)}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 9, color: C.faint, fontFamily: "DM Sans, sans-serif" }}>Flights ~</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 600, color: C.dark }}>{fmt(d.flight)}</p>
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 9, color: C.faint, fontFamily: "DM Sans, sans-serif" }}>Est. total</p>
                      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: C.red }}>{fmt(minTotal)}+</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "16px 0 20px" }}>
          <p style={{ fontSize: 13, color: C.muted, margin: "0 0 4px", fontFamily: "Georgia, serif" }}>
            No exact matches for {fmt(perHead)}/person.
          </p>
          <p style={{ fontSize: 11, color: C.faint, margin: 0, fontFamily: "DM Sans, sans-serif" }}>
            Try a higher budget or explore our custom packages.
          </p>
        </div>
      )}

      {/* Two CTAs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* CTA 1 — AI Planner */}
        <button
          onClick={() => onOpenPlanner?.(plannerQuery)}
          style={{
            width: "100%", padding: "11px 16px", borderRadius: 9,
            background: C.red, border: "none", color: "#fff",
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer", transition: "background 0.2s", textAlign: "left",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = C.redDim}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = C.red}
        >
          <Compass size={16} color="#fff" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "DM Sans, sans-serif" }}>Plan with Travel Guide</p>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.7)", fontFamily: "DM Sans, sans-serif" }}>Get a full itinerary built around your budget</p>
          </div>
          <ArrowRight size={13} color="rgba(255,255,255,0.7)" />
        </button>

        {/* CTA 2 — Enquiry */}
        <a
          href={`/enquiry?budget=${totalNum}&group=${groupN}&dest=${selectedDest || region}`}
          style={{
            width: "100%", padding: "11px 16px", borderRadius: 9,
            background: "#fff", border: `1.5px solid ${C.border}`,
            color: C.dark, display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer", transition: "border-color 0.2s", textDecoration: "none",
            boxSizing: "border-box",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = C.red}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = C.border}
        >
          <MessageSquare size={16} color={C.red} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.dark, fontFamily: "DM Sans, sans-serif" }}>Talk to our team</p>
            <p style={{ margin: 0, fontSize: 10, color: C.faint, fontFamily: "DM Sans, sans-serif" }}>We'll plan a custom trip within your budget</p>
          </div>
          <ArrowRight size={13} color={C.red} />
        </a>
      </div>

      {/* Adjust link */}
      <button
        onClick={handleReset}
        style={{ background: "none", border: "none", cursor: "pointer", color: C.faint, fontSize: 10, fontFamily: "DM Sans, sans-serif", marginTop: 10, display: "block", width: "100%", textAlign: "center" }}
      >
        ← Adjust budget
      </button>
    </div>
  );
}
