// Main game logic for the chess engine.
// All operations are pure: makeMove returns a new Game without mutating its inputs.

import {
  Board,
  Colour,
  Game,
  GameState,
  GameStatus,
  Move,
  Piece,
  PieceType,
  Square,
  CastlingRights,
  QUEEN_DIRS,
  KING_OFFS,
  KNIGHT_OFFS,
  ROOK_DIRS,
  BISHOP_DIRS,
  createInitialGameState,
  PAWN_VALUE,
  BISHOP_VALUE,
  KNIGHT_VALUE,
  ROOK_VALUE,
  QUEEN_VALUE,
} from "../types/chess";

// ----- Public API -----

export function startNewGame(): Game {
  return {
    history: [],
    current: createInitialGameState(),
  };
}

export function getLegalMoves(state: GameState, square: Square): Move[] {
  const piece = state.board[square.rank][square.file];
  if (!piece || piece.colour !== state.turn) return [];

  const pseudo = getPseudoLegalMoves(state, square);
  return pseudo.filter((move) => !movePutsOwnKingInCheck(state, move, piece.colour));
}

export function getAllLegalMoves(state: GameState) : Move[][] {
  const board : Board = state.board;
  const allLegalMoves: Move[][] = []
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece) {
        allLegalMoves.push(getLegalMoves(state, { rank: r, file: f }));
      }
    }
  }
  return allLegalMoves;
}

export function makeMove(game: Game, move: Move): Game {
  const prev = game.current;
  const piece = prev.board[move.from.rank][move.from.file];
  if (!piece) return game; // defensive: caller should only pass legal moves

  const next = applyMove(prev, move, piece);
  return {
    history: [...game.history, prev],
    current: { ...next, status: computeStatus(next) },
  };
}

export function undoMove(game: Game): Game {
  if (game.history.length === 0) return game;
  const previous = game.history[game.history.length - 1];
  return {
    history: game.history.slice(0, -1),
    current: previous,
  };
}

export function isInCheck(board: Board, colour: Colour): boolean {
  const king = findKing(board, colour);
  if (!king) return false;
  return squareIsAttacked(board, king, opponent(colour));
}

// ----- Move application (no status computation) -----

function applyMove(state: GameState, move: Move, piece: Piece): GameState {
  const board = cloneBoard(state.board);
  const target = board[move.to.rank][move.to.file];
  const isCapture = target !== null;

  let halfMoveClock = state.halfMoveClock + 1;
  let enPassantSquare: Square | null = null;

  if (isCapture) halfMoveClock = 0;

  if (piece.type === "pawn") {
    halfMoveClock = 0;
    handlePawnMove(board, state, move, piece);
    const dir = piece.colour === "white" ? -1 : 1;
    if (move.to.rank - move.from.rank === 2 * dir) {
      enPassantSquare = { rank: move.from.rank + dir, file: move.from.file };
    }
  } else {
    board[move.to.rank][move.to.file] = piece;
  }

  board[move.from.rank][move.from.file] = null;

  if (piece.type === "king" && Math.abs(move.to.file - move.from.file) === 2) {
    moveCastlingRook(board, move, piece.colour);
  }

  const castling = updateCastlingRights(state.castling, move, piece);
  const turn = opponent(state.turn);
  const fullMoveNumber =
    state.turn === "black" ? state.fullMoveNumber + 1 : state.fullMoveNumber;

  return {
    board,
    turn,
    status: "playing",
    castling,
    enPassantSquare,
    halfMoveClock,
    fullMoveNumber,
  };
}

function handlePawnMove(
  board: Board,
  state: GameState,
  move: Move,
  piece: Piece,
): void {
  const ep = state.enPassantSquare;
  const isEnPassantCapture =
    ep !== null &&
    move.to.rank === ep.rank &&
    move.to.file === ep.file &&
    move.from.file !== move.to.file;

  if (isEnPassantCapture) {
    // The captured pawn sits on the moving pawn's rank, in the destination file.
    board[move.from.rank][move.to.file] = null;
  }

  const isPromotion =
    (piece.colour === "white" && move.to.rank === 0) ||
    (piece.colour === "black" && move.to.rank === 7);

  if (isPromotion) {
    board[move.to.rank][move.to.file] = {
      type: move.promotion ?? "queen",
      colour: piece.colour,
    };
  } else {
    board[move.to.rank][move.to.file] = piece;
  }
}

function moveCastlingRook(board: Board, move: Move, colour: Colour): void {
  const rank = colour === "white" ? 7 : 0;
  if (move.to.file === 6) {
    // King-side: rook from h to f.
    board[rank][5] = board[rank][7];
    board[rank][7] = null;
  } else if (move.to.file === 2) {
    // Queen-side: rook from a to d.
    board[rank][3] = board[rank][0];
    board[rank][0] = null;
  }
}

function updateCastlingRights(
  rights: CastlingRights,
  move: Move,
  piece: Piece,
): CastlingRights {
  const next = { ...rights };
  if (piece.type === "king") {
    if (piece.colour === "white") {
      next.whiteKingSide = false;
      next.whiteQueenSide = false;
    } else {
      next.blackKingSide = false;
      next.blackQueenSide = false;
    }
  }
  if (piece.type === "rook") {
    if (piece.colour === "white" && move.from.rank === 7) {
      if (move.from.file === 0) next.whiteQueenSide = false;
      if (move.from.file === 7) next.whiteKingSide = false;
    }
    if (piece.colour === "black" && move.from.rank === 0) {
      if (move.from.file === 0) next.blackQueenSide = false;
      if (move.from.file === 7) next.blackKingSide = false;
    }
  }
  // Capturing a rook on its starting square removes the matching right.
  if (move.to.rank === 0 && move.to.file === 0) next.blackQueenSide = false;
  if (move.to.rank === 0 && move.to.file === 7) next.blackKingSide = false;
  if (move.to.rank === 7 && move.to.file === 0) next.whiteQueenSide = false;
  if (move.to.rank === 7 && move.to.file === 7) next.whiteKingSide = false;
  return next;
}

// ----- Status computation -----

function computeStatus(state: GameState): GameStatus {
  const inCheck = isInCheck(state.board, state.turn);
  const hasMoves = playerHasLegalMoves(state);
  if (!hasMoves) return inCheck ? "checkmate" : "stalemate";
  if (state.halfMoveClock >= 100) return "draw"; // 50-move rule (in half-moves)
  if (hasInsufficientMaterial(state.board)) return "draw";
  return inCheck ? "check" : "playing";
}

function playerHasLegalMoves(state: GameState): boolean {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = state.board[r][f];
      if (piece && piece.colour === state.turn) {
        if (getLegalMoves(state, { rank: r, file: f }).length > 0) return true;
      }
    }
  }
  return false;
}

function hasInsufficientMaterial(board: Board): boolean {
  type Located = Piece & { rank: number; file: number };
  const pieces: Located[] = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (p) pieces.push({ ...p, rank: r, file: f });
    }
  }
  const nonKings = pieces.filter((p) => p.type !== "king");

  if (nonKings.length === 0) return true; // K vs K
  if (nonKings.length === 1) {
    return nonKings[0].type === "knight" || nonKings[0].type === "bishop";
  }
  if (nonKings.length === 2) {
    const [a, b] = nonKings;
    if (a.type === "bishop" && b.type === "bishop" && a.colour !== b.colour) {
      const aSquare = (a.rank + a.file) % 2;
      const bSquare = (b.rank + b.file) % 2;
      if (aSquare === bSquare) return true; // bishops on same colour
    }
  }
  return false;
}

// ----- Pseudo-legal move generation -----

function getPseudoLegalMoves(state: GameState, square: Square): Move[] {
  const piece = state.board[square.rank][square.file];
  if (!piece) return [];

  let moves: Move[];
  switch (piece.type) {
    case "pawn":
      moves = pawnMoves(state.board, square, piece.colour, state.enPassantSquare);
      break;
    case "rook":
      moves = slidingMoves(state.board, square, ROOK_DIRS);
      break;
    case "knight":
      moves = offsetMoves(state.board, square, KNIGHT_OFFS);
      break;
    case "bishop":
      moves = slidingMoves(state.board, square, BISHOP_DIRS);
      break;
    case "queen":
      moves = slidingMoves(state.board, square, QUEEN_DIRS);
      break;
    case "king":
      moves = kingMoves(state, square, piece.colour);
      break;
  }

  // Strip moves that land on a friendly piece (pawnMoves already does this,
  // but slidingMoves/offsetMoves include capture-style entries).
  return moves.filter((m) => {
    const occupant = state.board[m.to.rank][m.to.file];
    return !occupant || occupant.colour !== piece.colour;
  });
}

function slidingMoves(board: Board, from: Square, directions: number[][]): Move[] {
  const moves: Move[] = [];
  for (const [rd, fd] of directions) {
    let rank = from.rank + rd;
    let file = from.file + fd;
    while (inBounds(rank, file)) {
      const occupant = board[rank][file];
      moves.push({ from, to: { rank, file } });
      if (occupant !== null) break;
      rank += rd;
      file += fd;
    }
  }
  return moves;
}

function offsetMoves(board: Board, from: Square, offsets: number[][]): Move[] {
  const moves: Move[] = [];
  for (const [ro, fo] of offsets) {
    const rank = from.rank + ro;
    const file = from.file + fo;
    if (inBounds(rank, file)) {
      moves.push({ from, to: { rank, file } });
    }
  }
  // Filter is applied by caller (getPseudoLegalMoves) for friendly captures.
  // We reference board to keep the signature consistent and allow future use.
  void board;
  return moves;
}

function pawnMoves(
  board: Board,
  from: Square,
  colour: Colour,
  enPassantSquare: Square | null,
): Move[] {
  const moves: Move[] = [];
  const dir = colour === "white" ? -1 : 1;
  const startRank = colour === "white" ? 6 : 1;

  const oneAhead = { rank: from.rank + dir, file: from.file };
  if (inBounds(oneAhead.rank, oneAhead.file) && board[oneAhead.rank][oneAhead.file] === null) {
    moves.push({ from, to: oneAhead });

    if (from.rank === startRank) {
      const twoAhead = { rank: from.rank + 2 * dir, file: from.file };
      if (board[twoAhead.rank][twoAhead.file] === null) {
        moves.push({ from, to: twoAhead });
      }
    }
  }

  for (const fileOff of [-1, 1]) {
    const target = { rank: from.rank + dir, file: from.file + fileOff };
    if (!inBounds(target.rank, target.file)) continue;
    const occupant = board[target.rank][target.file];
    if (occupant && occupant.colour !== colour) {
      moves.push({ from, to: target });
    } else if (
      occupant === null &&
      enPassantSquare &&
      enPassantSquare.rank === target.rank &&
      enPassantSquare.file === target.file
    ) {
      moves.push({ from, to: target });
    }
  }

  return moves;
}

function kingMoves(state: GameState, from: Square, colour: Colour): Move[] {
  const moves = offsetMoves(state.board, from, KING_OFFS);

  const homeRank = colour === "white" ? 7 : 0;
  if (from.rank !== homeRank || from.file !== 4) return moves;

  const enemy = opponent(colour);
  // Castling is illegal if the king is currently in check.
  if (squareIsAttacked(state.board, from, enemy)) return moves;

  const rights = state.castling;
  const canKingSide = colour === "white" ? rights.whiteKingSide : rights.blackKingSide;
  if (
    canKingSide &&
    state.board[homeRank][5] === null &&
    state.board[homeRank][6] === null &&
    !squareIsAttacked(state.board, { rank: homeRank, file: 5 }, enemy) &&
    !squareIsAttacked(state.board, { rank: homeRank, file: 6 }, enemy)
  ) {
    moves.push({ from, to: { rank: homeRank, file: 6 } });
  }

  const canQueenSide = colour === "white" ? rights.whiteQueenSide : rights.blackQueenSide;
  if (
    canQueenSide &&
    state.board[homeRank][1] === null &&
    state.board[homeRank][2] === null &&
    state.board[homeRank][3] === null &&
    !squareIsAttacked(state.board, { rank: homeRank, file: 3 }, enemy) &&
    !squareIsAttacked(state.board, { rank: homeRank, file: 2 }, enemy)
  ) {
    moves.push({ from, to: { rank: homeRank, file: 2 } });
  }

  return moves;
}

// ----- Attack detection -----

function squareIsAttacked(board: Board, target: Square, attacker: Colour): boolean {
  // Diagonal attackers: bishops, queens.
  for (const [rd, fd] of BISHOP_DIRS) {
    let r = target.rank + rd;
    let f = target.file + fd;
    while (inBounds(r, f)) {
      const piece = board[r][f];
      if (piece) {
        if (piece.colour === attacker && (piece.type === "bishop" || piece.type === "queen")) {
          return true;
        }
        break;
      }
      r += rd;
      f += fd;
    }
  }

  // Straight attackers: rooks, queens.
  for (const [rd, fd] of ROOK_DIRS) {
    let r = target.rank + rd;
    let f = target.file + fd;
    while (inBounds(r, f)) {
      const piece = board[r][f];
      if (piece) {
        if (piece.colour === attacker && (piece.type === "rook" || piece.type === "queen")) {
          return true;
        }
        break;
      }
      r += rd;
      f += fd;
    }
  }

  for (const [ro, fo] of KNIGHT_OFFS) {
    const r = target.rank + ro;
    const f = target.file + fo;
    if (inBounds(r, f)) {
      const piece = board[r][f];
      if (piece && piece.type === "knight" && piece.colour === attacker) return true;
    }
  }

  for (const [ro, fo] of KING_OFFS) {
    const r = target.rank + ro;
    const f = target.file + fo;
    if (inBounds(r, f)) {
      const piece = board[r][f];
      if (piece && piece.type === "king" && piece.colour === attacker) return true;
    }
  }

  // Pawn attackers sit one rank "in front of" the target relative to their own direction.
  const pawnRank = attacker === "white" ? target.rank + 1 : target.rank - 1;
  for (const fo of [-1, 1]) {
    const f = target.file + fo;
    if (inBounds(pawnRank, f)) {
      const piece = board[pawnRank][f];
      if (piece && piece.type === "pawn" && piece.colour === attacker) return true;
    }
  }

  return false;
}

function movePutsOwnKingInCheck(state: GameState, move: Move, colour: Colour): boolean {
  const board = cloneBoard(state.board);
  const piece = board[move.from.rank][move.from.file];
  if (!piece) return false;

  // En passant: remove the pawn that's actually being captured before testing.
  if (
    piece.type === "pawn" &&
    state.enPassantSquare &&
    move.to.rank === state.enPassantSquare.rank &&
    move.to.file === state.enPassantSquare.file &&
    move.from.file !== move.to.file
  ) {
    board[move.from.rank][move.to.file] = null;
  }

  board[move.to.rank][move.to.file] = piece;
  board[move.from.rank][move.from.file] = null;

  // Castling pass-through is enforced during pseudo-legal generation, so we
  // only need to verify the king's destination here.
  if (piece.type === "king" && Math.abs(move.to.file - move.from.file) === 2) {
    const rank = move.from.rank;
    if (move.to.file === 6) {
      board[rank][5] = board[rank][7];
      board[rank][7] = null;
    } else if (move.to.file === 2) {
      board[rank][3] = board[rank][0];
      board[rank][0] = null;
    }
  }

  return isInCheck(board, colour);
}

// ----- Helpers -----

function inBounds(rank: number, file: number): boolean {
  return rank >= 0 && rank <= 7 && file >= 0 && file <= 7;
}

function opponent(colour: Colour): Colour {
  return colour === "white" ? "black" : "white";
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

function findKing(board: Board, colour: Colour): Square | null {
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece && piece.type === "king" && piece.colour === colour) {
        return { rank: r, file: f };
      }
    }
  }
  return null;
}

export function isPromotionMove(state: GameState, move: Move): boolean {
  const piece = state.board[move.from.rank][move.from.file];
  if (!piece || piece.type !== "pawn") return false;
  return (
    (piece.colour === "white" && move.to.rank === 0) ||
    (piece.colour === "black" && move.to.rank === 7)
  );
}

// EVAL

export function stateEval(gameState: GameState) {
  const board = gameState.board;
  let evalNum = 0.1;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece) {
        if (gameState.turn === "white") {
          switch (piece.type) {
            case "pawn":
              evalNum += PAWN_VALUE;
              break;
            case "bishop":
              evalNum += BISHOP_VALUE;
              break;
            case "knight":
              evalNum += KNIGHT_VALUE;
              break;
            case "rook":
              evalNum += ROOK_VALUE;
              break;
            case "queen":
              evalNum += QUEEN_VALUE;
              break;
          }
        } else {
          switch (piece.type) {
            case "pawn":
              evalNum -= PAWN_VALUE;
              break;
            case "bishop":
              evalNum -= BISHOP_VALUE;
              break;
            case "knight":
              evalNum -= KNIGHT_VALUE;
              break;
            case "rook":
              evalNum -= ROOK_VALUE;
              break;
            case "queen":
              evalNum -= QUEEN_VALUE;
              break;
          }
        }
      }
    }
  }
  return evalNum;
}

// Re-export PieceType users sometimes need alongside game functions.
export type { PieceType };
