const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { games } = require("./gameState");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { initializeGame, Phases, isCardPlayable } = require("./utils");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // INITIAL CONNECTION
  console.log("CONNECTED: ", socket.id);

  // USER CLICKS CONNECT BUTTON
  socket.on("userConnect", (username) => {
    gameId = uuidv4();
    socket.emit("currentUserID", { gameId, username });
    games[gameId] = {
      players: [
        {
          id: username,
          hand: [],
          faceUp: [],
          faceDown: [],
          ready: false,
        },
      ],
      deck: [],
      lastPlayed: null,
      cardPile: [],
      currentTurn: null,
      phase: Phases.START,
    };
    io.emit("gameStateUpdate", games[gameId]);
  });

  socket.on("joinGame", ({ gameId, user }) => {
    if (!games[gameId]) {
      socket.emit("gameError", "Game not found");
      return;
    }
    // does user already exist in game?
    if (games[gameId]?.players.some((p) => p.id === user)) {
      io.emit("gameStateUpdate", games[gameId]);
      return;
    } else {
      games[gameId]?.players.push({
        id: user,
        hand: [],
        faceUp: [],
        faceDown: [],
        ready: false,
      });
    }
    io.emit("gameStateUpdate", games[gameId]);
  });

  // DEAL BUTTON CLICKED, CARDS ARE DEALT
  socket.on("gameStart", (gameId) => {
    initializeGame(gameId);
    io.emit("gameStateUpdate", games[gameId]);
  });

  // SWAP CARDS FROM FACE UP TO HAND
  socket.on("swapCards", (payload) => {
    const { userId, selectedHandCard, selectedFaceUpCard, gameId } = payload;
    const gameState = games[gameId];
    if (!gameState) {
      socket.emit("gameError", "Game not found");
    }

    const player = gameState.players.find((p) => p.id === userId);
    if (!player) return;

    const handIndex = player.hand.findIndex(
      (c) =>
        c.rank === selectedHandCard.rank && c.suit === selectedHandCard.suit
    );
    const faceUpIndex = player.faceUp.findIndex(
      (c) =>
        c.rank === selectedFaceUpCard.rank && c.suit === selectedFaceUpCard.suit
    );

    if (handIndex !== -1 && faceUpIndex !== -1) {
      [player.hand[handIndex], player.faceUp[faceUpIndex]] = [
        player.faceUp[faceUpIndex],
        player.hand[handIndex],
      ];
    }

    io.emit("gameStateUpdate", gameState);
  });

  // READY BUTTON CLICKED
  socket.on("ready", (payload) => {
    const { userId, gameId } = payload;
    const gameState = games[gameId];
    if (!gameState) {
      socket.emit("gameError", "Game not found");
      return;
    }
    const player = gameState.players.find((p) => p.id === userId);
    if (player) {
      player.ready = true;
    }
    const allPlayersReady = gameState.players.every((p) => p.ready);

    if (allPlayersReady) {
      gameState.phase = Phases.PLAYING;

      const firstPlayer = gameState.players.find((p) =>
        p.hand.some((c) => c.rank === "2")
      );
      if (firstPlayer) {
        gameState.currentTurn = firstPlayer.id;
      } else {
        const ranks = [
          "2",
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
        for (let i = 0; i < ranks.length; i++) {
          const player = gameState.players.find((p) =>
            p.hand.some((c) => c.rank === ranks[i])
          );
          if (player) {
            gameState.currentTurn = player.id;
            break;
          }
        }
      }
    }
    io.emit("gameStateUpdate", gameState);
  });

  socket.on("playCards", (payload) => {
    const { gameId, userId, cards } = payload;
    const gameState = games[gameId];

    if (!gameState) {
      socket.emit("gameError", "Game not found");
      return;
    }

    gameState.lastPlayed = cards;
    const playerIndex = gameState.players.findIndex(
      (player) => player.id === userId
    );

    if (playerIndex === -1) return;

    const updatedPlayers = [...gameState.players];
    const player = updatedPlayers[playerIndex];

    // UPDATE PLAYER HAND
    const updatedHand = player.hand.filter(
      (c) => !cards.some((card) => c.rank === card.rank && c.suit === card.suit)
    );
    player.hand = updatedHand;

    // PICKUP FACE UP CARDS
    if (gameState.deck.length === 0 && updatedHand.length === 0) {
      player.hand = player.faceUp;
      player.faceUp = [];
    } else {
      // PICKUP CARDS FROM DECK
      while (player.hand.length < 3 && gameState.deck.length > 0) {
        const topCard = gameState.deck.pop();
        player.hand.push(topCard);
      }
    }

    // UPDATE PILE
    gameState.cardPile = [...gameState.cardPile, ...cards];

    if (cards[0].rank !== "j" && cards[0].rank !== "10") {
      gameState.currentTurn =
        gameState.players[(playerIndex + 1) % gameState.players.length].id;
    }
    if (cards[0].rank === "10") {
      setTimeout(() => {
        gameState.cardPile = [];
        io.emit("gameStateUpdate", gameState);
      }, 1000);
    }

    io.emit("gameStateUpdate", gameState);
  });

  socket.on("pickupDeck", (payload) => {
    const { gameId, userId } = payload;
    const gameState = games[gameId];

    if (!gameState) {
      socket.emit("gameError", "Game not found");
      return;
    }

    // Find the player in the game state
    const playerIndex = gameState.players.findIndex(
      (player) => player.id === userId
    );

    if (playerIndex === -1) return; // Handle the case where the player is not found

    const updatedPlayers = [...gameState.players];
    const player = updatedPlayers[playerIndex];

    // add each card in the cardPile to the player's hand

    player.hand = [...player.hand, ...gameState.cardPile];

    // sort the player's hand
    player.hand = player.hand.sort((a, b) => {
      const rankOrder = [
        "2",
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
        "3",
        "10",
      ];
      return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });

    gameState.cardPile = [];
    gameState.currentTurn =
      gameState.players[(playerIndex + 1) % gameState.players.length].id;

    // Emit the updated game state to all clients
    io.emit("gameStateUpdate", gameState);
  });

  socket.on("deadFlip", (payload) => {
    const { gameId, userId, card } = payload;
    const gameState = games[gameId];

    if (!gameState) {
      socket.emit("gameError", "Game not found");
    }

    gameState.lastPlayed = [card];
    const player = gameState.players.find((p) => p.id === userId);
    if (!player) return;

    const topCard = gameState.cardPile[gameState.cardPile.length - 1];
    // if card is playable on top card, add it to the cardPile, move to next player
    // Remove card from faceDown
    player.faceDown = player.faceDown.filter(
      (c) => c.rank !== card.rank || c.suit !== card.suit
    );

    if (isCardPlayable(card, topCard)) {
      // Add to pile
      gameState.cardPile = [...gameState.cardPile, card];
      // Check if its a special card
      if (card.rank !== "j" && card.rank !== "10") {
        gameState.currentTurn =
          gameState.players[
            (gameState.players.findIndex((p) => p.id === userId) + 1) %
              gameState.players.length
          ].id;
      }
      if (card.rank === "10") {
        setTimeout(() => {
          gameState.cardPile = [];
          io.emit("gameStateUpdate", gameState);
        }, 1000);
      }
      if (player.faceDown.length === 0 && player.hand.length === 0) {
        gameState.phase = Phases.END;
      }
    } else {
      player.hand = [...gameState.cardPile, card];
      gameState.cardPile = [];
      gameState.currentTurn =
        gameState.players[
          (gameState.players.findIndex((p) => p.id === userId) + 1) %
            gameState.players.length
        ].id;
    }

    io.emit("gameStateUpdate", gameState);
  });

  socket.on("clearGame", (gameId) => {
    const gameState = games[gameId];
    if (!gameState) {
      socket.emit("gameError", "Game not found");
      return;
    }

    gameState.players = gameState.players.map((player) => ({
      ...player,
      hand: [],
      faceUp: [],
      faceDown: [],
      ready: false,
    }));
    gameState.deck = [];
    gameState.lastPlayed = null;
    gameState.cardPile = [];
    gameState.currentTurn = null;
    gameState.phase = Phases.START;
    io.emit("gameStateUpdate", gameState);
  });

  socket.on("disconnect", () => {
    // delete gameState.players[socket.id];
    console.log("User disconnected", socket.id);
  });
});
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
