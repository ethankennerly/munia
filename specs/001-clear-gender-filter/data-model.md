# Data Model & Design: Clear Gender Dropdown Search Filter

**Phase**: Phase 1  
**Date**: February 8, 2026  
**Status**: Complete

## Entity Analysis

### Entities Involved

#### 1. Filter State
**Represents**: Current filter selections in the Discover page

**Structure**:
```typescript
interface DiscoverFilters {
  gender?: Gender;        // MALE | FEMALE | NONBINARY | undefined (clear)
  'relationship-status'?: RelationshipStatus;  // SINGLE | IN_A_RELATIONSHIP | ENGAGED | MARRIED | undefined (clear)
}
```

**Properties**:
- Stored in: URL query parameters (client-side state only)
- Accessed via: `useSearchParams()` hook
- Modified via: `useRouter().push(url)` (Next.js navigation)

**Clear State**:
- Representation: `gender` key is absent from URLSearchParams
- Selection: User selects "(Any)" option with key=`null`
- Effect: `updateParams()` function removes gender parameter from URL

---

#### 2. Select Component State
**Represents**: Dropdown UI element managing single filter selection

**Structure**:
```typescript
interface SelectState {
  selectedKey: Key | null;                // Current selection key
  isOpen: boolean;                        // Dropdown open/closed
  isLoading?: boolean;                    // Optional loading state
}
```

**Properties**:
- Implementation: React Stately `useSelectState()` hook
- UI Library: React Aria `useSelect()` for accessibility
- Available Keys: 
  - `null` → unselected/clear state
  - `'MALE'` → Male filter
  - `'FEMALE'` → Female filter
  - `'NONBINARY'` → Non-binary filter

**Lifecycle**:
1. Page load: Read query param from URL → set selectedKey
2. User interaction: Click dropdown item → trigger `onSelectionChange()`
3. State update: Call `updateParams()` → URL changes
4. URL change: `useSearchParams()` re-evaluates → Select re-renders with new selectedKey

---

#### 3. DiscoverFilters Component
**Represents**: Filter UI container managing all filter interactions

**Structure**:
```typescript
interface DiscoverFiltersProps {
  // No props - pulls state from URL via hooks
}

interface DiscoverFiltersState {
  filters: {
    gender: string | undefined;           // From URL ?gender=male
    relationshipStatus: string | undefined;  // From URL ?relationship-status=single
  };
}
```

**Responsibilities**:
- Render gender dropdown with options
- Render relationship status dropdown with options
- Handle selection changes via callbacks
- Transform URL ↔ Display values (kebabCase ↔ SNAKE_CASE)
- Maintain filter independence (clearing one doesn't affect others)

---

## Filter Value Transformations

### Gender Filter Example Flow

```typescript
// URL contains: ?gender=male

// Step 1: Read from URL
const filters = {
  gender: searchParams?.get('gender') || undefined  // "male"
}

// Step 2: Transform for Select (uppercase, snakeCase)
selectedKey = toUpper(snakeCase(filters.gender))    // "MALE"

// Step 3: Display
<Item key="MALE">{getGenderLabel(Gender.MALE)}</Item>  // "Male" (translated)

// Step 4: User selects "(Any)" (key=null)
onSelectionChange(null)  // Triggers callback

// Step 5: Update URL
updateParams({ key: 'gender', value: undefined })
// → newSearchParams.delete('gender')
// → URL changes to remove ?gender param

// Step 6: Select re-renders
selectedKey = null
// → Floating label shows "Filter by Gender"
// → No selection displayed
```

---

## Localization Strategy

### Dropdown Options Labels

#### Clear Option (New)
```typescript
// Hook function to be added to useLocalizedEnums.ts
const getClearLabel = () => t('filter_any')  // i18n key

// i18n translations
{
  "filter_any": "(Any)"  // English
  "filter_any": "(Cualquiera)"  // Spanish
}
```

#### Existing Gender Options
```typescript
// Already exists in useLocalizedEnums.ts
const getGenderLabel = (gender: Gender) => {
  case Gender.MALE: return t('components_male')     // "Male"
  case Gender.FEMALE: return t('components_female') // "Female"
  case Gender.NONBINARY: return t('components_nonbinary')  // "Non-binary"
}
```

---

## Component Interaction Model

### User Interaction Flow

```
┌─────────────────────────────────────────────────────────┐
│ Discover Page Renders                                   │
└──────────────┬──────────────────────────────────────────┘
               │
               ├─ useSearchParams() reads URL
               │  ?gender=male&relationship-status=single
               │
               ├─ DiscoverFilters renders two Selects:
               │  1. Gender: selectedKey="MALE"
               │  2. Status: selectedKey="IN_A_RELATIONSHIP"
               │
               └─ Selects render with current selections
                  ├─ Gender dropdown shows "Male" selected
                  └─ Status dropdown shows "In a relationship" selected

User clicks Gender dropdown
               │
               ├─ Select opens menu
               │  Items: [(Any), Male, Female, Non-binary]
               │
               └─ User hovers over "(Any)"
                  ├─ Item highlights
                  └─ No tooltip (already clear label)

User clicks "(Any)"
               │
               ├─ onSelectionChange(null) fires
               │
               ├─ updateParams({ key: 'gender', value: undefined })
               │
               ├─ newSearchParams.delete('gender')
               │
               ├─ router.push(url, { scroll: false })
               │  URL changes: ?relationship-status=single
               │
               └─ Component re-renders
                  ├─ useSearchParams() returns new params
                  ├─ filters.gender = undefined
                  ├─ selectedKey = null
                  ├─ Select shows no selection + floating label
                  └─ Relationship filter unchanged ✓
```

---

## Type Definitions

### Current Types (No Changes Needed)

```typescript
// From src/types/definitions.ts
export type DiscoverFilterKeys = 'gender' | 'relationship-status';

export interface DiscoverFilters {
  gender?: Gender;
  'relationship-status'?: RelationshipStatus;
}

// From @prisma/client
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NONBINARY = 'NONBINARY',
}

export enum RelationshipStatus {
  SINGLE = 'SINGLE',
  IN_A_RELATIONSHIP = 'IN_A_RELATIONSHIP',
  ENGAGED = 'ENGAGED',
  MARRIED = 'MARRIED',
}
```

---

## API Contract (None Required)

✅ **No API changes needed**

Filters are client-side only:
- URL state: managed by browser URLSearchParams
- GET /api/users endpoint already supports `?gender=male` parameter
- Removing parameter from URL naturally filters by all genders (existing behavior)

---

## State Management Pattern

### Current Pattern (No Changes)

```typescript
// URL is source of truth
const searchParams = useSearchParams()    // Read current state
const router = useRouter()                // Update state via URL

// No Redux/Context needed - URL is stateful
// No database needed - filters are ephemeral

// Benefits:
// ✓ State persists across page refresh (in URL)
// ✓ Shareable links include filter state
// ✓ No client state to sync
```

---

## Backward Compatibility

✅ **100% Backward Compatible**

- Adding "(Any)" option doesn't break existing selections
- Gender values (MALE, FEMALE, NONBINARY) unchanged
- Relationship status values unchanged
- URL parameter names unchanged (`gender`, `relationship-status`)
- Existing bookmarks/links with filters still work

---

## Performance Characteristics

- **Dropdown render**: O(n) where n = filter options (≤5 items)
- **URL update**: O(1) URLSearchParams operation
- **Component re-render**: Only DiscoverFilters and Select re-render
- **Network calls**: Zero (filters are client-side only)
- **Browser re-paint**: Single focused re-render per user action

---

## Accessibility Model

✅ **Already Handled by React Aria**

The Select component uses React Aria which provides:
- Keyboard navigation (arrow keys, enter)
- Screen reader announcements
- Focus management
- ARIA attributes

Adding "(Any)" option inherits all accessibility features automatically.

---

## Error Scenarios

### Edge Case: Invalid URL Parameter

```typescript
// URL contains: ?gender=invalid
filters.gender = 'invalid'  // string

// Select behavior:
selectedKey = toUpper(snakeCase('invalid'))  // 'INVALID'
// Select finds no matching Item with key='INVALID'
// → selectedKey becomes null (uncontrolled behavior)
// → Displays as unselected (same as "(Any)" state)
// → User clicks item to set valid selection

// Note: This is existing behavior; no change needed
// Validation happens on backend (/api/users endpoint)
```

### Edge Case: User Rapidly Clicks Clear

```typescript
// User clicks "(Any)" repeatedly while previous request pending

// Current behavior:
// 1. Click → router.push() → URL updates → component re-renders
// 2. Click → same logic again (URL already updated)
// 3. Result: Multiple router.push() calls but URL ends in same state

// Outcome: Harmless; router deduplicates identical updates
// No debounce needed per spec (spec doesn't mention this edge case)
```

---

## Summary

The clear filter feature requires minimal changes to the existing architecture:
- Add one dropdown option "(Any)" with key=null
- Add one i18n key for label translation
- Reuse existing filter update logic
- No type changes, no API changes, no state management changes
- Fully backward compatible
- All accessibility features inherited from Select component
