// The main game logic and state management for the game.
// This is where everything actually exists, and is then passed into the UI

import {
  Board,
  Colour,
  Game,
  GameState,
  Move,
  QUEEN_DIRS,
  KING_OFFS,
  KNIGHT_OFFS,
  ROOK_DIRS,
  BISHOP_DIRS,
  initialGameState,
} from "../types/chess";

export function startNewGame(): Game {
  return {
    history: [],
    current: initialGameState,
  };
}

function moveIsPossible(rank: number, file: number): boolean {
  if (rank < 0 || rank > 7 || file < 0 || file > 7) {
    return false; // Out of bounds
  }
  return true;
}

function slidingMoves(
  board: Board,
  startSquare: { rank: number; file: number },
  directions: number[][],
): Move[] {
  const moves: Move[] = [];
  for (const [rankDir, fileDir] of directions) {
    let rank = startSquare.rank + rankDir;
    let file = startSquare.file + fileDir;
    while (moveIsPossible(rank, file)) {
      if (board[rank][file] === null) {
        moves.push({ from: startSquare, to: { rank, file } });
      } else {
        // Capture move
        moves.push({ from: startSquare, to: { rank, file } });
        break; // Can't move past captured piece
      }
      rank += rankDir;
      file += fileDir;
    }
  }
  return moves;
}

function offsetMoves(
  board: Board,
  startSquare: { rank: number; file: number },
  offsets: number[][],
): Move[] {
  const moves: Move[] = [];
  for (const [rankOff, fileOff] of offsets) {
    const rank = startSquare.rank + rankOff;
    const file = startSquare.file + fileOff;
    if (moveIsPossible(rank, file)) {
      if (board[rank][file] === null) {
        moves.push({ from: startSquare, to: { rank, file } });
      } else {
        // Capture move
        moves.push({ from: startSquare, to: { rank, file } });
      }
    }
  }
  return moves;
}

function pawnMoves(
  board: Board,
  startSquare: { rank: number; file: number },
  colour: Colour
): Move[] {
  const moves: Move[] = [];
  if (colour === "white") {
    // Forward move
    if (board[startSquare.rank - 1][startSquare.file] === null) {
      moves.push({
        from: startSquare,
        to: { rank: startSquare.rank - 1, file: startSquare.file },
      });
    }
    if (startSquare.rank === 6 && board[4][startSquare.file] === null) {
      moves.push({
        from: startSquare,
        to: { rank: 4, file: startSquare.file },
      });
    }
    const diagLeft = { rank: startSquare.rank - 1, file: startSquare.file - 1 };
    const diagRight = {
      rank: startSquare.rank - 1,
      file: startSquare.file + 1,
    };
    if (board[diagLeft.rank][diagLeft.file]) {
      moves.push({ from: startSquare, to: diagLeft });
    }
    if (board[diagRight.rank][diagRight.file]) {
      moves.push({ from: startSquare, to: diagRight });
    }
  } else {
    // Forward move
    if (board[startSquare.rank + 1][startSquare.file] === null) {
      moves.push({
        from: startSquare,
        to: { rank: startSquare.rank + 1, file: startSquare.file },
      });
    }
    if (startSquare.rank === 1 && board[3][startSquare.file] === null) {
      moves.push({
        from: startSquare,
        to: { rank: 3, file: startSquare.file },
      });
    }
    const diagLeft = { rank: startSquare.rank + 1, file: startSquare.file - 1 };
    const diagRight = {
      rank: startSquare.rank + 1,
      file: startSquare.file + 1,
    };
    if (board[diagLeft.rank][diagLeft.file]) {
      moves.push({ from: startSquare, to: diagLeft });
    }
    if (board[diagRight.rank][diagRight.file]) {
      moves.push({ from: startSquare, to: diagRight });
    }
  }
  return moves;
}

export function getPseudoLegalMoves(
  gameState: GameState,
  square: { rank: number; file: number },
): Move[] {
  const moves: Move[] = [];
  const piece = gameState.board[square.rank][square.file];
  if (!piece) return moves; // No piece on this square

  const { board } = gameState;
  switch (piece.type) {
    case "pawn":
      moves.push(...pawnMoves(board, square, piece.colour)); // Placeholder startSquare
      break;
    case "rook":
      moves.push(...slidingMoves(board, square, ROOK_DIRS)); // Placeholder startSquare
      break;
    case "knight":
      moves.push(...offsetMoves(board, square, KNIGHT_OFFS));
      break;
    case "bishop":
      moves.push(...slidingMoves(board, square, BISHOP_DIRS)); // Placeholder startSquare
      break;
    case "queen":
      moves.push(...slidingMoves(board, square, QUEEN_DIRS));
      break;
    case "king":
      moves.push(...offsetMoves(board, square, KING_OFFS));
      break;
  }

  return moves;
}

export function makeMove(game: Game, move: Move): Game {
  const newBoard = game.current.board.map((row) => row.slice());
    const piece = newBoard[move.from.rank][move.from.file];
    if (!piece) {
        return game; // Invalid move, no piece at source
    }
    if (piece.type === "pawn") {
        // Handle promotion (for simplicity, always promote to queen)
        if ((piece.colour === "white" && move.to.rank === 0) || (piece.colour === "black" && move.to.rank === 7)) {
            // TODO: Prompt user for promotion choice
            newBoard[move.to.rank][move.to.file] = { type: "queen", colour: piece.colour };
        } else if ((piece.colour === "white" && move.from.rank === 6 && move.to.rank === 4) || (piece.colour === "black" && move.from.rank === 1 && move.to.rank === 3)) {
    } 
  newBoard[move.to.rank][move.to.file] = piece;
  newBoard[move.from.rank][move.from.file] = null;

  const nextTurn: Colour = game.current.turn === "white" ? "black" : "white";
  const newGameState: GameState = {
    board: newBoard,
    turn: nextTurn,
    status: "playing",
    castling: game.current.castling,
    enPassantSquare: game.current.enPassantSquare,
  };

  return {
    history: [...game.history, game.current],
    current: newGameState,
  };
}
