import React from 'react';

interface GameUIProps {
  score: number;
  highScore: number;
  isPlaying: boolean;
}

export const GameUI: React.FC<GameUIProps> = ({ score, highScore, isPlaying }) => {
  if (!isPlaying) return null;

  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-10">
      <div className="flex justify-between items-start">
        <div className="text-left">
          <div className="arcade-font text-xs text-muted-foreground mb-1">TIME</div>
          <div className="arcade-font text-2xl neon-text-cyan">
            {score} <span className="text-sm">s</span>
          </div>
        </div>
        <div className="text-right">
          <div className="arcade-font text-xs text-muted-foreground mb-1">BEST</div>
          <div className="arcade-font text-lg neon-text-pink">
            {highScore} <span className="text-xs">s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
