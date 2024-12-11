import { useGameContext } from "./context/GameContext";
import Card from "./Card";
import HiddenCard from "./HiddenCard";
import "./gameboard.css";
import { Phases } from "./phases";

const Opponent = ({ user }) => {
  const { state } = useGameContext();
  const opponent = state.players.find((player) => player.id !== user);

  return (
    <div
      className="gameboard"
      style={{
        backgroundColor:
          state.currentTurn !== user && state.phase === Phases.PLAYING
            ? "lightblue"
            : "",
        borderRadius: "10px",
        margin: "24px",
      }}
    >
      {opponent && (
        <div>
          <div className="card-container">
            <div className="face-down-row">
              {opponent.faceDown.map(({ rank, suit }, i) => (
                <HiddenCard rank={rank} suit={suit} key={i} opponent />
              ))}
            </div>
            <div className="face-up-row">
              {opponent.faceUp.map(({ rank, suit }, i) => (
                <Card rank={rank} suit={suit} key={i} opponent />
              ))}
            </div>
          </div>
          <p>Cards in opponent's hand: {opponent.hand.length} </p>
        </div>
      )}
    </div>
  );
};

export default Opponent;
