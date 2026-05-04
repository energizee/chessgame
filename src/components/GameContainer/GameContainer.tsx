import { useChessGame } from "@/hooks/useChessGame";
import styles from "./GameContainer.module.css";
import Board from "../Board/Board";
import GameInfo from "../GameInfo/GameInfo";

export default function GameContainer() {
  const { gameState, gameInfo, selectedSquare, selectSquare, selectedLegalMoves, startGame } =
    useChessGame();
  return (
    <div className={styles.gameContainer}>
      <GameInfo {...gameInfo} startGame={startGame} />
      <Board
        gameState={gameState}
        selectedSquare={selectedSquare}
        selectSquare={selectSquare}
        selectedLegalMoves={selectedLegalMoves}
      />
    </div>
  );
}
