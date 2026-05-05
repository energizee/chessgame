import styles from "./Board.module.css";
import Square from "../Square/Square";
import { GameState, Move, Square as SquareCoord } from "@/types/chess";

export type BoardProps = {
  gameState: GameState;
  selectedSquare: SquareCoord | null;
  selectedLegalMoves: Move[];
  selectSquare: (rank: number, file: number) => void;
};

const FILE_LABELS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function Board({
  gameState,
  selectedSquare,
  selectedLegalMoves,
  selectSquare,
}: BoardProps) {
  const showCheck =
    gameState.status === "check" || gameState.status === "checkmate";

  return (
    <div className={styles.boardWrapper}>
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
                showCheck &&
                piece?.type === "king" &&
                piece.colour === gameState.turn
              }
              onSelect={selectSquare}
            />
          )),
        )}
      </div>
      <div className={styles.fileLabels}>
        {FILE_LABELS.map((f) => (
          <span key={f}>{f}</span>
        ))}
      </div>
    </div>
  );
}
