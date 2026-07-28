"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";

interface ActionButtonsProps {
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  canDouble: boolean;
  disabled?: boolean;
}

export function ActionButtons({
  onHit,
  onStand,
  onDouble,
  canDouble,
  disabled = false,
}: ActionButtonsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-4">
      <button
        onClick={onHit}
        disabled={disabled}
        className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t.game.hit}
      </button>
      <button
        onClick={onStand}
        disabled={disabled}
        className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t.game.stand}
      </button>
      {canDouble && (
        <button
          onClick={onDouble}
          disabled={disabled}
          className="rounded-lg bg-yellow-600 px-6 py-3 font-bold text-white transition-all hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.game.double}
        </button>
      )}
    </div>
  );
}
