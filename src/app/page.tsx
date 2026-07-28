"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, LogIn, ArrowRight } from "lucide-react";
import {
  getSocket,
  connectSocket,
  setupSocketListeners,
  useSocketActions,
} from "@/lib/hooks/useSocket";
import { useGameStore } from "@/lib/stores/useGameStore";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RulesModal } from "@/components/RulesModal";

export default function HomePage() {
  const router = useRouter();
  const setMyPlayerId = useGameStore((s) => s.setMyPlayerId);
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setupSocketListeners();
    connectSocket();
  }, []);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      setError(t.home.errorName);
      return;
    }
    setError("");
    const socket = getSocket();
    socket.emit("room:create", name.trim(), (roomId, playerId) => {
      setMyPlayerId(playerId);
      router.push(`/sala/${roomId}`);
    });
  }, [name, setMyPlayerId, router, t]);

  const handleJoin = useCallback(async () => {
    if (!name.trim()) {
      setError(t.home.errorName);
      return;
    }
    if (!roomCode.trim()) {
      setError(t.home.errorCode);
      return;
    }
    setError("");
    const socket = getSocket();
    socket.emit(
      "room:join",
      roomCode.trim().toUpperCase(),
      name.trim(),
      (success, playerId) => {
        if (success && playerId) {
          setMyPlayerId(playerId);
          router.push(`/sala/${roomCode.trim().toUpperCase()}`);
        } else {
          setError(t.home.errorCode);
        }
      },
    );
  }, [name, roomCode, setMyPlayerId, router, t]);

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-surface">
      <LanguageSwitcher />
      <RulesModal />

      <div className="w-full max-w-md space-y-10 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand/30 blur-2xl rounded-full scale-150" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                viewBox="0 0 100 100"
                className="relative drop-shadow-[0_0_30px_rgba(212,175,55,0.6)]"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="#d4af37"
                  stroke="#f0d577"
                  strokeWidth="2"
                />
                <circle cx="50" cy="50" r="35" fill="#0a4d3c" />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text
                  x="50"
                  y="62"
                  textAnchor="middle"
                  fill="#d4af37"
                  fontSize="28"
                  fontWeight="bold"
                  fontFamily="serif"
                >
                  21
                </text>
                <circle cx="65" cy="35" r="8" fill="#f0d577" opacity="0.4" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-black text-text-primary tracking-tight">
            {t.home.title}
          </h1>
          <p className="text-text-secondary text-lg mt-1 font-medium">
            {t.home.subtitle}
          </p>
          <p className="text-text-muted text-sm">{t.home.playerCount}</p>
        </div>

        <div className="space-y-4">
          <input
            className="w-full px-5 py-4 rounded-2xl bg-surface-raised border-2 border-border text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-brand/40 focus:bg-surface-card transition-all duration-300 text-lg font-medium touch-target"
            placeholder={t.home.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />

          <button
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl bg-gradient-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand active:scale-[0.98] text-white font-black text-lg transition-all duration-200 touch-target shadow-2xl shadow-brand/30"
          >
            <Users size={22} />
            {t.home.createRoom}
            <ArrowRight size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-text-muted text-xs font-medium">
              {t.home.or}
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 px-5 py-4 rounded-2xl bg-surface-raised border-2 border-border text-text-primary placeholder:text-text-muted/50 text-center text-lg font-mono font-bold tracking-[0.4em] uppercase focus:outline-none focus:border-brand/40 transition-all duration-300 touch-target"
              placeholder={t.home.codePlaceholder}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              maxLength={8}
            />
            <button
              onClick={handleJoin}
              className="px-7 py-4 rounded-2xl bg-surface-raised hover:bg-surface-card border-2 border-border hover:border-brand/30 text-text-primary font-bold text-lg transition-all duration-200 active:scale-[0.98] touch-target"
            >
              <LogIn size={22} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="px-5 py-4 rounded-2xl bg-accent-danger/10 border-2 border-accent-danger/20 text-accent-danger text-sm font-medium text-center animate-slide-up">
            {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}
