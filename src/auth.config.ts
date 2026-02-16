import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Facebook from 'next-auth/providers/facebook';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging';
import { routing } from '@/i18n/routing';
import prisma from '@/lib/prisma/prisma';

// Build providers array conditionally
const providers: NextAuthConfig['providers'] = [
  GitHub({ allowDangerousEmailAccountLinking: true, checks: ['state', 'pkce'] }),
  Google({
    allowDangerousEmailAccountLinking: true,
    checks: ['state', 'pkce'],
    authorization: { params: { scope: 'openid profile email' } },
  }),
  // In 2016, Facebook allowed a bad actor to impersonate an email address.
  // https://www.bitdefender.com/en-us/blog/labs/attackers-pose-as-account-owners-via-facebook-login-flaw
  // Also, Facebook does not check PKCE/state in the same way.
  // Configure to request large profile pictures (picture.type(large)) instead of default 50x50
  Facebook({
    userinfo: {
      url: 'https://graph.facebook.com/me',
      async request(context: { tokens: { access_token: string } }) {
        // Request explicitly with large picture type
        const res = await fetch('https://graph.facebook.com/me?fields=id,name,email,picture.type(large)', {
          headers: { Authorization: `Bearer ${context.tokens.access_token}` },
        });
        return res.json();
      },
    },
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.picture?.data?.url,
      };
    },
  }),
];

// Add mock OAuth provider only if environment variables are defined (localhost testing)
if (process.env.AUTH_MOCK_EMAIL) {
  providers.push(
    Credentials({
      id: 'mock-oauth',
      name: 'Mock OAuth',
      credentials: {
        name: { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'text' },
      },
      async authorize(credentials) {
        // "Standard login flow" simulation: return user object if credentials exist
        if (credentials?.email && credentials?.name) {
          const email = (credentials.email as string).toLowerCase().trim();
          const name = (credentials.name as string).trim();

          // Credentials providers bypass PrismaAdapter, so events.createUser
          // never fires. handleMockOAuthUser handles user creation and
          // profile picture import directly.
          const { handleMockOAuthUser } = await import('@/lib/auth/handleMockOAuthUser');
          return await handleMockOAuthUser({ email, name });
        }
        // "Standard refusal" simulation
        return null;
      },
    }),
  );
}

export default {
  providers,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Populate user ID in token for middleware access
      if (user) {
        token.sub = (user as { id?: string })?.id ?? token.sub;

        token.email = (user as { email?: string })?.email ?? token.email;
      }
      return token;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const { pathname, search } = nextUrl;
      const isLoggedIn = !!auth?.user;
      // Log request path and auth state (non-PII)
      const safeUser = auth?.user as unknown as { id?: string } | undefined;
      logger.debug({ msg: 'api_request', path: pathname });
      logger.debug({ msg: 'auth_state', isAuthenticated: isLoggedIn, userId: safeUser?.id ?? null });

      // Skip authorization checks for NextAuth API routes (OAuth callbacks, signin, etc.)
      if (pathname.startsWith('/api/auth/')) {
        return true;
      }

      // Extract locale from pathname if present (e.g., /en/login -> 'en')
      // Otherwise use default locale
      const pathSegments = pathname.split('/').filter(Boolean);
      const firstSegment = pathSegments[0];
      const locale = routing.locales.includes(firstSegment as (typeof routing.locales)[number])
        ? firstSegment
        : routing.defaultLocale;

      // Normalize pathname by removing locale prefix if present
      const normalizedPathname = routing.locales.includes(firstSegment as (typeof routing.locales)[number])
        ? `/${pathSegments.slice(1).join('/')}`
        : pathname;

      const isOnAuthPage = normalizedPathname.startsWith('/login') || normalizedPathname.startsWith('/register');

      const unProtectedPages = ['/terms', '/privacy-policy']; // Add more here if needed
      const isOnUnprotectedPage =
        normalizedPathname === '/' || // The root page '/' is also an unprotected page
        unProtectedPages.some((page) => normalizedPathname.startsWith(page));
      const isProtectedPage = !isOnUnprotectedPage;

      // Helper function to check if user needs setup and redirect if needed
      const checkAndRedirectIfSetupNeeded = async (userId: string | undefined): Promise<NextResponse | null> => {
        if (userId) {
          // Check if user needs setup (missing username or name)
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true, name: true },
          });

          if (dbUser && (!dbUser.username || !dbUser.name)) {
            // User needs setup, redirect to /[locale]/setup
            const setupPath = `/${locale}/setup`;
            return NextResponse.redirect(new URL(setupPath, nextUrl.origin));
          }
        }
        return null;
      };

      if (isOnAuthPage) {
        // Redirect to /[locale]/feed or /[locale]/setup, if logged in and is on an auth page
        if (isLoggedIn) {
          const setupRedirect = await checkAndRedirectIfSetupNeeded(safeUser?.id);
          if (setupRedirect) return setupRedirect;

          // User has complete profile, redirect to /[locale]/feed
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

        // If logged in and accessing /feed, check if setup is needed
        if (isLoggedIn && normalizedPathname === '/feed') {
          const setupRedirect = await checkAndRedirectIfSetupNeeded(safeUser?.id);
          if (setupRedirect) return setupRedirect;
        }
      }

      // Don't redirect if on an unprotected page, or if logged in and is on a protected page
      return true;
    },
  },
} satisfies NextAuthConfig;
