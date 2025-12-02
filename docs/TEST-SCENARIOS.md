# Test Scenarios & Cases

This document outlines the critical test cases required to verify the system's robustness, security, and stability.

## 1. Recovery & Integrity

### TC-RECOVERY-01: Game State Snapshot Integrity
**Objective**: Verify that the data sent on reconnection matches the server's truth and is properly sanitized.
*   **Setup**: Create a mock game. Place 3 cards on field. Set HP to 15.
*   **Action**: Call `GameEngine.serializeState(playerId)`.
*   **Verification**:
    1.  `currentHp` is 15.
    2.  **Fog of War**: My hand is visible; Opponent's hand is `HIDDEN` (masked).
    3.  Field card positions match exactly.
    4.  `sequenceId` matches the server's last processed ID.

## 2. Concurrency & Logic

### TC-CONCURRENCY-01: Double Spending Prevention
**Objective**: Verify that a player cannot spend more resources than they have via parallel requests.
*   **Setup**: Player has 5 Cursed Energy (CE). Card Cost is 5.
*   **Action**: Send two simultaneous `playCard` requests via `Promise.all()`.
*   **Verification**:
    1.  **Request 1**: Returns `200 OK` (Success). CE becomes 0.
    2.  **Request 2**: Returns `400 Bad Request` (Insufficient CE or Invalid State).
    3.  **Final State**: CE is 0 (NOT -5). Card is played once.

## 3. Observability

### TC-OBSERVABILITY-01: Error Tracing
**Objective**: Ensure exceptions produce traceable logs.
*   **Action**: Trigger a forced exception (e.g., `attack(targetId: "non-existent")`).
*   **Verification**: Check Server Logs.
    1.  Log Level is `ERROR`.
    2.  `trace_id` is present.
    3.  `game_id` and `player_id` are captured.
    4.  Stack trace is included.

## 4. Live Operations

### TC-LIVEOPS-01: Hotfix Data Reflection
**Objective**: Verify dynamic data updates without downtime.
*   **Setup**: 'Yuto Kim' card has ATK 3.
*   **Action**:
    1.  Start a game, check 'Yuto Kim' stats.
    2.  Update DB: Set 'Yuto Kim' ATK to 5.
    3.  Trigger `CardService.refreshCache()`.
    4.  Play 'Yuto Kim' again in a new/existing game.
*   **Verification**: The card instance now has ATK 5.
