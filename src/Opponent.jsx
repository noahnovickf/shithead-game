import { useGameContext } from "./context/GameContext";
import Card from "./Card";
import HiddenCard from "./HiddenCard";
import "./gameboard.css";
import { Phases } from "./phases";

const Opponent = ({ user }) => {
  const {
    state: { gameState },
  } = useGameContext();
  const opponent = gameState.players.find((player) => player.id !== user);

  return (
    <div
      className="opponent-gameboard"
      style={{
        backgroundColor:
          gameState.currentTurn !== user && gameState.phase === Phases.PLAYING
            ? "lightblue"
            : "",
      }}
    >
      {opponent && (
        <div>
          <div className="table-card-container">
            <div className="face-down-row">
              {opponent.faceDown.map((_card, i) => (
                <HiddenCard key={i} opponent />
              ))}
            </div>
            <div className="face-up-row">
              {opponent.faceUp.map(({ rank, suit }) => (
                <Card
                  rank={rank}
                  suit={suit}
                  key={`${rank}-${suit}`}
                  opponent
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {gameState.phase === Phases.PLAYING && (
        <h3 style={{ margin: 0 }}>
          Cards in opponent's hand: {opponent.hand.length}
        </h3>
      )}
    </div>
  );
};

export default Opponent;
