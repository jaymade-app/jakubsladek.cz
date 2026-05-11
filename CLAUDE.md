# CLAUDE.md

Guidance for Claude Code when working in this repository. Merge these rules with any task-specific instructions from the user — the user's request always wins.

## Project Overview

Personal portfolio website for Jakub Sládek (Web & App Developer). Static single-page site built with Vite, TailwindCSS and GSAP. Czech/English i18n is handled by a custom Vite plugin. The production artifact is a static `dist/` folder served by Nginx (see `Dockerfile`, `nginx.conf`).

- Entry HTML: `index.html`
- JS entry: `src/main.js`
- Modules: `src/modules/` (`themeManager`, `animations`, `seo`)
- Effects: `src/effects/starfield.js`
- Styles: `src/styles/` (Tailwind + custom CSS)
- i18n: `src/i18n/` (`cs.json`, `en.json`, `config.js`) — wired via `vite-plugin-i18n.js`
- Public assets: `public/`

## Commands

| Task | Command |
| --- | --- |
| Install deps | `npm install` |
| Dev server (port 3000) | `npm run dev` |
| Production build | `npm run build` |
| Analyze build | `npm run build:analyze` |
| Preview build (port 4173) | `npm run preview` |
| Lighthouse on preview | `npm run measure` |

There is no test suite and no linter configured. "Done" is verified by: clean build, manual browser check at `/` in both `cs` and `en` locales, and no console errors / regressions in Lighthouse.

## Project-Specific Conventions

- **Performance is a feature.** This site is tuned for Lighthouse. Don't add heavy dependencies, blocking scripts, or large assets without a clear reason. Keep code-splitting boundaries in `vite.config.js` intact (`vendor_gsap`, `animations`, `effects`).
- **i18n is mandatory.** Any new user-visible string must exist in both `src/i18n/cs.json` and `src/i18n/en.json` and be referenced via the existing key system in `index.html`. Never hard-code Czech or English copy into JS/HTML.
- **Theming via `ThemeManager`.** Dark mode is controlled by toggling `dark` on `documentElement` and dispatching the `themeChanged` event. New theme-sensitive code should listen to that event rather than re-implementing detection.
- **Lazy / idle loading.** `main.js` defers `animations.js` and `seo.js` until idle or first interaction. Follow that pattern for any new non-critical module — don't import heavy modules eagerly at the top of `main.js`.
- **TailwindCSS v4.** Configuration lives in CSS (`@tailwindcss/postcss`); there is no `tailwind.config.js`. Prefer utility classes; add custom CSS only when utilities can't express the design.
- **Single page.** There is no router. Sections live in `index.html` and are navigated via in-page anchors.

## Coding Behavior

The four rules below are adopted from Andrej Karpathy's CLAUDE.md guidelines. They bias toward caution over speed; for trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Reproduce it, then confirm the fix removes the repro"
- "Refactor X" → "Build passes and the page behaves identically before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Verification Checklist

Before reporting a task as done on this project:

- [ ] `npm run build` succeeds with no errors or new warnings.
- [ ] Visually checked the affected section in `npm run dev` in both `cs` and `en`.
- [ ] No new console errors in the browser.
- [ ] Light and dark theme both still render correctly if the change touches visuals.
- [ ] No new heavy dependency was added without explicit approval.

## Git

- Default branch is `main`. Develop on a feature branch and open a PR rather than pushing directly to `main` unless the user explicitly asks.
- Never force-push to `main`. Never bypass hooks (`--no-verify`) unless the user explicitly asks.
- Commit messages: short imperative subject (≤72 chars), optional body explaining *why*.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
