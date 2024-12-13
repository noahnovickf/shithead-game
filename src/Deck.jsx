import HiddenCard from "./HiddenCard";
import { useGameContext } from "./context/GameContext";

const Deck = () => {
  const { state } = useGameContext();
  const deckLength = state.deck.length;

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <HiddenCard />
      <h4>{deckLength}</h4>
    </div>
  );
};

export default Deck;
