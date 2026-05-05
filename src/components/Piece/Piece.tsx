import { Piece as PieceModel } from "@/types/chess";
import styles from "./Piece.module.css";

const PIECE_CODE: Record<PieceModel["type"], string> = {
  king: "K",
  queen: "Q",
  rook: "R",
  bishop: "B",
  knight: "N",
  pawn: "P",
};

type PieceProps = {
  piece: PieceModel;
};

export default function Piece({ piece }: PieceProps) {
  const src = `/pieces/${piece.colour[0]}${PIECE_CODE[piece.type]}.svg`;
  return (
    <img
      src={src}
      alt={`${piece.colour} ${piece.type}`}
      className={styles.piece}
      draggable={false}
    />
  );
}
