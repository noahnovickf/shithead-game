// Helper function to determine if a card is playable
export const isCardPlayable = (card, topCard) => {
  // playing on an empty pile is always allowed
  if (!topCard) return true;

  const rankOrder = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "j",
    "q",
    "k",
    "a",
  ];

  // If card is a 10 or 3, it can always be played
  if (card.rank === "10") {
    return true;
  }
  if (card.rank === "3") {
    return true;
  }

  // If the card is equal in rank to the top card, it can be played
  if (card.rank === topCard.rank) {
    return true;
  }

  // If the card is higher than the top card, it can be played (but not by more than one rank)
  const topCardRankIndex = rankOrder.indexOf(topCard.rank);
  const cardRankIndex = rankOrder.indexOf(card.rank);

  if (topCard.rank === "7") {
    if (cardRankIndex < topCardRankIndex) {
      return true;
    } else {
      return false;
    }
  }

  if (cardRankIndex > topCardRankIndex) {
    return true;
  }

  return false;
};

export const isCardDuplicate = (card, hand) => {
  const duplicates = hand.filter((c) => c.rank === card.rank);
  return duplicates.length > 1;
};

export const updateCardSpacing = (handSize, isMobile) => {
  const root = document.documentElement;

  const dynamicMargin = isMobile ? -6.5 : -8.5;

  if (handSize > 3 && handSize < 12) {
    const spacing = handSize * dynamicMargin;
    root.style.setProperty("--dynamic-margin", `${spacing}px`);
  } else if (handSize >= 12) {
    root.style.setProperty("--dynamic-margin", isMobile ? "-75px" : "-100px");
  } else root.style.setProperty("--dynamic-margin", "0px");
};
