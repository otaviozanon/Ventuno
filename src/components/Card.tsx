"use client";
import { motion } from "motion/react";
import type { Card as CardType } from "@/game-engine/types";
import { useEffect, useState } from "react";

interface CardProps {
  card: CardType;
  className?: string;
  disableFlip?: boolean;
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

export function Card({ card, className = "", disableFlip = false }: CardProps) {
  if (!card) return null;

  const [flipped, setFlipped] = useState(card.isHidden ?? false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (disableFlip) {
      setFlipped(false);
      setShouldAnimate(false);
      return;
    }

    const targetFlipped = card.isHidden ?? false;
    if (targetFlipped !== flipped) {
      setShouldAnimate(true);
      setFlipped(targetFlipped);
    }
  }, [card.isHidden, disableFlip]);

  return (
    <div
      className={`relative ${className}`}
      style={{ perspective: 600, width: 96, height: 128 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 0 : 180 }}
        transition={
          shouldAnimate
            ? { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
            : { duration: 0 }
        }
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Frente da carta (revelada) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-between rounded-lg border-2 border-gray-300 bg-white p-2 shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className={`font-display text-2xl ${suitColors[card.suit]}`}>
            {card.value}
          </div>
          <div className={`font-display text-4xl ${suitColors[card.suit]}`}>
            {suitSymbols[card.suit]}
          </div>
          <div
            className={`font-display rotate-180 text-2xl ${suitColors[card.suit]}`}
          >
            {card.value}
          </div>
        </div>

        {/* Verso da carta (oculta) */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-gray-700 bg-gradient-to-br from-blue-900 to-blue-700 shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-2 rounded border-2 border-blue-400/30" />
          <div className="text-4xl text-blue-400/50">★</div>
        </div>
      </motion.div>
    </div>
  );
}
