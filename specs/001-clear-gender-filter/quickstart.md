# Quickstart: Clear Gender Dropdown Search Filter

**Phase**: Phase 1  
**Date**: February 8, 2026  
**Status**: Implementation Ready

## Feature Overview

Add a clear/reset mechanism for the gender and relationship status filters in the Discover page. Users select "(Any)" as the first option in any dropdown to clear that filter and see all profiles again.

## What Gets Built

### User Experience

1. **Discover page with filters applied**
   - Gender: "Male" is selected
   - Status: "Single" is selected

2. **User opens gender dropdown**
   - First option: **(Any)** ← NEW
   - Other options: Male, Female, Non-binary

3. **User selects "(Any)"**
   - Gender filter clears instantly
   - URL changes: `?relationship-status=single` (gender param removed)
   - Dropdown returns to unselected state with floating label

### Implementation

```
┌─ DiscoverFilters.tsx
│  ├─ Add "(Any)" Item as first option (before MALE, FEMALE, NONBINARY)
│  ├─ Use key={null} for clear option
│  ├─ Same logic for relationship status dropdown
│
├─ useLocalizedEnums.ts  
│  └─ Add getClearLabel() function → t('filter_any')
│
├─ i18n/en.json
│  └─ Add: "filter_any": "(Any)"
│
└─ i18n/es.json
   └─ Add: "filter_any": "(Cualquiera)"
   
Plus: Add tests to DiscoverFilters.spec.tsx
```

## Implementation Checklist

- [ ] **Phase 0**: ✅ Research complete - no blockers
- [ ] **Phase 1**: ✅ Design complete - ready to implement
- [ ] **Phase 2**: Implementation tasks (see [tasks.md](tasks.md) when generated)
  - [ ] Add "(Any)" dropdown option
  - [ ] Add localization key
  - [ ] Write failing tests
  - [ ] Implement feature
  - [ ] Pass all tests
  - [ ] Pre-push validation
  - [ ] Create PR

## Key Files

### Modify These Files

| File | Change | Lines | Why |
|------|--------|-------|-----|
| `src/components/DiscoverFilters.tsx` | Add clear option to gender dropdown | ~5 | Core feature |
| `src/components/DiscoverFilters.tsx` | Add clear option to relationship dropdown | ~5 | Feature parity |
| `src/hooks/useLocalizedEnums.ts` | Add getClearLabel() | ~3 | Localization |
| `src/i18n/en.json` | Add "filter_any": "(Any)" | ~1 | English label |
| `src/i18n/es.json` | Add "filter_any": "(Cualquiera)" | ~1 | Spanish label |
| `src/i18n/*.json` | Add labels for all languages | N/A | Localization |

### Create These Test Files

| File | Tests | Why |
|------|-------|-----|
| `src/components/DiscoverFilters.spec.tsx` | 4-5 test cases | TDD: write failing tests first |

### No Changes Needed

- ✅ `src/components/ui/Select.tsx` - Already handles null selection
- ✅ `src/app/api/users/GET.ts` - Filters work without param in URL
- ✅ `src/types/definitions.ts` - Types already support optional filters
- ✅ `prisma/schema.prisma` - No database changes

## Implementation Path

### Step 1: Write Failing Tests
Create `src/components/DiscoverFilters.spec.tsx` with test cases:
```typescript
describe('DiscoverFilters - Clear Gender Filter', () => {
  it('should render "(Any)" as first option in gender dropdown', () => {})
  it('should clear gender filter when "(Any)" is selected', () => {})
  it('should remove gender query param from URL', () => {})
  it('should not affect relationship status filter', () => {})
})
```

### Step 2: Add Localization
1. Add i18n key to `src/i18n/en.json`: `"filter_any": "(Any)"`
2. Add i18n key to `src/i18n/es.json`: `"filter_any": "(Cualquiera)"`
3. Add keys to all other language files

### Step 3: Implement Feature
1. Add getClearLabel() to `src/hooks/useLocalizedEnums.ts`
2. Update DiscoverFilters.tsx to render "(Any)" option first
3. Tests should pass automatically (existing logic handles null selection)

### Step 4: Validate
```bash
npm run test                    # Tests pass ✓
npm run lint                    # No lint errors ✓
npm run build                   # Builds successfully ✓
./git_hooks/pre-push            # All checks pass ✓
```

### Step 5: Create PR
Push feature branch and create pull request with test coverage

## Code Pattern Reference

### Adding Clear Option to Dropdown

**Before**:
```tsx
<Select>
  {genderFilters.map((gender) => (
    <Item key={gender}>{getGenderLabel(gender)}</Item>
  ))}
</Select>
```

**After**:
```tsx
<Select>
  <Item key={null}>{getClearLabel()}</Item>
  {genderFilters.map((gender) => (
    <Item key={gender}>{getGenderLabel(gender)}</Item>
  ))}
</Select>
```

### Adding Localization Function

```typescript
// In useLocalizedEnums.ts
export function useLocalizedEnums() {
  const t = useTranslations();
  
  const getClearLabel = () => t('filter_any');
  
  const getGenderLabel = (gender: Gender | null) => {
    // ... existing code ...
  };
  
  return { getClearLabel, getGenderLabel, getRelationshipLabel };
}
```

## Testing Strategy

### Test Cases (TDD Order - Write First)

1. **Visual**: "(Any)" option appears as first item
2. **Interaction**: Selecting "(Any)" triggers selection change
3. **State**: Gender filter value becomes undefined
4. **URL**: Gender query parameter removed from URL
5. **Isolation**: Relationship status filter unaffected
6. **Persistence**: Filter state persists across page refresh

### Test Tools Available

- **Framework**: Vitest (npm run test)
- **UI Testing**: React Testing Library (@testing-library/react)
- **Utilities**: 
  - Mock `useRouter`: `vi.mock('next/navigation')`
  - Mock `useSearchParams`: `vi.mock('next/navigation')`
  - Mock `useTranslations`: `vi.mock('next-intl')`

## Expected Metrics (Success Criteria)

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Time to clear filter | <100ms | Browser DevTools performance |
| Page reload required | None | No page refresh happens |
| User clicks to clear | 1 click | Select option, filter clears |
| Test coverage | >90% | Vitest coverage report |
| Accessibility | WCAG 2.1 AA | React Aria handles this |

## Rollback Plan

If something breaks:
1. Delete the feature branch: `git branch -D 001-clear-gender-filter`
2. Main branch is unaffected
3. No database migrations = no rollback complexity

## Next Steps

1. **Phase 2**: Generate tasks.md with specific implementation steps
2. **Develop**: Follow TDD workflow (test-first)
3. **Validate**: Run pre-push checks before pushing
4. **Review**: Create PR with clear description and test coverage
5. **Deploy**: Merge to main when approved

---

**Ready to implement?** Run `/speckit.tasks` to generate detailed task breakdown.
