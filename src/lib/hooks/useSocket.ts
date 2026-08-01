"use client";

import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../server/types";
import { useGameStore } from "../stores/useGameStore";

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: ClientSocket | null = null;
let listenersSetup = false;

export function getSocket(): ClientSocket {
  if (!socket) {
    socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): ClientSocket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function setupSocketListeners(): void {
  if (listenersSetup) return;
  listenersSetup = true;
  const socket = getSocket();

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("game:state", (state) => {
    console.log(
      "[Socket] game:state received",
      state.phase,
      state.players.length,
    );
    useGameStore.getState().setGameState(state);
  });

  socket.on("game:error", (error) => {
    console.error("[Socket] Error:", error);
    useGameStore.getState().setError(error);
    setTimeout(() => useGameStore.getState().setError(null), 5000);
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected");
  });
}

export function useSocket() {
  return getSocket();
}

export function useSocketActions(socket: ClientSocket | null) {
  return {
    createRoom: (playerName: string) => {
      return new Promise<{ roomId: string; playerId: string }>((resolve) => {
        socket?.emit("room:create", playerName, (roomId, playerId) => {
          resolve({ roomId, playerId });
        });
      });
    },

    joinRoom: (roomId: string, playerName: string) => {
      return new Promise<{ success: boolean; playerId?: string }>((resolve) => {
        socket?.emit("room:join", roomId, playerName, (success, playerId) => {
          resolve({ success, playerId });
        });
      });
    },

    leaveRoom: () => {
      socket?.emit("room:leave");
    },

    startRound: () => {
      socket?.emit("game:start-round");
    },

    placeBet: (amount: number) => {
      socket?.emit("game:place-bet", amount);
    },

    confirmBet: () => {
      socket?.emit("game:confirm-bet");
    },

    playerAction: (action: "hit" | "stand" | "double" | "split") => {
      socket?.emit("game:action", action);
    },
  };
}
