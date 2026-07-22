"use client";

import { createContext, useContext, type ReactNode } from "react";

export type Locale = "en" | "zh";

export interface ClientDictionary {
  topBar: {
    switchTo: string;
  };
  mainHeader: {
    searchPlaceholder: string;
    cta: string;
    ctaShort: string;
  };
  mobileNav: {
    menu: string;
    overview: string;
  };
  search: {
    pageTitle: string;
    placeholder: string;
    noQuery: string;
    noResults: string;
    viewAll: string;
    categories: {
      all: string;
      page: string;
      product: string;
      capability: string;
      caseStudy: string;
      faq: string;
    };
  };
}

interface LocaleContextValue {
  locale: Locale;
  dict: ClientDictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: ClientDictionary;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
