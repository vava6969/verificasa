import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

const CountryContext = createContext(null);

const RATES = {
  // base EUR
  EUR: { EUR: 1, GBP: 0.85, RON: 4.97 },
  GBP: { EUR: 1.18, GBP: 1, RON: 5.85 },
  RON: { EUR: 0.20, GBP: 0.17, RON: 1 },
};

export function CountryProvider({ children }) {
  const [country, setCountry] = useState("RO"); // 'RO' | 'UK'

  const currency = country === "UK" ? "GBP" : "RON";
  const currencySymbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "lei";

  const legalInfo = useMemo(() => {
    if (country === "UK") {
      return {
        tenantFee: "0 Fees for Tenants",
        legal1: "Tenant Fees Act 2019",
        legal2: "CMP Protected · Property Redress Scheme",
        commission: "Comision suportat integral de proprietar (Landlord)",
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
      const formatted = value.toLocaleString("ro-RO");
      return currency === "GBP" ? `£${formatted}` : currency === "EUR" ? `€${formatted}` : `${formatted} lei`;
    },
    [convert, currency]
  );

  const value = useMemo(
    () => ({ country, setCountry, currency, currencySymbol, legalInfo, convert, formatPrice }),
    [country, currency, currencySymbol, legalInfo, convert, formatPrice]
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}