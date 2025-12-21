# Session Replay - Day 1 MVP

## Goal
**Replay a minimal session after one day of development using database storage with compact encoding.**

## Scope
Record and replay:
- Route changes (navigation)
- Clicks (button clicks, link clicks)
- Scroll position (minimal, non-redundant)

## What We're NOT Doing (Yet)
- Input fields
- Form submissions
- Component prop recording
- Advanced UI controls
- API call recording
- Fine-grained scroll tracking (only significant scrolls)

## Encoding Strategy

### Action Type Encoding
```typescript
// src/lib/replay/encoding.ts
export const TYPE_ENCODE: Record<string, string> = {
  'route': 'r',
  'click': 'c',
  'scroll': 'sc',
  'input': 'i',
  'submit': 's',
  'component': 'm',
  'api_call': 'a',
  'error': 'e',
};

export const TYPE_DECODE: Record<string, string> = {
  'r': 'route',
  'c': 'click',
  'sc': 'scroll',
  'i': 'input',
  's': 'submit',
  'm': 'component',
  'a': 'api_call',
  'e': 'error',
};
```

### Data Key Encoding
```typescript
// src/lib/replay/encoding.ts
export const KEY_ENCODE: Record<string, string> = {
  // Common keys
  'path': 'p',
  'target': 'tg',
  'selector': 's',
  'component': 'c',
  'field': 'f',
  'value': 'v',
  'name': 'n',
  'props': 'p',
  'userId': 'u',
  'scrollY': 'sy',
  'scrollX': 'sx',
};

export const KEY_DECODE: Record<string, string> = {
  'p': 'path',
  'tg': 'target',
  's': 'selector',
  'c': 'component',
  'f': 'field',
  'v': 'value',
  'n': 'name',
  'p': 'props',
  'u': 'userId',
  'sy': 'scrollY',
  'sx': 'scrollX',
};

// Encode action for storage
export function encodeAction(action: {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}): { t: string; ts: number; d: Record<string, unknown> } {
  return {
    t: TYPE_ENCODE[action.type] || action.type,
    ts: action.timestamp,
    d: encodeData(action.data),
  };
}

// Encode data object keys
function encodeData(data: Record<string, unknown>): Record<string, unknown> {
  const encoded: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const shortKey = KEY_ENCODE[key] || key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      encoded[shortKey] = encodeData(value as Record<string, unknown>);
    } else {
      encoded[shortKey] = value;
    }
  }
  return encoded;
}

// Decode action from storage
export function decodeAction(encoded: {
  t: string;
  ts: number | bigint;
  d: Record<string, unknown>;
}): {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
} {
  return {
    type: TYPE_DECODE[encoded.t] || encoded.t,
    timestamp: typeof encoded.ts === 'bigint' ? Number(encoded.ts) : encoded.ts,
    data: decodeData(encoded.d),
  };
}

// Decode data object keys
function decodeData(data: Record<string, unknown>): Record<string, unknown> {
  const decoded: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const fullKey = KEY_DECODE[key] || key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      decoded[fullKey] = decodeData(value as Record<string, unknown>);
    } else {
      decoded[fullKey] = value;
    }
  }
  return decoded;
}
```

## Database Schema

### Migration
```prisma
model ReplaySession {
  id        String   @id @default(cuid())
  userId    String
  startedAt DateTime @default(now())
  endedAt   DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, startedAt])
  @@index([startedAt])
}

model ReplayAction {
  id        Int      @id @default(autoincrement())
  sessionId String
  timestamp BigInt   // Milliseconds since epoch
  type      String   // Encoded: 'r', 'c', 'i', etc. (max 1-2 chars)
  data      Json     // Compact JSON with encoded keys

  session ReplaySession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId, timestamp])
}
```

### Add to User model
```prisma
model User {
  // ... existing fields
  replaySessions ReplaySession[]
}
```

## Implementation

### 1. Database Setup (30 minutes)

```bash
# Create migration
npx prisma migrate dev --name add_replay_tables
```

### 2. Recording (2-3 hours)

#### Route Recording
```typescript
// src/lib/replay/recordRoute.ts
import { recordAction } from './actionBuffer';
import { encodeAction } from './encoding';

export function recordRoute(path: string) {
  recordAction(encodeAction({
    type: 'route',
    timestamp: Date.now(),
    data: { path }
  }));
}

// Hook into Next.js router
// src/components/replay/RouteRecorder.tsx
'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { recordRoute } from '@/lib/replay/recordRoute';

export function RouteRecorder() {
  const pathname = usePathname();
  
  useEffect(() => {
    recordRoute(pathname);
  }, [pathname]);
  
  return null;
}
```

#### Click Recording
```typescript
// src/lib/replay/recordClick.ts
import { recordAction } from './actionBuffer';
import { encodeAction } from './encoding';

export function recordClick(target: string, selector: string) {
  recordAction(encodeAction({
    type: 'click',
    timestamp: Date.now(),
    data: { target, selector }
  }));
}

// Add to key components
// src/components/replay/ClickRecorder.tsx
'use client';
import { useEffect } from 'react';
import { recordClick } from '@/lib/replay/recordClick';

export function ClickRecorder({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const target = el.getAttribute('data-replay-id') || 
                     el.id ||
                     el.className.split(' ')[0];
      const selector = el.getAttribute('data-replay-id') 
        ? `[data-replay-id="${el.getAttribute('data-replay-id')}"]`
        : el.id 
        ? `#${el.id}`
        : `.${el.className.split(' ')[0]}`;
      
      if (target) {
        recordClick(target, selector);
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  return <>{children}</>;
}
```

#### Scroll Recording (MVP)
```typescript
// src/lib/replay/config.ts
export interface ReplayConfig {
  enabled: boolean;
  scrollThreshold?: number; // If undefined, scroll recording is disabled
}

export function getReplayConfig(): ReplayConfig {
  const enabled = process.env.NEXT_PUBLIC_REPLAY_ENABLED === 'true';
  const scrollThresholdStr = process.env.NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED;
  const scrollThreshold = scrollThresholdStr ? parseFloat(scrollThresholdStr) : undefined;

  return {
    enabled,
    scrollThreshold, // undefined = disabled, number = threshold in pixels
  };
}

// src/lib/replay/recordScroll.ts
import { recordAction } from './actionBuffer';
import { encodeAction } from './encoding';
import { getReplayConfig } from './config';

// Track last recorded scroll position to avoid redundant logs
let lastScrollY = 0;
let lastScrollX = 0;

export function recordScroll(scrollY: number, scrollX: number = 0) {
  const config = getReplayConfig();
  
  // Zero overhead: if scroll threshold not configured, do nothing
  if (config.scrollThreshold === undefined) {
    return;
  }

  const deltaY = Math.abs(scrollY - lastScrollY);
  const deltaX = Math.abs(scrollX - lastScrollX);
  
  // Only record if scroll changed significantly
  if (deltaY >= config.scrollThreshold || deltaX >= config.scrollThreshold) {
    recordAction(encodeAction({
      type: 'scroll',
      timestamp: Date.now(),
      data: { scrollY, scrollX }
    }));
    
    lastScrollY = scrollY;
    lastScrollX = scrollX;
  }
}

// src/components/replay/ScrollRecorder.tsx
'use client';
import { useEffect, useRef } from 'react';
import { recordScroll } from '@/lib/replay/recordScroll';
import { getReplayConfig } from '@/lib/replay/config';
import { useSession } from 'next-auth/react';
import { useReplayContext } from '@/lib/replay/replayContext';

/**
 * Records scroll events for session replay.
 * Only records significant scroll changes (>= threshold) to minimize log data.
 * Records scroll position before clicks to show context.
 * Zero overhead when NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD is not set.
 */
export function ScrollRecorder() {
  const { data: session } = useSession();
  const config = getReplayConfig();
  const { isReplaying } = useReplayContext();
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Zero overhead: if scroll threshold not configured, don't add listeners
    if (config.scrollThreshold === undefined) {
      return undefined;
    }

    // Don't record during replay
    if (isReplaying) {
      return undefined;
    }

    // Only record if enabled and user is authenticated
    if (!config.enabled || !session?.user?.id) {
      return undefined;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Debounce scroll recording (wait 200ms after last scroll event)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        recordScroll(scrollY, scrollX);
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [config.enabled, config.scrollThreshold, session?.user?.id, isReplaying]);

  return null;
}
```

**Scroll Recording Strategy:**
- **Environment Variable**: `NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED` (optional, normalized 0-1 ratio, e.g., `0.1` = 10% of scrollable area)
- **Zero Overhead**: If not set, scroll recording is completely disabled (no event listeners, no function calls)
- **Normalized Positions**: Scroll positions are recorded as normalized ratios (0-1) instead of absolute pixels:
  - `scrollY = 0` = top of page, `scrollY = 1` = bottom of page
  - `scrollX = 0` = left edge, `scrollX = 1` = right edge
  - Enables accurate replay even if replay window has different dimensions
- **Normalized Threshold**: Threshold is also normalized (0-1 ratio), e.g., `0.1` means record when scroll changes by 10% of scrollable area
  - More consistent across different screen sizes than pixel-based thresholds
  - Example: `0.1` on a 1000px scrollable area = 100px, on a 2000px area = 200px (same relative change)
  - **Minimum Guard**: Threshold is clamped to minimum 0.01 (1%) to prevent spam from tiny adjustments
  - **No Scrollbar Guard**: Pages without scrollable content (no scrollbar) don't record scroll events
- **Debouncing**: Wait 200ms after scroll stops before recording (avoids recording every pixel)
- **Context**: Scroll position is recorded before clicks automatically (via timestamp ordering)
- **Storage**: Minimal - only significant scroll changes, not every pixel movement

#### Action Buffer & Upload
```typescript
// src/lib/replay/actionBuffer.ts
import { v4 as uuidv4 } from 'uuid';

type EncodedAction = {
  t: string;  // encoded type
  ts: number; // timestamp
  d: Record<string, unknown>; // encoded data
};

let actionBuffer: EncodedAction[] = [];
let sessionId: string | null = null;

export function recordAction(action: EncodedAction) {
  if (!sessionId) {
    sessionId = uuidv4();
  }
  
  actionBuffer.push(action);
  
  // Upload every 5 seconds or when buffer reaches 10
  if (actionBuffer.length >= 10) {
    flushActions();
  }
}

async function flushActions() {
  if (actionBuffer.length === 0 || !sessionId) return;
  
  const actions = actionBuffer.splice(0);
  
  // Network payload is already compact (encoded)
  await fetch('/api/replay/upload', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      // Next.js will gzip automatically if supported
    },
    body: JSON.stringify({
      sessionId,
      actions,
    })
  });
}

// Flush periodically
if (typeof window !== 'undefined') {
  setInterval(flushActions, 5000);
  window.addEventListener('beforeunload', flushActions);
}
```

### 3. Server Storage (1-2 hours)

```typescript
// src/app/api/replay/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/replay/admin';
import prisma from '@/lib/prisma/prisma';
import { logger } from '@/lib/logging';

type EncodedAction = {
  t: string;
  ts: number;
  d: Record<string, unknown>;
};

type UploadBody = {
  sessionId: string;
  actions: EncodedAction[];
};

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    logger.warn({ msg: 'replay_upload_unauthorized' });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { sessionId, actions }: UploadBody = await req.json();
  
  if (!sessionId || !Array.isArray(actions) || actions.length === 0) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  try {
    // Upsert session (create if doesn't exist, update endedAt)
    const session = await prisma.replaySession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        userId: user.userId,
        startedAt: new Date(actions[0].ts),
        endedAt: new Date(actions[actions.length - 1].ts),
      },
      update: {
        endedAt: new Date(actions[actions.length - 1].ts),
      },
    });

    // Insert actions (already encoded, store as-is)
    await prisma.replayAction.createMany({
      data: actions.map(action => ({
        sessionId,
        timestamp: BigInt(action.ts),
        type: action.t, // Already encoded ('r', 'c', etc.)
        data: action.d, // Already encoded (short keys)
      })),
    });

    logger.info({
      msg: 'replay_actions_uploaded',
      sessionId,
      userId: user.userId,
      actionsCount: actions.length,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({
      msg: 'replay_upload_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'database_error' }, { status: 500 });
  }
}
```

### 4. Replay (2-3 hours)

```typescript
// src/app/admin/sessions/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeAction } from '@/lib/replay/encoding';

type DecodedAction = {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
};

export default function Page({ params }: { params: { id: string } }) {
  const [actions, setActions] = useState<DecodedAction[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    fetch(`/api/replay/sessions/${params.id}`)
      .then(r => r.json())
      .then(data => {
        // Decode actions from database
        const decoded = (data.actions || []).map((a: {
          t: string;
          ts: bigint | number;
          d: Record<string, unknown>;
        }) => decodeAction({
          t: a.t,
          ts: typeof a.ts === 'bigint' ? Number(a.ts) : a.ts,
          d: a.d,
        }));
        setActions(decoded.sort((a, b) => a.timestamp - b.timestamp));
      });
  }, [params.id]);
  
  const play = () => {
    setIsPlaying(true);
    let index = 0;
    
    const executeNext = () => {
      if (index >= actions.length) {
        setIsPlaying(false);
        return;
      }
      
      const action = actions[index];
      
      switch(action.type) {
        case 'route':
          router.push(action.data.path as string);
          break;
        case 'click':
          const selector = action.data.selector as string;
          const element = document.querySelector(selector);
          element?.click();
          break;
        case 'scroll':
          // Only replay scroll if scroll recording was enabled (has scrollThreshold config)
          const scrollY = action.data.scrollY as number;
          const scrollX = (action.data.scrollX as number) || 0;
          window.scrollTo({ top: scrollY, left: scrollX, behavior: 'instant' });
          break;
      }
      
      index++;
      setTimeout(executeNext, 100); // 100ms between actions
    };
    
    executeNext();
  };
  
  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Session {params.id}</h1>
      <button 
        onClick={play} 
        disabled={isPlaying}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isPlaying ? 'Playing...' : 'Play'}
      </button>
      <div className="mt-4">
        <p>Actions: {actions.length}</p>
      </div>
    </main>
  );
}
```

### 5. API Endpoint for Retrieval (30 minutes)

```typescript
// src/app/api/replay/sessions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/replay/admin';
import prisma from '@/lib/prisma/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const actions = await prisma.replayAction.findMany({
      where: { sessionId: params.id },
      orderBy: { timestamp: 'asc' },
      select: {
        t: true, // type (already encoded in DB)
        ts: true, // timestamp
        d: true, // data (already encoded in DB)
      },
    });

    // Return encoded actions (client will decode)
    return NextResponse.json({ 
      id: params.id,
      actions: actions.map(a => ({
        t: a.t,
        ts: Number(a.ts), // Convert BigInt to number
        d: a.d,
      }))
    });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
```

### 6. Update Session List (30 minutes)

```typescript
// src/lib/replay/getSessions.ts
import prisma from '@/lib/prisma/prisma';

export type SessionInfo = {
  id: string;
  actionCount: number;
  startedAt: number;
  endedAt: number | null;
};

export async function getSessions(): Promise<SessionInfo[]> {
  const sessions = await prisma.replaySession.findMany({
    orderBy: { startedAt: 'desc' }, // Newest first
    select: {
      id: true,
      startedAt: true,
      endedAt: true,
      _count: {
        select: { actions: true },
      },
    },
  });

  return sessions.map(s => ({
    id: s.id,
    actionCount: s._count.actions,
    startedAt: s.startedAt.getTime(),
    endedAt: s.endedAt?.getTime() || null,
  }));
}
```

### 7. Integration (30 minutes)

```typescript
// src/components/Providers.tsx (or src/app/layout.tsx)
import { RouteRecorder } from '@/components/replay/RouteRecorder';
import { ClickRecorder } from '@/components/replay/ClickRecorder';
import { ScrollRecorder } from '@/components/replay/ScrollRecorder';

// Inside Providers or Layout
<ScrollRecorder />
<ClickRecorder>
  <RouteRecorder />
  {children}
</ClickRecorder>
```

## Storage Size Analysis

### Before Encoding
```json
{"type": "route", "timestamp": 1234567890, "data": {"path": "/feed"}}
// ~60 bytes per action
// 50 actions = ~3 KB
```

### After Encoding
```json
{"t": "r", "ts": 1234567890, "d": {"p": "/feed"}}
// ~35 bytes per action
// 50 actions = ~1.75 KB
// Savings: 42%
```

### With Gzip Compression (Network)
- Encoded JSON: ~1.75 KB
- Gzipped: ~0.7-1 KB
- **Total savings: 70-80%**

## Testing

### Manual Test
1. Run migration: `npx prisma migrate dev`
2. Set environment variables:
   - `NEXT_PUBLIC_REPLAY_ENABLED=true`
   - `NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED=0.1` (optional, normalized 0-1 ratio, e.g., 0.1 = 10% of scrollable area, omit to disable)
3. Start recording
4. Navigate to `/feed`
5. Scroll down significantly (>= threshold % of scrollable area if configured)
6. Click a button
7. Scroll up significantly (>= threshold % of scrollable area if configured)
8. Navigate to `/profile`
9. Go to `/admin/sessions`
10. Find your session (should be sorted newest first)
11. Click session ID
12. Click "Play"
13. Verify: Route changes, scroll positions (if enabled), and button clicks replay correctly even if replay window has different dimensions

## Success Criteria

- ✅ Can record route changes to database (encoded)
- ✅ Can record clicks to database (encoded)
- ✅ Can record scroll positions to database (encoded, minimal)
- ✅ Can replay route changes
- ✅ Can replay clicks
- ✅ Can replay scroll positions
- ✅ Basic play button works
- ✅ Sessions sorted by time (newest first)
- ✅ Storage < 2.5 KB per session (50 actions + scrolls)
- ✅ Network payload < 1.2 KB per upload (with gzip)
- ✅ Scroll recording only captures significant changes (>= 100px)
- ✅ Implementation time < 9 hours

## Database Considerations

### Indexes
- `ReplaySession(userId, startedAt)` - Fast user session queries
- `ReplaySession(startedAt)` - Fast time-based sorting
- `ReplayAction(sessionId, timestamp)` - Fast action retrieval per session

### Retention
```sql
-- Delete sessions older than 14 days
DELETE FROM ReplayAction 
WHERE sessionId IN (
  SELECT id FROM ReplaySession 
  WHERE startedAt < NOW() - INTERVAL '14 days'
);

DELETE FROM ReplaySession 
WHERE startedAt < NOW() - INTERVAL '14 days';
```

### Performance
- Batch inserts (already implemented)
- Indexed queries (fast)
- Compact storage (encoded)
- Can partition by date if needed (future)

## Next Steps (Day 2+)

- Add input field recording
- Add component prop recording
- Add play/pause controls
- Add speed controls
- Improve click targeting
- Add action filtering/search
- Expand encoding for more action types

## Estimated Time

- Database migration: 30 minutes
- Encoding utilities: 1 hour (includes scroll type/key encoding)
- Recording infrastructure: 2-3 hours (includes scroll recorder)
- Server storage (database): 1-2 hours
- Replay engine: 2-3 hours (includes scroll replay)
- Integration & testing: 1 hour
- **Total: 7.5-10.5 hours** (one day)

## Scroll Position MVP Details

### Recording Strategy
- **Threshold**: Only record scroll changes >= 100px (vertical or horizontal)
- **Debouncing**: Wait 200ms after scroll stops before recording
- **Context**: Scroll position automatically provides context before clicks (via timestamp ordering)
- **Storage**: Minimal - typically 2-5 scroll events per page, not hundreds

### Example Scroll Action
```json
// Encoded (normalized 0-1 values, not pixels)
{"t": "sc", "ts": 1234567890, "d": {"sy": 0.25, "sx": 0}}

// Decoded
{"type": "scroll", "timestamp": 1234567890, "data": {"scrollY": 0.25, "scrollX": 0}}
// scrollY: 0.25 means 25% down the page (works regardless of window size)
```

### Storage Impact
- **Before threshold**: User scrolls 1000px → could generate 100+ events
- **After threshold**: User scrolls 1000px → generates ~10 events (threshold increments)
- **Savings**: ~90% reduction in scroll events
- **Typical session**: 50 actions + 5-10 scrolls = ~55 total actions (~2.5 KB encoded)
- **When disabled**: Zero scroll events, zero overhead

### Replay Behavior
- Scroll positions are replayed in chronological order with other actions
- Normalized positions (0-1) are converted back to pixels based on replay window size:
  - Original: scrollY=500px, documentHeight=2000px → normalized=0.25
  - Replay: documentHeight=1500px → scrollY=1500*0.25=375px (same relative position)
- Scroll happens instantly (`behavior: 'auto'`) to match original timing
- Scroll position before a click shows what was visible when user clicked
- Large scrolls (>= threshold) ensure elements are visible before interaction
- **When disabled**: Scroll actions are ignored during replay (no performance impact)
- **Size Independence**: Replay works correctly even if replay window has different dimensions than recording window

### Environment Variable Configuration
```bash
# .env.local
NEXT_PUBLIC_REPLAY_ENABLED=true
NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED=0.1  # Optional: normalized ratio (0-1), e.g., 0.1 = 10% of scrollable area
```

**Behavior:**
- `NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED` not set → Scroll recording disabled, zero overhead
- `NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED=0.1` → Record when scroll changes by 10% of scrollable area
- `NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED=0.05` → Record when scroll changes by 5% (more granular)
- `NEXT_PUBLIC_REPLAY_SCROLL_THRESHOLD_NORMALIZED=0.2` → Record when scroll changes by 20% (less granular)
- Values are clamped to 0.01-1 range:
  - Minimum: 0.01 (1%) prevents spam from tiny adjustments
  - Maximum: 1.0 (100%) - no point recording if threshold is 100%
  - Invalid values default to 0.1 (10%)
- **No Scrollbar Protection**: Pages without scrollable content don't record scroll events (prevents spam)
