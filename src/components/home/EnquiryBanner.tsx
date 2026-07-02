"use client";
import { useState } from "react";
import Link from "next/link";

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
        {/* LIGHT overlay */}
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
            free to reach out. We’re here for you 24/7.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/enquiry"
              className="bg-[#C8392B] hover:bg-[#c34119] text-white text-[11px] font-bold tracking-[0.15em] uppercase px-7 py-3.5 transition-colors"
            >
              Enquire
            </Link>
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
