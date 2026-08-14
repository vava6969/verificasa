import React from "react";
import LegalPage from "@/components/LegalPage";
import EmailDirectory from "@/components/EmailDirectory";
import { MapPin, Clock } from "lucide-react";

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
          <a
            href="https://instagram.com/verificasaro"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-border bg-secondary/40 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-secondary/60 dark:text-foreground"
          >
            <img
              src="/images/generated/icon-instagram-v1.png"
              alt=""
              className="h-8 w-8 shrink-0 object-contain transition-transform duration-200 group-hover:scale-110"
            />
            @verificasaro
          </a>
          <a
            href="https://tiktok.com/@verificasaro"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-border bg-secondary/40 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-navy/30 hover:bg-secondary/60 dark:text-foreground dark:hover:border-white/30"
          >
            <img
              src="/images/generated/icon-tiktok-v1.png"
              alt=""
              className="h-8 w-8 shrink-0 object-contain transition-transform duration-200 group-hover:scale-110"
            />
            @verificasaro
          </a>
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
          <p>
            <span className="mr-1">🇷🇴</span>
            Oferim servicii de verificare în toată România — peste 300 de orașe acoperite, cu
            validare online pentru fiecare anunț publicat.
          </p>
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