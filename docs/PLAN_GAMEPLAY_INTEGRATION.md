# Gameplay Integration Plan

## Overview
This document outlines the steps to integrate the frontend and backend for the core gameplay loop of "Jujutsu Kaisen Card Battle". The goal is to enable a complete flow from game creation to playing cards and synchronizing state.

## Current State
- **Backend**:
    - REST API endpoints for Game (`create`, `start`, `play`, `attack`, `pass`) are implemented in `game.ts`.
    - `GameEngine` handles logic.
    - **Gap**: WebSocket server is initialized but not wired up to broadcast game state updates.
- **Frontend**:
    - `GameBoard` component exists and renders based on `gameState`.
    - `apiService` has methods for game actions.
    - `wsService` exists but needs a working backend counterpart.
    - **Gap**: No way to start a game from the UI (Lobby).
    - **Gap**: Card interactions (clicking/dragging to play) are not implemented in `GameBoard`.

## Implementation Steps

### Phase 1: Game Initialization (Lobby -> Game)
1.  **Update Dashboard/Lobby**:
    -   Add a "Start Game" button to the Dashboard (or a dedicated Lobby section).
    -   Implement `handleStartGame` function:
        -   Call `api.createGame(opponentId)`.
        -   Dispatch `setGameId` to Redux.
        -   Navigate to `/game`.
2.  **Backend Game Creation**:
    -   Ensure `createGame` endpoint initializes the `GameEngine` correctly.

### Phase 2: Real-time State Synchronization (WebSocket)
1.  **Backend WebSocket Implementation**:
    -   Create a `WebSocketManager` class in the backend.
    -   Integrate it with `index.ts` to handle connections.
    -   Map `ws` connections to `userId` and `gameId`.
    -   Modify `GameEngine` or `GameController` to emit events to `WebSocketManager` whenever the state changes (e.g., after `playCard`, `passTurn`).
2.  **Frontend WebSocket Connection**:
    -   Verify `wsService.connect` establishes a connection.
    -   Ensure `GameBoard` listens for `GAME_STATE_UPDATE` and dispatches `updateGameState`.

### Phase 3: Player Actions (Frontend)
1.  **Play Card Interaction**:
    -   Update `CardView` to handle clicks or drag events.
    -   In `GameBoard`, implement `handlePlayCard(cardId)`:
        -   Call `api.playCard(gameId, cardId, targets)`.
        -   Optimistically update UI or wait for WS update.
2.  **Pass Turn**:
    -   Verify "Pass" button calls `api.passAction(gameId)`.

### Phase 4: Visual Feedback
1.  **State Reflection**:
    -   Ensure HP, Cursed Energy, and Hand/Field cards update automatically via the Redux state driven by WS updates.
    -   Add visual cues for "My Turn" vs "Opponent's Turn".

## Technical Specifications

### WebSocket Events
-   **Server -> Client**:
    -   `GAME_STATE_UPDATE`: Full `GameState` object.
    -   `ERROR`: Error message.
-   **Client -> Server** (Optional, if not using REST for actions):
    -   `JOIN_GAME`: Handshake to identify user.

### API Integration
-   **Play Card**: `POST /api/game/:gameId/play`
    -   Body: `{ cardInstanceId: string, targetIds: string[] }`
-   **Pass Turn**: `POST /api/game/:gameId/pass`

## Testing Strategy
1.  **Manual Test**:
    -   Open two browser windows (or use Postman for one player).
    -   Start game.
    -   Player A plays card -> Verify Player B sees it via WS.
    -   Player A passes -> Verify turn changes to Player B.
