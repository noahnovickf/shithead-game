import { socket } from "./App";
import { useParams } from "react-router-dom";

const ResetButton = () => {
  const { gameId } = useParams();
  return (
    <button
      className="reset-button"
      onClick={() => {
        socket.emit("clearGame", gameId);
      }}
    >
      Reset Game
    </button>
  );
};

export default ResetButton;
