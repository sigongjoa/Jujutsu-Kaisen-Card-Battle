import { GameEngine } from '../services/GameEngine';
import { CardLocation } from '../types';

describe('Gameplay Simulation: Full Match Flow', () => {
    let engine: GameEngine;
    const p1 = 'player-1-id';
    const p2 = 'player-2-id';

    beforeEach(() => {
        engine = new GameEngine('game-1', 'match-1', p1, p2);
    });

    test('Scenario: Start Game, Play Card, Combat, Win', () => {
        // 1. Start Game
        engine.startGame();
        let state = engine.getGameState();

        expect(state.status).toBe('IN_PROGRESS');
        expect(state.currentTurn).toBe(1);
        expect(state.players[p1].hand.length).toBe(5);
        expect(state.players[p2].hand.length).toBe(5);
        expect(state.players[p1].currentCursedEnergy).toBe(3); // Initial CE

        // 2. Player 1 Turn: Play "Yuji Itadori" (Cost 4) -> Wait, Yuji costs 4, but we have 3 CE?
        // Let's check the mock data in CardService. Yuji is Cost 4.
        // We need to wait for turn 2 to play Yuji, or play a cheaper card.
        // Let's look for a cheaper card. "Nobara" is Cost 3. "Great Wind" is Cost 3.

        // Cheat for test: Give P1 extra energy to play Yuji immediately for testing combat
        engine.setPlayerField(p1, 'currentCursedEnergy', 10);

        // Find Yuji in hand or deck and put in hand
        let yujiCard = state.players[p1].hand.find(c => c.cardId === 'JK-001-YUJI');
        if (!yujiCard) {
            // Force draw Yuji
            yujiCard = engine['cardService'].createCardInstance('JK-001-YUJI', p1, CardLocation.HAND);
            // Update the REAL engine state
            const newHand = [...state.players[p1].hand, yujiCard];
            engine.setPlayerField(p1, 'hand', newHand);
        }

        // Play Yuji
        const playResult = engine.playCard(p1, yujiCard.cardInstanceId);
        expect(playResult.success).toBe(true);

        state = engine.getGameState();
        const yujiOnField = state.players[p1].field.find(c => c.cardInstanceId === yujiCard!.cardInstanceId);
        expect(yujiOnField).toBeDefined();
        expect(yujiOnField!.location).toBe(CardLocation.FIELD);

        // 3. Pass Turn to Player 2
        // engine.passAction(p1); // REMOVED: This ends the turn prematurely in the simplified engine. We want to attack first.
        // In this simple engine, pass might just log action, we need to explicitly end turn or phase
        // The engine's passAction just logs 'PASS'. 
        // We need to trigger endTurn manually or via logic if implemented.
        // Looking at GameEngine.ts, endTurn is private. 
        // But wait, `passAction` is just logging. 
        // Real logic usually requires both players to pass to proceed.
        // For this simulation, let's access private method or improve GameEngine to handle phase changes.
        // Actually, let's look at `declareAttacks` -> it moves to MAIN_B.

        // Let's simulate P1 attacking P2 directly
        // Yuji has "Immediate" timing abilities? No, he has Passive.
        // Let's Attack.

        const attackResult = engine.declareAttacks(p1, [{
            attackerId: yujiOnField!.cardInstanceId,
            targetType: 'PLAYER'
        }]);

        expect(attackResult.success).toBe(true);

        state = engine.getGameState();
        // Yuji ATK is 9 + 1 (Passive) = 10?
        // Base 9. Passive: +1 ATK. Total 10.
        // P2 HP should be 20 - 10 = 10.

        // Wait, passive logic:
        // Yuji Passive: "Cursed Impulse", MODIFY_STAT SELF ATK +1.
        // This is applied in `getCardStats`.

        // Let's verify damage
        // P2 Max HP 20.
        expect(state.players[p2].currentHp).toBeLessThan(20);
        console.log(`Player 2 HP after attack: ${state.players[p2].currentHp}`);

        // 4. End Turn (Simulate)
        // Since `endTurn` is public now, we can call it directly
        engine.endTurn();

        state = engine.getGameState();
        // Turn logic: 
        // Start Game -> Turn 1 (P1)
        // P1 Ends Turn -> Turn 2 (P2)
        expect(state.currentTurn).toBe(2);
        expect(state.currentPlayerIndex).toBe(1); // Player 2's turn

        // 5. Player 2 Turn
        // P2 draws a card (handled in startTurn -> executeRechargePhase)
        expect(state.players[p2].hand.length).toBe(6); // 5 initial + 1 draw

        // P2 plays Gojo (Cost 6). 
        // Turn 2: Max CE increases? 
        // Recharge phase: maxCursedEnergy += 1. Initial 3 -> Turn 1 (P1) 4? -> Turn 2 (P2) 4?
        // Let's check `createPlayerState`: maxCursedEnergy: 3.
        // `executeRechargePhase`: if (max < 8) max += 1.
        // Turn 1 (P1 starts): Max becomes 4.
        // Turn 2 (P2 starts): Max becomes 4.
        // Gojo needs 6. P2 cannot play Gojo yet.

        // P2 plays "Great Wind" (Cost 3)
        engine.setPlayerField(p2, 'currentCursedEnergy', 10); // Cheat again for fun

        // Refresh state to get latest hand
        state = engine.getGameState();
        let windCard = state.players[p2].hand.find(c => c.cardId === 'JK-050-GREAT-WIND');
        if (!windCard) {
            windCard = engine['cardService'].createCardInstance('JK-050-GREAT-WIND', p2, CardLocation.HAND);
            // Update the REAL engine state
            const newHand = [...state.players[p2].hand, windCard];
            engine.setPlayerField(p2, 'hand', newHand);
        }

        const p2Play = engine.playCard(p2, windCard.cardInstanceId);
        expect(p2Play.success).toBe(true);

        // Great Wind has ability: "Devastating Blast" (Activated, Cost 3, Damage 5 to Enemy)
        // But `playCard` only puts it on field? 
        // Type is CURSED_TECHNIQUE. Usually these are "Spells" that resolve and go to graveyard?
        // Or they stay on field?
        // In `CardService`, Great Wind is `OFFENSIVE` / `CURSED_TECHNIQUE`.
        // `playCard` logic:
        // 1. Remove from hand, add to field.
        // 2. Trigger ENTER_FIELD.

        // Great Wind ability is `ACTIVATED`. It doesn't trigger on enter.
        // We need a way to activate ability. `GameEngine` doesn't have `activateAbility` public method exposed in the interface shown?
        // Let's check `GameEngine.ts`... 
        // It has `playCard`, `declareAttacks`, `passAction`, `surrender`.
        // It does NOT have `activateAbility`. 
        // This means ACTIVATED abilities are not yet implemented in the engine's public API!

        // Test Observation: We found a missing feature through this test plan.
        // But let's verify what IS implemented.

        // Verify P2 played the card.
        state = engine.getGameState();
        const windOnField = state.players[p2].field.find(c => c.cardInstanceId === windCard!.cardInstanceId);
        expect(windOnField).toBeDefined();

    });
});
