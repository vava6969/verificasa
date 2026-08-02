import React from "react";
import LegalPage from "@/components/LegalPage";

export default function Terms() {
  return (
    <LegalPage title="Termeni și Condiții – VerifiCasa" updated="Ultima actualizare: 2 August 2026">
      <p>
        Prin utilizarea acestui site și a aplicației, sunteți de acord cu prezentii termeni.
      </p>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Conturi
        </h2>
        <p>
          Utilizatorii sunt responsabili pentru păstrarea confidențialității datelor de
          autentificare.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Autentificarea Google
        </h2>
        <p>Atunci când utilizați autentificarea Google:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>acordați acces doar la informațiile pe care le aprobați;</li>
          <li>puteți revoca accesul oricând din contul Google;</li>
          <li>aplicația utilizează aceste informații exclusiv pentru funcționarea serviciului.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Utilizarea serviciului
        </h2>
        <p>Este interzisă:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>utilizarea ilegală;</li>
          <li>încercarea de acces neautorizat;</li>
          <li>copierea sau modificarea aplicației fără permisiune;</li>
          <li>utilizarea serviciului în scopuri frauduloase.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Proprietatea intelectuală
        </h2>
        <p>
          Tot conținutul aplicației aparține proprietarului acesteia și este protejat de
          legislația privind drepturile de autor.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Limitarea răspunderii
        </h2>
        <p>
          Serviciul este furnizat „ca atare”. Nu garantăm funcționarea neîntreruptă sau lipsa
          erorilor.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Încetarea accesului
        </h2>
        <p>
          Ne rezervăm dreptul de a suspenda sau închide conturile care încalcă acești termeni.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Modificarea termenilor
        </h2>
        <p>Ne rezervăm dreptul de a modifica acești termeni în orice moment.</p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Politica privind Datele Google (Google User Data Policy)
        </h2>
        <p>
          Aplicația utilizează serviciile Google exclusiv pentru funcționalitățile solicitate
          de utilizator.
        </p>
        <p>Datele accesate prin intermediul API-urilor Google:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>sunt utilizate numai pentru furnizarea serviciului solicitat;</li>
          <li>nu sunt vândute;</li>
          <li>nu sunt partajate în scopuri publicitare;</li>
          <li>nu sunt folosite pentru crearea profilurilor de marketing;</li>
          <li>
            nu sunt transferate către terți fără consimțământul utilizatorului, cu excepția
            cazurilor prevăzute de lege.
          </li>
        </ul>
        <h3 className="font-heading text-sm font-bold text-navy dark:text-foreground mt-4">
          Ștergerea accesului
        </h3>
        <p>Utilizatorul poate:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>revoca accesul aplicației din contul Google;</li>
          <li>solicita ștergerea tuturor datelor stocate.</li>
        </ul>
        <p>
          După ștergere, toate informațiile asociate sunt eliminate în conformitate cu
          obligațiile legale.
        </p>
      </section>
    </LegalPage>
  );
}