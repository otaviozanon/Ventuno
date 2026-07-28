"use client";
import { motion } from "motion/react";
import { Crown, Medal, Trophy, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { Player } from "@/game-engine/types";
import { useLanguage } from "@/lib/i18n/useLanguage";

interface WinnerModalProps {
  winner: Player;
  allPlayers: Player[];
  onPlayAgain: () => void;
}

export function WinnerModal({
  winner,
  allPlayers,
  onPlayAgain,
}: WinnerModalProps) {
  const { t } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Ranking por chips
  const ranking = [...allPlayers].sort((a, b) => b.chips - a.chips);
  const medals = ["text-yellow-400", "text-gray-300", "text-amber-600"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "linear",
              }}
              className={`absolute w-3 h-3 ${
                ["bg-brand", "bg-yellow-400", "bg-red-500", "bg-blue-500"][
                  i % 4
                ]
              }`}
              style={{
                clipPath:
                  i % 2 === 0 ? "polygon(50% 0%, 100% 100%, 0% 100%)" : "none",
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.1,
        }}
        className="relative w-full max-w-md space-y-6 rounded-2xl border-2 border-brand/20 bg-surface-card p-8 shadow-2xl shadow-brand/20"
      >
        {/* Troféu */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.3,
          }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-brand/30 blur-2xl rounded-full" />
            <Trophy size={64} className="relative text-brand drop-shadow-lg" />
          </div>
        </motion.div>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl font-black text-text-primary flex items-center justify-center gap-2">
            <Sparkles className="text-brand" size={24} />
            {t.winner.title}
            <Sparkles className="text-brand" size={24} />
          </h2>
          <p className="text-xl font-bold text-brand">
            {winner.name} {t.winner.won}
          </p>
          <p className="text-2xl font-black text-brand">
            ${winner.chips.toLocaleString()}
          </p>
        </motion.div>

        {/* Ranking */}
        <div className="space-y-2">
          {ranking.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.8 + i * 0.15,
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                player.id === winner.id
                  ? "bg-brand/10 border-2 border-brand/30"
                  : "bg-surface-raised border border-border"
              }`}
            >
              <span className={`text-lg ${medals[i] || "text-text-muted"}`}>
                {i === 0 ? <Crown size={20} /> : <Medal size={20} />}
              </span>
              <span className="flex-1 text-text-primary font-medium">
                {player.name}
              </span>
              <span className="text-sm font-mono font-bold text-brand">
                ${player.chips.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Botão Jogar Novamente */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayAgain}
          className="w-full py-4 rounded-xl font-black text-lg bg-brand text-white hover:bg-brand-dark transition-all duration-200 shadow-lg shadow-brand/30"
        >
          {t.winner.playAgain}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
