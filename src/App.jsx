import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./gameboard.css";
import { useGameContext } from "./context/GameContext";
import { Phases } from "./phases";
import ConfettiDisplay from "./ConfettiDisplay";
import GameWrapper from "./GameWrapper";

export const socket = io(process.env.REACT_APP_SERVER_URL);

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
      <h1
        style={{
          marginBottom: 0,
        }}
      >
        Shithead
      </h1>
      {!user && <button onClick={() => handleConnect()}>Join Game</button>}
      {user && <GameWrapper user={user} />}
      {state.phase === Phases.END && <ConfettiDisplay />}
    </div>
  );
};

export default App;
