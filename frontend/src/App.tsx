import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from './store/authSlice';
import { RootState } from './store';
import GameBoard from './components/GameBoard';
import { Login, Dashboard, Decks } from './pages';

function App() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !isAuthenticated) {
            // Restore mock session for now
            dispatch(loginSuccess({
                user: {
                    userId: 'mock-id',
                    username: 'Guest',
                    displayName: 'Guest',
                    bio: 'Mock Bio',
                    avatar: '',
                    totalGames: 0,
                    totalWins: 0,
                    eloRating: 1200,
                    joinedAt: new Date()
                },
                token: token
            }));
        }
    }, [dispatch, isAuthenticated]);

    return (
        <div className="App">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />

                <Route path="/decks" element={<Decks />} />
                <Route path="/game" element={<GameBoard />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;
