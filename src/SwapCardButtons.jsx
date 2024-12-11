import { socket } from "./App";
import { useGameContext } from "./context/GameContext";

const SwapCardButtons = ({
  user,
  selectedFaceUpCard,
  selectedHandCard,
  setSelectedFaceUpCard,
  setSelectedHandCard,
}) => {
  const { state, dispatch } = useGameContext();
  const player = state.players.find((p) => p.id === user);

  const performSwap = (handCard, faceUpCard) => {
    socket.emit("swapCards", {
      userId: user,
      selectedHandCard: handCard,
      selectedFaceUpCard: faceUpCard,
    });
    setSelectedHandCard(null);
    setSelectedFaceUpCard(null);
  };

  const handleReadyClick = () => {
    dispatch({
      type: "SET_READY",
      payload: { userId: user },
    });
    socket.emit("ready", user);
  };

  return (
    <div
      style={{
        margin: "24px",
        gap: "12px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <button
        onClick={() => performSwap(selectedHandCard, selectedFaceUpCard)}
        disabled={!selectedFaceUpCard || !selectedHandCard}
      >
        Swap Cards
      </button>
      {!player?.ready && <button onClick={handleReadyClick}>Ready!</button>}
    </div>
  );
};

export default SwapCardButtons;
