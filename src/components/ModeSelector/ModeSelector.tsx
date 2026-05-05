import styles from "./ModeSelector.module.css";

export type GameMode = "classic" | "minimax" | "minimax-ab" | "mcts";

type ModeOption = {
  value: GameMode;
  label: string;
  description: string;
};

const MODES: ModeOption[] = [
  {
    value: "classic",
    label: "Classic",
    description: "Local two-player game.",
  },
  {
    value: "minimax",
    label: "Minimax",
    description: "Plain minimax search (placeholder).",
  },
  {
    value: "minimax-ab",
    label: "Minimax + Alpha-Beta",
    description: "Minimax with alpha-beta pruning (placeholder).",
  },
  {
    value: "mcts",
    label: "MCTS",
    description: "Monte Carlo Tree Search (placeholder).",
  },
];

type ModeSelectorProps = {
  mode: GameMode;
  onChange: (mode: GameMode) => void;
};

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className={styles.modeSelector} role="radiogroup" aria-label="Game mode">
      <h2 className={styles.title}>Mode</h2>
      <div className={styles.options}>
        {MODES.map((option) => {
          const selected = option.value === mode;
          return (
            <label
              key={option.value}
              className={`${styles.option} ${selected ? styles.selected : ""}`}
            >
              <input
                type="radio"
                name="game-mode"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className={styles.radio}
              />
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.optionDescription}>{option.description}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
