# EZQuest Shopify Theme

This repository is the source for the live EZQuest storefront at [ezq.com](https://ezq.com). The `main` branch is connected to Shopify theme `EZQuest/main` (theme ID `149895643334`) in store `ezquest-4.myshopify.com`.

## Handoff

- Theme code: `assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, and `templates/`.
- CSS source and build configuration: `src/`, `tailwind.config.cjs`, `postcss.config.cjs`, and `package.json`.
- Maintenance and Shopify content tools: `scripts/`. Historical migration data and import sources are in `docs/`.
- Tests and macOS visual baselines: `tests/`. The GitHub visual regression workflow runs manually because the broad screenshot suite is slow and sensitive to live content changes.
- Shopify admin controls products, collections, pages, policies, payments, and shipping. Theme files alone are not a full store backup.

## Local setup

Requirements: Node.js 20 or newer, npm, Shopify CLI, and access to the EZQuest Shopify store.

```bash
npm ci
cp shopify.theme.toml.example shopify.theme.toml
shopify auth login
npm run check
```

`shopify.theme.toml` and `.env.local` are local files and are ignored by Git. Do not commit credentials.

To preview the theme locally, run `npm run dev`. To rebuild the compiled CSS, run `npm run build`. The local preview uses Shopify CLI; MAMP does not serve this theme.

## Publishing and recovery

Review and test changes, then push them to `main`; Shopify syncs that branch to the live `EZQuest/main` theme. Check [ezq.com](https://ezq.com) after sync. The older `EZQuest — Image Gallery Preview 2026-10-27` theme is an unpublished rollback copy.

Never run an unscoped `shopify theme pull`: the live theme can lag local changes, and a full pull can overwrite newer work. Pull only named files, for example:

```bash
shopify theme pull --store ezquest-4.myshopify.com --theme 149895643334 --only assets/example.css --nodelete
```

If GitHub sync is delayed and a live fix is necessary, upload only the reviewed files to theme `149895643334` with `--only`, `--nodelete`, and `--allow-live`. Shopify may create an empty sync commit on `main`; fetch before the next push. Do not push to the older unpublished theme unless intentionally restoring it.

## Checks

```bash
npm run check
npm run test:visual
```

The visual suite is available from GitHub Actions through **Visual Regression (Manual)**. It does not run on every push. Live form delivery, payment, shipping, and inventory integrations require separate checks in their respective services.
