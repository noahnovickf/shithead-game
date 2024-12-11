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
  SWAP_CARDS: "SWAP_CARDS",
  SET_READY: "SET_READY",
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case actions.SWAP_CARDS: {
      const { userId, handCard, faceUpCard } = action.payload;
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
          const newHand = topCard ? [...updatedHand, topCard] : updatedHand;

          return {
            ...player,
            hand: newHand, // Update player's hand
          };
        }

        return player;
      });

      return {
        ...state,
        cardPile: [...state.cardPile, card], // Add played card to the cardPile
        players: updatedPlayers, // Update the players' state
      };
    }
    case actions.ADD_PLAYER:
      return {
        ...state,
        players: [...state.players, action.payload], // Adding a new player to the players array
      };
    case actions.SET_READY: {
      const { userId } = action.payload;
      const updatedPlayers = state.players.map((player) =>
        player.id === userId ? { ...player, ready: true } : player
      );

      const allPlayersReady = updatedPlayers.every((player) => player.ready);

      return {
        ...state,
        players: updatedPlayers,
        phase: allPlayersReady ? Phases.PLAYING : state.phase, // Move to "playing" phase if both players are ready
      };
    }
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
