import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { makeT } from "@/i18n";

const CountryContext = createContext(null);

const RATES = {
  EUR: { EUR: 1, GBP: 0.85, RON: 4.97 },
  GBP: { EUR: 1.18, GBP: 1, RON: 5.85 },
  RON: { EUR: 0.20, GBP: 0.17, RON: 1 },
};

export function CountryProvider({ children }) {
  const [country, setCountry] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("ea_country") || "RO";
    return "RO";
  });

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("ea_country", country);
  }, [country]);

  const switchCountry = useCallback((c) => setCountry(c), []);

  const currency = country === "UK" ? "GBP" : "RON";
  const lang = country === "UK" ? "en" : "ro";

  const legalInfo = useMemo(() => {
    if (country === "UK") {
      return {
        tenantFee: "0 Fees for Tenants",
        legal1: "Tenant Fees Act 2019",
        legal2: "CMP Protected · Property Redress Scheme",
        commission: "Fee fully covered by landlord",
      };
    }
    return {
      tenantFee: "Comision Redus pentru Chiriași",
      legal1: "0% Comision Chiriași pe selectate",
      legal2: "ANPC · Protecția Consumatorului",
      commission: "Comision 30-50% din prima chirie",
    };
  }, [country]);

  const convert = useCallback(
    (amount, fromCurrency) => {
      const from = fromCurrency || currency;
      const rate = RATES[from]?.[currency] ?? 1;
      return Math.round(amount * rate);
    },
    [currency]
  );

  const formatPrice = useCallback(
    (amount, fromCurrency) => {
      const value = convert(amount, fromCurrency);
      const formatted = value.toLocaleString(country === "UK" ? "en-GB" : "ro-RO");
      return currency === "GBP" ? `£${formatted}` : currency === "EUR" ? `€${formatted}` : `${formatted} lei`;
    },
    [convert, currency, country]
  );

  const t = useMemo(() => makeT(lang), [lang]);

  const value = useMemo(
    () => ({ country, setCountry: switchCountry, currency, lang, t, legalInfo, convert, formatPrice }),
    [country, switchCountry, currency, lang, t, legalInfo, convert, formatPrice]
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}