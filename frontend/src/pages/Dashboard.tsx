import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const Dashboard = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            {user && <p>Welcome, {user.displayName || user.username}!</p>}
            <nav>
                <Link to="/lobby">Lobby</Link>
                <Link to="/decks">Decks</Link>
            </nav>
        </div>
    );
};
