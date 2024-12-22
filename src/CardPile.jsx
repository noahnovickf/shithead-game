import { socket } from "./App";
import Card from "./Card";
import { useGameContext } from "./context/GameContext";
import { useParams } from "react-router-dom";
import useIsMobile from "./isMobileHook";

const CardPile = ({ user }) => {
  const {
    state: { gameState },
  } = useGameContext();
  const { gameId } = useParams();
  const isMobile = useIsMobile();
  const hasPile = gameState.cardPile.length > 0;

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <h2>{gameState.cardPile.length}</h2>
      {hasPile ? (
        <Card
          suit={gameState.cardPile[gameState.cardPile?.length - 1].suit}
          rank={gameState.cardPile[gameState.cardPile?.length - 1].rank}
          onClick={() => {
            if (user === gameState.currentTurn) {
              socket.emit("pickupDeck", { gameId, userId: user });
            }
          }}
        />
      ) : (
        <div
          style={{
            height: isMobile ? "125px" : "150px",
            width: isMobile ? "90px" : "110px",
            border: "1px solid black",
            borderRadius: "10px",
          }}
        />
      )}
    </div>
  );
};

export default CardPile;
