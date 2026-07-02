import { useMemo, useState } from "react";
import {
  Waves,
  Mountain,
  Globe,
  Users,
  ArrowRight,
  IndianRupee,
  MapPin,
  Clock,
  ChevronDown,
  Search,
} from "lucide-react";
import { packages as ALL_PACKAGES } from "@/data/packages";
import type { Package } from "@/types/package";

// ── Destination catalogue with real budget ranges ─────────────────────────────
// land_min / land_max = per person land cost range
// flight_est = rough return flight estimate from major cities

interface Destination {
  id: string;
  name: string;
  country: string;
  region: "domestic" | "international";
  icon: React.ReactNode;
  land_min: number;
  land_max: number;
  flight_est: number; // per person, return
  duration_typical: string;
  tags: string[];
}

const DESTINATIONS: Destination[] = [
  // ── Europe ─────────────────────────────────────────────────────────

  {
    id: "france",
    name: "France",
    country: "France",
    region: "international",
    icon: <Globe size={12} />,
    land_min: 90000,
    land_max: 350000,
    flight_est: 60000,
    duration_typical: "8–12N",
    tags: ["culture", "luxury", "honeymoon", "international"],
  },
  {
    id: "italy",
    name: "Italy",
    country: "Italy",
    region: "international",
    icon: <Globe size={12} />,
    land_min: 85000,
    land_max: 320000,
    flight_est: 58000,
    duration_typical: "8–12N",
    tags: ["culture", "food", "honeymoon", "international"],
  },
  {
    id: "switzerland",
    name: "Switzerland",
    country: "Switzerland",
    region: "international",
    icon: <Mountain size={12} />,
    land_min: 120000,
    land_max: 450000,
    flight_est: 62000,
    duration_typical: "7–10N",
    tags: ["mountains", "luxury", "honeymoon", "international"],
  },
  {
    id: "greece",
    name: "Greece",
    country: "Greece",
    region: "international",
    icon: <Waves size={12} />,
    land_min: 85000,
    land_max: 280000,
    flight_est: 60000,
    duration_typical: "7–10N",
    tags: ["beach", "island", "honeymoon", "international"],
  },
  {
    id: "spain",
    name: "Spain",
    country: "Spain",
    region: "international",
    icon: <Globe size={12} />,
    land_min: 85000,
    land_max: 300000,
    flight_est: 60000,
    duration_typical: "8–12N",
    tags: ["culture", "beach", "family", "international"],
  },
  {
    id: "uk",
    name: "United Kingdom",
    country: "United Kingdom",
    region: "international",
    icon: <Globe size={12} />,
    land_min: 95000,
    land_max: 320000,
    flight_est: 65000,
    duration_typical: "7–10N",
    tags: ["culture", "city", "family", "international"],
  },
  {
    id: "turkey",
    name: "Turkey",
    country: "Turkey",
    region: "international",
    icon: <Globe size={12} />,
    land_min: 55000,
    land_max: 180000,
    flight_est: 32000,
    duration_typical: "6–8N",
    tags: ["culture", "history", "budget", "international"],
  },

  // ── USA & North America ────────────────────────────────────────────

  {
    id: "usa",
    name: "United States",
    country: "USA",
    region: "international",
    icon: <Globe size={12} />,
    land_min: 130000,
    land_max: 500000,
    flight_est: 85000,
    duration_typical: "10–15N",
    tags: ["city", "roadtrip", "family", "international"],
  },
  {
    id: "newyork",
    name: "New York",
    country: "USA",
    region: "international",
    icon: <MapPin size={12} />,
    land_min: 120000,
    land_max: 400000,
    flight_est: 85000,
    duration_typical: "5–7N",
    tags: ["city", "shopping", "luxury", "international"],
  },
  {
    id: "california",
    name: "California",
    country: "USA",
    region: "international",
    icon: <Waves size={12} />,
    land_min: 140000,
    land_max: 500000,
    flight_est: 90000,
    duration_typical: "8–12N",
    tags: ["roadtrip", "beach", "family", "international"],
  },
  {
    id: "hawaii",
    name: "Hawaii",
    country: "USA",
    region: "international",
    icon: <Waves size={12} />,
    land_min: 180000,
    land_max: 600000,
    flight_est: 120000,
    duration_typical: "7–10N",
    tags: ["beach", "luxury", "honeymoon", "international"],
  },
  {
    id: "canada",
    name: "Canada",
    country: "Canada",
    region: "international",
    icon: <Mountain size={12} />,
    land_min: 90000,
    land_max: 350000,
    flight_est: 70000,
    duration_typical: "8–12N",
    tags: ["nature", "mountains", "family", "international"],
  },
  // ── Domestic ──────────────────────────────────────────────────────────────
  {
    id: "goa",
    name: "Goa",
    country: "India",
    region: "domestic",
    icon: <Waves size={12} />,
    land_min: 12000,
    land_max: 45000,
    flight_est: 6000,
    duration_typical: "4–6N",
    tags: ["beach", "party", "family"],
  },
  {
    id: "kerala",
    name: "Kerala",
    country: "India",
    region: "domestic",
    icon: <Waves size={12} />,
    land_min: 18000,
    land_max: 80000,
    flight_est: 7000,
    duration_typical: "5–8N",
    tags: ["beach", "nature", "honeymoon"],
  },
  {
    id: "kashmir",
    name: "Kashmir",
    country: "India",
    region: "domestic",
    icon: <Mountain size={12} />,
    land_min: 20000,
    land_max: 70000,
    flight_est: 8000,
    duration_typical: "6–8N",
    tags: ["hills", "nature", "honeymoon"],
  },
  {
    id: "manali",
    name: "Manali",
    country: "India",
    region: "domestic",
    icon: <Mountain size={12} />,
    land_min: 12000,
    land_max: 40000,
    flight_est: 5500,
    duration_typical: "5–7N",
    tags: ["hills", "adventure", "trek"],
  },
  {
    id: "shimla",
    name: "Shimla",
    country: "India",
    region: "domestic",
    icon: <Mountain size={12} />,
    land_min: 10000,
    land_max: 35000,
    flight_est: 5000,
    duration_typical: "4–6N",
    tags: ["hills", "family", "budget"],
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    country: "India",
    region: "domestic",
    icon: <MapPin size={12} />,
    land_min: 18000,
    land_max: 90000,
    flight_est: 6500,
    duration_typical: "7–9N",
    tags: ["culture", "heritage", "family"],
  },
  {
    id: "andaman",
    name: "Andaman Islands",
    country: "India",
    region: "domestic",
    icon: <Waves size={12} />,
    land_min: 20000,
    land_max: 65000,
    flight_est: 9000,
    duration_typical: "5–7N",
    tags: ["beach", "island", "honeymoon"],
  },
  {
    id: "ooty",
    name: "Ooty / Kodaikanal",
    country: "India",
    region: "domestic",
    icon: <Mountain size={12} />,
    land_min: 8000,
    land_max: 28000,
    flight_est: 4500,
    duration_typical: "3–5N",
    tags: ["hills", "nature", "family"],
  },
  {
    id: "coorg",
    name: "Coorg",
    country: "India",
    region: "domestic",
    icon: <Mountain size={12} />,
    land_min: 8000,
    land_max: 30000,
    flight_est: 4000,
    duration_typical: "2–4N",
    tags: ["nature", "hills", "weekend"],
  },
  {
    id: "varanasi",
    name: "Varanasi",
    country: "India",
    region: "domestic",
    icon: <MapPin size={12} />,
    land_min: 6000,
    land_max: 22000,
    flight_est: 5000,
    duration_typical: "3–4N",
    tags: ["spiritual", "culture"],
  },
  {
    id: "ladakh",
    name: "Leh–Ladakh",
    country: "India",
    region: "domestic",
    icon: <Mountain size={12} />,
    land_min: 22000,
    land_max: 75000,
    flight_est: 10000,
    duration_typical: "7–9N",
    tags: ["adventure", "offbeat", "trek"],
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    country: "India",
    region: "domestic",
    icon: <Waves size={12} />,
    land_min: 5000,
    land_max: 20000,
    flight_est: 4500,
    duration_typical: "2–4N",
    tags: ["spiritual", "adventure", "weekend"],
  },
  {
    id: "northeast",
    name: "Northeast India",
    country: "India",
    region: "domestic",
    icon: <Globe size={12} />,
    land_min: 20000,
    land_max: 60000,
    flight_est: 9000,
    duration_typical: "7–9N",
    tags: ["nature", "offbeat", "adventure"],
  },
  {
    id: "spiti",
    name: "Spiti Valley",
    country: "India",
    region: "domestic",
    icon: <Mountain size={12} />,
    land_min: 16000,
    land_max: 50000,
    flight_est: 8000,
    duration_typical: "6–8N",
    tags: ["offbeat", "adventure", "trek"],
  },
  // ── International ─────────────────────────────────────────────────────────
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    region: "international",
    icon: <Globe size={12} />,
    land_min: 35000,
    land_max: 150000,
    flight_est: 18000,
    duration_typical: "4–6N",
    tags: ["luxury", "shopping", "international"],
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "international",
    icon: <Waves size={12} />,
    land_min: 30000,
    land_max: 120000,
    flight_est: 20000,
    duration_typical: "6–8N",
    tags: ["beach", "honeymoon", "international"],
  },
  {
    id: "thailand",
    name: "Thailand",
    country: "Thailand",
    region: "international",
    icon: <Waves size={12} />,
    land_min: 25000,
    land_max: 100000,
    flight_est: 16000,
    duration_typical: "5–7N",
    tags: ["beach", "culture", "budget", "international"],
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    region: "international",
    icon: <Globe size={12} />,
    land_min: 40000,
    land_max: 130000,
    flight_est: 22000,
    duration_typical: "4–6N",
    tags: ["family", "international", "theme-parks"],
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Maldives",
    region: "international",
    icon: <Waves size={12} />,
    land_min: 60000,
    land_max: 300000,
    flight_est: 25000,
    duration_typical: "4–6N",
    tags: ["luxury", "beach", "honeymoon", "international"],
  },
  {
    id: "europe",
    name: "Europe",
    country: "Multiple",
    region: "international",
    icon: <Globe size={12} />,
    land_min: 80000,
    land_max: 350000,
    flight_est: 55000,
    duration_typical: "10–14N",
    tags: ["culture", "luxury", "international"],
  },
  {
    id: "vietnam",
    name: "Vietnam",
    country: "Vietnam",
    region: "international",
    icon: <Globe size={12} />,
    land_min: 22000,
    land_max: 80000,
    flight_est: 18000,
    duration_typical: "6–8N",
    tags: ["culture", "budget", "international"],
  },
  {
    id: "nepal",
    name: "Nepal",
    country: "Nepal",
    region: "international",
    icon: <Mountain size={12} />,
    land_min: 15000,
    land_max: 60000,
    flight_est: 8000,
    duration_typical: "5–7N",
    tags: ["trek", "adventure", "international"],
  },
  {
    id: "srilanka",
    name: "Sri Lanka",
    country: "Sri Lanka",
    region: "international",
    icon: <Waves size={12} />,
    land_min: 20000,
    land_max: 80000,
    flight_est: 10000,
    duration_typical: "5–7N",
    tags: ["beach", "culture", "international"],
  },
];

// ── Budget slider config ──────────────────────────────────────────────────────

const BUDGET_MIN = 8000;
const BUDGET_MAX = 600000;

// Non-linear snap points for a better slider feel across such a wide range
const SNAP_POINTS = [
  8000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 75000, 100000,
  125000, 150000, 200000, 250000, 300000, 400000, 500000, 600000,
];

function snapBudget(raw: number): number {
  return SNAP_POINTS.reduce((prev, curr) =>
    Math.abs(curr - raw) < Math.abs(prev - raw) ? curr : prev,
  );
}

function fmt(n: number): string {
  if (n >= 100000)
    return `₹${(n / 100000) % 1 === 0 ? (n / 100000).toFixed(0) : (n / 100000).toFixed(1)}L`;
  if (n >= 1000)
    return `₹${(n / 1000) % 1 === 0 ? (n / 1000).toFixed(0) : (n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// slider value (0–100) ↔ budget (non-linear mapping)
function sliderToIndex(v: number): number {
  return Math.round((v / 100) * (SNAP_POINTS.length - 1));
}
function indexToSlider(i: number): number {
  return Math.round((i / (SNAP_POINTS.length - 1)) * 100);
}

// ── Group size options ────────────────────────────────────────────────────────

const GROUP_OPTIONS = [
  { id: "solo", label: "Solo", n: 1 },
  { id: "couple", label: "Couple", n: 2 },
  { id: "small", label: "3–4", n: 3 },
  { id: "group", label: "5+", n: 5 },
];

// ── Match destinations to budget ──────────────────────────────────────────────

function matchDestinations(
  perPersonBudget: number,
  regionFilter: "all" | "domestic" | "international",
  groupN: number,
): Destination[] {
  return DESTINATIONS.filter((d) => {
    if (regionFilter !== "all" && d.region !== regionFilter) return false;
    const totalPerPerson = d.land_min + d.flight_est;
    return totalPerPerson <= perPersonBudget * 1.15; // 15% flex
  })
    .sort((a, b) => {
      // Sort by how well they fit: closest land_max to budget without exceeding
      const aFit = Math.abs(a.land_min + a.flight_est - perPersonBudget);
      const bFit = Math.abs(b.land_min + b.flight_est - perPersonBudget);
      return aFit - bFit;
    })
    .slice(0, 5);
}

// ── Match packages for a destination ─────────────────────────────────────────

function matchPackages(dest: Destination): Package[] {
  return ALL_PACKAGES.filter((p) => {
    const tagMatch = p.category?.some((c) => dest.tags.includes(c));
    const nameMatch = p.destination
      ?.toLowerCase()
      .includes(dest.name.split(" ")[0].toLowerCase());
    return tagMatch || nameMatch;
  }).slice(0, 2);
}

// ── Destination result card ───────────────────────────────────────────────────

function DestCard({
  dest,
  budget,
  groupN,
  onSelect,
}: {
  dest: Destination;
  budget: number;
  groupN: number;
  onSelect: (d: Destination) => void;
}) {
  const totalLandPerPerson = dest.land_min;
  const totalPerPerson = dest.land_min + dest.flight_est;
  const totalForGroup = totalPerPerson * groupN;
  const fits = totalPerPerson <= budget;

  return (
    <button
      onClick={() => onSelect(dest)}
      style={{
        width: "100%",
        textAlign: "left",
        background: "#fff",
        border: `1px solid ${fits ? "rgba(200,57,43,0.2)" : "rgba(200,57,43,0.1)"}`,
        borderRadius: "10px",
        padding: "11px 12px",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8392B";
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(200,57,43,0.03)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = fits
          ? "rgba(200,57,43,0.2)"
          : "rgba(200,57,43,0.1)";
        (e.currentTarget as HTMLButtonElement).style.background = "#fff";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#C8392B" }}>{dest.icon}</span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#1C0A00",
              fontFamily: "Georgia, serif",
            }}
          >
            {dest.name}
          </span>
          <span
            style={{
              fontSize: "9px",
              color: "#A8967E",
              letterSpacing: "0.06em",
            }}
          >
            {dest.country}
          </span>
        </div>
        {fits ? (
          <span
            style={{
              fontSize: "9px",
              background: "rgba(74,222,128,0.15)",
              color: "#15803D",
              padding: "2px 7px",
              borderRadius: "10px",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 600,
            }}
          >
            Fits
          </span>
        ) : (
          <span
            style={{
              fontSize: "9px",
              background: "rgba(251,191,36,0.15)",
              color: "#92400E",
              padding: "2px 7px",
              borderRadius: "10px",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 600,
            }}
          >
            Close
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "6px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "#7A4A2A",
            display: "flex",
            alignItems: "center",
            gap: "3px",
          }}
        >
          <Clock size={9} /> {dest.duration_typical}
        </span>
        <span style={{ fontSize: "10px", color: "#7A4A2A" }}>
          Land from {fmt(dest.land_min)}/person
        </span>
        <span style={{ fontSize: "10px", color: "#A8967E" }}>
          +flights ~{fmt(dest.flight_est)}
        </span>
      </div>
      <div
        style={{
          marginTop: "8px",
          paddingTop: "6px",
          borderTop: "1px dashed rgba(200,57,43,0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "#7A4A2A",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Est. total for {groupN} {groupN === 1 ? "person" : "people"}
        </span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: fits ? "#C8392B" : "#E8621A",
          }}
        >
          ~{fmt(totalForGroup)}
        </span>
      </div>
    </button>
  );
}

// ── Package mini card ─────────────────────────────────────────────────────────

function PackageMini({ pkg }: { pkg: Package }) {
  return (
    <a
      href={`/packages/${pkg.slug}`}
      target="_blank"
      style={{
        display: "flex",
        gap: "8px",
        padding: "8px",
        background: "#FDFAF6",
        border: "1px solid rgba(200,57,43,0.14)",
        borderRadius: "8px",
        textDecoration: "none",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.borderColor =
          "rgba(200,57,43,0.4)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.borderColor =
          "rgba(200,57,43,0.14)")
      }
    >
      <img
        src={pkg.images.hero}
        alt={pkg.title}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "6px",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            fontWeight: 700,
            color: "#1C0A00",
            fontFamily: "Georgia, serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {pkg.title}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#7A4A2A" }}>
          {pkg.duration.nights}N · from {fmt(pkg.price.perPerson)}/person
        </p>
      </div>
      <ArrowRight
        size={11}
        color="#C8392B"
        style={{ flexShrink: 0, marginTop: "4px" }}
      />
    </a>
  );
}

// ── Search dropdown ───────────────────────────────────────────────────────────

function DestSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.country.toLowerCase().includes(query.toLowerCase()),
  );

  const selected = DESTINATIONS.find((d) => d.id === value);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 10px",
          borderRadius: "8px",
          border: "1px solid rgba(200,57,43,0.2)",
          background: "#fff",
          cursor: "pointer",
          fontSize: "11px",
          color: "#1C0A00",
          fontFamily: "DM Sans, sans-serif",
          textAlign: "left",
        }}
      >
        {selected ? (
          <>
            <span style={{ color: "#C8392B" }}>{selected.icon}</span>
            <span style={{ flex: 1 }}>{selected.name}</span>
          </>
        ) : (
          <>
            <Search size={11} color="#A8967E" />
            <span style={{ flex: 1, color: "#A8967E" }}>
              Search destination…
            </span>
          </>
        )}
        <ChevronDown size={11} color="#A8967E" />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid rgba(200,57,43,0.2)",
            borderRadius: "8px",
            zIndex: 100,
            maxHeight: "200px",
            boxShadow: "0 8px 24px rgba(28,10,0,0.12)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or destination…"
              style={{
                width: "100%",
                border: "1px solid rgba(200,57,43,0.15)",
                borderRadius: "6px",
                padding: "6px 8px",
                fontSize: "11px",
                outline: "none",
                fontFamily: "DM Sans, sans-serif",
                color: "#1C0A00",
              }}
            />
          </div>
          <div style={{ overflowY: "auto", maxHeight: "152px" }}>
            {filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  onChange(d.id);
                  setOpen(false);
                  setQuery("");
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "11px",
                  color: "#1C0A00",
                  fontFamily: "DM Sans, sans-serif",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(200,57,43,0.05)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "none")
                }
              >
                <span style={{ color: "#C8392B", display: "flex" }}>
                  {d.icon}
                </span>
                <span style={{ flex: 1 }}>{d.name}</span>
                <span style={{ fontSize: "9px", color: "#A8967E" }}>
                  {d.country}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p
                style={{
                  padding: "12px",
                  fontSize: "11px",
                  color: "#A8967E",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                No results
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main widget ────────────────────────────────────────────────────────────────

interface Props {
  onViewAll?: (matchedIds: string[]) => void;
}

export default function BudgetEstimatorWidget({ onViewAll }: Props) {
  const [sliderVal, setSliderVal] = useState(50); // 0–100 non-linear
  const [groupId, setGroupId] = useState("couple");
  const [region, setRegion] = useState<"all" | "domestic" | "international">(
    "all",
  );
  const [specificDest, setSpecificDest] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  const budget = SNAP_POINTS[sliderToIndex(sliderVal)];
  const groupN = GROUP_OPTIONS.find((g) => g.id === groupId)?.n ?? 2;
  const totalEst = budget * groupN;

  const matchedDests = useMemo(
    () => (showResults ? matchDestinations(budget, region, groupN) : []),
    [showResults, budget, region, groupN],
  );

  const destPackages = useMemo(
    () => (selectedDest ? matchPackages(selectedDest) : []),
    [selectedDest],
  );

  function handleEstimate() {
    if (specificDest) {
      const d = DESTINATIONS.find((d) => d.id === specificDest);
      if (d) {
        setSelectedDest(d);
        setShowResults(true);
        return;
      }
    }
    setShowResults(true);
  }

  return (
    <div
      style={{
        background: "#FDF6ED",
        border: "1px solid rgba(200,57,43,0.18)",
        borderRadius: "14px",
        padding: "14px",
        marginTop: "8px",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "#C8392B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IndianRupee size={12} color="#fff" />
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 700,
              color: "#1C0A00",
            }}
          >
            Budget Estimator
          </p>
          <p style={{ margin: 0, fontSize: "10px", color: "#7A4A2A" }}>
            Find destinations that fit your budget
          </p>
        </div>
      </div>

      {!showResults ? (
        <>
          {/* Budget slider */}
          <div style={{ marginBottom: "14px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "#7A4A2A",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Per person budget
              </span>
              <span
                style={{ fontSize: "20px", fontWeight: 700, color: "#C8392B" }}
              >
                {fmt(budget)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              style={{
                width: "100%",
                height: "4px",
                borderRadius: "2px",
                accentColor: "#C8392B",
                cursor: "pointer",
                outline: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "3px",
              }}
            >
              <span style={{ fontSize: "9px", color: "#A8967E" }}>₹8K</span>
              <span style={{ fontSize: "9px", color: "#A8967E" }}>₹1L</span>
              <span style={{ fontSize: "9px", color: "#A8967E" }}>₹3L</span>
              <span style={{ fontSize: "9px", color: "#A8967E" }}>₹6L+</span>
            </div>
          </div>

          {/* Group size */}
          <div style={{ marginBottom: "14px" }}>
            <p
              style={{
                fontSize: "10px",
                color: "#7A4A2A",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                margin: "0 0 6px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Group size
            </p>
            <div style={{ display: "flex", gap: "5px" }}>
              {GROUP_OPTIONS.map((g) => {
                const active = groupId === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGroupId(g.id)}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: "7px",
                      border: `1px solid ${active ? "#C8392B" : "rgba(200,57,43,0.2)"}`,
                      background: active ? "#C8392B" : "#fff",
                      color: active ? "#fff" : "#C8392B",
                      fontSize: "11px",
                      fontFamily: "DM Sans, sans-serif",
                      cursor: "pointer",
                      fontWeight: active ? 700 : 400,
                      transition: "all 0.15s",
                    }}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region filter */}
          <div style={{ marginBottom: "14px" }}>
            <p
              style={{
                fontSize: "10px",
                color: "#7A4A2A",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                margin: "0 0 6px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Where to?
            </p>
            <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
              {(["all", "domestic", "international"] as const).map((r) => {
                const active = region === r;
                const label =
                  r === "all"
                    ? "Anywhere"
                    : r === "domestic"
                      ? "India"
                      : "International";
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRegion(r);
                      setSpecificDest("");
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: "7px",
                      border: `1px solid ${active ? "#C8392B" : "rgba(200,57,43,0.2)"}`,
                      background: active ? "#C8392B" : "#fff",
                      color: active ? "#fff" : "#C8392B",
                      fontSize: "11px",
                      fontFamily: "DM Sans, sans-serif",
                      cursor: "pointer",
                      fontWeight: active ? 700 : 400,
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {/* Specific destination search */}
            <DestSearch value={specificDest} onChange={setSpecificDest} />
          </div>

          {/* Total estimate */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "9px 12px",
              background: "rgba(200,57,43,0.05)",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#7A4A2A",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Est. total for {groupN} {groupN === 1 ? "person" : "people"}
            </span>
            <span
              style={{ fontSize: "14px", fontWeight: 700, color: "#1C0A00" }}
            >
              ~{fmt(totalEst)}+
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={handleEstimate}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: "8px",
              background: "#C8392B",
              border: "none",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#a82d21")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#C8392B")
            }
          >
            Show Matching Destinations <ArrowRight size={13} />
          </button>
        </>
      ) : selectedDest ? (
        /* ── Specific destination detail view ── */
        <>
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "4px",
              }}
            >
              <span style={{ color: "#C8392B" }}>{selectedDest.icon}</span>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#1C0A00",
                  fontFamily: "Georgia, serif",
                }}
              >
                {selectedDest.name}
              </span>
              <span style={{ fontSize: "10px", color: "#A8967E" }}>
                {selectedDest.country}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
                marginTop: "10px",
              }}
            >
              {[
                {
                  label: "Land cost",
                  value: `${fmt(selectedDest.land_min)} – ${fmt(selectedDest.land_max)}/person`,
                },
                {
                  label: "Flights ~",
                  value: `${fmt(selectedDest.flight_est)} return`,
                },
                { label: "Duration", value: selectedDest.duration_typical },
                { label: "Your budget", value: `${fmt(budget)}/person` },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "7px 10px",
                    background: "#fff",
                    borderRadius: "7px",
                    border: "1px solid rgba(200,57,43,0.12)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "9px",
                      color: "#A8967E",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#1C0A00",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {destPackages.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <p
                style={{
                  fontSize: "10px",
                  color: "#7A4A2A",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  margin: "0 0 6px",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Matching packages
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {destPackages.map((pkg) => (
                  <PackageMini key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "7px" }}>
            <button
              onClick={() => {
                setSelectedDest(null);
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "7px",
                border: "1px solid rgba(200,57,43,0.25)",
                background: "#fff",
                color: "#C8392B",
                fontSize: "11px",
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
            <a
              href={`/enquiry?trip=${encodeURIComponent(selectedDest.name)}`}
              style={{
                flex: 1.5,
                padding: "8px 0",
                borderRadius: "7px",
                border: "none",
                background: "#C8392B",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                textDecoration: "none",
              }}
            >
              Enquire <ArrowRight size={11} />
            </a>
          </div>
        </>
      ) : (
        /* ── Destination list results ── */
        <>
          <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#7A4A2A" }}>
            {matchedDests.length > 0
              ? `${matchedDests.length} destinations within ~${fmt(budget)}/person:`
              : "No matches — try increasing your budget."}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "7px",
              marginBottom: "12px",
            }}
          >
            {matchedDests.map((d) => (
              <DestCard
                key={d.id}
                dest={d}
                budget={budget}
                groupN={groupN}
                onSelect={(d) => setSelectedDest(d)}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: "7px" }}>
            <button
              onClick={() => {
                setShowResults(false);
                setSelectedDest(null);
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "7px",
                border: "1px solid rgba(200,57,43,0.25)",
                background: "#fff",
                color: "#C8392B",
                fontSize: "11px",
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
              }}
            >
              Adjust
            </button>
            <button
              onClick={() => onViewAll?.([])}
              style={{
                flex: 1.5,
                padding: "8px 0",
                borderRadius: "7px",
                border: "none",
                background: "#C8392B",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              All Packages <ArrowRight size={11} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
