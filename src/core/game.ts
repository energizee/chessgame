// The main game logic and state management for the game.
// This is where everything actually exists, and is then passed into the UI

import {
  Board,
  Colour,
  Game,
  GameState,
  GameStatus,
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

export function checkForCheckMateOrStalemate(gameState: GameState): GameStatus {
  // Check if the current player has any legal moves left
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = gameState.board[rank][file];
      if (piece && piece.colour === gameState.turn) {
        const moves = getLegalMoves(gameState, { rank, file });
        if (moves.length > 0) {
          return gameState.status; // Found a legal move
        }
      }
    }
  }
  // No legal moves found
  if (isInCheck(gameState)) {
    return "checkmate";
  }
  return "stalemate";
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
  colour: Colour,
  enPassantSquare: { rank: number; file: number } | null,
): Move[] {
  const moves: Move[] = [];
  const dir = colour === "white" ? -1 : 1;
  const startRank = colour === "white" ? 6 : 1;

  const oneAhead = { rank: startSquare.rank + dir, file: startSquare.file };
  if (
    moveIsPossible(oneAhead.rank, oneAhead.file) &&
    board[oneAhead.rank][oneAhead.file] === null
  ) {
    moves.push({ from: startSquare, to: oneAhead });

    const twoAhead = {
      rank: startSquare.rank + 2 * dir,
      file: startSquare.file,
    };
    if (
      startSquare.rank === startRank &&
      board[twoAhead.rank][twoAhead.file] === null
    ) {
      moves.push({ from: startSquare, to: twoAhead });
    }
  }

  for (const fileOff of [-1, 1]) {
    const target = {
      rank: startSquare.rank + dir,
      file: startSquare.file + fileOff,
    };
    if (!moveIsPossible(target.rank, target.file)) continue;
    const occupant = board[target.rank][target.file];
    if (occupant && occupant.colour !== colour) {
      moves.push({ from: startSquare, to: target });
    } else if (
      occupant === null &&
      enPassantSquare &&
      enPassantSquare.rank === target.rank &&
      enPassantSquare.file === target.file
    ) {
      moves.push({ from: startSquare, to: target });
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
      moves.push(
        ...pawnMoves(board, square, piece.colour, gameState.enPassantSquare),
      );
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

  return moves.filter((move) => {
    const targetPiece = board[move.to.rank][move.to.file];
    return !targetPiece || targetPiece.colour !== piece.colour;
  });
}

function isInCheck(gameState: GameState): boolean {
  // Get all possible moves from the square and check if any of them can capture the opponent's king
  const kingSquare = gameState.board
    .flatMap((row, rank) =>
      row.map((piece, file) =>
        piece && piece.type === "king" ? { rank, file } : null,
      ),
    )
    .find((sq) => sq !== null) as { rank: number; file: number } | undefined;

  return false;
}

export function getLegalMoves(
  gameState: GameState,
  square: { rank: number; file: number },
): Move[] {
  const pseudoLegalMoves = getPseudoLegalMoves(gameState, square);

  const legalMoves: Move[] = [];
  for (const move of pseudoLegalMoves) {
    const newGameState = makeMove({ history: [], current: gameState }, move);
    const checkResult = isInCheck(newGameState.current);
    if (!checkResult) {
      legalMoves.push(move);
    }
  }
  return legalMoves;
}

export function makeMove(game: Game, move: Move): Game {
  const newBoard = game.current.board.map((row) => row.slice());
  let newEnPassantSquare = null; // Reset en passant square by default
  const piece = newBoard[move.from.rank][move.from.file];
  if (!piece) {
    return game; // Invalid move, no piece at source
  }
  if (piece.type === "pawn") {
    // Handle promotion (for simplicity, always promote to queen)
    if (
      (piece.colour === "white" && move.to.rank === 0) ||
      (piece.colour === "black" && move.to.rank === 7)
    ) {
      // TODO: Prompt user for promotion choice
      newBoard[move.to.rank][move.to.file] = {
        type: "queen",
        colour: piece.colour,
      };
    } else if (
      (piece.colour === "white" &&
        move.from.rank === 6 &&
        move.to.rank === 4) ||
      (piece.colour === "black" && move.from.rank === 1 && move.to.rank === 3)
    ) {
      newEnPassantSquare = {
        rank: (move.from.rank + move.to.rank) / 2,
        file: move.from.file,
      };
    } else if (
      game.current.enPassantSquare &&
      move.to.rank === game.current.enPassantSquare.rank &&
      move.to.file === game.current.enPassantSquare.file &&
      move.from.file !== move.to.file
    ) {
      // Capturing en passant by keeping on the same rank, but moving over one to the file of the captured pawn
      // This is what actually captures the pawn after the diagonal move is made
      newBoard[move.from.rank][move.to.file] = null;
    }
  }
  newBoard[move.to.rank][move.to.file] = piece;
  newBoard[move.from.rank][move.from.file] = null;
  const inCheckResult = isInCheck({
    ...game.current,
    board: newBoard,
  });

  const nextTurn: Colour = game.current.turn === "white" ? "black" : "white";
  const newGameState: GameState = {
    board: newBoard,
    turn: nextTurn,
    status: inCheckResult ? "check" : "playing",
    castling: game.current.castling,
    enPassantSquare: newEnPassantSquare,
  };

  return {
    history: [...game.history, game.current],
    current: newGameState,
  };
}
