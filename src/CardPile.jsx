import { socket } from "./App";
import Card from "./Card";
import { useGameContext } from "./context/GameContext";

const CardPile = ({ user }) => {
  const { state } = useGameContext();

  const hasPile = state.cardPile.length > 0;

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <h2>{state.cardPile.length}</h2>
      {hasPile ? (
        <Card
          suit={state.cardPile[state.cardPile?.length - 1].suit}
          rank={state.cardPile[state.cardPile?.length - 1].rank}
          onClick={() => {
            if (user === state.currentTurn) {
              socket.emit("pickupDeck", { userId: user });
            }
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
      )}
    </div>
  );
};

export default CardPile;
