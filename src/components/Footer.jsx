import React from "react";
import { Mail, Phone, MapPin, ShieldCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import VerifiCasaLogo from "@/components/VerifiCasaLogo";

const COVERAGE_TEXT = "Acoperire în Iași și Huși. Planificăm să ne extindem în toată România!";

export default function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-navy-deep text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <VerifiCasaLogo size={44} tagline={false} />
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Platformă de închirieri imobiliare cu inspecții fizice verificate și tururi AI immersive.
              Încredere, transparență, fără surprize.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-gold/30 bg-white/5 px-3 py-2 text-xs font-semibold text-gold">
              <ShieldCheck className="h-4 w-4" /> Inspecții verificate pe teren
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold">Platformă</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><Link to="/search" className="hover:text-emerald">Caută chirii</Link></li>
              <li><Link to="/about" className="hover:text-emerald">Despre Noi</Link></li>
              <li><Link to="/search?ai=1" className="hover:text-emerald">Tururi AI & Video</Link></li>
              <li><Link to="/search?field=1" className="hover:text-emerald">Verificat pe Teren</Link></li>
              <li><Link to="/owner" className="hover:text-emerald">Pentru Proprietari</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold">Legal & Încredere</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />ANPC · Protecția Consumatorului</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />Termeni & Condiții</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />Politica de Confidențialitate</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />Garanția VerifiCasa</li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald" /> hello@verificasa.ro</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald" /> +40 21 123 4567</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald" /> București, România 🇷🇴</li>
            </ul>
            <p className="mt-4 flex items-start gap-2 text-xs font-semibold text-white/70">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" /> {COVERAGE_TEXT}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© 2026 VerifiCasa — Inspecții & Verificări Imobiliare</p>
          <p>🇷🇴 PropTech · Inspecții fizice · Tururi AI conforme legislației RO</p>
        </div>
      </div>
    </footer>
  );
}