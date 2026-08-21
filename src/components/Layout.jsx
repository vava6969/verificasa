import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { CountryProvider } from "@/components/CountryContext";
import ScrollToTop from "@/components/ScrollToTop";
import InstagramPopup from "@/components/InstagramPopup";
import CookieBanner from "@/components/CookieBanner";
import { titleForPath } from "@/lib/pageTitle";

export default function Layout() {
  const { pathname } = useLocation();

  // Titlul se aplică central la fiecare schimbare de rută. Paginile care au
  // un titlu propriu (fișa unui anunț, un profil) îl suprascriu după, în
  // efectul lor — efectele copiilor rulează înaintea celui din Layout, deci
  // ordinea trebuie să fie: Layout pune baza, pagina o specializează.
  useEffect(() => {
    const lang = (typeof localStorage !== "undefined" && localStorage.getItem("vc_lang")) || "ro";
    document.title = titleForPath(pathname, lang);
  }, [pathname]);
  // Footerul e o secțiune de marketing/legal — îl arătăm doar pe paginile unde
  // are sens (homepage, contact și paginile legale), nu în restul aplicației.
  const FOOTER_PATHS = ["/", "/contact", "/terms", "/privacy", "/data-deletion", "/cookies"];
  const showFooter = FOOTER_PATHS.includes(pathname);
  const hideBottomNav = false;

  return (
    <CountryProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
        <Header />
        <main className="flex-1 overflow-x-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
          <Outlet />
        </main>
        {showFooter && <Footer />}
      </div>
      {/* Cromul fix stă ÎN AFARA containerului cu overflow-x-clip: `clip`
          decupează și descendenții position:fixed, motiv pentru care bara de
          jos părea că se plimbă odată cu pagina în loc să rămână lipită. */}
      {!hideBottomNav && <BottomNav />}
      <InstagramPopup />
      <CookieBanner />
    </CountryProvider>
  );
}