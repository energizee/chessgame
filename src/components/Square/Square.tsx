import { Piece as PieceModel } from "@/types/chess";
import Piece from "../Piece/Piece";
import styles from "./Square.module.css";

const FILE_LABELS = ["a", "b", "c", "d", "e", "f", "g", "h"];

type SquareProps = {
  rank: number;
  file: number;
  piece: PieceModel | null;
  selected?: boolean;
  isLegal?: boolean;
  kingInCheck: boolean;
  onSelect: (rank: number, file: number) => void;
};

export default function Square({
  rank,
  file,
  piece,
  selected = false,
  isLegal = false,
  kingInCheck,
  onSelect,
}: SquareProps) {
  const isDark = (rank + file) % 2 === 1;
  const isCapture = isLegal && piece !== null;

  const classes = [
    styles.square,
    isDark ? styles.dark : styles.light,
    selected && styles.highlight,
    isLegal && !isCapture && styles.legalMove,
    isCapture && styles.legalCapture,
    kingInCheck && styles.kingCheck,
  ]
    .filter(Boolean)
    .join(" ");

  const algebraic = `${FILE_LABELS[file]}${8 - rank}`;

  return (
    <div
      className={classes}
      onClick={() => onSelect(rank, file)}
      role="gridcell"
      aria-label={algebraic}
    >
      {file === 0 && <span className={styles.rankLabel}>{8 - rank}</span>}
      {piece && <Piece piece={piece} />}
    </div>
  );
}
