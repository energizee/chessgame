import { Colour, GameStatus } from "@/types/chess";
import styles from "./GameInfo.module.css";
import React from "react";

export type GameInfoProps = {
  turn: Colour;
  status: GameStatus;
  moves: number;
  startGame: () => void;
};

export default function GameInfo({ turn, status, moves, startGame }: GameInfoProps) {
  return (
    <div className={styles.gameInfo}>
      <h1>Game Info</h1>
      <p>Turn: {turn}</p>
      <p>Status: {status}</p>
      <p>Moves: {moves}</p>
      <button onClick={startGame}>Start New Game</button>
    </div>
  );
}
