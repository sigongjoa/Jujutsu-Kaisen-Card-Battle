import React from 'react';
import { CardFrame } from './CardFrame';
import { CardCharacter } from './CardCharacter';
import { CardUI } from './CardUI';
import { CardData } from '../../types';
import '../../styles/Card.css';

interface CardProps {
    data: CardData;
    scale?: number;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ data, scale = 1, onClick }) => {
    // Helper to extract character ID from name or data
    // This is a temporary mapping logic
    const getCharacterId = (name: string) => {
        const map: Record<string, string> = {
            'Itadori Yuji': 'itadori',
            'Gojo Satoru': 'gojo',
            'Nobara Kugisaki': 'nobara',
            'Megumi Fushiguro': 'megumi',
            'Mahito': 'mahito',
            'Sukuna': 'sukuna',
            'Jogo': 'jogo',
            'Hanami': 'hanami'
        };
        return map[name] || 'itadori'; // Default fallback
    };

    return (
        <div
            className="card-container-3d"
            style={{ transform: `scale(${scale})` }}
            onClick={onClick}
        >
            <CardFrame faction="SORCERER" />
            <CardCharacter characterId={getCharacterId(data.name)} name={data.name} />
            <CardUI
                name={data.name}
                cost={data.cost}
                stats={data.stats ? { atk: data.stats.atk, hp: data.stats.maxHp || 0 } : undefined}
                description={data.description}
            />
        </div>
    );
};
