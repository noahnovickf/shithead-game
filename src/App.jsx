import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./gameboard.css";
import Gameboard from "./Gameboard";
import { useGameContext } from "./context/GameContext";
import Opponent from "./Opponent";
import CardPile from "./CardPile";
import Deck from "./Deck";
import { Phases } from "./phases";
import ReactConfetti from "react-confetti";

export const socket = io("http://localhost:3001");

const App = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const [user, setUser] = useState(null);
  const { state } = useGameContext();

  const hasEnoughPlayers = state.players.length === 2;

  console.log("STATE", state);

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

  return (
    <div className="main-board">
      <h1>Shithead Game</h1>
      {!user && <button onClick={() => handleConnect()}>Connect</button>}
      {user && hasEnoughPlayers && state.phase === Phases.START && (
        <button
          onClick={() => {
            handleGameStart();
          }}
        >
          Deal
        </button>
      )}
      <Opponent user={user} />
      {state.phase === "playing" && (
        <div style={{ display: "flex", gap: "24px" }}>
          <CardPile user={user} />
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
      {state.phase === Phases.END && (
        <ReactConfetti width={width} height={height} />
      )}
    </div>
  );
};

export default App;
