import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

// Iconță custom (glossy, transparentă) — același limbaj vizual ca restul site-ului,
// nu Lucide generic.
function iconImg(src) {
  return function IconImg({ className = "" }) {
    return <img src={src} alt="" className={`object-contain ${className}`} />;
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// All copy is bilingual — keyed by `lang` from CountryContext.
// Romanian content is provided verbatim as requested; English is a faithful translation.
const CONTENT = {
  ro: {
    hero_badge: "VerifiCasa · Platformă imobiliară verificată",
    hero_h: "Chirii & vânzări verificate, fără surprize.",
    hero_p1: "VerifiCasa este o platformă imobiliară unde proprietarii publică liber, iar noi verificăm fiecare anunț online înainte de publicare.",
    hero_p2: "Economisim timpul tău, oferim transparență totală și construim încredere între proprietari și chiriași/cumpărători.",
    cta_search: "Caută proprietăți",
    cta_list: "Publică un anunț",
    pillars_k: "Ce facem",
    pillars_h: "Verificare online, la fiecare anunț",
    pillars: [
      { icon: iconImg("/images/generated/icon-shield-check.png"), title: "Verificare online", desc: "Verificăm fiecare anunț înainte de publicare — poze, acte și preț — direct online, fără vizite pe teren." },
      { icon: iconImg("/images/generated/icon-gauge.png"), title: "Scor de încredere", desc: "Fiecare proprietate primește un scor calculat automat, ca să știi dintr-o privire cât de sigur este anunțul." },
      { icon: iconImg("/images/generated/icon-users-check.png"), title: "Selectarea clienților potriviți", desc: "Filtrăm chiriașii și cumpărătorii calificați, ca să nu pierzi timp cu vizionări inutile." },
      { icon: iconImg("/images/generated/icon-lock.png"), title: "Comisioane corecte & siguranță", desc: "Condiții transparente, fără taxe ascunse sau garanții exagerate. Pachete avantajoase pentru vânzare și închiriere." },
    ],
    steps_k: "Cum colaborăm",
    steps_h: "Pași simpli, de la anunț la chei",
    steps: [
      { icon: iconImg("/images/generated/icon-search.png"), title: "1. Cauți sau publici", desc: "Răsfoiești anunțuri verificate sau îți publici propria proprietate în câteva minute." },
      { icon: iconImg("/images/generated/icon-document-check.png"), title: "2. Verificare online", desc: "Verificăm poze, acte și preț înainte de publicare, pentru transparență 100%." },
      { icon: iconImg("/images/generated/icon-camera-verify.png"), title: "3. Scor & promovare", desc: "Anunțul primește un scor de încredere, apoi îți propunem pachetul ideal de promovare." },
      { icon: iconImg("/images/generated/icon-handshake.png"), title: "4. Contract & chei", desc: "Selectăm clientul potrivit și facilităm contractul și predarea — fără bătăi de cap." },
    ],
    trust: [
      { icon: iconImg("/images/generated/icon-gauge.png"), title: "Verificare online", desc: "Verificăm poze, acte și preț înainte de publicare." },
      { icon: iconImg("/images/generated/icon-document.png"), title: "Contracte transparente", desc: "Comisioane corecte, fără taxe ascunse." },
      { icon: iconImg("/images/generated/icon-map-pin.png"), title: "Acoperire națională", desc: "Căutare disponibilă în toată România, din prima zi." },
    ],
    story_k: "Cum s-a născut VerifiCasa",
    story_h: "De la o problemă reală la o soluție inteligentă",
    story_p1: "Totul a început de la o discuție simplă cu un grup de prieteni care își căutau o chirie. Privindu-i cum se luptau cu haosul din piață — zeci de apeluri telefonice, vizionări ratate, timp pierdut în trafic și, cel mai frustrant, anunțuri care ascundeau realitatea din teren —, mi-am dat seama că procesul acesta era complet depășit.",
    story_p2: "Proprietarii, adesea grăbiți, omiteau detalii esențiale. Chiriașii și cumpărătorii, la rândul lor, pierdeau ore prețioase pentru spații care nu aveau nicio legătură cu fotografiile din anunțuri.",
    story_p3: "Atunci a apărut întrebarea: Cum ar fi dacă am elimina complet această bătaie de cap? Cum ar fi dacă ai putea păși într-o locuință, să-i explorezi fiecare colțișor și să-i simți atmosfera, direct de pe telefonul sau calculatorul tău?",
    story_birth: "Așa s-a născut VerifiCasa.",
    story_p4: "Ne-am propus să redefinim transparența în imobiliare prin verificare online riguroasă, scor de încredere transparent și informații complete, fără filtre și fără detalii ascunse. Am creat un standard premium pentru cei care nu vor să își irosească timpul și care caută exact locul potrivit, rapid și fără surprize neplăcute.",
    service_h: "Cine beneficiază de serviciile noastre?",
    service_buyers_t: "Cumpărătorii și Chiriașii",
    service_buyers_d: "Câștigă timp, economisesc drumuri inutile și iau decizii în cunoștință de cauză.",
    service_owners_t: "Proprietarii și Dezvoltatorii",
    service_owners_d: "Își prezintă proprietățile la cel mai înalt nivel de profesionalism, atrăgând doar clienți cu adevărat interesați și serioși.",
    story_p5: "VerifiCasa nu este doar despre imobile; este despre oameni, timp și încredere. Ceea ce a pornit de la o simplă idee s-a transformat într-un brand dedicat eficienței și transparenței totale.",
    story_p6: "Suntem aici să creștem împreună cu voi, să vă ascultăm poveștile și să ne asigurăm că fie tranzacționați, fie închiriați, toată lumea câștigă.",
    faq_k: "Întrebări frecvente",
    faq_h: "Tot ce vrei să știi despre VerifiCasa",
    faq: [
      { q: "Cum funcționează verificarea?", a: "Verificăm online fiecare anunț înainte de publicare — poze, acte și preț — și calculăm un scor de încredere atașat anunțului." },
      { q: "Ce este turul 3D?", a: "Proprietarul poate adăuga propriul tur 3D, realizat cu aplicația noastră integrată VerifiCasa 3D, disponibilă cu Plan Pro — îl poți explora online din telefon sau calculator înainte de o vizionare." },
      { q: "Cât costă să listez o proprietate?", a: "Publicarea anunțului și verificarea de bază sunt gratuite. Detaliile despre planurile disponibile se vor regăsi pe site sau aplicația mobilă, în rubrica special destinată acestui plan." },
      { q: "În ce orașe sunteți activi?", a: "Poți căuta în toată România — peste 300 de orașe și cartiere sunt deja în platformă. Verificarea este online, deci disponibilă peste tot, din prima zi." },
      { q: "Cum contactez un proprietar sau agent?", a: "Direct din anunț — prin mesagerie în platformă, telefon sau WhatsApp, fără să-ți expui numărul până nu decizi tu." },
      { q: "Pot salva proprietatea sau căutarea pentru mai târziu?", a: "Da — cu un cont gratuit poți salva proprietatea (inima de pe anunț) sau întreaga căutare, ca s-o regăsești oricând în cont." },
    ],
  },
  en: {
    hero_badge: "VerifiCasa · Verified Real Estate Platform",
    hero_h: "Verified rentals & sales, no surprises.",
    hero_p1: "VerifiCasa is a real-estate platform where owners publish freely, and we verify every listing online before it goes live.",
    hero_p2: "We save your time, provide total transparency and build trust between landlords and tenants/buyers.",
    cta_search: "Browse properties",
    cta_list: "List a property",
    pillars_k: "What we do",
    pillars_h: "Online verification, on every listing",
    pillars: [
      { icon: iconImg("/images/generated/icon-shield-check.png"), title: "Online verification", desc: "We verify every listing before it's published — photos, paperwork and price — entirely online, no site visits." },
      { icon: iconImg("/images/generated/icon-gauge.png"), title: "Trust score", desc: "Every property gets an automatically calculated score, so you know at a glance how reliable the listing is." },
      { icon: iconImg("/images/generated/icon-users-check.png"), title: "Screening the right clients", desc: "We filter qualified tenants and buyers, so you don't waste time on pointless viewings." },
      { icon: iconImg("/images/generated/icon-lock.png"), title: "Fair fees & safety", desc: "Transparent terms, no hidden charges or inflated guarantees. Advantageous packages for sale and rent." },
    ],
    steps_k: "How we work together",
    steps_h: "Simple steps, from listing to keys",
    steps: [
      { icon: iconImg("/images/generated/icon-search.png"), title: "1. Search or list", desc: "Browse verified listings or publish your own property in a few minutes." },
      { icon: iconImg("/images/generated/icon-document-check.png"), title: "2. Online verification", desc: "We verify photos, paperwork and price before publishing, for 100% transparency." },
      { icon: iconImg("/images/generated/icon-camera-verify.png"), title: "3. Score & promotion", desc: "The listing gets a trust score, then we propose the ideal promotion package." },
      { icon: iconImg("/images/generated/icon-handshake.png"), title: "4. Contract & keys", desc: "We select the right client and facilitate the contract and handover — hassle-free." },
    ],
    trust: [
      { icon: iconImg("/images/generated/icon-gauge.png"), title: "Online verification", desc: "We verify photos, paperwork and price before publishing." },
      { icon: iconImg("/images/generated/icon-document.png"), title: "Transparent contracts", desc: "Fair commissions, no hidden fees." },
      { icon: iconImg("/images/generated/icon-map-pin.png"), title: "Nationwide coverage", desc: "Search available across Romania, from day one." },
    ],
    story_k: "How VerifiCasa was born",
    story_h: "From a real problem to a smart solution",
    story_p1: "Everything began with a simple conversation with a group of friends who were searching for a rental. Watching them battle the chaos of the market — dozens of phone calls, failed viewings, hours lost in traffic and, most frustratingly, listings that hid the reality of the place — I realised the process was completely outdated.",
    story_p2: "Landlords, often in a hurry, omitted essential details. Tenants and buyers, in turn, lost precious hours on spaces that had nothing to do with the photos in the listings.",
    story_p3: "Then the question came up: what if we eliminated this hassle entirely? What if you could step into a home, explore every little corner and feel its atmosphere, straight from your phone or computer?",
    story_birth: "That's how VerifiCasa was born.",
    story_p4: "We set out to redefine transparency in real estate through rigorous online verification, a transparent trust score and complete information — no filters, no hidden details. We created a premium standard for those who refuse to waste their time and who look for exactly the right place, fast and without nasty surprises.",
    service_h: "Who benefits from our services?",
    service_buyers_t: "Buyers and Tenants",
    service_buyers_d: "Save time, skip pointless trips and make informed decisions.",
    service_owners_t: "Landlords and Developers",
    service_owners_d: "Present their properties at the highest level of professionalism, attracting only genuinely interested and serious clients.",
    story_p5: "VerifiCasa isn't just about properties; it's about people, time and trust. What started as a simple idea has grown into a brand dedicated to total efficiency and transparency.",
    story_p6: "We're here to grow together with you, to listen to your stories and to make sure that whether you're transacting or renting, everyone wins.",
    faq_k: "Frequently asked questions",
    faq_h: "Everything you want to know about VerifiCasa",
    faq: [
      { q: "How does verification work?", a: "We verify every listing online before it's published — photos, paperwork and price — and calculate a trust score attached to the listing." },
      { q: "What is the 3D tour?", a: "Owners can add their own 3D tour, built with our own integrated VerifiCasa 3D app, available with the Pro plan — you can explore it online from your phone or computer before an in-person viewing." },
      { q: "How much does it cost to list a property?", a: "Publishing your listing and basic verification are free. Details about the available plans can be found on the site or mobile app, in the section dedicated to that plan." },
      { q: "Which cities are you active in?", a: "You can search anywhere in Romania — over 300 cities and neighbourhoods are already on the platform. Verification is online, so it's available everywhere from day one." },
      { q: "How do I contact an owner or agent?", a: "Directly from the listing — via in-app messaging, phone or WhatsApp, without exposing your number until you decide to." },
      { q: "Can I save a property or a search for later?", a: "Yes — with a free account you can save a property (the heart on the listing) or an entire search, so you can find it again anytime in your account." },
    ],
  },
};

export default function About() {
  const { lang } = useCountry();
  const c = CONTENT[lang] || CONTENT.ro;

  return (
    <div className="bg-secondary/30">
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <img
          src="/images/generated/about-hero.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/80 via-navy-deep/70 to-navy-deep/90" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.span initial="hidden" animate="show" variants={fadeUp} className="inline-flex items-center gap-2 rounded-sm border border-gold/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-gold">
            {c.hero_badge}
          </motion.span>
          <motion.h1 initial="hidden" animate="show" variants={fadeUp} className="mt-6 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            {c.hero_h}
          </motion.h1>
          <motion.p initial="hidden" animate="show" variants={fadeUp} className="mx-auto mt-5 max-w-2xl rounded-lg border border-white/15 bg-white/10 px-5 py-3 text-base text-white/85 sm:text-lg">
            {c.hero_p1} {c.hero_p2}
          </motion.p>
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="gradient-mint text-navy shadow-soft hover:opacity-90">
              <Link to="/search">{c.cta_search} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
              <Link to="/owner">{c.cta_list}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="kicker text-emerald">{c.pillars_k}</p>
          <h2 className="mt-1 font-heading text-3xl font-bold text-navy dark:text-foreground">{c.pillars_h}</h2>
        </div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {c.pillars.map((p, i) => (
            <motion.div key={i} variants={fadeUp} className="group flex flex-col rounded-lg border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-[0_20px_45px_-15px_rgba(16,24,40,0.28)] dark:bg-card">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <p.icon className="relative h-full w-full drop-shadow-[0_4px_10px_rgba(16,24,40,0.16)]" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-navy dark:text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* OUR STORY */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
          <div className="lg:sticky lg:top-24 lg:col-span-2">
            <div className="overflow-hidden rounded-lg shadow-soft">
              <img src="/images/generated/about-story.png" alt="" className="h-72 w-full object-cover lg:h-[480px]" />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white p-7 shadow-soft dark:bg-card sm:p-9 lg:col-span-3">
          <div className="text-center lg:text-left">
            <p className="kicker text-emerald">{c.story_k}</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy dark:text-foreground sm:text-3xl">{c.story_h}</h2>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>{c.story_p1}</p>
            <p>{c.story_p2}</p>
            <p>{c.story_p3}</p>
            <p className="border-l-[3px] border-gold pl-4 font-heading text-xl font-bold italic text-navy dark:text-foreground">{c.story_birth}</p>
            <p>{c.story_p4}</p>

            <h3 className="font-heading text-xl font-bold text-navy dark:text-foreground pt-2">{c.service_h}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-secondary/30 p-4 dark:bg-navy-deep/40">
                <p className="font-heading text-sm font-bold text-emerald">{c.service_buyers_t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.service_buyers_d}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-4 dark:bg-navy-deep/40">
                <p className="font-heading text-sm font-bold text-emerald">{c.service_owners_t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.service_owners_d}</p>
              </div>
            </div>

            <p>{c.story_p5}</p>
            <p>{c.story_p6}</p>
          </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="kicker text-emerald">{c.steps_k}</p>
          <h2 className="mt-1 font-heading text-3xl font-bold text-navy dark:text-foreground">{c.steps_h}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.steps.map((s, i) => (
            <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="group relative overflow-hidden rounded-lg border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-[0_20px_45px_-15px_rgba(16,24,40,0.28)] dark:bg-card">
              <span aria-hidden="true" className="pointer-events-none absolute -right-1 -top-3 select-none font-heading text-6xl font-black leading-none text-navy/[0.06] dark:text-white/[0.05]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative flex h-11 w-11 items-center justify-center">
                <s.icon className="relative h-full w-full drop-shadow-[0_4px_10px_rgba(16,24,40,0.16)]" />
              </span>
              <h3 className="relative mt-4 font-heading text-base font-bold text-navy dark:text-foreground">{s.title.replace(/^\d+\.\s*/, "")}</h3>
              <p className="relative mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              {i < c.steps.length - 1 && (
                <span className="absolute -right-[13px] top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-soft dark:bg-card lg:flex">
                  <ArrowRight className="h-3 w-3 text-emerald" />
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-lg bg-navy-deep p-8 shadow-[0_30px_70px_-30px_rgba(16,24,40,0.5)]">
          <div className="relative grid gap-5 sm:grid-cols-3">
            {c.trust.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                  <b.icon className="relative h-full w-full drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)]" />
                </span>
                <div>
                  <p className="font-heading text-sm font-bold text-white">{b.title}</p>
                  <p className="text-xs text-white/60">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — accordion închis, secțiune întunecată, ca la Zillow */}
      <section className="bg-navy-deep py-16 text-white sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-10">
            <p className="kicker text-gold">{c.faq_k}</p>
            <h2 className="mt-1 font-heading text-2xl font-bold sm:text-3xl">{c.faq_h}</h2>
          </div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            className="space-y-2.5"
          >
            <Accordion type="single" collapsible className="space-y-2.5">
              {c.faq.map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem value={`faq-${i}`} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] px-4 transition-colors duration-300 hover:bg-white/[0.06] data-[state=open]:border-emerald/40 data-[state=open]:bg-white/[0.06] sm:px-5">
                    <AccordionTrigger className="font-heading text-base font-semibold text-white hover:text-emerald sm:text-lg">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-white/70 sm:text-base">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </div>
  );
}