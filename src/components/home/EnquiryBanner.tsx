"use client";
import { useState } from "react";
import Link from "next/link";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "9881203607";
const WA_MESSAGE = encodeURIComponent(
  "Hi TravelWell Delight! I'm interested in planning a trip. Can you help me?",
);
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export default function EnquiryBanner() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section className="relative py-20 mt-2 overflow-hidden bg-[#f5f4f3]">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1920&q=75"
          alt=""
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f4f3]/90 via-[#f5f4f3]/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-12 grid md:grid-cols-2 gap-12 items-center">
        {/* LEFT */}
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-[#C8392B] mb-3">
            Need Help?
          </p>

          <h2
            className="font-display font-black text-[#2B2B2B] mb-4"
            style={{
              fontSize: "clamp(1.8rem,4vw,2.8rem)",
              letterSpacing: "-0.02em",
            }}
          >
            How can we help you,
            <br />
            Get in touch with our team
          </h2>

          <p className="text-[13px] text-[#6B5E4B] leading-relaxed mb-6 max-w-md">
            If you have any concerns or need help for your upcoming trip, feel
            free to reach out. We're here for you 24/7.
          </p>

          <div className="flex flex-wrap gap-3">
            {/* Enquire button */}
            <Link
              href="/enquiry"
              className="bg-[#C8392B] hover:bg-[#a82d21] text-white text-[11px] font-bold tracking-[0.15em] uppercase px-7 py-3.5 transition-colors"
            >
              Enquire
            </Link>

            {/* WhatsApp button */}
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white text-[11px] font-bold tracking-[0.15em] uppercase px-7 py-3.5 transition-colors group"
            >
              {/* WhatsApp SVG icon */}
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="bg-white/60 backdrop-blur-md border border-[#E8DCCB] p-6">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B5E4B] mb-4">
            Get travel inspiration
          </p>

          {sent ? (
            <p className="text-[13px] text-[#C8392B]">
              ✓ You're in! Watch your inbox for curated picks.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-white/80 border border-[#E8DCCB] text-[#2B2B2B] text-[13px] px-4 py-3 placeholder-[#6B5E4B]/50 outline-none focus:border-[#C8392B] transition-colors"
              />
              <button
                onClick={() => {
                  if (email) setSent(true);
                }}
                className="bg-[#C8392B] hover:bg-[#b38755] text-white text-[11px] font-bold tracking-[0.18em] uppercase py-3 transition-colors"
              >
                Subscribe to Picks
              </button>
              <p className="text-[10px] text-[#6B5E4B]/70 text-center">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
