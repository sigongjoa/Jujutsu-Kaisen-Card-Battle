import React from 'react';
import '../pages/Dashboard.css';

interface MenuButtonProps {
    type: 'lobby' | 'decks' | 'shop' | 'profile' | 'settings' | 'logout';
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

const getButtonImage = (type: string) => {
    switch (type) {
        case 'lobby':
        case 'settings':
            return '/assets/main_page/emtpy_btn1.jpg'; // Cyan
        case 'decks':
        case 'profile':
            return '/assets/main_page/emtpy_btn2.jpg'; // Purple
        case 'shop':
            return '/assets/main_page/emtpy_btn3.jpg'; // Orange
        case 'logout':
            return '/assets/main_page/emtpy_btn4.jpg'; // Red
        default:
            return '/assets/main_page/emtpy_btn1.jpg';
    }
};

export const MenuButton: React.FC<MenuButtonProps> = ({ type, label, icon, onClick }) => {
    const bgImage = getButtonImage(type);

    return (
        <button
            className="menu-button"
            style={{ backgroundImage: `url('${bgImage}')` }}
            onClick={onClick}
        >
            <div className="menu-button-content">
                <span className="menu-button-icon">{icon}</span>
                <span className="menu-button-label">{label}</span>
            </div>
        </button>
    );
};
