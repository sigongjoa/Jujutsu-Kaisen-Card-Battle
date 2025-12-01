# Developer Guide – Stability & Maintainability

## 1. WebSocket Reconnection Strategy

### Problem
- Mobile/unstable networks cause socket disconnects, leading to lost game state.

### Solution
1. **Exponential Back‑off Reconnect**
   - On `close` event, attempt reconnection after `baseDelay = 3000ms`.
   - Multiply delay by `factor = 2` on each retry, up to `maxAttempts = 5`.
   - Stop after max attempts and show UI “Connection lost”.
2. **Hydration after Reconnect**
   - After successful reconnect, request `/api/game/:id` to fetch the latest state.
   - Dispatch `updateGameState` to sync UI.
3. **Implementation Sketch** (in `frontend/src/services/websocket.ts`):
   ```ts
   let attempts = 0;
   const maxAttempts = 5;
   const baseDelay = 3000;
   const reconnect = () => {
     if (attempts >= maxAttempts) {
       // give up – show modal
       dispatch(setConnectionLost(true));
       return;
     }
     const delay = baseDelay * Math.pow(2, attempts);
     setTimeout(() => wsService.connect(gameId, token).then(() => {
       attempts = 0; // reset on success
       // hydrate
       apiService.getGame(gameId).then(state => dispatch(updateGameState(state))
     }).catch(reconnect), delay);
     attempts++;
   };
   ws.on('close', reconnect);
   ```

### Acceptance Criteria
- Reconnect attempts follow back‑off schedule.
- After reconnection, UI reflects the exact server state.
- UI shows a “Reconnecting…” indicator.

### Test Cases
1. Simulate network drop, verify `ws.on('close')` triggers reconnection attempts.
2. Mock successful reconnection and ensure `apiService.getGame` is called.
3. After max attempts, UI shows connection‑lost modal.

---
## 2. Optimistic UI Updates

### Problem
- Round‑trip latency makes UI feel sluggish.

### Solution
1. **Optimistic Action Dispatch**
   - When a player plays a card, immediately move the card in Redux state (`hand → field`).
   - Store a temporary `optimisticId` to match later server response.
2. **Rollback on Failure**
   - If server returns error (e.g., insufficient energy), revert state using the saved previous snapshot.
3. **Implementation Sketch** (in `frontend/src/store/gameSlice.ts`):
   ```ts
   export const playCardOptimistic = createAsyncThunk(
     'game/playCardOptimistic',
     async ({gameId, cardInstanceId}, {dispatch, getState, rejectWithValue}) => {
       // optimistic update
       dispatch(moveCardToField({cardInstanceId}));
       try {
         const newState = await apiService.playCard(gameId, cardInstanceId);
         return newState;
       } catch (e) {
         // rollback
         dispatch(rollbackToSnapshot());
         return rejectWithValue(e);
       }
     }
   );
   ```

### Acceptance Criteria
- UI updates instantly on card play.
- Errors cause a visible rollback animation.

### Test Cases
1. Mock successful API call – ensure final state matches server response.
2. Mock failure – verify rollback occurs and error toast appears.

---
## 3. State Machine Refactor (Command Pattern)

### Problem
- `GameEngine` is growing; switch‑case on phases becomes unmanageable.

### Solution
1. **Command Objects**
   - Create abstract `GameCommand` with `execute(state): GameState`.
   - Concrete commands: `PlayCardCommand`, `AttackCommand`, `PassCommand`, `SurrenderCommand`.
2. **Effect Resolver**
   - Separate `EffectResolver` that knows how to apply `DamageEffect`, `HealEffect`, etc.
3. **Phase Handlers**
   - Each phase implements an interface `PhaseHandler` with allowed commands.
   - `GameEngine` delegates to the current `PhaseHandler`.
4. **Implementation Sketch**:
   ```ts
   abstract class GameCommand { abstract execute(state: GameState): GameState; }
   class PlayCardCommand extends GameCommand { constructor(public cardId:string){ super(); }
     execute(state){ /* validation, move card, consume energy */ return newState; }
   }
   // EffectResolver
   class EffectResolver { static resolve(effect, target){ /* apply damage, heal, etc. */ } }
   ```

### Acceptance Criteria
- Adding a new card ability only requires a new `Effect` class, not changes to `GameEngine`.
- Phase‑specific rules are encapsulated.

### Test Cases
1. Unit test each command in isolation.
2. Verify that an illegal command in a given phase throws a `PhaseError`.
3. Ensure `EffectResolver` correctly updates HP/CE.

---
## 4. Documentation & Test Cases

- For every new feature, create a markdown file under `docs/` describing:
  - **Use‑case**
  - **Implementation notes** (code locations, APIs)
  - **Acceptance criteria**
  - **Automated test cases** (unit / integration)
- Example: `docs/UX_JUICE.md` (already created), `docs/WEBSOCKET_RECONNECT.md`, `docs/OPTIMISTIC_UI.md`, `docs/STATE_MACHINE.md`.

---
## 5. Continuous Integration

- Add GitHub Actions workflow to run `npm test` on push.
- Linting with `eslint` and `prettier` to keep code style consistent.

---
**Next Steps**
1. Implement reconnection logic in `websocket.ts`.
2. Add optimistic UI wrapper around `playCard` and `passAction`.
3. Refactor `GameEngine` to use command pattern (start with `PlayCardCommand`).
4. Write corresponding docs and test cases.
5. Update CI pipeline.
