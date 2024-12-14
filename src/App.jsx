import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./gameboard.css";
import { useGameContext } from "./context/GameContext";
import { Phases } from "./phases";
import ConfettiDisplay from "./ConfettiDisplay";
import GameWrapper from "./GameWrapper";
import ResetButton from "./ResetButton";

export const socket = io(process.env.REACT_APP_SERVER_URL);

const App = () => {
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const { state } = useGameContext();

  const handleConnect = () => {
    socket.emit("userConnect", user.toLowerCase());
    setConnected(true);
  };

  useEffect(() => {
    socket.on("currentUserID", (data) => {
      setUser(data);
    });
  }, []);

  return (
    <div className="main-board">
      <ResetButton />
      <h1
        style={{
          marginBottom: 0,
        }}
      >
        Shithead
      </h1>
      {!connected && (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setUser(e.target.value)}
          />
          <button disabled={!user} onClick={() => handleConnect()}>
            Join Game
          </button>
        </div>
      )}
      {connected && <GameWrapper user={user} />}
      {state.phase === Phases.END && <ConfettiDisplay />}
    </div>
  );
};

export default App;
