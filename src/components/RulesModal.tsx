"use client";

import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function RulesModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface-card shadow-lg transition-all duration-200 hover:bg-surface-overlay"
        >
          <BookOpen size={20} className="text-text-secondary" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[80vh] space-y-4 overflow-y-auto rounded-2xl border border-border bg-surface-card p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-black text-text-primary">
            {t.rules.title}
          </h2>
          <button onClick={() => setOpen(false)} className="p-2">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-sm text-text-secondary">
          <p>
            <strong className="text-text-primary">
              {t.rules.sections.objective.title}
            </strong>{" "}
            {t.rules.sections.objective.content}
          </p>
          <p>
            <strong className="text-text-primary">
              {t.rules.sections.cardValues.title}
            </strong>
          </p>
          <div className="pl-4 space-y-1">
            {t.rules.sections.cardValues.content.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <p>
            <strong className="text-text-primary">
              {t.rules.sections.gameplay.title}
            </strong>
          </p>
          <div className="pl-4 space-y-1">
            {t.rules.sections.gameplay.content.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <p>
            <strong className="text-text-primary">
              {t.rules.sections.winning.title}
            </strong>
          </p>
          <div className="pl-4 space-y-1">
            {t.rules.sections.winning.content.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <p>
            <strong className="text-text-primary">
              {t.rules.sections.champion.title}
            </strong>{" "}
            {t.rules.sections.champion.content}
          </p>
        </div>
      </div>
    </div>
  );
}
