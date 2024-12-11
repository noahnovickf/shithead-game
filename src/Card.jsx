import * as deck from "@letele/playing-cards";
import { useGameContext } from "./context/GameContext";
import { useState } from "react";

const Card = ({ rank, suit, selected, onClick }) => {
  const CardComponent = deck[`${suit}${rank}`];
  return (
    <CardComponent
      style={{
        height: "200px",
        width: "150px",
        border: selected ? "4px solid red" : "none",
        borderRadius: "10px",
        cursor: "pointer",
      }}
      onClick={onClick}
    />
  );
};

export default Card;
