import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Headset, ShieldAlert, Handshake, Megaphone, Briefcase,
  Scale, Building2, Mail, Copy, Check, ExternalLink, AlertTriangle,
  BadgeCheck, Instagram,
} from "lucide-react";

const EMAILS = [
  {
    email: "contact@verificasa.ro",
    label: "Contact General",
    desc: "Întrebări generale, informații și direcționare către departamentul potrivit.",
    icon: Headset,
    badge: "Suport",
    accent: "emerald",
    hero: true,
  },
  {
    email: "reclamatii@verificasa.ro",
    label: "Reclamații & Sesizări",
    desc: "Raportează o problemă, anunț fraudulos sau comportament abuziv pe platformă.",
    icon: ShieldAlert,
    badge: "Încredere & Siguranță",
    accent: "rose",
  },
  {
    email: "parteneri@verificasa.ro",
    label: "Parteneri & B2B",
    desc: "Colaborări, integrări și oportunități de parteneriat strategic.",
    icon: Handshake,
    badge: "B2B",
    accent: "blue",
  },
  {
    email: "marketing@verificasa.ro",
    label: "Marketing & Media",
    desc: "Campanii, PR, sponsorizări și solicitări de presă sau interviuri.",
    icon: Megaphone,
    badge: "Media",
    accent: "amber",
  },
  {
    email: "cariere@verificasa.ro",
    label: "Cariere & Angajări",
    desc: "Aplicații, CV-uri și poziții deschise în echipa VerifiCasa.",
    icon: Briefcase,
    badge: "Recrutare",
    accent: "violet",
  },
  {
    email: "legal@verificasa.ro",
    label: "Departament Legal & GDPR",
    desc: "Solicitări privind protecția datelor, ANPC, termeni legali și conformitate.",
    icon: Scale,
    badge: "Legal",
    accent: "slate",
  },
  {
    email: "birou@verificasa.ro",
    label: "Secretariat / Birou",
    desc: "Corespondență oficială, facturare și documente administrative.",
    icon: Building2,
    badge: "Admin",
    accent: "cyan",
  },
];

const ACCENTS = {
  emerald: { ring: "ring-emerald/30", glow: "shadow-[0_10px_40px_-12px_rgba(0,168,89,0.45)]", iconBg: "bg-emerald-soft text-emerald", badge: "bg-emerald-soft text-emerald border-emerald/20" },
  rose:    { ring: "ring-rose-500/30", glow: "shadow-[0_10px_40px_-12px_rgba(225,80,80,0.4)]", iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300", badge: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/20" },
  blue:   { ring: "ring-blue-500/30", glow: "shadow-[0_10px_40px_-12px_rgba(37,99,235,0.4)]", iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300", badge: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20" },
  amber:  { ring: "ring-amber-500/30", glow: "shadow-[0_10px_40px_-12px_rgba(217,164,65,0.45)]", iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300", badge: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20" },
  violet: { ring: "ring-violet-500/30", glow: "shadow-[0_10px_40px_-12px_rgba(139,92,246,0.4)]", iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300", badge: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/20" },
  slate:  { ring: "ring-slate-500/30", glow: "shadow-[0_10px_40px_-12px_rgba(100,116,139,0.4)]", iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300", badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/20" },
  cyan:   { ring: "ring-cyan-500/30", glow: "shadow-[0_10px_40px_-12px_rgba(6,182,212,0.4)]", iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300", badge: "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/20" },
};

function EmailCard({ item, index }) {
  const [copied, setCopied] = useState(false);
  const Icon = item.icon;
  const a = ACCENTS[item.accent] || ACCENTS.emerald;
  const isHero = item.hero;

  const copy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) { /* ignore */ }
  };

  return (
    <motion.a
      href={`mailto:${item.email}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 2) * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-5 backdrop-blur-xl transition-shadow hover:border-gold/40 dark:border-white/10 dark:bg-white/[0.04] ${isHero ? "sm:col-span-2 " + a.glow : ""} ${a.ring} hover:ring-2`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${a.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${a.badge}`}>
          {item.badge}
        </span>
      </div>

      <div>
        <h3 className={`font-heading font-bold text-navy dark:text-foreground ${isHero ? "text-lg" : "text-base"}`}>
          {item.label}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <span className="flex items-center gap-1.5 truncate font-semibold text-emerald">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate text-sm">{item.email}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={copy}
            aria-label="Copiază adresa"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors hover:border-emerald/40 hover:text-emerald"
          >
            {copied ? <Check className="h-4 w-4 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors group-hover:border-emerald/40 group-hover:text-emerald">
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
      {copied && (
        <span className="absolute -top-2 right-3 rounded-full bg-emerald px-2 py-0.5 text-[10px] font-bold text-white shadow">
          Copiat!
        </span>
      )}
    </motion.a>
  );
}

function GroupHeader({ icon: Icon, title }) {
  return (
    <div className="col-span-full mb-1 mt-2 flex items-center gap-2">
      <Icon className="h-4 w-4 text-gold" />
      <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-navy dark:text-foreground">
        {title}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
    </div>
  );
}

export default function EmailDirectory() {
  const hero = EMAILS.filter((e) => e.hero);
  const support = EMAILS.filter((e) => !e.hero && (e.badge === "Încredere & Siguranță"));
  const business = EMAILS.filter((e) => ["B2B", "Media"].includes(e.badge));
  const depts = EMAILS.filter((e) => ["Recrutare", "Legal", "Admin"].includes(e.badge));

  return (
    <div className="space-y-6">
      {/* Hero email */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {hero.map((e, i) => <EmailCard key={e.email} item={e} index={i} />)}
      </div>

      {/* Direct support */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GroupHeader icon={ShieldAlert} title="Suport Direct & Siguranță" />
        {support.map((e, i) => <EmailCard key={e.email} item={e} index={i} />)}
      </div>

      {/* Business */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GroupHeader icon={Handshake} title="Business & Parteneriate" />
        {business.map((e, i) => <EmailCard key={e.email} item={e} index={i} />)}
      </div>

      {/* Departments */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GroupHeader icon={Building2} title="Departamente & Legal" />
        {depts.map((e, i) => <EmailCard key={e.email} item={e} index={i} />)}
      </div>

      {/* Security warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-amber-300/50 bg-amber-50/70 p-5 backdrop-blur-xl dark:border-amber-500/25 dark:bg-amber-500/[0.07]"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-bold text-amber-800 dark:text-amber-200">
              ⚠️ Atenție la phishing — Verifică mereu expeditorul
            </p>
            <ul className="space-y-1.5 text-amber-700/90 dark:text-amber-200/80">
              <li className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                <span><strong>Singurele adrese oficiale</strong> sunt cele listate mai sus pe domeniile <span className="font-mono font-semibold">verificasa.ro</span> și <span className="font-mono font-semibold">verificasa.site</span>. Orice alt email este fals și înșelătorie.</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                <span>Emailurile de sistem (notificări, aprobări, cereri) se vor primi <strong>exclusiv</strong> de la <span className="font-mono font-semibold">birou@verificasa.site</span>.</span>
              </li>
              <li className="flex items-start gap-2">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                <span>Conturile oficiale de social media sunt <strong>@verificasaro</strong> pe Instagram și <strong>verificasaro</strong> pe TikTok. Nu solicităm niciodată parole sau date bancare prin email sau mesaje.</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}