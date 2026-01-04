import React from 'react';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ highScore, onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/90 backdrop-blur-sm">
      <div className="text-center space-y-8 px-6">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="arcade-font text-3xl sm:text-4xl neon-text-pink animate-pulse-glow">
            FALLDOWN
          </h1>
          <h2 className="arcade-font text-4xl sm:text-5xl neon-text-cyan">
            2
          </h2>
        </div>

        {/* Ball animation */}
        <div className="relative h-20 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full game-ball animate-float" />
        </div>

        {/* High score */}
        {highScore > 0 && (
          <div className="space-y-1">
            <div className="arcade-font text-xs text-muted-foreground">HIGH SCORE</div>
            <div className="arcade-font text-2xl neon-text-green">{highScore}s</div>
          </div>
        )}

        {/* Start button */}
        <button
          onClick={onStart}
          className="btn-neon rounded-lg arcade-font text-sm animate-pulse-glow"
        >
          TAP TO PLAY
        </button>

        {/* Instructions */}
        <div className="space-y-2 text-muted-foreground">
          <p className="text-sm">Touch left or right side to move</p>
          <p className="text-xs opacity-60">Fall through the gaps • Don't get crushed!</p>
        </div>
      </div>
    </div>
  );
};
