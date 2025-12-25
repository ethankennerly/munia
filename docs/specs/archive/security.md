# Security Update Guidance

Munia uses Next.js with the App Router and React Server Components (RSC). Vercel disclosed additional RSC vulnerabilities:

- CVE-2025-55184 (High) – Denial of Service via malicious RSC request
- CVE-2025-55183 (Medium) – Compiled Server Action source disclosure

Action required: upgrade to patched framework versions.

## How we remediate

We keep Munia on the current major versions and pull the latest patched releases during installation using npm `overrides`:

```
"overrides": {
  "next": "^14",
  "react": "^18.3",
  "react-dom": "^18.3",
  "eslint-config-next": "^14"
}
```

This ensures `npm install` selects the latest patched versions within the safe major range and mitigates the vulnerabilities without changing app code.

## Verification checklist

1. Reinstall deps to pick up patches:
   - Clean, reproducible install (keep lockfile): `rm -rf node_modules && npm ci`
   - Regenerate lockfile (do NOT use ci here): `rm -rf node_modules package-lock.json && npm install`
2. Run local checks:
   - `npm test`
   - `npm run lint && npm run build`
3. Deploy to staging and sanity check routes that use Server Actions / RSC.
4. Monitor for errors and CPU spikes.

## Notes

- Avoid hardcoding secrets inside Server Actions. These vulnerabilities do not expose env vars, but good hygiene prevents accidental disclosure.
- If a breaking regression is encountered, temporarily revert to the previous lockfile and report the issue, but prefer staying on patched releases.
