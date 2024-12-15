import { socket } from "./App";
import { useGameContext } from "./context/GameContext";
import { useParams } from "react-router-dom";

const SwapCardButtons = ({ user }) => {
  const { state } = useGameContext();
  const { gameId } = useParams();
  const player = state.players.find((p) => p.id === user);

  const handleReadyClick = () => {
    socket.emit("ready", { userId: user, gameId });
  };

  return (
    <div
      style={{
        margin: "24px",
        gap: "12px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {!player?.ready ? (
        <button onClick={handleReadyClick}>Ready!</button>
      ) : (
        <h3>Waiting for other player...</h3>
      )}
    </div>
  );
};

export default SwapCardButtons;
