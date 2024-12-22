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
import HomeButton from "./HomeButton";

export const socket = io(process.env.REACT_APP_SERVER_URL);

const HomePage = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleConnect = (e) => {
    e.preventDefault();
    socket.emit("userConnect", username.toLowerCase());
  };

  useEffect(() => {
    socket.on("currentUserID", ({ gameId, username }) => {
      localStorage.setItem("username", username);
      navigate(`/game/${gameId}`);
    });
  }, [navigate]);

  return (
    <div className="main-board">
      <ResetButton />
      <HomeButton />
      <GameTitle />
      <form>
        <input
          type="text"
          placeholder="Enter your name"
          onChange={(e) => setUsername(e.target.value)}
        />
        <button disabled={!username} onClick={(e) => handleConnect(e)}>
          Start Game
        </button>
      </form>
    </div>
  );
};

// Loads if the user is already in localStorage, but there is no game
const StartGame = ({ username }) => {
  const handleConnect = () => {
    socket.emit("userConnect", username.toLowerCase());
  };

  return (
    <div className="main-board">
      <GameTitle />
      <div className="header-with-button">
        <h1>
          Welcome back,{" "}
          <span style={{ textTransform: "capitalize" }}>{username}</span>!
        </h1>
        <button onClick={handleConnect}>Start Game</button>
      </div>
    </div>
  );
};

const JoinGame = ({ user }) => {
  const [username, setUsername] = useState("");
  const { gameId } = useParams();
  const navigate = useNavigate();

  const handleJoin = () => {
    socket.emit("joinGame", { gameId, user: user ?? username });
    localStorage.setItem("username", user ?? username);
  };

  useEffect(() => {
    socket.on("gameError", (err) => {
      navigate("/");
      alert(err);
    });
  }, []);

  return (
    <div className="main-board">
      <GameTitle />
      {!user ? (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button disabled={!username} onClick={handleJoin}>
            Join
          </button>
        </div>
      ) : (
        <div className="header-with-button">
          <h1>
            Welcome back,{" "}
            <span style={{ textTransform: "capitalize" }}>{user}</span>!
          </h1>
          <button onClick={handleJoin}>Join</button>
        </div>
      )}
    </div>
  );
};

const GamePage = ({ user }) => {
  const {
    state: { gameState },
  } = useGameContext();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopyUrl = () => {
    setCopied(true);
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
    socket.on("gameError", (err) => {
      navigate("/");
      alert(err);
    });
  }, []);

  return (
    <div className="main-board">
      <ResetButton />
      <HomeButton />
      <GameTitle />
      {gameState.players.length < 2 && (
        <button onClick={handleCopyUrl}>Invite another player</button>
      )}
      {copied && <h3>URL copied to clipboard!</h3>}
      <GameWrapper user={user} />
      {gameState.phase === Phases.END && <ConfettiDisplay />}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const {
    state: { gameState },
  } = useGameContext();

  useEffect(() => {
    // Sets to null if no user in localStorage
    setUser(localStorage.getItem("username"));
  }, [user, gameState]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <StartGame username={user} /> : <HomePage />}
        />
        <Route
          path="/game/:gameId"
          element={
            user && gameState ? (
              <GamePage user={user} />
            ) : (
              <JoinGame user={user} />
            )
          }
        />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
