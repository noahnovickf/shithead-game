import { socket } from "./App";
import { useGameContext } from "./context/GameContext";
import { Phases } from "./phases";
import { useParams } from "react-router-dom";

const DealButton = ({ user }) => {
  const { state } = useGameContext();
  const { gameId } = useParams();

  const hasEnoughPlayers = state.players.length === 2;

  const handleGameStart = () => {
    socket.emit("gameStart", gameId);
  };

  return (
    user &&
    hasEnoughPlayers &&
    state.phase === Phases.START && (
      <button
        onClick={() => {
          handleGameStart();
        }}
      >
        Deal
      </button>
    )
  );
};

export default DealButton;
