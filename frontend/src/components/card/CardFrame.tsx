import React from 'react';
import '../../styles/Card.css';

interface CardFrameProps {
    faction?: string; // e.g., 'SORCERER', 'CURSE'
    rarity?: string;
}

export const CardFrame: React.FC<CardFrameProps> = ({ faction = 'SORCERER' }) => {
    // Placeholder: In the future, map faction to specific frame images
    // const frameImage = `/assets/cards/frames/${faction.toLowerCase()}_frame.png`;

    return (
        <div className={`card-layer layer-frame frame-${faction.toLowerCase()}`}>
            {/* <img src={frameImage} alt="Frame" /> */}
            <div className="frame-border-placeholder" />
        </div>
    );
};
