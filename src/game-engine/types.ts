export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type CardValue =
  | "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "J" | "Q" | "K";

export interface Card {
  suit: Suit;
  value: CardValue;
  isHidden?: boolean;
}

export type HandResult = "WIN" | "LOSE" | "PUSH" | "BLACKJACK";

export interface Player {
  id: string;
  name: string;
  chips: number;
  hands: Card[][];
  bet: number;
  active: boolean;
  betConfirmed: boolean;
  status: "waiting" | "betting" | "playing" | "stand" | "bust" | "folded" | "blackjack" | "won" | "push" | "lost";
  rebuysUsed: number;
}

export interface GameState {
  phase: "lobby" | "betting" | "dealing" | "playing" | "dealer" | "resolution";
  players: Player[];
  dealer: { hand: Card[] };
  currentPlayerIndex: number;
  winnerDeclared: boolean;
}
