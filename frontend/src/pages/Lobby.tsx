import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { apiService } from '../services/api';
import { setGameId, setLoading, setError } from '../store/gameSlice';

export const Lobby = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [opponentId, setOpponentId] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleCreateGame = async () => {
        if (!opponentId) {
            alert('Please enter an opponent ID (or "bot" for testing)');
            return;
        }

        dispatch(setLoading(true));
        try {
            const game = await apiService.createGame(opponentId);
            dispatch(setGameId(game.gameId));
            navigate('/game');
        } catch (err: any) {
            console.error('Failed to create game:', err);
            dispatch(setError(err.response?.data?.message || 'Failed to create game'));
            alert('Failed to create game. Backend might not be ready.');
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleFindMatch = () => {
        setIsSearching(true);
        // Mock matchmaking for now as API doesn't seem to have a queue endpoint
        setTimeout(() => {
            setIsSearching(false);
            alert('Matchmaking not implemented in backend yet. Please use "Create Game" with an opponent ID.');
        }, 2000);
    };

    return (
        <div className="lobby">
            <h1>Lobby</h1>
            <div className="lobby-actions">
                <div className="matchmaking-section">
                    <button onClick={handleFindMatch} disabled={isSearching}>
                        {isSearching ? 'Searching...' : 'Find Match'}
                    </button>
                </div>

                <div className="divider">OR</div>

                <div className="challenge-section">
                    <input
                        placeholder="Opponent ID"
                        value={opponentId}
                        onChange={(e) => setOpponentId(e.target.value)}
                    />
                    <button onClick={handleCreateGame}>Challenge Player</button>
                </div>
            </div>
        </div>
    );
};
