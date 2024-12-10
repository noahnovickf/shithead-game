import * as deck from "@letele/playing-cards";

const Card = ({ rank, suit }) => {
  const CardComponent = deck[`${suit}${rank}`];

  return (
    <CardComponent
      ref={dragRef}
      style={{
        height: "200px",
        width: "150px",
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={() => {
        console.log(rank, suit);
      }}
    />
  );
};

export default Card;
