import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./gameboard.css";
import Gameboard from "./Gameboard";
import { useGameContext } from "./context/GameContext";
import Opponent from "./Opponent";
import CardPile from "./CardPile";
import Deck from "./Deck";
import { Phases } from "./phases";
import ConfettiDisplay from "./ConfettiDisplay";
import DealButton from "./Deal";

export const socket = io("http://localhost:3001");

const App = () => {
  const [user, setUser] = useState(null);
  const { state } = useGameContext();

  const handleConnect = () => {
    socket.emit("userConnect", socket.id);
  };

  useEffect(() => {
    socket.on("currentUserID", (data) => {
      setUser(data);
    });
  }, []);

  return (
    <div className="main-board">
      <h1>Shithead Game</h1>
      {!user && <button onClick={() => handleConnect()}>Connect</button>}
      <DealButton user={user} />
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
      {state.phase === Phases.END && <ConfettiDisplay />}
    </div>
  );
};

export default App;
