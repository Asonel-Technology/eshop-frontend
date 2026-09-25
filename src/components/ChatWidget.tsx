import { useState } from "react";
import { useI18n } from "../i18n/LanguageContext";
import type { MsgKey } from "../i18n/translations";

const QUESTIONS: { label: MsgKey; answer: MsgKey }[] = [
  { label: "help.find", answer: "help.findA" },
  { label: "help.order", answer: "help.orderA" },
  { label: "help.pay", answer: "help.payA" },
  { label: "help.del", answer: "help.delA" },
  { label: "help.ret", answer: "help.retA" },
];

export default function ChatWidget() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  const waText = lang === "rw"
    ? "Muraho%20Blessing%2C%20nkeneye%20ubufasha%20ku%20kurikira."
    : "Hello%20Blessing%2C%20I%20need%20help%20with%20an%20order.";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-6 z-40 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-secondary transition-colors"
        aria-label={t("nav.help")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-[13px] font-semibold">{t("nav.help")}</p>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground w-7 h-7" aria-label={t("nav.close")}>
              ✕
            </button>
          </div>

          <div className="px-4 py-3 flex flex-col gap-1.5">
            {QUESTIONS.map((q, i) => (
              <div key={q.label}>
                <button
                  onClick={() => setActive(active === i ? null : i)}
                  className="w-full text-left text-[12px] font-medium border border-border rounded-lg px-3 py-2 hover:border-foreground"
                >
                  {t(q.label)}
                </button>
                {active === i && (
                  <p className="text-[12px] text-muted-foreground leading-relaxed px-1 pt-2 pb-1">{t(q.answer)}</p>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border px-3 py-3">
            <a
              href={`https://wa.me/250791829553?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white text-[11px] font-bold tracking-wider uppercase py-2.5 rounded-lg hover:bg-[#1ebe5a]"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
