# Hexo Themes Collection

## Repository shape

- The repository root is a runnable Hexo site used to preview the themes.
- Shared TypeScript helpers and Hexo integrations live in `src/`; the public entry point is `src/index.ts`.
- Theme packages live under `themes/`. `themes/hexo-theme-flowbite` is the active Yarn workspace and has its own build pipeline.
- Site content and fixtures are under `source/`; generated site output is under `public/` and temporary build output is under `tmp/`.
- Prefer linking to the root [readme](readme.md) and theme documentation instead of duplicating configuration details.

## Tooling and commands

- Use Yarn 4 (`yarn.lock` and `packageManager` define the repository toolchain).
- Install dependencies with `yarn install` after submodules are initialized with `git submodule update -i -r`.
- Build TypeScript/Rollup scripts with `yarn build:scripts`.
- Build the Flowbite workspace with `yarn workspace hexo-theme-flowbite run build` or build all configured packages with `yarn build`.
- Generate the preview site with `yarn site:build`; run the HTTPS preview server with `yarn start` or `yarn serve`.
- Switch the preview site theme with `node bin/switch-theme <theme-name>` before serving or generating it.
- Package a release with `yarn pack` after building. Do not edit generated release, public, or temporary output to fix source behavior.

## Implementation conventions

- Keep root build changes in `src/` and keep Flowbite-specific changes inside `themes/hexo-theme-flowbite/`.
- `tsconfig.json` intentionally excludes theme sources; validate theme code with the theme's own build command.
- Preserve existing ESM style, double-quoted imports in JavaScript/TypeScript, and the repository ESLint/Prettier configuration.
- When changing layouts, theme configuration, or injected HTML, regenerate the preview site and inspect the affected rendered page.
- Treat `_config*.yml`, `source/`, and theme layout files as source inputs; avoid hand-editing files produced by `bin/switch-theme` or build scripts.

## Validation

- For script changes, run `yarn build:scripts`.
- For Flowbite changes, run `yarn workspace hexo-theme-flowbite run build`.
- For site or theme integration changes, run `yarn build` followed by `yarn site:build`.
- There is no root test script; use the focused checks above and the existing fixtures under `test/` when investigating renderer behavior.