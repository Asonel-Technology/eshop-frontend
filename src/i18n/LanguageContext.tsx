import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { catalogKey, messages, type Lang, type MsgKey } from "./translations";

const STORAGE_KEY = "blessingLang";

function readLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "rw") return stored;
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("rw")) return "rw";
  return "en";
}

type Vars = Record<string, string | number>;

function fill(template: string, vars?: Vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MsgKey, vars?: Vars) => string;
  catalog: (slugOrName?: string, fallback?: string) => string;
  stock: (value: string) => string;
}

const LanguageContext = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);

  useEffect(() => {
    document.documentElement.lang = lang === "rw" ? "rw" : "en";
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const value = useMemo<I18n>(() => {
    const dict = messages[lang];
    const t = (key: MsgKey, vars?: Vars) => fill(dict[key] ?? messages.en[key], vars);
    return {
      lang,
      setLang: setLangState,
      t,
      catalog: (slugOrName, fallback) => {
        const key = catalogKey(slugOrName);
        if (key) return t(key);
        return fallback || slugOrName || "";
      },
      stock: (value) => {
        if (value === "Out of Stock") return t("stock.out");
        if (value === "Low Stock") return t("stock.low");
        if (value === "In Stock") return t("stock.in");
        return value;
      },
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}
