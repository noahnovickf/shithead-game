const { games } = require("./gameState");

const Phases = {
  START: "start",
  SWAP: "swap",
  PLAYING: "playing",
  END: "end",
};

// Generate a standard deck of cards
function generateDeck() {
  const suits = ["H", "D", "C", "S"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "j",
    "q",
    "k",
    "a",
  ];
  const deck = [];

  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({ rank, suit });
    });
  });

  return deck;
}

// Fisher-Yates Shuffle Algorithm
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function initializeGame(gameId) {
  const deck = generateDeck();
  shuffle(deck);
  const game = games[gameId];

  // Distribute cards to players
  Object.keys(game.players).forEach((playerId) => {
    game.players[playerId].faceDown = deck.splice(0, 3); // 3 face-down cards
    game.players[playerId].faceUp = deck.splice(0, 3); // 3 face-up cards
    game.players[playerId].hand = deck.splice(0, 3); // 3 cards in hand
    game.players[playerId].ready = false;
  });
  game.lastPlayed = null;
  game.deck = deck; // Remaining cards for drawing
  game.cardPile = []; // Start with an empty pile
  game.phase = Phases.SWAP;
}

const isCardPlayable = (card, topCard) => {
  // playing on an empty pile is always allowed
  if (!topCard) return true;

  const rankOrder = ["2", "4", "5", "6", "7", "8", "9", "j", "q", "k", "a"];

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

module.exports = {
  isCardPlayable,
  Phases,
  initializeGame,
};
