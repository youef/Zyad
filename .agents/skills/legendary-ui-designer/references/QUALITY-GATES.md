# UI quality gates — acceptance protocol

1. **Syntax:** `npm test`, including `scripts/check-legendary-ui.mjs`. Check all new JS files using `node --check`.
2. **App browser:** `node scripts/check-app.mjs`; ensure the daily poster canvas and event rows render, no page errors on 390 and 1440px.
3. **Interaction browser:** `node scripts/check-legendary-ui-browser.mjs`: activate global search, type Arabic/English, use a real result, close dialog, preserve focus, verify chosen card.
4. **Curated gallery:** cards count equals `GALLERY_PRESETS.length`; preview canvas is real; compact/spacious switching persists; no content overflow or poster overlay.
5. **Date and data:** date control updates next event and card; no artificial dates; config loaded from `data/config.json`.
6. **Language:** switch ar→en→ar and assert semantic labels + RTL direction; no stuck translated text.
7. **Dark:** contrast and theme colors remain valid after persisted choice and page reload.
8. **Responsive:** 320, 375, 390, 430, 768, 1024, 1440 widths; no horizontal scroll; 44px touch targets; bottom sheet and dock remain clickable.
9. **Accessibility:** visible keyboard focus, dialog escape and focus restoration, no unlabelled buttons, `prefers-reduced-motion` honored.
10. **Build:** run `node scripts/render.mjs` and screenshot/compare an actual generated card; no missing image/QR.
11. **Publish:** review GitHub Actions jobs (including poster archive and Pages), ensure selected commit is deployed; only report verified statuses.

Manual visual-review questions:
- Does the user know which action to take in five seconds?
- Is any number shown without a trustworthy source/date?
- Are selected/favorite/failure states understandable without relying on color?
- Does the 320px viewport require sideways scrolling?
- Does content remain readable in long Arabic names and at 200% text zoom?
- Does the experience remain useful without fancy gradients or animation?
