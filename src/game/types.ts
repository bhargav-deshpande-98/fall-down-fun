export interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
}

export interface Platform {
  id: number;
  y: number;
  gapStart: number;
  gapWidth: number;
  color: PlatformColor;
  height: number;
}

export type PlatformColor = 'pink' | 'green' | 'cyan' | 'yellow' | 'purple';

export interface GameState {
  ball: Ball;
  platforms: Platform[];
  score: number;
  time: number;
  isGameOver: boolean;
  isPlaying: boolean;
  highScore: number;
  speed: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  gravity: number;
  ballRadius: number;
  platformHeight: number;
  platformGap: number;
  initialSpeed: number;
  maxSpeed: number;
  speedIncrement: number;
  minGapWidth: number;
  maxGapWidth: number;
  moveSpeed: number;
}
