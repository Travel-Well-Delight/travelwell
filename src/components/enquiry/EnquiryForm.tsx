"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  MessageSquare,
  Send,
  Check,
  AlertCircle,
  ChevronRight,
  Clock,
  HeadphonesIcon,
  Sparkles,
  Package,
} from "lucide-react";

const BUDGETS = [
  "Under ₹30,000 per person",
  "₹30,000 – ₹60,000 per person",
  "₹60,000 – ₹1,00,000 per person",
  "₹1,00,000 – ₹2,00,000 per person",
  "Above ₹2,00,000 per person",
];

const TRIP_TYPES = [
  "Honeymoon",
  "Family Holiday",
  "Solo Travel",
  "Group Tour",
  "Adventure",
  "Cultural & Heritage",
  "Beach & Relaxation",
  "Business + Leisure",
];
const SERVICE_LABELS: Record<string, string> = {
  package: "Complete Package",
  flight: "Flight Only",
  hotel: "Hotel Only",
  "flight-hotel": "Flight + Hotel",
};

const FAQS = [
  {
    q: "How soon will I get a response?",
    a: "Our travel specialists reply within 4 hours on business days. For urgent queries, WhatsApp is the fastest.",
  },
  {
    q: "Is the consultation free?",
    a: "Yes — completely free. No booking fees, no hidden charges. We only earn when you travel.",
  },
  {
    q: "Can you customise an existing package?",
    a: "Absolutely. Every itinerary is 100% flexible. Tell us what you want changed and we'll rebuild it around you.",
  },
  {
    q: "Do you handle visa assistance?",
    a: "No, not a complete visa assistance but we provide the visa requirement checks for every package",
  },
];

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Builds a friendly, human-sounding WhatsApp prefill message from
 * whatever the user has filled in so far. Falls back to a generic
 * greeting if the form is still empty.
 */
function buildWhatsAppMessage(form: {
  firstName: string;
  lastName: string;
  destination: string;
  tripType: string;
  budget: string;
  adults: string;
  children: string;
  travelDate: string;
  duration: string;
}) {
  const parts: string[] = [];

  const name = form.firstName ? form.firstName : "";
  parts.push(name ? `Hi, I'm ${name}.` : "Hi!");

  if (form.destination) {
    parts.push(`I'm interested in planning a trip to ${form.destination}.`);
  } else {
    parts.push("I'd like help planning a trip.");
  }

  if (form.tripType) parts.push(`Trip type: ${form.tripType}.`);

  if (form.travelDate) {
    const [year, month] = form.travelDate.split("-");
    if (year && month) {
      const monthName = new Date(
        Number(year),
        Number(month) - 1,
      ).toLocaleString("en-IN", { month: "long" });
      parts.push(`Looking to travel around ${monthName} ${year}.`);
    }
  }

  if (form.duration) parts.push(`Duration: ${form.duration}.`);

  const adultsNum = Number(form.adults) || 0;
  const childrenNum = Number(form.children) || 0;
  if (adultsNum || childrenNum) {
    const group: string[] = [];
    if (adultsNum)
      group.push(`${adultsNum} adult${adultsNum !== 1 ? "s" : ""}`);
    if (childrenNum)
      group.push(`${childrenNum} child${childrenNum !== 1 ? "ren" : ""}`);
    parts.push(`Group: ${group.join(", ")}.`);
  }

  if (form.budget) parts.push(`Budget: ${form.budget}.`);

  parts.push("Could you help me with a quote?");

  return parts.join(" ");
}

export default function EnquiryFormFull() {
  const [status, setStatus] = useState<Status>("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    destination: "",
    tripType: "",
    budget: "",
    adults: "2",
    children: "0",
    travelDate: "",
    duration: "",
    fromDate: "",
    toDate: "",
    serviceType: "",
    message: "",
  });

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const nav = document.querySelector("header") as HTMLElement;
    if (!nav) return;

    nav.style.background = "rgba(253,246,237,0.97)";
    nav.style.backdropFilter = "blur(8px)";
    nav.style.borderBottom = "1px solid rgba(200,57,43,0.12)";

    const links = nav.querySelectorAll("a, button") as NodeListOf<HTMLElement>;
    links.forEach((el) => {
      el.dataset.origColor = el.style.color;
      el.style.color = "#1C0A00";

      if (el.tagName === "BUTTON") {
        el.dataset.origBorder = el.style.borderColor;
        el.style.borderColor = "rgba(28,10,0,0.3)";
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          destination: form.destination,
          tripType: form.tripType,
          budget: form.budget,
          groupSize: { adults: +form.adults, children: +form.children },
          travelDate: form.travelDate,
          fromDate: form.fromDate || undefined,
          toDate: form.toDate || undefined,
          serviceType: form.serviceType || undefined,
          duration: form.duration,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };
  const searchParams = useSearchParams();
  useEffect(() => {
    const dest = searchParams.get("destination") || "";
    const date = searchParams.get("travelDate") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const service = searchParams.get("service") || "";
    if (dest) set("destination", dest);
    if (date) set("travelDate", date);

    if (from) {
      set("fromDate", from);
      // Extract month from dd/mm/yy → convert to yyyy-MM for the month input
      const [, mm, yy] = from.split("/");

      if (mm && yy) set("travelDate", `20${yy}-${mm}`);
    }
    if (to) set("toDate", to);
    if (from && to) {
      const [fdd, fmm, fyy] = from.split("/");
      const [tdd, tmm, tyy] = to.split("/");
      const fromD = new Date(`20${fyy}-${fmm}-${fdd}`);
      const toD = new Date(`20${tyy}-${tmm}-${tdd}`);
      const nights = Math.round(
        (toD.getTime() - fromD.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (nights > 0) {
        if (nights <= 4) set("duration", "3–4 nights");
        else if (nights <= 6) set("duration", "5–6 nights");
        else if (nights <= 8) set("duration", "7–8 nights");
        else if (nights <= 12) set("duration", "9–12 nights");
        else set("duration", "13+ nights");
      }
    }
    if (service) set("serviceType", service);
  }, []);
  // runs once on mount
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9881203607";

  // Live WhatsApp message — rebuilds as the user fills in the form
  const waMessage = buildWhatsAppMessage(form);
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  /* ── Success screen ── */
  if (status === "sent") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full border-2 border-[#E8621A]/30 bg-[#E8621A]/5 flex items-center justify-center mx-auto mb-8">
            <Check size={32} strokeWidth={1.5} className="text-[#E8621A]" />
          </div>
          <h2 className="font-display text-4xl text-[#1C0A00] mb-4">
            We've got it!
          </h2>
          <p className="text-[#6B5B45] text-sm leading-relaxed mb-2">
            Our travel specialist will reach out within 4 hours.
          </p>
          <p className="text-[#A8967E] text-sm mb-10">
            Watch{" "}
            <span className="text-[#6B5B45] font-medium">{form.email}</span> and{" "}
            <span className="text-[#6B5B45] font-medium">{form.phone}</span>
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-[11px] font-bold tracking-[0.2em] uppercase px-8 py-4 rounded-sm transition-colors"
          >
            <WhatsAppIcon size={16} />
            Chat With Us Instead
          </a>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-14">
      {/* ── LEFT: FORM ── */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Your details */}
        {(form.fromDate || form.toDate || form.serviceType) && (
          <div className="flex flex-wrap gap-2 p-4 bg-[#F5F0E8] border border-[rgba(107,45,14,0.12)] rounded-sm">
            <p className="w-full text-[10px] tracking-[0.2em] uppercase text-[#A8967E] mb-1">
              Trip details from your search
            </p>
            {form.fromDate && (
              <span className="flex items-center gap-1.5 text-xs text-[#6B5B45] bg-white border border-[rgba(107,45,14,0.12)] px-3 py-1.5 rounded-sm">
                <Calendar
                  size={11}
                  strokeWidth={1.5}
                  className="text-[#C8392B]"
                />
                From: {form.fromDate}
              </span>
            )}
            {form.toDate && (
              <span className="flex items-center gap-1.5 text-xs text-[#6B5B45] bg-white border border-[rgba(107,45,14,0.12)] px-3 py-1.5 rounded-sm">
                <Calendar
                  size={11}
                  strokeWidth={1.5}
                  className="text-[#E8621A]"
                />
                To: {form.toDate}
              </span>
            )}
            {form.serviceType && (
              <span className="flex items-center gap-1.5 text-xs text-[#6B5B45] bg-white border border-[rgba(107,45,14,0.12)] px-3 py-1.5 rounded-sm">
                <Package
                  size={11}
                  strokeWidth={1.5}
                  className="text-[#C8392B]"
                />
                {SERVICE_LABELS[form.serviceType] ?? form.serviceType}
              </span>
            )}
          </div>
        )}
        <FormSection
          icon={<User size={12} strokeWidth={1.5} />}
          title="Your details"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name" required>
              <input
                type="text"
                required
                placeholder="Arjun"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Last name" required>
              <input
                type="text"
                required
                placeholder="Sharma"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field
              label="Email address"
              required
              icon={
                <Mail size={12} strokeWidth={1.5} className="text-[#A8967E]" />
              }
            >
              <input
                type="email"
                required
                placeholder="arjun@email.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field
              label="Phone number"
              required
              icon={
                <Phone size={12} strokeWidth={1.5} className="text-[#A8967E]" />
              }
            >
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </FormSection>

        <Divider />

        {/* Trip details */}
        <FormSection
          icon={<MapPin size={12} strokeWidth={1.5} />}
          title="Trip details"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Destination" required>
              <input
                type="text"
                required
                placeholder="e.g. Kerala, Bali, Maldives..."
                value={form.destination}
                onChange={(e) => set("destination", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Trip type">
              <div className="relative">
                <select
                  value={form.tripType}
                  onChange={(e) => set("tripType", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select trip type</option>
                  {TRIP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[#A8967E] pointer-events-none"
                />
              </div>
            </Field>
            <Field
              label="Travel month"
              icon={
                <Calendar
                  size={12}
                  strokeWidth={1.5}
                  className="text-[#A8967E]"
                />
              }
            >
              <input
                type="month"
                value={form.travelDate}
                onChange={(e) => set("travelDate", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Duration">
              <div className="relative">
                <select
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  className={selectCls}
                >
                  <option value="">How many nights?</option>
                  {[
                    "3–4 nights",
                    "5–6 nights",
                    "7–8 nights",
                    "9–12 nights",
                    "13+ nights",
                  ].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[#A8967E] pointer-events-none"
                />
              </div>
            </Field>
          </div>
        </FormSection>

        <Divider />

        {/* Group & Budget */}
        <FormSection
          icon={<Users size={12} strokeWidth={1.5} />}
          title="Group & budget"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Adults">
              <div className="relative">
                <select
                  value={form.adults}
                  onChange={(e) => set("adults", e.target.value)}
                  className={selectCls}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} adult{n !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[#A8967E] pointer-events-none"
                />
              </div>
            </Field>
            <Field label="Children">
              <div className="relative">
                <select
                  value={form.children}
                  onChange={(e) => set("children", e.target.value)}
                  className={selectCls}
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} child{n !== 1 ? "ren" : ""}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[#A8967E] pointer-events-none"
                />
              </div>
            </Field>
            <Field label="Budget per person">
              <div className="relative">
                <select
                  value={form.budget}
                  onChange={(e) => set("budget", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select range</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[#A8967E] pointer-events-none"
                />
              </div>
            </Field>
          </div>

          {/* Budget bar indicator */}
          <div className="mt-5 grid grid-cols-5 gap-1.5">
            {["₹30k", "₹60k", "₹1L", "₹2L", "₹2L+"].map((label, i) => (
              <div key={i} className="text-center">
                <div
                  className={`h-0.5 rounded-full mb-1.5 transition-all duration-300 ${
                    form.budget && BUDGETS.indexOf(form.budget) >= i
                      ? "bg-[#E8621A]"
                      : "bg-[rgba(107,45,14,0.12)]"
                  }`}
                />
                <span className="text-[9px] text-[#A8967E]">{label}</span>
              </div>
            ))}
          </div>
        </FormSection>

        <Divider />

        {/* Message */}
        <FormSection
          icon={<MessageSquare size={12} strokeWidth={1.5} />}
          title="Anything else?"
        >
          <textarea
            rows={4}
            placeholder="Special occasions, dietary needs, dream experiences, accessibility requirements..."
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            className={`${inputCls} resize-none`}
          />
          <p className="text-[11px] text-[#A8967E] mt-2">
            The more you share, the better we can tailor your trip.
          </p>
        </FormSection>

        {/* Error */}
        {status === "error" && (
          <div className="flex items-start gap-3 text-red-600 border border-red-300 bg-red-50 px-4 py-3 rounded-sm">
            <AlertCircle
              size={15}
              strokeWidth={1.5}
              className="shrink-0 mt-0.5"
            />
            <div>
              <p className="font-medium text-sm">Something went wrong.</p>
              <p className="text-red-400 text-xs mt-0.5">
                Please try{" "}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-red-600"
                >
                  WhatsApp instead
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {/* Submit row */}
        <div className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex items-center justify-center gap-2.5 bg-[#C8392B] hover:bg-[#A52E22] text-white text-[11px] font-bold tracking-[0.2em] uppercase px-10 py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] rounded-sm"
            >
              {status === "sending" ? (
                <>
                  <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={13} strokeWidth={2} />
                  Send Enquiry
                </>
              )}
            </button>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-[11px] font-bold tracking-[0.2em] uppercase px-10 py-4 transition-colors min-w-[180px] rounded-sm"
            >
              <WhatsAppIcon size={15} />
              Chat on WhatsApp
            </a>
          </div>
          <p className="text-[#A8967E] text-[11px] leading-relaxed">
            Free consultation · No booking fees
            <br />
            Reply within 4 hours on business days
          </p>
        </div>
      </form>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        {/* WhatsApp quick-chat card */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-[#25D366]/30 bg-[#25D366]/5 rounded-sm p-5 hover:bg-[#25D366]/10 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
              <WhatsAppIcon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[#1C0A00] text-sm font-medium">
                Prefer to chat?
              </p>
              <p className="text-[#A8967E] text-[11px]">
                Usually replies in minutes
              </p>
            </div>
          </div>
          <p className="text-[#6B5B45] text-xs leading-relaxed">
            We'll open WhatsApp with your trip details already filled in — just
            hit send.
          </p>
        </a>

        {/* Why TravelWell */}
        <div className="border border-[rgba(107,45,14,0.12)] bg-white rounded-sm p-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#A8967E] mb-5">
            Why TravelWell Delight
          </p>
          <div className="space-y-4">
            {[
              {
                icon: Sparkles,
                title: "Handcrafted itineraries",
                sub: "Every route personally designed",
              },
              {
                icon: HeadphonesIcon,
                title: "Real human support",
                sub: "No bots, ever",
              },
              {
                icon: Clock,
                title: "4-hour reply guarantee",
                sub: "Mon–Sat, 9am – 7pm IST",
              },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded border border-[#E8621A]/20 bg-[#E8621A]/5 flex items-center justify-center shrink-0">
                  <Icon
                    size={14}
                    strokeWidth={1.5}
                    className="text-[#E8621A]"
                  />
                </div>
                <div>
                  <p className="text-[#1C0A00] text-sm font-medium">{title}</p>
                  <p className="text-[#A8967E] text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ accordion */}
        <div className="border border-[rgba(107,45,14,0.12)] bg-white rounded-sm">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#A8967E] px-5 pt-5 pb-4 border-b border-[rgba(107,45,14,0.08)]">
            Common questions
          </p>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="border-b border-[rgba(107,45,14,0.06)] last:border-0"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left hover:bg-[#F5F0E8] transition-colors group"
              >
                <span className="text-[#6B5B45] text-xs leading-relaxed group-hover:text-[#1C0A00] transition-colors">
                  {faq.q}
                </span>
                <ChevronRight
                  size={12}
                  strokeWidth={1.5}
                  className={`text-[#A8967E] shrink-0 mt-0.5 transition-transform duration-200 ${
                    openFaq === i ? "rotate-90" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-[#6B5B45] text-xs leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ── Sub-components ── */

const inputCls =
  "w-full bg-white border border-[rgba(107,45,14,0.15)] text-[#1C0A00] text-sm px-4 py-3 outline-none focus:border-[#E8621A] transition-colors placeholder-[#A8967E] rounded-sm";

const selectCls =
  "w-full bg-white border border-[rgba(107,45,14,0.15)] text-[#1C0A00] text-sm px-4 py-3 outline-none focus:border-[#E8621A] transition-colors rounded-sm appearance-none pr-8";

function FormSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[#A8967E]">{icon}</span>
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#A8967E]">
          {title}
        </span>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  required = false,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] text-[#6B5B45] font-medium mb-1.5">
        {icon}
        {label}
        {required && <span className="text-[#C8392B] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[rgba(107,45,14,0.08)]" />;
}

function WhatsAppIcon({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.149-.149.297-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.05-.52-.099-.149-.668-1.612-.916-2.207-.242-.579-.487-.5-.668-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.05 3.133 4.97 4.27 2.92 1.137 2.92.758 3.445.71.524-.05 1.758-.718 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.04 2c-5.523 0-10 4.477-10 10 0 1.83.495 3.55 1.36 5.03L2 22l5.13-1.36A9.96 9.96 0 0 0 12.04 22c5.523 0 10-4.477 10-10S17.563 2 12.04 2zm0 18.5c-1.62 0-3.13-.45-4.42-1.24l-.31-.19-3.04.8.81-2.96-.2-.31a8.47 8.47 0 0 1-1.31-4.6c0-4.69 3.81-8.5 8.49-8.5 4.69 0 8.5 3.81 8.5 8.5s-3.81 8.5-8.5 8.5z" />
    </svg>
  );
}
