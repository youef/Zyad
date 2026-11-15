# Legendary UI · reusable visual design system

## Principles
**Calm luxury**: strong contrast, intentional negative space, high-quality Arabic typography, restrained gradients. The content's trustworthiness matters more than visual novelty.

## Core token taxonomy
| Category | Semantic meaning | Guidance |
|---|---|---|
| --awan-ui-bg | app background | muted neutral, never pure-white glare |
| --awan-ui-surface | elevated reading surface | match light/dark theme |
| --awan-ui-text | body and headings | AA contrast against surface |
| --awan-ui-muted | secondary text | do not use for crucial data |
| --awan-ui-accent | interaction and focus | emerald-based, distinguish on dark |
| --awan-ui-tint | low-emphasis selected/hover | accent mixed into surface |
| --awan-ui-stroke | neutral separator | one per surface at most |
| --awan-ui-radius-* | shape hierarchy | 10 / 14 / 20 / 28px by scale |
| --awan-ui-shadow | surface separation | one subtle level; none in grouped lists |
| --awan-ui-ease | micro-interaction | 160–220ms ease-out |

Map these tokens to the app's existing `--ios-*` variables to avoid two independent theme systems.

## Typography
- Arabic type: system Arabic where reliable, then bundled Cairo/Tajawal (do not distribute Apple fonts).
- Title: clamp(28px,4vw,42px); section heading: 20–26px; body: 14–16px; supporting: 12–14px; tiny decoration never stands in for content.
- Strong labels may use 750–850 weight, paragraph text 450–650. Line height Arabic 1.5–1.9 depending on role.
- Numerical information may use tabular digits and appropriate direction isolation.

## Spacing and layout
- Fluid spacing scale: 4,8,12,16,20,24,32,40.
- Safe-area padding on iPhone for navigation and modal actions; no bottom content hidden behind dock.
- Home: a single clear intro + navigation rail + dated event spotlight + supporting information + true card.
- Mobile: 1 column for panels; 2 card thumbnails per row (compact mode may use 3 only when >=390px and metadata remains legible).
- Desktop: max reading width 1180px, appropriate two-column content only when it aids comparison.
- Minimum tap target 44x44px; 48px preferred for primary controls.

## Component primitives
- `Surface`: solid surface, one stroke or one shadow, never both heavy; radius 20–28.
- `Hero`: branded gradient reserved for the primary introduction only; no important information within decorative artifacts.
- `Action`: clear primary / outline secondary / icon-only tertiary. Exactly one primary per functional context.
- `EventRow`: event name, date and amount; actionable details; does not rely on color only.
- `CardPreview`: real canvas, no screenshot substitution, aspect ratio preserved; loading, error, retry, saved feedback.
- `TemplateTile`: artwork, independent title/category, chosen state, favorite control and preview action.
- `CommandDialog`: native dialog, labeled input, result buttons, keyboard shortcut, escape and focus restoration.
- `Feedback`: aria-live role=status for progress; error actionable; no silent failure.

## Motion & tactile feedback
- CSS-only opacity/translate changes under 220ms.
- No auto-scrolling animations or excessive hover scaling.
- `prefers-reduced-motion:reduce` disables transforms and long transitions.
- Do not trigger vibrations or media playback as decorative feedback.

## RTL/LTR, localization and accessibility
- Use logical padding/border/inset when directional.
- Dates and file dimensions should not reverse unintentionally.
- Labels and status messages should change with app language, not only static headings.
- Use native dialog focus trapping, restore the launch control on close, reachable dismiss button and meaningful no-results state.
- WCAG 2.2 AA: normal text 4.5:1, big text and graphical controls 3:1. Focus visible and independent of color.

## Performance budgets
- Decorative images are never a prerequisite to render core data.
- Lazy-build only necessary previews (use existing gallery observer).
- Avoid scroll listeners that force layout, large always-running animations and new remote font dependencies.
- On offline failure, explain it and offer retry rather than showing a false ready state.
