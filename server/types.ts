import type { GameState } from "../src/game-engine/types";
import type { BlackjackGame } from "../src/game-engine/BlackjackGame";

export interface RoomData {
  id: string;
  game: BlackjackGame;
  players: Map<string, PlayerConnection>;
  host: string;
  createdAt: number;
}

export interface PlayerConnection {
  id: string;
  socketId: string;
  name: string;
  connected: boolean;
}

export interface ServerToClientEvents {
  "game:state": (state: GameState) => void;
  "game:error": (error: string) => void;
  "room:created": (roomId: string) => void;
  "room:joined": (roomId: string, playerId: string) => void;
  "room:left": (playerId: string) => void;
  "room:player-disconnected": (playerId: string) => void;
  "room:player-reconnected": (playerId: string) => void;
}

export interface ClientToServerEvents {
  "room:create": (
    playerName: string,
    callback: (roomId: string, playerId: string) => void,
  ) => void;
  "room:join": (
    roomId: string,
    playerName: string,
    callback: (success: boolean, playerId?: string) => void,
  ) => void;
  "room:leave": () => void;
  "game:start-round": () => void;
  "game:place-bet": (amount: number) => void;
  "game:confirm-bet": () => void;
  "game:action": (action: "hit" | "stand" | "double" | "split") => void;
  "game:rebuy": () => void;
  "player:reconnect": (roomId: string, playerId: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  roomId?: string;
  playerId?: string;
}
