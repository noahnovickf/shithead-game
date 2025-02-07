import { Fragment } from "react";
import { Phases } from "./phases";
import DealButton from "./Deal";
import Opponent from "./Opponent";
import CardPile from "./CardPile";
import Deck from "./Deck";
import Gameboard from "./Gameboard";
import { useGameContext } from "./context/GameContext";
import ConfettiDisplay from "./ConfettiDisplay";

const cardRankToWord = {
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
  j: "Jack",
  q: "Queen",
  k: "King",
  a: "Ace",
};

const GameWrapper = ({ user }) => {
  const {
    state: { gameState },
  } = useGameContext();
  const isFirstPlayer = gameState?.players[0]?.id === user;

  return (
    <Fragment>
      {gameState?.phase === Phases.END && <ConfettiDisplay />}
      {isFirstPlayer ? (
        <DealButton user={user} />
      ) : (
        gameState.phase === Phases.START && (
          <h1>Waiting for other player to deal the cards...</h1>
        )
      )}
      <Opponent user={user} />
      {(gameState?.phase === Phases.PLAYING ||
        gameState?.phase === Phases.END) && (
        <Fragment>
          <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
            <CardPile user={user} />
            <Deck />
          </div>
          {gameState?.lastPlayed && (
            <h3 style={{ marginTop: 0 }}>
              {`Last played: ${gameState?.lastPlayed.length} ${
                cardRankToWord[gameState?.lastPlayed[0].rank]
              }${gameState.lastPlayed.length > 1 ? "'s" : ""}`}
            </h3>
          )}
        </Fragment>
      )}
      <Gameboard user={user} />
    </Fragment>
  );
};

export default GameWrapper;
