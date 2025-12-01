import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { setGameId } from '../store/gameSlice';
import { apiService } from '../services/api';
import { MenuButton } from '../components/MenuButton';
import './Dashboard.css';

export const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleQuickMatch = async () => {
        try {
            setErrorMsg(null);
            console.log('Starting Quick Match...');
            // Create a game against a mock opponent
            const game = await apiService.createGame('mock-opponent-id');
            console.log('Game Created:', game);

            dispatch(setGameId(game.gameId));

            // Start the game immediately
            await apiService.startGame(game.gameId);
            console.log('Game Started');

            navigate('/game');
        } catch (error: any) {
            console.error('Failed to start game:', error);
            setErrorMsg(`Failed to start game: ${error.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="dashboard-page">
            {errorMsg && <div style={{ position: 'absolute', top: 0, left: 0, background: 'red', color: 'white', padding: '10px', zIndex: 1000 }}>{errorMsg}</div>}

            {/* Layer 1: Background & Logo */}
            <div className="dashboard-background" style={{ backgroundImage: "url('/assets/main_page/bg.jpg')" }}></div>
            <img src="/assets/logo.png" alt="Jujutsu Kaisen Logo" className="dashboard-logo" />

            {/* Layer 2: Menu Container */}
            <div className="dashboard-menu-container" style={{ backgroundImage: "url('/assets/main_page/container_frame.jpg')" }}>

                {/* Layer 3 & 4: Menu Buttons */}
                <MenuButton
                    type="lobby"
                    label="QUICK MATCH"
                    icon={<span>⚔️</span>}
                    onClick={handleQuickMatch}
                />

                <MenuButton
                    type="decks"
                    label="DECKS"
                    icon={<span>🃏</span>}
                    onClick={() => navigate('/decks')}
                />

                <MenuButton
                    type="shop"
                    label="SHOP"
                    icon={<span>💰</span>}
                    onClick={() => console.log('Shop Clicked')}
                />

                <MenuButton
                    type="profile"
                    label="PROFILE"
                    icon={<span>👤</span>}
                    onClick={() => console.log('Profile Clicked')}
                />

                <MenuButton
                    type="settings"
                    label="SETTINGS"
                    icon={<span>⚙️</span>}
                    onClick={() => console.log('Settings Clicked')}
                />

                <MenuButton
                    type="logout"
                    label="LOGOUT"
                    icon={<span>🚪</span>}
                    onClick={handleLogout}
                />
            </div>
        </div>
    );
};
