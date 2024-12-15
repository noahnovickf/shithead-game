import { useState, useEffect } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  const checkIsMobile = () => {
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
  };

  useEffect(() => {
    // Check initial state
    checkIsMobile();

    // Add a resize event listener
    window.addEventListener("resize", checkIsMobile);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

export default useIsMobile;
