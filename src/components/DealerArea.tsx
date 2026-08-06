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
  const safeHand = hand || [];
  const handValue = safeHand.length > 0 ? calculateHandValue(safeHand) : 0;
  const showValue = safeHand.length > 0 && phase !== "betting";
  const shouldShowCards = phase !== "betting" && safeHand.length > 0;
  const isRevealing = phase === "dealer";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand/30 bg-gradient-to-br from-surface-raised to-surface-card shadow-xl"
        >
          <UserCircle className="h-10 w-10 text-brand" />
        </motion.div>
        <div className="font-heading text-sm font-bold uppercase tracking-wider text-text-muted">
          {t.game.dealer}
        </div>
      </div>

      {shouldShowCards && (
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex items-center justify-center">
            <div className="relative flex items-center" style={{ height: 136 }}>
              {safeHand.map((card, idx) => {
                if (!card) return null;

                const isHiddenCard = idx === 1 && phase === "playing";

                return (
                  <motion.div
                    key={idx}
                    style={{
                      marginLeft: idx === 0 ? 0 : -32,
                      zIndex: idx,
                    }}
                    initial={{ x: 60, y: -10, opacity: 0, scale: 0.85 }}
                    animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    transition={{
                      delay: idx * 0.12,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                  >
                    <Card
                      card={
                        isHiddenCard
                          ? { ...card, isHidden: true }
                          : card
                      }
                    />
                  </motion.div>
                );
              })}
            </div>
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
            className={`font-heading rounded-full border-2 px-4 py-1.5 text-sm font-bold shadow-lg ${
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
          className="font-heading text-sm text-text-muted"
        >
          {t.game.waiting}
        </motion.div>
      )}

      {!shouldShowCards && phase !== "betting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-heading text-sm text-text-muted"
        >
          {t.game.preparing}
        </motion.div>
      )}
    </div>
  );
}
