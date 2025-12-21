# Replay Library Comparison & Incremental Integration Path

## Executive Summary

This document compares the current custom replay implementation with **rrweb** and **OpenReplay**, and proposes a lightweight, incremental integration path that can be implemented one step at a time.

**Recommendation**: Start with **rrweb** for DOM snapshot capture, keeping the existing action-based system. This provides more robust replay while maintaining backward compatibility and allowing incremental migration.

---

## Current Implementation Analysis

### What We Have

**Recording:**
- Route changes (Next.js navigation)
- Clicks (selector-based: `data-testid`, `role`, `href`, text content)
- Scroll positions (normalized 0-1 ratio)
- Custom encoding (50-60% size reduction)
- Database storage (PostgreSQL with Prisma)

**Replay:**
- Selector-based element finding (fragile)
- Direct DOM manipulation (`element.click()`, `window.location.href`)
- Timed execution based on action timestamps
- Popup window for replay isolation

**Strengths:**
- ✅ Lightweight (no external dependencies)
- ✅ Custom encoding reduces storage/network size
- ✅ Full control over what's recorded
- ✅ Database-backed (queryable, filterable)

**Weaknesses:**
- ⚠️ Selector-based replay is fragile (DOM changes break replay)
- ⚠️ No DOM state capture (can't replay visual changes)
- ⚠️ Limited to recorded action types
- ⚠️ Manual selector matching logic (error-prone)

---

## Library Comparison

### rrweb (Core Library)

**What it is:**
- Open-source JavaScript library (~50KB gzipped)
- Captures DOM snapshots and mutations
- Records user interactions (clicks, inputs, scrolls)
- Replays with high fidelity

**Key Features:**
- **DOM Snapshots**: Full DOM state at intervals
- **DOM Mutations**: Incremental DOM changes
- **Event Recording**: User interactions (mouse, keyboard, touch)
- **Compact Format**: Efficient serialization
- **Framework Agnostic**: Works with React, Vue, Angular, vanilla JS

**Architecture:**
```
rrweb.record() → DOM Observer + Event Listeners
  → Serialize DOM snapshots + mutations
  → Compact event stream
  → Replay with rrweb.replay()
```

**Pros:**
- ✅ **Robust**: DOM-based replay (not selector-dependent)
- ✅ **Accurate**: Captures visual state, not just actions
- ✅ **Lightweight**: Core library is small
- ✅ **Incremental**: Can be added alongside existing system
- ✅ **Active**: Well-maintained, used by many tools
- ✅ **Flexible**: Can customize what's recorded

**Cons:**
- ⚠️ **Storage**: Larger payloads (DOM snapshots vs. action logs)
- ⚠️ **Privacy**: Captures all DOM (needs masking for sensitive data)
- ⚠️ **Learning Curve**: New API to learn
- ⚠️ **Migration**: Need to migrate existing sessions

**Integration Complexity:** Low-Medium
**Storage Impact:** +200-300% (but more accurate)

---

### OpenReplay

**What it is:**
- Full-featured session replay suite (self-hosted or cloud)
- Built on top of rrweb
- Includes developer tools integration
- Analytics and debugging features

**Key Features:**
- **Session Replay**: Full DOM + interaction replay
- **Console Logs**: Captures console.log, errors, warnings
- **Network Requests**: Records fetch/XHR with request/response
- **Performance Metrics**: Web Vitals, resource timing
- **Error Tracking**: JavaScript errors with stack traces
- **DevTools Integration**: Browser DevTools in replay
- **Analytics**: Session analytics, heatmaps, funnels

**Architecture:**
```
OpenReplay SDK → rrweb + Custom Plugins
  → Session Recording
  → Self-hosted Backend (or cloud)
  → Replay UI with DevTools
```

**Pros:**
- ✅ **Complete Solution**: Everything in one package
- ✅ **Developer Tools**: Console, network, performance in replay
- ✅ **Self-Hosted**: Full data control
- ✅ **Production Ready**: Battle-tested, used by many companies

**Cons:**
- ⚠️ **Heavyweight**: Full suite (backend + frontend)
- ⚠️ **Complex Setup**: Requires backend infrastructure
- ⚠️ **Overkill**: May be more than needed for current use case
- ⚠️ **Migration**: Significant refactor required

**Integration Complexity:** High
**Storage Impact:** +300-500% (but includes much more data)

---

## Comparison Matrix

| Feature | Current | rrweb | OpenReplay |
|---------|---------|-------|------------|
| **Recording Method** | Action-based | DOM snapshots | DOM snapshots + plugins |
| **Replay Accuracy** | Medium (selector-based) | High (DOM-based) | High (DOM-based) |
| **Storage Size** | Small (encoded actions) | Medium (DOM snapshots) | Large (DOM + logs + network) |
| **Setup Complexity** | Low (already done) | Low-Medium | High |
| **Framework Support** | React/Next.js specific | Framework agnostic | Framework agnostic |
| **Privacy Control** | High (selective recording) | Medium (needs masking) | Medium (needs masking) |
| **Developer Tools** | None | None | Console, Network, Performance |
| **Incremental Integration** | N/A | ✅ Yes | ❌ No (full replacement) |
| **Backward Compatibility** | N/A | ✅ Possible | ❌ No |
| **Bundle Size** | ~0KB (custom) | ~50KB gzipped | ~100KB+ (full suite) |

---

## Recommended Path: Incremental rrweb Integration

### Strategy: Hybrid Approach

**Phase 1**: Add rrweb alongside existing system (dual recording)
**Phase 2**: Use rrweb for replay, keep action-based for storage/analytics
**Phase 3**: Gradually migrate to rrweb-only (optional)

### Why This Works

1. **Non-Breaking**: Existing system continues to work
2. **Incremental**: Can be done one step at a time
3. **Best of Both**: Action-based analytics + DOM-based replay
4. **Low Risk**: Can roll back if issues arise
5. **Flexible**: Choose which sessions use which system

---

## Implementation Plan

### Phase 1: Add rrweb Recording (2-4 hours)

**Goal**: Record rrweb events alongside existing actions

**Steps:**
1. Install rrweb: `npm install rrweb`
2. Create `src/lib/replay/rrwebRecorder.ts`
3. Initialize rrweb recorder in `Providers.tsx`
4. Store rrweb events in separate field or table
5. Test: Verify both systems record simultaneously

**Code Example:**
```typescript
// src/lib/replay/rrwebRecorder.ts
import { record } from 'rrweb';
import type { eventWithTime } from 'rrweb/typings/types';

let stopRecording: (() => void) | null = null;
let rrwebEvents: eventWithTime[] = [];

export function startRrwebRecording() {
  stopRecording = record({
    emit(event) {
      rrwebEvents.push(event);
      // Optionally upload to server
    },
    maskAllInputs: true, // Privacy: mask input values
    maskAllText: false, // Keep text visible for replay
    blockClass: 'rr-block', // Block specific elements
    ignoreClass: 'rr-ignore', // Ignore specific elements
  });
}

export function stopRrwebRecording() {
  if (stopRecording) {
    stopRecording();
    stopRecording = null;
  }
  return rrwebEvents;
}

export function getRrwebEvents(): eventWithTime[] {
  return rrwebEvents;
}
```

**Integration:**
```typescript
// src/components/Providers.tsx
import { startRrwebRecording } from '@/lib/replay/rrwebRecorder';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Start rrweb recording when replay is enabled
    const config = getReplayConfig();
    if (config.enabled) {
      startRrwebRecording();
    }
    return () => {
      stopRrwebRecording();
    };
  }, []);
  
  // ... existing code
}
```

**Storage Option 1: Separate Table**
```prisma
model ReplaySession {
  // ... existing fields
  rrwebEvents Json? // Store rrweb events as JSON
}
```

**Storage Option 2: Separate Upload Endpoint**
```typescript
// src/app/api/replay/rrweb/upload/route.ts
export async function POST(req: NextRequest) {
  const { sessionId, events } = await req.json();
  // Store rrweb events separately
  await prisma.replaySession.update({
    where: { id: sessionId },
    data: { rrwebEvents: events },
  });
}
```

**Testing:**
- ✅ Verify both systems record
- ✅ Check storage size impact
- ✅ Test with existing replay UI

---

### Phase 2: Add rrweb Replay Option (4-6 hours)

**Goal**: Add option to replay using rrweb instead of action-based

**Steps:**
1. Install rrweb player: `npm install rrweb-player` (optional UI) or use `rrweb.replay()`
2. Create `src/components/replay/RrwebReplayPlayer.tsx`
3. Add toggle in admin UI: "Use rrweb replay" vs "Use action replay"
4. Test: Compare replay accuracy between systems

**Code Example:**
```typescript
// src/components/replay/RrwebReplayPlayer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { replay } from 'rrweb';
import type { eventWithTime } from 'rrweb/typings/types';

interface RrwebReplayPlayerProps {
  events: eventWithTime[];
  onComplete?: () => void;
}

export function RrwebReplayPlayer({ events, onComplete }: RrwebReplayPlayerProps) {
  const replayWindowRef = useRef<Window | null>(null);
  const stopReplayRef = useRef<(() => void) | null>(null);

  const startReplay = () => {
    if (replayWindowRef.current?.closed) {
      replayWindowRef.current = window.open('/', '_blank', 'width=1200,height=800');
    }

    if (replayWindowRef.current && events.length > 0) {
      stopReplayRef.current = replay({
        target: replayWindowRef.current.document.body,
        events,
        speedOption: {
          slow: 0.5,
          normal: 1,
          fast: 2,
        },
      });

      // Handle completion
      // Note: rrweb doesn't have built-in completion callback
      // Need to calculate duration from events
    }
  };

  const stopReplay = () => {
    if (stopReplayRef.current) {
      stopReplayRef.current();
    }
    if (replayWindowRef.current) {
      replayWindowRef.current.close();
    }
  };

  return (
    <div>
      <button onClick={startReplay}>Play (rrweb)</button>
      <button onClick={stopReplay}>Stop</button>
    </div>
  );
}
```

**Admin UI Integration:**
```typescript
// src/app/admin/sessions/[id]/page.tsx
const [useRrwebReplay, setUseRrwebReplay] = useState(false);

// Fetch rrweb events if available
const { rrwebEvents } = session; // From database

return (
  <div>
    <label>
      <input
        type="checkbox"
        checked={useRrwebReplay}
        onChange={(e) => setUseRrwebReplay(e.target.checked)}
      />
      Use rrweb replay (more accurate)
    </label>
    
    {useRrwebReplay && rrwebEvents ? (
      <RrwebReplayPlayer events={rrwebEvents} />
    ) : (
      <ReplayPlayer actions={actions} />
    )}
  </div>
);
```

**Testing:**
- ✅ Compare replay accuracy
- ✅ Test with different session types
- ✅ Verify performance impact

---

### Phase 3: Optimize Storage (Optional, 2-4 hours)

**Goal**: Reduce rrweb storage size while maintaining accuracy

**Strategies:**
1. **Compression**: Use gzip/deflate for rrweb events
2. **Sampling**: Only store rrweb for important sessions
3. **Hybrid**: Use action-based for storage, rrweb for replay on-demand
4. **Selective Recording**: Only record rrweb for specific routes/conditions

**Code Example:**
```typescript
// Only record rrweb for sessions with errors or specific conditions
export function shouldRecordRrweb(session: ReplaySession): boolean {
  // Record rrweb if:
  // - Session has errors
  // - Session is from admin user
  // - Session duration > 5 minutes
  return session.hasErrors || session.userId === adminId || session.duration > 300000;
}
```

---

### Phase 4: Gradual Migration (Optional, Ongoing)

**Goal**: Eventually use rrweb as primary replay method

**Steps:**
1. Make rrweb default for new sessions
2. Keep action-based for analytics/search
3. Migrate old sessions on-demand (if needed)
4. Remove action-based replay when confident

---

## Storage Comparison

### Current System (Action-Based)
```
Session: 5 minutes, 50 actions
- Actions: ~2.5-7.5 KB (encoded)
- Network: ~1-3 KB (gzipped)
- Total: ~3-8 KB per session
```

### rrweb (DOM Snapshots)
```
Session: 5 minutes, typical usage
- DOM snapshots: ~50-150 KB (uncompressed)
- Network: ~10-30 KB (gzipped)
- Total: ~10-30 KB per session
```

### Hybrid (Both Systems)
```
Session: 5 minutes
- Actions: ~3-8 KB (for analytics)
- rrweb: ~10-30 KB (for replay)
- Total: ~13-38 KB per session
```

**Recommendation**: Use hybrid approach - actions for analytics/search, rrweb for replay accuracy.

---

## Privacy Considerations

### Current System
- ✅ Selective recording (only specific actions)
- ✅ No DOM capture (no sensitive data in DOM)
- ✅ Custom encoding (can exclude sensitive fields)

### rrweb
- ⚠️ Captures full DOM (may include sensitive data)
- ✅ Masking options available (`maskAllInputs`, `maskAllText`)
- ✅ Block/ignore classes for sensitive elements

**Mitigation:**
```typescript
record({
  maskAllInputs: true, // Mask all input values
  maskAllText: false, // Keep text visible (adjust as needed)
  blockClass: 'rr-block', // Add to sensitive elements
  ignoreClass: 'rr-ignore', // Add to elements to ignore
  maskTextSelector: '[data-sensitive]', // Mask specific selectors
});
```

---

## Migration Checklist

### Phase 1: Add rrweb Recording
- [ ] Install rrweb: `npm install rrweb`
- [ ] Create `src/lib/replay/rrwebRecorder.ts`
- [ ] Add rrweb recording to `Providers.tsx`
- [ ] Create database field/table for rrweb events
- [ ] Create upload endpoint for rrweb events
- [ ] Test: Verify both systems record
- [ ] **Time**: 2-4 hours

### Phase 2: Add rrweb Replay
- [ ] Create `RrwebReplayPlayer` component
- [ ] Add toggle in admin UI
- [ ] Test: Compare replay accuracy
- [ ] Document: Update admin docs
- [ ] **Time**: 4-6 hours

### Phase 3: Optimize Storage (Optional)
- [ ] Add compression for rrweb events
- [ ] Implement selective recording
- [ ] Test: Verify storage impact
- [ ] **Time**: 2-4 hours

### Phase 4: Gradual Migration (Optional)
- [ ] Make rrweb default for new sessions
- [ ] Monitor usage and accuracy
- [ ] Migrate old sessions if needed
- [ ] Remove action-based replay when ready
- [ ] **Time**: Ongoing

---

## Decision Matrix

### Use rrweb if:
- ✅ Replay accuracy is critical
- ✅ Selector-based replay is breaking
- ✅ Need to see visual state changes
- ✅ Can handle 3-10x storage increase
- ✅ Want industry-standard solution

### Keep Current System if:
- ✅ Storage size is critical
- ✅ Selector-based replay works well
- ✅ Don't need visual state capture
- ✅ Want full control over recording
- ✅ Privacy requirements are strict

### Use Hybrid (Recommended) if:
- ✅ Want best of both worlds
- ✅ Need action-based analytics
- ✅ Want accurate replay
- ✅ Can handle moderate storage increase
- ✅ Want incremental migration path

---

## Conclusion

**Recommended Path**: **Hybrid Approach with rrweb**

1. **Phase 1** (2-4 hours): Add rrweb recording alongside existing system
2. **Phase 2** (4-6 hours): Add rrweb replay option in admin UI
3. **Phase 3** (Optional, 2-4 hours): Optimize storage
4. **Phase 4** (Optional, Ongoing): Gradual migration

**Benefits:**
- ✅ Non-breaking (existing system continues to work)
- ✅ Incremental (can be done step-by-step)
- ✅ Best of both worlds (analytics + accurate replay)
- ✅ Low risk (can roll back if needed)
- ✅ Flexible (choose which system to use per session)

**Total Time**: 6-10 hours for core integration, 2-4 hours for optimization

**Storage Impact**: +10-30 KB per session (acceptable for improved accuracy)

---

## References

- [rrweb Documentation](https://github.com/rrweb-io/rrweb)
- [rrweb Player](https://github.com/rrweb-io/rrweb-player)
- [OpenReplay Documentation](https://docs.openreplay.com/)
- Current codebase: `src/lib/replay/`, `src/components/replay/`

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Recommendation Provided

