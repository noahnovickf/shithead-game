import { socket } from "./App";
import { useGameContext } from "./context/GameContext";
import { Phases } from "./phases";

const DealButton = ({ user }) => {
  const { state } = useGameContext();

  const hasEnoughPlayers = state.players.length === 2;

  const handleGameStart = () => {
    socket.emit("gameStart");
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
