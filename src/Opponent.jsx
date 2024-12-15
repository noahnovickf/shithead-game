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
      className="opponent-gameboard"
      style={{
        backgroundColor:
          state.currentTurn !== user && state.phase === Phases.PLAYING
            ? "lightblue"
            : "",
      }}
    >
      {opponent && (
        <div>
          <div className="table-card-container">
            <div className="face-down-row">
              {opponent.faceDown.map(({ rank, suit }, i) => (
                <HiddenCard key={i} opponent />
              ))}
            </div>
            <div className="face-up-row">
              {opponent.faceUp.map(({ rank, suit }, i) => (
                <Card rank={rank} suit={suit} key={i} opponent />
              ))}
            </div>
          </div>
        </div>
      )}
      {state.phase === Phases.PLAYING && (
        <h3 style={{ margin: 0 }}>
          Cards in opponent's hand: {opponent.hand.length}
        </h3>
      )}
    </div>
  );
};

export default Opponent;
