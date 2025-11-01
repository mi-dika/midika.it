# Repository Guidelines

MiDika is an italian software house focused on minimalism and design.

## Core Principles

- **KISS (Keep It Simple Stupid)**: Keep things simple and avoid complexity.
- **DRY (Don't Repeat Yourself)**: Avoid duplication of code.
- **YAGNI (You Aren't Gonna Need It)**: Do the minimum necessary to get the job done.
- **TDD (Test Driven Development)**: Write tests before writing code.

## Project Structure & Module Organization

- `src/app` hosts the Next.js 16 App Router routes, layouts, and page-level metadata.
- `src/components` contains reusable UI primitives; co-locate component-specific styles and hooks here.
- `src/lib` holds cross-cutting utilities (config, helpers, data adapters) used across routes and components.
- `public` stores static assets that are referenced via `/` paths at runtime.
- `docs` aggregates reference notes for framework upgrades—consult it before changing framework-level settings.
- `scripts` contains maintenance scripts such as `scripts/check.mjs` used in CI-style quality runs.

## Build, Test, and Development Commands

- `pnpm dev` starts the local Next.js server with hot reload.
- `pnpm build` compiles the production bundle; run it to validate before deploying.
- `pnpm start` serves the already-built bundle locally for smoke testing.
- `pnpm lint` applies ESLint (Next.js preset) across the repo.
- `pnpm format` runs Prettier in check mode; use `pnpm format -- --write` before committing large edits.
- `pnpm type-check` executes `tsc --noEmit`; keep it passing to avoid runtime regressions.
- `pnpm check` invokes `scripts/check.mjs`, sequencing lint, type-check, and other sanity checks—treat it as the pre-push gate.

## Coding Style & Naming Conventions

- TypeScript, React, and Tailwind CSS 4 are the core stack; write new modules in TypeScript and favor functional React components.
- Prettier (default config) controls formatting: 2-space indentation, single quotes in TS/JSX, and line wrapping at 80 columns.
- Use PascalCase for component file names (`MyWidget.tsx`), camelCase for helpers (`formatCurrency.ts`), and kebab-case for route folders.
- When composing Tailwind classes, group them logically (layout → spacing → color) to aid readability; leverage `tailwind-merge` to dedupe.
- Keep module boundaries small—prefer one component per file and export via index barrels only when multiple consumers benefit.

## Testing Guidelines

- No automated test harness is wired in yet; when introducing tests, use Jest + React Testing Library and store them beside the code as `<name>.test.tsx`.
- Add minimal integration smoke tests for complex routes in `src/app`, and aim for meaningful assertions over snapshot sprawl.
- Run `pnpm build` and `pnpm check` before submitting PRs to ensure type safety and linting remain intact.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`) as seen in recent history; scope prefixes (`feat(auth):`) are encouraged.
- Craft commits that encapsulate a single logical change; avoid bundling formatting-only changes with feature work.
- Pull requests should include: purpose summary, testing notes (commands run, screenshots for UI changes), and links to relevant issues or docs.
- Request review from at least one teammate familiar with the affected area and wait for CI (if configured) before merging.
