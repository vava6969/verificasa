import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCountry } from "@/components/CountryContext";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import HeroPhoto from "@/components/HeroPhoto";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles, Clock, ShieldCheck, BadgePercent, Play, ArrowRight,
  Camera, FileText, TrendingUp, Home, Search as SearchIcon,
} from "lucide-react";

const STATS = (t) => [
  { icon: TrendingUp, label: t("stat1_lbl"), value: t("stat1_val") },
  { icon: Clock, label: t("stat2_lbl"), value: t("stat2_val") },
  { icon: BadgePercent, label: t("stat3_lbl"), value: t("stat3_val") },
];

const VALUE_PROPS = (t) => [
  { icon: Sparkles, title: t("vp1_t"), desc: t("vp1_d") },
  { icon: ShieldCheck, title: t("vp2_t"), desc: t("vp2_d") },
  { icon: BadgePercent, title: t("vp3_t"), desc: t("vp3_d") },
];

export default function Landing() {
  const { country, t } = useCountry();
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.Property.list("-created_date", 100);
        if (cancelled) return;
        setProperties(all.filter((p) => p.country === country));
      } catch (e) {
        if (!cancelled) setProperties([]);
      }
    })();
    return () => { cancelled = true; };
  }, [country]);

  const featured = (properties || []).filter((p) => p.featured).slice(0, 6);
  const display = featured.length ? featured : (properties || []).slice(0, 6);

  const heroBadge = country === "UK" ? t("hero_badge_uk") : t("hero_badge_ro");
  const ctaCountry = country === "UK" ? t("cta_d_uk") : t("cta_d_ro");

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[640px] overflow-hidden">
        <HeroPhoto />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-56 pt-24 text-center sm:px-6 sm:pb-64 sm:pt-28 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-semibold text-mint backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> {country === "UK" ? "🇬🇧" : "🇷🇴"} {t("hero_badge", { legalShort: heroBadge })}
          </span>

          <h1 className="mt-6 max-w-4xl font-heading text-4xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
            {t("hero_h1_a")}<br />
            <span className="text-mint">{t("hero_h1_b")}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-white/80 sm:text-lg">{t("hero_sub")}</p>

          <div className="mx-auto mt-9 w-full max-w-4xl">
            <SearchBar />
          </div>

          <div className="mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
            {[
              { label: t("quick_studio"), to: `/search?type=${country === "UK" ? "Studio" : "Garsonieră"}` },
              { label: t("quick_2"), to: "/search?type=2 Camere" },
              { label: t("quick_pet"), to: "/search" },
              { label: t("quick_parking"), to: "/search" },
              { label: country === "UK" ? t("quick_nofee_uk") : t("quick_nofee_ro"), to: "/search" },
            ].map((f, i) => (
              <Link
                key={i}
                to={f.to}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/85 backdrop-blur-md transition hover:bg-white/15 hover:text-mint"
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 px-4 sm:px-6 lg:px-8">
          {STATS(t).map((s, i) => (
            <div key={i} className="flex items-center gap-4 py-6 sm:justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-soft">
                <s.icon className="h-6 w-6 text-navy" />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-navy">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="bg-secondary/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-mint">{t("vp_kicker")}</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">{t("vp_h")}</h2>
            <p className="mt-3 text-muted-foreground">{t("vp_sub")}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {VALUE_PROPS(t).map((v, i) => (
              <div key={i} className="group rounded-2xl border border-border bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-mint shadow-soft">
                  <v.icon className="h-6 w-6 text-navy" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-navy">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section id="featured" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-mint">{t("feat_kicker")}</span>
              <h2 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">{t("feat_h")}</h2>
            </div>
            <Link to="/search" className="hidden items-center gap-1 text-sm font-semibold text-navy hover:text-mint sm:flex">
              {t("view_all")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {properties === null ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : display.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <Home className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3">{country === "UK" ? t("none_country_uk") : t("none_country_ro")}</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {display.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* AI MODULE HIGHLIGHT */}
      <section className="bg-navy-deep py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-mint">
              <Camera className="h-3.5 w-3.5" /> {t("ai_badge")}
            </span>
            <h2 className="mt-5 font-heading text-3xl font-bold leading-tight sm:text-4xl">{t("ai_h")}</h2>
            <p className="mt-4 text-white/70">{t("ai_d")}</p>
            <ul className="mt-6 space-y-3">
              {[t("ai_b1"), t("ai_b2"), t("ai_b3"), t("ai_b4")].map((txt, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint/20">
                    <Sparkles className="h-3.5 w-3.5 text-mint" />
                  </span>
                  {txt}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 gradient-mint text-navy shadow-soft hover:opacity-90">
              <Link to="/owner" className="gap-1.5">
                <Camera className="h-4 w-4" /> {t("ai_create")}
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1493809842364-78817add736c?w=1200&q=80"
                alt="AI Virtual Walkthrough preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/60 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-glow transition hover:scale-105">
                  <Play className="h-7 w-7 text-navy" />
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="rounded-full bg-navy/80 px-3 py-1.5 text-xs font-semibold text-mint backdrop-blur">AI Walkthrough</span>
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy">02:14</span>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-white p-4 shadow-soft sm:block">
              <p className="text-xs text-muted-foreground">{t("ai_views_label")}</p>
              <p className="font-heading text-2xl font-bold text-navy">+1,284</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-mint">{t("how_kicker")}</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">{t("how_h")}</h2>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-8 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-soft font-heading font-bold text-navy">A</span>
                <h3 className="font-heading text-xl font-bold text-navy">{t("for_tenants")}</h3>
              </div>
              <ol className="mt-6 space-y-5">
                {[
                  { icon: SearchIcon, t: t("t1"), d: t("t1d") },
                  { icon: Play, t: t("t2"), d: t("t2d") },
                  { icon: FileText, t: t("t3"), d: t("t3d") },
                ].map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-mint">
                      <s.icon className="h-5 w-5 text-navy" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-navy">{i + 1}. {s.t}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-border bg-white p-8 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-soft font-heading font-bold text-navy">B</span>
                <h3 className="font-heading text-xl font-bold text-navy">{t("for_owners")}</h3>
              </div>
              <ol className="mt-6 space-y-5">
                {[
                  { icon: Camera, t: t("o1"), d: t("o1d") },
                  { icon: Sparkles, t: t("o2"), d: t("o2d") },
                  { icon: TrendingUp, t: t("o3"), d: t("o3d") },
                ].map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-mint">
                      <s.icon className="h-5 w-5 text-navy" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-navy">{i + 1}. {s.t}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">{t("cta_h")}</h2>
          <p className="mt-3 text-muted-foreground">{t("cta_d", { country: ctaCountry })}</p>
          <Button asChild className="mt-6 gradient-mint text-navy shadow-soft hover:opacity-90">
            <Link to="/owner" className="gap-1.5"><Sparkles className="h-4 w-4" /> {t("cta_btn")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}