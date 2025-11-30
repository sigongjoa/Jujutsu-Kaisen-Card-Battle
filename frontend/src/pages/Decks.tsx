import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Card } from '../components/card';
import { CardType } from '../types';

import { CARD_DATABASE } from '../data/cards';

const AVAILABLE_CARDS = Object.values(CARD_DATABASE);

export const Decks = () => {
    const [decks, setDecks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Creation state
    const [newDeckName, setNewDeckName] = useState('');
    const [selectedCards, setSelectedCards] = useState<any[]>([]);

    useEffect(() => {
        fetchDecks();
    }, []);

    const fetchDecks = async () => {
        setLoading(true);
        try {
            const data = await apiService.getDecks();
            setDecks(data);
        } catch (err) {
            console.error('Failed to fetch decks:', err);
            // Fallback to empty or mock if backend fails
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDeck = async () => {
        if (!newDeckName) return;

        try {
            // Convert selected cards to DeckListItem format expected by API
            const deckListItems = selectedCards.map(card => ({
                cardId: card.cardId,
                quantity: 1 // Simple quantity for now
            }));

            await apiService.createDeck(newDeckName, 'Created via Frontend', deckListItems);
            setIsCreating(false);
            setNewDeckName('');
            setSelectedCards([]);
            fetchDecks(); // Refresh list
        } catch (err) {
            console.error('Failed to save deck:', err);
            alert('Failed to save deck');
        }
    };

    const toggleCardSelection = (card: any) => {
        if (selectedCards.find(c => c.cardId === card.cardId)) {
            setSelectedCards(selectedCards.filter(c => c.cardId !== card.cardId));
        } else {
            setSelectedCards([...selectedCards, card]);
        }
    };

    return (
        <div className="decks-page">
            <h1>Decks</h1>

            {!isCreating ? (
                <>
                    <button onClick={() => setIsCreating(true)}>Create New Deck</button>
                    <div className="deck-list">
                        {loading ? <p>Loading...</p> : decks.length === 0 ? <p>No decks found.</p> : (
                            decks.map((deck: any) => (
                                <div key={deck.id} className="deck-item">
                                    <h3>{deck.name}</h3>
                                    <p>{deck.description}</p>
                                    <p>Cards: {deck.cards?.length || 0}</p>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="deck-creator">
                    <div className="creator-header">
                        <input
                            placeholder="Deck Name"
                            value={newDeckName}
                            onChange={(e) => setNewDeckName(e.target.value)}
                        />
                        <button onClick={handleSaveDeck}>Save Deck</button>
                        <button onClick={() => setIsCreating(false)}>Cancel</button>
                    </div>

                    <div className="card-selection-grid">
                        {AVAILABLE_CARDS.map(card => (
                            <div
                                key={card.cardId}
                                className={`card-item ${selectedCards.find(c => c.cardId === card.cardId) ? 'selected' : ''}`}
                                onClick={() => toggleCardSelection(card)}
                                style={{ cursor: 'pointer', border: selectedCards.find(c => c.cardId === card.cardId) ? '2px solid gold' : 'none' }}
                            >
                                <Card data={card} scale={0.8} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
