import { useState } from "react";
import { useChessGame } from "@/hooks/useChessGame";
import styles from "./GameContainer.module.css";
import Board from "../Board/Board";
import GameInfo from "../GameInfo/GameInfo";
import PromotionModal from "../PromotionModal/PromotionModal";
import ModeSelector, { GameMode } from "../ModeSelector/ModeSelector";

export default function GameContainer() {
  const {
    gameState,
    gameInfo,
    selectedSquare,
    selectSquare,
    selectedLegalMoves,
    pendingPromotion,
    startGame,
    undo,
    choosePromotion,
    cancelPromotion,
    canUndo,
  } = useChessGame();

  const [mode, setMode] = useState<GameMode>("classic");

  const promotingColour = pendingPromotion
    ? gameState.board[pendingPromotion.from.rank][pendingPromotion.from.file]
        ?.colour ?? null
    : null;

  return (
    <div className={styles.gameContainer}>
      <GameInfo
        {...gameInfo}
        startGame={startGame}
        undo={undo}
        canUndo={canUndo}
      />
      <Board
        gameState={gameState}
        selectedSquare={selectedSquare}
        selectSquare={selectSquare}
        selectedLegalMoves={selectedLegalMoves}
      />
      <ModeSelector mode={mode} onChange={setMode} />
      {pendingPromotion && promotingColour && (
        <PromotionModal
          colour={promotingColour}
          onChoose={choosePromotion}
          onCancel={cancelPromotion}
        />
      )}
    </div>
  );
}
