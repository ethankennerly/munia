import { MockOAuthFormPage } from '../MockOAuthFormPage';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Mock OAuth Provider',
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; name?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  return <MockOAuthFormPage defaultEmail={params.email} defaultName={params.name} callbackUrl={params.callbackUrl} />;
}
