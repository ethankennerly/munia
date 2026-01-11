import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Facebook from 'next-auth/providers/facebook';
import Google from 'next-auth/providers/google';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging';
import { routing } from '@/i18n/routing';

export default {
  providers: [
    GitHub({ allowDangerousEmailAccountLinking: true, checks: ['state', 'pkce'] }),
    Google({
      allowDangerousEmailAccountLinking: true,
      checks: ['state', 'pkce'],
      authorization: { params: { scope: 'openid profile email' } },
    }),
    // In 2016, Facebook allowed a bad actor to impersonate an email address.
    // https://www.bitdefender.com/en-us/blog/labs/attackers-pose-as-account-owners-via-facebook-login-flaw
    // Also, Facebook does not check PKCE/state in the same way.
    Facebook,
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Populate user ID in token for middleware access
      if (user) {
        // eslint-disable-next-line no-param-reassign
        token.sub = (user as { id?: string })?.id ?? token.sub;
        // eslint-disable-next-line no-param-reassign
        token.email = (user as { email?: string })?.email ?? token.email;
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const { pathname, search } = nextUrl;
      const isLoggedIn = !!auth?.user;
      // Log request path and auth state (non-PII)
      const safeUser = auth?.user as unknown as { id?: string } | undefined;
      logger.debug({ msg: 'api_request', path: pathname });
      logger.debug({ msg: 'auth_state', isAuthenticated: isLoggedIn, userId: safeUser?.id ?? null });
      
      // Extract locale from pathname if present (e.g., /en/login -> 'en')
      // Otherwise use default locale
      const pathSegments = pathname.split('/').filter(Boolean);
      const firstSegment = pathSegments[0];
      const locale = routing.locales.includes(firstSegment as (typeof routing.locales)[number])
        ? firstSegment
        : routing.defaultLocale;
      
      // Normalize pathname by removing locale prefix if present
      const normalizedPathname = routing.locales.includes(firstSegment as (typeof routing.locales)[number])
        ? '/' + pathSegments.slice(1).join('/')
        : pathname;
      
      const isOnAuthPage = normalizedPathname.startsWith('/login') || normalizedPathname.startsWith('/register');

      const unProtectedPages = ['/terms', '/privacy-policy']; // Add more here if needed
      const isOnUnprotectedPage =
        normalizedPathname === '/' || // The root page '/' is also an unprotected page
        unProtectedPages.some((page) => normalizedPathname.startsWith(page));
      const isProtectedPage = !isOnUnprotectedPage;

      if (isOnAuthPage) {
        // Redirect to /[locale]/feed, if logged in and is on an auth page
        if (isLoggedIn) {
          const feedPath = `/${locale}/feed`;
          return NextResponse.redirect(new URL(feedPath, nextUrl));
        }
      } else if (isProtectedPage) {
        // Redirect to /[locale]/login, if not logged in but is on a protected page
        if (!isLoggedIn) {
          // Construct full path with locale for the 'from' parameter
          const fullPath = routing.locales.includes(firstSegment as (typeof routing.locales)[number])
            ? pathname // Already includes locale
            : `/${locale}${normalizedPathname}`; // Add locale prefix
          const from = encodeURIComponent(fullPath + search); // The /login page shall then use this `from` param as a `callbackUrl` upon successful sign in
          const loginPath = `/${locale}/login?from=${from}`;
          return NextResponse.redirect(new URL(loginPath, nextUrl));
        }
      }

      // Don't redirect if on an unprotected page, or if logged in and is on a protected page
      return true;
    },
  },
} satisfies NextAuthConfig;
