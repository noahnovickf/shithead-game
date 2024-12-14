const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const gameState = require("./gameState");
const { initializeGame, Phases, isCardPlayable } = require("./utils");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // INITIAL CONNECTION
  console.log("CONNECTED: ", socket.id);

  // USER CLICKS CONNECT BUTTON
  socket.on("userConnect", (data) => {
    // SERVER SENDS BACK USER ID
    socket.emit("currentUserID", data);
    gameState.players.length < 2 &&
      gameState.players.push({
        id: data,
        hand: [],
        faceUp: [],
        faceDown: [],
      });
    io.emit("gameStateUpdate", gameState);
  });

  // DEAL BUTTON CLICKED, CARDS ARE DEALT
  socket.on("gameStart", () => {
    initializeGame();
    io.emit("gameStateUpdate", gameState);
  });

  // SWAP CARDS FROM FACE UP TO HAND
  socket.on("swapCards", (payload) => {
    const { userId, selectedHandCard, selectedFaceUpCard } = payload;
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
  socket.on("ready", (userId) => {
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
    const { userId, cards } = payload;
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
    const { userId } = payload;
    // Find the player in the game state
    const playerIndex = gameState.players.findIndex(
      (player) => player.id === userId
    );

    if (playerIndex === -1) return; // Handle the case where the player is not found

    const updatedPlayers = [...gameState.players];
    const player = updatedPlayers[playerIndex];

    // add each card in the cardPile to the player's hand

    player.hand = [...player.hand, ...gameState.cardPile];

    gameState.cardPile = [];
    gameState.currentTurn =
      gameState.players[(playerIndex + 1) % gameState.players.length].id;

    // Emit the updated game state to all clients
    io.emit("gameStateUpdate", gameState);
  });

  socket.on("deadFlip", (payload) => {
    const { userId, card } = payload;
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

  socket.on("clearGame", () => {
    if (gameState.players.length === 2) {
      gameState.players = [
        {
          id: gameState.players[0]?.id,
          hand: [],
          faceUp: [],
          faceDown: [],
          ready: false,
        },
        {
          id: gameState.players[1]?.id,
          hand: [],
          faceUp: [],
          faceDown: [],
          ready: false,
        },
      ];
    } else {
      gameState.players = [];
    }
    gameState.deck = [];
    gameState.cardPile = [];
    gameState.currentTurn = null;
    gameState.phase = Phases.START;
    io.emit("gameStateUpdate", gameState);
  });

  socket.on("disconnect", () => {
    delete gameState.players[socket.id];
    console.log("User disconnected", socket.id, gameState.players);
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
