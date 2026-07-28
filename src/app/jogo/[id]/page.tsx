"use client";

import { useParams, useRouter } from "next/navigation";
import {
  getSocket,
  connectSocket,
  setupSocketListeners,
  useSocketActions,
} from "@/lib/hooks/useSocket";
import { useGameStore } from "@/lib/stores/useGameStore";
import { DealerArea } from "@/components/DealerArea";
import { PlayerSlot } from "@/components/PlayerSlot";
import { ActionButtons } from "@/components/ActionButtons";
import { BettingPanel } from "@/components/BettingPanel";
import { WinnerModal } from "@/components/WinnerModal";
import { canDouble } from "@/game-engine/rules";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const { t } = useLanguage();

  const socket = getSocket();
  const actions = useSocketActions(socket);
  const gameState = useGameStore((s) => s.gameState);
  const myPlayerId = useGameStore((s) => s.myPlayerId);

  const myPlayer = gameState?.players.find((p) => p.id === myPlayerId);
  const isMyTurn =
    gameState?.phase === "playing" &&
    gameState.players[gameState.currentPlayerIndex]?.id === myPlayerId;

  const canDoubleNow = myPlayer?.hands[0]
    ? canDouble(myPlayer.hands[0])
    : false;

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
    if (gameState?.phase === "lobby") {
      router.push(`/sala/${roomId}`);
    }
  }, [gameState?.phase, roomId, router]);

  const handleLeaveRoom = () => {
    actions.leaveRoom();
    router.push("/");
  };

  if (!gameState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-xl font-semibold text-slate-400">
          {t.game.loading}
        </div>
      </div>
    );
  }

  // Check for winner
  const winner = gameState.players.find((p) => p.chips >= 5000);

  return (
    <div className="min-h-screen bg-neutral-950 p-4">
      {/* Winner Modal */}
      {winner && (
        <WinnerModal
          winner={winner}
          allPlayers={gameState.players}
          onPlayAgain={() => {
            actions.leaveRoom();
            router.push("/");
          }}
        />
      )}

      {/* Game area */}
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Dealer */}
        <DealerArea hand={gameState.dealer.hand} phase={gameState.phase} />

        {/* Players grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gameState.players.map((player) => (
            <PlayerSlot
              key={player.id}
              player={player}
              isCurrentPlayer={
                gameState.phase === "playing" &&
                gameState.players[gameState.currentPlayerIndex]?.id ===
                  player.id
              }
              isMe={player.id === myPlayerId}
              phase={gameState.phase}
            />
          ))}
        </div>

        {/* Action area */}
        <div className="flex justify-center">
          {gameState.phase === "lobby" && (
            <button
              onClick={() => actions.startRound()}
              disabled={gameState.players.length < 2}
              className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-10 py-4 text-lg font-bold text-slate-900 shadow-lg shadow-gold-500/30 transition-all hover:from-gold-400 hover:to-gold-500 hover:shadow-gold-500/40 disabled:opacity-50 disabled:hover:from-gold-500 disabled:hover:to-gold-600"
            >
              {gameState.players.length < 2
                ? t.game.waitingPlayers
                : t.game.startRound}
            </button>
          )}

          {gameState.phase === "betting" && myPlayer && (
            <BettingPanel
              currentChips={myPlayer.chips}
              currentBet={myPlayer.bet}
              onPlaceBet={(amount) => actions.placeBet(amount)}
              onConfirmBet={() => actions.confirmBet()}
            />
          )}

          {gameState.phase === "playing" && isMyTurn && (
            <ActionButtons
              onHit={() => actions.playerAction("hit")}
              onStand={() => actions.playerAction("stand")}
              onDouble={() => actions.playerAction("double")}
              canDouble={canDoubleNow}
            />
          )}

          {gameState.phase === "dealer" && (
            <div className="text-2xl font-bold text-white">
              {t.game.dealerPlaying}
            </div>
          )}

          {gameState.phase === "resolution" && (
            <div className="text-2xl font-bold text-white">
              {t.game.roundComplete}
            </div>
          )}
        </div>

        {/* Phase indicator */}
        <div className="mx-auto max-w-fit rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 backdrop-blur-sm">
          <span className="text-sm font-medium text-slate-400">
            {t.game.phase}
          </span>
          <span className="text-sm font-bold uppercase text-gold-400">
            {gameState.phase}
          </span>
        </div>
      </div>
    </div>
  );
}
