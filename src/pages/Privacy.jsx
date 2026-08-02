import React from "react";
import LegalPage from "@/components/LegalPage";

export default function Privacy() {
  return (
    <LegalPage title="Politica de Confidențialitate – VerifiCasa" updated="Ultima actualizare: 2 August 2026">
      <p>
        Respectăm confidențialitatea utilizatorilor noștri și ne angajăm să protejăm
        informațiile personale colectate prin intermediul aplicației și al site-ului nostru.
      </p>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Ce informații colectăm
        </h2>
        <p>În funcție de serviciile utilizate, putem colecta:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Nume și prenume</li>
          <li>Adresa de e-mail</li>
          <li>Fotografia de profil Google (dacă utilizatorul alege autentificarea cu Google)</li>
          <li>ID-ul contului Google</li>
          <li>Informații tehnice despre dispozitiv și browser</li>
          <li>Adresa IP</li>
          <li>Cookie-uri și informații privind utilizarea site-ului</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Autentificarea cu Google
        </h2>
        <p>
          Dacă alegeți să vă autentificați folosind contul Google, aplicația poate solicita
          acces doar la informațiile necesare funcționării serviciului.
        </p>
        <p>
          Nu solicităm permisiuni inutile și accesăm doar datele aprobate explicit de utilizator.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Cum folosim informațiile
        </h2>
        <p>Datele sunt utilizate exclusiv pentru:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>autentificarea utilizatorului;</li>
          <li>furnizarea serviciilor oferite de aplicație;</li>
          <li>îmbunătățirea funcționalităților;</li>
          <li>suport tehnic;</li>
          <li>securizarea contului utilizatorului;</li>
          <li>prevenirea fraudelor.</li>
        </ul>
        <p>Nu vindem și nu închiriem datele personale către terți.</p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Partajarea informațiilor
        </h2>
        <p>
          Nu distribuim informațiile personale către alte companii sau persoane, cu excepția
          situațiilor prevăzute de lege sau atunci când este necesar pentru furnizarea serviciului.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Stocarea datelor
        </h2>
        <p>
          Datele sunt păstrate doar atât timp cât este necesar pentru furnizarea serviciilor
          sau conform obligațiilor legale.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Ștergerea datelor
        </h2>
        <p>
          Utilizatorul poate solicita în orice moment ștergerea completă a datelor personale
          prin contactarea noastră la:
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:birou@verificasa.site" className="text-primary hover:underline">
            birou@verificasa.site
          </a>
        </p>
        <p>Cererile sunt procesate într-un termen rezonabil.</p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Securitatea datelor
        </h2>
        <p>
          Implementăm măsuri tehnice și organizatorice pentru protejarea informațiilor
          împotriva accesului neautorizat, modificării sau pierderii.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Drepturile utilizatorului
        </h2>
        <p>Conform legislației aplicabile, utilizatorii au dreptul:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>de acces;</li>
          <li>de rectificare;</li>
          <li>de ștergere;</li>
          <li>de restricționare a prelucrării;</li>
          <li>de portabilitate;</li>
          <li>de opoziție.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          Date Google
        </h2>
        <p>
          Utilizarea informațiilor primite prin intermediul API-urilor Google respectă{" "}
          <em>Google API Services User Data Policy</em>, inclusiv cerințele privind utilizarea
          limitată (Limited Use).
        </p>
        <p>
          Datele obținute prin intermediul serviciilor Google nu sunt utilizate pentru
          publicitate, profilare sau vânzare către terți.
        </p>
      </section>
    </LegalPage>
  );
}