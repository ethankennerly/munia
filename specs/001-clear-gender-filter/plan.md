# Implementation Plan: Clear Gender Dropdown Search Filter

**Branch**: `001-clear-gender-filter` | **Date**: February 8, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-clear-gender-filter/spec.md`

## Summary

Add a clear/reset mechanism for the gender filter in the Discover page's gender dropdown. Users can clear an applied gender filter by selecting a "(Any)" option as the first item in the dropdown, making all gender profiles visible again without page reload. The implementation will add a consistent "clear" pattern to all dropdown filters across the application.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15+  
**Primary Dependencies**: React Server Components, React Query, React Stately, React Aria, Prisma ORM  
**Storage**: Prisma with URL search parameters (no backend storage needed)  
**Testing**: Vitest + React Testing Library (colocated tests with `.spec.tsx` suffix)  
**Target Platform**: Next.js web application (React Server Components)  
**Project Type**: Web application (Next.js monorepo)  
**Performance Goals**: Filter updates complete within 100ms; no page reload required  
**Constraints**: <100ms client-side filter update time; must support URL state persistence; must work with SSR/hydration  
**Scale/Scope**: Single component modification (DiscoverFilters) + Select component enhancement; affects Discover page initially, expandable to other filter-based pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **TDD-First Workflow**: Tests will be colocated with implementation (`*.spec.tsx`), written before implementation  
✅ **Test Performance**: Feature tests expected to complete within 1s; full suite within 10s  
✅ **Code Standards**: Will follow project conventions (React Query for state, Prisma for queries, localization patterns)  
✅ **No Violations Identified**: Feature is low-complexity, scoped, and aligns with existing patterns

## Project Structure

### Documentation (this feature)

```text
specs/001-clear-gender-filter/
├── spec.md                         # Feature specification
├── plan.md                         # This file
├── research.md                     # Phase 0: Clarifications & research
├── data-model.md                   # Phase 1: Data model & entity definitions
├── contracts/                      # Phase 1: API contracts (if applicable)
├── quickstart.md                   # Phase 1: Quick start guide
├── checklists/
│   └── requirements.md             # Quality assurance checklist
└── tasks.md                        # Phase 2: Implementation tasks (future)
```

### Source Code (Next.js Web Application)

```text
src/
├── components/
│   ├── DiscoverFilters.tsx              # MODIFY: Add clear option to Select
│   └── ui/
│       └── Select.tsx                   # REVIEW: Ensure supports clear states
├── hooks/
│   └── useLocalizedEnums.ts             # REVIEW: For gender labels
├── app/
│   └── [locale]/
│       └── discover/
│           └── page.tsx                 # CONTEXT: Uses DiscoverFilters
├── types/
│   └── definitions.ts                   # REVIEW: DiscoverFilterKeys type

tests/ (colocated with source)
├── DiscoverFilters.spec.tsx             # ADD: Test clear gender filter
└── ui/Select.spec.tsx                   # REVIEW: Existing tests
```

**Structure Decision**: Web application (Next.js). Feature is localized to `src/components/DiscoverFilters.tsx` with supporting modifications to `src/components/ui/Select.tsx` and `src/hooks/useLocalizedEnums.ts`. Tests will be colocated with components using `.spec.tsx` suffix following project convention.

## Complexity Tracking

✅ **No Constitutional Violations**: This feature is straightforward UI enhancement with no architectural complexity.

## Phase 0 & Phase 1 Deliverables

### Phase 0: Research & Clarifications ✅ Complete
- [research.md](research.md) - No unknowns; all requirements clarified

### Phase 1: Design & Contracts ✅ Complete
- [data-model.md](data-model.md) - Entity definitions, state management, interactions
- [quickstart.md](quickstart.md) - Implementation overview & testing strategy
- [contracts/api.md](contracts/api.md) - API contracts (no changes required)
- Updated agent context for Copilot

## Ready for Implementation

✅ All Phase 0 & Phase 1 outputs complete  
✅ No blocking unknowns  
✅ Technical approach validated  
✅ Test strategy documented  
✅ Next: Generate [tasks.md](tasks.md) via `/speckit.tasks` command for Phase 2

---
