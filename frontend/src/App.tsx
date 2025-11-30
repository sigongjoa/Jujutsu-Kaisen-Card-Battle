import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import GameBoard from './components/GameBoard';
import { Card } from './components/card';
import { CardType } from './types';

// Mock Components with Logic for E2E Tests

const Login = () => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);

    console.log('Login component rendered');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted, navigating to /');
        // Simulate successful login/register
        navigate('/');
    };

    return (
        <div className="login-page">
            <h1>{isRegistering ? 'Register' : 'Login'}</h1>
            <form onSubmit={handleSubmit}>
                <input name="username" placeholder="Username" required />
                <input name="password" type="password" placeholder="Password" required />
                {isRegistering && <input name="email" placeholder="Email" />}
                <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
                <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? 'Switch to Login' : 'Switch to Register'}
                </button>
            </form>
        </div>
    );
};

const Dashboard = () => (
    <div className="dashboard">
        <h1>Dashboard</h1>
        <nav>
            <a href="/lobby">Lobby</a>
            <a href="/decks">Decks</a>
        </nav>
    </div>
);

const Lobby = () => {
    const navigate = useNavigate();
    const handleFindMatch = () => {
        // Simulate finding a match
        setTimeout(() => {
            navigate('/game');
        }, 500);
    };

    return (
        <div className="lobby">
            <h1>Lobby</h1>
            <button onClick={handleFindMatch}>Find Match</button>
        </div>
    );
};

const Decks = () => {
    const [decks, setDecks] = useState<string[]>([]);
    const [deckName, setDeckName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const mockCardData = {
        cardId: 'mock-1',
        name: 'Itadori Yuji',
        type: CardType.JUJUTSU_USER,
        cost: 3,
        stats: { atk: 5, def: 4, maxHp: 10 },
        keywords: ['Black Flash'],
        description: 'Deals double damage on critical hit.'
    };

    const handleSaveDeck = () => {
        if (deckName) {
            setDecks([...decks, deckName]);
            setIsCreating(false);
            setDeckName('');
        }
    };

    return (
        <div className="decks">
            <h1>Decks</h1>
            {!isCreating ? (
                <button onClick={() => setIsCreating(true)}>Create New Deck</button>
            ) : (
                <div className="deck-creator">
                    <input
                        name="deckName"
                        placeholder="Deck Name"
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                    />
                    <div className="card-selection">
                        {/* Use the real Card component for visual verification */}
                        <div className="card-item" onClick={() => { }}>
                            <Card data={mockCardData} scale={0.8} />
                        </div>
                        <div className="card-item" onClick={() => { }}>
                            <Card data={{ ...mockCardData, name: 'Gojo Satoru', cost: 10, stats: { atk: 99, def: 99, maxHp: 99 } }} scale={0.8} />
                        </div>
                    </div>
                    <button onClick={handleSaveDeck}>Save Deck</button>
                </div>
            )}
            <div className="deck-list">
                {decks.map((deck, i) => (
                    <div key={i} className="deck-item">{deck}</div>
                ))}
            </div>
        </div>
    );
};

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
