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
