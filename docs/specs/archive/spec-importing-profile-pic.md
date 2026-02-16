# Tech Spec: Importing Google Profile Picture

Automatically import authorized profile picture into Munia's storage.

## Scope
Implement all of the following providers:
- [x] Google
- [x] Github
- [x] Facebook
- [x] Mock OAuth

## Acceptance Criteria
- [x] This process only occurs during initial OAuth for creating a new account ("Sign Up").
- [x] User has authorized Profile Picture access with `userinfo.profile`.
- [x] User has authenticated through OAuth.
- [x] Session includes profile picture URL. If not present, skip import.
- [x] Profile picture URL is extracted from session.
- [x] Profile picture URL is validated for accessibility.
- [x] Profile picture is downloaded from URL.
- [x] Permissively allow profile picture domains.
- [x] Validate downloaded image format and size.
- [x] Processed profile picture is stored in Munia's Amazon S3 storage.
- [x] User's profile in Munia is updated with the new profile picture URL.
- [x] Errors during the process are logged on the server as a warning for monitoring.
- [x] If profile picture import fails, the process continues without notifying the user.
- [x] Reuse existing code for uploading and linking a profile picture to a user account.
- [x] Do not create New Profile Photo post. 

### Normalize Provider Profile Pictures
To minimize custom code when integrating GitHub, Facebook, and Mock OAuth profile photos, the "pro technique" is to leverage Auth.js (NextAuth.js)'s built-in normalization logic. You don't need a separate library because the built-in OAuth providers already map different API response fields (like avatar_url for GitHub and picture.data.url for Facebook) to a standard user.image property automatically. 

Auth.js handles the mess of varying response structures so you don't have to write custom mapping logic. Simply add the providers to your auth.ts (or `[...nextauth].js`).

### Configure Remote Patterns
You must allow the specific image hostnames in next.config.js to use the next/image component for all three providers.
- [x] Google: *.googleusercontent.com
- [x] GitHub: avatars.githubusercontent.com
- [x] Facebook: platform-lookaside.fbsbx.com
- [x] Mock: i.pravatar.cc

Example:
```
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google Profile Photos (Recommended wildcard pattern)
      { protocol: 'https', hostname: '*.googleusercontent.com' }, 
      
      // GitHub Avatars
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }, 
      
      // Facebook Profile Photos
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' }, 
      
      // Common Mock/Placeholder Sites
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'robohash.org' },
    ],
  },
};

export default nextConfig;
```

### Specifying Facebook Image Size
- [x] Actual Result should not happen: Default Facebook profile picture size is 50x50, which is blurry.
- [x] Here is the exact path and query you need to request the large version: ```/me?fields=id,name,email,picture.type(large)```
- [x] The Path: `/me` targets the current authenticated user.
- [x] The Query: `?fields=` tells Facebook exactly which data points to return.
- [x] The Spec: `picture.type(large)` is the specific modifier that forces Facebook to swap the 50x50px thumbnail for the ~300px+ version.



### Mock OAuth Image Fetching
Keep it simple. Just call the public API. The API will return the image.
- [x] To generate same image each time:
- [x] Format `https://i.pravatar.cc/{size}?u={username}`
- [x] Example: [https://i.pravatar.cc/200?u=ethankennerly](https://i.pravatar.cc/200?u=ethankennerly)

### Reuse a Single UI Component
- [x] Since Auth.js normalizes all these into session.user.image, use one reusable component for every provider.

### Avoiding Custom Database Logic
If you are using a Database Adapter, Auth.js will automatically save the normalized image URL to your User table upon the first sign-in. This removes the need for manual "import" scripts; the import happens naturally the first time the user logs in via that service. 