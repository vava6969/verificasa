import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CountryProvider } from "@/components/CountryContext";
import ScrollToTop from "@/components/ScrollToTop";

export default function Layout() {
  return (
    <CountryProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CountryProvider>
  );
}