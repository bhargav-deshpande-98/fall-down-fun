import { GameConfig } from './types';

export const getGameConfig = (width: number, height: number): GameConfig => {
  // Use minimum dimension to ensure elements are properly sized on mobile
  const baseSize = Math.min(width, height);
  // Scale based on a 375px reference (iPhone SE width) for better mobile sizing
  const scale = Math.max(baseSize / 375, 0.8);

  return {
    canvasWidth: width,
    canvasHeight: height,
    gravity: 0.35 * scale,
    ballRadius: 22 * scale, // Larger ball for easier touch interaction
    platformHeight: 16 * scale, // Thicker platforms for visibility
    platformGap: 100 * scale, // Slightly closer platforms
    initialSpeed: 1.8 * scale,
    maxSpeed: 5 * scale,
    speedIncrement: 0.04 * scale,
    minGapWidth: 80 * scale, // Wider gaps for easier gameplay on mobile
    maxGapWidth: 130 * scale,
    moveSpeed: 10 * scale, // Faster movement for responsive touch controls
  };
};

export const PLATFORM_COLORS: Array<'pink' | 'green' | 'cyan' | 'yellow' | 'purple'> = [
  'pink',
  'green', 
  'cyan',
  'yellow',
  'purple'
];
