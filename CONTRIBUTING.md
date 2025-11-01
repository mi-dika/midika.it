# Contributing

Thanks for your interest in improving MiDika's website! This repo follows a minimal, pragmatic workflow.

## Ground rules

- Keep it simple (KISS) and avoid unnecessary abstractions (YAGNI).
- Prefer TypeScript, functional React components, and Tailwind CSS 4.
- Match the existing code style (Prettier + ESLint Next.js preset).
- One logical change per PR; follow Conventional Commits.

## Quick start

```bash
pnpm install
pnpm check     # lint, type-check, etc.
pnpm build     # ensure it compiles
pnpm dev       # local development
```

## Code style

- Run: `pnpm lint`, `pnpm type-check`, `pnpm format` (use `pnpm format -- --write` before large edits).
- Tailwind: group classes logically (layout → spacing → color) and dedupe via `tailwind-merge`.

## Commit messages

Use Conventional Commits, e.g.:

- `feat: add stars background component`
- `fix: correct layout padding on mobile`
- `chore: bump dependencies`

## Pull requests

Before opening a PR:

- Ensure `pnpm check` and `pnpm build` pass locally.
- If UI changed, include a screenshot.
- Keep the description concise and list testing notes.

## Security

Please do not open public issues for security reports. See [SECURITY.md](SECURITY.md).
