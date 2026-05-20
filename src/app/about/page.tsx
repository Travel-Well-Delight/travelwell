"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Polaroid photos — update src to your actual images in /public ──
const POLAROIDS = [
  {
    src: "/postcard2.JPG.jpeg",
    caption: "Memories",
    top: "18%",
    left: "2%",
    rotate: -8,
  },
  {
    src: "/postcard4.JPG.jpeg",
    caption: "Memories",
    top: "42%",
    left: "1%",
    rotate: 5,
  },
  {
    src: "/postcard9.JPG.jpeg",
    caption: "Memories",
    top: "68%",
    left: "3%",
    rotate: -4,
  },
  {
    src: "/postcard3.JPG.jpeg",
    caption: "Memories",
    top: "20%",
    right: "2%",
    rotate: 7,
  },
  {
    src: "/postcard5.JPG.jpeg",
    caption: "Memories",
    top: "50%",
    right: "1%",
    rotate: -6,
  },
  {
    src: "/postcard7.JPG.jpeg",
    caption: "Memories",
    top: "74%",
    right: "2%",
    rotate: 4,
  },
];

const STATS = [
  { num: "5+", label: "Years" },
  { num: "150+", label: "Travelers" },
  { num: "23+", label: "Destinations" },
  { num: "100%", label: "Handcrafted" },
];

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false);

  // Make navbar visible on this page regardless of scroll
  useEffect(() => {
    const nav = document.querySelector("header") as HTMLElement;
    if (!nav) return;

    nav.style.background = "rgba(253,246,237,0.97)";
    nav.style.backdropFilter = "blur(8px)";
    nav.style.borderBottom = "1px solid rgba(200,57,43,0.12)";

    // Force all nav text dark so it shows on cream background
    const links = nav.querySelectorAll("a, button") as NodeListOf<HTMLElement>;
    links.forEach((el) => {
      el.dataset.origColor = el.style.color;
      el.style.color = "#1C0A00";
    });

    return () => {
      nav.style.background = "";
      nav.style.backdropFilter = "";
      nav.style.borderBottom = "";
      links.forEach((el) => {
        el.style.color = el.dataset.origColor || "";
      });
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FDF6ED",
        paddingTop: "80px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ── SCATTERED POLAROIDS — fixed position on sides ── */}
      {POLAROIDS.map((p, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            top: p.top,
            left: p.left,
            right: p.right,
            width: "130px",
            zIndex: 5,
            transform: `rotate(${p.rotate}deg)`,
            background: "#fff",
            padding: "8px 8px 24px",
            boxShadow: "0 3px 14px rgba(28,10,0,0.12)",
            border: "1px solid rgba(200,57,43,0.08)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform =
              "rotate(0deg) scale(1.06)";
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 10px 28px rgba(200,57,43,0.18)";
            (e.currentTarget as HTMLDivElement).style.zIndex = "20";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform =
              `rotate(${p.rotate}deg)`;
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 3px 14px rgba(28,10,0,0.12)";
            (e.currentTarget as HTMLDivElement).style.zIndex = "5";
          }}
        >
          <div
            style={{
              width: "100%",
              height: "90px",
              background: "#EDE6D9",
              overflow: "hidden",
            }}
          >
            <img
              src={p.src}
              alt={p.caption}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (
                  e.currentTarget.parentElement as HTMLDivElement
                ).style.background = "#E8DECE";
              }}
            />
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: "9px",
              color: "#7A4A2A",
              marginTop: "6px",
              letterSpacing: "0.5px",
              fontStyle: "italic",
            }}
          >
            {p.caption}
          </p>
        </div>
      ))}

      {/* ── MAIN CARD ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          background: "#FDF6ED",
          border: "2px solid #C8392B",
          borderRadius: "6px",
          padding: "clamp(40px,7vw,70px) clamp(24px,8vw,80px) 60px",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        {/* Inner border */}
        <div
          style={{
            position: "absolute",
            inset: "10px",
            border: "0.5px solid rgba(200,57,43,0.28)",
            borderRadius: "4px",
            pointerEvents: "none",
          }}
        />

        {/* SVG background */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
          viewBox="0 0 760 920"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="18"
              height="18"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1.2" cy="1.2" r="0.9" fill="#C8392B" opacity="0.10" />
            </pattern>
          </defs>
          <rect width="760" height="920" fill="url(#dots)" />
          {/* Taj Mahal */}
          <g opacity="0.07" stroke="#C8392B" strokeWidth="1.1" fill="none">
            <rect x="320" y="128" width="120" height="68" />
            <path d="M320 128 Q380 76 440 128" />
            <ellipse cx="380" cy="116" rx="16" ry="22" />
            <line x1="380" y1="94" x2="380" y2="66" />
            <rect x="342" y="140" width="18" height="34" />
            <rect x="400" y="140" width="18" height="34" />
            <rect x="366" y="148" width="28" height="48" />
            <line x1="274" y1="196" x2="486" y2="196" />
          </g>
          {/* Eiffel Tower */}
          <g opacity="0.07" stroke="#C8392B" strokeWidth="1.2" fill="none">
            <path d="M55 860 Q80 700 80 688" />
            <path d="M111 860 Q86 700 86 688" />
            <line x1="51" y1="860" x2="115" y2="860" />
            <path d="M59 808 Q83 798 107 808" />
            <path d="M62 778 Q83 769 104 778" />
            <rect x="68" y="728" width="30" height="7" rx="1" />
            <line x1="83" y1="688" x2="83" y2="660" />
          </g>
          {/* Big Ben */}
          <g opacity="0.07" stroke="#C8392B" strokeWidth="1.1" fill="none">
            <rect x="680" y="120" width="52" height="104" rx="2" />
            <path d="M675 120 L706 90 L737 120" />
            <rect x="689" y="132" width="34" height="34" rx="2" />
            <circle cx="706" cy="149" r="14" />
            <line x1="706" y1="135" x2="706" y2="149" />
            <line x1="706" y1="149" x2="716" y2="157" />
          </g>
          {/* Route dots */}
          <g opacity="0.08">
            <line
              x1="100"
              y1="570"
              x2="650"
              y2="570"
              stroke="#C8392B"
              strokeWidth="1"
              strokeDasharray="6 9"
            />
            <circle
              cx="100"
              cy="570"
              r="4"
              fill="none"
              stroke="#C8392B"
              strokeWidth="1.4"
            />
            <circle
              cx="237"
              cy="570"
              r="3"
              fill="none"
              stroke="#C8392B"
              strokeWidth="1"
            />
            <circle
              cx="375"
              cy="570"
              r="3"
              fill="none"
              stroke="#C8392B"
              strokeWidth="1"
            />
            <circle
              cx="512"
              cy="570"
              r="3"
              fill="none"
              stroke="#C8392B"
              strokeWidth="1"
            />
            <circle
              cx="650"
              cy="570"
              r="4"
              fill="none"
              stroke="#C8392B"
              strokeWidth="1.4"
            />
            <text
              x="100"
              y="586"
              fontSize="8"
              fill="#C8392B"
              fontFamily="Georgia,serif"
              textAnchor="middle"
            >
              Mumbai
            </text>
            <text
              x="237"
              y="586"
              fontSize="8"
              fill="#C8392B"
              fontFamily="Georgia,serif"
              textAnchor="middle"
            >
              Dubai
            </text>
            <text
              x="375"
              y="586"
              fontSize="8"
              fill="#C8392B"
              fontFamily="Georgia,serif"
              textAnchor="middle"
            >
              Paris
            </text>
            <text
              x="512"
              y="586"
              fontSize="8"
              fill="#C8392B"
              fontFamily="Georgia,serif"
              textAnchor="middle"
            >
              Bali
            </text>
            <text
              x="650"
              y="586"
              fontSize="8"
              fill="#C8392B"
              fontFamily="Georgia,serif"
              textAnchor="middle"
            >
              Sydney
            </text>
          </g>
        </svg>

        {/* Postage stamp */}
        <div
          style={{
            position: "absolute",
            top: "22px",
            right: "22px",
            width: "90px",
            height: "64px",
            border: "1px solid rgba(200,57,43,0.4)",
            borderRadius: "2px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "30px",
              background: "rgba(200,57,43,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "7px",
                letterSpacing: "2px",
                color: "#C8392B",
                textTransform: "uppercase",
              }}
            >
              First Class
            </span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#C8392B" }}>
            Postage
          </span>
          <span
            style={{
              fontSize: "7px",
              color: "#7A4A2A",
              letterSpacing: "1.5px",
            }}
          >
            India · 2026
          </span>
        </div>

        {/* Logo stamp */}
        <div
          style={{
            position: "absolute",
            top: "22px",
            left: "22px",
            width: "80px",
            height: "50px",
            border: "1px solid rgba(200,57,43,0.38)",
            borderRadius: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "8.5px",
              fontWeight: 700,
              color: "#C8392B",
              letterSpacing: "0.5px",
            }}
          >
            TRAVEL WELL
          </span>
          <div
            style={{
              width: "70%",
              height: "0.5px",
              background: "rgba(200,57,43,0.3)",
              margin: "2px 0",
            }}
          />
          <span
            style={{ fontSize: "7px", color: "#7A4A2A", letterSpacing: "2px" }}
          >
            DELIGHT
          </span>
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          {/* Our Story label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "28px",
              marginTop: "50px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(200,57,43,0.3)",
              }}
            />
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "6px",
                color: "#C8392B",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Our Story
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(200,57,43,0.3)",
              }}
            />
          </div>

          <h1
            style={{
              fontSize: "clamp(3rem,9vw,5.5rem)",
              fontWeight: 700,
              color: "#1C0A00",
              lineHeight: 1,
              letterSpacing: "-1.5px",
              margin: 0,
            }}
          >
            TravelWell
          </h1>
          <p
            style={{
              fontStyle: "italic",
              fontSize: "clamp(1.4rem,4vw,2.4rem)",
              color: "#C8392B",
              letterSpacing: "4px",
              margin: "6px 0 0",
            }}
          >
            Delight
          </p>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              margin: "22px 0",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "1px",
                background: "rgba(200,57,43,0.35)",
              }}
            />
            <div
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#C8392B",
                opacity: 0.4,
              }}
            />
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#C8392B",
              }}
            />
            <div
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#C8392B",
                opacity: 0.4,
              }}
            />
            <div
              style={{
                width: "100px",
                height: "1px",
                background: "rgba(200,57,43,0.35)",
              }}
            />
          </div>

          <p
            style={{
              fontStyle: "italic",
              fontSize: "clamp(0.95rem,2vw,1.1rem)",
              color: "#3D1A08",
              lineHeight: 1.8,
              maxWidth: "500px",
              margin: "0 auto 10px",
            }}
          >
            We curate holidays for people who care deeply about where they go
            and how they get there.
          </p>
          <p
            style={{
              fontSize: "clamp(0.82rem,1.6vw,0.94rem)",
              color: "#7A4A2A",
              lineHeight: 1.8,
              maxWidth: "440px",
              margin: "0 auto",
            }}
          >
            No aggregated inventory. No hidden charges. Just handcrafted
            itineraries built by people who have actually been there.
          </p>

          <div
            style={{
              height: "1px",
              background: "rgba(200,57,43,0.2)",
              margin: "32px auto",
              maxWidth: "460px",
            }}
          />

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {STATS.map((s, i, arr) => (
              <div
                key={s.label}
                style={{
                  padding: "0 22px",
                  borderRight:
                    i < arr.length - 1
                      ? "1px solid rgba(200,57,43,0.25)"
                      : "none",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(1.4rem,3vw,2.1rem)",
                    fontWeight: 700,
                    color: "#C8392B",
                    lineHeight: 1.1,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    letterSpacing: "2px",
                    color: "#7A4A2A",
                    textTransform: "uppercase",
                    marginTop: "4px",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              height: "1px",
              background: "rgba(200,57,43,0.2)",
              margin: "32px auto",
              maxWidth: "460px",
            }}
          />

          {/* Quote */}
          <div
            style={{
              border: "1px solid rgba(200,57,43,0.38)",
              borderRadius: "3px",
              padding: "24px 36px",
              maxWidth: "460px",
              margin: "0 auto 28px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "5px",
                border: "0.4px solid rgba(200,57,43,0.15)",
                borderRadius: "2px",
                pointerEvents: "none",
              }}
            />
            <p
              style={{
                fontStyle: "italic",
                fontSize: "0.97rem",
                color: "#3D1A08",
                margin: "0 0 10px",
                lineHeight: 1.65,
              }}
            >
              "Travel is the only thing you buy that makes you richer."
            </p>
            <p
              style={{
                fontSize: "8.5px",
                letterSpacing: "3px",
                color: "#C8392B",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              — Our Philosophy
            </p>
          </div>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              marginBottom: "28px",
            }}
          >
            <Link
              href="/packages"
              style={{
                background: "#C8392B",
                color: "#fff",
                padding: "12px 28px",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
              }}
            >
              Choose a Package
            </Link>
            <Link
              href="/enquiry"
              style={{
                border: "1.5px solid #C8392B",
                color: "#C8392B",
                padding: "12px 28px",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
              }}
            >
              Get in Touch
            </Link>
          </div>

          <p
            style={{
              fontSize: "8px",
              letterSpacing: "5px",
              color: "rgba(200,57,43,0.55)",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            TravelWell Delight · Est. 2012 · Handcrafted Journeys
          </p>
        </div>
      </div>

      {/* Bottom spacing */}
      <div style={{ height: "60px" }} />
    </div>
  );
}
