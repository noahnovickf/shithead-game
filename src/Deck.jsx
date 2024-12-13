import HiddenCard from "./HiddenCard";
import { useGameContext } from "./context/GameContext";

const Deck = () => {
  const { state } = useGameContext();
  const deckLength = state.deck.length;

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <HiddenCard />
      <h2>{deckLength}</h2>
    </div>
  );
};

export default Deck;
