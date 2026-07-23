# CutBuddy — Design System & Flow Reference

This replaces the earlier "barber ticket" visual language (see git history if you
ever need it back). Current direction: dark hero + purple-accent, rounded
cards, photo-forward — a deliberate departure from the original product spec's
Section 2, per an explicit design pivot request.

## Design tokens (`src/app/globals.css`)

| Token | Value | Use |
|---|---|---|
| `--color-page` | `#f6f6f9` | App background (light screens) |
| `--color-surface` | `#ffffff` | Cards, inputs |
| `--color-ink` | `#16121f` | Primary text |
| `--color-muted` | `#6b6b7a` | Secondary text (use `.text-muted`, not `text-ink/60` — keeps contrast consistent) |
| `--color-border` | `#e7e6ee` | Card/input borders |
| `--color-hero-bg` / `--color-hero-bg-2` | `#130d22` / `#1d1433` | Dark hero screens only (`.hero-gradient`) |
| `--color-accent` / `--color-accent-dark` | `#6c4ff0` / `#5a3fdb` | Primary actions, active states |
| `--color-accent-light` | `#ede9fe` | Hover backgrounds on light surfaces |
| `--color-danger` | `#e0446c` | Favorite/heart active state only |

Font: **Inter** everywhere (`src/app/layout.tsx`), bold weight for headings.
No monospace, no serif — single family, matching the reference.

Motion: `.fade-up` for entrance (staggered via inline `animationDelay`),
`.skeleton-shimmer` for pending photos. Both respect
`prefers-reduced-motion` globally (see the media query at the top of
`globals.css`) — don't add new `@keyframes` without also confirming they're
covered by that block.

## Shared components (`src/components/`)

- **Stepper** — 4-step numbered progress (Photo → Recommended → Details → Review). Pass `step={1|2|3|4}`.
- **BottomNav** — Home / Explore / Scan QR / History / Profile. Used only on `/me/*` pages, not inside the visit flow.
- **StarRating** — client component, uncontrolled `<input type="hidden">` for form submission (see `name` prop).
- **FavoriteButton** — visual-only heart toggle. **Not persisted** — there's no schema field for a favorited style yet. If you need this to survive a reload, add a `favorited` join table or a field on `SavedCut`.
- **Pill** — filter chip. The recommendations page filters (`Trending`, `Low Fade`, etc.) are **visual only** — clicking them doesn't actually filter the grid yet. Wire this to a query param + Prisma `where` clause when it matters.
- **PhotoPlaceholder** — renders a real `<img>` when given `src`, otherwise falls back to the shimmer skeleton. `StyleCatalog.imageUrl` now holds a real AI-generated reference photo per style (front-facing only — see Known Limitations). `StyleGeneration.frontImageUrl` / `sideImageUrl` / `backImageUrl` are still literally `"pending"` strings; the cut-card detail page substitutes `style.imageUrl` for the "Front" angle only and leaves Left/Right/Back/45° as honest shimmer skeletons.
- **PrimaryButton** / **SecondaryButton** — the only two button styles. Don't create a third without updating this doc.
- **BackLink** — the chevron-in-a-circle back button used at the top of every screen in the visit flow (intake, recommendations, cut card, before/after, rate, save, signup). Each page computes its own `href` explicitly (not `router.back()`) so back navigation is correct even on a fresh page load / shared link. **Important**: `/v/[id]` expects the shop's `entryQrToken` as `id`, while every other route under `/v/[id]/...` expects a `Visit` id — a page linking back to the shop entry must look up `visit.shop.entryQrToken`, not reuse its own route param. Getting this confused was a real bug found during review; if you add a new screen, double-check which kind of id you're linking to.
- **FaceScanner** / **AIAnalysisAnimation** / **FaceMetricsCard** / **HairAnalysisCard** / **RecommendationScore** — the AI Hair Analysis feature (see its own section below).

## AI Hair Analysis (`/v/[id]/scan`)

The core "wow moment" feature: intake → **scan (capture → analyzing → results)** → recommendations, all client-side, no page reloads between phases.

- **`src/services/hairAnalysis.ts`** is the single integration point for a real computer-vision model. `analyzeUserImage(image)` currently returns a mock but internally-consistent profile picked from a fixed table keyed by face shape (`PROFILE_BY_FACE_SHAPE`) — no image data leaves the browser, ever. Replace only the body of this function when wiring up MediaPipe Face Mesh / a segmentation model; the `HairAnalysisResult` return shape is the contract the rest of the app depends on, so don't change its fields without updating `FaceMetricsCard`, `HairAnalysisCard`, `RecommendationScore`, `/api/hair-profile`, and the `prisma.userHairProfile` schema together.
- **`src/app/v/[id]/scan/HairAnalysisFlow.tsx`** is a client component that owns four phases as local state (`capture` → `verifying` → `analyzing` → `results`) — deliberately not separate routes, so the captured photo (a data URL) never has to round-trip through the server or get stuffed into a URL/query param.
  - `FaceScanner` — full-screen camera via `getUserMedia`, requested only from a direct tap ("Enable Camera") — never auto-started on mount, since most mobile browsers silently block that and it's flatly unavailable outside a secure context (`https://` or `localhost`). Surfaces specific error reasons (denied / no camera / insecure context / unsupported browser) rather than failing silently. Falls back to file-upload-only if camera access doesn't work (also what happens in this repo's own Browser-pane preview tool, which blocks camera access — that's expected there, not a bug).
    - The `<video>` element is **always mounted** (visibility toggled via opacity), not conditionally rendered — attaching a `MediaStream` to a ref that hasn't mounted yet is a silent no-op: the camera turns on (hardware indicator light and all) but nothing ever appears on screen. This was a real bug found during review.
    - `muted` is set imperatively on the video element, not just via the JSX attribute — React doesn't reliably sync that attribute to the DOM property, and an unmuted `.play()` call can get silently blocked by autoplay policy.
  - **`src/lib/faceDetection.ts`** — `detectFace()` runs a *real* face-usability check via MediaPipe Tasks Vision's `FaceDetector` (WASM + a short-range detection model, loaded lazily from Google's public CDN and cached for the session — client-side only, the image never leaves the browser). This is the only actual computer vision in the app; everything in `hairAnalysis.ts` is still a full mock. It exists specifically because the mock would otherwise happily "analyze" a blank image or a bad photo and return a confident-looking result — a real bug reported during review, twice: a bare "was any face detected" check (`faceCount > 0`) was too lenient, since BlazeFace still scores a chin-tilted-back shot or a turned/profile face as *a* face. `isUsableFace()` in that file adds geometric checks on top of the raw detection:
    - minimum confidence score (0.8) and minimum face size relative to the frame (rejects small/distant faces)
    - vertical keypoint ordering — eyes above nose above mouth — to catch heads tilted back
    - a **yaw check**: on a genuinely front-facing photo the nose sits roughly midway between the two eyes horizontally; a left/right head turn pushes it much closer to one eye than the other, so a large asymmetry there is rejected even though both eyes are still individually detected
    
    `FaceScanner`'s "Face detected" indicator polls this live off the camera feed every 900ms (with a timer-based fallback if the WASM/model fails to load, e.g. offline); `HairAnalysisFlow` runs it once, decisively, on the captured photo in the `verifying` phase — if it reports zero usable faces, the flow bounces back to `capture` with an inline error instead of proceeding. (An earlier version of this check used the browser-native Shape Detection API, which turned out to have effectively no real-world browser support — MediaPipe Tasks Vision replaced it because it needed to actually work on real devices, not just in theory.) These thresholds were tuned against a handful of real bad-capture examples (blank image, chin-tilted-back, turned/profile) but are still heuristics, not a trained classifier — if a specific angle still slips through, tightening `MAX_YAW_ASYMMETRY` / `MIN_EYE_SEPARATION_FRACTION` / `MIN_SCORE` in that file is the first thing to try before reaching for a heavier model.
  - `AIAnalysisAnimation` — the ~6.4s scanning sequence (4 steps × 1.6s), landmark dots, scan line, progress ring. Calls `analyzeUserImage` in the background and waits for the animation's minimum duration before calling `onComplete`, so it never feels rushed even though the mock resolves almost instantly.
  - Results phase renders the three cards, then on "See My Recommended Styles" POSTs the profile to `/api/hair-profile` (upserted by `visitId`, one profile per visit) and routes to `/v/[id]/recommendations?faceShape=<shape>`.
- **`UserHairProfile`** (Prisma model) stores only the derived analysis fields — no image, no raw pixel data. `visitId` is unique (one profile per visit).
- The recommendations page reads `?faceShape=` and filters `StyleCatalog` by `faceShapeFit` containing that shape (case-insensitive substring match); if nothing matches it silently falls back to the unfiltered list rather than showing an empty grid.
- **Still mock**: `analyzeUserImage`'s actual face-shape/hair-characteristic output has no relationship to the verified face — `detectFace` only confirms *a* face is present, not what shape it is. A photo that passes verification still gets a pseudo-random (byte-size-seeded) profile from the fixed lookup table. Don't conflate "we verified there's a face" with "we analyzed that face."

## Route map

| Route | Screen | Notes |
|---|---|---|
| `/` | Marketing landing page | Public story page — hero (AI-generated barbershop photo) → problem → AI matching → cut card → show-barber → before/after → library → how-it-works → final CTA. All CTAs link to the first active shop's `/v/[entryQrToken]`. Not part of the in-app visit flow. |
| `/dev` | Dev entry points | The old root page — links to every seeded shop + Library, for local testing without scanning a QR code |
| `/v/[id]` | Dark hero entry (shop QR landing) | `id` = shop's `entryQrToken`, **not** a DB id |
| `/v/[id]/intake` | Step 1 — AI Hair Analysis intro | Single CTA into `/v/[id]/scan` |
| `/v/[id]/scan` | Capture → AI scanning animation → analysis results | See "AI Hair Analysis" section below — one client component owns all three phases |
| `/v/[id]/recommendations` | Step 2 — Recommended grid | Accepts `?faceShape=` from the analysis results and filters the catalog by it. Tapping a card calls `POST /api/style-generations`, then routes to the new generation's real id |
| `/v/[id]/cut/[generationId]` | Step 3 — Cut card detail | `generationId` is now a **real** `StyleGeneration` row, not a placeholder |
| `/v/[id]/cut/[generationId]/after` | Step 4 — Before & After | Photo upload is a disabled placeholder; star rating here is **not submitted anywhere** (cosmetic only — the real rating write happens on `/rate`) |
| `/v/[id]/rate` | Rate Your Experience | `POST /api/ratings`, then → `/save` |
| `/v/[id]/save` | "Love your new haircut?" | Links to `/signup?visitId=...` |
| `/signup` | Account creation | Stub auth (see below) |
| `/me/library` | Saved cuts grid | Reads `SavedCut` for the cookie-identified user |
| `/me/history` | Past visits list | **Currently just re-shows `SavedCut`** — see Known Limitations |
| `/me/home`, `/me/explore`, `/me/scan`, `/me/profile` | Bottom-nav stub pages | Placeholder copy only, no real feature |

## API additions this pass

- `POST /api/style-generations` — creates a `StyleGeneration` row with placeholder image URLs + the style's `basePrompt` as instruction text. Also sets `Visit.selectedGenerationId`. **This is where you plug in the real image-gen call.**
- `GET /api/style-generations/[id]`
- `GET /api/visits/[id]`
- `POST /api/visits/[id]/complete`
- `POST /api/ratings` — upserts by `visitId` (one rating per visit)
- `POST /api/auth/stub` — see below
- `GET|POST /api/users/me/locker`
- `POST /api/hair-profile` — upserts a `UserHairProfile` by `visitId`

## Known limitations / where the mocks are

1. **Auth is a stub.** `POST /api/auth/stub` creates a `User` row with a random `oauthId` and sets an `httpOnly` cookie (`cs_user`) — there is no real Google/Apple OAuth or phone OTP. `getCurrentUser()` in `src/lib/session.ts` just reads that cookie. Replace with Supabase Auth per the original spec's Section 7 when you're ready to migrate off local SQLite.
2. **The marketing hero photo is a single hardcoded URL.** `HERO_IMAGE` in `src/app/page.tsx` points at one Higgsfield-generated CloudFront image. The original brief called for 11 distinct AI visuals (problem/AI-matching/multi-angle/before-after/passport/QR/save/trust/final-CTA sections) — only the hero was generated before the Higgsfield account ran out of credits (free-plan allowance). Every other marketing section reuses the existing design system (gradients, cards, the 5 style photos) instead of a bespoke visual. To finish the original 11-visual brief, top up Higgsfield credits and generate the remaining prompts (kept in the request history), then swap each `Section`'s CSS mockup for a `background-image` the same way the hero does.
3. **Angle thumbnails and before/after are the same photo repeated, not distinct shots.** The cut-card Left/Right/Back/45° thumbnails all render `style.imageUrl` (the one front-facing photo) with a label overlay — same for the Before & After screen, which reuses two different *style* photos as illustrative stand-ins, labeled "(sample)". This was a deliberate placeholder choice (real photos read better than gray shimmer) but none of it is the user's actual haircut from any angle — don't let it get mistaken for real per-angle generation, which is still Phase 2 work.
5. **CDN dependency.** `StyleCatalog.imageUrl` (and the marketing hero photo) are external CloudFront URLs — not downloaded into `/public`. If a URL ever expires or gets taken down, `PhotoPlaceholder` will render a broken `<img>` icon (it only falls back to the shimmer skeleton when `src` is falsy, not when the URL 404s).
6. **History ≈ Library.** Ratings are tied to a `Visit`, not directly to a `User`, and a `Visit` isn't linked to a `User` either (only `SavedCut` is user-linked). So `/me/history` currently just re-lists `SavedCut` rows — it does not show the actual star rating given for that visit. To fix properly: either add a `userId` to `Visit`, or join `SavedCut.shopId` + `styleGenerationId.visitId` → `Rating` (messier, and breaks if a style was regenerated).
7. **Filter pills and favorites are cosmetic.** See component notes above. (Face-shape matching itself is real now — see AI Hair Analysis — but the `Trending` / `Low Fade` / `Curly` / `Classic` pills above the grid don't do anything when clicked.)
8. **Face-shape matching is mock, not real computer vision.** `analyzeUserImage` never actually looks at the uploaded photo's pixels — it picks a face shape from a fixed table using the photo's byte size as a pseudo-random seed. It's architected so a real model is a drop-in replacement (see AI Hair Analysis section), but today the "analysis" would give the same user different results on different photos, and unrelated users the same result by coincidence.

## If something looks broken

- Blank-looking screen right after a client-side navigation: check `get_page_text` before assuming it's broken — the `.fade-up` entrance animation can make a screenshot taken mid-transition look empty even though the DOM is populated correctly.
- New button/card not visually consistent: check this file's component table first — there should be exactly one primary button style, one secondary, one pill, one placeholder. Don't add a one-off variant inline.
- Adding a new screen: reuse `Stepper` if it's part of the 4-step visit flow; reuse `BottomNav` if it's a `/me/*` page. Don't invent a third navigation pattern.
