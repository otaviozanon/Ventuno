"use client";
import { motion } from "motion/react";
import type { Player } from "@/game-engine/types";
import { Card } from "./Card";
import { calculateHandValue } from "@/game-engine/rules";
import { Crown, User, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

interface PlayerSlotProps {
  player: Player;
  isCurrentPlayer?: boolean;
  isMe?: boolean;
  phase?: string;
}

export function PlayerSlot({
  player,
  isCurrentPlayer = false,
  isMe = false,
  phase = "betting",
}: PlayerSlotProps) {
  const { t } = useLanguage();
  // Proteção dupla: garante que mainHand seja sempre um array válido
  const mainHand = (player.hands && player.hands[0]) || [];
  const handValue = mainHand.length > 0 ? calculateHandValue(mainHand) : 0;

  // Status definidos pelo backend (só ativa se NÃO for lobby/betting)
  const isInGame = phase !== "lobby" && phase !== "betting";
  const isWinner = isInGame && player.status === "won";
  const isPush = isInGame && player.status === "push";
  const isBlackjack = isInGame && player.status === "blackjack";
  const isBust = isInGame && player.status === "bust";
  const isLost = isInGame && player.status === "lost";

  return (
    <div className="relative flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={
          isBust
            ? {
                scale: [1, 1.1, 1],
                opacity: 1,
                rotate: [-5, 5, -5, 5, -3, 3, 0],
              }
            : isLost
              ? {
                  scale: [1, 0.95, 1],
                  opacity: [1, 0.7, 1],
                  y: [0, 3, 0],
                }
              : isWinner
                ? {
                    scale: [1, 1.15, 1.05, 1],
                    opacity: 1,
                    y: [-10, -20, -5, 0],
                  }
                : isPush
                  ? {
                      scale: [1, 1.05, 1],
                      opacity: 1,
                      x: [-5, 5, -5, 5, -3, 3, 0],
                    }
                  : isBlackjack
                    ? {
                        scale: [1, 1.2, 1.1, 1],
                        opacity: 1,
                        rotate: [-10, 10, -10, 10, -5, 5, 0],
                      }
                    : { scale: 1, opacity: 1 }
        }
        transition={{
          duration: 0.8,
          ease: "easeOut",
          times:
            isBust || isPush
              ? [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1]
              : isBlackjack
                ? [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]
                : isWinner
                  ? [0, 0.3, 0.7, 1]
                  : isLost
                    ? [0, 0.5, 1]
                    : undefined,
        }}
        className={`relative w-full max-w-full sm:max-w-[320px] overflow-hidden rounded-2xl px-2 sm:px-3 py-3 sm:py-4 transition-all ${
          isBust
            ? "bg-red-500/10 shadow-xl shadow-red-500/20"
            : isLost
              ? "bg-red-500/5 shadow-lg shadow-red-500/10"
              : isWinner
                ? "bg-green-500/10 shadow-xl shadow-green-500/20"
                : isPush
                  ? "bg-yellow-500/10 shadow-xl shadow-yellow-500/20"
                  : isBlackjack
                    ? "bg-yellow-400/10 shadow-xl shadow-yellow-400/20"
                    : isCurrentPlayer
                      ? "bg-brand/10 shadow-xl shadow-brand/20"
                      : "bg-surface-card/60"
        }`}
      >
        {/* Header: nome + saldo */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-raised/50">
              {isMe ? (
                <Star className="h-3.5 w-3.5 text-brand" />
              ) : (
                <User className="h-3.5 w-3.5 text-text-muted" />
              )}
            </div>
            <span className="font-heading text-sm font-semibold text-text-primary">
              {player.name}
            </span>
          </div>
          <span className="font-mono text-sm font-bold text-brand">
            ${player.chips.toLocaleString()}
          </span>
        </div>

        {/* Aposta - altura fixa para não empurrar conteúdo */}
        <div className="mb-3 flex h-10 items-center justify-center">
          {player.bet > 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-brand/5 px-3 py-2">
              <span className="font-heading text-xs font-semibold uppercase tracking-wider text-text-muted/60">
                {t.game.bet}
              </span>
              <span className="font-mono text-lg font-bold text-brand">
                ${player.bet.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="h-10" />
          )}
        </div>

        {/* Cards */}
        <div className="flex w-full flex-col items-center space-y-2">
          {mainHand.length > 0 && (
            <div className="flex w-full flex-col items-center space-y-3">
              <div
                className="relative mx-auto h-40 pt-3"
                style={{
                  width: `${Math.min(mainHand.length * 40 + 80, 280)}px`,
                }}
              >
                {mainHand.map((card, idx) => {
                  const totalCards = mainHand.length;
                  const centerOffset = (totalCards - 1) / 2;
                  const rotationBase = totalCards <= 3 ? 32 : totalCards === 4 ? 22 : 15;
                  const rotation = (idx - centerOffset) * rotationBase;
                  const offsetY = idx * (totalCards <= 3 ? 4 : totalCards === 4 ? 3 : 2);
                  // Ajusta spacing dinamicamente baseado no número de cartas
                  const cardSpacing = Math.min(40, 280 / totalCards - 20);
                  const totalSpan = (totalCards - 1) * cardSpacing + 96;
                  const containerW = Math.min(mainHand.length * 40 + 80, 280);
                  const startX = (containerW - totalSpan) / 2;
                  const leftPos = startX + idx * cardSpacing;

                  return (
                    <motion.div
                      key={idx}
                      className="absolute"
                      style={{
                        zIndex: idx,
                        left: `${leftPos}px`,
                      }}
                      initial={{ y: 50, opacity: 0, rotate: rotation }}
                      animate={{ y: offsetY, opacity: 1, rotate: rotation }}
                      transition={{
                        delay: idx * 0.1,
                        duration: 0.4,
                        type: "spring",
                      }}
                    >
                      <Card card={card} />
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-full bg-surface-raised/80 px-4 py-1.5 font-heading text-sm font-bold text-text-primary"
              >
                {handValue}
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Badges abaixo do card */}
      {isBust && (
        <motion.div
          initial={{ scale: 0, y: 20, rotate: -20 }}
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -5, 0],
            rotate: [-10, 10, -10, 10, -5, 5, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
          }}
          className="font-heading rounded-full bg-red-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-600/40"
        >
          {t.status.bust}
        </motion.div>
      )}
      {isBlackjack && (
        <motion.div
          initial={{ scale: 0, y: 20, rotate: 20 }}
          animate={{
            scale: [1, 1.3, 1.1, 1],
            y: [0, -10, -5, 0],
            rotate: [-15, 15, -15, 15, -8, 8, 0],
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
            times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
          }}
          className="font-heading rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-yellow-400/40"
        >
          {t.status.blackjack}
        </motion.div>
      )}
      {isWinner && (
        <motion.div
          initial={{ scale: 0, y: 30, rotate: -15 }}
          animate={{
            scale: [1, 1.25, 1.1, 1],
            y: [0, -15, -8, 0],
            rotate: [-12, 12, -12, 12, -6, 6, 0],
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
            times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
          }}
          className="font-heading rounded-full bg-green-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-green-600/40"
        >
          {t.status.won}
        </motion.div>
      )}
      {isPush && (
        <motion.div
          initial={{ scale: 0, y: 20, x: -10 }}
          animate={{
            scale: [1, 1.15, 1],
            y: [0, -5, 0],
            x: [-8, 8, -8, 8, -4, 4, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
          }}
          className="font-heading rounded-full bg-yellow-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-yellow-600/40"
        >
          {t.status.push}
        </motion.div>
      )}
      {isLost && (
        <motion.div
          initial={{ scale: 0, y: 20, opacity: 0 }}
          animate={{
            scale: [1, 1.1, 1],
            y: [0, 3, 0],
            opacity: [0.7, 1, 0.8],
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            times: [0, 0.5, 1],
          }}
          className="font-heading rounded-full bg-red-600/80 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white/90 shadow-lg shadow-red-600/30"
        >
          {t.status.lost}
        </motion.div>
      )}
      {isCurrentPlayer &&
        !isBust &&
        !isBlackjack &&
        !isWinner &&
        !isPush &&
        !isLost && (
          <motion.div
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="font-heading rounded-full bg-brand px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-brand/40"
          >
            {t.game.yourTurn}
          </motion.div>
        )}
    </div>
  );
}
