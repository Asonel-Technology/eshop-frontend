export const STATUS_LABEL: Record<string, string> = {
  PENDING_CONFIRMATION: "Waiting on WhatsApp",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  DELIVERED: "Delivered",
};

export const ZONE_COPY: Record<string, { title: string; hint: string }> = {
  SAME_SECTOR: { title: "Gahanga", hint: "Same sector as the shop" },
  SAME_DISTRICT: { title: "Rest of Kicukiro", hint: "Same district, not Gahanga" },
  SAME_PROVINCE: { title: "Rest of Kigali", hint: "Gasabo and Nyarugenge" },
  OTHER: { title: "Outside Kigali", hint: "Anywhere else in Rwanda" },
};

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export function stockQty(item: { quantity?: number; variants?: { quantity?: number }[] }) {
  if (item.variants?.length) {
    return item.variants.reduce((sum, v) => sum + (v.quantity ?? 0), 0);
  }
  return item.quantity ?? 0;
}
