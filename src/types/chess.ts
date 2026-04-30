// Data structures
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

export interface Game {
  history: GameState[];
  current: GameState;
}

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
  enPassantSquare: { rank: number; file: number } | null;
};

export type Board = (Piece | null)[][];

export interface Piece {
  type: PieceType;
  colour: Colour;
}

export type Move = {
  from: { rank: number; file: number };
  to: { rank: number; file: number };
};

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
export const KING_OFFS = QUEEN_DIRS; // same 8 directions, just one step

const initialBoard: Board = [
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
  [
    { type: "pawn", colour: "black" },
    { type: "pawn", colour: "black" },
    { type: "pawn", colour: "black" },
    { type: "pawn", colour: "black" },
    { type: "pawn", colour: "black" },
    { type: "pawn", colour: "black" },
    { type: "pawn", colour: "black" },
    { type: "pawn", colour: "black" },
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    { type: "pawn", colour: "white" },
    { type: "pawn", colour: "white" },
    { type: "pawn", colour: "white" },
    { type: "pawn", colour: "white" },
    { type: "pawn", colour: "white" },
    { type: "pawn", colour: "white" },
    { type: "pawn", colour: "white" },
    { type: "pawn", colour: "white" },
  ],
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

export const initialGameState: GameState = {
  board: initialBoard,
  turn: "white",
  status: "playing",
  castling: {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  },
  enPassantSquare: null,
};
