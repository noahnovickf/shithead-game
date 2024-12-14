import { Fragment } from "react";
import { Phases } from "./phases";
import DealButton from "./Deal";
import Opponent from "./Opponent";
import CardPile from "./CardPile";
import Deck from "./Deck";
import Gameboard from "./Gameboard";
import ResetButton from "./ResetButton";
import { useGameContext } from "./context/GameContext";

const GameWrapper = ({ user }) => {
  const { state } = useGameContext();
  return (
    <Fragment>
      <DealButton user={user} />
      <Opponent user={user} />
      {state.phase === Phases.PLAYING && (
        <div style={{ display: "flex", gap: "24px" }}>
          <CardPile user={user} />
          <Deck />
        </div>
      )}
      <Gameboard user={user} />
      <ResetButton />
    </Fragment>
  );
};

export default GameWrapper;
