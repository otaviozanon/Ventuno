import type { GameState, Player, Card } from "./types";
import { createDeck, shuffle, dealCard } from "./deck";
import {
  calculateHandValue,
  isBust,
  canDouble,
  resolveHand,
  isBlackjack,
} from "./rules";

export class BlackjackGame {
  private state: GameState;

  constructor() {
    this.state = {
      phase: "lobby",
      players: [],
      dealer: { hand: [] },
      currentPlayerIndex: 0,
      winnerDeclared: false,
    };
  }

  getState(): GameState {
    const { deck, ...rest } = this.state as any;
    return JSON.parse(JSON.stringify(rest));
  }

  addPlayer(id: string, name: string): void {
    if (this.state.players.length >= 7) {
      throw new Error("Maximum 7 players allowed");
    }
    const newPlayer: Player = {
      id,
      name,
      chips: 2500,
      hands: [],
      bet: 0,
      active: true,
      status: "waiting",
      betConfirmed: false,
      rebuysUsed: 0,
    };
    this.state.players.push(newPlayer);
  }

  startRound(): void {
    if (this.state.players.length < 2) {
      throw new Error("At least 2 players required");
    }
    this.state.phase = "betting";
    (this.state as any).deck = shuffle(createDeck());
    this.state.currentPlayerIndex = 0;
    this.state.winnerDeclared = false;
    for (const player of this.state.players) {
      player.hands = [];
      player.bet = 0;
      player.status = "betting";
      player.betConfirmed = false;
    }
  }

  placeBet(playerId: string, amount: number): void {
    if (this.state.phase !== "betting") throw new Error("Not in betting phase");
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found");
    if (amount < 10) throw new Error("Minimum bet is 10 chips");
    if (amount > player.chips) throw new Error("Insufficient chips");
    if (!Number.isInteger(amount)) throw new Error("Bet must be an integer");
    player.bet = amount;
  }

  confirmPlayerBet(playerId: string): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.bet < 10) return false;
    player.betConfirmed = true;
    const allConfirmed = this.state.players.every(
      (p) => p.betConfirmed || p.status === "folded",
    );
    return allConfirmed;
  }

  startDealing(): void {
    if (this.state.phase !== "betting") return;
    for (const player of this.state.players) {
      if (player.bet === 0) {
        player.chips = Math.max(0, player.chips - 50);
        player.status = "folded";
      } else {
        player.chips -= player.bet;
        player.status = "playing";
      }
    }
    this.state.dealer.hand = [];
    for (const player of this.state.players) {
      player.hands = [];
    }
    this.state.phase = "dealing";
    this.dealCards();
  }

  private dealCards(): void {
    const deck = (this.state as any).deck as Card[];
    if (!deck) throw new Error("Deck not initialized");
    for (const player of this.state.players) {
      if (player.status === "playing") {
        const hand: Card[] = [];
        for (let i = 0; i < 2; i++) {
          if (deck.length === 0) break;
          const { card, remainingDeck } = dealCard(deck);
          hand.push(card);
          deck.splice(0, deck.length, ...remainingDeck);
        }
        player.hands = [hand];
        if (isBlackjack(hand)) {
          player.status = "blackjack";
        }
      }
    }
    for (let i = 0; i < 2; i++) {
      if (deck.length === 0) break;
      const { card, remainingDeck } = dealCard(deck);
      this.state.dealer.hand.push(card);
      deck.splice(0, deck.length, ...remainingDeck);
    }
    this.state.phase = "playing";
    this.state.currentPlayerIndex = 0;
    this.skipBlackjackPlayers();
  }

  private skipBlackjackPlayers(): void {
    while (
      this.state.currentPlayerIndex < this.state.players.length &&
      this.state.players[this.state.currentPlayerIndex].status === "blackjack"
    ) {
      this.state.currentPlayerIndex++;
    }
    if (this.state.currentPlayerIndex >= this.state.players.length) {
      this.state.phase = "dealer";
    }
  }

  playerAction(
    playerId: string,
    action: "hit" | "stand" | "double" | "split",
  ): void {
    const playerIdx = this.state.players.findIndex((p) => p.id === playerId);
    if (playerIdx === -1) throw new Error("Player not found");
    if (this.state.currentPlayerIndex !== playerIdx) throw new Error("Not your turn");
    if (this.state.phase !== "playing") throw new Error("Not in playing phase");

    const player = this.state.players[playerIdx];
    if (player.status !== "playing" && player.status !== "blackjack") {
      throw new Error("Player cannot act now");
    }

    const deck = (this.state as any).deck as Card[];
    const hand = player.hands[0];

    if (action === "hit") {
      if (deck.length === 0) throw new Error("Deck is empty");
      const { card, remainingDeck } = dealCard(deck);
      hand.push(card);
      deck.splice(0, deck.length, ...remainingDeck);
      if (isBust(hand)) {
        player.status = "bust";
        this.nextPlayer();
      }
    } else if (action === "stand") {
      this.nextPlayer();
    } else if (action === "double") {
      if (!canDouble(hand)) throw new Error("Cannot double");
      if (player.bet > player.chips) throw new Error("Insufficient chips for double");
      player.chips -= player.bet;
      player.bet *= 2;
      if (deck.length === 0) throw new Error("Deck is empty");
      const { card, remainingDeck } = dealCard(deck);
      hand.push(card);
      deck.splice(0, deck.length, ...remainingDeck);
      if (isBust(hand)) player.status = "bust";
      this.nextPlayer();
    }
  }

  private nextPlayer(): void {
    this.state.currentPlayerIndex++;
    while (this.state.currentPlayerIndex < this.state.players.length) {
      const status = this.state.players[this.state.currentPlayerIndex].status;
      if (status === "playing") break;
      if (status === "blackjack") {
        this.state.currentPlayerIndex++;
        continue;
      }
      this.state.currentPlayerIndex++;
    }
    if (this.state.currentPlayerIndex >= this.state.players.length) {
      this.state.phase = "dealer";
    }
  }

  playDealer(): void {
    const deck = (this.state as any).deck as Card[];
    while (calculateHandValue(this.state.dealer.hand) < 17) {
      if (deck.length === 0) break;
      const { card, remainingDeck } = dealCard(deck);
      this.state.dealer.hand.push(card);
      deck.splice(0, deck.length, ...remainingDeck);
    }
    this.state.phase = "resolution";
  }

  resolveRound(): void {
    for (const player of this.state.players) {
      if (player.status === "playing" || player.status === "blackjack") {
        const hand = player.hands[0];
        const result = resolveHand(hand, this.state.dealer.hand);
        if (result === "blackjack") {
          player.chips += Math.floor(player.bet * 2.5);
          player.status = "won";
        } else if (result === "win") {
          player.chips += player.bet * 2;
          player.status = "won";
        } else if (result === "push") {
          player.chips += player.bet;
          player.status = "push";
        } else {
          player.status = "lost";
        }
      }
    }
    const winner = this.state.players.find(
      (p) => p.chips >= 5000 && (p.status === "won" || p.status === "push" || p.status === "blackjack"),
    );
    if (winner) this.state.winnerDeclared = true;
    this.state.phase = "resolution";
  }

  resetForNewRound(): void {
    for (const player of this.state.players) {
      player.hands = [];
      player.bet = 0;
      player.betConfirmed = false;
      if (player.chips <= 0 && player.rebuysUsed >= 3) {
        player.status = "folded";
      } else if (player.status !== "folded") {
        player.status = "betting";
      }
    }
    this.state.dealer.hand = [];
    this.state.phase = "betting";
  }

  rebuy(playerId: string): void {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found");
    if (player.chips > 0) throw new Error("Player still has chips");
    if (player.rebuysUsed >= 3) throw new Error("Maximum rebuys reached (3)");
    player.chips = 1000;
    player.rebuysUsed++;
    player.status = "betting";
    player.bet = 0;
    player.betConfirmed = false;
  }
}
