import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameState } from "@/game-engine/types";

interface GameStore {
  gameState: GameState | null;
  myPlayerId: string | null;
  setGameState: (state: GameState) => void;
  setMyPlayerId: (id: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameState: null,
      myPlayerId: null,
      setGameState: (state) => set({ gameState: state }),
      setMyPlayerId: (id) => set({ myPlayerId: id }),
      reset: () => set({ gameState: null, myPlayerId: null }),
    }),
    {
      name: "vigintiunus-player",
      partialize: (state) => ({ myPlayerId: state.myPlayerId }),
    },
  ),
);
