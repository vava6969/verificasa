import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { CountryProvider } from "@/components/CountryContext";
import ScrollToTop from "@/components/ScrollToTop";
import InstagramPopup from "@/components/InstagramPopup";
import CookieBanner from "@/components/CookieBanner";

export default function Layout() {
  const { pathname } = useLocation();
  // Footerul (cu linkurile legale obligatorii) apare peste tot, mai puțin pe
  // suprafețele imersive unde ar rupe layoutul full-height.
  const NO_FOOTER_PATHS = ["/map", "/messages"];
  const showFooter = !NO_FOOTER_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const hideBottomNav = false;

  return (
    <CountryProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
        <Header />
        <main className="flex-1 overflow-x-hidden pb-16 md:pb-0">
          <Outlet />
        </main>
        {showFooter && <Footer />}
        {!hideBottomNav && <BottomNav />}
        <InstagramPopup />
        <CookieBanner />
      </div>
    </CountryProvider>
  );
}