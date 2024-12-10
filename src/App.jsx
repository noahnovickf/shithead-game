import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./gameboard.css";
import Gameboard from "./Gameboard";
import { useGameContext } from "./context/GameContext";
import Opponent from "./Opponent";
import CardPile from "./CardPile";
import Deck from "./Deck";

const socket = io("http://localhost:3001");

const App = () => {
  const [user, setUser] = useState(null);
  const { state } = useGameContext();

  const hasEnoughPlayers = state.players.length === 2;
  const hasDealt = state.deck.length;

  console.log(hasEnoughPlayers, hasDealt);

  const handleConnect = () => {
    console.log("data", socket.id, socket.connected);
    socket.emit("userConnect", socket.id);
  };

  const handleGameStart = () => {
    socket.emit("gameStart");
  };

  useEffect(() => {
    socket.on("currentUserID", (data) => {
      console.log("addPlayer", data);
      setUser(data);
    });
  }, []);

  console.log(user, "STATE", state);

  return (
    <div className="main-board">
      <h1>Shithead Game</h1>
      {!user && <button onClick={() => handleConnect()}>Connect</button>}
      {user && hasEnoughPlayers && !hasDealt && (
        <button
          onClick={() => {
            handleGameStart();
          }}
        >
          Deal
        </button>
      )}
      <Opponent user={user} />
      {state.currentTurn && (
        <div>
          <CardPile />
          <Deck />
        </div>
      )}
      <Gameboard user={user} />
      <button
        onClick={() => {
          socket.emit("clearGame");
        }}
      >
        Reset Game
      </button>
    </div>
  );
};

export default App;
