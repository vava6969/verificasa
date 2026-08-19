import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Headset, ShieldAlert, Handshake, Megaphone, Briefcase,
  Scale, Building2, Mail, Copy, Check, ExternalLink, AlertTriangle,
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
    bg: "/images/generated/illo-contact-v1.png",
  },
  {
    email: "reclamatii@verificasa.ro",
    label: "Reclamații & Sesizări",
    desc: "Raportează o problemă, anunț fraudulos sau comportament abuziv pe platformă.",
    icon: ShieldAlert,
    badge: "Încredere & Siguranță",
    accent: "rose",
    bg: "/images/generated/illo-reclamatii-v1.png",
  },
  {
    email: "parteneri@verificasa.ro",
    label: "Parteneri & B2B",
    desc: "Colaborări, integrări și oportunități de parteneriat strategic.",
    icon: Handshake,
    badge: "B2B",
    accent: "blue",
    bg: "/images/generated/illo-parteneri-v1.png",
  },
  {
    email: "marketing@verificasa.ro",
    label: "Marketing & Media",
    desc: "Campanii, PR, sponsorizări și solicitări de presă sau interviuri.",
    icon: Megaphone,
    badge: "Media",
    accent: "amber",
    bg: "/images/generated/illo-marketing-v1.png",
  },
  {
    email: "cariere@verificasa.ro",
    label: "Cariere & Angajări",
    desc: "Aplicații, CV-uri și poziții deschise în echipa VerifiCasa.",
    icon: Briefcase,
    badge: "Recrutare",
    accent: "violet",
    bg: "/images/generated/illo-cariere-v1.png",
  },
  {
    email: "legal@verificasa.ro",
    label: "Departament Legal & GDPR",
    desc: "Solicitări privind protecția datelor, ANPC, termeni legali și conformitate.",
    icon: Scale,
    badge: "Legal",
    accent: "slate",
    bg: "/images/generated/illo-legal-v1.png",
  },
  {
    email: "birou@verificasa.ro",
    label: "Secretariat / Birou",
    desc: "Corespondență oficială, facturare și documente administrative.",
    icon: Building2,
    badge: "Admin",
    accent: "cyan",
    bg: "/images/generated/illo-birou-v1.png",
  },
];

const ACCENTS = {
  emerald: { iconBg: "bg-emerald-soft text-emerald", badge: "bg-emerald-soft text-emerald border-emerald/20" },
  rose:    { iconBg: "bg-destructive/10 text-destructive", badge: "bg-destructive/10 text-destructive border-destructive/20" },
  blue:    { iconBg: "bg-navy/10 text-navy dark:bg-white/10 dark:text-foreground", badge: "bg-navy/10 text-navy border-navy/20 dark:bg-white/10 dark:text-foreground dark:border-white/20" },
  amber:   { iconBg: "bg-gold-soft text-gold-deep", badge: "bg-gold-soft text-gold-deep border-gold/20" },
  violet:  { iconBg: "bg-secondary text-muted-foreground", badge: "bg-secondary text-muted-foreground border-border" },
  slate:   { iconBg: "bg-secondary text-muted-foreground", badge: "bg-secondary text-muted-foreground border-border" },
  cyan:    { iconBg: "bg-secondary text-muted-foreground", badge: "bg-secondary text-muted-foreground border-border" },
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
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card p-5 shadow-soft transition hover:border-gold/50 ${isHero ? "sm:col-span-2" : ""}`}
    >
      {item.bg && (
        <img
          src={item.bg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 -right-6 z-0 h-36 w-36 object-contain opacity-[0.15] transition group-hover:opacity-[0.22] dark:opacity-[0.22] dark:group-hover:opacity-[0.3] sm:h-40 sm:w-40"
        />
      )}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${a.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`inline-flex items-center rounded-sm border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${a.badge}`}>
          {item.badge}
        </span>
      </div>

      <div className="relative z-10">
        <h3 className={`font-heading font-bold text-navy dark:text-foreground ${isHero ? "text-lg" : "text-base"}`}>
          {item.label}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-between gap-2 pt-1">
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
        <span className="absolute -top-2 right-3 z-20 rounded-sm bg-emerald px-2 py-0.5 text-[10px] font-bold text-white shadow">
          Copiat!
        </span>
      )}
    </motion.a>
  );
}

function GroupHeader({ icon: Icon, title }) {
  return (
    <div className="col-span-full mb-1 mt-2 flex items-center gap-2">
      <h2 className="kicker">
        {title}
      </h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function EmailDirectory() {
  const hero = EMAILS.filter((e) => e.hero);
  const support = EMAILS.filter((e) => !e.hero && (e.badge === "Încredere & Siguranță"));
  const business = EMAILS.filter((e) => ["B2B", "Media"].includes(e.badge));
  const depts = EMAILS.filter((e) => ["Recrutare", "Legal", "Admin"].includes(e.badge));

  return (
    <div className="relative space-y-6 overflow-hidden rounded-lg p-4 sm:p-6">
      <div className="relative space-y-6">
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
        className="rounded-lg border border-gold/30 bg-gold-soft p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold-soft text-gold-deep">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-bold text-gold-deep">
              ⚠️ Atenție la phishing — Verifică mereu expeditorul
            </p>
            <ul className="space-y-1.5 text-gold-deep/90">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-mono text-emerald">✓</span>
                <span><strong>Singurele adrese oficiale</strong> sunt cele listate mai sus pe domeniul <span className="font-mono font-semibold">verificasa.ro</span>. Orice alt email este fals și înșelătorie.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-mono text-emerald">✓</span>
                <span>Emailurile de sistem (notificări, aprobări, cereri) se vor primi <strong>exclusiv</strong> de la <span className="font-mono font-semibold">birou@verificasa.ro</span>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-mono text-emerald">✓</span>
                <span>Conturile oficiale de social media sunt <strong>@verificasaro</strong> pe Instagram și <strong>verificasaro</strong> pe TikTok. Nu solicităm niciodată parole sau date bancare prin email sau mesaje.</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}