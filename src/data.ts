export type ProductVariantType = "size" | "color" | "storage" | "weight" | "quantity";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  img: string;
  qty: number;
  variant?: string;
  emoji?: string;
}

export interface ProductVariant {
  id?: string;
  color?: string;
  size?: string;
  quantity: number;
}

export interface Product {
  id: string | number;
  name: string;
  category: string;
  categoryId: string | number;
  categorySlug?: string;
  subcategoryId?: string;
  subcategory?: Subcategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  img: string;
  images?: string[];
  badge?: string;
  stock: "In Stock" | "Low Stock" | "Out of Stock";
  description: string;
  variants?: ProductVariant[];
  hasColors?: boolean;
  hasSizes?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isDeal?: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  img?: string;
  imageUrl?: string;
  description?: string;
  count?: number;
  color?: string;
  colorCode?: string;
  subcategories?: Subcategory[];
}

// Ensure mock arrays exist (temporarily leaving them for typing but we'll stop using them in prod)
export const categories: Category[] = [
  {
    id: "food", slug: "mock-slug",
    name: "Food & Groceries",
    icon: "🛒",
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop&auto=format",
    description: "Fresh meat, produce & daily essentials",
    count: 240,
    color: "#2D5016",
  },
  {
    id: "fashion", slug: "mock-slug",
    name: "Fashion",
    icon: "👗",
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop&auto=format",
    description: "Clothing for every style & occasion",
    count: 380,
    color: "#1A1A2E",
  },
  {
    id: "electronics", slug: "mock-slug",
    name: "Electronics",
    icon: "📱",
    img: "https://images.unsplash.com/photo-1468495244123-5d8ca7f93e16?w=600&h=400&fit=crop&auto=format",
    description: "Phones, audio, smart devices & more",
    count: 190,
    color: "#0A1628",
  },
  {
    id: "home-kitchen", slug: "mock-slug",
    name: "Home & Kitchen",
    icon: "🏠",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&auto=format",
    description: "Cookware, appliances & home décor",
    count: 275,
    color: "#2C1810",
  },
  {
    id: "beauty", slug: "mock-slug",
    name: "Beauty & Care",
    icon: "✨",
    img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop&auto=format",
    description: "Skincare, cosmetics & personal care",
    count: 145,
    color: "#2A1520",
  },
  {
    id: "baby", slug: "mock-slug",
    name: "Baby & Kids",
    icon: "👶",
    img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=400&fit=crop&auto=format",
    description: "Clothing, toys & essentials for little ones",
    count: 110,
    color: "#1A2A20",
  },
  {
    id: "shoes", slug: "mock-slug",
    name: "Shoes & Bags",
    icon: "👟",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop&auto=format",
    description: "Footwear & accessories for every look",
    count: 200,
    color: "#1C1410",
  },
  {
    id: "sports", slug: "mock-slug",
    name: "Sports & Outdoors",
    icon: "⚽",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format",
    description: "Fitness gear, outdoor & sports equipment",
    count: 130,
    color: "#0D2010",
  },
];

export const products: Product[] = [
  // ── Food & Groceries ────────────────────────────────────────────────
  {
    id: 1,
    name: "Premium Beef Ribeye",
    category: "Food & Groceries",
    categoryId: "food",
    price: 18000,
    originalPrice: 22000,
    rating: 4.9,
    reviews: 142,
    img: "https://images.unsplash.com/photo-1690983330536-3b0089d07cf9?w=600&h=600&fit=crop&auto=format",
    badge: "18% OFF",
    stock: "In Stock",
    description: "Premium grass-fed beef ribeye, hand-selected for exceptional marbling and flavor. Perfect for pan-searing or grilling.",
    variants: [{ type: "weight", label: "Weight", options: ["250g", "500g", "750g", "1kg"] }],
    isDeal: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: "Fresh Whole Chicken",
    category: "Food & Groceries",
    categoryId: "food",
    price: 9500,
    rating: 4.8,
    reviews: 97,
    img: "https://images.unsplash.com/photo-1672787153720-e85fe802fd9f?w=600&h=600&fit=crop&auto=format",
    badge: "Fresh",
    stock: "In Stock",
    description: "Farm-fresh whole chicken, cleaned and ready to cook. Raised without added hormones.",
    variants: [{ type: "weight", label: "Size", options: ["900g–1kg", "1–1.3kg", "1.3–1.6kg"] }],
    isFeatured: true,
  },
  {
    id: 3,
    name: "Organic Basmati Rice",
    category: "Food & Groceries",
    categoryId: "food",
    price: 12000,
    originalPrice: 14500,
    rating: 4.7,
    reviews: 203,
    img: "https://images.unsplash.com/photo-1536304993881-ff86e4c7d2ea?w=600&h=600&fit=crop&auto=format",
    badge: "17% OFF",
    stock: "In Stock",
    description: "Aromatic long-grain basmati rice. Fluffy, fragrant, and ideal for every meal.",
    variants: [{ type: "weight", label: "Size", options: ["1kg", "2kg", "5kg", "10kg"] }],
    isDeal: true,
  },
  {
    id: 4,
    name: "Homemade Beef Sausages",
    category: "Food & Groceries",
    categoryId: "food",
    price: 8000,
    rating: 4.6,
    reviews: 53,
    img: "https://images.unsplash.com/photo-1558199141-391d935676f0?w=600&h=600&fit=crop&auto=format",
    stock: "In Stock",
    description: "Traditionally seasoned beef sausages made fresh daily. Great for grilling or frying.",
    variants: [{ type: "weight", label: "Pack", options: ["6 pcs", "12 pcs", "24 pcs"] }],
    isNew: true,
  },

  // ── Fashion ────────────────────────────────────────────────────────
  {
    id: 5,
    name: "Men's Slim-Fit Chinos",
    category: "Fashion",
    categoryId: "fashion",
    price: 28000,
    originalPrice: 35000,
    rating: 4.6,
    reviews: 88,
    img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop&auto=format",
    badge: "20% OFF",
    stock: "In Stock",
    description: "Modern slim-fit chinos crafted from premium stretch cotton. Comfortable for work or weekends.",
    variants: [
      { type: "size", label: "Size", options: ["28", "30", "32", "34", "36"] },
      { type: "color", label: "Color", options: ["Navy", "Khaki", "Olive", "Black"] },
    ],
    isDeal: true,
    isFeatured: true,
  },
  {
    id: 6,
    name: "Women's Floral Midi Dress",
    category: "Fashion",
    categoryId: "fashion",
    price: 35000,
    rating: 4.8,
    reviews: 124,
    img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop&auto=format",
    stock: "In Stock",
    description: "Elegant floral midi dress with a relaxed fit. Perfect for any occasion.",
    variants: [
      { type: "size", label: "Size", options: ["XS", "S", "M", "L", "XL"] },
      { type: "color", label: "Color", options: ["Blue Floral", "Pink Floral", "White Floral"] },
    ],
    isFeatured: true,
    isNew: true,
  },
  {
    id: 7,
    name: "Men's Classic Polo Shirt",
    category: "Fashion",
    categoryId: "fashion",
    price: 18000,
    originalPrice: 22000,
    rating: 4.5,
    reviews: 67,
    img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=600&fit=crop&auto=format",
    badge: "18% OFF",
    stock: "Low Stock",
    description: "Premium pique cotton polo shirt with clean tailoring. A wardrobe essential.",
    variants: [
      { type: "size", label: "Size", options: ["S", "M", "L", "XL", "XXL"] },
      { type: "color", label: "Color", options: ["White", "Black", "Navy", "Burgundy"] },
    ],
    isDeal: true,
  },
  {
    id: 8,
    name: "Women's Linen Blazer",
    category: "Fashion",
    categoryId: "fashion",
    price: 55000,
    rating: 4.7,
    reviews: 41,
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop&auto=format",
    stock: "In Stock",
    description: "Tailored linen blazer that transitions seamlessly from office to evening.",
    variants: [
      { type: "size", label: "Size", options: ["XS", "S", "M", "L"] },
      { type: "color", label: "Color", options: ["Sand", "Black", "Cream"] },
    ],
    isNew: true,
  },

  // ── Electronics ───────────────────────────────────────────────────
  {
    id: 9,
    name: "Wireless Noise-Cancelling Earbuds",
    category: "Electronics",
    categoryId: "electronics",
    price: 45000,
    originalPrice: 58000,
    rating: 4.8,
    reviews: 319,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&auto=format",
    badge: "22% OFF",
    stock: "In Stock",
    description: "Premium wireless earbuds with active noise cancellation. Up to 30hrs battery life.",
    variants: [
      { type: "color", label: "Color", options: ["Black", "White", "Midnight Blue"] },
    ],
    isDeal: true,
    isFeatured: true,
  },
  {
    id: 10,
    name: "Smart Watch Pro",
    category: "Electronics",
    categoryId: "electronics",
    price: 85000,
    originalPrice: 105000,
    rating: 4.7,
    reviews: 188,
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&auto=format",
    badge: "19% OFF",
    stock: "In Stock",
    description: "Feature-packed smart watch with health monitoring, GPS, and 5-day battery life.",
    variants: [
      { type: "color", label: "Color", options: ["Black", "Silver", "Rose Gold"] },
      { type: "size", label: "Size", options: ["41mm", "45mm"] },
    ],
    isDeal: true,
    isFeatured: true,
  },
  {
    id: 11,
    name: "Portable Bluetooth Speaker",
    category: "Electronics",
    categoryId: "electronics",
    price: 55000,
    rating: 4.6,
    reviews: 97,
    img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&auto=format",
    stock: "In Stock",
    description: "360° immersive sound in a waterproof, durable body. 20hrs playtime.",
    variants: [
      { type: "color", label: "Color", options: ["Black", "Blue", "Red"] },
    ],
    isNew: true,
  },
  {
    id: 12,
    name: "USB-C Fast Charging Cable",
    category: "Electronics",
    categoryId: "electronics",
    price: 6500,
    originalPrice: 9000,
    rating: 4.5,
    reviews: 412,
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&auto=format",
    badge: "28% OFF",
    stock: "In Stock",
    description: "Braided USB-C cable with 100W fast charging support. Available in multiple lengths.",
    variants: [
      { type: "size", label: "Length", options: ["1m", "1.5m", "2m"] },
      { type: "color", label: "Color", options: ["Black", "White"] },
    ],
    isDeal: true,
  },

  // ── Home & Kitchen ────────────────────────────────────────────────
  {
    id: 13,
    name: "Professional Chef Knife",
    category: "Home & Kitchen",
    categoryId: "home-kitchen",
    price: 35000,
    originalPrice: 42000,
    rating: 4.9,
    reviews: 211,
    img: "https://images.unsplash.com/photo-1614362705324-8da11fd16754?w=600&h=600&fit=crop&auto=format",
    badge: "17% OFF",
    stock: "In Stock",
    description: "High-carbon stainless steel 8-inch chef knife. Precision-balanced for everyday professional use.",
    variants: [
      { type: "size", label: "Blade", options: ["6 inch", "8 inch", "10 inch"] },
    ],
    isDeal: true,
    isFeatured: true,
  },
  {
    id: 14,
    name: "Cast Iron Skillet",
    category: "Home & Kitchen",
    categoryId: "home-kitchen",
    price: 45000,
    rating: 4.8,
    reviews: 178,
    img: "https://images.unsplash.com/photo-1595440430968-ebc2d7bb0cb5?w=600&h=600&fit=crop&auto=format",
    stock: "In Stock",
    description: "Pre-seasoned cast iron skillet that gets better with every use. Oven-safe to 260°C.",
    variants: [
      { type: "size", label: "Size", options: ["20cm", "25cm", "30cm"] },
    ],
    isFeatured: true,
  },
  {
    id: 15,
    name: "Stainless Steel Cooking Pot",
    category: "Home & Kitchen",
    categoryId: "home-kitchen",
    price: 55000,
    rating: 4.7,
    reviews: 89,
    img: "https://images.unsplash.com/photo-1588279102819-f4520e40b1c6?w=600&h=600&fit=crop&auto=format",
    stock: "In Stock",
    description: "Heavy-duty stainless steel pot with glass lid. Tri-ply base for even heat distribution.",
    variants: [
      { type: "size", label: "Capacity", options: ["3L", "5L", "8L"] },
    ],
  },
  {
    id: 16,
    name: "Premium Kitchen Utensil Set",
    category: "Home & Kitchen",
    categoryId: "home-kitchen",
    price: 28000,
    originalPrice: 36000,
    rating: 4.6,
    reviews: 64,
    img: "https://images.unsplash.com/photo-1595440430803-3b21f072fb01?w=600&h=600&fit=crop&auto=format",
    badge: "22% OFF",
    stock: "In Stock",
    description: "5-piece silicone and stainless steel utensil set. Heat-resistant up to 220°C.",
    isDeal: true,
    isNew: true,
  },

  // ── Beauty & Care ─────────────────────────────────────────────────
  {
    id: 17,
    name: "Vitamin C Brightening Serum",
    category: "Beauty & Care",
    categoryId: "beauty",
    price: 22000,
    originalPrice: 28000,
    rating: 4.8,
    reviews: 156,
    img: "https://images.unsplash.com/photo-1571781926291-c9be8b922e13?w=600&h=600&fit=crop&auto=format",
    badge: "21% OFF",
    stock: "In Stock",
    description: "Concentrated 15% vitamin C serum for brighter, even-toned skin. Dermatologist tested.",
    isDeal: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 18,
    name: "Natural Shea Butter Moisturizer",
    category: "Beauty & Care",
    categoryId: "beauty",
    price: 15000,
    rating: 4.7,
    reviews: 98,
    img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop&auto=format",
    stock: "In Stock",
    description: "Rich, all-natural shea butter moisturizer. Suitable for all skin types.",
  },

  // ── Shoes & Bags ──────────────────────────────────────────────────
  {
    id: 19,
    name: "Men's Premium Sneakers",
    category: "Shoes & Bags",
    categoryId: "shoes",
    price: 48000,
    originalPrice: 60000,
    rating: 4.7,
    reviews: 134,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&auto=format",
    badge: "20% OFF",
    stock: "In Stock",
    description: "Cushioned sole, breathable mesh upper. Perfect for everyday wear.",
    variants: [
      { type: "size", label: "Size (EU)", options: ["39", "40", "41", "42", "43", "44", "45"] },
      { type: "color", label: "Color", options: ["White", "Black", "Grey"] },
    ],
    isDeal: true,
    isFeatured: true,
  },
  {
    id: 20,
    name: "Women's Leather Tote Bag",
    category: "Shoes & Bags",
    categoryId: "shoes",
    price: 65000,
    rating: 4.8,
    reviews: 77,
    img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop&auto=format",
    stock: "In Stock",
    description: "Spacious genuine leather tote with multiple interior pockets. A timeless classic.",
    variants: [
      { type: "color", label: "Color", options: ["Tan", "Black", "Burgundy"] },
    ],
    isNew: true,
  },

  // ── Sports & Outdoors ─────────────────────────────────────────────
  {
    id: 21,
    name: "Non-Slip Yoga Mat",
    category: "Sports & Outdoors",
    categoryId: "sports",
    price: 18000,
    originalPrice: 24000,
    rating: 4.6,
    reviews: 89,
    img: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop&auto=format",
    badge: "25% OFF",
    stock: "In Stock",
    description: "6mm thick eco-friendly TPE yoga mat. Superior grip, lightweight, and easy to clean.",
    variants: [
      { type: "color", label: "Color", options: ["Purple", "Blue", "Black", "Green"] },
    ],
    isDeal: true,
    isNew: true,
  },
  {
    id: 22,
    name: "Insulated Water Bottle",
    category: "Sports & Outdoors",
    categoryId: "sports",
    price: 12000,
    rating: 4.7,
    reviews: 203,
    img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&auto=format",
    stock: "In Stock",
    description: "Double-wall vacuum insulation keeps drinks cold 24hrs or hot 12hrs.",
    variants: [
      { type: "size", label: "Capacity", options: ["500ml", "750ml", "1L"] },
      { type: "color", label: "Color", options: ["Black", "White", "Steel Blue"] },
    ],
    isNew: true,
  },
];

export const deals = products.filter((p) => p.isDeal);
export const featured = products.filter((p) => p.isFeatured);
export const newArrivals = products.filter((p) => p.isNew);

export function getProductsByCategory(categoryId: string) {
  return products.filter((p) => p.categoryId === categoryId);
}

export function formatRWF(n: number) {
  return "RWF " + n.toLocaleString();
}

export function discountPct(current: number, original: number) {
  return Math.round(((original - current) / original) * 100);
}
