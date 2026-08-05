import React from "react";
import LegalPage from "@/components/LegalPage";
import EmailDirectory from "@/components/EmailDirectory";
import { Instagram, MapPin, Clock, ShieldCheck } from "lucide-react";

export default function Contact() {
  return (
    <LegalPage title="Contact – VerifiCasa" updated="Ultima actualizare: 5 August 2026">
      <p>
        Suntem aici să te ajutăm. Mai jos găsești directorul complet de adrese de email,
        organizat pe departamente. Apasă pe orice card pentru a deschide clientul tău de email
        sau folosește butonul de copiere pentru a salva adresa rapid.
      </p>

      <EmailDirectory />

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Protecția datelor (GDPR) și ștergerea contului
        </h2>
        <p>
          Pentru solicitări privind accesul, rectificarea, ștergerea sau restricționarea
          prelucrării datelor personale, inclusiv a datelor asociate contului Google,
          scrie-ne la <a href="mailto:legal@verificasa.ro" className="text-primary hover:underline">legal@verificasa.ro</a>.
          Cererile sunt procesate conform Regulamentului (UE) 2016/679 (GDPR).
        </p>
        <p>
          Detalii complete găsiți pe pagina{" "}
          <a href="/data-deletion" className="text-primary hover:underline">Ștergerea Datelor</a>.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Social Media & Domenii verificate
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <a href="https://instagram.com/verificasaro" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-semibold text-emerald hover:underline">
            <Instagram className="h-4 w-4" /> @verificasaro
          </a>
          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-semibold text-emerald">
            <ShieldCheck className="h-4 w-4" /> TikTok: verificasaro
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Domenii verificate: <span className="font-mono font-semibold">www.verificasa.ro</span> &{" "}
          <span className="font-mono font-semibold">www.verificasa.site</span>
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Zona de acoperire
        </h2>
        <div className="mt-3 flex items-start gap-2">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald" />
          <p>România — Iași, Huși și zone limitrofe.</p>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Timp de răspuns
        </h2>
        <div className="mt-3 flex items-start gap-2">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-emerald" />
          <p>
            Răspundem solicitărilor în termen de maximum 48 de ore lucrătoare. Cererile privind
            ștergerea datelor sunt procesate în maximum 30 de zile lucrătoare.
          </p>
        </div>
      </section>
    </LegalPage>
  );
}