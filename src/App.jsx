import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./gameboard.css";
import { useGameContext } from "./context/GameContext";
import { Phases } from "./phases";
import ConfettiDisplay from "./ConfettiDisplay";
import GameWrapper from "./GameWrapper";
import ResetButton from "./ResetButton";
import GameTitle from "./GameTitle";
import { useNavigate, useParams } from "react-router-dom";

export const socket = io(process.env.REACT_APP_SERVER_URL);

const HomePage = ({ user, setUser, setConnected }) => {
  const navigate = useNavigate();

  const handleConnect = () => {
    socket.emit("userConnect", user.toLowerCase());
  };

  useEffect(() => {
    localStorage.removeItem("gameState");
    socket.on("currentUserID", (gameId) => {
      setConnected(true);
      navigate(`/game/${gameId}`);
    });
  }, []);

  return (
    <div className="main-board">
      <ResetButton />
      <GameTitle />
      <div>
        <input
          type="text"
          placeholder="Enter your name"
          onChange={(e) => setUser(e.target.value)}
        />
        <button disabled={!user} onClick={handleConnect}>
          Start Game
        </button>
      </div>
    </div>
  );
};

const JoinGame = ({ user, setUser, setConnected }) => {
  const { gameId } = useParams();

  const handleJoin = () => {
    socket.emit("joinGame", { gameId, user });
    setUser(user);
    setConnected(true);
  };

  return (
    <div className="main-board">
      <GameTitle />
      <div>
        <input
          type="text"
          placeholder="Enter your name"
          onChange={(e) => setUser(e.target.value)}
        />
        <button disabled={!user} onClick={handleJoin}>
          Join
        </button>
      </div>
    </div>
  );
};

const ExistingGame = ({ user, setUser }) => {
  const navigate = useNavigate();
  // TODO: FLUSH OUT JOINING CURRENT GAME
  return (
    <div className="main-board">
      <GameTitle />
      <h2>Looks like theres already a game in progress</h2>
      <button
        onClick={() => {
          localStorage.removeItem("gameState");
          setUser();
          navigate("/");
        }}
      >
        Start a new game
      </button>{" "}
      OR <button onClick={() => setUser()}>Continue current game</button>
    </div>
  );
};

const GamePage = ({ user }) => {
  const { state } = useGameContext();

  const handleCopyUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
  };

  return (
    <div className="main-board">
      <ResetButton />
      <GameTitle />
      {state.players.length < 2 && (
        <button onClick={handleCopyUrl}>Invite another player</button>
      )}
      <GameWrapper user={user} />
      {state.phase === Phases.END && <ConfettiDisplay />}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const gameInProgress = !!localStorage.getItem("gameState");

  useEffect(() => {
    socket.on("gameError", (err) => {
      // Should be a modal to direct back to "/"
      alert(err);
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              setUser={setUser}
              setConnected={setConnected}
            />
          }
        />
        <Route
          path="/game/:gameId"
          element={
            connected ? (
              <GamePage user={user} />
            ) : gameInProgress ? (
              <ExistingGame user={user} setUser={setUser} />
            ) : (
              <JoinGame
                user={user}
                setUser={setUser}
                setConnected={setConnected}
              />
            )
          }
        />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
