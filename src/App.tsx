import styles from './App.module.css';
import GameContainer from './components/GameContainer/GameContainer';

export default function App() {
  return (
    <div className={styles.app}>
      <GameContainer />
    </div>
  );
}
