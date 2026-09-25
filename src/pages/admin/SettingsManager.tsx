import { useEffect, useState } from "react";
import { getDistricts, getProvinces, getSectors, LocationItem } from "../../services/api";
import { getAdminDeliveryFees, getAdminSettings, updateAdminSettings, upsertAdminDeliveryFee } from "../../services/admin";
import { ZONE_COPY } from "./labels";

const ZONE_ORDER = ["SAME_SECTOR", "SAME_DISTRICT", "SAME_PROVINCE", "OTHER"];

export default function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [momoCode, setMomoCode] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [sectorId, setSectorId] = useState("");

  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [sectors, setSectors] = useState<LocationItem[]>([]);
  const [fees, setFees] = useState<Record<string, number>>({});

  useEffect(() => {
    async function load() {
      try {
        const [shop, zoneFees, provs] = await Promise.all([
          getAdminSettings(),
          getAdminDeliveryFees(),
          getProvinces(),
        ]);
        setMomoCode(shop.momoCode || "");
        setWhatsappNumber(shop.whatsappNumber || "");
        setProvinceId(shop.shopProvinceId || "");
        setDistrictId(shop.shopDistrictId || "");
        setSectorId(shop.shopSectorId || "");
        setProvinces(provs);
        setFees(Object.fromEntries(zoneFees.map((z) => [z.zone, z.fee])));
        if (shop.shopProvinceId) setDistricts(await getDistricts(shop.shopProvinceId));
        if (shop.shopDistrictId) setSectors(await getSectors(shop.shopDistrictId));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function onProvince(id: string) {
    setProvinceId(id);
    setDistrictId("");
    setSectorId("");
    setSectors([]);
    setDistricts(id ? await getDistricts(id) : []);
  }

  async function onDistrict(id: string) {
    setDistrictId(id);
    setSectorId("");
    setSectors(id ? await getSectors(id) : []);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateAdminSettings({
        momoCode,
        whatsappNumber,
        shopProvinceId: provinceId,
        shopDistrictId: districtId,
        shopSectorId: sectorId,
      });
      await Promise.all(
        ZONE_ORDER.map((zone) => upsertAdminDeliveryFee(zone, Number(fees[zone] ?? 0)))
      );
      setSaved(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-[#6b6256]">Loading shop details…</p>;

  return (
    <form onSubmit={save} className="max-w-xl space-y-8">
      <p className="text-[14px] text-[#4a433a] leading-relaxed">
        Checkout uses whatever you save here.
      </p>

      {error && <p className="text-[#9a3412] text-[13px]">{error}</p>}
      {saved && <p className="text-[13px] text-[#3f6212]">Saved.</p>}

      <fieldset className="space-y-4">
        <legend className="text-[11px] tracking-[0.18em] uppercase text-[#6b6256]">Payment & WhatsApp</legend>
        <label className="block">
          <span className="block text-[12px] mb-1">MoMo code</span>
          <input
            value={momoCode}
            onChange={(e) => setMomoCode(e.target.value)}
            required
            className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0] outline-none focus:border-[#1c1915] tabular"
          />
        </label>
        <label className="block">
          <span className="block text-[12px] mb-1">WhatsApp number</span>
          <input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            required
            placeholder="0791829553"
            className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0] outline-none focus:border-[#1c1915] tabular"
          />
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-[11px] tracking-[0.18em] uppercase text-[#6b6256]">Shop location</legend>
        <p className="text-[12px] text-[#6b6256]">Delivery fees are measured from this sector.</p>
        <select value={provinceId} onChange={(e) => onProvince(e.target.value)} required className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0]">
          <option value="">Province</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={districtId} onChange={(e) => onDistrict(e.target.value)} required disabled={!provinceId} className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0]">
          <option value="">District</option>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={sectorId} onChange={(e) => setSectorId(e.target.value)} required disabled={!districtId} className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0]">
          <option value="">Sector</option>
          {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-[11px] tracking-[0.18em] uppercase text-[#6b6256]">Delivery fees (RWF)</legend>
        {ZONE_ORDER.map((zone) => (
          <label key={zone} className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-[13px]">{ZONE_COPY[zone].title}</span>
              <span className="block text-[11px] text-[#6b6256]">{ZONE_COPY[zone].hint}</span>
            </span>
            <input
              type="number"
              min={0}
              value={fees[zone] ?? 0}
              onChange={(e) => setFees((prev) => ({ ...prev, [zone]: Number(e.target.value) }))}
              className="w-28 h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0] text-right tabular"
            />
          </label>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={saving}
        className="h-11 px-6 bg-[#1c1915] text-[#efe8dc] text-[12px] tracking-[0.14em] uppercase disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save shop details"}
      </button>
    </form>
  );
}
