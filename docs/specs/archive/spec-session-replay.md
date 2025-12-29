# Session Replay - Architecture & Vision

## Overview
Client-side-only forward replay system recording component-based commands and replaying them using existing React components. Commands stored in database with compact encoding.

## Architecture

**Command Pattern** with two layers:
1. **Command Buffer**: Records/uploads (recording) or loads (replay), handles encode/decode
2. **Command Player**: Single execution engine for live client (immediate) and replay (timed)

**Flow**:
- Recording: `User Command → Recording Hook → Encode → Upload → Database`
- Replay: `Load from DB → Decode → Parse → Execute (router.push/activate)`

## Data Model

### Command Types (Encoded)
- `r` (route): Navigation
- `a` (activate): User activated element (click/tap/Enter/Space)
- `sc` (scroll): Scroll position
- `e` (error): Error occurred

### Encoding

**Key Mapping**: `type`→`t`, `data`→`d`, `path`→`p`, `selector`→`s`, `timestamp`→`ts`, `scrollY`→`sy`, `scrollX`→`sx`

**Activation IDs (NOT DOM Selectors)**:
- **DO NOT** log DOM addresses or selectors (e.g., `button:contains("Post")`, `[data-testid="..."]`, `a[href="..."]`)
- **DO** log brief activation IDs (<16 chars, base64-safe, globally unique)
- Elements must have `data-activate-id` attribute assigned
- Example ID: `edit-profile` (not a DOM selector)
- If element lacks `data-activate-id`, skip recording (do not fall back to DOM selector)

**Assigning Activation IDs**:
- Add `data-activate-id="brief-id"` to interactive elements (buttons, links, etc.)
- Use kebab-case (lowercase with hyphens): `edit-profile`, `like-button`, `submit-post`
- Must be globally unique across the application
- Only log activations when `data-activate-id` is present

**Example Encoded**:
```json
{"t": "r", "ts": 1234567890, "d": {"p": "/feed"}}
{"t": "a", "ts": 1234567890, "d": {"s": "edit-profile"}}
{"t": "sc", "ts": 1234567890, "d": {"sy": 0.25, "sx": 0}}
```

**Invalid (DO NOT log)**:
```json
{"t": "a", "ts": 1234567890, "d": {"s": "button:contains(\"Post\")"}}
{"t": "a", "ts": 1234567890, "d": {"s": "edit-profile", "target": "button"}}
```

**Activation Command Payload**:
- **ONLY** log `selector` (activation ID) in the data payload
- **DO NOT** log `target`, `href`, or any other fields
- Activation ID is sufficient to find and activate the element during replay

**Activation ID Resolution**:
- Use `event.composedPath()` to traverse the complete event path from target to root
- Find the first interactive element (button/link) in the path that has `data-activate-id`
- Handles child element clicks (icons, SVG, text nodes) by checking the event path
- Stop at the first interactive element found - do not continue searching
- If interactive element has no `data-activate-id`, skip recording (do not use a different element's ID)
- **Critical**: Must reliably capture all button/link clicks, including those on child elements

**Storage**: ~35 bytes/command (encoded), ~1-3 KB/session (50 commands, gzipped). 50-60% smaller than unencoded.

## Exclusions (MVP)
- Admin routes (`/admin/*`)
- Sensitive inputs (passwords, emails)
- External API responses
- Anonymous/pre-login sessions

## Testing

**Setup**: 
- `NEXT_PUBLIC_REPLAY_ENABLED=true` in `.env.local` (required for all recording)
- `NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED=0.1` in `.env.local` (required for scroll recording, e.g., 0.1 = 10% threshold)

**Quick Test**:
1. Log in, navigate pages, activate buttons, scroll significantly
2. Visit `/admin/sessions/[id]` (admin only)
3. Click **Play** → verify routes navigate, activations execute, and scroll positions match

**Expected**: Play button, progress bar, route changes, automatic activations, scroll replay, pause/resume/stop controls.

**Scroll Recording**:
- Only records when `NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED` is set
- Records normalized scroll position (0-1 ratio) when scroll changes >= threshold
- If scroll threshold not configured, scroll recording is disabled (zero overhead)
