# Sharing Markdown Between GitHub README and Next.js Site

This document explains how to dynamically share markdown content between your GitHub repository's `README.md` and your Next.js application using a Single Source of Truth pattern.

## Architecture

The solution uses a **build-time file reading approach** where:

1. **Source of Truth**: `README.md` at the repository root serves as the single source
2. **Next.js Integration**: Server Components read the file directly from the file system at build time
3. **Markdown Rendering**: `react-markdown` with `remark-gfm` renders GitHub Flavored Markdown with styling via Tailwind Typography

## How It Works

### 1. File Reading Utility (`src/lib/markdown/readMarkdownFile.ts`)

This utility reads markdown files from the file system using Node.js `fs.readFileSync`:

```typescript
import { readMarkdownFile } from '@/lib/markdown/readMarkdownFile';

// In a Server Component
const content = readMarkdownFile('README.md');
```

### 2. Markdown Renderer Component (`src/components/MarkdownRenderer.tsx`)

The `MarkdownRenderer` component renders markdown with:
- **GitHub Flavored Markdown** support (tables, strikethrough, task lists, etc.)
- **HTML support** via `rehype-raw`
- **Tailwind Typography** classes for automatic styling
- **Custom link handling** for internal Next.js routes

### 3. Usage in Pages

Example Server Component page:

```typescript
// src/app/[locale]/readme/page.tsx
import { readMarkdownFile } from '@/lib/markdown/readMarkdownFile';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

export default function ReadmePage() {
  const readmeContent = readMarkdownFile('README.md');
  
  return (
    <main className="container mx-auto px-4 py-8">
      <MarkdownRenderer content={readmeContent} />
    </main>
  );
}
```

## Advantages

✅ **No Duplication**: Single source of truth eliminates content drift  
✅ **Build-Time Safety**: File reading happens at build time, catching errors early  
✅ **Type Safety**: TypeScript ensures correct usage  
✅ **GitHub Compatibility**: Full GFM support means README.md renders correctly on GitHub  
✅ **Performance**: Static content is rendered at build time, no runtime fetching  

## Alternative Approaches

### Option A: Remote Fetch (Not Recommended)

Fetching from GitHub raw URLs at runtime:

```typescript
// This approach has drawbacks:
// - Requires network request at runtime
// - GitHub rate limiting concerns
// - No offline capability
// - Build-time errors not caught

const response = await fetch('https://raw.githubusercontent.com/.../README.md');
const content = await response.text();
```

### Option B: MDX with Content Sync

Using MDX with a sync script:

```bash
# Sync script (e.g., in package.json)
"sync:readme": "cp content/README.md README.md"
```

Then use `next-mdx-remote` to render MDX. This adds complexity but enables React components in markdown.

### Option C: Content Management

For frequently updated content, consider:
- **Contentlayer 2** (if available) or similar content management solutions
- **CMS integration** (Contentful, Sanity, etc.)
- **Git-based CMS** (TinaCMS, Forestry)

## Setup Requirements

1. **Dependencies** (already installed):
   - `react-markdown`
   - `remark-gfm` (GitHub Flavored Markdown)
   - `rehype-raw` (HTML support)

2. **Tailwind Typography** (already installed):
   - `@tailwindcss/typography` plugin
   - Prose classes enabled in `tailwind.config.js`

3. **TypeScript Path Alias**:
   - `@/*` mapped to `./src/*` (already configured)

## Best Practices

1. **Keep README.md at Root**: Maintain it as the authoritative source
2. **Server Components Only**: File system access only works in Server Components or API routes
3. **Error Handling**: The utility throws descriptive errors if files are missing
4. **Styling**: Use Tailwind Typography's prose classes for automatic markdown styling
5. **Links**: Customize link rendering in `MarkdownRenderer` for internal routing

## Troubleshooting

**Error: "Failed to read markdown file"**
- Ensure the file path is relative to project root
- Check file exists in the repository
- Verify path is correct (case-sensitive on Linux)

**Markdown not rendering correctly**
- Check Tailwind Typography is configured
- Verify `remark-gfm` is in remarkPlugins
- Check for malformed markdown syntax

**Links not working**
- External links should use full URLs
- Internal links: customize `MarkdownRenderer` component's link handler
- Next.js `Link` component integration may be needed for client-side navigation
