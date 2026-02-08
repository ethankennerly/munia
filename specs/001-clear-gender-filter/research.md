# Research & Clarifications: Clear Gender Dropdown Search Filter

**Phase**: Phase 0  
**Date**: February 8, 2026  
**Status**: Complete

## Investigation Summary

All requirements in the specification are clear and unambiguous. No clarifications needed. The implementation approach is straightforward based on the existing codebase analysis.

---

## Key Findings

### 1. Current Gender Filter Implementation

**Decision**: Implement clear mechanism as the first item in the dropdown dropdown, labeled "(Any)"

**Rationale**: 
- Aligns with spec requirement FR-007: "Cleared state is the first option in the dropdown"
- Consistent UX pattern: users select "(Any)" to clear the filter, no separate button needed
- Requires minimal component modifications

**Code Reference**:
- `DiscoverFilters.tsx`: Component managing gender/relationship filters
- `Select.tsx`: Dropdown UI component using React Stately/React Aria
- Flow: User selects item → `onSelectionChange` callback → `updateParams()` updates URL

### 2. URL State Management

**Decision**: Use existing pattern - when selectedKey is `null`, delete the query parameter

**Rationale**: Already implemented in `updateParams()` function (line 32-34):
```typescript
if (value === undefined) {
  newSearchParams.delete(key);
}
```

**Implementation**: When user selects "(Any)" with key=`null`, the `gender` parameter is removed from URL

### 3. Dropdown Selection Key for Clear Option

**Decision**: Use `null` as the key for the "(Any)" clear option

**Rationale**:
- Matches existing logic in `onSelectGender()` (line 45-50)
- When `key` is null/falsy, the undefined value is passed to `updateParams()`
- Existing code already handles this correctly

### 4. Localization for Clear Option

**Decision**: Add new i18n key `filter_clear` or `filter_any` to all language files

**Rationale**:
- Spec FR-009: "The cleared state label is equal in all dropdowns" and "The cleared state is localized"
- Must support existing languages (en.json, es.json, etc.)
- Label "(Any)" is not language-specific but should be translatable

**Files to Update**:
- `src/i18n/en.json`: Add `"filter_any": "(Any)"`
- `src/i18n/es.json`: Add `"filter_any": "(Cualquiera)"`
- Other language files following same pattern

### 5. Select Component State Handling

**Decision**: No Select.tsx modifications needed; it already supports `selectedKey={null}`

**Rationale**:
- Select component uses React Stately which handles null selection correctly
- Current code shows `selectedKey={toUpper(snakeCase(filters.gender)) || null}` (line 66)
- When no gender filter, selectedKey is already null
- The dropdown correctly shows the floating label in unselected state

### 6. Relationship Status Filter Parity

**Decision**: Apply same "(Any)" clear pattern to relationship status dropdown

**Rationale**:
- Spec FR-008: "The cleared dropdown option not only appears in Gender, but also in Relationship Status, and any other drop down"
- Ensures consistency across all filters
- Minimal code change (same pattern replicated)

### 7. User Story Independence

**Decision**: Both stories can be implemented in single atomic change

**Rationale**:
- P1 (clear functionality) and P2 (UI affordance) are solved by the same mechanism
- Selecting "(Any)" is both the action (clear) and the visual affordance
- No separate button needed; clear discovery via dropdown options

---

## Implementation Approach

### Summary

Add a "(Any)" option as the first item in gender and relationship status dropdowns. When selected, it clears the filter (removes query parameter). No Select component modifications needed; the existing pattern already supports this through null key handling.

### Files to Modify

1. **DiscoverFilters.tsx** (primary change)
   - Add `(Any)` item as first option before gender/status filters
   - Use `null` key for the clear option
   - Reuse existing `updateParams()` logic

2. **useLocalizedEnums.ts** (helper function)
   - Add function to get clear label: `getClearLabel()` → returns localized "(Any)"

3. **i18n/en.json, es.json, etc.** (localization)
   - Add `"filter_any": "(Any)"` or `"filter_clear": "(Any)"`
   - Add Spanish equivalent, and other languages

4. **DiscoverFilters.spec.tsx** (tests - colocated)
   - Test selecting "(Any)" clears the gender filter
   - Test URL is updated correctly (gender param removed)
   - Test filter state resets to unselected
   - Test relationship status filter unaffected

### No Changes Needed

- **Select.tsx**: Already handles null selection correctly
- **API routes**: No backend changes needed (filters are URL-only, handled on client)
- **Types**: DiscoverFilterKeys type already supports undefined value for filters

---

## Dependency Analysis

### Internal Dependencies
- React hooks: `useCallback`, `useTranslations`
- React Navigation: `useRouter`, `useSearchParams`, `usePathname`
- Existing utilities: `kebabCase`, `snakeCase`, `toUpper` from lodash
- Select component: Already exists and supports pattern

### External Dependencies
- **next-intl**: For localization (already in project)
- **lodash**: For string transformations (already in project)
- **react-stately**: For dropdown state management (already in Select.tsx)

### No New Dependencies Required ✅

---

## Performance & Technical Notes

✅ **Performance**: No performance impact
- URL update via `router.push()` with `scroll: false`
- Client-side only; no network calls needed
- Filter clearing is instant (no debouncing needed - already handled by router)

✅ **Browser Support**: Works in all modern browsers
- URLSearchParams API supported (project already uses it)
- React Stately handles all browser keyboard/mouse interactions

✅ **SSR Compatibility**: Works with Next.js Server Components
- URL state is readable from `useSearchParams()` 
- No client-side hydration issues
- Component is already `'use client'` directive

✅ **Accessibility**: Dropdown handles keyboard (via React Aria)
- Arrow keys to navigate items
- Enter to select
- Already implemented in Select.tsx

---

## Design Decisions Documented

| Decision | Alternative Considered | Why Selected |
|----------|----------------------|--------------|
| Clear as "(Any)" option in dropdown | Separate clear button outside dropdown | Fewer UI elements, more discoverable, aligns with spec |
| Use `null` as key for clear state | Use empty string "" | null is conventional for unselected state in React |
| Add to both Gender & Status | Gender only initially | Consistency across all filters (spec requirement FR-008) |
| New i18n key `filter_any` | Reuse filter_by_gender | Clearer intent, allows language-specific customization |

---

## Confidence Level

🟢 **HIGH CONFIDENCE** - All unknowns clarified through codebase analysis. No research blockers. Ready for Phase 1 design and Phase 2 implementation.
