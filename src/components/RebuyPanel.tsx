"use client";

import { motion } from "motion/react";
import { Coins, Eye } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

interface RebuyPanelProps {
  rebuysUsed: number;
  onRebuy: () => void;
  disabled?: boolean;
}

const MAX_REBUYS = 3;

export function RebuyPanel({ rebuysUsed, onRebuy, disabled = false }: RebuyPanelProps) {
  const { t } = useLanguage();
  const reached = rebuysUsed >= MAX_REBUYS;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="flex flex-col items-center gap-4 rounded-2xl border-2 border-brand/40 bg-surface-card p-6 shadow-xl shadow-brand/10"
    >
      {!reached ? (
        <>
          <div className="flex items-center gap-2 text-brand">
            <Coins size={24} />
            <span className="font-heading text-lg font-bold">
              {t.game.rebuy}
            </span>
          </div>
          <button
            onClick={onRebuy}
            disabled={disabled}
            className="font-heading rounded-xl bg-gradient-to-r from-brand to-brand-light px-10 py-4 text-base font-black uppercase tracking-wider text-white shadow-xl shadow-brand/30 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
          >
            {t.game.rebuyButton}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-text-muted">
            <Eye size={24} />
            <span className="font-heading text-base font-semibold">
              {t.game.spectator}
            </span>
          </div>
          <p className="text-xs text-text-muted/60">
            {t.game.rebuyMax}
          </p>
        </>
      )}
    </motion.div>
  );
}
