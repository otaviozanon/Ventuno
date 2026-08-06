"use client";

import { useState, useEffect } from "react";
import { ChipStack } from "./ChipStack";
import { useLanguage } from "@/lib/i18n/useLanguage";

interface BettingPanelProps {
  currentChips: number;
  currentBet: number;
  onPlaceBet: (amount: number) => void;
  onConfirmBet: () => void;
  disabled?: boolean;
}

const betAmounts = [10, 25, 50, 100, 500];

export function BettingPanel({
  currentChips,
  currentBet,
  onPlaceBet,
  onConfirmBet,
  disabled = false,
}: BettingPanelProps) {
  const { t } = useLanguage();
  const [customAmount, setCustomAmount] = useState("");
  const [pendingBet, setPendingBet] = useState(currentBet);

  useEffect(() => {
    setPendingBet(currentBet);
  }, [currentBet]);

  const remainingChips = currentChips - pendingBet;

  const handleQuickBet = (amount: number) => {
    if (amount <= remainingChips) {
      setPendingBet(pendingBet + amount);
    }
  };

  const handleCustomBet = () => {
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount >= 10 && amount <= remainingChips) {
      setPendingBet(pendingBet + amount);
      setCustomAmount("");
    }
  };

  const handleClear = () => {
    setPendingBet(0);
  };

  const handleConfirm = () => {
    if (pendingBet >= 10) {
      // Primeiro envia a aposta, depois confirma
      onPlaceBet(pendingBet);
      // Aguarda um pouco para garantir que o servidor recebeu a aposta
      setTimeout(() => {
        onConfirmBet();
      }, 100);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Header - Chips info */}
      <div className="flex items-end justify-center gap-12">
        <div className="text-center">
          <div className="font-heading mb-1 text-xs font-semibold uppercase tracking-widest text-text-muted/60">
            {t.game.available}
          </div>
          <div className="font-mono text-4xl font-bold tracking-tight text-white">
            ${remainingChips.toLocaleString()}
          </div>
        </div>
        {pendingBet > 0 && (
          <>
            <div className="h-8 w-px bg-border/20" />
            <div className="text-center">
              <div className="font-heading mb-1 text-xs font-semibold uppercase tracking-widest text-brand/60">
                {t.game.bet}
              </div>
              <div className="font-mono text-4xl font-bold tracking-tight text-brand">
                ${pendingBet.toLocaleString()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick bet chips - ultra minimalista */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
        {betAmounts.map((amount) => {
          const canAfford = amount <= remainingChips;
          return (
            <button
              key={amount}
              onClick={() => handleQuickBet(amount)}
              disabled={disabled || !canAfford}
              className={`group relative flex flex-col items-center gap-2 p-4 transition-all duration-300 ${
                canAfford
                  ? "hover:scale-105 active:scale-95"
                  : "opacity-25 cursor-not-allowed"
              }`}
            >
              <ChipStack amount={amount} />
              <span
                className={`font-mono text-sm font-bold ${canAfford ? "text-text-primary group-hover:text-brand" : "text-text-muted/40"}`}
              >
                ${amount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom amount - sem bordas */}
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="10"
          max={remainingChips}
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCustomBet()}
          disabled={disabled}
          placeholder={t.game.customAmount}
          className="flex-1 rounded-xl bg-surface-card/40 px-6 py-4 font-mono text-base text-text-primary placeholder-text-muted/30 transition-all focus:bg-surface-card/60 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleCustomBet}
          disabled={disabled || !customAmount}
          className="font-heading rounded-xl bg-brand px-10 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-brand-light hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {t.game.add}
        </button>
      </div>

      {/* Confirm and Clear buttons */}
      <div className="flex gap-3">
        {pendingBet > 0 && (
          <button
            onClick={handleClear}
            disabled={disabled}
            className="font-heading rounded-xl bg-red-500/10 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-red-400/80 transition-all hover:bg-red-500/20 hover:text-red-400 active:scale-98 disabled:opacity-50"
          >
            {t.game.clear}
          </button>
        )}
        <button
          onClick={handleConfirm}
          disabled={disabled || pendingBet < 10}
          className="font-heading flex-1 rounded-xl bg-gradient-to-r from-brand to-brand-light py-4 text-base font-black uppercase tracking-wider text-white shadow-xl shadow-brand/30 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
        >
          {pendingBet >= 10 ? t.game.confirmBet : t.game.betMin}
        </button>
      </div>
    </div>
  );
}
