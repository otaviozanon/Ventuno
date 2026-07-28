import { describe, it, expect } from "vitest";
import {
  calculateHandValue,
  isBlackjack,
  isBust,
  canSplit,
  canDouble,
  resolveHand,
} from "../rules";
import type { Card } from "../types";

describe("rules", () => {
  describe("calculateHandValue", () => {
    it("should calculate number cards correctly", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "5" },
        { suit: "clubs", value: "7" },
      ];
      expect(calculateHandValue(hand)).toBe(12);
    });

    it("should count face cards as 10", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "K" },
        { suit: "clubs", value: "Q" },
      ];
      expect(calculateHandValue(hand)).toBe(20);
    });

    it("should count Ace as 11 when safe", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "A" },
        { suit: "clubs", value: "9" },
      ];
      expect(calculateHandValue(hand)).toBe(20);
    });

    it("should count Ace as 1 to avoid bust", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "A" },
        { suit: "clubs", value: "9" },
        { suit: "diamonds", value: "8" },
      ];
      expect(calculateHandValue(hand)).toBe(18);
    });

    it("should handle multiple Aces", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "A" },
        { suit: "clubs", value: "A" },
        { suit: "diamonds", value: "9" },
      ];
      expect(calculateHandValue(hand)).toBe(21);
    });
  });

  describe("isBlackjack", () => {
    it("should detect Ace + 10", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "A" },
        { suit: "clubs", value: "10" },
      ];
      expect(isBlackjack(hand)).toBe(true);
    });

    it("should detect Ace + face card", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "A" },
        { suit: "clubs", value: "K" },
      ];
      expect(isBlackjack(hand)).toBe(true);
    });

    it("should reject 21 with 3+ cards", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "7" },
        { suit: "clubs", value: "7" },
        { suit: "diamonds", value: "7" },
      ];
      expect(isBlackjack(hand)).toBe(false);
    });
  });

  describe("isBust", () => {
    it("should detect bust", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "10" },
        { suit: "clubs", value: "K" },
        { suit: "diamonds", value: "5" },
      ];
      expect(isBust(hand)).toBe(true);
    });

    it("should not detect bust at 21", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "A" },
        { suit: "clubs", value: "K" },
      ];
      expect(isBust(hand)).toBe(false);
    });
  });

  describe("canSplit", () => {
    it("should allow split with same value", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "8" },
        { suit: "clubs", value: "8" },
      ];
      expect(canSplit(hand)).toBe(true);
    });

    it("should allow split with face cards", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "K" },
        { suit: "clubs", value: "Q" },
      ];
      expect(canSplit(hand)).toBe(true);
    });

    it("should reject split with 3 cards", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "8" },
        { suit: "clubs", value: "8" },
        { suit: "diamonds", value: "5" },
      ];
      expect(canSplit(hand)).toBe(false);
    });
  });

  describe("canDouble", () => {
    it("should allow double with 2 cards", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "5" },
        { suit: "clubs", value: "6" },
      ];
      expect(canDouble(hand)).toBe(true);
    });

    it("should reject double with 3+ cards", () => {
      const hand: Card[] = [
        { suit: "hearts", value: "5" },
        { suit: "clubs", value: "3" },
        { suit: "diamonds", value: "2" },
      ];
      expect(canDouble(hand)).toBe(false);
    });
  });

  describe("resolveHand", () => {
    it("should win with higher value", () => {
      const playerHand: Card[] = [
        { suit: "hearts", value: "K" },
        { suit: "clubs", value: "9" },
      ];
      const dealerHand: Card[] = [
        { suit: "hearts", value: "10" },
        { suit: "clubs", value: "7" },
      ];
      expect(resolveHand(playerHand, dealerHand)).toBe("win");
    });

    it("should lose with lower value", () => {
      const playerHand: Card[] = [
        { suit: "hearts", value: "K" },
        { suit: "clubs", value: "5" },
      ];
      const dealerHand: Card[] = [
        { suit: "hearts", value: "10" },
        { suit: "clubs", value: "9" },
      ];
      expect(resolveHand(playerHand, dealerHand)).toBe("lose");
    });

    it("should push on tie", () => {
      const playerHand: Card[] = [
        { suit: "hearts", value: "K" },
        { suit: "clubs", value: "8" },
      ];
      const dealerHand: Card[] = [
        { suit: "hearts", value: "10" },
        { suit: "clubs", value: "8" },
      ];
      expect(resolveHand(playerHand, dealerHand)).toBe("push");
    });

    it("should lose when busted", () => {
      const playerHand: Card[] = [
        { suit: "hearts", value: "K" },
        { suit: "clubs", value: "10" },
        { suit: "diamonds", value: "5" },
      ];
      const dealerHand: Card[] = [
        { suit: "hearts", value: "10" },
        { suit: "clubs", value: "7" },
      ];
      expect(resolveHand(playerHand, dealerHand)).toBe("lose");
    });

    it("should win when dealer busts", () => {
      const playerHand: Card[] = [
        { suit: "hearts", value: "K" },
        { suit: "clubs", value: "9" },
      ];
      const dealerHand: Card[] = [
        { suit: "hearts", value: "10" },
        { suit: "clubs", value: "K" },
        { suit: "diamonds", value: "5" },
      ];
      expect(resolveHand(playerHand, dealerHand)).toBe("win");
    });

    it("should win with blackjack vs 21", () => {
      const playerHand: Card[] = [
        { suit: "hearts", value: "A" },
        { suit: "clubs", value: "K" },
      ];
      const dealerHand: Card[] = [
        { suit: "hearts", value: "7" },
        { suit: "clubs", value: "7" },
        { suit: "diamonds", value: "7" },
      ];
      expect(resolveHand(playerHand, dealerHand)).toBe("blackjack");
    });

    it("should push with both blackjacks", () => {
      const playerHand: Card[] = [
        { suit: "hearts", value: "A" },
        { suit: "clubs", value: "K" },
      ];
      const dealerHand: Card[] = [
        { suit: "diamonds", value: "A" },
        { suit: "spades", value: "Q" },
      ];
      expect(resolveHand(playerHand, dealerHand)).toBe("push");
    });

    it("should lose with 21 vs dealer blackjack", () => {
      const playerHand: Card[] = [
        { suit: "hearts", value: "7" },
        { suit: "clubs", value: "7" },
        { suit: "diamonds", value: "7" },
      ];
      const dealerHand: Card[] = [
        { suit: "hearts", value: "A" },
        { suit: "clubs", value: "K" },
      ];
      expect(resolveHand(playerHand, dealerHand)).toBe("lose");
    });
  });
});
