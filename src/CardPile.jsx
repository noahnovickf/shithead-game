import { socket } from "./App";
import Card from "./Card";
import { useGameContext } from "./context/GameContext";

const CardPile = () => {
  const { state, dispatch } = useGameContext();

  const hasPile = state.cardPile.length > 0;

  return hasPile ? (
    <Card
      suit={state.cardPile[state.cardPile?.length - 1].suit}
      rank={state.cardPile[state.cardPile?.length - 1].rank}
      onClick={() => {
        dispatch({
          type: "PICKUP_DECK",
          payload: { playerId: state.currentTurn },
        });
        socket.emit("pickupDeck", { userId: state.currentTurn });
      }}
    />
  ) : (
    <div
      style={{
        height: "200px",
        width: "150px",
        border: "1px solid black",
        borderRadius: "10px",
      }}
    />
  );
};

export default CardPile;

// SWAP CARDS NOT STAYING, being overriden by state
