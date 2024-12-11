const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const gameState = require("./gameState");
const { initializeGame, Phases } = require("./utils");
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

  socket.on("playCard", (payload) => {
    const { userId, card } = payload;

    // Find the player in the game state
    const playerIndex = gameState.players.findIndex(
      (player) => player.id === userId
    );

    if (playerIndex === -1) return; // Handle the case where the player is not found

    const updatedPlayers = [...gameState.players];
    const player = updatedPlayers[playerIndex];

    // Remove the played card from the player's hand
    const updatedHand = player.hand.filter(
      (c) => !(c.rank === card.rank && c.suit === card.suit)
    );

    // Add the top card from the cardPile to the player's hand (if exists)
    const topCard = gameState.deck[gameState.deck.length - 1];
    // remove top card from deck
    if (updatedHand.length < 3) {
      gameState.deck.pop();
    }
    const newHand =
      topCard && updatedHand.length < 3
        ? [...updatedHand, topCard]
        : updatedHand;

    player.hand = newHand;

    gameState.cardPile.push(card);
    if (card.rank !== "j" && card.rank !== "10") {
      console.log("skipturn");
      gameState.currentTurn =
        gameState.players[(playerIndex + 1) % gameState.players.length].id;
    }
    // Emit the updated game state to all clients
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

  console.log("PLAYERS: ", gameState.players);

  socket.on("clearGame", () => {
    gameState.players = [];
    gameState.deck = [];
    gameState.cardPile = [];
    gameState.currentTurn = null;
    gameState.phase = "start";
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
