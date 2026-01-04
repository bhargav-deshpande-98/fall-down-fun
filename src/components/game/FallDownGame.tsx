import React, { useState, useCallback } from 'react';
import { GameCanvas } from './GameCanvas';
import { GameUI } from './GameUI';
import { StartScreen } from './StartScreen';
import { GameOverScreen } from './GameOverScreen';

type GameScreen = 'start' | 'playing' | 'gameover';

export const FallDownGame: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('start');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('falldown2-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const handleStart = useCallback(() => {
    setScore(0);
    setScreen('playing');
  }, []);

  const handleGameOver = useCallback((finalScore: number, newHighScore: number) => {
    setFinalScore(finalScore);
    setHighScore(newHighScore);
    setIsNewHighScore(finalScore > 0 && finalScore >= newHighScore && finalScore > (highScore || 0));
    setScreen('gameover');
  }, [highScore]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setFinalScore(0);
    setIsNewHighScore(false);
    setScreen('playing');
  }, []);

  return (
    <div className="game-container w-full h-full relative overflow-hidden">
      <GameCanvas
        onGameOver={handleGameOver}
        onScoreUpdate={handleScoreUpdate}
        isPlaying={screen === 'playing'}
        onStart={handleStart}
      />
      
      <GameUI
        score={score}
        highScore={highScore}
        isPlaying={screen === 'playing'}
      />

      {screen === 'start' && (
        <StartScreen
          highScore={highScore}
          onStart={handleStart}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          score={finalScore}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};
