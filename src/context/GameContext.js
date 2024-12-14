import React, { createContext, useContext, useEffect, useReducer } from "react";
import { io } from "socket.io-client";
import { Phases } from "../phases";

// Actions
const actions = {
  UPDATE_GAME_STATE: "UPDATE_GAME_STATE",
};

// Function to save state to localStorage
const saveStateToLocalStorage = (state) => {
  localStorage.setItem("gameState", JSON.stringify(state));
};

// Function to load state from localStorage
const loadStateFromLocalStorage = () => {
  const savedState = localStorage.getItem("gameState");
  return savedState ? JSON.parse(savedState) : null;
};

// Initial State
const defaultInitialState = {
  players: [], // Store players and their cards
  currentTurn: null, // Track whose turn it is
  cardPile: [], // Cards played so far
  deck: [], // Remaining cards in the deck
  phase: Phases.START, // Game phase
};

// Combine loaded state with default initial state
const initialState = loadStateFromLocalStorage() || defaultInitialState;

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case actions.UPDATE_GAME_STATE: {
      const newState = { ...state, ...action.payload };
      saveStateToLocalStorage(newState); // Save updated state to localStorage
      return newState;
    }
    default:
      return state;
  }
};

// Create Context
const GameContext = createContext();

// Create socket connection
const socket = io(process.env.REACT_APP_SERVER_URL);

// Context Provider
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    // Load game state from server on "gameStateUpdate"
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
    <GameContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom Hook to Use Context
export const useGameContext = () => {
  return useContext(GameContext);
};
