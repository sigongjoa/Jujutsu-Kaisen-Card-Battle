/**
 * Card component for displaying individual cards
 */

import React, { useState } from 'react';
import { CardInstance, CardData } from '../types';
import '../styles/Card.css';

interface CardViewProps {
  card: CardData;
  instance?: CardInstance;
  isSelected?: boolean;
  isValidTarget?: boolean;
  onClick?: (cardId: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  scale?: number;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  instance,
  isSelected = false,
  isValidTarget = false,
  onClick,
  onDragStart,
  onDragEnd,
  scale = 1
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(card.cardId);
    }
  };

  const cardClassName = [
    'card',
    isSelected && 'selected',
    isValidTarget && 'valid-target',
    instance?.tappedStatus && 'tapped'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClassName}
      style={{ transform: `scale(${scale})` }}
      onClick={handleClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      draggable={!!onDragStart}
    >
      {/* Card Face */}
      <div className="card-face">
        <div className="card-header">
          <h3 className="card-name">{card.name}</h3>
          <div className="card-cost">{card.cost}</div>
        </div>

        <div className="card-image-area">[Card Image]</div>

        {card.stats && (
          <div className="card-stats">
            <div className="stat atk">{card.stats.atk}</div>
            <div className="stat def">{card.stats.def}</div>
          </div>
        )}

        <div className="card-description">{card.description}</div>

        {card.flavorText && (
          <div className="card-flavor">{card.flavorText}</div>
        )}

        {card.keywords && card.keywords.length > 0 && (
          <div className="card-keywords">
            {card.keywords.map((keyword) => (
              <span key={keyword} className="keyword-badge">
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tapped Indicator */}
      {instance?.tappedStatus && <div className="tapped-indicator" />}

      {/* Tooltip */}
      {showTooltip && (
        <div className="card-tooltip">
          <div className="tooltip-name">{card.name}</div>
          <div className="tooltip-type">{card.type}</div>
          <div className="tooltip-description">{card.description}</div>
        </div>
      )}
    </div>
  );
};

export default CardView;
