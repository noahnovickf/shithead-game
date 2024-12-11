import { useGameContext } from "./context/GameContext";
import Card from "./Card";
import HiddenCard from "./HiddenCard";
import "./gameboard.css";
import { useState } from "react";
import { socket } from "./App";

const Gameboard = ({ user }) => {
  const { state, dispatch } = useGameContext();
  const player = state.players.find((p) => p.id === user);
  const [selectedHandCard, setSelectedHandCard] = useState(null);
  const [selectedFaceUpCard, setSelectedFaceUpCard] = useState(null);

  const handleReadyClick = () => {
    dispatch({
      type: "SET_READY",
      payload: { userId: user },
    });
    socket.emit("ready", user);
  };

  const handleCardClick = (card, location) => {
    if (state.phase === "swap") {
      if (location === "hand") {
        setSelectedHandCard(
          selectedHandCard?.rank === card.rank &&
            selectedHandCard?.suit === card.suit
            ? null
            : card
        );
      } else if (location === "faceUp") {
        setSelectedFaceUpCard(
          selectedFaceUpCard?.rank === card.rank &&
            selectedFaceUpCard?.suit === card.suit
            ? null
            : card
        );
      }
    } else if (state.phase === "playing" && state.currentTurn === user) {
      dispatch({
        type: "PLAY_CARD",
        payload: { user, card },
      });
      socket.emit("playCard", { userId: user, card });
    }

    return;
  };

  const performSwap = (handCard, faceUpCard) => {
    dispatch({
      type: "SWAP_CARDS",
      payload: { userId: user, handCard, faceUpCard },
    });
    setSelectedHandCard(null);
    setSelectedFaceUpCard(null);
  };

  return (
    <div className="gameboard">
      {user ? <p>Your ID: {user}</p> : <p>Waiting for connection...</p>}
      {state.phase === "swap" && (
        <div>
          <button
            onClick={() => performSwap(selectedHandCard, selectedFaceUpCard)}
          >
            Swap Cards
          </button>
          <button onClick={handleReadyClick}>Ready!</button>
        </div>
      )}
      {player && (
        <div>
          <div className="card-container">
            <div className="face-down-row">
              {player.faceDown.map(({ rank, suit }, i) => (
                <HiddenCard rank={rank} suit={suit} key={i} />
              ))}
            </div>
            <div className="face-up-row">
              {player.faceUp.map((card, i) => (
                <Card
                  key={i}
                  rank={card.rank}
                  suit={card.suit}
                  selected={
                    selectedFaceUpCard?.rank === card.rank &&
                    selectedFaceUpCard?.suit === card.suit
                  }
                  onClick={() => handleCardClick(card, "faceUp")}
                />
              ))}
            </div>
          </div>
          <h2>Your Hand</h2>
          <div className="hand">
            {player.hand.map((card, i) => (
              <Card
                key={i}
                rank={card.rank}
                suit={card.suit}
                selected={
                  selectedHandCard?.rank === card.rank &&
                  selectedHandCard?.suit === card.suit
                }
                onClick={() => handleCardClick(card, "hand")}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gameboard;
