# Credit Optimization Guide for Munia Project

This document outlines specific edits to minimize credit consumption when working with the Munia codebase.

## Created Files

### `.cursorignore` ✅
**Status**: Created  
**Estimated Savings**: **~450-675KB** of indexed content + significant token overhead reduction

This file tells Cursor to ignore certain directories when indexing the codebase, reducing the context window size for every AI interaction.

#### What's Excluded:
1. **`/docs`** (~108KB, ~2067 lines)
   - All specification documents
   - Testing documentation
   - Reference material that doesn't change frequently
   - **Impact**: Specs are reference material, not active code

2. **`/prisma/migrations`** (~116KB, 29 migration folders)
   - Historical database migrations
   - Rarely needed for active development
   - **Impact**: Historical data, not current schema

3. **`/src/svg_components`** (~228KB, 56 generated files)
   - Auto-generated TypeScript components from SVG sources
   - Can be regenerated with `npm run svgr`
   - **Impact**: Generated code, not source code

4. **`/src/vectors`** (Optional, ~224KB, 56 SVG files)
   - Source SVG files
   - Currently commented out in `.cursorignore`
   - **Impact**: Only exclude if you don't work with SVG assets directly

## Estimated Token Savings Per Interaction

### Baseline Context Size
Without optimizations, each AI interaction may include:
- ~2,067 lines of documentation
- 29 migration files (historical)
- 56 generated SVG components
- All source code files

### After Optimization
- Documentation excluded: ~2,067 lines saved per search
- Migrations excluded: ~29 files saved per search
- Generated components excluded: ~56 files saved per search
- **Total**: ~450-675KB of content no longer indexed

### Per-Query Savings Estimate
- **Small queries** (single file edits): ~5-15% reduction in context tokens
- **Medium queries** (multi-file changes): ~10-25% reduction
- **Large queries** (codebase-wide searches): ~20-40% reduction

## Additional Recommendations

### 1. Simplify Documentation (If Needed)
If you need docs indexed but want to reduce size:
- Consolidate multiple spec files into single documents
- Remove redundant examples and explanations
- Keep only active/current specifications

**Potential Savings**: ~30-50% reduction in doc size if consolidated

### 2. Archive Old Migrations (Advanced)
For long-term projects, consider:
- Archiving migrations older than 1 year
- Keeping only the latest migration files
- Documenting schema evolution in separate docs

**Potential Savings**: ~50-80KB for very old projects

### 3. Limit Search Scope
When possible:
- Use specific file paths in queries
- Target specific directories: `codebase_search` with `target_directories`
- Use `grep` for exact string matches instead of semantic search

**Potential Savings**: Variable, but can reduce context by 50-90% for targeted searches

## How to Use

1. **The `.cursorignore` file is already created** - Cursor will automatically respect it
2. **Verify exclusions** - Check that excluded directories aren't needed for your current work
3. **Re-enable if needed** - Comment out lines in `.cursorignore` if you need access to excluded content
4. **Monitor usage** - Check your Cursor usage dashboard to see actual savings

## What to Keep Indexed

The following are **actively indexed** and should remain so:
- `/src/app` - Next.js pages and routes
- `/src/components` - React components
- `/src/lib` - Utility functions and helpers
- `/src/hooks` - Custom React hooks
- `/prisma/schema.prisma` - Current database schema
- Configuration files (`package.json`, `tsconfig.json`, etc.)

## Re-enabling Excluded Content

If you need to access excluded content temporarily:
1. Open `.cursorignore`
2. Comment out the line (add `#` prefix)
3. Restart Cursor or wait for re-indexing

Example:
```ignore
# Temporarily enable docs for a specific task
# /docs
```

## Verification

After implementing these changes:
- Cursor should index significantly fewer files
- Code searches should be faster and more focused
- Your credit usage per interaction should decrease
- Check Cursor settings → Usage to monitor actual savings

