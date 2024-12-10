import Card from "./Card";
import { useGameContext } from "./context/GameContext";

const CardPile = () => {
  const { state } = useGameContext();

  const hasPile = state.pile.length > 0;

  return hasPile ? (
    <Card
      suit={state.cardPile[state.cardPile.length - 1].suit}
      rank={state.cardPile[state.cardPile.length - 1].rank}
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