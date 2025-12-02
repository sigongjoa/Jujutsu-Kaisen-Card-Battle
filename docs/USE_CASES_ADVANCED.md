# Advanced Use Cases (Resilience & Concurrency)

This document defines complex scenarios focusing on system stability, network issues, and concurrency, beyond simple gameplay features.

## UC-GAME-05: Reconnection & State Recovery
**Goal**: Seamlessly recover the game state after a network disconnect without penalizing the user immediately.

### Pre-conditions
1.  User A and User B are in a match (e.g., Turn 3, MAIN_A).
2.  User A's socket connection drops.

### Main Flow
1.  **Detection**: Server detects User A's socket disconnect.
2.  **Grace Period**: Server marks User A as `DISCONNECTED` and starts a `RECONNECT_TIMER` (60s).
3.  **Notification**: Server notifies User B ("Opponent disconnected. Waiting...").
4.  **Reconnection**: User A restarts the app and connects within 30s.
5.  **Validation**: Server verifies User A's token and finds the active `game_id`.
6.  **Restoration**: Server sends a **Sanitized GameState Snapshot** and recent **History Log**.
7.  **Resumption**: Client restores the UI. Game resumes immediately from the exact point of interruption.

### Exception Flow
*   **E1. Timeout**: If User A does not return within 60s, Server declares User A lost (Time Loss) and ends the game.

---

## UC-SYS-02: Concurrency Control (Anti-Double Spending)
**Goal**: Prevent "Double Actions" (e.g., attacking twice with the same card) due to rapid clicks or network lag.

### Main Flow
1.  **Request 1**: User A sends `ATTACK` with Card C-001.
2.  **Request 2**: User A sends `ATTACK` with Card C-001 again (0.05s later).
3.  **Locking**: Server receives Request 1. Uses **Redis Lock** or **DB Transaction** to mark C-001 as `PROCESSING`.
4.  **Execution**: Server processes Request 1 (calculates damage, taps card).
5.  **Rejection**: Server receives Request 2. Checks C-001 state.
    *   Result: Card is already Tapped OR Locked.
6.  **Response**: Server rejects Request 2 with `ACTION_ALREADY_TAKEN` or ignores it.
7.  **Outcome**: Damage is applied exactly once.

---

## UC-LIVEOPS-01: Hotfix Data Patch
**Goal**: Update card balance data (e.g., ATK value) without restarting the server.

### Main Flow
1.  **Issue**: 'Yuto Kim' card is found to be too weak (ATK 3).
2.  **Update**: Admin updates the value to ATK 5 in the Database/CMS.
3.  **Signal**: Admin triggers a `REFRESH_CACHE` event (via API or Pub/Sub).
4.  **Reload**: Game Servers receive the signal and reload 'Yuto Kim' data from DB to Memory.
5.  **Verification**: Next time 'Yuto Kim' is played, it has ATK 5.
