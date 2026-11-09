---
name: apple-ui-designer
description: A production-grade, iOS-first design and implementation standard for Saudi Calendar (Zyad): redesign layout, interaction, transparent branding, responsive RTL, accessibility and automated QA—not just cosmetic CSS.
---

# Apple UI Designer Pro · Saudi Calendar

## Mission and definition of done

Build a calm, recognizably native-feeling **mobile web/PWA experience**, not an imitation of iOS chrome. Use Apple Human Interface Guidelines as design principles. Every screen must make the primary action instantly obvious and remain functional on iPhone, Android, tablet and desktop. A redesign is incomplete until **real page markup, routes, state, preview, exports and tests** agree.

## Foundational rules

1. **The content leads.** The home screen answers: what day is it, what is my next important date, and what action can I take? Move lower-value content down or reveal it progressively.
2. **One clear primary action per area.** Use solid Saudi green only for an important action, e.g. save a card. Secondary actions are low emphasis; no competing gradients.
3. **Real information hierarchy.** Large title 28–34 px; section title 20–24 px; row title 15–17 px; supporting text 12–14 px, rarely below 12 px on a phone. Do not shrink text to make an overloaded screen fit.
4. **System-aware Arabic typography.** Use -apple-system/BlinkMacSystemFont with an Arabic-capable fallback. Never embed or redistribute SF Pro font files. Use logical inline-start/inline-end positions, bidi-safe dates and proper RTL icons.
5. **An 8-point rhythm.** Core spacing 4/8/12/16/20/24/32 points; touch targets ≥44×44 CSS px; no accidental 30-pixel icon hit areas.
6. **Grouped lists before floating cards.** Lightweight surfaces on #F5F5F7 (light); sober contrast in dark. Separate grouped rows with hairlines *or* spacing, not redundant outlines/shadows.
7. **Navigation stays consistent.** Five bottom destinations, always the same order: اليوم / التقويم / إنشاء / التصاميم / مكتبتي. Respect top, bottom, left and right safe-area insets; never stack two bars.
8. **Full-width is not mandatory.** Mobile horizontal margin 16 px (12 on smallest screens), reading columns 600–900 px on tablet/desktop, comfortable card aspect-ratio for exported artwork.
9. **Motion is feedback.** 160–240 ms opacity/transform transitions, no parallax, throbbing or bounce. Honor prefers-reduced-motion.
10. **A design artifact is not the application UI.** Traditional card posters retain their green/gold ornamental art and are not forced into iOS shapes. Surrounding controls, galleries and editing tools should feel iOS-native.

## Brand and transparency contract

- Authoritative source: `assets/branding/logo.png`.
- Derivative transparent artwork: `assets/branding/logo-transparent.png` **generated automatically** from source; never manually paint a white rectangular backing behind it.
- Background removal operates only on near-white pixels connected to the outer image edge; preserve internal white detail, antialias color boundaries, and aspect ratio. Fail loudly if the result is blank or malformed.
- Render with `object-fit:contain`, **no white tile, border or drop-shadow** on the logo itself. A separate PWA app icon may have a system-standard colored app tile, but not a baked-in white box around the mark.
- Use the same transparent derivative in application headers, sidebar, galleries, studio, exported cards and editable brand defaults. For a dark artwork header, use a monochrome high-contrast rendering of the transparent mark only where necessary.
- Rebuild app icons from the transparent derivative with centered geometry and genuine background color fill (no second inner square).

## Screen specifications and acceptance

| Screen | Visible above the fold | Content and behavior | Acceptance |
|---|---|---|---|
| Today | Branded title, live Hijri/Gregorian date, nearest event spotlight, summary | Next events list, collapsible secondary inspiration, daily card | No unreadable 8–10 px labels or three-column compression |
| Calendar | Native large title, current month, clear selected day | Event list, next/previous month, accessible event detail | Direct date control and events are reachable with touch and keyboard |
| Create/edit calendar | Live card preview and primary save/export | Progressive disclosure for content, style, counters, logo | Preview never overlaps form, no accidental lost edits |
| Designs | Search and category filter | 2-up mobile thumbnail grid, readable names and one main action | Templates stay correctly sized, no clipping |
| Library | Title and recent saved artwork | Search/filter and open/share/export | Empty state explains local persistence |
| Settings | Simple grouped controls | Theme, backups, restore and administration | Controls are usable on 320 px width |
| Admin | Clear workspace title, task-focused controls | Forms, publishing, and status | Same spacing, robust error/status feedback, no redundant navigation |

## Home screen composition (specific)

1. Brand lockup is a **transparent** mark integrated with the header. Header shows one main title and at most two utility controls; admin is not promoted visually above content.
2. Date switcher: one light grouping, large understandable local date labels and 44 px arrows.
3. Next-event feature: readable event label, exact days left, and one link to the event/calendar. Populate from the same live data that powers the agenda; never invent countdown values.
4. Supporting statistics are subdued, not a row of giant ornaments.
5. Upcoming events: grouped list with icon, label, date and count; stable row height ≥64 px. Search and filters may collapse on compact screens only if still discoverable.
6. Card preview: centered within readable width, original aspect ratio, no tilted preview or extra border. Primary **حفظ الصورة** and secondary share/customization.
7. Inspiration and service promotions are separate, lower-priority sections. Preserve WhatsApp 0558930532, Snapchat z32.y and public-services 0538243481 without filling the home hero with marketing.

## Input, sheets and interaction

- Use semantic buttons, labels, focus-visible states, role=status on async actions, and real disabled states.
- Use local bottom sheet for add/edit event on phones with grip, drag-dismiss, backdrop dismiss, escape dismissal, and guarded scroll. Desktop: centered dialog.
- Active tab determined by actual route/fragment; use aria-current="page". Navigation must not hide or collide with a software keyboard.
- Minimum contrast: normal text WCAG AA 4.5:1; large text 3:1; critical icon contrast 3:1. Never rely on color alone.
- Respect system light/dark and user selection. Use prefers-color-scheme / prefers-reduced-motion and focus order.
- Avoid re-render loops and DOM resets that jump focus or scroll unexpectedly.

## Implementation discipline

1. Inspect current HTML, CSS, route JS and official assets.
2. Write a **screen-by-screen layout plan** and identify what to remove or demote.
3. Implement semantic markup and working navigation/interaction first, then design tokens and responsive CSS; do not stack conflicting one-off overrides.
4. Implement transparent-logo generation in reproducible build script and change references only once the derivative is generated in CI.
5. Validate all states: light/dark, long Arabic names, empty state, 320/375/390/430/768/1024 px, portrait/landscape and keyboard-only.
6. Verify no horizontal overflow, iOS safe-area clipping, console errors, blank image, broken QR, expired asset paths or duplicate navigation.
7. Run repository tests; fail on missing branded files and transparent pixels. Capture screenshots in CI for key screen widths.
8. Publish to `main` only when changes are coherent. Do not claim deployment/test success until GitHub Actions actually confirms it.

## Anti-patterns (reject during review)

- A large CSS override appended to a broken page instead of changing its information architecture.
- White rectangles behind transparent logo, an overframed logo, or logos squeezed into circles.
- 8–11 px body labels on mobile, controls smaller than 44 px, hard-coded widths causing overflow.
- Decorative gold gradients, excessive shadow, neon/glass on every card, giant fake badges, conflicting CTAs.
- Dense 3-column dashboards on iPhone, side-by-side action clusters that cannot be tapped, ornamental poster background used as UI chrome.
- Mobile layout whose primary action requires scrolling through unrelated promotional blocks.
- Overriding a user's chosen dark mode, broken Arabic bidi, inaccessible hidden labels.
- False "published" or "passed" claims.

## Final reporting format

State **which screens changed**, **which interactions work**, **what changed about the transparent logo**, **what was tested**, **what remains unknown** and an exact GitHub commit and Actions link. If the implementation is incomplete, do not call it complete.
