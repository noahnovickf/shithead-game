const gameState = require("./gameState");

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

function initializeGame() {
  const deck = generateDeck();
  shuffle(deck);

  // Distribute cards to players
  Object.keys(gameState.players).forEach((playerId) => {
    gameState.players[playerId].faceDown = deck.splice(0, 3); // 3 face-down cards
    gameState.players[playerId].faceUp = deck.splice(0, 3); // 3 face-up cards
    gameState.players[playerId].hand = deck.splice(0, 3); // 3 cards in hand
    gameState.players[playerId].ready = false;
  });

  gameState.deck = deck; // Remaining cards for drawing
  gameState.cardPile = []; // Start with an empty pile
  gameState.phase = "swap";
}

const Phases = {
  START: "start",
  SWAP: "swap",
  PLAYING: "playing",
};

module.exports = {
  Phases,
  initializeGame,
};
