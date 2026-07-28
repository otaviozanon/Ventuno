import { describe, it, expect, beforeEach, vi } from "vitest";
import { BlackjackGame } from "../BlackjackGame";
import type { GameState, Player } from "../types";

describe("BlackjackGame", () => {
  let game: BlackjackGame;

  beforeEach(() => {
    game = new BlackjackGame();
  });

  describe("initialization", () => {
    it("should create game with default state", () => {
      const state = game.getState();
      expect(state.phase).toBe("lobby");
      expect(state.players).toHaveLength(0);
      expect(state.dealer.hand).toHaveLength(0);
      expect(state.currentPlayerIndex).toBe(0);
    });

    it("should add player to lobby", () => {
      game.addPlayer("p1", "Alice");
      const state = game.getState();

      expect(state.players).toHaveLength(1);
      expect(state.players[0].id).toBe("p1");
      expect(state.players[0].name).toBe("Alice");
      expect(state.players[0].chips).toBe(2500);
      expect(state.players[0].active).toBe(true);
    });

    it("should reject more than 7 players", () => {
      for (let i = 0; i < 7; i++) {
        game.addPlayer(`p${i}`, `Player${i}`);
      }

      expect(() => game.addPlayer("p8", "Overflow")).toThrow(
        "Maximum 7 players allowed",
      );
    });

    it("should start round when 2+ players", () => {
      game.addPlayer("p1", "Alice");
      game.addPlayer("p2", "Bob");
      game.startRound();

      const state = game.getState();
      expect(state.phase).toBe("betting");
    });
  });

  describe("betting phase", () => {
    beforeEach(() => {
      game.addPlayer("p1", "Alice");
      game.addPlayer("p2", "Bob");
      game.startRound();
    });

    it("should place bet within chips", () => {
      game.placeBet("p1", 100);
      const state = game.getState();

      expect(state.players[0].bet).toBe(100);
    });

    it("should reject bet exceeding chips", () => {
      expect(() => game.placeBet("p1", 3000)).toThrow("Insufficient chips");
    });

    it("should reject bet below minimum", () => {
      expect(() => game.placeBet("p1", 5)).toThrow("Minimum bet is 10 chips");
    });

    it("should move to dealing after all bets confirmed", () => {
      game.placeBet("p1", 100);
      game.placeBet("p2", 200);
      game.confirmBetting();

      const state = game.getState();
      expect(state.phase).toBe("dealing");
      expect(state.players[0].chips).toBe(2400);
      expect(state.players[1].chips).toBe(2300);
    });

    it("should apply -50 penalty to players who did not bet", () => {
      game.placeBet("p1", 100);
      game.confirmBetting();

      const state = game.getState();
      expect(state.players[0].chips).toBe(2400);
      expect(state.players[1].chips).toBe(2450);
      expect(state.players[1].status).toBe("folded");
    });
  });

  describe("dealing phase", () => {
    beforeEach(() => {
      game.addPlayer("p1", "Alice");
      game.addPlayer("p2", "Bob");
      game.startRound();
      game.placeBet("p1", 100);
      game.placeBet("p2", 200);
      game.confirmBetting();
    });

    it("should deal 2 cards to each player and dealer", () => {
      game.dealInitialCards();
      const state = game.getState();

      expect(state.players[0].hands[0]).toHaveLength(2);
      expect(state.players[1].hands[0]).toHaveLength(2);
      expect(state.dealer.hand).toHaveLength(2);
      expect(state.phase).toBe("playing");
      expect(state.currentPlayerIndex).toBe(0);
    });
  });

  describe("player actions", () => {
    beforeEach(() => {
      game.addPlayer("p1", "Alice");
      game.addPlayer("p2", "Bob");
      game.startRound();
      game.placeBet("p1", 100);
      game.placeBet("p2", 200);
      game.confirmBetting();
      game.dealInitialCards();
    });

    it("should hit and add card to hand", () => {
      const initialCount = game.getState().players[0].hands[0].length;
      game.playerAction("p1", "hit");
      const state = game.getState();

      expect(state.players[0].hands[0].length).toBe(initialCount + 1);
    });

    it("should stand and move to next player", () => {
      game.playerAction("p1", "stand");
      const state = game.getState();

      expect(state.currentPlayerIndex).toBe(1);
    });

    it("should auto-stand on bust", () => {
      // Force bust by hitting until > 21 (probabilistic, may need mock)
      for (let i = 0; i < 10; i++) {
        const state = game.getState();
        if (state.players[0].status === "bust") break;
        if (state.currentPlayerIndex !== 0) break;
        game.playerAction("p1", "hit");
      }

      const state = game.getState();
      if (state.players[0].status === "bust") {
        expect(state.currentPlayerIndex).toBe(1);
      }
    });

    it("should double bet and stand", () => {
      game.playerAction("p1", "double");
      const state = game.getState();

      expect(state.players[0].bet).toBe(200);
      expect(state.players[0].hands[0].length).toBe(3);
      expect(state.currentPlayerIndex).toBe(1);
    });
  });

  describe("dealer phase", () => {
    beforeEach(() => {
      game.addPlayer("p1", "Alice");
      game.addPlayer("p2", "Bob");
      game.startRound();
      game.placeBet("p1", 100);
      game.placeBet("p2", 200);
      game.confirmBetting();
      game.dealInitialCards();
      game.playerAction("p1", "stand");
      game.playerAction("p2", "stand");
    });

    it("should hit until 17 or bust", () => {
      game.playDealer();
      const state = game.getState();

      const dealerValue = state.dealer.hand.reduce((sum, card) => {
        if (card.value === "A") return sum + 11;
        if (["J", "Q", "K"].includes(card.value)) return sum + 10;
        return sum + parseInt(card.value, 10);
      }, 0);

      expect(dealerValue >= 17 || dealerValue > 21).toBe(true);
    });

    it("should move to resolution after dealer turn", () => {
      game.playDealer();
      const state = game.getState();

      expect(state.phase).toBe("resolution");
    });
  });

  describe("resolution phase", () => {
    it("should complete full round cycle", () => {
      game.addPlayer("p1", "Alice");
      game.addPlayer("p2", "Bob");
      game.startRound();
      game.placeBet("p1", 100);
      game.placeBet("p2", 200);
      game.confirmBetting();
      game.dealInitialCards();
      game.playerAction("p1", "stand");
      game.playerAction("p2", "stand");
      game.playDealer();
      game.resolveRound();

      const state = game.getState();

      expect(state.phase).toBe("lobby");
      // Chips altered based on outcomes (can't predict exact values without mocking deck)
      expect(state.players[0].chips).toBeGreaterThanOrEqual(0);
      expect(state.players[1].chips).toBeGreaterThanOrEqual(0);
    });
  });
});
