import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { makeT } from "@/i18n";

const CountryContext = createContext(null);

const RATES = {
  EUR: { EUR: 1, RON: 4.97, GBP: 0.85 },
  RON: { EUR: 0.20, RON: 1, GBP: 0.17 },
  GBP: { EUR: 1.18, RON: 5.85, GBP: 1 },
};

export function CountryProvider({ children }) {
  // VerifiCasa is a Romania-first platform. country stays RO; users switch
  // the display currency between EUR (default) and RON.
  const [country, setCountry] = useState("RO");
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("vc_currency") || "EUR";
    return "EUR";
  });

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("vc_currency", currency);
  }, [currency]);

  const lang = "ro";

  const legalInfo = useMemo(
    () => ({
      legal1: "Conform ANPC · Protecția Consumatorului",
      legal2: "Inspecții fizice verificate",
      commission: "Comision corect · 0% chiriași pe selectate",
    }),
    []
  );

  const convert = useCallback(
    (amount, fromCurrency, target) => {
      const from = fromCurrency || currency;
      const to = target || currency;
      const rate = RATES[from]?.[to] ?? 1;
      return Math.round((amount || 0) * rate);
    },
    [currency]
  );

  const formatPrice = useCallback(
    (amount, fromCurrency, target) => {
      const to = target || currency;
      const value = convert(amount, fromCurrency, to);
      const formatted = value.toLocaleString("ro-RO");
      return to === "EUR" ? `€${formatted}` : to === "GBP" ? `£${formatted}` : `${formatted} lei`;
    },
    [convert, currency]
  );

  const t = useMemo(() => makeT(lang), [lang]);

  const value = useMemo(
    () => ({ country, setCountry, currency, setCurrency, lang, t, legalInfo, convert, formatPrice }),
    [country, currency, lang, t, legalInfo, convert, formatPrice]
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}