"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, ExternalLink } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
  /** 本地视频预览封面（poster），默认使用主题 hero.webp，避免依赖 YouTube 缩略图 */
  poster?: string;
}

/**
 * 视频组件支持两种激活方式：
 * - 自动播放：进入视口 45% 时静音循环自动播放（满足浏览器自动播放策略）
 * - 手动播放：点击播放按钮，带声播放
 */
export function VideoFeature({
  videoId,
  title,
  poster = "/images/hero.webp",
}: VideoFeatureProps) {
  // null = 尚未激活（显示缩略图 + 播放按钮）
  // "auto" = 进视口自动激活（静音循环）
  // "manual" = 用户点击激活（带声）
  const [activated, setActivated] = useState<"auto" | "manual" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const watchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${videoId}`,
    [videoId],
  );

  // 进视口自动激活：静音 + 循环（单视频需 playlist 参数）
  const autoEmbedUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`,
    [videoId],
  );

  // 用户点击激活：带声（用户手势满足浏览器音频策略）
  const manualEmbedUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`,
    [videoId],
  );

  const embedSrc = activated === "manual" ? manualEmbedUrl : autoEmbedUrl;

  useEffect(() => {
    // 用户已手动激活则不再自动切换
    if (activated === "manual") return;
    const el = containerRef.current;
    if (!el) return;

    // 尊重减少动效偏好：不自动播放，仅手动
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            setActivated("auto");
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activated]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg aspect-video bg-black"
      >
        {activated ? (
          <iframe
            key={embedSrc}
            className="absolute top-0 left-0 w-full h-full"
            src={embedSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivated("manual")}
            className="group absolute inset-0 w-full h-full"
            aria-label={`Play video: ${title}`}
          >
            {/* 本地 poster（主题 hero 图），不依赖 YouTube 默认缩略图 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            {/* 渐变遮罩，增强播放按钮对比度 */}
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
            {/* 播放按钮 */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[hsl(var(--nav-theme))] shadow-2xl ring-4 ring-white/30 transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                <Play className="w-7 h-7 md:w-9 md:h-9 text-white translate-x-0.5 fill-white" />
              </span>
            </span>
            {/* 视频标题 */}
            <span className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-left">
              <span className="text-white font-semibold text-sm md:text-lg drop-shadow-lg line-clamp-2">
                {title}
              </span>
            </span>
          </button>
        )}

        {/* 无 JS / SSR 回退：爬虫与禁用 JS 用户仍可见视频 */}
        <noscript>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </noscript>
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
