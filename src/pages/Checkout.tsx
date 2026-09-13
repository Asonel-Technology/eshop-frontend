import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "../data";
import { formatRWF } from "../data";
import { getProvinces, getDistricts, getSectors, uploadPaymentProof, submitOrder, LocationItem, PublicSettings } from "../services/api";

type CheckoutPage = "checkout" | "payment" | "success";

interface CheckoutProps {
  items: CartItem[];
  settings: PublicSettings | null;
  onClearCart: () => void;
}

export default function Checkout({ items, settings, onClearCart }: CheckoutProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState<CheckoutPage>("checkout");
  const [step, setStep] = useState(1);

  // Locations state
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [sectors, setSectors] = useState<LocationItem[]>([]);

  // Form state
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "",
    province: "", district: "", sector: "", address: "", notes: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] = useState<any>(null);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 50000 ? 0 : 2000;
  const total = subtotal + delivery;

  const momoCode = settings?.momoCode || "Not Available";

  useEffect(() => {
    getProvinces().then(setProvinces).catch(console.error);
  }, []);

  function handleProvinceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const pid = e.target.value;
    setForm(f => ({ ...f, province: pid, district: "", sector: "" }));
    setDistricts([]);
    setSectors([]);
    if (pid) getDistricts(pid).then(setDistricts).catch(console.error);
  }

  function handleDistrictChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const did = e.target.value;
    setForm(f => ({ ...f, district: did, sector: "" }));
    setSectors([]);
    if (did) getSectors(did).then(setSectors).catch(console.error);
  }

  function handleScreenshot(file: File) {
    if (file.size > 5 * 1024 * 1024) return alert("File must be under 5MB");
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function copyMomo() {
    navigator.clipboard.writeText(momoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed || !screenshot || submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    
    try {
      const url = await uploadPaymentProof(screenshot);

      const payload = {
        customerName: form.fullName,
        phone: form.phone,
        provinceId: form.province,
        districtId: form.district,
        sectorId: form.sector,
        paymentProofUrl: url,
        items: items.map(i => ({
          itemId: String(i.id),
          quantity: i.qty,
          size: i.variant
        }))
      };

      const res = await submitOrder(payload);
      setOrderResponse(res);
      onClearCart();
      setPage("success");
    } catch (e: any) {
      setErrorMessage(e.message || "Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  if (page === "success") {
    const orderNum = orderResponse?.order?.id || "#---";
    const orderTotal = orderResponse?.order?.total || total;
    const waUrl = orderResponse?.whatsappRedirectUrl;

    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-6xl mb-5">🎉</div>
        <h1 className="font-serif text-3xl font-bold mb-2">Order Received!</h1>
        <p className="text-muted-foreground text-[14px] mb-6 max-w-sm mx-auto">
          We&apos;ve received your order and payment confirmation. Our team will verify your payment and process your order.
        </p>

        <div className="bg-muted rounded-2xl p-5 text-left mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">Order ID</span>
            <span className="font-mono font-bold text-primary text-base">{orderNum}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-muted-foreground">Payment Status</span>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">⏳ Pending Verification</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-muted-foreground">Total Paid</span>
            <span className="font-bold">{formatRWF(orderTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">Expected Next Step</span>
            <span className="text-[12px]">Payment verification (2–4 hrs)</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold text-[12px] tracking-wider uppercase py-4 rounded-xl hover:bg-[#1ebe5a] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              Continue on WhatsApp
            </a>
          )}
          <button onClick={() => navigate("/")} className="bg-foreground text-background font-bold text-[12px] tracking-wider uppercase py-4 rounded-xl hover:bg-secondary transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (page === "payment") {
    return (
      <form onSubmit={submitPayment} className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-serif text-2xl font-bold mb-1">Complete Your Payment</h1>
        <p className="text-muted-foreground text-[13px] mb-8">Total: <span className="font-bold text-primary">{formatRWF(total)}</span></p>

        {/* MoMo instructions */}
        <div className="bg-[#FFF5F0] border border-[#FFD5C0] rounded-2xl p-5 mb-6">
          <p className="font-bold text-[13px] mb-1">Send {formatRWF(total)} to:</p>
          <div className="flex items-center justify-between bg-white rounded-xl border border-[#FFD5C0] px-4 py-3 mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">MTN Mobile Money</p>
              <p className="font-mono font-bold text-lg text-foreground">{momoCode}</p>
              <p className="text-[11px] text-muted-foreground">Blessing Ltd</p>
            </div>
            <button
              type="button"
              onClick={copyMomo}
              className="text-[11px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg transition-all"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            1. Open MTN MoMo on your phone<br />
            2. Send <strong>{formatRWF(total)}</strong> to <strong>{momoCode}</strong><br />
            3. Screenshot your payment confirmation<br />
            4. Upload it below and submit
          </p>
        </div>

        {/* Upload */}
        <div className="mb-5">
          <p className="text-[12px] font-bold mb-2">Upload Payment Confirmation</p>
          {!screenshotPreview ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:border-primary transition-colors">
              <span className="text-3xl mb-2">📸</span>
              <p className="text-[13px] font-semibold mb-0.5">Tap to upload screenshot</p>
              <p className="text-[11px] text-muted-foreground">JPG or PNG · Max 5MB</p>
              <input
                type="file"
                required
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleScreenshot(e.target.files[0])}
              />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-border">
              <img src={screenshotPreview} alt="Payment screenshot" className="w-full max-h-48 object-contain bg-muted" />
              <button
                type="button"
                onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
              >✕</button>
            </div>
          )}
        </div>

        {/* Confirm checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary"
          />
          <span className="text-[13px] leading-relaxed">I confirm that I have completed the payment of <strong>{formatRWF(total)}</strong> to the number above.</span>
        </label>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-[12px] mb-6">
            <strong className="font-bold">Payment Error: </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!confirmed || !screenshot || submitting}
          className="w-full bg-primary text-white font-bold text-[12px] tracking-[0.15em] uppercase py-4 rounded-xl hover:bg-secondary transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Submit Payment Confirmation"
          )}
        </button>
        <p className="text-center text-[11px] text-muted-foreground mt-3">Your order will be processed after payment verification (2–4 hrs)</p>
      </form>
    );
  }

  // Multi-step checkout
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-2xl font-bold mb-6">Checkout</h1>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {[
          { n: 1, label: "Your Info" },
          { n: 2, label: "Delivery" },
          { n: 3, label: "Review" },
          { n: 4, label: "Payment" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${step >= s.n ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
              {step > s.n ? "✓" : s.n}
            </div>
            <span className="text-[11px] font-semibold">{s.label}</span>
            {i < 3 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">

          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-base mb-5">Customer Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="Jean-Paul Hakizimana"
                    className="w-full border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    pattern="^(\+250|0)?7[2389]\d{7}$"
                    title="Must be a valid Rwandan phone number (e.g. 078XXXXXXX or +25078XXXXXXX)"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="078 XXX XXXX"
                    className="w-full border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@email.com"
                    className="w-full border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 w-full bg-primary text-white font-bold text-[11px] tracking-[0.15em] uppercase py-3.5 rounded-xl hover:bg-secondary transition-colors"
              >
                Continue to Delivery →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-base mb-5">Delivery Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Province</label>
                  <select
                    required
                    value={form.province}
                    onChange={handleProvinceChange}
                    className="w-full border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary bg-background"
                  >
                    <option value="">Select Province</option>
                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">District</label>
                  <select
                    required
                    value={form.district}
                    onChange={handleDistrictChange}
                    className="w-full border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary bg-background"
                    disabled={!form.province || districts.length === 0}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Sector</label>
                  <select
                    required
                    value={form.sector}
                    onChange={(e) => setForm(f => ({ ...f, sector: e.target.value }))}
                    className="w-full border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary bg-background"
                    disabled={!form.district || sectors.length === 0}
                  >
                    <option value="">Select Sector</option>
                    {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Street / Address</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="e.g. KG 7 Ave, House 12"
                    className="w-full border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5">Delivery Instructions (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="e.g. Call on arrival, leave at gate..."
                    rows={3}
                    className="w-full border border-border rounded-xl px-4 py-3 text-[13px] outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-border text-[11px] font-bold tracking-wider uppercase py-3.5 rounded-xl hover:bg-muted transition-colors">← Back</button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white font-bold text-[11px] tracking-[0.15em] uppercase py-3.5 rounded-xl hover:bg-secondary transition-colors"
                >
                  Review Order →
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-base mb-5">Order Review</h2>
              <div className="flex flex-col gap-3 mb-5">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-none">
                    <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-border" />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold">{item.name}</p>
                      {item.variant && <p className="text-[11px] text-muted-foreground">{item.variant}</p>}
                      <p className="text-[11px] text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                    <p className="font-bold text-[13px]">{formatRWF(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-muted rounded-xl p-4 text-[12px] mb-5">
                <div className="flex justify-between mb-1"><span className="text-muted-foreground">Delivering to:</span><span className="font-medium text-right">Selected Location</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Recipient:</span><span className="font-medium">{form.fullName} · {form.phone}</span></div>
              </div>
              {/* Payment method */}
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2">Payment Method</p>
              <div className="grid sm:grid-cols-2 gap-2 mb-5">
                {[
                  { id: "momo", label: "MTN Mobile Money", icon: "📱", sub: "Send to our MoMo number" },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <div>
                      <p className="text-[12px] font-bold">{method.label}</p>
                      <p className="text-[10px] text-muted-foreground">{method.sub}</p>
                    </div>
                    {paymentMethod === method.id && <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[9px]">✓</div>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-border text-[11px] font-bold tracking-wider uppercase py-3.5 rounded-xl hover:bg-muted transition-colors">← Back</button>
                <button
                  onClick={() => setPage("payment")}
                  className="flex-1 bg-primary text-white font-bold text-[11px] tracking-[0.15em] uppercase py-3.5 rounded-xl hover:bg-secondary transition-colors"
                >
                  Proceed to Payment →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="bg-card border border-border rounded-2xl p-5 h-fit">
          <p className="font-semibold text-[13px] mb-4">Order Summary</p>
          <div className="flex flex-col gap-2.5 mb-4 max-h-48 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">×{item.qty}</p>
                </div>
                <p className="text-[12px] font-bold flex-shrink-0">{formatRWF(item.price * item.qty)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-1.5 text-[12px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatRWF(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>Calculated on checkout</span></div>
            <div className="flex justify-between font-bold text-[14px] pt-2 border-t border-border mt-1">
              <span>Total Est.</span><span className="text-primary">{formatRWF(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
