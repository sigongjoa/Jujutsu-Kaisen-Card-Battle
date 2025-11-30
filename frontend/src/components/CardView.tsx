/**
 * Card component for displaying individual cards
 */

import React, { useState } from 'react';
import { CardInstance, CardData } from '../types';
import { Card } from './card';
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
      <Card data={card} />

      {/* Tapped Indicator */}
      {instance?.tappedStatus && <div className="tapped-indicator" />}
    </div>
  );
};

export default CardView;
