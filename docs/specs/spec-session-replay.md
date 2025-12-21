# Session Replay - Architecture & Vision

## Overview
Client-side-only forward replay system that records component-based commands and replays them using existing React components. Actions are stored in a database with compact encoding to minimize storage and network size.

## Core Principle
**Components already exist and can render from props. Replay = feed components same props + execute same actions.**

## Architecture

### Recording (Client-Side)
```
User Action → Component Event → Recording Hook → Encode Action → Upload to Server → Database
```

**Components**:
- Recording context/hook that wraps components
- Intercepts route changes (Next.js router)
- Records component renders with props
- Records user actions (clicks, inputs, etc.)
- Encodes actions with brief representations
- Batches and uploads to server

### Storage (Server-Side Database)
```
Encoded Action Log → API Endpoint → Decode → Prisma → PostgreSQL
```

**Database Schema**:
```prisma
model ReplaySession {
  id        String   @id @default(cuid())
  userId    String   // User ID (authenticated) or anonymous ID (future)
  startedAt DateTime @default(now())
  endedAt   DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, startedAt])  // Fast queries by user ID
  @@index([startedAt])           // Fast time-based sorting
}

model ReplayAction {
  id        Int      @id @default(autoincrement())
  sessionId String
  timestamp BigInt   // Milliseconds since epoch
  type      String   // Encoded type: 'r'=route, 'c'=click, 'i'=input, etc.
  data      Json     // Compact JSON with short keys

  session ReplaySession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId, timestamp])
}
```

### Encoding Strategy

#### Action Type Encoding
```typescript
// Short codes instead of full strings
const TYPE_ENCODING = {
  'route': 'r',
  'click': 'c',
  'input': 'i',
  'submit': 's',
  'component': 'm', // 'm' for component (module)
  'api_call': 'a',
  'error': 'e',
} as const;

const TYPE_DECODING = {
  'r': 'route',
  'c': 'click',
  'i': 'input',
  's': 'submit',
  'm': 'component',
  'a': 'api_call',
  'e': 'error',
} as const;
```

#### Data Payload Encoding
```typescript
// Full representation → Encoded representation
// Route
{ type: 'route', data: { path: '/feed' } }
→ { t: 'r', d: { p: '/feed' } }

// Click
{ type: 'click', data: { target: 'CreatePostButton', selector: '[data-replay-id="create"]' } }
→ { t: 'c', d: { tg: 'CreatePostButton', s: '[data-replay-id="create"]' } }

// Input
{ type: 'input', data: { component: 'PostEditor', field: 'content', value: 'Hello' } }
→ { t: 'i', d: { c: 'PostEditor', f: 'content', v: 'Hello' } }

// Component
{ type: 'component', data: { name: 'Feed', props: { userId: '123' } } }
→ { t: 'm', d: { n: 'Feed', p: { u: '123' } } }
```

**Key Mapping**:
- `type` → `t`
- `data` → `d`
- `path` → `p`
- `target` → `tg`
- `selector` → `s`
- `component` → `c`
- `field` → `f`
- `value` → `v`
- `name` → `n`
- `props` → `p`
- `userId` → `u`

### Storage Size Comparison

#### Before Encoding
```json
{"type": "route", "timestamp": 1234567890, "data": {"path": "/feed"}}
// Size: ~60 bytes
```

#### After Encoding
```json
{"t": "r", "ts": 1234567890, "d": {"p": "/feed"}}
// Size: ~35 bytes
// Savings: ~42%
```

#### Per Session Estimate
- **Before**: 50 actions × 60 bytes = 3 KB
- **After**: 50 actions × 35 bytes = 1.75 KB
- **Savings**: ~42% reduction

### Network Compression
- Use gzip compression for uploads (Next.js handles automatically)
- Batch multiple actions in single request
- Further reduces network payload by 60-80%

## Replay (Client-Side)
```
Load Actions from DB → Decode Actions → Parse Actions → Reconstruct Route → Render Components → Execute Actions
```

**Process**:
1. Load actions from database (ordered by timestamp)
2. Decode action types and data keys
3. Parse actions sequentially
4. For each action:
   - Route change → use Next.js router
   - Component render → render component with recorded props
   - User action → simulate event (click, input, etc.)

## Data Model

### Action Types (Encoded)
- **`r`** (route): Navigation to new route
- **`c`** (click): User clicked element
- **`i`** (input): User typed in input field
- **`s`** (submit): Form submitted
- **`m`** (component): Component rendered with props
- **`a`** (api_call): API request made (optional)
- **`e`** (error): Error occurred

### Storage Size
- **Per action row**: ~50-150 bytes (with encoding + DB overhead)
- **Typical session** (5 min, 50 actions): ~2.5-7.5 KB in database
- **With gzip compression**: ~1-3 KB network payload
- **Comparison**: 50-60% smaller than unencoded

## Implementation Phases

### Phase 1: Day-1 MVP (See spec-session-replay-mvp-day1.md)
- Record route changes only
- Record clicks only
- Basic replay (route + click simulation)
- Minimal UI (play button)
- Database storage with encoding

### Phase 2: Week-1 MVP
- Add component prop recording
- Add input recording
- Add form submission recording
- Enhanced replay UI (play/pause/speed)
- Action filtering/search

### Phase 3: Enhanced
- Add API call recording
- Add business event recording
- Timeline scrubber
- Advanced filtering (by user, date, action type)
- Analytics dashboard

## Technical Decisions

### Why Encoding?
- **Storage**: 40-50% reduction in database size
- **Network**: 50-60% reduction in payload size (with gzip)
- **Cost**: Minimal complexity (simple encode/decode functions)
- **Professional**: Common optimization pattern

### Why Component-Based?
- Components already exist → no rendering logic needed
- React handles re-rendering → just feed props
- Smaller storage → props only, not DOM
- More accurate → components render themselves

### Why Database Storage?
- **Queryable**: Can search and filter actions
- **Relational**: Can join with User table
- **Indexed**: Fast queries on common fields
- **Scalable**: Handles growth better than files
- **Professional**: Standard approach for structured data

### Why Client-Side Only?
- No server simulation overhead
- Scales infinitely (server just queries database)
- Simpler architecture
- Faster implementation

### Why Forward-Only?
- Simpler than bidirectional
- Sufficient for debugging
- Can add backward later if needed

## User Association (Future Requirement)

### Requirement
Associate replay sessions with user IDs, even for actions before login. This enables:
- Querying all sessions for a specific user
- Understanding user journey from first visit to login
- Analytics per user

### Implementation Approach (Post-MVP)
1. **Anonymous Sessions**: Record sessions before login with temporary/anonymous user ID
2. **Session Merging**: When user logs in, associate pre-login sessions with their user ID
3. **Fingerprinting**: Use browser fingerprinting or cookies to link anonymous sessions
4. **Query Support**: Database already supports querying by `userId` (indexed)

### MVP Support
- ✅ Database schema includes `userId` field
- ✅ Indexed on `(userId, startedAt)` for fast queries
- ✅ Can query: `WHERE userId = '...'`
- ⚠️ MVP only records authenticated users (post-login)
- ⚠️ Anonymous session association deferred to future phase

## Exclusions

### Do NOT Record (MVP)
- Admin routes (`/admin/*`)
- Admin users (users with `role: 'ADMIN'`)
- Sensitive inputs (passwords, emails in forms)
- External API responses (optional, for size)
- Anonymous/pre-login sessions (future requirement)

### Do NOT Implement (Out of Scope)
- Bidirectional scrubbing
- Server-side state simulation
- DOM snapshot storage
- Real-time monitoring
- Cross-device synchronization
- Anonymous session association (future requirement)

## Success Criteria

- ✅ Can record user session as encoded action log in database
- ✅ Can replay session using existing components
- ✅ Storage efficient (< 8 KB per session)
- ✅ Network efficient (< 3 KB per session upload)
- ✅ Queryable (can filter by user, date, action type)
- ✅ Replay accuracy sufficient for debugging
- ✅ Implementation time < 1 week for full version
