import { GameConfig } from './types';

export const getGameConfig = (width: number, height: number): GameConfig => {
  const scale = Math.min(width / 400, height / 700);
  
  return {
    canvasWidth: width,
    canvasHeight: height,
    gravity: 0.4 * scale,
    ballRadius: 18 * scale,
    platformHeight: 12 * scale,
    platformGap: 120 * scale,
    initialSpeed: 2 * scale,
    maxSpeed: 6 * scale,
    speedIncrement: 0.05 * scale,
    minGapWidth: 70 * scale,
    maxGapWidth: 120 * scale,
    moveSpeed: 8 * scale,
  };
};

export const PLATFORM_COLORS: Array<'pink' | 'green' | 'cyan' | 'yellow' | 'purple'> = [
  'pink',
  'green', 
  'cyan',
  'yellow',
  'purple'
];
