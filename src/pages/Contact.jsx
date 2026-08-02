import React from "react";
import LegalPage from "@/components/LegalPage";
import { Mail, Instagram, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <LegalPage title="Contact – VerifiCasa" updated="Ultima actualizare: 2 August 2026">
      <p>
        Pentru orice întrebare, solicitare sau problemă legată de serviciile VerifiCasa,
        inclusiv pentru cereri privind protecția datelor și ștergerea contului, ne puteți
        contacta folosind datele de mai jos.
      </p>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Suport și întrebări generale
        </h2>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-4">
          <Mail className="h-5 w-5 text-emerald" />
          <a href="mailto:birou@verificasa.site" className="font-semibold text-emerald hover:underline">
            birou@verificasa.site
          </a>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Protecția datelor (GDPR) și ștergerea contului
        </h2>
        <p>
          Pentru solicitări privind accesul, rectificarea, ștergerea sau restricționarea
          prelucrării datelor personale, inclusiv a datelor asociate contului Google,
          contactați-ne la adresa de e-mail de mai sus. Cererile sunt procesate conform
          Regulamentului (UE) 2016/679 (GDPR).
        </p>
        <p>
          Detalii complete găsiți pe pagina{" "}
          <a href="/data-deletion" className="text-primary hover:underline">Ștergerea Datelor</a>.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Social Media
        </h2>
        <div className="mt-3 flex items-center gap-2">
          <Instagram className="h-5 w-5 text-emerald" />
          <a href="https://instagram.com/verificasaro" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald hover:underline">
            @verificasaro
          </a>
        </div>
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