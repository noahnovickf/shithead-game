const HiddenCard = ({ rank, suit, opponent }) => {
  return (
    <button
      style={{
        backgroundImage: `url('/CardBack.svg')`,
        backgroundSize: "cover", // Ensures the image covers the button
        backgroundPosition: "center", // Centers the image
        height: opponent ? "100px" : "200px",
        width: opponent ? "75px" : "150px",
        border: "2px solid black", // Optional: removes button border
        borderRadius: "10px", // Optional: adds border radius
      }}
      onClick={() => {
        console.log(rank, suit);
      }}
    />
  );
};

export default HiddenCard;
