import { socket } from "./App";
import { useGameContext } from "./context/GameContext";

const SwapCardButtons = ({
  user,
  selectedFaceUpCard,
  selectedHandCard,
  setSelectedFaceUpCard,
  setSelectedHandCard,
}) => {
  const { dispatch } = useGameContext();

  const performSwap = (handCard, faceUpCard) => {
    dispatch({
      type: "SWAP_CARDS",
      payload: { userId: user, handCard, faceUpCard },
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
      <button onClick={() => performSwap(selectedHandCard, selectedFaceUpCard)}>
        Swap Cards
      </button>
      <button onClick={handleReadyClick}>Ready!</button>
    </div>
  );
};

export default SwapCardButtons;
