import { describe, it, expect } from "vitest";
import { createDeck, shuffle, dealCard } from "../deck";

describe("deck", () => {
  describe("createDeck", () => {
    it("should return 52 unique cards", () => {
      const deck = createDeck();
      expect(deck.length).toBe(52);

      const uniqueCards = new Set(deck.map((c) => `${c.suit}-${c.value}`));
      expect(uniqueCards.size).toBe(52);
    });

    it("should have 13 cards of each suit", () => {
      const deck = createDeck();
      const hearts = deck.filter((c) => c.suit === "hearts");
      const diamonds = deck.filter((c) => c.suit === "diamonds");
      const clubs = deck.filter((c) => c.suit === "clubs");
      const spades = deck.filter((c) => c.suit === "spades");

      expect(hearts.length).toBe(13);
      expect(diamonds.length).toBe(13);
      expect(clubs.length).toBe(13);
      expect(spades.length).toBe(13);
    });
  });

  describe("shuffle", () => {
    it("should not lose cards", () => {
      const deck = createDeck();
      const shuffled = shuffle(deck);
      expect(shuffled.length).toBe(52);
    });

    it("should randomize order (probabilistic)", () => {
      const deck = createDeck();
      const shuffled = shuffle([...deck]);

      const samePosition = deck.filter(
        (c, i) => c.suit === shuffled[i].suit && c.value === shuffled[i].value,
      );
      expect(samePosition.length).toBeLessThan(52);
    });
  });

  describe("dealCard", () => {
    it("should return card and remaining deck", () => {
      const deck = createDeck();
      const { card, remainingDeck } = dealCard(deck);

      expect(card).toBeDefined();
      expect(card.suit).toBeDefined();
      expect(card.value).toBeDefined();
      expect(remainingDeck.length).toBe(51);
    });

    it("should remove dealt card from deck", () => {
      const deck = createDeck();
      const { card, remainingDeck } = dealCard(deck);

      const foundInRemaining = remainingDeck.find(
        (c) => c.suit === card.suit && c.value === card.value,
      );
      expect(foundInRemaining).toBeUndefined();
    });
  });
});
