import { Piece as PieceModel } from "@/types/chess";
import Piece from "../Piece/Piece";
import styles from "./Square.module.css";

type SquareProps = {
  rank: number;
  file: number;
  piece: PieceModel | null;
  selected?: boolean;
  onSelect: (rank: number, file: number) => void;
};

export default function Square({
  rank,
  file,
  piece,
  selected = false,
  onSelect,
}: SquareProps) {
  const isDark = (rank + file) % 2 === 1;
  return (
    <div
      className={`${styles.square} ${isDark ? styles.dark : styles.light} ${selected ? styles.highlight : ""}`}
      onClick={() => onSelect(rank, file)}
    >
      {piece && <Piece piece={piece} />}
    </div>
  );
}
