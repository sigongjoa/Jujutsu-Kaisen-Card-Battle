/**
 * Main game board component
 */

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateGameState, setWaitingForOpponent } from '../store/gameSlice';
import { setCanPlayCards, setCanAttack } from '../store/uiSlice';
import { GamePhaseType, GameState } from '../types';
import { apiService } from '../services/api';
import { wsService } from '../services/websocket';
import CardView from './CardView';
import '../styles/GameBoard.css';

export const GameBoard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const gameState = useSelector((state: RootState) => state.game.gameState);
  const gameId = useSelector((state: RootState) => state.game.gameId);
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const [gameLoaded, setGameLoaded] = useState(false);

  useEffect(() => {
    if (!gameId || !userId) return;

    // Load initial game state
    const loadGame = async () => {
      try {
        const state = await apiService.getGame(gameId);
        dispatch(updateGameState(state));
        setGameLoaded(true);

        // Connect WebSocket
        try {
          const token = localStorage.getItem('token');
          if (token) {
            await wsService.connect(gameId, token);

            // Listen for game state updates
            wsService.on('GAME_STATE_UPDATE', (message) => {
              dispatch(updateGameState(message.data));
            });

            // Listen for phase changes
            wsService.on('PHASE_CHANGE', (message) => {
              // Update phase in game state
              if (gameState) {
                const updated = { ...gameState, currentPhase: message.data };
                dispatch(updateGameState(updated));
              }
            });
          }
        } catch (wsError) {
          console.error('WebSocket connection error:', wsError);
        }
      } catch (error) {
        console.error('Failed to load game:', error);
      }
    };

    loadGame();

    return () => {
      wsService.disconnect();
    };
  }, [gameId, userId, dispatch]);

  // Update UI based on phase
  useEffect(() => {
    if (!gameState || !userId) return;

    const isActivePlayer = gameState.currentPlayerIndex === 0; // Simplified

    switch (gameState.currentPhase.type) {
      case GamePhaseType.MAIN_A:
      case GamePhaseType.MAIN_B:
        dispatch(setCanPlayCards(isActivePlayer));
        dispatch(setCanAttack(false));
        break;

      case GamePhaseType.BATTLE:
        dispatch(setCanPlayCards(false));
        dispatch(setCanAttack(isActivePlayer));
        break;

      default:
        dispatch(setCanPlayCards(false));
        dispatch(setCanAttack(false));
        break;
    }

    dispatch(setWaitingForOpponent(!isActivePlayer));
  }, [gameState?.currentPhase, gameState?.currentPlayerIndex, userId, dispatch]);

  if (!gameLoaded || !gameState) {
    return <div className="game-board loading">Loading game...</div>;
  }

  const currentPlayer = gameState.players[userId];
  const opponent = Object.values(gameState.players).find(p => p.playerId !== userId);

  if (!currentPlayer || !opponent) {
    return <div className="game-board error">Game state error</div>;
  }

  return (
    <div className="game-board">
      {/* Opponent Info */}
      <div className="opponent-area">
        <div className="player-info opponent">
          <h2>{opponent.username}</h2>
          <div className="health-bar">
            <div
              className="health-fill"
              style={{ width: `${(opponent.currentHp / opponent.maxHp) * 100}%` }}
            />
            <span className="health-text">
              {opponent.currentHp} / {opponent.maxHp}
            </span>
          </div>
          <div className="cursed-energy">
            CE: {opponent.currentCursedEnergy} / {opponent.maxCursedEnergy}
          </div>
        </div>

        {/* Opponent Field */}
        <div className="opponent-field">
          <div className="deck-counter">{opponent.deck.count} Cards</div>
          <div className="field-cards">
            {opponent.field.map((card) => (
              <div key={card.cardInstanceId} className="opponent-card">
                [{card.cardId}]
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="phase-indicator">
        <div className="phase-badge">{gameState.currentPhase.type}</div>
        <div className="turn-counter">Turn {gameState.currentTurn}</div>
      </div>

      {/* Player Field */}
      <div className="player-field">
        <div className="field-cards">
          {currentPlayer.field.map((card) => (
            <div key={card.cardInstanceId} className="player-card">
              [{card.cardId}]
            </div>
          ))}
        </div>
      </div>

      {/* Player Info */}
      <div className="player-info self">
        <h2>{currentPlayer.username}</h2>
        <div className="health-bar">
          <div
            className="health-fill"
            style={{ width: `${(currentPlayer.currentHp / currentPlayer.maxHp) * 100}%` }}
          />
          <span className="health-text">
            {currentPlayer.currentHp} / {currentPlayer.maxHp}
          </span>
        </div>
        <div className="cursed-energy">
          CE: {currentPlayer.currentCursedEnergy} / {currentPlayer.maxCursedEnergy}
        </div>
      </div>

      {/* Hand */}
      <div className="hand">
        <div className="hand-cards">
          {currentPlayer.hand.map((card, index) => (
            <div key={card.cardInstanceId} className="hand-card">
              [{card.cardId}]
            </div>
          ))}
        </div>
        <div className="hand-info">{currentPlayer.hand.length} / 10 cards</div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={() => wsService.send('PASS', {})}
          className="btn btn-pass"
        >
          Pass
        </button>
        <button
          onClick={() => wsService.send('SURRENDER', {})}
          className="btn btn-surrender"
        >
          Surrender
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
