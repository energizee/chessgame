// Data structures for the chess engine.
// Coordinates: rank 0 = top of board (black's back rank), rank 7 = bottom (white's back rank).
// file 0 = a-file, file 7 = h-file.

export type Colour = "white" | "black";

export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";

export type GameStatus =
  | "playing"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw";

export type Square = { rank: number; file: number };

export interface Piece {
  type: PieceType;
  colour: Colour;
}

export type Board = (Piece | null)[][];

export type CastlingRights = {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
};

export type GameState = {
  board: Board;
  turn: Colour;
  status: GameStatus;
  castling: CastlingRights;
  enPassantSquare: Square | null;
  halfMoveClock: number; // for 50-move rule
  fullMoveNumber: number;
};

export interface Game {
  history: GameState[];
  current: GameState;
}

export type Move = {
  from: Square;
  to: Square;
  promotion?: PieceType;
};

// Promotion choices a pawn can make.
export const PROMOTION_CHOICES: PieceType[] = [
  "queen",
  "rook",
  "bishop",
  "knight",
];

export const ROOK_DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
export const BISHOP_DIRS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
export const QUEEN_DIRS = [...ROOK_DIRS, ...BISHOP_DIRS];
export const KNIGHT_OFFS = [
  [2, 1],
  [2, -1],
  [-2, 1],
  [-2, -1],
  [1, 2],
  [1, -2],
  [-1, 2],
  [-1, -2],
];
export const KING_OFFS = QUEEN_DIRS; // same 8 directions, just one step]

export const PAWN_VALUE = 1;
export const KNIGHT_VALUE = 3;
export const BISHOP_VALUE = 3;
export const ROOK_VALUE = 5;
export const QUEEN_VALUE = 9;

function buildInitialBoard(): Board {
  const empty = (): (Piece | null)[] => Array(8).fill(null);
  return [
    [
      { type: "rook", colour: "black" },
      { type: "knight", colour: "black" },
      { type: "bishop", colour: "black" },
      { type: "queen", colour: "black" },
      { type: "king", colour: "black" },
      { type: "bishop", colour: "black" },
      { type: "knight", colour: "black" },
      { type: "rook", colour: "black" },
    ],
    Array.from({ length: 8 }, () => ({ type: "pawn", colour: "black" }) as Piece),
    empty(),
    empty(),
    empty(),
    empty(),
    Array.from({ length: 8 }, () => ({ type: "pawn", colour: "white" }) as Piece),
    [
      { type: "rook", colour: "white" },
      { type: "knight", colour: "white" },
      { type: "bishop", colour: "white" },
      { type: "queen", colour: "white" },
      { type: "king", colour: "white" },
      { type: "bishop", colour: "white" },
      { type: "knight", colour: "white" },
      { type: "rook", colour: "white" },
    ],
  ];
}

export function createInitialGameState(): GameState {
  return {
    board: buildInitialBoard(),
    turn: "white",
    status: "playing",
    castling: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
    enPassantSquare: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
  };
}
