# Functional Spec: Display Loading Indicator While Awaiting Server Response in Next.js 16

## Steps to Reproduce
1. User clicked on "Edit Profile" link.
1. Server took a total of 10.2 seconds to load the edit profile page, with 10.1 seconds spent on compiling the page and 68 milliseconds on rendering.

Next.js 16 dev server log:
```
○ Compiling /[locale]/[username]/edit-profile ...
 GET /api/auth/session 200 in 6.6s (compile: 6.5s, render: 81ms)
 GET /api/auth/session 200 in 65ms (compile: 16ms, render: 49ms)
 GET /api/auth/session 200 in 67ms (compile: 15ms, render: 52ms)
 GET /api/auth/session 200 in 62ms (compile: 4ms, render: 58ms)
 GET /en/ethankennerly/edit-profile 200 in 10.2s (compile: 10.1s, proxy.ts: 79ms, render: 68ms)
```

## Expected Result

Loading indicator appears on the button or on the screen.

Instant feedback on the button itself, such as changing the button text to "Loading page..." and disabling the button to prevent multiple clicks.

## Actual Result

No loading indicator is displayed, and the user sees a blank screen until the server responds.

# Tech Spec

## Link Status on the Button
In Next.js 15.3+, the standard way to detect navigation status specifically for a link is the useLinkStatus hook. 
To reuse code across your ButtonLink, you must structure it so that the styling component is a descendant of the Link. 
Standard Implementation for ButtonLink
You cannot use useLinkStatus in the same component that renders the <Link>. It must be used in a child component. 

### Important Requirements for useLinkStatus
- Disable Prefetching: For the pending state to be reliable, you must set prefetch={false} on the Link. If a route is prefetched, Next.js may skip the pending state because the data is already available.
- App Router Only: This hook is not supported in the Pages Router and will always return false there.
- Nesting: The hook only tracks the status of its nearest parent <Link>. 