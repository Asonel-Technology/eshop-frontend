import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product, Category } from "../data";
import { formatRWF, discountPct } from "../data";
import ProductCard from "../components/ProductCard";

interface HomeProps {
  categories: Category[];
  featuredItems: Product[];
  onAddToCart: (p: Product) => void;
  onWishlist: (id: string | number) => void;
  wishlist: Set<string | number>;
}

function SectionHeader({ eyebrow, title, sub, cta, onCta }: { eyebrow: string; title: string; sub?: string; cta?: string; onCta?: () => void }) {
  return (
    <div className="flex items-end justify-between mb-7">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1">{eyebrow}</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold leading-tight">{title}</h2>
        {sub && <p className="text-muted-foreground text-[13px] mt-1">{sub}</p>}
      </div>
      {cta && (
        <button onClick={onCta} className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5 flex-shrink-0 ml-4">
          {cta}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ProductRow({ items, onAddToCart, onWishlist, wishlist }: {
  items: Product[];
  onAddToCart: (p: Product) => void;
  onWishlist: (id: string | number) => void;
  wishlist: Set<string | number>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  return (
    <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
      {items.map((p) => (
        <div key={p.id} className="w-[220px] flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
          <ProductCard product={p} onAddToCart={onAddToCart} onWishlist={onWishlist} onView={() => navigate(`/product/${p.id}`)} wishlisted={wishlist.has(p.id)} />
        </div>
      ))}
    </div>
  );
}

// ── Hero carousel ───────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    id: "main",
    eyebrow: "Rwanda's Premier Online Marketplace",
    pulse: true,
    headlineLines: ["Everything", "You Need."],
    accent: "In One Place.",
    sub: "Discover quality products across food, fashion, electronics, home and more - delivered to your door.",
    bg: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1800&h=700&fit=crop&auto=format",
    right: "categories" as const,
  },
  {
    id: "deals",
    eyebrow: "🔴 Limited Time Offers",
    pulse: false,
    headlineLines: ["Today's", "Biggest"],
    accent: "Deals.",
    sub: "Save up to 30% on trending products across all categories. Prices change daily - shop before they're gone.",
    bg: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1800&h=700&fit=crop&auto=format",
    right: "deals" as const,
  },
  {
    id: "new",
    eyebrow: "New This Week",
    pulse: false,
    headlineLines: ["Fresh Stock,", "Just"],
    accent: "Arrived.",
    sub: "New products added daily across all categories. Be the first to discover the latest additions.",
    bg: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1800&h=700&fit=crop&auto=format",
    right: "new" as const,
  },
  {
    id: "fashion",
    eyebrow: "Fashion & Style",
    pulse: false,
    headlineLines: ["Dress for", "Every"],
    accent: "Occasion.",
    sub: "The latest fashion trends for men and women at great prices. Explore looks for every style.",
    bg: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1800&h=700&fit=crop&auto=format",
    right: "fashion" as const,
  },
] as const;

function MiniProductGrid({ items }: { items: Product[] }) {
  const navigate = useNavigate();
  return (
    <div className="hidden lg:grid grid-cols-2 gap-2.5">
      {items.map((p) => (
        <button
          key={p.id}
          onClick={() => navigate(`/product/${p.id}`)}
          className="group relative bg-white/8 hover:bg-white/13 border border-white/10 hover:border-white/25 rounded-xl overflow-hidden text-left transition-all duration-200"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={p.img}
              alt={p.name}
              className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
            />
            {p.originalPrice && (
              <div className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-sm">
                -{discountPct(p.price, p.originalPrice)}% OFF
              </div>
            )}
          </div>
          <div className="p-2.5">
            <p className="text-white text-[11px] font-semibold line-clamp-1">{p.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-primary text-[12px] font-bold">{formatRWF(p.price)}</p>
              {p.originalPrice && (
                <p className="text-white/35 text-[10px] line-through">{formatRWF(p.originalPrice)}</p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

interface HeroCarouselProps {
  categories: Category[];
  deals: Product[];
  newArrivals: Product[];
  fashion: Product[];
}

function HeroCarousel({ categories, deals, newArrivals, fashion }: HeroCarouselProps) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const total = HERO_SLIDES.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slideProducts = {
    deals: deals.slice(0, 4),
    new: newArrivals.slice(0, 4),
    fashion: fashion.slice(0, 4),
  } as Record<string, Product[]>;

  return (
    <section
      className="relative bg-[#111111] overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide track */}
      <div
        className="flex"
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: "transform 950ms cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform",
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          setPaused(true);
        }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
          setTimeout(() => setPaused(false), 3500);
        }}
      >
        {HERO_SLIDES.map((slide) => (
          <div key={slide.id} className="w-full flex-shrink-0 min-h-[520px] flex items-center relative">
            {/* Background */}
            <img
              src={slide.bg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/95 via-[#111111]/75 to-transparent" />

            {/* Content grid */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12 items-center w-full">
              {/* Left: copy */}
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 ${slide.pulse ? "bg-primary/15 border border-primary/30" : "bg-white/10 border border-white/20"}`}>
                  {slide.pulse && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                  <span className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">{slide.eyebrow}</span>
                </div>

                <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-[1.03] mb-4">
                  {slide.headlineLines.map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                  <span className="text-primary">{slide.accent}</span>
                </h1>

                <p className="text-white/60 text-[15px] leading-relaxed mb-8 max-w-sm">{slide.sub}</p>

                <div className="flex flex-wrap gap-3 mb-10">
                  {slide.id === "main" && (
                    <>
                      <button
                        onClick={() => navigate("/shop")}
                        className="bg-primary text-white font-bold text-[11px] tracking-[0.15em] uppercase px-7 py-3.5 rounded-xl hover:bg-white hover:text-foreground transition-all"
                      >
                        Shop Now
                      </button>
                      <button
                        onClick={() => navigate("/shop")}
                        className="bg-white/10 border border-white/25 text-white font-bold text-[11px] tracking-[0.15em] uppercase px-7 py-3.5 rounded-xl hover:bg-white hover:text-foreground transition-all"
                      >
                        Explore Categories
                      </button>
                    </>
                  )}
                  {slide.id === "deals" && (
                    <>
                      <button
                        onClick={() => navigate("/deals")}
                        className="bg-primary text-white font-bold text-[11px] tracking-[0.15em] uppercase px-7 py-3.5 rounded-xl hover:bg-white hover:text-foreground transition-all"
                      >
                        View All Deals
                      </button>
                      <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-3.5 rounded-xl">
                        <span className="text-[11px] font-bold text-white tracking-wide">Up to 30% OFF</span>
                      </div>
                    </>
                  )}
                  {slide.id === "new" && (
                    <button
                      onClick={() => navigate("/new")}
                      className="bg-primary text-white font-bold text-[11px] tracking-[0.15em] uppercase px-7 py-3.5 rounded-xl hover:bg-white hover:text-foreground transition-all"
                    >
                      Shop New Arrivals
                    </button>
                  )}
                  {slide.id === "fashion" && (
                    <>
                      <button
                        onClick={() => navigate("/category/fashion")}
                        className="bg-primary text-white font-bold text-[11px] tracking-[0.15em] uppercase px-7 py-3.5 rounded-xl hover:bg-white hover:text-foreground transition-all"
                      >
                        Shop Fashion
                      </button>
                      <button
                        onClick={() => navigate("/shop")}
                        className="bg-white/10 border border-white/25 text-white font-bold text-[11px] tracking-[0.15em] uppercase px-7 py-3.5 rounded-xl hover:bg-white hover:text-foreground transition-all"
                      >
                        View All
                      </button>
                    </>
                  )}
                </div>

                {slide.id === "main" && (
                  <div className="flex flex-wrap gap-4">
                    {["✓ Secure Payment", "✓ Fast Delivery", "✓ Quality Products", "✓ Customer Support"].map((t) => (
                      <span key={t} className="text-white/50 text-[11px] font-medium">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: contextual panel */}
              {slide.right === "categories" && (
                <div className="hidden lg:grid grid-cols-2 gap-3">
                  {categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => navigate(`/category/${cat.slug}`)}
                      className="group relative rounded-xl overflow-hidden aspect-[4/3] flex flex-col justify-end p-3 text-left"
                    >
                      <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="relative z-10">
                        <p className="text-white text-[11px] font-bold leading-tight">{cat.name}</p>
                        <p className="text-white/50 text-[9px]">{cat.count}+ items</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {slide.right !== "categories" && (
                <MiniProductGrid items={slideProducts[slide.right] ?? []} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Prev arrow */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 hover:border-white/40 flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 hover:border-white/40 flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? "bg-white w-6 h-2" : "bg-white/35 hover:bg-white/60 w-2 h-2"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-5 right-6 z-20 text-white/30 text-[11px] font-semibold tabular-nums">
        {current + 1} / {total}
      </div>
    </section>
  );
}

// ── Main Home page ──────────────────────────────────────────────────────────

export default function Home({ categories, featuredItems, onAddToCart, onWishlist, wishlist }: HomeProps) {
  const navigate = useNavigate();
  const [heroEmail, setHeroEmail] = useState("");

  const catPromos = [
    {
      id: "food",
      heading: "Food & Groceries",
      sub: "Fresh picks for everyday life",
      img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop&auto=format",
      products: featuredItems.filter((p) => p.categoryId === "food").slice(0, 3),
    },
    {
      id: "electronics",
      heading: "Electronics",
      sub: "Upgrade your everyday tech",
      img: "https://images.unsplash.com/photo-1468495244123-5d8ca7f93e16?w=800&h=400&fit=crop&auto=format",
      products: featuredItems.filter((p) => p.categoryId === "electronics").slice(0, 3),
    },
    {
      id: "fashion",
      heading: "Fashion",
      sub: "Refresh your wardrobe",
      img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop&auto=format",
      products: featuredItems.filter((p) => p.categoryId === "fashion").slice(0, 3),
    },
    {
      id: "home-kitchen",
      heading: "Home & Kitchen",
      sub: "Make your home better",
      img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop&auto=format",
      products: featuredItems.filter((p) => p.categoryId === "home-kitchen").slice(0, 3),
    },
  ];

  const derivedDeals = featuredItems.filter(p => p.originalPrice && p.originalPrice > p.price).length > 0 ? featuredItems.filter(p => p.originalPrice && p.originalPrice > p.price) : featuredItems.slice(0, 4);
  const derivedNewArrivals = featuredItems.slice(0, 8);
  const derivedFashion = featuredItems.filter(p => p.categorySlug === "fashion" || p.categoryId === "fashion");

  return (
    <div className="bg-background min-h-screen">
      {/* ━ HERO CAROUSEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <HeroCarousel 
        categories={categories}
        deals={derivedDeals}
        newArrivals={derivedNewArrivals}
        fashion={derivedFashion}
      />

      {/* ━ CATEGORIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader eyebrow="Browse" title="Shop by Category" cta="All Categories" onCta={() => navigate("/shop")} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat) => (
            <button key={cat.id} onClick={() => navigate(`/category/${cat.slug}`)} className="group relative rounded-xl overflow-hidden aspect-[4/3] flex flex-col justify-end text-left border border-border hover:border-primary transition-colors hover:shadow-md">
              <img src={cat.imageUrl || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop&auto=format"} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 p-3.5">
                <p className="text-white text-[12px] font-bold leading-tight">{cat.name}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ━ DEALS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 sm:py-16 bg-[#FFF5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1">Limited Time</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Deals You Don&apos;t Want to Miss</h2>
              <p className="text-muted-foreground text-[13px] mt-1">Save big across all categories.</p>
            </div>
            <button onClick={() => navigate("/deals")} className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5">
              View All Deals
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {derivedDeals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onWishlist={onWishlist} onView={() => navigate(`/product/${p.id}`)} wishlisted={wishlist.has(p.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* ━ BEST SELLERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader eyebrow="Popular" title="Best Sellers" sub="Our most loved products across all categories." cta="View All" onCta={() => navigate("/bestsellers")} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredItems.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onWishlist={onWishlist} onView={() => navigate(`/product/${p.id}`)} wishlisted={wishlist.has(p.id)} />
          ))}
        </div>
      </section>

      {/* ━ NEW ARRIVALS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 sm:py-16 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader eyebrow="Just In" title="New Arrivals" sub="Fresh stock added this week." cta="See All New" onCta={() => navigate("/new")} />
          <ProductRow items={derivedNewArrivals} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
        </div>
      </section>

      {/* ── CATEGORY PROMO BLOCKS ─────────────────────────────────── */}
      {catPromos.map((promo, i) => (
        <section key={promo.id} className={`py-12 sm:py-16 ${i % 2 === 1 ? "bg-[#F5F5F5]" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <div onClick={() => navigate(`/category/${promo.id}`)} className="relative rounded-2xl overflow-hidden aspect-[4/3] flex flex-col justify-end p-6 cursor-pointer group">
                <img src={promo.img} alt={promo.heading} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10">
                  <h3 className="font-serif text-2xl font-bold text-white mb-1">{promo.heading}</h3>
                  <p className="text-white/60 text-sm mb-4">{promo.sub}</p>
                  <span className="inline-flex items-center gap-1.5 bg-primary text-white text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg">
                    Shop Category
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {promo.products.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onWishlist={onWishlist} onView={() => navigate(`/product/${p.id}`)} wishlisted={wishlist.has(p.id)} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── RECOMMENDED / POPULAR ─────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader eyebrow="For You" title="Popular Right Now" sub="Trending across all categories this week." cta="See All" onCta={() => navigate("/shop")} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredItems.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onWishlist={onWishlist} onView={() => navigate(`/product/${p.id}`)} wishlisted={wishlist.has(p.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────── */}
      <section className="border-y border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🚚", title: "Fast Delivery", desc: "Same-day in Kigali. Nationwide within 3 days." },
              { icon: "🔒", title: "Secure Payment", desc: "MTN MoMo & Airtel Money accepted." },
              { icon: "↩️", title: "Easy Returns", desc: "7-day return policy on all eligible items." },
              { icon: "💬", title: "24/7 Support", desc: "Chat, WhatsApp and phone support." },
            ].map((item, i) => (
              <div key={item.title} className={`flex items-start gap-3 ${i < 3 ? "lg:border-r lg:border-border lg:pr-6" : ""}`}>
                <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="font-semibold text-[13px] mb-0.5">{item.title}</p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────── */}
      <section className="py-14 bg-primary">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-2">Stay in the Loop</h2>
          <p className="text-white/65 text-sm mb-7">Get deals, new arrivals and exclusive offers delivered to your inbox.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
            <input
              type="email"
              value={heroEmail}
              onChange={(e) => setHeroEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/35 text-sm outline-none focus:border-white transition-colors"
            />
            <button type="submit" className="bg-white text-primary font-bold text-[11px] tracking-[0.15em] uppercase px-5 rounded-xl hover:bg-foreground hover:text-white transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="bg-[#111111] text-white pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            <div className="lg:col-span-1">
              <p className="font-serif text-2xl font-bold mb-0.5">Blessing</p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-primary font-bold mb-4">Your Online Marketplace</p>
              <p className="text-white/35 text-[12px] leading-relaxed mb-5 max-w-[180px]">
                Everything you need, delivered to your door across Rwanda.
              </p>
              <div className="flex gap-2.5">
                {["FB", "IG", "TW", "WA"].map((s) => (
                  <button key={s} className="w-8 h-8 rounded-lg border border-white/10 text-[9px] font-bold text-white/40 hover:border-primary hover:text-primary transition-colors uppercase">{s}</button>
                ))}
              </div>
            </div>
            {[
              { heading: "Shop", links: ["Food & Groceries", "Fashion", "Electronics", "Home & Kitchen", "Beauty & Care", "Shoes & Bags"] },
              { heading: "Account", links: ["My Account", "My Orders", "Wishlist", "Track Order", "Saved Addresses"] },
              { heading: "Help", links: ["Contact Us", "Delivery Info", "Returns Policy", "FAQs", "Payment Guide"] },
              { heading: "Contact", links: ["+250 788 000 000", "hello@blessing.rw", "KG 7 Ave, Kigali", "Mon–Sat: 8am–8pm"] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="text-[9px] tracking-[0.3em] uppercase font-bold text-white/30 mb-4">{col.heading}</h4>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-[12px] text-white/50 hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-5 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/20 text-[11px]">© 2026 Blessing Ltd. All rights reserved. Kigali, Rwanda.</p>
            <div className="flex items-center gap-3">
              <div className="bg-[#25D366] text-white text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                WhatsApp Support
              </div>
              <span className="text-white/20 text-[11px]">MTN MoMo · Airtel Money</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
