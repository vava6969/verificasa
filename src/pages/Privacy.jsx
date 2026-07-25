import React from "react";
import LegalPage from "@/components/LegalPage";

export default function Privacy() {
  return (
    <LegalPage title="Politică de Confidențialitate (GDPR) – VerifiCasa" updated="Ultima actualizare: 26 Iulie 2026">
      <p>
        VerifiCasa (denumită în continuare „noi”, „Platforma” sau „Site-ul”) respectă
        confidențialitatea datelor dumneavoastră cu caracter personal și se angajează să le
        protejeze în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația aplicabilă
        în România.
      </p>
      <p>
        Prezenta Politică de Confidențialitate explică modul în care colectăm, utilizăm și
        protejăm datele dumneavoastră atunci când vizitați site-ul nostru de prezentare sau
        când ne contactați pentru serviciile noastre.
      </p>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          1. Ce date cu caracter personal colectăm?
        </h2>
        <p>
          Site-ul VerifiCasa este un site de prezentare. Colectăm date cu caracter personal doar
          atunci când ni le furnizați voluntar (de exemplu, prin formularul de contact, e-mail
          sau telefon):
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Date de contact:</strong> Nume, prenume, adresă de e-mail, număr de telefon.
          </li>
          <li>
            <strong>Detalii despre proprietate:</strong> Adresa imobilului, caracteristicile
            acestuia sau alte detalii furnizate de dumneavoastră în vederea
            evaluării/promovării.
          </li>
          <li>
            <strong>Date tehnice de navigare:</strong> Adresa IP, tipul de browser, cookie-uri de
            bază necesare pentru funcționarea și securitatea site-ului.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          2. Scopul și temeiul prelucrării
        </h2>
        <p>Prelucrăm datele dumneavoastră în următoarele scopuri:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Răspunsul la solicitări și preluarea comenzilor:</strong> Pentru a vă
            contacta, a stabili o întâlnire și a discuta detaliile colaborării (Temei: demersuri
            la cererea persoanei vizate înainte de încheierea unui contract).
          </li>
          <li>
            <strong>Furnizarea serviciilor contractate:</strong> Încheierea și executarea
            Contractului de Intermediere / Prestări Servicii (Temei: executarea unui contract).
          </li>
          <li>
            <strong>Obligații legale:</strong> Respectarea obligațiilor fiscale și contabile
            atunci când emitem facturi sau chitanțe (Temei: obligație legală).
          </li>
          <li>
            <strong>Interes legitim:</strong> Pentru protejarea site-ului împotriva atacurilor
            cibernetice sau pentru apărarea drepturilor noastre în instanță, dacă este cazul.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          3. Cât timp păstrăm datele dumneavoastră?
        </h2>
        <p>
          Datele colectate din formularele de contact (fără a finaliza un contract) sunt păstrate
          pentru o perioadă de maximum 12 luni, după care sunt șterse.
        </p>
        <p>
          Datele clienților cu care am încheiat un contract sunt păstrate pe durata derulării
          contractului și ulterior conform termenelor legale (de exemplu, 5-10 ani pentru
          documentele financiar-contabile).
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          4. Transmiterea datelor către terți
        </h2>
        <p>
          VerifiCasa NU vinde, NU închiriază și NU transmite datele dumneavoastră personale către
          terți în scopuri de marketing. Datele pot fi transmise doar dacă este strict necesar
          pentru furnizarea serviciului:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Colaboratori / Prestatori de servicii:</strong> Furnizori de servicii IT
            (hosting), contabilitate sau avocați (toți fiind obligați prin contract să păstreze
            confidențialitatea).
          </li>
          <li>
            <strong>Autorități publice:</strong> În cazul în care există o obligație legală
            expresă (de exemplu, ANAF, organele de poliție).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          5. Drepturile dumneavoastră conform GDPR
        </h2>
        <p>În calitate de persoană vizată, aveți următoarele drepturi:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Dreptul de acces:</strong> Puteți solicita o confirmare privind prelucrarea
            datelor dumneavoastră.
          </li>
          <li>
            <strong>Dreptul la rectificare:</strong> Puteți cere corectarea datelor inexacte sau
            completarea celor incomplete.
          </li>
          <li>
            <strong>Dreptul la ștergere („dreptul de a fi uitat”):</strong> Puteți solicita
            ștergerea datelor dacă acestea nu mai sunt necesare sau dacă nu există un temei legal
            superior pentru păstrarea lor (ex. obligații fiscale).
          </li>
          <li>
            <strong>Dreptul la restricționare:</strong> Puteți cere limitarea prelucrării în
            anumite condiții.
          </li>
          <li>
            <strong>Dreptul de a vă opune:</strong> Vă puteți opune prelucrării bazate pe
            interesul nostru legitim.
          </li>
          <li>
            <strong>Dreptul de a depune o plângere:</strong> Aveți dreptul de a depune o plângere
            la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
            (ANSPDCP - www.dataprotection.ro).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          6. Securitatea datelor
        </h2>
        <p>
          Luăm măsuri tehnice și organizatorice adecvate pentru a proteja datele dumneavoastră
          împotriva pierderii, accesului neautorizat, modificării sau divulgării (de exemplu,
          conexiune securizată SSL/HTTPS pe site).
        </p>
      </section>
    </LegalPage>
  );
}