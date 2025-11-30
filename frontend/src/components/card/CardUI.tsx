import React from 'react';

interface CardUIProps {
    name: string;
    cost: number;
    stats?: {
        atk: number;
        hp: number;
    };
    description: string;
}

export const CardUI: React.FC<CardUIProps> = ({ name, cost, stats, description }) => {
    return (
        <div className="card-layer layer-ui">
            {/* Header: Name & Cost */}
            <div className="card-header">
                <div className="cost-badge">
                    <span className="cost-value">{cost}</span>
                    {/* <img src="/assets/ui/icon-cost.png" className="icon-cost" /> */}
                </div>
                <div className="name-banner">
                    <span>{name}</span>
                </div>
            </div>

            {/* Description Box */}
            <div className="card-body">
                <p className="description-text">{description}</p>
            </div>

            {/* Footer: Stats */}
            {stats && (
                <div className="card-footer">
                    <div className="stat-box atk">
                        <span className="stat-value">{stats.atk}</span>
                        <span className="stat-label">ATK</span>
                    </div>
                    <div className="stat-box hp">
                        <span className="stat-value">{stats.hp}</span>
                        <span className="stat-label">HP</span>
                    </div>
                </div>
            )}
        </div>
    );
};
