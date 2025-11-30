import { CardType, CardData } from '../types';

export const CARD_DATABASE: Record<string, CardData> = {
    'JK-001-YUJI': {
        cardId: 'JK-001-YUJI',
        name: 'Itadori Yuji',
        type: CardType.JUJUTSU_USER,
        cost: 4,
        stats: { atk: 9, def: 2, maxHp: 15 },
        keywords: ['Piercing'],
        description: 'Deals double damage on critical hit.'
    },
    'JK-020-GOJO': {
        cardId: 'JK-020-GOJO',
        name: 'Gojo Satoru',
        type: CardType.JUJUTSU_USER,
        cost: 6,
        stats: { atk: 3, def: 11, maxHp: 20 },
        keywords: ['Indestructible'],
        description: 'The strongest. Cannot be touched.'
    },
    'JK-003-NOBARA': {
        cardId: 'JK-003-NOBARA',
        name: 'Nobara Kugisaki',
        type: CardType.JUJUTSU_USER,
        cost: 3,
        stats: { atk: 7, def: 3, maxHp: 12 },
        keywords: ['Resonance'],
        description: 'Deals damage to opponent when damaging their minions.'
    },
    'JK-002-MEGUMI': {
        cardId: 'JK-002-MEGUMI',
        name: 'Megumi Fushiguro',
        type: CardType.JUJUTSU_USER,
        cost: 5,
        stats: { atk: 6, def: 6, maxHp: 14 },
        keywords: ['Ten Shadows'],
        description: 'Summons a Divine Dog.'
    }
};

export const getCardData = (cardId: string): CardData => {
    return CARD_DATABASE[cardId] || {
        cardId,
        name: 'Unknown Card',
        type: CardType.EVENT,
        cost: 0,
        keywords: [],
        description: 'Data not found'
    };
};
