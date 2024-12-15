import { useGameContext } from "./context/GameContext";
import Card from "./Card";
import HiddenCard from "./HiddenCard";
import "./gameboard.css";
import { useState } from "react";
import { socket } from "./App";
import {
  isCardDuplicate,
  isCardPlayable,
  updateCardSpacing,
} from "./gameUtils";
import SwapCardButtons from "./SwapCardButtons";
import { Phases } from "./phases";
import { useParams } from "react-router-dom";

const Gameboard = ({ user }) => {
  const { state } = useGameContext();
  const { gameId } = useParams();
  const player = state.players.find((p) => p.id === user);
  const [selectedHandCard, setSelectedHandCard] = useState(null);
  const [selectedFaceUpCard, setSelectedFaceUpCard] = useState(null);
  const [multipleCards, setMultipleCards] = useState([]);

  updateCardSpacing(player?.hand?.length);

  const performSwap = (handCard, faceUpCard) => {
    socket.emit("swapCards", {
      gameId,
      userId: user,
      selectedHandCard: handCard,
      selectedFaceUpCard: faceUpCard,
    });
    setSelectedHandCard(null);
    setSelectedFaceUpCard(null);
  };

  const handleCardClick = (card, location) => {
    if (state.phase === Phases.SWAP) {
      if (location === "hand") {
        if (selectedFaceUpCard) {
          performSwap(card, selectedFaceUpCard);
        } else {
          // Sets the selected card to the clicked card if it's not already selected
          setSelectedHandCard(
            selectedHandCard?.rank === card.rank &&
              selectedHandCard?.suit === card.suit
              ? null
              : card
          );
        }
      } else if (location === "faceUp") {
        if (selectedHandCard) {
          performSwap(selectedHandCard, card);
        } else {
          // Sets the selected card to the clicked card if it's not already selected
          setSelectedFaceUpCard(
            selectedFaceUpCard?.rank === card.rank &&
              selectedFaceUpCard?.suit === card.suit
              ? null
              : card
          );
        }
      }
    } else if (
      state.phase === Phases.PLAYING &&
      state.currentTurn === user &&
      location === "hand"
    ) {
      const topCard = state.cardPile[state.cardPile.length - 1];
      if (isCardPlayable(card, topCard)) {
        if (isCardDuplicate(card, player.hand)) {
          if (
            !multipleCards.find((c) => c.rank === card.rank) &&
            multipleCards.length >= 1
          ) {
            setMultipleCards([card]);
          } else if (
            !!multipleCards.find(
              (c) => c.rank === card.rank && c.suit === card.suit
            )
          ) {
            socket.emit("playCards", {
              userId: user,
              cards: multipleCards,
            });
            setMultipleCards([]);
            return;
          } else {
            setMultipleCards([card, ...multipleCards]);
            return;
          }
        } else {
          // Play single card, empty duplicate cards
          socket.emit("playCards", { userId: user, cards: [card] });
          setMultipleCards([]);
        }
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
      }}
    >
      {state.phase === Phases.SWAP && <SwapCardButtons user={user} />}
      {player && (
        <div className="card-container">
          <div className="table-card-container">
            <div className="face-down-row">
              {player.faceDown.map((card, i) => (
                <HiddenCard user={user} card={card} key={i} />
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
              <div className="card" key={i}>
                <Card
                  rank={card.rank}
                  suit={card.suit}
                  selected={
                    (selectedHandCard?.rank === card.rank &&
                      selectedHandCard?.suit === card.suit) ||
                    !!multipleCards.find(
                      (c) => c.rank === card.rank && c.suit === card.suit
                    )
                  }
                  onClick={() => handleCardClick(card, "hand")}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gameboard;
