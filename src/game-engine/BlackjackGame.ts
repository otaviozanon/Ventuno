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
      deck: [],
    };
  }

  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
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
      rebuysUsed: 0,
    };

    this.state.players.push(newPlayer);
  }

  startRound(): void {
    if (this.state.players.length < 2) {
      throw new Error("At least 2 players required");
    }

    this.state.phase = "betting";
    this.state.deck = shuffle(createDeck());
    this.state.currentPlayerIndex = 0;

    for (const player of this.state.players) {
      player.hands = [];
      player.bet = 0;
      player.status = "betting";
    }
  }

  placeBet(playerId: string, amount: number): void {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found");

    if (amount < 10) throw new Error("Minimum bet is 10 chips");
    if (amount > player.chips) throw new Error("Insufficient chips");

    player.bet = amount;
  }

  confirmPlayerBet(playerId: string): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.bet < 10) {
      return false;
    }

    (player as any).betConfirmed = true;

    // Verifica se todos confirmaram
    const allConfirmed = this.state.players.every(
      (p) => (p as any).betConfirmed || p.status === "folded",
    );

    return allConfirmed;
  }

  confirmBetting(): void {
    if (this.state.phase !== "betting") {
      console.warn(
        "[BlackjackGame] confirmBetting called but phase is not betting:",
        this.state.phase,
      );
      return; // Previne chamada duplicada
    }

    console.log(
      `[BlackjackGame] confirmBetting START - dealer.hand.length: ${this.state.dealer.hand.length}`,
    );

    for (const player of this.state.players) {
      const chipsBefore = player.chips;
      if (player.bet === 0) {
        player.chips -= 50;
        player.status = "folded";
      } else {
        player.chips -= player.bet;
        player.status = "playing";
      }
      console.log(
        `[BlackjackGame] ${player.name}: chips ${chipsBefore} → ${player.chips} (bet: ${player.bet})`,
      );
    }

    // Limpa dealer e players antes de nova rodada
    this.state.dealer.hand = [];
    for (const player of this.state.players) {
      player.hands = [];
    }

    console.log(
      `[BlackjackGame] confirmBetting END - dealer.hand.length: ${this.state.dealer.hand.length}`,
    );

    this.state.phase = "dealing";
  }

  dealInitialCards(): void {
    if (this.state.phase !== "dealing") {
      console.warn(
        "[BlackjackGame] dealInitialCards called but phase is not dealing:",
        this.state.phase,
      );
      return; // Previne chamada duplicada
    }

    console.log(
      `[BlackjackGame] dealInitialCards START - dealer.hand.length: ${this.state.dealer.hand.length}`,
    );

    for (const player of this.state.players) {
      if (player.status === "playing") {
        const hand: Card[] = [];
        for (let i = 0; i < 2; i++) {
          const { card, remainingDeck } = dealCard(this.state.deck);
          hand.push(card);
          this.state.deck = remainingDeck;
        }
        player.hands = [hand];

        // Detecta BLACKJACK imediatamente
        if (isBlackjack(hand)) {
          player.status = "blackjack";
          console.log(`[BlackjackGame] ${player.name} got BLACKJACK!`);
        }
      }
    }

    console.log(
      `[BlackjackGame] Players dealt - dealer.hand.length: ${this.state.dealer.hand.length}`,
    );

    for (let i = 0; i < 2; i++) {
      const { card, remainingDeck } = dealCard(this.state.deck);
      this.state.dealer.hand.push(card);
      this.state.deck = remainingDeck;
      console.log(
        `[BlackjackGame] Dealer card ${i + 1} dealt - total: ${this.state.dealer.hand.length}`,
      );
    }

    console.log(
      `[BlackjackGame] dealInitialCards END - dealer.hand: ${this.state.dealer.hand.length} cards`,
    );

    this.state.phase = "playing";
    this.state.currentPlayerIndex = 0;
  }

  playerAction(
    playerId: string,
    action: "hit" | "stand" | "double" | "split",
  ): void {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found");

    const hand = player.hands[0];

    if (action === "hit") {
      const { card, remainingDeck } = dealCard(this.state.deck);
      hand.push(card);
      this.state.deck = remainingDeck;

      if (isBust(hand)) {
        player.status = "bust";
        this.nextPlayer();
      }
    } else if (action === "stand") {
      this.nextPlayer();
    } else if (action === "double") {
      if (!canDouble(hand)) throw new Error("Cannot double");
      if (player.bet > player.chips)
        throw new Error("Insufficient chips for double");

      player.chips -= player.bet;
      player.bet *= 2;

      const { card, remainingDeck } = dealCard(this.state.deck);
      hand.push(card);
      this.state.deck = remainingDeck;

      if (isBust(hand)) {
        player.status = "bust";
      }

      this.nextPlayer();
    }
  }

  private nextPlayer(): void {
    this.state.currentPlayerIndex++;

    while (
      this.state.currentPlayerIndex < this.state.players.length &&
      this.state.players[this.state.currentPlayerIndex].status !== "playing"
    ) {
      this.state.currentPlayerIndex++;
    }

    console.log(
      `[BlackjackGame] nextPlayer: currentPlayerIndex=${this.state.currentPlayerIndex}, total=${this.state.players.length}`,
    );
    console.log(
      `[BlackjackGame] Players status:`,
      this.state.players.map((p) => `${p.name}:${p.status}`),
    );

    if (this.state.currentPlayerIndex >= this.state.players.length) {
      console.log(`[BlackjackGame] All players done → phase = dealer`);
      this.state.phase = "dealer";
    }
  }

  playDealer(): void {
    while (calculateHandValue(this.state.dealer.hand) < 17) {
      const { card, remainingDeck } = dealCard(this.state.deck);
      this.state.dealer.hand.push(card);
      this.state.deck = remainingDeck;
    }

    this.state.phase = "resolution";
  }

  resolveRound(): void {
    console.log(`[BlackjackGame] resolveRound START`);

    for (const player of this.state.players) {
      // Processa apenas players que jogaram (não bust/blackjack já definido)
      if (player.status === "playing" || player.status === "blackjack") {
        const hand = player.hands[0];
        const result = resolveHand(hand, this.state.dealer.hand);

        console.log(`[BlackjackGame] ${player.name}: ${result}`);

        if (result === "blackjack") {
          player.chips += Math.floor(player.bet * 2.5);
          player.status = "won"; // Status específico para WIN
        } else if (result === "win") {
          player.chips += player.bet * 2;
          player.status = "won"; // Status específico para WIN
        } else if (result === "push") {
          player.chips += player.bet;
          player.status = "push"; // Status específico para EMPATE
        } else {
          player.status = "lost"; // Perdeu
        }
      }
      // BUST já tem status = "bust" (definido em playerAction)
      // BLACKJACK já tem status = "blackjack" (definido em dealInitialCards)
      // NÃO reseta aqui! Precisa mostrar resultado por 6s
    }

    // Muda para resolution para exibir badges
    this.state.phase = "resolution";
    console.log(`[BlackjackGame] resolveRound END - phase = resolution`);
  }

  // Nova função para resetar após mostrar resultado
  resetForNewRound(): void {
    console.log(`[BlackjackGame] resetForNewRound`);

    for (const player of this.state.players) {
      player.hands = [];
      player.bet = 0;
      (player as any).betConfirmed = false; // Reset confirmação de aposta
      // NÃO reseta chips - eles acumulam entre rodadas!
      // NÃO reseta status - será definido em confirmBetting
    }

    // Reset dealer
    this.state.dealer.hand = [];

    // Volta para betting
    this.state.phase = "betting";
  }
}
