import * as deck from "@letele/playing-cards";
import "./gameboard.css";
import useIsMobile from "./isMobileHook";

const Card = ({ rank, suit, selected, onClick, opponent }) => {
  const CardComponent = deck[`${suit}${rank}`];
  const isMobile = useIsMobile();
  return (
    <CardComponent
      style={{
        height: isMobile || opponent ? "125px" : "150px",
        width: isMobile || opponent ? "90px" : "110px",
        border: selected ? "4px solid red" : "2px solid black",
        boxSizing: "border-box",
        borderRadius: "10px",
        cursor: "pointer",
      }}
      onClick={onClick}
    />
  );
};

export default Card;
