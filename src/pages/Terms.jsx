import React from "react";
import LegalPage from "@/components/LegalPage";

export default function Terms() {
  return (
    <LegalPage title="Termeni și Condiții – VerifiCasa" updated="Ultima actualizare: 26 Iulie 2026">
      <p>
        Prezentul document stabilește condițiile de utilizare a site-ului de prezentare
        VerifiCasa (denumit în continuare „Site-ul”). Prin accesarea și navigarea pe acest
        Site, sunteți de acord cu termenii descriși mai jos. Dacă nu sunteți de acord cu
        aceștia, vă rugăm să părăsiți Site-ul.
      </p>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          1. Caracterul informativ al Site-ului
        </h2>
        <p>
          1.1. Acest Site are un caracter strict informativ și de prezentare a serviciilor
          imobiliare oferite de VerifiCasa.
        </p>
        <p>
          1.2. Site-ul NU reprezintă o platformă automatizată, nu procesează plăți online, nu
          creează conturi de utilizator și nu generează automat materiale digitale (cum ar fi
          tururi virtuale sau randări AI) prin intermediul paginii web.
        </p>
        <p>
          1.3. Orice imagini, exemple de tururi virtuale sau simulări prezentate pe site au rol
          demonstrativ și de portofoliu.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          2. Prestarea serviciilor și contractul direct
        </h2>
        <p>
          2.1. Toate serviciile oferite de VerifiCasa (promovare imobiliară, realizare tururi
          virtuale AI, selecție chiriași, intermediere) sunt servicii prestate contra cost pe
          baza unei solicitări directe.
        </p>
        <p>
          2.2. Cadrul legal: Oferirea oricărui serviciu și plata aferentă se realizează EXCLUSIV
          pe baza unui contract scris și semnat direct între VerifiCasa și Client
          (Proprietar/Chiriaș).
        </p>
        <p>
          2.3. Trimiterea unui formular de contact, a unui e-mail sau efectuarea unui apel
          telefonic prin intermediul Site-ului nu obligă niciuna dintre părți la prestarea sau
          plata vreunui serviciu până la semnarea formală a contractului de
          intermediere/prestări servicii.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          3. Prețuri și comisioane
        </h2>
        <p>
          3.1. Prețurile, comisioanele și tarifele afișate pe Site (dacă există) au caracter
          estimativ.
        </p>
        <p>
          3.2. Valoarea finală a comisionului sau a tarifului pentru serviciile prestate va fi
          stabilită de comun acord și menționată explicit în contractul direct semnat între
          părți.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          4. Limitarea răspunderii privind Site-ul
        </h2>
        <p>
          4.1. VerifiCasa depune toate eforturile pentru ca informațiile de pe Site să fie corecte
          și actualizate. Cu toate acestea, nu garantăm că Site-ul nu va conține erori sau
          omisiuni.
        </p>
        <p>
          4.2. VerifiCasa nu poate fi trasă la răspundere pentru nicio daună directă sau indirectă
          ce rezultă din accesarea sau utilizarea acestui Site de prezentare.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          5. Drepturi de proprietate intelectuală
        </h2>
        <p>
          Întregul conținut al Site-ului (text, design, elemente grafice, logo-uri, materiale video
          demonstrative) este proprietatea VerifiCasa și este protejat de legislația privind
          drepturile de autor. Este interzisă copierea sau reproducerea conținutului fără acordul
          scris al proprietarului.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-base font-bold text-navy dark:text-foreground">
          6. Legea aplicabilă
        </h2>
        <p>
          Prezentul document este guvernat de legile din România. Orice neînțelegere legată de
          utilizarea Site-ului va fi rezolvată pe cale amiabilă sau de către instanțele
          judecătorești competente.
        </p>
      </section>
    </LegalPage>
  );
}