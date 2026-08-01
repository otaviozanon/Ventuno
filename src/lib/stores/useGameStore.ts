import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameState } from "@/game-engine/types";

interface GameStore {
  gameState: GameState | null;
  myPlayerId: string | null;
  error: string | null;
  setGameState: (state: GameState) => void;
  setMyPlayerId: (id: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameState: null,
      myPlayerId: null,
      error: null,
      setGameState: (state) => set({ gameState: state }),
      setMyPlayerId: (id) => set({ myPlayerId: id }),
      setError: (error) => set({ error }),
      reset: () => set({ gameState: null, myPlayerId: null, error: null }),
    }),
    {
      name: "vigintiunus-player",
      partialize: (state) => ({ myPlayerId: state.myPlayerId }),
    },
  ),
);
