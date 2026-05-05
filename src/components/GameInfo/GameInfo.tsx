import { Colour, GameStatus } from "@/types/chess";
import styles from "./GameInfo.module.css";

export type GameInfoProps = {
  turn: Colour;
  status: GameStatus;
  moves: number;
  fullMoveNumber: number;
  startGame: () => void;
  undo: () => void;
  canUndo: boolean;
};

const STATUS_LABEL: Record<GameStatus, string> = {
  playing: "Playing",
  check: "Check",
  checkmate: "Checkmate",
  stalemate: "Stalemate",
  draw: "Draw",
};

export default function GameInfo({
  turn,
  status,
  moves,
  fullMoveNumber,
  startGame,
  undo,
  canUndo,
}: GameInfoProps) {
  const isOver = status === "checkmate" || status === "stalemate" || status === "draw";
  const winner = status === "checkmate" ? (turn === "white" ? "Black" : "White") : null;

  return (
    <div className={styles.gameInfo}>
      <h1>Chess</h1>
      <p>
        <strong>Turn:</strong> {turn}
      </p>
      <p>
        <strong>Status:</strong> {STATUS_LABEL[status]}
        {winner ? ` - ${winner} wins` : ""}
      </p>
      <p>
        <strong>Move:</strong> {fullMoveNumber} ({moves} half-moves)
      </p>
      <div className={styles.actions}>
        <button onClick={startGame} type="button">
          {isOver ? "New Game" : "Restart"}
        </button>
        <button onClick={undo} type="button" disabled={!canUndo}>
          Undo
        </button>
      </div>
    </div>
  );
}
