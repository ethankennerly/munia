# Tech Spec: Importing Google Profile Picture

Google authorized profile picture is automatically imported into Munia's storage.

## Acceptance Criteria
- [ ] This process only occurs during initial Google OAuth for creating a new account ("Sign Up").
- [ ] User has authorized Google Profile Picture access with `userinfo.profile`.
- [ ] User has authenticated through Google OAuth.
- [ ] Google session includes profile picture URL. If not present, skip import.
- [ ] Profile picture URL is extracted from Google session.
- [ ] Profile picture URL is validated for accessibility.
- [ ] Profile picture is downloaded from Google URL.
- [ ] Permissively allow Google profile picture domains.
- [ ] Validate downloaded image format and size.
- [ ] Processed profile picture is stored in Munia's Amazon S3 storage.
- [ ] User's profile in Munia is updated with the new profile picture URL.
- [ ] Errors during the process are logged on the server as a warning for monitoring.
- [ ] If profile picture import fails, the process continues without notifying the user.
- [ ] Reuse existing code for uploading and linking a profile picture to a user account.
- [ ] Do not create New Profile Photo post. 