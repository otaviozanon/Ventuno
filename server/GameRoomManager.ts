import { BlackjackGame } from "../src/game-engine/BlackjackGame";
import type { RoomData, PlayerConnection } from "./types";

export class GameRoomManager {
  private rooms = new Map<string, RoomData>();
  private readonly ROOM_TIMEOUT_MS = 30 * 60 * 1000; // 30 min

  createRoom(hostName: string): string {
    const roomId = this.generateRoomId();
    const hostId = this.generatePlayerId();

    const room: RoomData = {
      id: roomId,
      game: new BlackjackGame(),
      players: new Map(),
      host: hostId,
      createdAt: Date.now(),
    };

    const hostConnection: PlayerConnection = {
      id: hostId,
      socketId: "",
      name: hostName,
      connected: true,
    };

    room.players.set(hostId, hostConnection);
    room.game.addPlayer(hostId, hostName);
    this.rooms.set(roomId, room);

    return roomId;
  }

  joinRoom(roomId: string, playerName: string): string | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.players.size >= 7) return null;

    const playerId = this.generatePlayerId();

    const playerConnection: PlayerConnection = {
      id: playerId,
      socketId: "",
      name: playerName,
      connected: true,
    };

    room.players.set(playerId, playerConnection);
    room.game.addPlayer(playerId, playerName);

    return playerId;
  }

  leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.delete(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  getRoom(roomId: string): RoomData | undefined {
    return this.rooms.get(roomId);
  }

  cleanupInactiveRooms(): void {
    const now = Date.now();
    for (const [roomId, room] of this.rooms.entries()) {
      const allDisconnected = Array.from(room.players.values()).every(
        (p) => !p.connected,
      );
      const isStale = now - room.createdAt > this.ROOM_TIMEOUT_MS;

      // Don't cleanup lobby rooms too quickly (player might be navigating)
      const isLobby = room.game.getState().phase === "lobby";
      const isVeryNew = now - room.createdAt < 10000; // 10s grace period

      if ((allDisconnected && !isLobby && !isVeryNew) || isStale) {
        this.rooms.delete(roomId);
        console.log(`[Cleanup] Removed room ${roomId}`);
      }
    }
  }

  updatePlayerSocket(roomId: string, playerId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (player) {
      player.socketId = socketId;
      player.connected = true;
    }
  }

  disconnectPlayer(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (player) {
      player.connected = false;
    }
  }

  private generateRoomId(): string {
    // Cryptographically secure 8-char room ID
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No ambiguous chars (0,O,1,I)
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => chars[byte % chars.length]).join("");
  }

  private generatePlayerId(): string {
    const randomBytes = new Uint8Array(6);
    crypto.getRandomValues(randomBytes);
    const randomStr = Array.from(randomBytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    return `p_${Date.now()}_${randomStr}`;
  }
}
