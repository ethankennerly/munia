# Session Replay

Replay a session of a user's interaction with the web application. This aids debugging and discovering real user experiences.

## Requirements
- Use industry standards for replaying a session.
- The web server will record a session.
- The web client will replay a session.
- Use industry standard tools for recording and replaying sessions.
- Minimize the edits to code required to record and replay.
- The social feed is shared by users. This is a tricky issue for session replay. Keep the replay simple.
- For production, do not record PII. Replace PII with equivalent data.
- An ideal session replay would show the actions with the same time passage as the original session.
- A session replay may replay at speeds of 1x, 2x, 4x, 8x, 16x.
- Keep the code simple. Sacrifice perfection for simplicity.
- Keep the scope small. Sacrifice perfection for scope.
- The ideal use case of session replay is for debugging and discovering use cases that a user is experiencing.
- An ideal record and replay would not require the user to manually report on what happened during their session.
- An ideal implementation would reuse existing services or libraries.
- An admin page has a button to replay a session of a user.
- The server data defines which users have admin role.
- Data recording is minimal.
- All users are recording minimal data to replay.