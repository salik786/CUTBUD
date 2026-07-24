"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, type PanInfo } from "framer-motion";
import type { StyleCatalog } from "@prisma/client";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { getDisplayImageUrl } from "@/lib/styleImage";
import { useGenerateStyle } from "./useGenerateStyle";

const BATCH_SIZE = 12;
const PREFETCH_THRESHOLD = 3;
const SWIPE_DISTANCE_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 500;

type Angle = "Front" | "Left" | "Right" | "Back";
type SwipeAction = "like" | "skip";

function angleImages(style: StyleCatalog): Record<Angle, string | null> {
  return {
    Front: style.imageUrl,
    Left: style.leftImageUrl,
    Right: style.rightImageUrl,
    Back: style.backImageUrl,
  };
}

export function SwipeDeck({
  visitId,
  faceShape,
  filter,
  q,
}: {
  visitId: string;
  faceShape?: string;
  filter?: string;
  q?: string;
}) {
  const [styles, setStyles] = useState<StyleCatalog[]>([]);
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState<Angle>("Front");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<{ style: StyleCatalog; action: SwipeAction }[]>([]);
  const cacheRef = useRef<Map<string, StyleCatalog>>(new Map());
  const controls = useAnimation();
  const { generate, loading: generating } = useGenerateStyle(visitId);

  function queryString(nextPage: number) {
    const params = new URLSearchParams({ page: String(nextPage), pageSize: String(BATCH_SIZE) });
    if (faceShape) params.set("faceShape", faceShape);
    if (filter) params.set("filter", filter);
    if (q) params.set("q", q);
    return params.toString();
  }

  async function fetchBatch(nextPage: number, { initial = false } = {}) {
    if (initial) setLoadingInitial(true);
    else setLoadingMore(true);
    try {
      const res = await fetch(`/api/styles/recommendations?${queryString(nextPage)}`);
      const data = await res.json();
      for (const s of data.styles as StyleCatalog[]) cacheRef.current.set(s.id, s);
      setStyles((prev) => (initial ? data.styles : [...prev, ...data.styles]));
      setHasMore(data.hasMore);
      setPage(nextPage);
    } finally {
      if (initial) setLoadingInitial(false);
      else setLoadingMore(false);
    }
  }

  // ViewSwitcher remounts this component (via a `key` tied to filter/search/
  // face-shape) whenever those change, so this only ever needs to run once
  // per mount — no separate reset-on-prop-change effect required.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only fetch; this instance is fully remounted (via key) on filter/search change
    fetchBatch(1, { initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = styles[index];
  const next = styles[index + 1];

  function maybePrefetch(newIndex: number) {
    if (!loadingMore && hasMore && styles.length - newIndex <= PREFETCH_THRESHOLD) {
      fetchBatch(page + 1);
    }
  }

  async function advance(action: SwipeAction, style: StyleCatalog) {
    if (action === "like") {
      setLiked((prev) => new Set(prev).add(style.id));
    }
    setHistory((prev) => [...prev, { style, action }]);
    const newIndex = index + 1;
    setIndex(newIndex);
    setSelectedAngle("Front");
    controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
    maybePrefetch(newIndex);
  }

  async function swipe(action: SwipeAction) {
    if (!current) return;
    const dir = action === "like" ? 1 : -1;
    await controls.start({
      x: dir * 500,
      rotate: dir * 18,
      opacity: 0,
      transition: { duration: 0.28, ease: "easeIn" },
    });
    advance(action, current);
  }

  function handleDragEnd(_e: unknown, info: PanInfo) {
    const { offset, velocity } = info;
    if (offset.x > SWIPE_DISTANCE_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      swipe("like");
    } else if (offset.x < -SWIPE_DISTANCE_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      swipe("skip");
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 22 } });
    }
  }

  function undo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    if (last.action === "like") {
      setLiked((prev) => {
        const next = new Set(prev);
        next.delete(last.style.id);
        return next;
      });
    }
    setIndex((i) => Math.max(0, i - 1));
    setSelectedAngle("Front");
    controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
  }

  async function share(style: StyleCatalog) {
    const url = `${window.location.origin}/v/${visitId}/recommendations?q=${encodeURIComponent(style.name)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: style.name, url });
      } catch {
        // user cancelled — no-op
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  if (loadingInitial) {
    return <SwipeSkeleton />;
  }

  if (!current) {
    return (
      <div className="mt-10 flex flex-col items-center text-center">
        <p className="text-4xl">✂️</p>
        <p className="mt-3 text-sm font-semibold">
          {styles.length === 0 ? "No styles match this search." : "You've seen every style here."}
        </p>
        <p className="mt-1 text-xs text-muted">Try a different filter or search term.</p>
      </div>
    );
  }

  const images = angleImages(current);
  const angles: Angle[] = ["Front", "Left", "Right", "Back"];

  return (
    <div className="mt-5 flex flex-col items-center">
      <div className="relative h-[420px] w-full max-w-sm">
        {/* Next card peeking underneath for depth, no interaction. */}
        {next && (
          <div className="absolute inset-0 scale-[0.96] rounded-3xl opacity-60">
            <PhotoPlaceholder
              src={getDisplayImageUrl(next)}
              className="h-full w-full"
              sizes="384px"
              objectPosition="top"
            />
          </div>
        )}

        <motion.div
          key={current.id}
          drag="x"
          dragElastic={0.7}
          animate={controls}
          onDragEnd={handleDragEnd}
          whileTap={{ cursor: "grabbing" }}
          className="absolute inset-0 cursor-grab overflow-hidden rounded-3xl border border-border bg-surface shadow-xl"
        >
          <PhotoPlaceholder
            src={images[selectedAngle]}
            className="h-full w-full pointer-events-none"
            sizes="384px"
            objectPosition="top"
            priority
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
            <p className="text-lg font-bold text-white">{current.name}</p>
            <p className="text-xs text-white/80">{current.fadeType || current.description}</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-3 grid w-full max-w-sm grid-cols-4 gap-2">
        {angles.map((angle) => (
          <button
            key={angle}
            type="button"
            onClick={() => setSelectedAngle(angle)}
            disabled={!images[angle]}
            className={`relative overflow-hidden rounded-xl transition-shadow disabled:opacity-30 ${
              selectedAngle === angle ? "ring-2 ring-accent ring-offset-2 ring-offset-page" : ""
            }`}
          >
            <PhotoPlaceholder
              src={images[angle]}
              className="aspect-square w-full"
              sizes="90px"
              objectPosition="top"
            />
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0}
          aria-label="Undo"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-lg text-muted disabled:opacity-30"
        >
          ↺
        </button>
        <button
          type="button"
          onClick={() => swipe("skip")}
          aria-label="Skip"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-2xl shadow-sm transition-transform active:scale-90"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={() => generate(current.id)}
          disabled={generating}
          aria-label="View details"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-lg text-muted disabled:opacity-50"
        >
          👁
        </button>
        <button
          type="button"
          onClick={() => swipe("like")}
          aria-label="Like"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-sm transition-transform active:scale-90"
        >
          ❤
        </button>
        <button
          type="button"
          onClick={() => share(current)}
          aria-label="Share"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-base text-muted"
        >
          ⤴
        </button>
      </div>

      <p className="mt-3 text-xs text-muted">
        {liked.size} liked · Drag the card, or use the buttons
      </p>
    </div>
  );
}

function SwipeSkeleton() {
  return (
    <div className="mt-5 flex flex-col items-center">
      <div className="skeleton-shimmer h-[420px] w-full max-w-sm rounded-3xl" />
      <div className="mt-3 grid w-full max-w-sm grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer aspect-square w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
