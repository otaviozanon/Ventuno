"use client";

import { useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Copy, Play, Users, Crown, ArrowRight } from "lucide-react";
import {
  getSocket,
  connectSocket,
  setupSocketListeners,
} from "@/lib/hooks/useSocket";
import { useGameStore } from "@/lib/stores/useGameStore";
import { useLanguage } from "@/lib/i18n/useLanguage";

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);

  const roomId = params.id as string;
  const idRef = useRef(roomId);
  idRef.current = roomId;

  useEffect(() => {
    setupSocketListeners();
    connectSocket();
  }, []);

  useEffect(() => {
    if (!myPlayerId) {
      router.push("/");
    }
  }, [myPlayerId, router]);

  useEffect(() => {
    if (gameState?.phase !== "lobby") {
      router.push(`/jogo/${idRef.current}`);
    }
  }, [gameState?.phase, router]);

  if (!gameState) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-4 bg-surface">
        <div className="text-text-secondary">{t.lobby.loading}</div>
      </main>
    );
  }

  const isHost = myPlayerId === gameState.players[0]?.id;
  const canStart = gameState.players.length >= 2;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId).catch(() => {});
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit("game:start-round");
  };

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md space-y-8 animate-scale-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
            <Users size={32} className="text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            {t.lobby.title}
          </h1>
        </div>

        <div className="space-y-3">
          <div className="text-center p-6 rounded-xl bg-surface-raised border border-border">
            <p className="font-heading text-text-muted text-sm mb-2">{t.lobby.roomCode}</p>
            <button
              onClick={handleCopyCode}
              className="group flex items-center justify-center gap-3 mx-auto text-4xl font-mono font-bold text-brand hover:text-brand-light tracking-[0.3em] transition-all duration-200 touch-target"
            >
              {roomId}
              <Copy size={20} />
            </button>
            <p className="font-heading text-text-muted text-xs mt-2">{t.lobby.copyCode}</p>
          </div>

          <div className="text-center p-4 rounded-xl bg-surface-raised border border-border">
            <button
              onClick={handleCopyLink}
              className="w-full text-center text-sm text-text-secondary hover:text-brand-light transition-colors"
            >
              <Copy size={14} className="inline mr-1" />
              {t.lobby.copyLink}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="font-heading text-sm text-text-secondary flex items-center gap-2">
              <Users size={16} />
              {t.lobby.players}
            </span>
            <span className="text-sm font-mono text-text-muted">
              {gameState.players.length}/7
            </span>
          </div>
          {gameState.players.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-surface-raised border border-border animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="shrink-0 w-3 h-3 rounded-full bg-accent-success shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
              <span className="flex-1 text-text-primary font-medium truncate">
                {p.name}
                {p.id === myPlayerId ? (
                  <span className="text-text-muted ml-2 text-sm">
                    {t.lobby.you}
                  </span>
                ) : null}
              </span>
              {i === 0 ? (
                <span className="flex items-center gap-1 text-accent-warning text-xs font-semibold">
                  <Crown size={14} />
                  {t.lobby.host}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl bg-gradient-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg transition-all duration-200 touch-target shadow-2xl shadow-brand/30"
          >
            <Play size={20} />
            {t.lobby.startGame}
            <ArrowRight size={18} />
          </button>
        ) : (
          <div className="text-center p-4 rounded-xl bg-surface-raised border border-border">
            <p className="text-text-muted text-sm">{t.lobby.waitingHost}</p>
          </div>
        )}
      </div>
    </main>
  );
}
