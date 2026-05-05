import { Colour, PROMOTION_CHOICES, PieceType } from "@/types/chess";
import Piece from "../Piece/Piece";
import styles from "./PromotionModal.module.css";

type PromotionModalProps = {
  colour: Colour;
  onChoose: (piece: PieceType) => void;
  onCancel: () => void;
};

export default function PromotionModal({
  colour,
  onChoose,
  onCancel,
}: PromotionModalProps) {
  return (
    <div className={styles.backdrop} onClick={onCancel} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Choose promotion piece"
      >
        <h2 className={styles.title}>Promote pawn</h2>
        <div className={styles.choices}>
          {PROMOTION_CHOICES.map((type) => (
            <button
              key={type}
              type="button"
              className={styles.choice}
              onClick={() => onChoose(type)}
              aria-label={`Promote to ${type}`}
            >
              <Piece piece={{ type, colour }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
