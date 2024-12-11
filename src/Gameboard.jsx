import { useGameContext } from "./context/GameContext";
import Card from "./Card";
import HiddenCard from "./HiddenCard";
import "./gameboard.css";
import { useState } from "react";

const Gameboard = ({ user }) => {
  const { state, dispatch } = useGameContext();
  const player = state.players.find((p) => p.id === user);
  const [selectedHandCard, setSelectedHandCard] = useState(null);
  const [selectedFaceUpCard, setSelectedFaceUpCard] = useState(null);

  const handleCardClick = (card, location) => {
    if (state.phase !== "swap") return;

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
  };

  const performSwap = (handCard, faceUpCard) => {
    // Update the game state with the swapped cards
    console.log(handCard, faceUpCard);
    dispatch({
      type: "SWAP_CARDS",
      payload: { userId: user, handCard, faceUpCard },
    });

    // // Reset selections
    // setSelectedHandCard(null);
    // setSelectedFaceUpCard(null);
  };

  return (
    <div className="gameboard">
      {user ? <p>Your ID: {user}</p> : <p>Waiting for connection...</p>}
      {state.phase === "swap" && (
        <button
          onClick={() => performSwap(selectedHandCard, selectedFaceUpCard)}
        >
          Swap Cards
        </button>
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
