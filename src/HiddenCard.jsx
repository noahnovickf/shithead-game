import { socket } from "./App";
import { useGameContext } from "./context/GameContext";
import useIsMobile from "./isMobileHook";

const HiddenCard = ({ user, card, opponent }) => {
  const { state } = useGameContext();
  const isMobile = useIsMobile();
  const player = state.players.find((p) => p.id === user);

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
          state.currentTurn === user
        ) {
          socket.emit("deadFlip", { userId: user, card: card });
        }
      }}
    />
  );
};

export default HiddenCard;
