import Link from "next/link";
import { Instagram, Facebook, Linkedin, Mail } from "lucide-react";

const SOCIALS = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/travelwelldelightpvtltd/",
    label: "Instagram",
  },
  {
    icon: Facebook,
    href: "https://facebook.com/travelwelldelight",
    label: "Facebook",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/company/travelwell-delight-pvt-ltd/",
    label: "LinkedIn",
  },
  { icon: Mail, href: "mailto:travelwelldelight@gmail.com", label: "Email" },
];

const COLUMNS = [
  {
    title: "Explore",
    links: [
      ["Tours", "/packages"],
      ["Destinations", "/destinations"],
      ["About Us", "/about"],
    ],
  },
  {
    title: "Plan",
    links: [
      ["Trip Planner", "/planner"],
      ["Contact", "/enquiry"],
      ["Blog", "/blog"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/terms"],
      ["Terms", "/terms"],
      ["Refunds", "/terms"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#f5f4f3] border-t border-[#E8DCCB] pt-14 pb-8 px-5 md:px-10 mt-0">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {/* ── Brand column ── */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <img
              src="/logo.png"
              alt="TravelWell Delight"
              className="h-10 w-auto object-contain"
            />
            <div>
              <p
                className="text-[13px] font-semibold text-[#2B2B2B]"
                style={{ fontFamily: "'Playfair Display',serif" }}
              >
                TravelWell
              </p>
              <p className="text-[9px] tracking-[0.28em] uppercase text-[#6B5E4B]">
                Delight
              </p>
            </div>
          </div>

          <p className="text-[12px] text-[#6B5E4B] leading-relaxed max-w-[220px]">
            Curated holidays. Real itineraries. Zero tourist traps.
          </p>

          {/* Social icons */}
          <div className="flex gap-3 mt-5">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={label}
                className="w-7 h-7 border border-[#E8DCCB] flex items-center justify-center text-[#6B5E4B] hover:text-white hover:bg-[#C8392B] hover:border-[#C8392B] transition-all duration-200"
              >
                <Icon size={13} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* ── Link columns ── */}
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B5E4B] mb-4 font-semibold">
              {col.title}
            </p>
            <div className="flex flex-col gap-2.5">
              {col.links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[13px] text-[#6B5E4B] hover:text-[#C8392B] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-[#E8DCCB] flex flex-col md:flex-row justify-between gap-2">
        <p className="text-[11px] text-[#6B5E4B]">
          © {new Date().getFullYear()} TravelWell Delight. All rights reserved.
        </p>
        <p className="text-[11px] text-[#6B5E4B]">
          Curated in India · Delivered worldwide
        </p>
      </div>
    </footer>
  );
}
