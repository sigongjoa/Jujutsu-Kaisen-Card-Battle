import React from 'react';

interface CardCharacterProps {
    characterId: string; // e.g., 'itadori', 'gojo'
    name: string;
}

export const CardCharacter: React.FC<CardCharacterProps> = ({ characterId, name }) => {
    // Map ID to asset path
    // Note: Using .jpg for now as per current assets, but should be .png in future
    const imagePath = `/assets/cards/characters/${characterId.toLowerCase()}.jpg`;

    return (
        <div className="card-layer layer-character">
            <img
                src={imagePath}
                alt={name}
                className="character-art"
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'; // Hide if missing
                }}
            />
        </div>
    );
};
