"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Language, translations, TranslationDictionary } from "./translations";

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationDictionary) => string;
}

const defaultContext: LocalizationContextType = {
  language: "id",
  setLanguage: () => undefined,
  t: (key) => translations.id[key] || (key as string),
};

export const LocalizationContext = createContext<LocalizationContextType>(defaultContext);

export function useLocalization() {
  return useContext(LocalizationContext);
}

export function useLocalizationProvider() {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quatro_language") as Language | null;
      if (saved === "id" || saved === "en") {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("quatro_language", lang);
    }
  }, []);

  const t = useCallback(
    (key: keyof TranslationDictionary): string => {
      const dict = translations[language] || translations.id;
      return dict[key] ?? translations.id[key] ?? (key as string);
    },
    [language]
  );

  return { language, setLanguage, t };
}
