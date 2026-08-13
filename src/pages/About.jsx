import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Video, Users, FileText, BadgeCheck, Lock, MapPin, Sparkles,
  Search, ClipboardCheck, Camera, Handshake, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/components/CountryContext";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
      { icon: ShieldCheck, title: "Verificare online", desc: "Verificăm fiecare anunț înainte de publicare — poze, acte și preț — direct online, fără vizite pe teren." },
      { icon: BadgeCheck, title: "Scor de încredere", desc: "Fiecare proprietate primește un scor calculat automat, ca să știi dintr-o privire cât de sigur este anunțul." },
      { icon: Users, title: "Selectarea clienților potriviți", desc: "Filtrăm chiriașii și cumpărătorii calificați, ca să nu pierzi timp cu vizionări inutile." },
      { icon: Lock, title: "Comisioane corecte & siguranță", desc: "Condiții transparente, fără taxe ascunse sau garanții exagerate. Pachete avantajoase pentru vânzare și închiriere." },
    ],
    steps_k: "Cum colaborăm",
    steps_h: "Pași simpli, de la anunț la chei",
    steps: [
      { icon: Search, title: "1. Cauți sau publici", desc: "Răsfoiești anunțuri verificate sau îți publici propria proprietate în câteva minute." },
      { icon: ClipboardCheck, title: "2. Verificare online", desc: "Verificăm poze, acte și preț înainte de publicare, pentru transparență 100%." },
      { icon: Camera, title: "3. Scor & promovare", desc: "Anunțul primește un scor de încredere, apoi îți propunem pachetul ideal de promovare." },
      { icon: Handshake, title: "4. Contract & chei", desc: "Selectăm clientul potrivit și facilităm contractul și predarea — fără bătăi de cap." },
    ],
    trust: [
      { icon: BadgeCheck, title: "Verificare online", desc: "Verificăm poze, acte și preț înainte de publicare." },
      { icon: FileText, title: "Contracte transparente", desc: "Comisioane corecte, fără taxe ascunse." },
      { icon: MapPin, title: "Acoperire națională", desc: "Căutare disponibilă în toată România, din prima zi." },
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
      { q: "IGNORE_OLD", a: "IGNORE_OLD_TO_DROP — verificăm actele, starea reală, zgomotul (dB) și presiunea apei, apoi emitem un raport atașat anunțului." },
      { q: "Ce este turul 3D / AI?", a: "Este un tur virtual generat din pozele proprietarului, pe care îl poți explora online din telefon sau calculator înainte să mergi la o vizionare fizică." },
      { q: "Cât costă să listez o proprietate?", a: "Publică anunțul gratuit din cont. Detaliile despre pachete, comisioane și contracte se discută direct cu agenții noștri VerifiCasa pe WhatsApp sau email." },
      { q: "În ce orașe sunteți activi?", a: "Poți căuta în toată România — peste 300 de orașe și cartiere sunt deja în platformă. Verificările pe teren pornesc din Iași și Huși și se extind constant." },
      { q: "Cum contactez un proprietar sau agent?", a: "Direct din anunț — prin mesagerie în platformă, telefon sau WhatsApp, fără să-ți expui numărul până nu decizi tu." },
      { q: "Pot salva proprietatea sau căutarea pentru mai târziu?", a: "Da — cu un cont gratuit poți salva proprietatea (inima de pe anunț) sau întreaga căutare, ca s-o regăsești oricând în cont." },
    ],
  },
  en: {
    hero_badge: "VerifiCasa · Real Estate Agency",
    hero_h: "Verified rentals & sales, no surprises.",
    hero_p1: "VerifiCasa is a real-estate platform and agency that blends AI technology with real physical inspections.",
    hero_p2: "We save your time, provide total transparency and build trust between landlords and tenants/buyers.",
    cta_search: "Browse properties",
    cta_list: "List a property",
    pillars_k: "What we do",
    pillars_h: "Technology + people on the ground",
    pillars: [
      { icon: Video, title: "Interactive AI 360° Tour", desc: "We generate virtual tours from the property's photos, so tenants can explore the place online — saving time for everyone." },
      { icon: ShieldCheck, title: "Physical on-site inspection", desc: "Our agents personally inspect every property and issue a report on condition, noise, water pressure and paperwork." },
      { icon: Users, title: "Screening the right clients", desc: "We filter qualified tenants and buyers, so you don't waste time on pointless viewings." },
      { icon: Lock, title: "Fair fees & safety", desc: "Transparent terms, no hidden charges or inflated guarantees. Advantageous packages for sale and rent." },
    ],
    steps_k: "How we work together",
    steps_h: "Simple steps, from listing to keys",
    steps: [
      { icon: Search, title: "1. Search or list", desc: "Browse verified listings or publish your own property in a few minutes." },
      { icon: ClipboardCheck, title: "2. On-site inspection", desc: "The VerifiCasa team physically inspects the place and checks the paperwork for 100% transparency." },
      { icon: Camera, title: "3. 360° Tour & promotion", desc: "We create the interactive tour and photos, then propose the ideal promotion package." },
      { icon: Handshake, title: "4. Contract & keys", desc: "We select the right client and facilitate the contract and handover — hassle-free." },
    ],
    trust: [
      { icon: BadgeCheck, title: "Physical inspections", desc: "Real reports with noise (dB), water pressure and paperwork." },
      { icon: FileText, title: "Transparent contracts", desc: "Fair commissions, no hidden fees." },
      { icon: MapPin, title: "Coverage Iași & Huși", desc: "Expanding across all of Romania." },
    ],
    story_k: "How VerifiCasa was born",
    story_h: "From a real problem to a smart solution",
    story_p1: "Everything began with a simple conversation with a group of friends who were searching for a rental. Watching them battle the chaos of the market — dozens of phone calls, failed viewings, hours lost in traffic and, most frustratingly, listings that hid the reality of the place — I realised the process was completely outdated.",
    story_p2: "Landlords, often in a hurry, omitted essential details. Tenants and buyers, in turn, lost precious hours on spaces that had nothing to do with the photos in the listings.",
    story_p3: "Then the question came up: what if we eliminated this hassle entirely? What if you could step into a home, explore every little corner and feel its atmosphere, straight from your phone or computer?",
    story_birth: "That's how VerifiCasa was born.",
    story_p4: "We set out to redefine transparency in real estate through high-precision 3D virtual tours, objective inspections and complete information — no filters, no hidden details. We created a premium standard for those who refuse to waste their time and who look for exactly the right place, fast and without nasty surprises.",
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
      { q: "How does the on-site verification work?", a: "VerifiCasa agents physically inspect every property before it's published — we check the paperwork, real condition, noise (dB) and water pressure, then issue a report attached to the listing." },
      { q: "What is the 3D / AI tour?", a: "It's a virtual tour generated from the owner's photos, which you can explore online from your phone or computer before going to an in-person viewing." },
      { q: "How much does it cost to list a property?", a: "Publishing your listing is free. Package, commission and contract details are discussed directly with our VerifiCasa agents on WhatsApp or email." },
      { q: "Which cities are you active in?", a: "You can search anywhere in Romania — over 300 cities and neighbourhoods are already on the platform. On-site verifications start in Iași and Huși and are expanding steadily." },
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
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.span initial="hidden" animate="show" variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> {c.hero_badge}
          </motion.span>
          <motion.h1 initial="hidden" animate="show" variants={fadeUp} className="mt-6 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            {c.hero_h}
          </motion.h1>
          <motion.p initial="hidden" animate="show" variants={fadeUp} className="mx-auto mt-5 max-w-2xl rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-base text-white/85 backdrop-blur-md sm:text-lg">
            {c.hero_p1} {c.hero_p2}
          </motion.p>
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full gradient-mint text-navy shadow-soft hover:opacity-90">
              <Link to="/search">{c.cta_search} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10">
              <Link to="/owner">{c.cta_list}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald">{c.pillars_k}</p>
          <h2 className="mt-1 font-heading text-3xl font-bold text-navy dark:text-foreground">{c.pillars_h}</h2>
        </div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {c.pillars.map((p, i) => (
            <motion.div key={i} variants={fadeUp} className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-soft dark:bg-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-soft text-emerald"><p.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 font-heading text-lg font-bold text-navy dark:text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* OUR STORY */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-white p-7 shadow-soft dark:bg-card sm:p-9">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald">{c.story_k}</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-navy dark:text-foreground sm:text-3xl">{c.story_h}</h2>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>{c.story_p1}</p>
            <p>{c.story_p2}</p>
            <p>{c.story_p3}</p>
            <p className="font-heading text-lg font-bold text-navy dark:text-foreground">{c.story_birth}</p>
            <p>{c.story_p4}</p>

            <h3 className="font-heading text-xl font-bold text-navy dark:text-foreground pt-2">{c.service_h}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 dark:bg-navy-deep/40">
                <p className="font-heading text-sm font-bold text-emerald">{c.service_buyers_t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.service_buyers_d}</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 dark:bg-navy-deep/40">
                <p className="font-heading text-sm font-bold text-emerald">{c.service_owners_t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.service_owners_d}</p>
              </div>
            </div>

            <p>{c.story_p5}</p>
            <p>{c.story_p6}</p>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald">{c.steps_k}</p>
          <h2 className="mt-1 font-heading text-3xl font-bold text-navy dark:text-foreground">{c.steps_h}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.steps.map((s, i) => (
            <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="relative rounded-2xl border border-border bg-white p-6 shadow-soft dark:bg-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-emerald"><s.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-heading text-base font-bold text-navy dark:text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-3xl border border-border bg-white p-8 shadow-soft sm:grid-cols-3 dark:bg-card">
          {c.trust.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-soft text-emerald"><b.icon className="h-5 w-5" /></span>
              <div>
                <p className="font-heading text-sm font-bold text-navy dark:text-foreground">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — accordion închis, secțiune întunecată, ca la Zillow */}
      <section className="bg-navy-deep py-16 text-white sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">{c.faq_k}</p>
            <h2 className="mt-1 font-heading text-2xl font-bold sm:text-3xl">{c.faq_h}</h2>
          </div>
          <Accordion type="single" collapsible className="divide-y divide-white/10">
            {c.faq.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-white/10">
                <AccordionTrigger className="font-heading text-base font-semibold text-white hover:no-underline sm:text-lg">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-white/70 sm:text-base">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}