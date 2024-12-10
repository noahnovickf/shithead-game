import * as deck from "@letele/playing-cards";

const Card = ({ rank, suit }) => {
  const Card = deck[`${suit}${rank}`];
  return (
    <Card
      style={{ height: "200px", width: "150px" }}
      onClick={() => {
        console.log(rank, suit);
      }}
    />
  );
};

export default Card;
