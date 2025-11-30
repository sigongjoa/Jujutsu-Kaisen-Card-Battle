import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GameBoard from './components/GameBoard';
import { Login, Dashboard, Lobby, Decks } from './pages';

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/decks" element={<Decks />} />
                <Route path="/game" element={<GameBoard />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;
