"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Users, Star, MapPin } from "lucide-react";
import type { Package } from "@/types/package";

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

interface Props {
  pkg: Package;
  compact?: boolean;
}

export default function PlannerPackageCard({ pkg, compact = false }: Props) {
  const [hovered, setHovered] = useState(false);

  if (compact) {
    return (
      <Link
        href={`/packages/${pkg.slug}`}
        target="_blank"
        style={{
          display: "flex",
          overflow: "hidden",
          border: `1px solid ${hovered ? "rgba(200,57,43,0.4)" : "rgba(200,57,43,0.16)"}`,
          borderRadius: "12px",
          textDecoration: "none",
          background: "#fff",
          transition: "all 0.2s ease",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hovered
            ? "0 8px 24px rgba(200,57,43,0.12)"
            : "0 1px 6px rgba(28,10,0,0.06)",
          marginTop: "10px",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div
          style={{
            width: "110px",
            minWidth: "110px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src={pkg.images.hero}
            alt={pkg.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, transparent 60%, rgba(0,0,0,0.18))",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: "6px",
              left: "6px",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              color: "#fff",
              fontSize: "9px",
              padding: "2px 6px",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              borderRadius: "4px",
            }}
          >
            <Clock size={8} /> {pkg.duration.nights}N/{pkg.duration.days}D
          </span>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minWidth: 0,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#C8392B",
                margin: "0 0 3px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {pkg.destination}
            </p>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#1C0A00",
                margin: "0 0 3px",
                fontFamily: "Georgia, serif",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {pkg.title}
            </h4>
            <p
              style={{
                fontSize: "11px",
                color: "#7A4A2A",
                margin: 0,
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {pkg.tagline}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "10px",
                  color: "#A8967E",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <Users size={9} /> {pkg.groupSize.min}–{pkg.groupSize.max}
              </span>
              {pkg.rating && (
                <span
                  style={{
                    fontSize: "10px",
                    color: "#A8967E",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  <Star
                    size={9}
                    style={{ color: "#F59E0B", fill: "#F59E0B" }}
                  />{" "}
                  {pkg.rating}
                </span>
              )}
              {pkg.availability === "limited" && (
                <span
                  style={{
                    fontSize: "9px",
                    background: "#FEF3C7",
                    color: "#92400E",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Limited
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#fff",
                background: hovered ? "#a82d21" : "#C8392B",
                padding: "4px 10px",
                borderRadius: "4px",
                fontFamily: "DM Sans, sans-serif",
                transition: "background 0.2s",
              }}
            >
              View →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Full card for itinerary page
  return (
    <Link
      href={`/packages/${pkg.slug}`}
      style={{
        display: "block",
        overflow: "hidden",
        border: `1px solid ${hovered ? "rgba(200,57,43,0.3)" : "rgba(200,57,43,0.14)"}`,
        borderRadius: "12px",
        textDecoration: "none",
        background: "#FDFAF6",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 16px 40px rgba(200,57,43,0.12)"
          : "0 2px 8px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{ position: "relative", height: "200px", overflow: "hidden" }}
      >
        <img
          src={pkg.images.hero}
          alt={pkg.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: "#C8392B",
            color: "#fff",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "3px 8px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          ☀︎ AI Recommended
        </span>
        {pkg.availability === "limited" && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "#F59E0B",
              color: "#000",
              fontSize: "9px",
              fontWeight: 700,
              padding: "3px 8px",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Limited
          </span>
        )}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "12px",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            fontSize: "10px",
            padding: "3px 8px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            borderRadius: "4px",
          }}
        >
          <Clock size={10} /> {pkg.duration.nights}N / {pkg.duration.days}D
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        <p
          style={{
            fontSize: "9px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#C8392B",
            margin: "0 0 4px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {pkg.destination}
        </p>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#1C0A00",
            margin: "0 0 4px",
            fontFamily: "Georgia, serif",
            lineHeight: 1.25,
          }}
        >
          {pkg.title}
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "#7A4A2A",
            margin: "0 0 12px",
            lineHeight: 1.5,
          }}
        >
          {pkg.tagline}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "10px",
            color: "#A8967E",
            paddingBottom: "12px",
            borderBottom: "1px solid rgba(200,57,43,0.1)",
            marginBottom: "12px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Users size={10} /> {pkg.groupSize.min}–{pkg.groupSize.max} people
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin size={10} /> {pkg.region}
          </span>
          {pkg.rating && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Star size={10} style={{ color: "#F59E0B", fill: "#F59E0B" }} />{" "}
              {pkg.rating} ({pkg.reviewCount})
            </span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#fff",
              background: hovered ? "#a82d21" : "#C8392B",
              padding: "8px 20px",
              fontFamily: "DM Sans, sans-serif",
              transition: "background 0.2s",
            }}
          >
            View Package →
          </span>
        </div>
      </div>
    </Link>
  );
}
