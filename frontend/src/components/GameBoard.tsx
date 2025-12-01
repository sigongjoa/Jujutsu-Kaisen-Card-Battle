/**
 * Main game board component
 */

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateGameState } from '../store/gameSlice';
import { setCanPlayCards, setCanAttack, setWaitingForOpponent } from '../store/uiSlice';
import { GamePhaseType, GameState } from '../types';
import { apiService } from '../services/api';
import { wsService } from '../services/websocket';
import CardView from './CardView';
import { getCardData } from '../data/cards';
import '../styles/GameBoard.css';

export const GameBoard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const gameState = useSelector((state: RootState) => state.game.gameState);
  const gameId = useSelector((state: RootState) => state.game.gameId);
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const [gameLoaded, setGameLoaded] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setErrorMsg("Missing User ID");
      return;
    }
    if (!gameId) {
      setErrorMsg("Missing Game ID");
      return;
    }

    // Load initial game state
    const loadGame = async () => {
      try {
        console.log('Fetching game state for:', gameId);
        const state = await apiService.getGame(gameId);
        console.log('Game state received:', state);

        dispatch(updateGameState(state));
        console.log('Game state dispatched');

        setGameLoaded(true);
        console.log('Game loaded set to true');

        // Connect WebSocket
        try {
          const token = localStorage.getItem('token');
          if (token) {
            console.log('Connecting WebSocket...');
            await wsService.connect(gameId, token);
            console.log('WebSocket connected');

            // Listen for game state updates
            wsService.on('GAME_STATE_UPDATE', (message) => {
              console.log('WS: Game State Update', message.data);
              dispatch(updateGameState(message.data));
            });

            // Listen for phase changes
            wsService.on('PHASE_CHANGE', (message) => {
              console.log('WS: Phase Change', message.data);
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
      } catch (error: any) {
        console.error('Failed to load game:', error);
        setErrorMsg(`Failed to load game: ${error.message || 'Unknown error'}`);
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

  if (errorMsg) {
    return <div className="game-board error">{errorMsg}</div>;
  }

  if (!gameLoaded || !gameState || !userId) {
    return <div className="game-board loading">Loading game... (ID: {gameId}, User: {userId})</div>;
  }

  const currentPlayer = gameState.players[userId];
  const opponent = Object.values(gameState.players).find(p => p.playerId !== userId);

  if (!currentPlayer || !opponent) {
    return <div className="game-board error">Game state error</div>;
  }

  const handleCardClick = async (cardInstanceId: string) => {
    if (!gameId || !userId) return;

    // Simple play logic for now: click to play
    // In real game, we'd select, then choose targets
    try {
      console.log('Playing card:', cardInstanceId);
      const newState = await apiService.playCard(gameId, cardInstanceId);
      dispatch(updateGameState(newState));
    } catch (error) {
      console.error('Failed to play card:', error);
      alert('Failed to play card');
    }
  };

  const handlePass = async () => {
    if (!gameId) return;
    try {
      const newState = await apiService.passAction(gameId);
      dispatch(updateGameState(newState));
    } catch (error) {
      console.error('Failed to pass:', error);
    }
  };

  const handleSurrender = async () => {
    if (!gameId) return;
    try {
      const newState = await apiService.surrender(gameId);
      dispatch(updateGameState(newState));
    } catch (error) {
      console.error('Failed to surrender:', error);
    }
  };

  return (
    <div className="game-board">
      {/* Layer 1: Background */}
      <div className="layer-background" style={{ backgroundImage: "url('/assets/play_scene/bg.jpg')" }} />


      {/* Layer 2: Arena Lines */}
      <div className="layer-arena">
        <div className="arena-overlay" style={{ backgroundImage: "url('/assets/play_scene/arena_lines_overlay.jpg')" }} />
      </div>

      {/* Layer 3: Game Objects (Field & Hand) */}
      <div className="layer-content">
        {/* Opponent Field Area */}
        <div className="field-area opponent-field-area">
          <div className="field-cards">
            {opponent.field.map((card) => (
              <div key={card.cardInstanceId} className="card-wrapper">
                <CardView
                  card={getCardData(card.cardId)}
                  instance={card}
                  scale={0.6}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center Area (Phase & Turn) */}
        <div className="center-area">
          <div className="phase-indicator">
            <div className="phase-badge">{gameState.currentPhase.type}</div>
            <div className="turn-counter">Turn {gameState.currentTurn}</div>
          </div>
        </div>

        {/* Player Field Area */}
        <div className="field-area player-field-area">
          <div className="field-cards">
            {currentPlayer.field.map((card) => (
              <div key={card.cardInstanceId} className="card-wrapper">
                <CardView
                  card={getCardData(card.cardId)}
                  instance={card}
                  scale={0.7}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Player Hand Area */}
        <div className="hand-area">
          <div className="hand-cards">
            {currentPlayer.hand.map((card) => (
              <div key={card.cardInstanceId} className="card-wrapper hand-card-wrapper">
                <CardView
                  card={getCardData(card.cardId)}
                  instance={card}
                  scale={0.8}
                  onClick={() => handleCardClick(card.cardInstanceId)}
                />
                {/* VFX: Active Card Glow */}
                <div className="active-card-glow" style={{ backgroundImage: "url('/assets/play_scene/active_card_glow.jpg')" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layer 4: HUD (Player Info Frames) */}
      <div className="layer-hud">
        {/* Opponent HUD */}
        <div className="hud-frame opponent-hud">
          <div className="hud-bg" style={{ backgroundImage: "url('/assets/play_scene/frame_player_info.jpg')" }} />
          <div className="hud-content">
            <div className="hud-avatar">
              {/* Placeholder for Avatar */}
              <div className="avatar-circle" />
            </div>
            <div className="hud-stats">
              <div className="hud-name">{opponent.username}</div>
              <div className="hud-hp-bar">
                <div className="hp-fill" style={{ width: `${(opponent.currentHp / opponent.maxHp) * 100}%` }} />
                <span className="hp-text">{opponent.currentHp}/{opponent.maxHp}</span>
              </div>
              <div className="hud-ce">
                CE: {opponent.currentCursedEnergy}/{opponent.maxCursedEnergy}
              </div>
            </div>
          </div>
        </div>

        {/* Player HUD */}
        <div className="hud-frame player-hud">
          <div className="hud-bg" style={{ backgroundImage: "url('/assets/play_scene/frame_player_info.jpg')" }} />
          <div className="hud-content">
            <div className="hud-avatar">
              {/* Placeholder for Avatar */}
              <div className="avatar-circle" />
            </div>
            <div className="hud-stats">
              <div className="hud-name">{currentPlayer.username}</div>
              <div className="hud-hp-bar">
                <div className="hp-fill" style={{ width: `${(currentPlayer.currentHp / currentPlayer.maxHp) * 100}%` }} />
                <span className="hp-text">{currentPlayer.currentHp}/{currentPlayer.maxHp}</span>
              </div>
              <div className="hud-ce">
                CE: {currentPlayer.currentCursedEnergy}/{currentPlayer.maxCursedEnergy}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Overlay on HUD layer) */}
        <div className="hud-actions">
          <button onClick={handlePass} className="btn btn-pass">Pass</button>
          <button onClick={handleSurrender} className="btn btn-surrender">Surrender</button>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
