"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Users, Star } from "lucide-react";
import type { Package } from "@/types/package";

interface Props {
  packages: Package[];
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

// ── Summer offer labels pool — cycles through packages in order ──
const SUMMER_LABELS = [
  "Summer Special",
  "Peak Season Pick",
  "Hot Deal",
  "Summer Escape",
  "Season's Best",
  "Limited Seats",
  "Summer Sale",
  "Top Pick",
];

export default function FeaturedPackages({ packages }: Props) {
  const [idx, setIdx] = useState(0);
  const [hoveredImg, setHoveredImg] = useState<string | null>(null);
  const [prevImg, setPrevImg] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollTo = (i: number) => {
    const n = Math.max(0, Math.min(i, packages.length - 1));
    setIdx(n);
    const card = trackRef.current?.children[n] as HTMLElement;
    card?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  const handleHover = (img: string | null) => {
    if (img) {
      setPrevImg(hoveredImg);
      setHoveredImg(img);
    } else {
      setPrevImg(hoveredImg);
      setHoveredImg(null);
      setTimeout(() => setPrevImg(null), 900);
    }
  };

  return (
    <section className="mt-18 relative overflow-hidden">
      {/* Previous bg — fades out */}
      {prevImg && (
        <div
          key={prevImg + "_prev"}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${prevImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0,
            transition: "cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      )}

      {/* Current bg — fades in */}
      {hoveredImg && (
        <div
          key={hoveredImg + "_curr"}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${hoveredImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.72,
            transition: "cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      )}

      {/* Frosted overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "rgba(253,250,246,0.45)",
          opacity: hoveredImg ? 1 : 0,
          transition: "cubic-bezier(0.4,0,0.2,1)",
        }}
      />

      <div className="relative z-10 px-5 md:px-12 max-w-7xl mx-auto py-8 pb-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-[0.28em] uppercase text-[#C8392B] mb-2">
              Handpicked for you
            </p>
            <h2
              className="font-display font-bold"
              style={{
                fontSize: "clamp(1.6rem,3.5vw,2.4rem)",
                letterSpacing: "-0.02em",
                color: "var(--fg)",
              }}
            >
              For This Summer
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/packages"
              className="text-[11px] tracking-[0.12em] uppercase mr-3"
              style={{ color: "var(--fg-2)" }}
            >
              All Tours →
            </Link>
            <button
              onClick={() => scrollTo(idx - 1)}
              disabled={idx === 0}
              className="w-8 h-8 flex items-center justify-center transition-all disabled:opacity-20"
              style={{
                border: "1px solid var(--bd)",
                background: "var(--bg)",
                color: "var(--fg-2)",
              }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => scrollTo(idx + 1)}
              disabled={idx === packages.length - 1}
              className="w-8 h-8 flex items-center justify-center transition-all disabled:opacity-20"
              style={{
                border: "1px solid var(--bd)",
                background: "var(--bg)",
                color: "var(--fg-2)",
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-3"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {packages.map((pkg, i) => (
            <PkgCard
              key={pkg.id}
              pkg={pkg}
              cardIndex={i}
              onClick={() => setIdx(i)}
              onHover={handleHover}
            />
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-5">
          {packages.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? "24px" : "6px",
                height: "6px",
                background: i === idx ? "#C8392B" : "var(--bd-2)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PkgCard({
  pkg,
  cardIndex,
  onClick,
  onHover,
}: {
  pkg: Package;
  cardIndex: number;
  onClick: () => void;
  onHover: (img: string | null) => void;
}) {
  const [hovered, setHovered] = useState(false);

  // ── Summer label: pick from pool by card index, or use pkg-level override ──
  const summerLabel =
    (pkg as any).summerLabel || SUMMER_LABELS[cardIndex % SUMMER_LABELS.length];

  // disc kept for reference but no longer rendered — replaced by summer label
  // const disc = pkg.price.originalPrice
  //   ? Math.round(
  //       ((pkg.price.originalPrice - pkg.price.perPerson) /
  //         pkg.price.originalPrice) *
  //         100,
  //     )
  //   : 0;

  const handleEnter = () => {
    setHovered(true);
    onHover(pkg.images.hero);
  };
  const handleLeave = () => {
    setHovered(false);
    onHover(null);
  };

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="group shrink-0 w-[270px] md:w-[300px] overflow-hidden transition-all duration-400"
      style={{
        scrollSnapAlign: "start",
        background: "#FDFAF6",
        border: "1px solid var(--bd)",
        borderColor: hovered ? "rgba(200,57,43,0.25)" : "var(--bd)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 48px rgba(200,57,43,0.13), 0 4px 16px rgba(0,0,0,0.08)"
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={pkg.images.hero}
          alt={pkg.title}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? "scale(1.07)" : "scale(1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Summer offer label — replaces discount % badge */}
        <span
          className="absolute top-3 left-3 text-white text-[9px] font-bold tracking-wider px-2 py-0.5 uppercase flex items-center gap-1"
          style={{ background: "#C8392B" }}
        >
          ☀︎ {summerLabel}
        </span>

        {pkg.availability === "limited" && (
          <span className="absolute top-3 right-3 bg-amber-500 text-black text-[9px] font-bold px-2 py-0.5 uppercase">
            Limited
          </span>
        )}
        <div className="absolute bottom-3 left-3 bg-black/55 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 flex items-center gap-1">
          <Clock size={9} /> {pkg.duration.nights}N/{pkg.duration.days}D
        </div>
      </div>

      {/* Body */}
      <div className="p-4" style={{ background: "#FDFAF6" }}>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#C8392B] mb-1">
          {pkg.destination}
        </p>
        <h3
          className="font-display font-bold text-[1rem] leading-snug mb-1"
          style={{ color: "var(--fg)" }}
        >
          {pkg.title}
        </h3>
        <p
          className="text-[11px] mb-3 line-clamp-2"
          style={{ color: "var(--fg-3)" }}
        >
          {pkg.tagline}
        </p>

        <div
          className="flex items-center gap-3 text-[10px] mb-3 pb-3"
          style={{
            borderBottom: "1px solid var(--bd)",
            color: "var(--fg-3)",
          }}
        >
          <span className="flex items-center gap-1">
            <Users size={9} /> {pkg.groupSize.min}–{pkg.groupSize.max}
          </span>
          {pkg.rating && (
            <span className="flex items-center gap-1">
              <Star size={9} className="text-amber-500 fill-amber-500" />
              {pkg.rating} ({pkg.reviewCount})
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* <div>
            {pkg.price.originalPrice && (
              <p
                className="text-[10px] line-through"
                style={{ color: "var(--fg-3)" }}
              >
                {fmt(pkg.price.originalPrice)}
              </p>
            )}
            <p className="text-[15px] font-bold" style={{ color: "var(--fg)" }}>
              {fmt(pkg.price.perPerson)}{" "}
              <span
                className="text-[10px] font-normal"
                style={{ color: "var(--fg-3)" }}
              >
                / person
              </span>
            </p>
          </div> */}
          <span
            className="text-white text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 transition-colors"
            style={{ background: hovered ? "#A52E22" : "#C8392B" }}
          >
            Book
          </span>
        </div>
      </div>
    </Link>
  );
}
