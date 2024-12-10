const HiddenCard = ({ rank, suit }) => {
  return (
    <button
      style={{
        backgroundImage: `url('/CardBack.svg')`,
        backgroundSize: "cover", // Ensures the image covers the button
        backgroundPosition: "center", // Centers the image
        height: "200px",
        width: "150px",
        border: "none", // Optional: removes button border
        borderRadius: "10px", // Optional: adds border radius
      }}
      onClick={() => {
        console.log(rank, suit);
      }}
    />
  );
};

export default HiddenCard;
