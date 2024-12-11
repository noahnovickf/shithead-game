import React, { createContext, useContext, useEffect, useReducer } from "react";
import { io } from "socket.io-client";
import { Phases } from "../phases";

// Initial State
const initialState = {
  players: [], // Store players and their cards
  currentTurn: null, // Track whose turn it is
  cardPile: [], // Cards played so far
  deck: [], // Remaining cards in the deck
  phase: Phases.START, // Game phase
};

// Actions
const actions = {
  UPDATE_GAME_STATE: "UPDATE_GAME_STATE",
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case actions.UPDATE_GAME_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// Create Context
const GameContext = createContext();

// Create socket connection
const socket = io("http://localhost:3001");

// Context Provider
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    socket.on("gameStateUpdate", (newGameState) => {
      // Sync the game state with the context reducer
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
