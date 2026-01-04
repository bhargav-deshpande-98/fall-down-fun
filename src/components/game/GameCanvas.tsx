import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameEngine } from '@/game/GameEngine';
import { getGameConfig } from '@/game/config';
import { Platform, Ball, PlatformColor } from '@/game/types';

interface GameCanvasProps {
  onGameOver: (score: number, highScore: number) => void;
  onScoreUpdate: (score: number) => void;
  isPlaying: boolean;
  onStart: () => void;
}

const PLATFORM_COLORS_MAP: Record<PlatformColor, string> = {
  pink: '#ff00ff',
  green: '#00ff00',
  cyan: '#00ffff',
  yellow: '#ffff00',
  purple: '#aa00ff',
};

const PLATFORM_GLOW_MAP: Record<PlatformColor, string> = {
  pink: '0 0 15px #ff00ff, 0 0 30px rgba(255, 0, 255, 0.5)',
  green: '0 0 15px #00ff00, 0 0 30px rgba(0, 255, 0, 0.5)',
  cyan: '0 0 15px #00ffff, 0 0 30px rgba(0, 255, 255, 0.5)',
  yellow: '0 0 15px #ffff00, 0 0 30px rgba(255, 255, 0, 0.5)',
  purple: '0 0 15px #aa00ff, 0 0 30px rgba(170, 0, 255, 0.5)',
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onGameOver,
  onScoreUpdate,
  isPlaying,
  onStart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const touchStartXRef = useRef<number | null>(null);
  const currentDirectionRef = useRef<'left' | 'right' | null>(null);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize game engine
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      const config = getGameConfig(dimensions.width, dimensions.height);
      gameEngineRef.current = new GameEngine(config);
    }
  }, [dimensions]);

  // Draw functions
  const drawBall = useCallback((ctx: CanvasRenderingContext2D, ball: Ball) => {
    const gradient = ctx.createRadialGradient(
      ball.x - ball.radius * 0.3,
      ball.y - ball.radius * 0.3,
      0,
      ball.x,
      ball.y,
      ball.radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, '#00ffff');
    gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0.4)');

    // Outer glow
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 25;

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(
      ball.x - ball.radius * 0.25,
      ball.y - ball.radius * 0.25,
      ball.radius * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
  }, []);

  const drawPlatform = useCallback((ctx: CanvasRenderingContext2D, platform: Platform, width: number) => {
    const color = PLATFORM_COLORS_MAP[platform.color];
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    // Left part of platform
    if (platform.gapStart > 0) {
      const gradient = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, `${color}99`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, platform.y, platform.gapStart, platform.height);
      
      // Top highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, platform.y, platform.gapStart, 2);
    }

    // Right part of platform
    const gapEnd = platform.gapStart + platform.gapWidth;
    if (gapEnd < width) {
      const gradient = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, `${color}99`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(gapEnd, platform.y, width - gapEnd, platform.height);
      
      // Top highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(gapEnd, platform.y, width - gapEnd, 2);
    }

    ctx.shadowBlur = 0;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    const bgGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height)
    );
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(1, '#050508');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines for effect
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    if (!gameEngineRef.current) return;

    const platforms = gameEngineRef.current.getPlatforms();
    const ball = gameEngineRef.current.getBall();

    // Draw platforms
    platforms.forEach(platform => {
      drawPlatform(ctx, platform, width);
    });

    // Draw ball
    drawBall(ctx, ball);
  }, [drawBall, drawPlatform]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!gameEngineRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    gameEngineRef.current.update(timestamp);
    
    const state = gameEngineRef.current.getState();
    onScoreUpdate(state.time);

    draw(ctx, dimensions.width, dimensions.height);

    if (state.isGameOver) {
      onGameOver(state.score, state.highScore);
      return;
    }

    if (state.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [dimensions, draw, onGameOver, onScoreUpdate]);

  // Start game
  useEffect(() => {
    if (isPlaying && gameEngineRef.current) {
      gameEngineRef.current.start();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, gameLoop]);

  // Touch controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touchX = touch.clientX - rect.left;
    const centerX = rect.width / 2;
    
    if (touchX < centerX) {
      currentDirectionRef.current = 'left';
      gameEngineRef.current?.moveBall('left');
    } else {
      currentDirectionRef.current = 'right';
      gameEngineRef.current?.moveBall('right');
    }
    
    touchStartXRef.current = touchX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touchX = touch.clientX - rect.left;
    const centerX = rect.width / 2;
    
    const newDirection = touchX < centerX ? 'left' : 'right';
    if (newDirection !== currentDirectionRef.current) {
      currentDirectionRef.current = newDirection;
      gameEngineRef.current?.moveBall(newDirection);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    currentDirectionRef.current = null;
    gameEngineRef.current?.stopBall();
    touchStartXRef.current = null;
  }, []);

  // Keyboard controls (for testing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        gameEngineRef.current?.moveBall('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        gameEngineRef.current?.moveBall('right');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) {
        gameEngineRef.current?.stopBall();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Draw initial state
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      draw(ctx, dimensions.width, dimensions.height);
    }
  }, [dimensions, draw]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      />
      {/* Scanlines overlay */}
      <div className="scanlines absolute inset-0 pointer-events-none" />
    </div>
  );
};
