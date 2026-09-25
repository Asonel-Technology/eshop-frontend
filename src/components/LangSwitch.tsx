import { useI18n } from "../i18n/LanguageContext";

export default function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div className={`inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide ${className}`} role="group" aria-label={t("lang.label")}>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-1.5 py-0.5 ${lang === "en" ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
        aria-pressed={lang === "en"}
      >
        {t("lang.en")}
      </button>
      <span className="text-muted-foreground/50">·</span>
      <button
        type="button"
        onClick={() => setLang("rw")}
        className={`px-1.5 py-0.5 ${lang === "rw" ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
        aria-pressed={lang === "rw"}
      >
        {t("lang.rw")}
      </button>
    </div>
  );
}
