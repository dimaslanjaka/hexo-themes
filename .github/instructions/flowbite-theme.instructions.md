---
name: Flowbite Theme
description: "Use when modifying the hexo-theme-flowbite layouts, Nunjucks templates, Tailwind or SCSS styles, browser scripts, theme configuration, or build output."
applyTo: "themes/hexo-theme-flowbite/layout/**, themes/hexo-theme-flowbite/src/**, themes/hexo-theme-flowbite/scripts/**, themes/hexo-theme-flowbite/source/**, themes/hexo-theme-flowbite/*.cjs, themes/hexo-theme-flowbite/*.js, themes/hexo-theme-flowbite/*.json, themes/hexo-theme-flowbite/*.yml"
---
# Flowbite Theme Guidelines

- Keep authored theme behavior in `themes/hexo-theme-flowbite/layout/`, `src/`, `scripts/`, and the non-generated parts of `source/`.
- Use the workspace build from the repository root: `yarn workspace hexo-theme-flowbite run build`.
- The theme build compiles `src/style.scss` into `source/css/style.css`, bundles browser code into `source/js/script.js`, and writes API bundles under `dist/`. Do not hand-edit those generated files.
- Preserve the existing Nunjucks layout structure and partial/macro boundaries when changing templates.
- After layout, configuration, or injected HTML changes, switch the preview to Flowbite with `node bin/switch-theme flowbite`, then run `yarn site:build` and inspect the affected rendered page.
- For changes spanning root scripts and the theme, validate both `yarn build` and `yarn site:build`.
- Link to the [Flowbite theme documentation](../../themes/hexo-theme-flowbite/readme.md) for configuration details instead of copying it here.