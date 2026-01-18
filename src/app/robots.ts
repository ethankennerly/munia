// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/auth/',
        '/api/',
        '/about/',
        '/edit-profile/',
        '/followers/',
        '/following/',
        '/settings/',
        '/photos/',
        '/posts/',
        '/*/admin/',
        '/*/api/auth/',
        '/*/api/',
        '/*/about/',
        '/*/edit-profile/',
        '/*/followers/',
        '/*/following/',
        '/*/settings/',
        '/*/photos/',
        '/*/posts/',
      ],
    },
    sitemap: `${process.env.NEXTAUTH_URL}/sitemap.xml`,
    host: process.env.NEXTAUTH_URL,
  };
}
