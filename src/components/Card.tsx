"use client";
import { motion } from "motion/react";
import type { Card as CardType } from "@/game-engine/types";
import { useEffect, useState } from "react";

interface CardProps {
  card: CardType;
  className?: string;
}

const suitSymbols = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors = {
  hearts: "text-red-600",
  diamonds: "text-red-600",
  clubs: "text-gray-900",
  spades: "text-gray-900",
};

export function Card({ card, className = "" }: CardProps) {
  // Proteção contra card null/undefined
  if (!card) {
    return null;
  }

  const [wasHidden, setWasHidden] = useState(card.isHidden);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    // Detecta quando carta hidden vira para visível
    if (wasHidden && !card.isHidden) {
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 800);
    }
    setWasHidden(card.isHidden);
  }, [card.isHidden, wasHidden]);

  if (card.isHidden) {
    return (
      <motion.div
        key="hidden"
        initial={{ rotateY: 0, scale: 0.9 }}
        animate={{ rotateY: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`relative flex h-32 w-24 items-center justify-center rounded-lg border-2 border-gray-700 bg-gradient-to-br from-blue-900 to-blue-700 shadow-lg ${className}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-2 rounded border-2 border-blue-400/30" />
        <div className="text-4xl text-blue-400/50">★</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="revealed"
      initial={isFlipping ? { rotateY: 180 } : { rotateY: 0, scale: 0.9 }}
      animate={{ rotateY: 0, scale: 1 }}
      transition={
        isFlipping
          ? { rotateY: { duration: 0.6, ease: "easeInOut" } }
          : { duration: 0.3 }
      }
      className={`relative flex h-32 w-24 flex-col items-center justify-between rounded-lg border-2 border-gray-300 bg-white p-2 shadow-lg ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className={`text-2xl font-bold ${suitColors[card.suit]}`}>
        {card.value}
      </div>
      <div className={`text-4xl ${suitColors[card.suit]}`}>
        {suitSymbols[card.suit]}
      </div>
      <div className={`rotate-180 text-2xl font-bold ${suitColors[card.suit]}`}>
        {card.value}
      </div>
    </motion.div>
  );
}
