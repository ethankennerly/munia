# API Contracts: Clear Gender Filter Feature

**Phase**: Phase 1  
**Date**: February 8, 2026  
**Status**: No API Changes Required

## Summary

✅ **No API changes needed** for this feature. The clear filter mechanism is implemented entirely on the client side through URL state management. The backend `/api/users` endpoint already supports optional `gender` parameter and naturally returns all genders when the parameter is omitted.

---

## Existing API: GET /api/users

### Purpose
Fetch paginated list of users with optional filtering

### Location
`src/app/api/users/GET.ts`

### Request

```typescript
GET /api/users?offset=0&limit=20&gender=male&relationship-status=single
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `offset` | number | No | Pagination offset (default: 0) |
| `limit` | number | No | Pagination limit (default: 4) |
| `gender` | string | No | Filter by gender (MALE, FEMALE, NONBINARY) |
| `relationship-status` | string | No | Filter by status (SINGLE, IN_A_RELATIONSHIP, ENGAGED, MARRIED) |
| `followers-of` | string | No | Filter by followers of user ID |
| `following-of` | string | No | Filter by following of user ID |

### Current Behavior

✅ Already supports optional gender parameter
- When `gender` parameter is **present**: Filters to that gender
- When `gender` parameter is **absent**: Returns all genders

**Code Reference** (line 27-35):
```typescript
const gender = toUpper(snakeCase(searchParams.get('gender') || undefined));

const res = await prisma.user.findMany({
  where: {
    ...(gender && { gender: gender as Gender }),  // ← Only filters if gender is truthy
    // ... other filters ...
  },
});
```

### Response (No Changes)

```json
[
  {
    "id": "user-123",
    "username": "alice",
    "name": "Alice",
    "profilePhoto": "https://...",
    "gender": "FEMALE",
    "relationshipStatus": "SINGLE"
  }
]
```

---

## Client-Side Contract: DiscoverFilters Component

### Purpose
Manage filter UI and URL state for the Discover page

### Current Behavior

**Before Clear Feature**:
```
User selects gender → onSelectionChange(key) → updateParams() → URL: ?gender=male
```

**After Clear Feature** (No behavior change):
```
User selects "(Any)" (null) → onSelectionChange(null) → updateParams(undefined) → URL: (no gender param)
User selects "Male"        → onSelectionChange('MALE') → updateParams('MALE')    → URL: ?gender=male
```

### Component Contract (TypeScript)

```typescript
// src/components/DiscoverFilters.tsx
export function DiscoverFilters(): React.ReactElement

// State: Read from URL
const filters = {
  gender?: string;                    // undefined = no filter (clear)
  relationshipStatus?: string;        // undefined = no filter (clear)
}

// Event: Selection change
const onSelectGender = (key: Key | null) => {
  // key = null  → Clear filter
  // key = 'MALE' → Filter by gender
}

// Effect: URL parameter update
const updateParams = ({key, value}) => {
  // value = undefined  → Delete URL parameter
  // value = 'MALE'     → Set URL parameter to 'male' (kebab-cased)
}
```

### No Contract Changes

✅ Same signatures, same behavior
✅ Null handling already implemented
✅ No new parameters to component
✅ No new return values

---

## Localization Contract

### New i18n Key Required

**Key**: `filter_any`  
**Type**: String  
**Usage**: Label for clear/unselected option in dropdowns  
**Languages**: All (en, es, etc.)

**Examples**:
```json
{
  "en.json": {
    "filter_any": "(Any)"
  },
  "es.json": {
    "filter_any": "(Cualquiera)"
  }
}
```

**No API changes** - This is frontend localization only

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Browser Address Bar: /discover?gender=male&status=single    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─ useSearchParams()
                         │  {"gender": "male", "status": "single"}
                         │
              ┌──────────┴──────────┐
              │                     │
    ┌─────────▼────────┐   ┌──────▼──────────┐
    │ DiscoverFilters  │   │ DiscoverProfiles│
    │ (Client-side)    │   │ (Client-side)   │
    │                  │   │                 │
    │ Gender Select    │   │ → React Query   │
    │ Status Select    │   │ → GET /api/users│
    │                  │   │  ?gender=male   │
    └──────────────────┘   └────────────────┘
              │                     ▲
              │                     │
         User clicks           Returns filtered
         "(Any)" option         user list
              │                     │
              ├─ updateParams()     │
              │  Delete gender param│
              │                     │
              ├─ router.push()      │
              │  ?status=single     │
              │                     │
              └────────────────────┬┘
                        │
         URL changed - component re-queries API
         (API gets no gender param → returns all genders)
```

---

## Testing Contract

### Unit Tests (DiscoverFilters Component)

```typescript
// Existing tests: Continue to work
✓ Selecting a gender option updates URL
✓ Selecting a status option updates URL

// New tests: Add these
✓ Selecting "(Any)" in gender dropdown clears gender filter
✓ Selecting "(Any)" in status dropdown clears status filter
✓ Clearing gender filter doesn't affect status filter
✓ URL has no gender param after clearing
✓ Component shows unselected state after clearing
```

### Integration Tests

```typescript
// If integration tests exist for Discover page
✓ Discover page loads with filters
✓ User can clear gender filter
✓ API returns all genders when filter is cleared
✓ Filter state persists across navigation
```

---

## Backward Compatibility

✅ **100% Compatible**

- Existing URLs with `?gender=male` continue to work
- URLs without gender parameter continue to work
- API behavior unchanged
- Adding "(Any)" option doesn't affect existing selections
- No database migrations
- No versioning needed

---

## API Rate Limiting

No impact on rate limiting:
- No new endpoints
- No increase in API calls
- Same query pattern as before
- Clearing filter → same API behavior as initial page load

---

## Summary

| Aspect | Status | Details |
|--------|--------|---------|
| New API endpoint | ✅ Not needed | Existing `/api/users` supports feature |
| Backend changes | ✅ None | No database changes |
| API signature | ✅ Unchanged | No new parameters |
| Backward compatibility | ✅ Guaranteed | Additive change only |
| Rate limiting | ✅ Unaffected | Same API patterns |
| Documentation | ✅ Not needed | Feature is discoverable in UI |

---

**Conclusion**: This feature requires zero API contract changes. The client-side filtering UI enhancement works with the existing backend API as-is.
