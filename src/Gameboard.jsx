import { useGameContext } from "./context/GameContext";
import Card from "./Card";
import HiddenCard from "./HiddenCard";
import "./gameboard.css";
import { useState } from "react";
import { socket } from "./App";
import { isCardPlayable } from "./isCardPlayable";
import SwapCardButtons from "./SwapCardButtons";
import { Phases } from "./phases";

const Gameboard = ({ user }) => {
  const { state, dispatch } = useGameContext();
  const player = state.players.find((p) => p.id === user);
  const [selectedHandCard, setSelectedHandCard] = useState(null);
  const [selectedFaceUpCard, setSelectedFaceUpCard] = useState(null);

  const handleCardClick = (card, location) => {
    if (state.phase === Phases.SWAP) {
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
    } else if (
      state.phase === Phases.PLAYING &&
      state.currentTurn === user &&
      location === "hand"
    ) {
      // Check if the card is playable
      const topCard = state.cardPile[state.cardPile.length - 1];
      if (isCardPlayable(card, topCard)) {
        dispatch({
          type: "PLAY_CARD",
          payload: { user, card },
        });
        socket.emit("playCard", { userId: user, card });
      } else {
        alert("You can't play this card");
      }
    }

    return;
  };

  return (
    <div
      className="gameboard"
      style={{
        backgroundColor:
          state.currentTurn === user && state.phase === Phases.PLAYING
            ? "lightblue"
            : "",
        borderRadius: "10px",
        margin: "24px",
      }}
    >
      {state.phase === Phases.START &&
        (user ? <p>Your ID: {user}</p> : <p>Waiting for connection...</p>)}
      {state.phase === Phases.SWAP && (
        <SwapCardButtons
          user={user}
          selectedHandCard={selectedHandCard}
          selectedFaceUpCard={selectedFaceUpCard}
          setSelectedHandCard={setSelectedHandCard}
          setSelectedFaceUpCard={setSelectedFaceUpCard}
        />
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
