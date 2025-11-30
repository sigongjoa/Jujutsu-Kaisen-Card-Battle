import { CardType, CardData } from '../types';

export const CARD_DATABASE: Record<string, CardData> = {
    'itadori-1': {
        cardId: 'itadori-1',
        name: 'Itadori Yuji',
        type: CardType.JUJUTSU_USER,
        cost: 3,
        stats: { atk: 5, def: 4, maxHp: 10 },
        keywords: ['Black Flash'],
        description: 'Deals double damage on critical hit.'
    },
    'gojo-1': {
        cardId: 'gojo-1',
        name: 'Gojo Satoru',
        type: CardType.JUJUTSU_USER,
        cost: 10,
        stats: { atk: 99, def: 99, maxHp: 99 },
        keywords: ['Infinity', 'Domain Expansion'],
        description: 'The strongest. Cannot be touched.'
    },
    'nobara-1': {
        cardId: 'nobara-1',
        name: 'Nobara Kugisaki',
        type: CardType.JUJUTSU_USER,
        cost: 4,
        stats: { atk: 6, def: 3, maxHp: 8 },
        keywords: ['Resonance'],
        description: 'Deals damage to opponent when damaging their minions.'
    },
    'megumi-1': {
        cardId: 'megumi-1',
        name: 'Megumi Fushiguro',
        type: CardType.JUJUTSU_USER,
        cost: 5,
        stats: { atk: 5, def: 5, maxHp: 12 },
        keywords: ['Ten Shadows'],
        description: 'Summons a Divine Dog.'
    },
    'sukuna-1': {
        cardId: 'sukuna-1',
        name: 'Ryomen Sukuna',
        type: CardType.CURSED_OBJECT, // or User
        cost: 10,
        stats: { atk: 100, def: 100, maxHp: 100 },
        keywords: ['King of Curses', 'Dismantle'],
        description: 'Destroy everything.'
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
