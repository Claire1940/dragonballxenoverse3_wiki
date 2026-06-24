"use client";

import { Suspense, lazy } from "react";
import { Sparkles, Gamepad2, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  locale: string;
}

// Tools Grid 卡片锚点 → 对应模块 section id（平滑滚动）
const TOOLS_SECTION_IDS = [
  "release-date-platforms",
  "official-news-trailer-timeline",
  "age-1000-story-guide",
  "gameplay-combat-guide",
  "characters-and-roster",
  "builds-and-customization",
  "editions-price-wishlist",
  "codes-and-bonuses",
];

// 模块内卡片图标（每个模块内每张卡不同图标，避免重复）
const EDITIONS_ICONS = ["Store", "Globe", "Smartphone", "Laptop"];
const CODES_ICONS = ["Gift", "Mail", "Tag", "Bell", "Star", "Check"];

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.dragonballxenoverse3.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Dragon Ball Xenoverse 3 Wiki",
        description:
          "Complete Dragon Ball Xenoverse 3 Wiki covering release date, platforms, West City, AGE 1000, races, Soul Assist, Soul Switch, characters, trailers and builds.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Dragon Ball Xenoverse 3 - AGE 1000 Action RPG",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Dragon Ball Xenoverse 3 Wiki",
        alternateName: "Dragon Ball Xenoverse 3",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Dragon Ball Xenoverse 3 Wiki - AGE 1000 Action RPG",
        },
        sameAs: [
          "https://store.steampowered.com/app/1857810/Dragon_Ball_Xenoverse_3/",
          "https://store.playstation.com/concept/10013126",
          "https://www.xbox.com/games/store/dragon-ball-xenoverse-3",
          "https://www.reddit.com/r/dbxv/",
          "https://twitter.com/bandainamcoeu",
          "https://www.youtube.com/user/NamcoBandaiGamesEU",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Dragon Ball Xenoverse 3",
        gamePlatform: ["PlayStation 5", "Xbox Series X|S", "PC (Steam)"],
        applicationCategory: "Game",
        genre: ["Action", "Adventure", "RPG"],
        developer: {
          "@type": "Organization",
          name: "Dimps",
        },
        publisher: {
          "@type": "Organization",
          name: "Bandai Namco Entertainment",
        },
        operatingSystem: ["PlayStation 5", "Xbox Series X|S", "Windows"],
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/PreOrder",
          url: "https://store.steampowered.com/app/1857810/Dragon_Ball_Xenoverse_3/",
        },
      },
      {
        "@type": "VideoObject",
        name: "DRAGON BALL XENOVERSE 3 - Welcome to West City Trailer",
        description:
          "Official Dragon Ball Xenoverse 3 Welcome to West City trailer from Bandai Namco Entertainment, revealing AGE 1000, West City, the Great Saiya Squad, Soul Assist and Soul Switch.",
        uploadDate: "2026-06-23",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/47I-Xb2bGu0",
        url: "https://www.youtube.com/watch?v=47I-Xb2bGu0",
      },
    ],
  };

  const mobileBannerAd = getPreferredMobileBannerSelection();

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <a
                href="https://store.steampowered.com/app/1857810/Dragon_Ball_Xenoverse_3/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <Gamepad2 className="w-5 h-5" />
                {t.hero.playOnSteamCTA}
              </a>
              <a
                href="https://bandainamcoent.com/games/dragon-ball-xenoverse-3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.getFreeCodesCTA}
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 区域（max-w-5xl） */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="47I-Xb2bGu0"
              title="DRAGON BALL XENOVERSE 3 - Welcome to West City Trailer"
            />
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* Tools Grid - 4 Navigation Cards（max-w-5xl） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = TOOLS_SECTION_IDS[index];

              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Release Date and Platforms (info-cards) */}
      <section id="release-date-platforms" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4
                         bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                         text-xs md:text-sm font-medium text-[hsl(var(--nav-theme-light))]"
            >
              {t.modules.dbxv3ReleaseDatePlatforms.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.dbxv3ReleaseDatePlatforms.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-3">
              {t.modules.dbxv3ReleaseDatePlatforms.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl mx-auto">
              {t.modules.dbxv3ReleaseDatePlatforms.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.dbxv3ReleaseDatePlatforms.items.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 mb-3
                               bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                               text-xs font-medium text-[hsl(var(--nav-theme-light))]"
                  >
                    {item.label}
                  </span>
                  <p className="text-lg md:text-xl font-bold mb-2">
                    {item.value}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {item.details}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Official News and Trailer Timeline (timeline) */}
      <section
        id="official-news-trailer-timeline"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4
                         bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                         text-xs md:text-sm font-medium text-[hsl(var(--nav-theme-light))]"
            >
              {t.modules.dbxv3OfficialNewsTimeline.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.dbxv3OfficialNewsTimeline.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-3">
              {t.modules.dbxv3OfficialNewsTimeline.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl mx-auto">
              {t.modules.dbxv3OfficialNewsTimeline.intro}
            </p>
          </div>

          <div className="scroll-reveal relative pl-6 md:pl-8 border-l-2 border-[hsl(var(--nav-theme)/0.3)] space-y-6 md:space-y-8">
            {t.modules.dbxv3OfficialNewsTimeline.items.map(
              (entry: any, index: number) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[1.4rem] md:-left-[1.9rem] w-4 h-4 rounded-full bg-[hsl(var(--nav-theme))] border-2 border-background" />
                  <div className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                        {entry.type}
                      </span>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <time className="text-xs text-muted-foreground">
                        {entry.date}
                      </time>
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-1.5">
                      {entry.headline}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {entry.summary}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 3: Age 1000 Story Guide (story-cards) */}
      <section id="age-1000-story-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4
                         bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                         text-xs md:text-sm font-medium text-[hsl(var(--nav-theme-light))]"
            >
              {t.modules.dbxv3Age1000Story.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.dbxv3Age1000Story.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-3">
              {t.modules.dbxv3Age1000Story.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl mx-auto">
              {t.modules.dbxv3Age1000Story.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.dbxv3Age1000Story.items.map((card: any, index: number) => (
              <div
                key={index}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 mb-3
                             bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                             text-xs font-medium text-[hsl(var(--nav-theme-light))]"
                >
                  {card.category}
                </span>
                <h3 className="font-bold text-base md:text-lg mb-2">
                  {card.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 4: Gameplay and Combat Guide (step-by-step) */}
      <section
        id="gameplay-combat-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4
                         bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                         text-xs md:text-sm font-medium text-[hsl(var(--nav-theme-light))]"
            >
              {t.modules.dbxv3GameplayCombat.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.dbxv3GameplayCombat.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-3">
              {t.modules.dbxv3GameplayCombat.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl mx-auto">
              {t.modules.dbxv3GameplayCombat.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-3 md:space-y-4">
            {t.modules.dbxv3GameplayCombat.items.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {step.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: module4 → module5 阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 5: Characters and Roster (card-list) */}
      <section
        id="characters-and-roster"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4
                         bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                         text-xs md:text-sm font-medium text-[hsl(var(--nav-theme-light))]"
            >
              {t.modules.dbxv3CharactersRoster.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.dbxv3CharactersRoster.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-3">
              {t.modules.dbxv3CharactersRoster.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl mx-auto">
              {t.modules.dbxv3CharactersRoster.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.dbxv3CharactersRoster.items.map(
              (character: any, index: number) => (
                <div
                  key={index}
                  className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 mb-3
                               bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                               text-xs font-medium text-[hsl(var(--nav-theme-light))]"
                  >
                    {character.type}
                  </span>
                  <h3 className="font-bold text-base md:text-lg mb-2">
                    {character.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    <span className="font-medium text-foreground/80">
                      {character.role}
                    </span>
                    <span className="mx-2 text-border">•</span>
                    <span>{character.faction}</span>
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {character.details}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 6: Builds and Customization (build-grid) */}
      <section
        id="builds-and-customization"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4
                         bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                         text-xs md:text-sm font-medium text-[hsl(var(--nav-theme-light))]"
            >
              {t.modules.dbxv3BuildsCustomization.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.dbxv3BuildsCustomization.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-3">
              {t.modules.dbxv3BuildsCustomization.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl mx-auto">
              {t.modules.dbxv3BuildsCustomization.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.dbxv3BuildsCustomization.items.map(
              (build: any, index: number) => (
                <div
                  key={index}
                  className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 mb-3
                               bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                               text-xs font-medium text-[hsl(var(--nav-theme-light))]"
                  >
                    {build.category}
                  </span>
                  <h3 className="font-bold text-lg md:text-xl mb-1.5">
                    {build.name}
                  </h3>
                  <p className="text-sm font-medium text-[hsl(var(--nav-theme-light))] mb-2">
                    {build.focus}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    {build.details}
                  </p>
                  <div className="rounded-lg bg-[hsl(var(--nav-theme)/0.08)] border border-[hsl(var(--nav-theme)/0.2)] px-3 py-2.5">
                    <p className="text-sm text-foreground/90">
                      <span className="font-semibold">How to use: </span>
                      {build.playerUse}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 7: module6 → module7 阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 7: Editions, Price, and Wishlist Guide (comparison-table) */}
      <section
        id="editions-price-wishlist"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4
                         bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                         text-xs md:text-sm font-medium text-[hsl(var(--nav-theme-light))]"
            >
              {t.modules.dbxv3EditionsPrice.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.dbxv3EditionsPrice.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-3">
              {t.modules.dbxv3EditionsPrice.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl mx-auto">
              {t.modules.dbxv3EditionsPrice.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.dbxv3EditionsPrice.items.map(
              (store: any, index: number) => {
                const icon = EDITIONS_ICONS[index % EDITIONS_ICONS.length];
                return (
                  <div
                    key={index}
                    className="flex flex-col p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                        <DynamicIcon
                          name={icon}
                          className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                        />
                      </div>
                      <h3 className="font-bold text-base md:text-lg">
                        {store.storefront}
                      </h3>
                    </div>
                    <dl className="flex-1 space-y-2 text-sm mb-4">
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Platform</dt>
                        <dd className="text-right font-medium">{store.platform}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Release</dt>
                        <dd className="text-right font-medium">
                          {store.releaseStatus}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Wishlist</dt>
                        <dd className="text-right font-medium">
                          {store.wishlistStatus}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Price</dt>
                        <dd className="text-right font-medium">{store.price}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Developer</dt>
                        <dd className="text-right font-medium">
                          {store.developer}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Genre</dt>
                        <dd className="text-right font-medium">{store.genre}</dd>
                      </div>
                    </dl>
                    <a
                      href={store.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-border hover:bg-white/10 text-sm font-medium transition-colors"
                    >
                      Visit Store
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Module 8: Codes and Bonuses (code-cards) */}
      <section
        id="codes-and-bonuses"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4
                         bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                         text-xs md:text-sm font-medium text-[hsl(var(--nav-theme-light))]"
            >
              {t.modules.dbxv3CodesBonuses.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.dbxv3CodesBonuses.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-3">
              {t.modules.dbxv3CodesBonuses.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-3xl mx-auto">
              {t.modules.dbxv3CodesBonuses.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.dbxv3CodesBonuses.items.map(
              (reward: any, index: number) => {
                const icon = CODES_ICONS[index % CODES_ICONS.length];
                const isAvailable = /available|signup/i.test(reward.status);
                return (
                  <div
                    key={index}
                    className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                        <DynamicIcon
                          name={icon}
                          className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                        />
                      </div>
                      <h3 className="font-bold text-base md:text-lg">
                        {reward.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 mb-3 text-xs font-medium border ${
                        isAvailable
                          ? "bg-[hsl(var(--nav-theme)/0.1)] border-[hsl(var(--nav-theme)/0.3)] text-[hsl(var(--nav-theme-light))]"
                          : "bg-white/5 border-border text-muted-foreground"
                      }`}
                    >
                      {reward.status}
                    </span>
                    <p className="text-xs text-muted-foreground mb-1">
                      <span className="font-medium text-foreground/70">
                        Type:{" "}
                      </span>
                      {reward.rewardType}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      <span className="font-medium text-foreground/70">
                        Where to check:{" "}
                      </span>
                      {reward.whereToCheck}
                    </p>
                    <p className="text-sm text-foreground/90">{reward.action}</p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.reddit.com/r/dbxv/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/bandainamcoeu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://steamcommunity.com/app/1857810"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/1857810/Dragon_Ball_Xenoverse_3/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
