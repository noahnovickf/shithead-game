import { socket } from "./App";

const ResetButton = () => {
  return (
    <button
      onClick={() => {
        socket.emit("clearGame");
      }}
    >
      Reset Game
    </button>
  );
};

export default ResetButton;
