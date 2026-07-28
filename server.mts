import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./server/types";
import { GameRoomManager } from "./server/GameRoomManager";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const roomManager = new GameRoomManager();

// Cleanup inactive rooms every 5 minutes
setInterval(
  () => {
    roomManager.cleanupInactiveRooms();
  },
  5 * 60 * 1000,
);

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: dev
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_WS_URL || "https://vigintiunus.onrender.com",
      methods: ["GET", "POST"],
      credentials: true,
    },
    maxHttpBufferSize: 1e6, // 1MB max message size
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on("room:create", (playerName, callback) => {
      try {
        const roomId = roomManager.createRoom(playerName);
        const room = roomManager.getRoom(roomId)!;
        const hostId = room.host;

        roomManager.updatePlayerSocket(roomId, hostId, socket.id);
        socket.data.roomId = roomId;
        socket.data.playerId = hostId;

        socket.join(roomId);
        callback(roomId, hostId);

        const gameState = room.game.getState();
        io.to(roomId).emit("game:state", gameState);

        console.log(`[Room] Created: ${roomId} by ${playerName} (${hostId})`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create room";
        socket.emit("game:error", errorMessage);
        console.error(`[Error] Create room:`, error);
      }
    });

    socket.on("room:join", (roomId, playerName, callback) => {
      try {
        const playerId = roomManager.joinRoom(roomId, playerName);
        if (!playerId) {
          callback(false);
          return;
        }

        const room = roomManager.getRoom(roomId)!;
        roomManager.updatePlayerSocket(roomId, playerId, socket.id);
        socket.data.roomId = roomId;
        socket.data.playerId = playerId;

        socket.join(roomId);
        callback(true, playerId);

        const gameState = room.game.getState();
        io.to(roomId).emit("game:state", gameState);
        io.to(roomId).emit("room:joined", roomId, playerId);

        console.log(`[Room] ${playerName} (${playerId}) joined ${roomId}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to join room";
        socket.emit("game:error", errorMessage);
        console.error(`[Error] Join room:`, error);
      }
    });

    socket.on("room:leave", () => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      roomManager.leaveRoom(roomId, playerId);
      socket.leave(roomId);
      io.to(roomId).emit("room:left", playerId);

      console.log(`[Room] ${playerId} left ${roomId}`);
    });

    socket.on("game:start-round", () => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      try {
        const room = roomManager.getRoom(roomId)!;
        room.game.startRound();

        const gameState = room.game.getState();
        io.to(roomId).emit("game:state", gameState);

        console.log(`[Game] Round started in ${roomId}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to start round";
        socket.emit("game:error", errorMessage);
        console.error(`[Error] Start round:`, error);
      }
    });

    socket.on("game:place-bet", (amount) => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      // Validate bet amount
      if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount < 10 ||
        amount > 10000
      ) {
        socket.emit("game:error", "Invalid bet amount");
        return;
      }

      try {
        const room = roomManager.getRoom(roomId)!;
        room.game.placeBet(playerId, amount);

        const gameState = room.game.getState();
        io.to(roomId).emit("game:state", gameState);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to place bet";
        socket.emit("game:error", errorMessage);
        console.error(`[Error] Place bet:`, error);
      }
    });

    socket.on("game:confirm-bet", () => {
      const { roomId, playerId } = socket.data;
      if (!playerId || !roomId) return;

      try {
        const room = roomManager.getRoom(roomId)!;

        // Confirma aposta diretamente no game engine
        const allConfirmed = room.game.confirmPlayerBet(playerId);

        const gameState = room.game.getState();
        const player = gameState.players.find((p: any) => p.id === playerId);

        console.log(
          `[Confirm Bet] ${player?.name} confirmed bet: $${player?.bet}`,
        );

        io.to(roomId).emit("game:state", gameState);

        console.log(
          `[Confirm Bet] All confirmed: ${allConfirmed}, Players:`,
          gameState.players.map((p: any) => ({
            name: p.name,
            bet: p.bet,
            confirmed: p.betConfirmed,
          })),
        );

        if (allConfirmed && gameState.phase === "betting") {
          console.log(`[Confirm Bet] Starting game!`);
          setTimeout(() => {
            room.game.confirmBetting();
            room.game.dealInitialCards();
            io.to(roomId).emit("game:state", room.game.getState());
          }, 1000);
        }
      } catch (error) {
        console.error(`[Error] Confirm bet:`, error);
        socket.emit("game:error", "Failed to confirm bet");
      }
    });

    socket.on("game:action", (action) => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      try {
        const room = roomManager.getRoom(roomId)!;
        room.game.playerAction(playerId, action);

        const gameState = room.game.getState();
        io.to(roomId).emit("game:state", gameState);

        // Auto-trigger dealer when all players done
        if (gameState.phase === "dealer") {
          setTimeout(() => {
            room.game.playDealer();
            io.to(roomId).emit("game:state", room.game.getState());

            // Resolve e mostra resultado
            setTimeout(() => {
              room.game.resolveRound();
              io.to(roomId).emit("game:state", room.game.getState());

              // Espera 6s mostrando resultado, depois reseta
              setTimeout(() => {
                room.game.resetForNewRound();
                io.to(roomId).emit("game:state", room.game.getState());
              }, 6000);
            }, 2000);
          }, 1000);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to execute action";
        socket.emit("game:error", errorMessage);
        console.error(`[Error] Player action:`, error);
      }
    });

    socket.on("disconnect", () => {
      const { roomId, playerId } = socket.data;
      if (roomId && playerId) {
        roomManager.disconnectPlayer(roomId, playerId);
        io.to(roomId).emit("room:player-disconnected", playerId);
        console.log(`[Socket.IO] ${playerId} disconnected from ${roomId}`);
      }
    });
  });

  // Health check endpoint
  httpServer.on("request", (req, res) => {
    if (req.url === "/api/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          uptime: process.uptime(),
          timestamp: Date.now(),
        }),
      );
    }
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
