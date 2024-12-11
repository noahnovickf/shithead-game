import React, { createContext, useContext, useEffect, useReducer } from "react";
import { io } from "socket.io-client";

// Initial State
const initialState = {
  players: [], // Store players and their cards
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
  SWAP_CARDS: "SWAP_CARDS",
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case actions.SWAP_CARDS: {
      const { userId, handCard, faceUpCard } = action.payload;
      console.log(state.players);
      const playerIndex = state.players.findIndex(
        (player) => player.id === userId
      );
      if (playerIndex === -1) return state;

      const updatedPlayers = [...state.players];
      const player = updatedPlayers[playerIndex];

      // Swap the cards
      const handIndex = player.hand.findIndex(
        (c) => c.rank === handCard.rank && c.suit === handCard.suit
      );
      const faceUpIndex = player.faceUp.findIndex(
        (c) => c.rank === faceUpCard.rank && c.suit === faceUpCard.suit
      );

      if (handIndex !== -1 && faceUpIndex !== -1) {
        [player.hand[handIndex], player.faceUp[faceUpIndex]] = [
          player.faceUp[faceUpIndex],
          player.hand[handIndex],
        ];
      }

      return {
        ...state,
        players: updatedPlayers,
      };
    }
    case actions.ADD_PLAYER:
      return {
        ...state,
        players: [...state.players, action.payload], // Adding a new player to the players array
      };
    case actions.UPDATE_GAME_STATE:
      return { ...state, ...action.payload };
    case actions.PLAY_CARD:
      return {
        ...state,
        cardPile: [...state.cardPile, action.payload.card],
        players: state.players.map((player) =>
          player.id === action.payload.player
            ? { ...player, cards: action.payload.remainingCards }
            : player
        ),
      };
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
