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

**Selector IDs**: Use brief IDs (<16 chars, base64-safe, globally unique) instead of DOM addresses. Example: `edit_profile`

**Example Encoded**:
```json
{"t": "r", "ts": 1234567890, "d": {"p": "/feed"}}
{"t": "a", "ts": 1234567890, "d": {"s": "like-button"}}
{"t": "sc", "ts": 1234567890, "d": {"sy": 0.25, "sx": 0}}
```

**Storage**: ~35 bytes/command (encoded), ~1-3 KB/session (50 commands, gzipped). 50-60% smaller than unencoded.

## Exclusions (MVP)
- Admin routes (`/admin/*`)
- Sensitive inputs (passwords, emails)
- External API responses
- Anonymous/pre-login sessions

## Testing

**Setup**: `NEXT_PUBLIC_REPLAY_ENABLED=true` in `.env.local`

**Quick Test**:
1. Log in, navigate pages, activate buttons
2. Visit `/admin/sessions/[id]` (admin only)
3. Click **Play** → verify routes navigate and activations execute

**Expected**: Play button, progress bar, route changes, automatic activations, pause/resume/stop controls.
