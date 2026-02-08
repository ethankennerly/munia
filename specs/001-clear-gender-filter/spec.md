# Feature Specification: Clear Option for All Dropdowns Across All Pages

**Feature Branch**: `001-clear-gender-filter`  
**Created**: February 8, 2026  
**Updated**: February 8, 2026  
**Status**: Draft  
**Input**: User description: "Clear for every dropdown for every page. Consistently implement without code duplication. Simplify testing."

## Clarifications *(Session February 8, 2026)*

- Q: Scope & implementation approach → A: Implement app-wide through modifying the base Select component itself to support clear as a built-in feature
- Q: Which Selects get clear feature → A: Make all Select components clearable by default (no explicit opt-in required)
- Q: Clear label text consistency → A: Use consistent label "(Any)" everywhere (already translated)
- Q: Testing strategy → A: Test clear behavior comprehensively in Select component level, verify integration in key consumers (DiscoverFilters, EditProfileForm)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clear Selection Across All Dropdowns (Priority: P1)

Users across the entire application need a consistent way to clear their selections in any dropdown (gender, relationship status, profile fields, etc.), so they can reset filters and form fields without page reload or external tools.

**Why this priority**: Core functionality—users expect consistent clear/reset behavior across all selection controls. Applies to Discover filters, profile editing forms, and any other dropdown-based interface.

**Independent Test**: Can be fully tested by: (1) navigating to any page with Select dropdowns, (2) selecting a value, (3) selecting the clear option "(Any)", (4) verifying the selection is cleared and URL/form state is reset.

**Acceptance Scenarios**:

1. **Given** any Select component has a value selected (e.g., gender "Male", status "Single", or profile field), **When** user selects the "(Any)" option, **Then** the selection should be cleared and the value removed from URL params or form state
2. **Given** a dropdown with an active selection, **When** user selects the clear option, **Then** the dropdown should return to unselected state and the label should display
3. **Given** the user clears a selection, **When** the page refreshes, **Then** the cleared state should persist (no parameter in URL, form field empty)
4. **Given** multiple filters or fields are active, **When** user clears one selection, **Then** other selections MUST remain intact (isolation guarantee)

---

### User Story 2 - Intuitive Clear UI Affordance (Priority: P2)

Users need clear visual indication that they can clear selections in dropdowns, with a consistent, discoverable UI pattern across all pages and forms.

**Why this priority**: Consistency and discoverability ensure users understand they can clear without documentation and learn the pattern once.

**Independent Test**: Can be tested by examining all Select components for visual affordances (first option labeled "(Any)") that clearly indicate clear capability. Verify label consistency across all pages.

**Acceptance Scenarios**:

1. **Given** any Select dropdown is open, **When** user examines the options, **Then** the first option MUST be labeled "(Any)" in English (or localized equivalent)
2. **Given** the user hovers/focuses on the "(Any)" option, **When** selected, **Then** the selection is cleared with feedback (UI updates, URL updates if applicable)
3. **Given** form fields or filter dropdowns on different pages, **When** user compares them, **Then** all MUST use the same clear option pattern and label for consistency

---

### Edge Cases

- Clearing a selection that is already not applied: The "(Any)" option is selected by default, so repeatedly selecting it has no effect (idempotent)
- Clearing one filter while others are active: Only the cleared filter is affected; other active filters remain intact
- Rapid clearing: Component handles multiple selections efficiently (no duplicate updates or race conditions)
- Empty selection state across pages/forms: All pages render the clear option consistently, even if no value was previously selected

## Requirements *(mandatory)*

### Functional Requirements

**Core Clear Mechanism (App-Wide)**:
- **FR-001**: The base `Select` component MUST render a clear option as the first item in every dropdown
- **FR-002**: The clear option MUST be labeled "(Any)" consistently across all Select instances (English) and localized equivalently in other languages
- **FR-003**: Selecting the clear option MUST set the selected value to `undefined`, removing it from URL parameters or form state
- **FR-004**: The clear option MUST be rendered by default for all Select components (no opt-in required)
- **FR-005**: Clearing one selection MUST NOT affect other active selections or filters (isolation guarantee)
- **FR-006**: System MUST support clearing via keyboard (Enter/Space on focused option) and mouse (click)
- **FR-007**: The clear option Item key MUST use empty string `""` to prevent null stringification; the resulting value passed to handler MUST be `undefined` (not empty string), achieved via condition check `key && key !== ''`
- **FR-008**: Clearing the same selection multiple times MUST be idempotent (no duplicate updates)

**UI/UX Consistency**:
- **FR-009**: The "(Any)" option MUST appear in the same position (first) and with the same styling across all Select components
- **FR-010**: All pages and forms using Select MUST render the clear option consistently
- **FR-011**: The clear option MUST be included in all Select instances: DiscoverFilters (gender, relationship status), EditProfileForm (gender, relationship status), and any other future Select usage

**URL & Form State Management**:
- **FR-012**: When clearing a URL-based filter (Discover page), the corresponding query parameter MUST be removed entirely, not set to a null/empty value
- **FR-013**: When clearing a form field (EditProfileForm), the field value MUST be set to `undefined` or empty, not to "null" string
- **FR-014**: Clearing a filter/field MUST update the UI immediately without page reload

**Localization**:
- **FR-015**: The clear option label MUST be localized using the `filter_any` translation key (English: "(Any)", Spanish: "(Cualquiera)", etc.)
- **FR-016**: Translation keys MUST be consistent and reused across all pages and components

### Architectural Requirements

- **AR-001**: The clear mechanism MUST be implemented at the base `Select` component level to avoid code duplication
- **AR-002**: All components using Select (DiscoverFilters, EditProfileForm, etc.) MUST automatically inherit the clear option without additional implementation
- **AR-003**: The implementation MUST not require changes to parent components' selection handlers beyond using empty string key checks

### Key Entities *(include if feature involves data)*

- **Select Component**: The base UI component that displays and manages value selection for all dropdowns across the app
- **DiscoverFilters Component**: Uses Select for gender and relationship status filters; clears should update URL parameters
- **EditProfileForm Component**: Uses Select for profile fields (gender, relationship status); clears should update form state
- **Filter State**: Stored in URL search parameters (Discover) or component state (forms)
- **Clear Option**: First item in every dropdown, labeled "(Any)", with Item key `""` (empty string) that triggers selection handler to return `undefined` value

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can clear any selection within 2 clicks or keyboard interactions across all pages (Discover, Profile Edit, etc.)
- **SC-002**: Selection clearing action completes without page reload or noticeable delay (<100ms)
- **SC-003**: 100% of Select components in the app render the clear option by default with no additional configuration
- **SC-004**: Clearing a selection updates UI and URL/form state consistently on first attempt; no retry needed
- **SC-005**: The feature does not cause any performance regression; Select rendering remains within acceptable performance bounds
- **SC-006**: All dropdowns across the application (DiscoverFilters, EditProfileForm, and any other pages with Select) display the same clear option pattern
- **SC-007**: Clearing a filter/field on one page does not affect selections on other pages (verified through integration tests)

### Test Coverage Requirements

- **TC-001**: Select component MUST have comprehensive tests covering: clear option rendering, empty string key handling, selection clearing, localization
- **TC-002**: Select component tests MUST verify that selecting the clear option results in `undefined` value, not null or "null" string
- **TC-003**: DiscoverFilters and EditProfileForm MUST have integration tests verifying clear option works correctly with their specific use cases
- **TC-004**: All tests MUST pass before feature completion (target: <1s for feature tests, <10s for full suite)
