import { GET as NextAuthGET, POST as NextAuthPOST } from '@/auth';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return NextAuthGET(req);
}

export async function POST(req: NextRequest) {
  const response = await NextAuthPOST(req);

  // Fix redirect URL: replace localhost with request origin for mobile devices
  if (response instanceof Response) {
    const url = req.url;
    const host = req.headers.get('host');
    const redirectLocation = response.headers.get('location');
    const isSignout = url.includes('/api/auth/signout');

    if (isSignout && redirectLocation && host) {
      // Extract protocol from request (http or https)
      const protocol = url.startsWith('https') ? 'https' : 'http';
      const requestOrigin = `${protocol}://${host}`;

      // Replace localhost URLs with request origin
      if (redirectLocation.includes('localhost') || redirectLocation.includes('127.0.0.1')) {
        const fixedUrl = redirectLocation.replace(/https?:\/\/[^/]+/, requestOrigin);
        response.headers.set('location', fixedUrl);
      }
    }
  }

  return response;
}
