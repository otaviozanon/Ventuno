import type { Card } from "./types";

export function calculateHandValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    // Proteção contra cartas null/undefined
    if (!card || !card.value) continue;

    if (card.value === "A") {
      aces++;
      total += 11;
    } else if (["J", "Q", "K"].includes(card.value)) {
      total += 10;
    } else {
      total += parseInt(card.value, 10);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calculateHandValue(hand) === 21;
}

export function isBust(hand: Card[]): boolean {
  return calculateHandValue(hand) > 21;
}

export function canSplit(hand: Card[]): boolean {
  if (hand.length !== 2) return false;

  const [card1, card2] = hand;
  const value1 = ["J", "Q", "K"].includes(card1.value) ? "10" : card1.value;
  const value2 = ["J", "Q", "K"].includes(card2.value) ? "10" : card2.value;

  return value1 === value2;
}

export function canDouble(hand: Card[]): boolean {
  return hand.length === 2;
}

export function resolveHand(
  playerHand: Card[],
  dealerHand: Card[],
): "win" | "lose" | "push" | "blackjack" {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);
  const playerBJ = isBlackjack(playerHand);
  const dealerBJ = isBlackjack(dealerHand);

  if (playerBJ && dealerBJ) return "push";
  if (playerBJ) return "blackjack";
  if (dealerBJ) return "lose";

  if (playerValue > 21) return "lose";
  if (dealerValue > 21) return "win";

  if (playerValue > dealerValue) return "win";
  if (playerValue < dealerValue) return "lose";
  return "push";
}
