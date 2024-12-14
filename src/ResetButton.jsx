import { socket } from "./App";

const ResetButton = () => {
  return (
    <button
      className="reset-button"
      onClick={() => {
        socket.emit("clearGame");
      }}
    >
      Reset Game
    </button>
  );
};

export default ResetButton;
