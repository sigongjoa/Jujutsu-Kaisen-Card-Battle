# State Synchronization & Integrity (Fog of War)

**Concept**: The client is an untrusted viewer. It should never possess data it is not entitled to see.

## 1. The "Fog of War" Layer

Before any `GameState` is serialized to JSON, it MUST pass through a `ViewSanitizer`.

### 1.1 Sanitization Logic
```typescript
function createPlayerView(serverState: GameState, viewingPlayerId: string): ClientGameState {
  const view = clone(serverState);
  
  // 1. Mask Opponent Hand
  const opponentId = getOpponentId(viewingPlayerId);
  view.players[opponentId].hand = view.players[opponentId].hand.map(card => ({
    id: "HIDDEN",
    type: "UNKNOWN",
    cost: 0,
    // Keep instanceId if needed for tracking, but usually hide it too until played
    instanceId: card.instanceId 
  }));

  // 2. Mask Deck
  view.players.forEach(p => {
    p.deck = []; // Remove all cards
    p.deckCount = serverState.players[p.id].deck.length; // Send count only
  });

  // 3. Mask Hidden Zones (e.g. Face-down Trap cards)
  view.field.forEach(card => {
    if (card.faceDown && card.owner !== viewingPlayerId) {
      maskCardDetails(card);
    }
  });

  return view;
}
```

## 2. Sequence-Based Reconciliation

To handle network jitter and packet loss without heavy overhead:

1.  **Server Sequence**: The server maintains a strictly increasing `sequenceId` for every game event.
2.  **Client Tracking**: The client tracks the `lastProcessedSeq`.
3.  **Gap Detection**: If the client receives `Seq 105` but `lastProcessedSeq` was `103`, it knows it missed `104`.
4.  **Recovery**: Client sends `SYNC_REQUEST(from: 103)`. Server responds with the missing events.

## 3. Optimistic UI vs. Server Authority

We use **Speculative Execution** with **Hard Rollback**.

1.  **Speculation**: User plays a card. Client *immediately* moves it to the stack visually and locks the UI.
2.  **Confirmation**: Server sends `ACTION_ACCEPTED` + `STACK_UPDATE`. Client confirms the visual state matches.
3.  **Rejection**: Server sends `COMMAND_REJECTED`.
    *   **Rollback**: Client MUST undo the animation (return card to hand, unlock mana).
    *   **Feedback**: Show error toast ("Not enough energy").

## 4. Anti-Tamper Measures

- **State Hashing**: Periodically (e.g., every turn end), the server sends a hash of the critical state (HP, Hand Count, Mana). The client calculates its local hash. If they mismatch, the client requests a full `GAME_SNAPSHOT` to fix the desync.
