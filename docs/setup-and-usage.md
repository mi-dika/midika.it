# Setup & Usage

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev    # Start dev server
pnpm build  # Build for production
```

## Quality Checks

```bash
pnpm check  # Auto-fix lint/format + check types
```

The check script:

1. Auto-fixes ESLint issues
2. Auto-formats with Prettier
3. Checks TypeScript types

Only type errors need manual fixing.

## Individual Commands

```bash
pnpm lint        # Check linting
pnpm format      # Check formatting
pnpm type-check  # Check types only
```

## VSCode

Install recommended extensions when prompted:

- ESLint
- Prettier
- Tailwind CSS IntelliSense

Format on save is configured automatically.

## Next.js 16

Key changes to know:

- Use `pnpm lint` not `next lint`
- `cookies()`, `headers()`, `params`, `searchParams` are now async
- Use `await` when accessing these APIs

See [nextjs-16-migration.md](./nextjs-16-migration.md) for details.
