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
  // Admin panel and the unified map+list search are full-height work surfaces
  // (the map fills the viewport) — no marketing footer there. /search now
  // renders the same full-height page as /map, so it's excluded too.
  const hideFooter = pathname.startsWith("/admin") || pathname.startsWith("/messages") || pathname.startsWith("/map") || pathname.startsWith("/search");
  const hideBottomNav = false;

  return (
    <CountryProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
        <Header />
        <main className="flex-1 overflow-x-hidden pb-16 md:pb-0">
          <Outlet />
        </main>
        {!hideFooter && <Footer />}
        {!hideBottomNav && <BottomNav />}
        <InstagramPopup />
        <CookieBanner />
      </div>
    </CountryProvider>
  );
}