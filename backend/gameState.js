// state.js

const gameState = {
  players: [],
  deck: [], // Remaining cards in the deck
  cardPile: [], // Cards played on the table
  currentTurn: null, // Tracks whose turn it is
};

const games = {};

module.exports = { gameState, games };
