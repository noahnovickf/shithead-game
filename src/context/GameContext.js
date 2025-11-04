import React, { createContext, useContext, useEffect, useReducer } from "react";
import { io } from "socket.io-client";

// Actions
const actions = {
  SET_USERNAME: "SET_USERNAME",
  UPDATE_GAME_STATE: "UPDATE_GAME_STATE",
};

// Function to load username from localStorage
const loadUsernameFromLocalStorage = () => {
  return localStorage.getItem("username") || null;
};

// Initial State
const initialState = {
  username: loadUsernameFromLocalStorage(), // Keep the username in the browser
  gameState: null, // Game state from the server
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case actions.SET_USERNAME:
      return { ...state, username: action.payload };
    case actions.UPDATE_GAME_STATE:
      return { ...state, gameState: action.payload };
    default:
      return state;
  }
};

// Create Context
const GameContext = createContext();

// Create socket connection
const socket = io(process.env.REACT_APP_SERVER_URL || "http://localhost:3001");

// Context Provider
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    // Listen for game state updates from the server
    socket.on("gameStateUpdate", (newGameState) => {
      dispatch({
        type: actions.UPDATE_GAME_STATE,
        payload: newGameState,
      });
    });

    return () => {
      socket.off("gameStateUpdate");
    };
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, actions, socket }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom Hook to Use Context
export const useGameContext = () => {
  return useContext(GameContext);
};
