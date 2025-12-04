# Next.js 16 Migration Guide

This document outlines the important changes, breaking changes, and new features in Next.js 16 that you need to be aware of when working on this project.

## 🚨 Breaking Changes

### 1. Removal of `next lint` Command

**What Changed:**

- The `next lint` command has been **completely removed** in Next.js 16
- You must now run ESLint manually using the `eslint` command
- This decouples linting from the Next.js build process

**Migration Steps:**

```bash
# Old way (Next.js 15 and earlier)
npm run lint  # This would run "next lint"

# New way (Next.js 16)
npm run lint  # Now runs "eslint ." directly
```

**Why This Change:**

- Gives developers more control over linting rules
- Avoids unwanted overhead during builds
- Allows for easier integration with other linting tools like Biome

**Project Impact:**

- Our `package.json` has been updated to use `eslint` directly
- ESLint configuration now uses the new ESLint flat config format (`eslint.config.mjs`)

### 2. Middleware Renamed to Proxy

**What Changed:**

- `middleware.ts` file has been renamed to `proxy.ts`
- This better reflects the file's role in handling network requests

**Migration Steps:**

```bash
# If you have a middleware.ts file, rename it:
mv middleware.ts proxy.ts
```

**Why This Change:**

- Clarifies the file's purpose in the Next.js architecture
- Aligns with improved understanding of the request/response cycle

**Project Impact:**

- Using `src/proxy.ts` for server-side analytics tracking
- If using the `src/` directory pattern, proxy must be in `src/proxy.ts`
- The proxy function must be a **default export** when async

### 3. Runtime Config Removed

**What Changed:**

- `serverRuntimeConfig` and `publicRuntimeConfig` have been removed
- These were previously used in `next.config.js`

**Migration Steps:**

```javascript
// Old way (Next.js 15 and earlier)
module.exports = {
  serverRuntimeConfig: {
    mySecret: 'secret',
  },
  publicRuntimeConfig: {
    apiUrl: 'https://api.example.com',
  },
};

// New way (Next.js 16)
// Use environment variables via .env files
// .env.local
// MY_SECRET=secret
// NEXT_PUBLIC_API_URL=https://api.example.com
```

**Why This Change:**

- Environment variables are more standard and predictable
- Better security practices
- Improved support for different deployment environments

**Project Impact:**

- Use `.env.local` for local development secrets
- Use `NEXT_PUBLIC_` prefix for client-side environment variables
- Never commit `.env.local` to version control

### 4. Synchronous Access Removed (Dynamic APIs)

**What Changed:**

- Certain functions that were previously synchronous are now **asynchronous**
- This includes: `cookies()`, `headers()`, `params`, `searchParams`

**Migration Steps:**

```typescript
// Old way (Next.js 15 and earlier)
import { cookies } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  return <div>Token: {token}</div>;
}

// New way (Next.js 16)
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  return <div>Token: {token}</div>;
}
```

**Examples:**

```typescript
// Headers
import { headers } from 'next/headers';

export default async function Page() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent');

  return <div>User Agent: {userAgent}</div>;
}

// Params
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return <div>ID: {id}</div>;
}

// Search Params
export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ query: string }>
}) {
  const { query } = await searchParams;

  return <div>Search: {query}</div>;
}
```

**Why This Change:**

- Enables better streaming and partial prerendering
- Improves performance by allowing React to suspend on these operations
- Aligns with React Server Components best practices

**Project Impact:**

- **IMPORTANT:** All route handlers and server components must be updated
- Add `async` to component functions that use these APIs
- Add `await` when calling these functions

## ✨ New Features

### 1. Improved ESLint Configuration

Next.js 16 introduces a new ESLint flat config format that's more flexible and powerful.

**Example (our current setup):**

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
```

### 2. Better TypeScript Support

- Improved type inference for Server Components
- Better typing for dynamic APIs (`params`, `searchParams`)
- Enhanced support for React 19 types

### 3. Performance Improvements

- Faster build times
- Improved tree-shaking
- Better code splitting

## 🔧 Development Workflow Changes

### Running Quality Checks

Since `next lint` is removed, we've created a comprehensive check script:

```bash
# Run all checks (type checking, linting, formatting, build)
pnpm check

# Individual checks
pnpm type-check
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:fix
```

### ESLint in Next.js 16

- Use `eslint` command directly instead of `next lint`
- Configure via `eslint.config.mjs` (flat config format)
- No more `.eslintrc.json` files

## 📦 Dependencies

### React 19 Compatibility

Next.js 16 requires React 19:

```json
{
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

### ESLint 9

Next.js 16 works with ESLint 9 and the new flat config format:

```json
{
  "devDependencies": {
    "eslint": "^9",
    "eslint-config-next": "16.0.1"
  }
}
```

## 🎯 Best Practices for Next.js 16

1. **Always use `async/await` for dynamic APIs**
   - `cookies()`, `headers()`, `params`, `searchParams`

2. **Use environment variables instead of runtime config**
   - `.env.local` for local development
   - `NEXT_PUBLIC_` prefix for client-side variables

3. **Run ESLint separately from build**
   - Use `pnpm lint` before committing
   - Don't rely on build-time linting

4. **Keep Server Components async when using dynamic APIs**
   - Makes streaming and PPR (Partial Prerendering) work better

5. **Use the new ESLint flat config format**
   - More flexible and easier to understand
   - Better support for modern JavaScript tools

## 🔗 Additional Resources

- [Next.js 16 Official Release Notes](https://nextjs.org/blog/next-16)
- [Next.js 16 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-16)
- [React 19 Documentation](https://react.dev/blog/2024/12/05/react-19)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)

## 📝 Checklist for This Project

- [x] Updated to Next.js 16.0.1
- [x] Updated to React 19.2.0
- [x] Configured ESLint with flat config format
- [x] Removed `next lint` from scripts
- [x] Added Prettier for code formatting
- [x] Created comprehensive check script
- [x] Migrated middleware.ts to proxy.ts (src/proxy.ts)
- [ ] Audit all Server Components for async dynamic API usage
- [ ] Ensure all environment variables use proper naming

---

**Last Updated:** November 1, 2025
**Next.js Version:** 16.0.1
**React Version:** 19.2.0
