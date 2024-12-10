import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { io } from "socket.io-client";

// Initial State
const initialState = {
  players: {}, // Store players and their cards
  currentTurn: null, // Track whose turn it is
  cardPile: [], // Cards played so far
  deck: [], // Remaining cards in the deck
  phase: "start",
};

// Actions
const actions = {
  ADD_PLAYER: "ADD_PLAYER",
  UPDATE_GAME_STATE: "UPDATE_GAME_STATE",
  PLAY_CARD: "PLAY_CARD",
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case actions.ADD_PLAYER:
      return {
        ...state,
        players: {
          ...state.players,
          [action.payload.id]: action.payload,
        },
      };
    case actions.UPDATE_GAME_STATE:
      return { ...state, ...action.payload };
    case actions.PLAY_CARD:
      return {
        ...state,
        cardPile: [...state.cardPile, action.payload.card],
        players: {
          ...state.players,
          [action.payload.player]: {
            ...state.players[action.payload.player],
            cards: action.payload.remainingCards,
          },
        },
      };
    default:
      return state;
  }
};

// Create Context
const GameContext = createContext();

const socket = io("http://localhost:3001");
// Context Provider
export const GameProvider = ({ children }) => {
  const [dispatch] = useReducer(gameReducer, initialState);
  const [gameState, setGameState] = useState({
    players: [],
    deck: [],
    cardPile: [],
    currentTurn: null,
    phase: "start",
  });

  useEffect(() => {
    socket.on("gameStateUpdate", (newGameState) => {
      setGameState(newGameState);
    });

    return () => {
      socket.off("gameStateUpdate");
    };
  }, []);

  return (
    <GameContext.Provider value={{ state: gameState, dispatch, actions }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom Hook to Use Context
export const useGameContext = () => {
  return useContext(GameContext);
};
