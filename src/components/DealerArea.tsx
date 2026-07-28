"use client";
import { motion } from "motion/react";
import type { Card as CardType } from "@/game-engine/types";
import { Card } from "./Card";
import { calculateHandValue } from "@/game-engine/rules";
import { UserCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

interface DealerAreaProps {
  hand: CardType[];
  phase: string;
}

export function DealerArea({ hand, phase }: DealerAreaProps) {
  const { t } = useLanguage();
  // Proteção contra hand null/undefined
  const safeHand = hand || [];
  const handValue = safeHand.length > 0 ? calculateHandValue(safeHand) : 0;
  const showValue = safeHand.length > 0 && phase !== "betting";
  const shouldShowCards = phase !== "betting" && safeHand.length > 0;
  const isRevealing = phase === "dealer";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dealer icon + label */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand/30 bg-gradient-to-br from-surface-raised to-surface-card shadow-xl"
        >
          <UserCircle className="h-10 w-10 text-brand" />
        </motion.div>
        <div className="text-sm font-bold uppercase tracking-wider text-text-muted">
          {t.game.dealer}
        </div>
      </div>

      {/* Cards em V formation */}
      {shouldShowCards && (
        <div className="flex w-full flex-col items-center gap-3">
          <div
            className="relative mx-auto h-44"
            style={{ width: `${safeHand.length * 65 + 20}px` }}
          >
            {safeHand.map((card, idx) => {
              // Proteção contra card null
              if (!card) return null;

              const totalCards = safeHand.length;
              const centerOffset = (totalCards - 1) / 2;
              const rotation = (idx - centerOffset) * 8;
              const offsetY = Math.abs(idx - centerOffset) * 6;

              return (
                <motion.div
                  key={idx}
                  className="absolute"
                  style={{
                    zIndex: idx,
                    left: `${idx * 65}px`,
                  }}
                  initial={{ y: -100, opacity: 0, rotate: rotation }}
                  animate={{ y: offsetY, opacity: 1, rotate: rotation }}
                  transition={{
                    delay: idx * 0.15,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 120,
                  }}
                >
                  <Card
                    card={
                      idx === 1 && phase === "playing"
                        ? { ...card, isHidden: true }
                        : card
                    }
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Badge valor */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: isRevealing ? 1.5 : 0.3,
              type: "spring",
              stiffness: isRevealing ? 400 : 300,
            }}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold shadow-lg ${
              isRevealing
                ? "border-brand bg-brand/10 text-brand animate-pulse"
                : "border-brand/20 bg-surface-card text-brand"
            }`}
          >
            {phase === "playing" ? "?" : handValue}
          </motion.div>
        </div>
      )}

      {phase === "betting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-text-muted"
        >
          {t.game.waiting}
        </motion.div>
      )}

      {!shouldShowCards && phase !== "betting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-text-muted"
        >
          {t.game.preparing}
        </motion.div>
      )}
    </div>
  );
}
