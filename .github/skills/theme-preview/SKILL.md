---
name: theme-preview
description: "Switch the active Hexo preview theme and regenerate the site to validate visual changes. Use when switching between themes or verifying layout updates."
argument-hint: "theme-name (e.g., flowbite, butterfly)"
user-invocable: true
---

# Theme Preview

This skill automates the process of switching the active theme in the root preview site and regenerating the static output for verification.

## When to Use
- You want to see how a specific theme looks with the current site content.
- You have made changes to a theme's layout or configuration and need to verify the rendered output.
- You need to switch themes quickly without manually editing `_config.yml`.

## Procedure

1. **Switch Theme**
   Run the theme switch script with the desired theme name:
   `node bin/switch-theme <theme-name>`

2. **Build Site**
   Regenerate the static files to apply the new theme and any recent changes:
   `yarn site:build`

3. **Verify Output**
   - If the server is not running, start it: `yarn start`
   - Inspect the rendered pages in the browser.

## Notes
- The `bin/switch-theme` script also updates `source/index.md` with the theme's README content to provide a quick overview on the homepage.
- If you are working on the **Flowbite** theme specifically, ensure you have run the theme build first: `yarn workspace hexo-theme-flowbite run build`.
