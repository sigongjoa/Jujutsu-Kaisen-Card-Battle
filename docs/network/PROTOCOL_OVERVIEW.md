# Production Network Protocol Specification

**Version:** 1.0.0
**Status:** DRAFT (Under Architectural Review)
**Author:** Server Architecture Team

## 1. Architecture Overview

This document defines the high-performance, secure WebSocket protocol for the Jujutsu Kaisen Card Battle system. Unlike typical toy projects, this protocol is designed for **State Integrity**, **Scalability**, and **Cheating Prevention**.

### 1.1 Design Principles
1.  **Server Authority**: The server is the absolute source of truth. Clients are merely "dumb terminals" rendering the state.
2.  **Fog of War**: The server **NEVER** sends hidden information (e.g., opponent's hand, deck order) to the client.
3.  **Idempotency**: All client actions must carry a unique `actionId` to prevent double-execution on network retries.
4.  **Event-Driven**: The protocol uses a strict event sourcing pattern for debugging and replayability.

## 2. Connection Lifecycle

### 2.1 Endpoint & Authentication
**URL**: `wss://api.jujutsucards.com/v1/game/ws`

**Handshake Headers**:
- `Authorization`: `Bearer <JWT_TOKEN>` (Strictly required. No query params for tokens to avoid logging leaks.)
- `X-Game-ID`: `<UUID>`
- `X-Client-Version`: `<SemVer>` (Reject mismatched clients immediately)

### 2.2 Connection Flow
1.  **Auth Validation**: Server verifies JWT signature and expiration.
2.  **Match Validation**: Server checks if `GameID` is active and User is a participant.
3.  **Session Rehydration**: If a session exists (reconnect), the server resumes the event stream from `lastKnownSequenceId`.
4.  **Initial Snapshot**: Server sends a **Sanitized** `GAME_STATE_SNAPSHOT`.

### 2.3 Heartbeat & Latency
- **Ping/Pong**: Server sends `PING` every 15s. Client MUST respond with `PONG` within 5s or be disconnected.
- **Latency Monitoring**: `PONG` payload includes client-side timestamp to calculate RTT (Round Trip Time) for lag compensation.

## 3. Message Envelope

All WebSocket frames MUST be binary (Protobuf) or minified JSON (for MVP). The structure is strict:

```typescript
interface NetworkEnvelope {
  ver: number;          // Protocol version
  id: string;           // UUID v4 (Trace ID)
  t: number;            // Timestamp (Unix ms)
  type: MessageType;    // Enum
  payload: any;         // Type-specific data
}
```

## 4. Reconnection Strategy (Exponential Backoff)

Clients MUST implement the following reconnection logic:
1.  **Immediate Retry**: 0ms delay (for blips).
2.  **Fast Retry**: 200ms.
3.  **Backoff**: 500ms, 1s, 2s, 5s (Max).
4.  **Give Up**: After 30s, show "Connection Lost" modal.

**Critical**: Upon reconnection, the client sends `SYNC_REQUEST` with its last processed `sequenceId`. The server replies with a `DELTA_LOG` containing all missed events.
