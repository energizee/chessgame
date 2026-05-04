import { Piece as PieceModel, Move } from "@/types/chess";
import Piece from "../Piece/Piece";
import styles from "./Square.module.css";

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
  return (
    <div
      className={`${styles.square} ${isDark ? styles.dark : styles.light} ${selected ? styles.highlight : ""} ${isLegal ? styles.legalMove : ""} ${kingInCheck && piece && piece.type==="king" ? styles.kingCheck : ""}`}
      onClick={() => onSelect(rank, file)}
    >
      {piece && <Piece piece={piece} />}
    </div>
  );
}
