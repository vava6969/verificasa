import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Video, Users, FileText, BadgeCheck, Lock, MapPin, Sparkles,
  Search, ClipboardCheck, Camera, Handshake, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const PILLARS = [
  { icon: Video, title: "Tur Interactiv AI 360°", desc: "Generăm tururi virtuale din pozele proprietății, astfel încât chiriașii explorează locul online — economisind timp pentru toți." },
  { icon: ShieldCheck, title: "Verificare fizică pe teren", desc: "Agenții noștri inspectează personal fiecare proprietate și emit un raport cu stare, zgomot, presiune apă și acte." },
  { icon: Users, title: "Selectarea clienților potriviți", desc: "Filtrăm chiriașii și cumpărătorii calificați, ca să nu pierzi timp cu vizionări inutile." },
  { icon: Lock, title: "Comisioane corecte & siguranță", desc: "Condiții transparente, fără taxe ascunse sau garanții exagerate. Pachete avantajoase pentru vânzare și închiriere." },
];

const STEPS = [
  { icon: Search, title: "1. Cauți sau publici", desc: "Răsfoiești anunțuri verificate sau îți publici propria proprietate în câteva minute." },
  { icon: ClipboardCheck, title: "2. Inspecție pe teren", desc: "Echipa VerifiCasa inspectează fizic locul și verifică actele pentru transparență 100%." },
  { icon: Camera, title: "3. Tur 360° & promovare", desc: "Realizăm turul interactiv și poze, apoi îți propunem pachetul ideal de promovare." },
  { icon: Handshake, title: "4. Contract & chei", desc: "Selectăm clientul potrivit și facilităm contractul și predarea — fără bătăi de cap." },
];

export default function About() {
  return (
    <div className="bg-secondary/30">
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.span initial="hidden" animate="show" variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> VerifiCasa · Agenție imobiliară
          </motion.span>
          <motion.h1 initial="hidden" animate="show" variants={fadeUp} className="mt-6 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            Chirii & vânzări verificate, fără surprize.
          </motion.h1>
          <motion.p initial="hidden" animate="show" variants={fadeUp} className="mx-auto mt-5 max-w-2xl rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-base text-white/85 backdrop-blur-md sm:text-lg">
            VerifiCasa este o platformă imobiliară și agenție care combină tehnologia AI cu inspecții fizice reale.
            Economisim timpul tău, oferim transparență totală și construim încredere între proprietari și chiriași/cumpărători.
          </motion.p>
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full gradient-mint text-navy shadow-soft hover:opacity-90">
              <Link to="/search">Caută proprietăți <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10">
              <Link to="/owner">Publică un anunț</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald">Ce facem</p>
          <h2 className="mt-1 font-heading text-3xl font-bold text-navy dark:text-foreground">Tehnologie + oameni pe teren</h2>
        </div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <motion.div key={i} variants={fadeUp} className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-soft dark:bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-soft text-emerald"><p.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 font-heading text-lg font-bold text-navy dark:text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* STEPS */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald">Cum colaborăm</p>
          <h2 className="mt-1 font-heading text-3xl font-bold text-navy dark:text-foreground">Pași simpli, de la anunț la chei</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="relative rounded-2xl border border-border bg-white p-6 shadow-soft dark:bg-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-emerald"><s.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-heading text-base font-bold text-navy dark:text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-3xl border border-border bg-white p-8 shadow-soft sm:grid-cols-3 dark:bg-card">
          {[
            { icon: BadgeCheck, t: "Inspecții fizice", d: "Rapoarte reale cu zgomot (dB), presiune apă și acte." },
            { icon: FileText, t: "Contracte transparente", d: "Comisioane corecte, fără taxe ascunse." },
            { icon: MapPin, t: "Acoperire Iași & Huși", d: "Ne extindem în toată România." },
          ].map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-soft text-emerald"><b.icon className="h-5 w-5" /></span>
              <div>
                <p className="font-heading text-sm font-bold text-navy dark:text-foreground">{b.t}</p>
                <p className="text-xs text-muted-foreground">{b.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}