import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from '@auth/core/adapters';
import prisma from '@/lib/prisma/prisma';
import { createSendEmailCommand } from '@/lib/ses/createSendEmailCommand';
import { sesClient } from '@/lib/ses/sesClient';

declare module 'next-auth' {
  interface Session {
    user: { id: string; name: string };
  }
}

// We are splitting the auth configuration into multiple files (`auth.config.ts` and `auth.ts`),
// as some adapters (Prisma) and Node APIs (`stream` module required for sending emails) are
// not supported in the Edge runtime. More info here: https://authjs.dev/guides/upgrade-to-v5
export const {
  auth,
  handlers: { GET, POST },
  signIn,
} = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    {
      // There's currently an issue with NextAuth that requires all these properties to be specified
      // even if we really only need the `sendVerificationRequest`: https://github.com/nextauthjs/next-auth/issues/8125
      id: 'email',
      type: 'email',
      name: 'Email',
      from: process.env.SES_FROM_EMAIL ?? 'nobody@no.where',
      server: {},
      maxAge: 24 * 60 * 60,
      options: {},
      async sendVerificationRequest({ identifier: email, url }) {
        const sendEmailCommand = createSendEmailCommand(
          email,
          process.env.SES_FROM_EMAIL ?? 'nobody@no.where',
          'Login To Munia',
          `<body>
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style=" max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif;">
        Login to <strong>Munia</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="purple"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: black; text-decoration: none; border-radius: 5px; padding: 10px 20px; display: inline-block; font-weight: bold;">Login</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif;">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>`,
        );
        await sesClient.send(sendEmailCommand);
      },
    },
  ],
  // Type cast to unify potential duplicate @auth/core versions between root and adapter package
  adapter: PrismaAdapter(prisma) as unknown as Adapter,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // Store reference to authConfig JWT callback before spreading
    // eslint-disable-next-line no-param-reassign
    async jwt({ token, user, ...rest }) {
      // Call the JWT callback from authConfig first if it exists
      const authConfigJwt = authConfig.callbacks?.jwt;
      if (authConfigJwt) {
        // eslint-disable-next-line no-param-reassign
        token = await authConfigJwt({ token, user, ...rest });
      }
      // Ensure user ID is in token (for both adapter and non-adapter flows)
      if (user) {
        const userId = (user as { id?: string })?.id;
        if (userId) {
          // eslint-disable-next-line no-param-reassign
          token.sub = userId;
        }
        const userEmail = (user as { email?: string })?.email;
        if (userEmail) {
          // eslint-disable-next-line no-param-reassign
          token.email = userEmail;
        }
      }
      return token;
    },
    // Spread other callbacks from authConfig (excluding jwt which we've already defined)
    ...(authConfig.callbacks
      ? Object.fromEntries(Object.entries(authConfig.callbacks).filter(([key]) => key !== 'jwt'))
      : {}),
    async session({ token, user, ...rest }) {
      const emailFromToken = ((): string | undefined => {
        const t = token as unknown as { email?: unknown };
        return typeof t?.email === 'string' ? (t.email as string) : undefined;
      })();
      const emailFromUser = ((): string | undefined => {
        const u = user as unknown as { email?: unknown };
        return typeof u?.email === 'string' ? (u.email as string) : undefined;
      })();
      // Ensure we have a user ID from token.sub or user.id
      const userId = token.sub || (user as { id?: string })?.id;
      if (!userId) {
        throw new Error('User ID not found in token or user object');
      }
      return {
        /**
         * Expose only stable identifiers and IdP-derived email for server auth checks.
         * Do not trust user-editable profile fields for authorization.
         */
        user: {
          id: userId,
          // Prefer provider/JWT email (stable), fallback to adapter user email
          email: emailFromToken ?? emailFromUser,
        },
        expires: rest.session.expires,
      };
    },
  },
});
