# Tech Spec: Localization

Localize end-user text visible to users at runtime.

## Scope
- [x] Do not modify third-party library code.
- [x] No CSS, code, or metadata extracted.
- [x] Duplicate text merged correctly.
- [x] Text must be visible to end-users in the running app.

## Add Translations
- [x] Install VSCode `i18n-ally` extension.
- [x] Keys: 5-40 chars, `snake_case` (lowercase ASCII letters and underscores only, no numbers), hierarchical (e.g., `auth_login_button_submit`).
- [x] Standard localization path `src/i18n/en.json` for English.
- [x] VSCode `i18n-ally` automates translation.

## Deployment Loads Translations
- [x] Lookup localization path `src/i18n/en.json` for English.
- [x] Terms and Privacy Policy and other long paragraphs are loaded from MD files.

## Runtime Usage
- [x] Standard `next-i18n` setup with `useTranslation` hook on client.
- [x] Standard `next-i18n/server` setup with `getTranslations` hook on server.
- [x] Simple API: Example: `t('key')`.
- [x] Variable Text API: Example: `t('key', { varName: value })`.
- [x] Rich Text API requires static constant. `t.rich`.

## Testing
- [x] Test all end-user facing pages in Spanish. Prefix path `/es`.

## Localize Success Toast
- [x] Post. Success toast.
- [x] Comment. Success toast.
- [x] Reply. Success toast.
- [x] Edit. Success toast.