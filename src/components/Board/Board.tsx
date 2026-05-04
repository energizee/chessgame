import styles from "./Board.module.css";
import Square from "../Square/Square";
import { GameState, Move } from "@/types/chess";

import { useEffect } from "react";

export type BoardProps = {
  gameState: GameState;
  selectedSquare: { rank: number; file: number } | null;
  selectedLegalMoves: Move[];
  selectSquare: (rank: number, file: number) => void;
};

export default function Board({
  gameState,
  selectedSquare,
  selectedLegalMoves,
  selectSquare,
}: BoardProps) {
  return (
    <div className={styles.board}>
      {gameState.board.map((row, rank) =>
        row.map((piece, file) => (
          <Square
            key={`${rank}-${file}`}
            rank={rank}
            file={file}
            piece={piece}
            selected={
              selectedSquare?.rank === rank && selectedSquare?.file === file
            }
            isLegal={selectedLegalMoves.some(
              (m) => m.to.rank === rank && m.to.file === file,
            )}
            kingInCheck={
              gameState.status === "check" &&
              piece &&
              piece.type === "king" &&
              piece.colour === gameState.turn
                ? true
                : false
            }
            onSelect={selectSquare}
          />
        )),
      )}
    </div>
  );
}
