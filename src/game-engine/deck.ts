import type { Card, Suit, CardValue } from "./types";

const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const values: CardValue[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

export function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCard(deck: Card[]): { card: Card; remainingDeck: Card[] } {
  const remainingDeck = [...deck];
  const card = remainingDeck.pop()!;
  return { card, remainingDeck };
}
