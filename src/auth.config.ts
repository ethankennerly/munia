import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Facebook from 'next-auth/providers/facebook';
import Google from 'next-auth/providers/google';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging';

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
    // eslint-disable-next-line no-param-reassign
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
      const isOnAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

      const unProtectedPages = ['/terms', '/privacy-policy']; // Add more here if needed
      const isOnUnprotectedPage =
        pathname === '/' || // The root page '/' is also an unprotected page
        unProtectedPages.some((page) => pathname.startsWith(page));
      const isProtectedPage = !isOnUnprotectedPage;

      if (isOnAuthPage) {
        // Redirect to /feed, if logged in and is on an auth page
        if (isLoggedIn) return NextResponse.redirect(new URL('/feed', nextUrl));
      } else if (isProtectedPage) {
        // Redirect to /login, if not logged in but is on a protected page
        if (!isLoggedIn) {
          const from = encodeURIComponent(pathname + search); // The /login page shall then use this `from` param as a `callbackUrl` upon successful sign in
          return NextResponse.redirect(new URL(`/login?from=${from}`, nextUrl));
        }
      }

      // Don't redirect if on an unprotected page, or if logged in and is on a protected page
      return true;
    },
  },
} satisfies NextAuthConfig;
