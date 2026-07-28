"use client";

import { useLanguage } from "@/lib/i18n/useLanguage";
import { motion } from "motion/react";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border-2 border-border bg-surface-raised px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-text-primary shadow-xl transition-all hover:border-brand/40 hover:bg-surface-card"
    >
      <Languages size={18} className="text-brand" />
      <span className="font-mono">{language.toUpperCase()}</span>
    </motion.button>
  );
}
