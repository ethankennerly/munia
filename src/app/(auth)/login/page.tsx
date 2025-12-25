import Link from 'next/link';
import { UserAuthForm } from '../UserAuthForm';

export const metadata = {
  title: 'Munia | Login',
};

export default function Page() {
  const emailEnabled = Boolean(process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY);
  const facebookEnabled = Boolean(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET);
  const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  return (
    <>
      <h1 className="mb-5 text-5xl font-bold">Login</h1>
      <UserAuthForm
        emailEnabled={emailEnabled}
        facebookEnabled={facebookEnabled}
        githubEnabled={githubEnabled}
        googleEnabled={googleEnabled}
      />
      <p className="text-lg text-muted-foreground">No account yet?</p>
      <p className="cursor-pointer text-lg font-semibold text-primary-accent hover:opacity-90">
        <Link href="/register" prefetch data-activate-id="register-link">
          Create an account
        </Link>
      </p>
    </>
  );
}
