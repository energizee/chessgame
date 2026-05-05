import { useState } from "react";

import { Game, Move, PieceType, Square } from "@/types/chess";
import {
  startNewGame,
  makeMove,
  getLegalMoves,
  isPromotionMove,
  undoMove,
} from "@/core/game";

export function useChessGame() {
  const [game, setGame] = useState<Game>(() => startNewGame());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [selectedLegalMoves, setSelectedLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<Move | null>(null);

  const gameState = game.current;
  const isOver =
    gameState.status === "checkmate" ||
    gameState.status === "stalemate" ||
    gameState.status === "draw";

  const gameInfo = {
    turn: gameState.turn,
    status: gameState.status,
    moves: game.history.length,
    fullMoveNumber: gameState.fullMoveNumber,
  };

  const clearSelection = () => {
    setSelectedSquare(null);
    setSelectedLegalMoves([]);
  };

  const startGame = () => {
    setGame(startNewGame());
    clearSelection();
    setPendingPromotion(null);
  };

  const undo = () => {
    setGame((prev) => undoMove(prev));
    clearSelection();
    setPendingPromotion(null);
  };

  const commitMove = (move: Move) => {
    setGame((prev) => makeMove(prev, move));
    clearSelection();
    setPendingPromotion(null);
  };

  const choosePromotion = (promotion: PieceType) => {
    if (!pendingPromotion) return;
    commitMove({ ...pendingPromotion, promotion });
  };

  const cancelPromotion = () => {
    setPendingPromotion(null);
    clearSelection();
  };

  const selectSquare = (rank: number, file: number) => {
    if (isOver || pendingPromotion) return;

    if (selectedSquare?.rank === rank && selectedSquare.file === file) {
      clearSelection();
      return;
    }

    const target = selectedLegalMoves.find(
      (m) => m.to.rank === rank && m.to.file === file,
    );
    if (target) {
      if (isPromotionMove(gameState, target)) {
        setPendingPromotion(target);
        return;
      }
      commitMove(target);
      return;
    }

    const piece = gameState.board[rank][file];
    if (!piece || piece.colour !== gameState.turn) {
      clearSelection();
      return;
    }

    setSelectedSquare({ rank, file });
    setSelectedLegalMoves(getLegalMoves(gameState, { rank, file }));
  };

  return {
    gameState,
    gameInfo,
    selectedSquare,
    selectedLegalMoves,
    pendingPromotion,
    startGame,
    undo,
    selectSquare,
    choosePromotion,
    cancelPromotion,
    canUndo: game.history.length > 0,
  };
}
