const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const gameState = require("./gameState");
const { generateDeck, shuffle, initializeGame } = require("./utils");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // connect a user and set it as the current user on the client
  socket.on("userConnect", (data) => {
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

  socket.on("gameStart", () => {
    initializeGame();
    io.emit("gameStateUpdate", gameState);
  });

  socket.on("ready", (userId) => {
    // Update the player state to mark them as ready
    const player = gameState.players.find((p) => p.id === userId);
    if (player) {
      player.ready = true;
    }

    // Check if both players are ready and change the phase to "playing"
    const allPlayersReady = gameState.players.every((p) => p.ready);

    if (allPlayersReady) {
      gameState.phase = "playing";
      gameState.currentTurn = gameState.players[0].id;
      io.emit("gameStateUpdate", gameState);
    }
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

  console.log(gameState.players);

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
