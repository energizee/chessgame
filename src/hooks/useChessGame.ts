import { useState } from "react";

import { Game, Move, initialGameState } from "@/types/chess";
import { startNewGame, getPseudoLegalMoves, makeMove } from "../core/game";

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

  const getLegalMoves = (square: { rank: number; file: number }) => {
    return getPseudoLegalMoves(gameState, square);
  };

  const selectSquare = (rank: number, file: number) => {
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
      setGame(makeMove(game, move));
      setSelectedSquare(null);
      setSelectedLegalMoves([]);
      return;
    }

    const piece = gameState.board[rank][file];
    if (piece && piece.colour !== gameState.turn) {
      return;
    }

    setSelectedSquare({ rank, file });
    setSelectedLegalMoves(getLegalMoves({ rank, file }));
  };

  return {
    gameState,
    gameInfo,
    startGame,
    getLegalMoves,
    selectSquare,
    selectedSquare,
  };
}
