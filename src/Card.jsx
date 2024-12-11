import * as deck from "@letele/playing-cards";
import { useGameContext } from "./context/GameContext";
import { useState } from "react";

const Card = ({ rank, suit, selected, onClick, opponent }) => {
  const CardComponent = deck[`${suit}${rank}`];
  return (
    <CardComponent
      style={{
        height: opponent ? "100px" : "200px",
        width: opponent ? "75px" : "150px",
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
