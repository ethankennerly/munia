# Testing: Session Replay - Command Architecture

**Feature**: Command Pattern implementation for session replay  
**Verification Time**: ~3 minutes  
**Status**: ✅ Complete

## Quick Start (90 seconds)

1. Set `NEXT_PUBLIC_REPLAY_ENABLED=true` in `.env.local`
2. Start dev server: `npm run dev`
3. Log in as any authenticated user
4. Navigate to `/feed`, click a button, scroll down
5. Wait 5 seconds for actions to upload
6. Visit `/admin/sessions` (as admin user)
7. Click a session ID
8. Click **Play** button
9. ✅ **Verify**: Replay window opens and executes commands correctly

## Architecture Verification

The command architecture ensures:
- **Shared Execution**: Live client and replay use the same `CommandPlayer`
- **Consistency**: Commands execute identically in both contexts
- **Testability**: Commands are easily unit-testable

## Test Steps

### 1. Enable Session Replay

Add to `.env.local`:
```bash
NEXT_PUBLIC_REPLAY_ENABLED=true
NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED=0.1  # Optional
```

### 2. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3002`

### 3. Record a Session (End-User Actions)

1. **Log in** as any authenticated user
2. **Navigate** to `/feed` (creates RouteCommand)
3. **Click** a button or link (creates ClickCommand)
4. **Scroll** down significantly (creates ScrollCommand if threshold configured)
5. **Navigate** to `/profile` (creates RouteCommand)
6. **Wait 5 seconds** (commands buffer and upload automatically)

**What's happening behind the scenes:**
- Each action creates a Command object (ClickCommand, RouteCommand, or ScrollCommand)
- Commands are added to CommandBuffer
- Commands are encoded and uploaded to `/api/replay/upload`
- Commands are stored in database with encoded format

### 4. View Recorded Session

1. **Log in as admin user** (must have `ADMIN` role)
2. **Navigate** to `/admin/sessions`
3. **Verify** you see:
   - Session ID (truncated to 8 chars)
   - Action count (number of commands recorded)
   - Started timestamp
   - Ended timestamp

### 5. Replay Session (Command Execution)

1. **Click** on a session ID link
2. **Verify** you see:
   - Session ID
   - Number of actions recorded
   - Replay Controls (Play button)
   - Actions Log (JSON display)

3. **Click Play** button
4. **Verify**:
   - New popup window opens
   - Window navigates to recorded routes (RouteCommand execution)
   - Window scrolls to recorded positions (ScrollCommand execution)
   - Elements are clicked automatically (ClickCommand execution)
   - Progress bar updates as commands execute

**What's happening behind the scenes:**
- Actions are decoded from database format
- Actions are converted to Commands via `createCommandFromAction()`
- Commands are executed by `CommandPlayer.executeCommand()`
- Same execution logic used by both live client and replay

## Expected Results

### Command Flow Verification

**Recording Flow:**
```
User Action → Command Creation → CommandBuffer → Encoding → Upload → Database
```

**Replay Flow:**
```
Database → Decode → Action → Command Creation → CommandPlayer → Execution
```

### Browser Console Verification

Open browser console and verify:
- No errors during recording
- Commands are created successfully
- Commands are uploaded to server
- Commands execute correctly during replay

### Network Tab Verification

1. Open DevTools → Network tab
2. Filter by "upload"
3. Verify `/api/replay/upload` requests:
   - Commands are encoded (short keys: `t`, `ts`, `d`)
   - Commands are batched (up to 10 per request)
   - Requests succeed (200 status)

### Database Verification

Commands are stored with:
- Encoded type (`r` = route, `c` = click, `sc` = scroll)
- Encoded keys (`p` = path, `s` = selector, `sy` = scrollY)
- Timestamps (BigInt milliseconds)

## Architecture Benefits Demonstrated

### 1. Code Reuse
- **Before**: Execution logic duplicated in ReplayPlayer
- **After**: Single `CommandPlayer` used by both live and replay
- **Verify**: Check `src/lib/replay/commandPlayer.ts` - single execution engine

### 2. Consistency
- **Before**: Live and replay might behave differently
- **After**: Same command classes execute identically
- **Verify**: Record an action, replay it - behavior matches exactly

### 3. Testability
- **Before**: Hard to test execution logic
- **After**: Commands are easily unit-testable
- **Verify**: Each command class can be tested in isolation

### 4. Extensibility
- **Before**: Adding new action types required changes in multiple places
- **After**: Add new command class, update factory function
- **Verify**: New command types follow same pattern

## Troubleshooting

**Commands not recording:**
- Check `NEXT_PUBLIC_REPLAY_ENABLED=true` in `.env.local`
- Restart dev server after changing env vars
- Check browser console for errors
- Verify user is authenticated

**Commands not replaying:**
- Check admin access (must have `ADMIN` role)
- Verify session has actions recorded
- Check browser console for errors
- Verify popup blocker isn't blocking replay window

**Commands executing incorrectly:**
- Check selectors match current DOM
- Verify scroll positions are normalized (0-1 ratio)
- Check command execution in browser console
- Verify CommandPlayer is being used

## Code Structure Reference

```
src/lib/replay/
├── commands/
│   ├── command.ts          # Base Command interface
│   ├── clickCommand.ts     # ClickCommand class
│   ├── routeCommand.ts     # RouteCommand class
│   ├── scrollCommand.ts    # ScrollCommand class
│   └── index.ts            # Factory functions
├── commandBuffer.ts        # Command storage & upload
├── commandPlayer.ts        # Shared execution engine
├── recordClick.ts          # Creates ClickCommand
├── recordRoute.ts          # Creates RouteCommand
└── recordScroll.ts         # Creates ScrollCommand

src/components/replay/
└── ReplayPlayer.tsx        # Uses CommandPlayer for execution
```

## Success Criteria

- ✅ Commands are created during recording
- ✅ Commands are stored in database (encoded)
- ✅ Commands are decoded during replay
- ✅ Commands execute correctly in replay window
- ✅ Same execution logic used by live and replay
- ✅ No duplicate execution code
- ✅ Commands are easily testable

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Architecture**: Command Pattern Implementation

