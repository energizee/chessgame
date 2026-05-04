import { useState } from "react";

import { Game, Move, initialGameState } from "@/types/chess";
import {
  startNewGame,
  makeMove,
  getLegalMoves,
  checkForCheckMateOrStalemate,
} from "../core/game";

export function useChessGame() {
  const [selectedSquare, setSelectedSquare] = useState<{
    rank: number;
    file: number;
  } | null>(null);
  const [selectedLegalMoves, setSelectedLegalMoves] = useState<Move[]>([]);
  const [game, setGame] = useState<Game>({
    history: [],
    current: initialGameState,
  });

  const gameState = game.current;
  const gameInfo = {
    turn: gameState.turn,
    status: gameState.status,
    moves: game.history.length,
  };

  const startGame = () => {
    setGame(startNewGame());
  };

  const getMoves = (square: { rank: number; file: number }) => {
    return getLegalMoves(gameState, square);
  };

  const selectSquare = (rank: number, file: number) => {
    if (gameState.status === "checkmate" || gameState.status === "stalemate") {
      return; // Game is over, no moves allowed
    }
    if (
      selectedSquare &&
      selectedSquare.rank === rank &&
      selectedSquare.file === file
    ) {
      setSelectedSquare(null);
      setSelectedLegalMoves([]);
      return;
    }

    const move = selectedLegalMoves.find(
      (m) => m.to.rank === rank && m.to.file === file,
    );
    if (move) {
      const newState = makeMove(game, move);
      setGame(newState);
      setSelectedSquare(null);
      setSelectedLegalMoves([]);
      const gameEnd = checkForCheckMateOrStalemate(newState.current);
      console.log(gameEnd);
      if (gameEnd === "checkmate" || gameEnd === "stalemate") {
        game.current.status = gameEnd; // Update the game status
        alert(`Game over: ${gameEnd}`);
      }
      return;
    }

    const piece = gameState.board[rank][file];
    if (piece && piece.colour !== gameState.turn) {
      return;
    }

    setSelectedSquare({ rank, file });
    setSelectedLegalMoves(getMoves({ rank, file }));
  };

  return {
    gameState,
    gameInfo,
    startGame,
    getMoves,
    selectSquare,
    selectedLegalMoves,
    selectedSquare,
  };
}
