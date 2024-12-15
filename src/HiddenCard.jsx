import { socket } from "./App";
import { useGameContext } from "./context/GameContext";
import useIsMobile from "./isMobileHook";
import { useParams } from "react-router-dom";

const HiddenCard = ({ user, card, opponent }) => {
  const {
    state: { gameState },
  } = useGameContext();
  const { gameId } = useParams();
  const isMobile = useIsMobile();
  const player = gameState.players.find((p) => p.id === user);

  return (
    <button
      style={{
        backgroundImage: `url('/CardBack.svg')`,
        backgroundSize: "cover", // Ensures the image covers the button
        backgroundPosition: "center", // Centers the image
        height: isMobile || opponent ? "125px" : "200px",
        width: isMobile || opponent ? "90px" : "150px",
        border: "2px solid black", // Optional: removes button border
        borderRadius: "10px", // Optional: adds border radius
      }}
      onClick={() => {
        if (
          player?.hand.length === 0 &&
          player.faceUp.length === 0 &&
          gameState.currentTurn === user
        ) {
          socket.emit("deadFlip", { gameId, userId: user, card: card });
        }
      }}
    />
  );
};

export default HiddenCard;
