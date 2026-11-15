# Awan screen-by-screen experience contract

| Route | Primary goal | Priority content | Actual interactions | Critical states |
|---|---|---|---|---|
| #today-app | understand today | dates, next event, agenda, card | date change, event detail, save/share | fetched, loading, error |
| #poster-section | export useful art | true selected template/date/size | PNG/4K save, share, retry | pending, ready, error |
| #smart-planner | find dates | calendar months and event details | navigate months, event dialog, ICS | no events, selected day |
| #template-gallery | discover design | category, search, selected design, thumbnails | preview, apply, favorite, download, density | 0 matches, asset unavailable |
| #favorites | revisit saved looks | only real favorited designs | remove/apply/open | empty favorites |
| #archive | retrieve prior daily art | actual published archive files | download historical image | archive empty |
| #more | reach secondary actions | settings and archive | navigate | no dead links |
| #settings | configure device view | theme and language | radio selection and persistence | reset and theme changes |

## Entry points
- Home header has one global command-search control plus existing theme toggle.
- Quick-nav uses existing routes; it does not add a sixth tab.
- Search suggestions are drawn from currently published routes and rendered template cards; no fake server-side index.
- Searching for a template opens its real preview and does not silently change the user's selected design.

## Data integrity contract
`data/config.json` drives published events, dates and card text. `assets/main.js` governs card rendering and template selection. `assets/app-shell.js` governs route visibility and agenda. `assets/gallery-selection.js` determines curated gallery membership. `assets/awan-command.js` is additive UI chrome, never authoritative business logic.

## Do not break
- Official transparent logo appearance; no baked-in white square.
- 13 output sizes and card export dimensions.
- QR and published event data.
- Server/admin authentication boundaries.
- Favorites stored locally and theme/language controls.
- Apple safe-area, 5-tab visitor navigation, gallery image visibility.
