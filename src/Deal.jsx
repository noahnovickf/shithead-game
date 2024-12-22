import { socket } from "./App";
import { useGameContext } from "./context/GameContext";
import { Phases } from "./phases";
import { useParams } from "react-router-dom";

const DealButton = ({ user }) => {
  const {
    state: { gameState },
  } = useGameContext();
  const { gameId } = useParams();

  const hasEnoughPlayers = gameState.players.length === 2;

  const handleGameStart = () => {
    socket.emit("gameStart", gameId);
  };

  return (
    user &&
    hasEnoughPlayers &&
    gameState.phase === Phases.START && (
      <button
        className="game-button"
        style={{
          marginTop: "20px",
        }}
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
