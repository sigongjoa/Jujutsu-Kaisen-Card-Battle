import { configureStore } from '@reduxjs/toolkit';
import gameReducer, { optimisticPlayCard, rollbackGameState } from '../gameSlice';
import { GameState } from '../../types';

const mockGameState: GameState = {
    gameId: 'g1',
    players: {
        'p1': {
            playerId: 'p1',
            username: 'Player 1',
            hp: 20,
            maxHp: 20,
            cursedEnergy: 10,
            maxCursedEnergy: 10,
            hand: [
                { cardInstanceId: 'c1', cardId: 'JK-001', ownerId: 'p1', location: 'HAND', position: 0 } as any
            ],
            field: [],
            deck: [],
            graveyard: [],
            banished: [],
            currentHp: 20,
            currentCursedEnergy: 10
        }
    },
    currentTurn: 1,
    currentPhase: { type: 'MAIN_A', step: 'START', priority: 'P1' } as any,
    currentPlayerIndex: 0,
    winner: null,
    turnHistory: []
};

test('optimisticPlayCard moves card immediately', () => {
    const store = configureStore({ reducer: { game: gameReducer } });

    // Set initial state
    store.dispatch({ type: 'game/updateGameState', payload: mockGameState });

    // Dispatch optimistic play
    store.dispatch(optimisticPlayCard({ cardInstanceId: 'c1', userId: 'p1' }));

    const state = store.getState().game;
    const player = state.gameState!.players['p1'];

    // Card should be in field, not hand
    expect(player.hand).toHaveLength(0);
    expect(player.field).toHaveLength(1);
    expect(player.field[0].cardInstanceId).toBe('c1');

    // Backup should exist
    expect(state.optimisticBackup).toBeDefined();
    expect(state.optimisticBackup!.players['p1'].hand).toHaveLength(1);
});

test('rollback restores previous state on failure', () => {
    const store = configureStore({ reducer: { game: gameReducer } });

    store.dispatch({ type: 'game/updateGameState', payload: mockGameState });
    store.dispatch(optimisticPlayCard({ cardInstanceId: 'c1', userId: 'p1' }));

    // Verify change happened
    let state = store.getState().game;
    expect(state.gameState!.players['p1'].field).toHaveLength(1);

    // Rollback
    store.dispatch(rollbackGameState());

    state = store.getState().game;
    // Should be back to initial
    expect(state.gameState!.players['p1'].hand).toHaveLength(1);
    expect(state.gameState!.players['p1'].field).toHaveLength(0);
    expect(state.optimisticBackup).toBeUndefined();
});
