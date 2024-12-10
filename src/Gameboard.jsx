import { useGameContext } from "./context/GameContext";
import Card from "./Card";
import HiddenCard from "./HiddenCard";
import "./gameboard.css";

const Gameboard = ({ user }) => {
  const { state } = useGameContext();
  const player = state.players.find((player) => player.id === user);

  return (
    <div className="gameboard">
      {user ? <p>Your ID: {user}</p> : <p>Waiting for connection...</p>}
      {player && (
        <div>
          <div className="card-container">
            <div className="face-down-row">
              {player.faceDown.map(({ rank, suit }, i) => (
                <HiddenCard rank={rank} suit={suit} key={i} />
              ))}
            </div>
            <div className="face-up-row">
              {player.faceUp.map(({ rank, suit }, i) => (
                <Card rank={rank} suit={suit} key={i} />
              ))}
            </div>
          </div>
          <h2>Your Hand</h2>
          <div className="hand">
            {player.hand.map(({ rank, suit }, i) => (
              <Card rank={rank} suit={suit} key={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gameboard;
