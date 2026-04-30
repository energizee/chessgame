import styles from "./Board.module.css";
import Square from "../Square/Square";
import { GameState } from "@/types/chess";

import { useEffect } from "react";

export type BoardProps = {
  gameState: GameState;
  selectedSquare: { rank: number; file: number } | null;
  selectSquare: (rank: number, file: number) => void;
};

export default function Board({
  gameState,
  selectedSquare,
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
            onSelect={selectSquare}
          />
        )),
      )}
    </div>
  );
}
