import { isCardDuplicate, isCardPlayable } from "./gameUtils";

describe("isCardPlayable", () => {
  const rankOrder = ["2", "4", "5", "6", "7", "8", "9", "j", "q", "k", "a"];

  test("should allow any card when the pile is empty", () => {
    const card = { rank: "5", suit: "hearts" };
    expect(isCardPlayable(card, null)).toBe(true); // Empty pile
  });

  test("should allow a 10 to be played", () => {
    const card = { rank: "10", suit: "hearts" };
    const topCard = { rank: "7", suit: "spades" };
    expect(isCardPlayable(card, topCard)).toBe(true); // 10 can be played anytime
  });

  test("should allow a 3 to be played", () => {
    const card = { rank: "3", suit: "diamonds" };
    const topCard = { rank: "7", suit: "clubs" };
    expect(isCardPlayable(card, topCard)).toBe(true); // 3 can be played anytime
  });

  test("should allow a card of equal rank to be played", () => {
    const card = { rank: "7", suit: "hearts" };
    const topCard = { rank: "7", suit: "spades" };
    expect(isCardPlayable(card, topCard)).toBe(true); // 7 can be played on another 7
  });

  test("should allow a card that is higher to be played", () => {
    const card = { rank: "8", suit: "diamonds" };
    const topCard = { rank: "6", suit: "hearts" };
    expect(isCardPlayable(card, topCard)).toBe(true); // 8 is one rank higher than 7
  });

  test("should not allow a card lower in rank than the top card to be played", () => {
    const card = { rank: "6", suit: "clubs" };
    const topCard = { rank: "8", suit: "spades" };
    expect(isCardPlayable(card, topCard)).toBe(false); // 6 cannot be played on a 7
  });

  test("should allow a card on top of a 7 only if it is lower in rank", () => {
    const card = { rank: "6", suit: "hearts" };
    const topCard = { rank: "7", suit: "clubs" };
    expect(isCardPlayable(card, topCard)).toBe(true); // 6 can be played on 7

    const card2 = { rank: "8", suit: "spades" };
    expect(isCardPlayable(card2, topCard)).toBe(false); // 8 cannot be played on 7
  });

  test("should return true if card is duplicate in hand", () => {
    const card = { rank: "6", suit: "hearts" };
    const hand = [
      { rank: "6", suit: "hearts" },
      { rank: "7", suit: "clubs" },
      { rank: "6", suit: "spades" },
    ];
    expect(isCardDuplicate(card, hand)).toBe(true);
  });

  test("card already in multipleCard array should return true", () => {
    const card = { rank: "6", suit: "hearts" };
    const multipleCards = [{ rank: "6", suit: "hearts" }];
    expect(
      !!multipleCards.find((c) => c.rank === card.rank && c.suit === card.suit)
    ).toBe(true);
  });
});
