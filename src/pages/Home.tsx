import { useNavigate } from "react-router-dom";
import type { Product, Category } from "../data";
import { isButcherCategory } from "../data";
import ProductCard from "../components/ProductCard";
import { useI18n } from "../i18n/LanguageContext";

interface HomeProps {
  categories: Category[];
  featuredItems: Product[];
  onAddToCart: (p: Product) => void;
  onWishlist: (id: string | number) => void;
  wishlist: Set<string | number>;
}

function SectionHeader({ title, cta, onCta }: { title: string; cta?: string; onCta?: () => void }) {
  return (
    <div className="flex items-end justify-between mb-7">
      <h2 className="font-serif text-2xl sm:text-3xl font-semibold leading-tight">{title}</h2>
      {cta && (
        <button
          onClick={onCta}
          className="hidden sm:block text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {cta}
        </button>
      )}
    </div>
  );
}

export default function Home({ categories, featuredItems, onAddToCart, onWishlist, wishlist }: HomeProps) {
  const navigate = useNavigate();
  const { t, catalog } = useI18n();
  const butcher = categories.find((c) => isButcherCategory(c));
  const deals = featuredItems.filter((p) => p.originalPrice && p.originalPrice > p.price);
  const featured = featuredItems.slice(0, 8);

  const catPromos = categories
    .map((cat) => ({
      id: cat.slug,
      heading: cat.name,
      img: cat.imageUrl || cat.img,
      products: featuredItems.filter((p) => String(p.categoryId) === String(cat.id)).slice(0, 3),
    }))
    .filter((promo) => promo.products.length >= 3)
    .slice(0, 3);

  return (
    <div className="bg-background min-h-screen">
      <section className="bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-primary mb-5">{t("brand.city")}</p>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-[1.05] mb-5">
              {t("home.headline1")}<br />{t("home.headline2")}
            </h1>
            <p className="text-white/60 text-[15px] leading-relaxed mb-8 max-w-sm">
              {t("home.sub")}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/shop")}
                className="bg-primary text-white font-bold text-[11px] tracking-[0.15em] uppercase px-7 py-3.5 rounded-xl hover:bg-white hover:text-foreground transition-all"
              >
                {t("home.shop")}
              </button>
              {butcher && (
                <button
                  onClick={() => navigate(`/category/${butcher.slug}`)}
                  className="bg-white/10 border border-white/25 text-white font-bold text-[11px] tracking-[0.15em] uppercase px-7 py-3.5 rounded-xl hover:bg-white hover:text-foreground transition-all"
                >
                  {t("home.butcher")}
                </button>
              )}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className="group relative rounded-xl overflow-hidden aspect-[4/3] flex flex-col justify-end p-3 text-left"
                >
                  <img
                    src={cat.imageUrl || cat.img}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <p className="relative z-10 text-white text-[12px] font-semibold">{catalog(cat.slug, cat.name)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader title={t("home.shopByCategory")} cta={t("nav.allCategories")} onCta={() => navigate("/categories")} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group relative rounded-xl overflow-hidden aspect-[4/3] flex flex-col justify-end text-left border border-border hover:border-primary transition-colors"
              >
                <img
                  src={cat.imageUrl || cat.img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <p className="relative z-10 p-3.5 text-white text-[12px] font-semibold">{catalog(cat.slug, cat.name)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section className="py-12 sm:py-16 bg-[#FFF5F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader title={t("home.onOffer")} cta={t("home.allOffers")} onCta={() => navigate("/deals")} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {deals.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                  onWishlist={onWishlist}
                  onView={() => navigate(`/product/${p.id}`)}
                  wishlisted={wishlist.has(p.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader title={t("home.inTheShop")} cta={t("home.seeAll")} onCta={() => navigate("/shop")} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onWishlist={onWishlist}
                onView={() => navigate(`/product/${p.id}`)}
                wishlisted={wishlist.has(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      {catPromos.map((promo, i) => (
        <section key={promo.id} className={`py-12 sm:py-16 ${i % 2 === 0 ? "bg-[#F5F5F5]" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <button
                onClick={() => navigate(`/category/${promo.id}`)}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] flex flex-col justify-end p-6 text-left group"
              >
                {promo.img && (
                  <img
                    src={promo.img}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10">
                  <h3 className="font-serif text-2xl font-bold text-white mb-3">{catalog(promo.id, promo.heading)}</h3>
                  <span className="text-white text-[12px] font-medium">{t("home.shopCategory", { name: catalog(promo.id, promo.heading) })}</span>
                </div>
              </button>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {promo.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={onAddToCart}
                    onWishlist={onWishlist}
                    onView={() => navigate(`/product/${p.id}`)}
                    wishlisted={wishlist.has(p.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-y border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <p className="font-semibold text-[13px] mb-1">{t("home.deliveryTitle")}</p>
              <p className="text-muted-foreground text-[12px] leading-relaxed">{t("home.deliveryDesc")}</p>
            </div>
            <div>
              <p className="font-semibold text-[13px] mb-1">{t("home.momoTitle")}</p>
              <p className="text-muted-foreground text-[12px] leading-relaxed">{t("home.momoDesc")}</p>
            </div>
            <div>
              <p className="font-semibold text-[13px] mb-1">{t("home.butcherTitle")}</p>
              <p className="text-muted-foreground text-[12px] leading-relaxed">{t("home.butcherDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-primary">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-2">{t("home.ready")}</h2>
          <p className="text-white/65 text-sm mb-7">{t("home.readySub")}</p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-white text-primary font-bold text-[11px] tracking-[0.15em] uppercase px-6 py-3.5 rounded-xl hover:bg-foreground hover:text-white transition-colors"
          >
            {t("home.openShop")}
          </button>
        </div>
      </section>

      <footer className="bg-[#111111] text-white pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <p className="font-serif text-2xl font-bold mb-0.5">Blessing</p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-primary font-bold mb-4">{t("brand.taglineCity")}</p>
              <p className="text-white/35 text-[12px] leading-relaxed max-w-[200px]">
                {t("home.footerBlurb")}
              </p>
            </div>
            <div>
              <h4 className="text-[9px] tracking-[0.3em] uppercase font-bold text-white/30 mb-4">{t("home.shop")}</h4>
              <ul className="flex flex-col gap-2.5">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <button onClick={() => navigate(`/category/${cat.slug}`)} className="text-[12px] text-white/50 hover:text-white transition-colors">
                      {catalog(cat.slug, cat.name)}
                    </button>
                  </li>
                ))}
                <li>
                  <button onClick={() => navigate("/shop")} className="text-[12px] text-white/50 hover:text-white transition-colors">
                    {t("home.allProducts")}
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[9px] tracking-[0.3em] uppercase font-bold text-white/30 mb-4">{t("home.how")}</h4>
              <ul className="flex flex-col gap-2.5 text-[12px] text-white/50">
                <li>{t("home.how1")}</li>
                <li>{t("home.how2")}</li>
                <li>{t("home.how3")}</li>
                <li>{t("home.how4")}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[9px] tracking-[0.3em] uppercase font-bold text-white/30 mb-4">{t("home.contact")}</h4>
              <ul className="flex flex-col gap-2.5 text-[12px] text-white/50">
                <li>
                  <button onClick={() => navigate("/wishlist")} className="hover:text-white transition-colors">
                    {t("home.savedItems")}
                  </button>
                </li>
                <li>{t("home.waAfter")}</li>
                <li>Kigali, Rwanda</li>
              </ul>
            </div>
          </div>
          <div className="pt-5 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/20 text-[11px]">© 2026 Blessing. Kigali, Rwanda.</p>
            <p className="text-white/20 text-[11px]">MTN MoMo · Airtel Money</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
