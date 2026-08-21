// Partenerii VerifiCasa — sursă unică pentru pagina /parteneri și pentru
// caseta de partener de pe pagina anunțului (ContactPanel). Adăugarea unui
// partener nou = un obiect nou aici, nimic altceva.
//
// Logo-urile sunt self-hosted în public/images/partners/ — niciodată
// hotlink-uite (URL-urile lor de build se schimbă la fiecare deploy).
export const PARTNERS = [
  {
    id: "residence-vertical",
    name: "Residence Vertical",
    logo: "/images/partners/residence-vertical.png",
    url: "https://residencevertical.ro/?ref=verificasa",
    code: "VERIFICASA",
    discount: "10% reducere",
    tagline: "Verificare imobiliară independentă, 100% online",
    description:
      "Raport de verificare generat în câteva minute, cu date reale: cine e dezvoltatorul (identitate confirmată, statut ANAF, litigii), risc seismic și lista bulină roșie, autorizațiile de construire de la adresă, prețurile reale din zonă și siguranța cartierului.",
    services: [
      "Dezvoltator verificat (identitate, ANAF, litigii)",
      "Risc seismic și bulina roșie",
      "Autorizații de construire la adresă",
      "Prețul real al zonei",
      "Siguranța cartierului",
      "Verdict pentru investiție",
    ],
  },
];
