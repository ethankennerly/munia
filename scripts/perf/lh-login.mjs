/**
 * Logs in via Mock OAuth, saves the session cookie, then runs Lighthouse.
 */
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:3002';

// 1. Get CSRF token
const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
const { csrfToken } = await csrfRes.json();
const rawCookies = csrfRes.headers.getSetCookie?.() ?? [];
const cookieHeader = rawCookies.map(c => c.split(';')[0]).join('; ');
console.log('CSRF token:', csrfToken);
console.log('Cookies from CSRF:', cookieHeader);

// 2. POST credentials
const body = new URLSearchParams({
  csrfToken,
  name: 'Ethan Kennerly',
  email: 'ethankennerly@gmail.com',
  redirect: 'false',
  callbackUrl: `${BASE}/en/notifications`,
  json: 'true',
});

const loginRes = await fetch(`${BASE}/api/auth/callback/mock-oauth`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': cookieHeader,
  },
  body: body.toString(),
  redirect: 'manual',
});

console.log('Login status:', loginRes.status);
const loginCookies = loginRes.headers.getSetCookie?.() ?? [];
console.log('Login set-cookie headers:', loginCookies.map(c => c.split(';')[0]));

const allCookies = [
  ...rawCookies.map(c => c.split(';')[0]),
  ...loginCookies.map(c => c.split(';')[0]),
].join('; ');

console.log('\nFull cookie string:\n', allCookies);
writeFileSync('/tmp/lh-session-cookies.txt', allCookies);
console.log('\nSaved to /tmp/lh-session-cookies.txt');

// 3. Verify - try to fetch the protected page
const verifyRes = await fetch(`${BASE}/en/notifications`, {
  headers: { Cookie: allCookies },
  redirect: 'manual',
});
console.log('\nVerify notifications page status:', verifyRes.status, verifyRes.headers.get('location') ?? '');
