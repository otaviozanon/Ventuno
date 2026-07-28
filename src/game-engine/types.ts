export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type CardValue =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface Card {
  suit: Suit;
  value: CardValue;
  isHidden?: boolean;
}

export type HandResult = "WIN" | "LOSE" | "PUSH" | "BLACKJACK";
export type PlayerStatus =
  | "WAITING"
  | "PLAYING"
  | "STAND"
  | "BUST"
  | "BLACKJACK";
export type GamePhase = "BETTING" | "PLAYING" | "DEALER_TURN" | "RESULTS";

export interface PlayerGameState {
  id: string;
  balance: number;
  bet: number;
  betConfirmed: boolean;
  hand: Card[];
  splitHand?: Card[];
  status: PlayerStatus;
  hasActed: boolean;
  rebuysUsed: number;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  hands: Card[][];
  bet: number;
  active: boolean;
  status:
    | "waiting"
    | "betting"
    | "playing"
    | "stand"
    | "bust"
    | "folded"
    | "blackjack"
    | "won"
    | "push"
    | "lost";
  rebuysUsed: number;
}

export interface GameResult {
  playerId: string;
  result: HandResult;
  payout: number;
  newBalance: number;
}

export interface RoomState {
  id: string;
  players: Player[];
  playAgainVotes: string[];
}

export interface GameState {
  phase: "lobby" | "betting" | "dealing" | "playing" | "dealer" | "resolution";
  players: Player[];
  dealer: {
    hand: Card[];
  };
  currentPlayerIndex: number;
  deck: Card[];
}
