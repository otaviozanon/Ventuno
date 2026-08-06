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
const rateLimiter = new Map<string, number>();
const RATE_LIMIT_MS = 300;
const roomTimers = new Map<string, ReturnType<typeof setTimeout>[]>();

function checkRate(socketId: string): boolean {
  const now = Date.now();
  const last = rateLimiter.get(socketId) || 0;
  if (now - last < RATE_LIMIT_MS) return false;
  rateLimiter.set(socketId, now);
  return true;
}

function addRoomTimer(roomId: string, timer: ReturnType<typeof setTimeout>): void {
  const timers = roomTimers.get(roomId) || [];
  timers.push(timer);
  roomTimers.set(roomId, timers);
}

function clearRoomTimers(roomId: string): void {
  const timers = roomTimers.get(roomId);
  if (timers) {
    for (const t of timers) clearTimeout(t);
    roomTimers.delete(roomId);
  }
}

setInterval(() => roomManager.cleanupInactiveRooms(), 5 * 60 * 1000);

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_WS_URL || "https://vigintiunus.onrender.com",
        methods: ["GET", "POST"],
        credentials: true,
      },
      maxHttpBufferSize: 1e6,
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
    },
  );

  io.on("connection", (socket) => {
    if (!checkRate(socket.id)) return;

    socket.on("room:create", (playerName, callback) => {
      try {
        const sanitized = playerName?.trim().replace(/[<>]/g, "").slice(0, 20);
        if (!sanitized) { socket.emit("game:error", "Invalid name"); return; }
        const roomId = roomManager.createRoom(sanitized);
        const room = roomManager.getRoom(roomId)!;
        const hostId = room.host;
        roomManager.updatePlayerSocket(roomId, hostId, socket.id);
        socket.data.roomId = roomId;
        socket.data.playerId = hostId;
        socket.join(roomId);
        callback(roomId, hostId);
        io.to(roomId).emit("game:state", room.game.getState());
      } catch (error) {
        socket.emit("game:error", "Failed to create room");
      }
    });

    socket.on("room:join", (roomId, playerName, callback) => {
      try {
        const sanitized = playerName?.trim().replace(/[<>]/g, "").slice(0, 20);
        if (!sanitized || !roomId) { callback(false); return; }
        const playerId = roomManager.joinRoom(roomId, sanitized);
        if (!playerId) { callback(false); return; }
        const room = roomManager.getRoom(roomId)!;
        roomManager.updatePlayerSocket(roomId, playerId, socket.id);
        socket.data.roomId = roomId;
        socket.data.playerId = playerId;
        socket.join(roomId);
        callback(true, playerId);
        io.to(roomId).emit("game:state", room.game.getState());
        io.to(roomId).emit("room:joined", roomId, playerId);
      } catch {
        socket.emit("game:error", "Failed to join room");
      }
    });

    socket.on("room:leave", () => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;
      roomManager.leaveRoom(roomId, playerId);
      socket.leave(roomId);
      io.to(roomId).emit("room:left", playerId);
    });

    socket.on("game:start-round", () => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;
      try {
        const room = roomManager.getRoom(roomId);
        if (!room || room.host !== playerId) {
          socket.emit("game:error", "Only host can start");
          return;
        }
        room.game.startRound();
        io.to(roomId).emit("game:state", room.game.getState());
      } catch (error) {
        socket.emit("game:error", "Failed to start round");
      }
    });

    socket.on("game:place-bet", (amount) => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 10 || amount > 10000) {
        socket.emit("game:error", "Invalid bet amount");
        return;
      }
      try {
        const room = roomManager.getRoom(roomId)!;
        room.game.placeBet(playerId, amount);
        io.to(roomId).emit("game:state", room.game.getState());
      } catch (error) {
        socket.emit("game:error", error instanceof Error ? error.message : "Failed to place bet");
      }
    });

    socket.on("game:confirm-bet", () => {
      const { roomId, playerId } = socket.data;
      if (!playerId || !roomId) return;
      try {
        const room = roomManager.getRoom(roomId)!;
        const allConfirmed = room.game.confirmPlayerBet(playerId);
        io.to(roomId).emit("game:state", room.game.getState());
        if (allConfirmed) {
          const t = setTimeout(() => {
            const r = roomManager.getRoom(roomId);
            if (!r) return;
            r.game.startDealing();
            io.to(roomId).emit("game:state", r.game.getState());
          }, 800);
          addRoomTimer(roomId, t);
        }
      } catch (error) {
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
        if (gameState.phase === "dealer") {
          const t1 = setTimeout(() => {
            const r = roomManager.getRoom(roomId);
            if (!r) return;
            r.game.playDealer();
            io.to(roomId).emit("game:state", r.game.getState());
            const t2 = setTimeout(() => {
              const r2 = roomManager.getRoom(roomId);
              if (!r2) return;
              r2.game.resolveRound();
              io.to(roomId).emit("game:state", r2.game.getState());
              const t3 = setTimeout(() => {
                const r3 = roomManager.getRoom(roomId);
                if (!r3) return;
                r3.game.resetForNewRound();
                io.to(roomId).emit("game:state", r3.game.getState());
              }, 6000);
              addRoomTimer(roomId, t3);
            }, 2000);
            addRoomTimer(roomId, t2);
          }, 1000);
          addRoomTimer(roomId, t1);
        }
      } catch (error) {
        socket.emit("game:error", error instanceof Error ? error.message : "Failed to execute action");
      }
    });

    socket.on("game:rebuy", () => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;
      try {
        const room = roomManager.getRoom(roomId)!;
        room.game.rebuy(playerId);
        io.to(roomId).emit("game:state", room.game.getState());
      } catch (error) {
        socket.emit("game:error", error instanceof Error ? error.message : "Failed to rebuy");
      }
    });

    socket.on("player:reconnect", (roomId: string, playerId: string) => {
      if (!roomId || !playerId) return;
      const room = roomManager.getRoom(roomId);
      if (!room) { socket.emit("game:error", "Room not found"); return; }
      roomManager.updatePlayerSocket(roomId, playerId, socket.id);
      socket.data.roomId = roomId;
      socket.data.playerId = playerId;
      socket.join(roomId);
      io.to(roomId).emit("room:player-reconnected", playerId);
      socket.emit("game:state", room.game.getState());
    });

    socket.on("disconnect", () => {
      const { roomId, playerId } = socket.data;
      if (roomId && playerId) {
        roomManager.disconnectPlayer(roomId, playerId);
        io.to(roomId).emit("room:player-disconnected", playerId);
      }
      clearRoomTimers(socket.id);
    });
  });

  httpServer.on("request", (req, res) => {
    if (req.url === "/api/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", uptime: process.uptime(), timestamp: Date.now() }));
    }
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    }
    throw err;
  });

  function gracefulShutdown(signal: string) {
    console.log(`\n> Received ${signal}, shutting down...`);
    io.close(() => httpServer.close(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10000);
  }
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
});
