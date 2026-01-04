import React from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  highScore,
  isNewHighScore,
  onRestart,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/95 backdrop-blur-md">
      <div className="text-center space-y-8 px-6">
        {/* Game Over Title */}
        <div className="space-y-2">
          <h1 className="arcade-font text-2xl sm:text-3xl neon-text-pink">
            GAME OVER
          </h1>
        </div>

        {/* Score display */}
        <div className="space-y-6">
          {isNewHighScore && (
            <div className="arcade-font text-sm neon-text-yellow animate-pulse-glow">
              ★ NEW HIGH SCORE! ★
            </div>
          )}
          
          <div className="space-y-1">
            <div className="arcade-font text-xs text-muted-foreground">YOUR TIME</div>
            <div className="arcade-font text-4xl neon-text-cyan">{score}s</div>
          </div>

          <div className="space-y-1">
            <div className="arcade-font text-xs text-muted-foreground">BEST TIME</div>
            <div className="arcade-font text-2xl neon-text-green">{highScore}s</div>
          </div>
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="btn-neon rounded-lg arcade-font text-sm"
        >
          PLAY AGAIN
        </button>

        {/* Tip */}
        <p className="text-xs text-muted-foreground opacity-60">
          Tip: Move quickly through gaps to survive longer!
        </p>
      </div>
    </div>
  );
};
