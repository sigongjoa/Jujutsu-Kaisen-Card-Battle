# Server-to-Client Event Specification

**Principle**: The server pushes **Sanitized Views** and **Atomic Events**.

## 1. State Synchronization

### `GAME_SNAPSHOT`
Sent on connection or full resync.
**CRITICAL**: This payload MUST be sanitized.
- `opponent.hand`: Array of `{ "id": "unknown", "back": true }` objects.
- `deck`: Count only. No card data.

```json
{
  "type": "GAME_SNAPSHOT",
  "seq": 1000,
  "payload": {
    "gameId": "uuid",
    "turn": 3,
    "priorityPlayer": "p1",
    "stack": [],
    "me": { "hand": [/* real data */], "resources": 5 },
    "opponent": { "handCount": 4, "resources": 5, "hand": [/* masked */] }
  }
}
```

### `GAME_EVENT`
Atomic updates for animations and state transitions.

```json
{
  "type": "GAME_EVENT",
  "seq": 1001,
  "payload": {
    "type": "CARD_PLAYED",
    "playerId": "p1",
    "cardId": "c_123", // Now visible because it was played
    "instanceId": "i_999",
    "targetIds": ["i_555"]
  }
}
```

## 2. Stack & Priority

### `STACK_UPDATE`
Notifies that the Stack has changed (item added/removed).

```json
{
  "type": "STACK_UPDATE",
  "payload": {
    "stack": [
      { "source": "Black Flash", "controller": "p1", "targets": ["p2"] }
    ]
  }
}
```

### `PRIORITY_SHIFT`
Tells the client it is now their turn to act (or pass).

```json
{
  "type": "PRIORITY_SHIFT",
  "payload": {
    "player": "p2",
    "canRespond": true,
    "timeoutMs": 30000
  }
}
```

## 3. Error Handling

### `COMMAND_REJECTED`
Sent when a client's intent is invalid.

```json
{
  "type": "COMMAND_REJECTED",
  "payload": {
    "actionId": "client-uuid",
    "code": "INSUFFICIENT_MANA",
    "message": "You need 5 Cursed Energy, but have 3."
  }
}
```

### `CRITICAL_ERROR`
System failure or integrity violation. Client should force reload.

```json
{
  "type": "CRITICAL_ERROR",
  "payload": {
    "code": "STATE_DESYNC",
    "message": "Client state hash mismatch. Forcing reload."
  }
}
```
