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
  ADD_PLAYER: "ADD_PLAYER",
  UPDATE_GAME_STATE: "UPDATE_GAME_STATE",
  PLAY_CARD: "PLAY_CARD",
  PICKUP_DECK: "PICKUP_DECK",
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case actions.PLAY_CARD: {
      const { playerId, card } = action.payload;
      const updatedPlayers = state.players.map((player) => {
        if (player.id === playerId) {
          // Remove the played card from the player's hand
          const updatedHand = player.hand.filter(
            (c) => !(c.rank === card.rank && c.suit === card.suit)
          );

          // Add the top card from the cardPile to the player's hand (if exists)
          const topCard = state.cardPile[state.cardPile.length - 1];

          // Replace played card with top card from the cardPile (if there is a card in cardPile)
          const newHand =
            player.hand.length <= 3 && topCard
              ? [...updatedHand, topCard]
              : updatedHand;

          return {
            ...player,
            hand: newHand, // Update player's hand
          };
        }

        return player;
      });

      return {
        ...state,
        cardPile: [...state.cardPile, card],
        currentTurn:
          state.players[
            (state.players.indexOf(playerId) + 1) % state.players.length
          ].id,
        players: updatedPlayers, // Update the players' state
      };
    }
    case actions.PICKUP_DECK: {
      const { playerId } = action.payload;
      const updatedPlayers = state.players.map((player) => {
        if (player.id === playerId) {
          const newHand = [...player.hand, ...state.cardPile];

          return {
            ...player,
            hand: newHand, // Update player's hand
          };
        }

        return player;
      });

      return {
        ...state,
        cardPile: [], // Clear the cardPile
        players: updatedPlayers,
        currentTurn:
          state.players[
            (state.players.indexOf(playerId) + 1) % state.players.length
          ].id,
      };
    }

    case actions.ADD_PLAYER:
      return {
        ...state,
        players: [...state.players, action.payload],
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
