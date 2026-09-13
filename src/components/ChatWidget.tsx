import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const QUICK_ACTIONS = [
  { label: "Find a product", msg: "Help me find a product" },
  { label: "Track my order", msg: "I want to track my order" },
  { label: "Payment help", msg: "I need help with payment" },
  { label: "Delivery info", msg: "What are your delivery options?" },
  { label: "Return policy", msg: "What is your return policy?" },
  { label: "Talk to support", msg: "I want to speak with a human agent" },
];

const RESPONSES: Record<string, string> = {
  "Help me find a product": "I'd be happy to help you find something! You can browse our categories — Food & Groceries, Fashion, Electronics, Home & Kitchen, and more. What are you looking for today?",
  "I want to track my order": "To track your order, please share your order number (format: #BL-XXXXX) and I'll look that up for you.",
  "I need help with payment": "We accept MTN Mobile Money and Airtel Money. After placing your order, you'll receive our business MoMo number to send payment and upload your confirmation screenshot.",
  "What are your delivery options?": "We offer delivery across Rwanda! Orders over 50,000 RWF get free delivery. Standard delivery is 2,000 RWF. Kigali orders are typically delivered within 24hrs.",
  "What is your return policy?": "We have a 7-day return policy on most items. Products must be unused and in original packaging. Food items are non-returnable. Contact us within 7 days of delivery.",
  "I want to speak with a human agent": "I'll connect you with our support team right away! You can also reach us on WhatsApp for faster assistance. Tap the WhatsApp button below.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const reply = RESPONSES[text] ||
        "Thanks for your message! Our team will get back to you shortly. For urgent help, please use WhatsApp below.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setLoading(false);
    }, 900);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-6 z-40 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-secondary transition-colors"
        aria-label="Chat with Blessing"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Chat drawer */}
      {open && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden" style={{ maxHeight: "520px" }}>

          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🛍️</div>
              <div>
                <p className="text-white text-[13px] font-semibold">Blessing Assistant</p>
                <p className="text-white/70 text-[10px]">● Online · Replies instantly</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-sm">🛍️</div>
                  <div className="bg-muted rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[250px]">
                    <p className="text-[12px] leading-relaxed">Hi 👋 I'm the Blessing Assistant. How can I help you today?</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 pl-9">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1">Quick actions</p>
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.msg)}
                      className="text-left text-[11px] font-medium border border-border rounded-lg px-3 py-2 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-sm">🛍️</div>
                )}
                <div className={`rounded-2xl px-3.5 py-2.5 max-w-[250px] text-[12px] leading-relaxed ${msg.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-muted rounded-tl-none"}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-sm">🛍️</div>
                <div className="bg-muted rounded-2xl rounded-tl-none px-3.5 py-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border px-3 py-3 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Type a message..."
              className="flex-1 text-[12px] bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary placeholder-muted-foreground"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* WhatsApp CTA */}
          <div className="border-t border-border px-3 py-2 flex-shrink-0">
            <a
              href="https://wa.me/250788000000?text=Hello%20Blessing%20%F0%9F%91%8B%20I%20need%20help%20with%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white text-[11px] font-bold tracking-wider uppercase py-2.5 rounded-lg hover:bg-[#1ebe5a] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              Continue on WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
