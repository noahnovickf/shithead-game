import { useNavigate } from "react-router-dom";

const HomeButton = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/")} className="home-button">
      Home
    </button>
  );
};

export default HomeButton;
