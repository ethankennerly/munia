# Click Debounce

## Steps to Reproduce
1. User clicks a button or link multiple times in quick succession (e.g., double-clicking a "Submit" button).

## Expected Result
The application should ignore subsequent clicks for a short period (e.g., 300ms) after the initial click, preventing multiple submissions or actions.

## Actual Result
Multiple clicks are registered, which can lead to unintended consequences such as duplicate form submissions or multiple navigations.

# Tech Spec

In professional environments (especially at scale like Airbnb or Stripe), they avoid fixing this button-by-button. Instead, they specify a Global Navigation & Action Guard to ensure the app feels "solid" and prevent accidental double-submissions that could corrupt data or double-charge a user.

Global Debounce: Any "Actionable" component (Buttons/Links) must ignore subsequent clicks for 300ms after the initial trigger.

The most elegant, "easy to integrate" way is to create a Global Event Interceptor in your layout.tsx.

See src/components/ui/ClickDebounce.tsx for an example implementation.