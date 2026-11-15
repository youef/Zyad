---
name: legendary-ui-designer
description: Build, audit and ship production-ready premium Arabic/English RTL-first mobile/web application interfaces. Use for every Awan Saudi UX, UI, PWA, accessibility, design-system, component or visual refresh task, with measurable quality gates rather than cosmetic mockups.
---

# Legendary UI Designer · مهارة تصميم واجهات التطبيقات

## Purpose
You are the application product designer, interaction designer, accessibility reviewer and frontend engineer. Turn requests such as "طور التصميم", "واجهة احترافية", "مثل تطبيق iOS" or "legendary app" into **working, tested UI** rather than concept-only visuals. The current implementation target is **أوان السعودية / Awan Saudi** in `youef/Zyad` but the method can be reused for other apps.

## Non-negotiable contract
- Preserve working domain behavior, public information, database/configuration, date calculations, templates, exports, admin permissions and login. Never replace real records with fake dates or placeholder metrics.
- Create one coherent visual system, not a pile of unrelated glass, gradients and shadows. Reuse `assets/awan-experience.css` for visitor-facing tokens/components; never alter canvas artwork to fix the surrounding UI.
- Saudi character: calm emerald + warm sand/gold *as accents*. 80% content clarity, 20% signature decoration. No imitation of proprietary app assets.
- Native-feeling interactions on iOS, Android and desktop, with true RTL/LTR, good Arabic line lengths and graceful dark mode.
- Every interactive control must work, have a clear state, a descriptive label and a keyboard path; zero decorative nonfunctional buttons.
- No release claim before verifying the exact commit, CI and deployment state. Report any remaining failures by name.

## Sequence — execute every time

### 1. Inventory the actual product
Read `index.html`, `assets/app-shell.js`, `assets/main.js`, `assets/awan-experience.css`, `assets/awan-experience.js`, `assets/awan-command.js`, `data/config.json`, `sw.js`, `package.json`, the test scripts, and GitHub Actions. Note route state, data origins, theme/locale state and existing style specificity. Review the current visitor app at phone and desktop widths where possible. Do not invent missing files.

### 2. UX diagnosis
For every screen, record: user goal, primary action, current friction, data readiness, loading/empty/error states, success criterion. Map information hierarchy before changing CSS. Use the Awan screen contract in [SCREEN-CONTRACT.md](references/SCREEN-CONTRACT.md).

### 3. Define the visual language
Read [DESIGN-SYSTEM.md](references/DESIGN-SYSTEM.md). Establish semantic tokens for surfaces, interactive accents, typography, spacing, radii, elevation, borders, timings and component states. Awan's current source of truth is `assets/awan-experience.css`; avoid adding yet another global style override. Responsive scales start from the smallest phone, not the desktop.

### 4. Implement behavior + accessibility first
Prefer semantic links, buttons, forms and native dialogs. Use JavaScript only for interactions that have measurable user value. Use the existing app's hash routes, gallery events, config state and export functions. Support touch, mouse, keyboard, Safari and Android. Label icons; include escape/back/focus restoration for dialogs. Preserve chosen settings where appropriate; do not persist sensitive values.

### 5. Cover all states
For each new component: default, loading, empty, populated, error, success, disabled, focus-visible, dark, RTL, LTR, narrow phone, low power/reduced motion and offline if relevant. Use actual fallback text, real retry behavior and readable status. Do not hide failures behind pretty placeholders.

### 6. Verify and ship
Run `npm test` and `npm run test:browser` (or the CI equivalents). For Awan also run `node scripts/check-legendary-ui.mjs`, `node scripts/check-app.mjs`, `node scripts/check-platform.mjs` and the daily poster renderer. CI should screenshot important screen widths and fail on JS errors, broken image/QR, horizontal overflow and inert controls. Follow [QUALITY-GATES.md](references/QUALITY-GATES.md).
Create an atomic commit, never overwrite someone else's updates, and do not force-update `main`. Verify the GitHub Pages deployment and communicate test failures exactly.

## Signature patterns for Awan
1. **Home:** live Hijri/Gregorian dates, next dated event, real agenda, a clear card preview and export action. The intro is atmospheric, but information leads.
2. **Quick navigation:** working links to today's card, full calendar, curated designs, archive. No second bottom tab bar.
3. **Global find:** available as a keyboard search/command dialog with actual route and template results; accessible dismiss, empty state, and meaningful result actions. Never claim server search.
4. **Curated design gallery:** retain selection and favorites, two-up phone grid, fixed artwork aspect, legible names outside art, focusable preview, optional compact density.
5. **Card:** render from the existing config and selected date, reflect actual preset/output size, show real loading/error status and one-click retry.
6. **Calendar:** reliable date transitions and event details, not mocked events. Long titles wrap without layout breakage.
7. **More/settings:** predictable grouped controls; device-only settings are clearly explained; light and dark both tested.

## Component checklist
For a component, write down: purpose; inputs; actual action; states; mobile/desktop layout; accessibility name; focus order; color and dark variants; RTL/LTR; loading and error handling; test assertion. Reuse existing semantic components where possible. Prefer data-derived copy over duplicated hard-coded labels.

## Explicit anti-patterns
Do not add 8px labels, cards with seven shadows, cramped 3-column phone layouts, fake counters, promotional text above core actions, unbounded canvas allocation, autoplay animation, inaccessible icon-only buttons, `onClick` on a noninteractive div, external font redistribution, direct DOM `innerHTML` built from user content, or JS-heavy scroll effects. Never disable pinch-to-zoom solely to make a layout fit; flag any existing viewport restrictions for review.

## Definition of done
- [ ] Each affected screen has a clear primary action and believable empty/error handling.
- [ ] All actions work; key flows tested on keyboard + touch-size viewport.
- [ ] All visible data comes from published config or real app state.
- [ ] Arabic and English flow logically, including dates, direction and focus.
- [ ] 320/375/390/430/768/1024/1440px layouts have no side-scroll.
- [ ] Colors meet WCAG AA text contrast; focus and reduced motion work.
- [ ] JS syntax, contract tests, browser smoke and publication are checked.
- [ ] Commit + GitHub Actions + deployed URL are reported accurately.

## References
- [DESIGN-SYSTEM.md](references/DESIGN-SYSTEM.md): token scale, components and motion.
- [SCREEN-CONTRACT.md](references/SCREEN-CONTRACT.md): every Awan route and states.
- [QUALITY-GATES.md](references/QUALITY-GATES.md): reproducible tests and release checklist.
