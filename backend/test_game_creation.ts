
import { GameEngine } from './src/services/GameEngine';
import { v4 as uuidv4 } from 'uuid';

try {
    console.log('Testing GameEngine creation...');
    const gameId = uuidv4();
    const matchId = uuidv4();
    const userId = 'test-user';
    const opponentId = 'test-opponent';

    console.log('IDs:', { gameId, matchId, userId, opponentId });

    const engine = new GameEngine(gameId, matchId, userId, opponentId);
    console.log('GameEngine created successfully!');
    console.log('Initial State:', JSON.stringify(engine.getGameState(), null, 2));
} catch (error) {
    console.error('Failed to create GameEngine:', error);
}
