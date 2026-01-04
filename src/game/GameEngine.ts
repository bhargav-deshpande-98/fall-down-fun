import { Ball, Platform, GameState, GameConfig, PlatformColor } from './types';
import { PLATFORM_COLORS } from './config';

export class GameEngine {
  private config: GameConfig;
  private state: GameState;
  private platformIdCounter: number = 0;
  private lastTime: number = 0;
  private accumulatedTime: number = 0;

  constructor(config: GameConfig) {
    this.config = config;
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    const savedHighScore = localStorage.getItem('falldown2-highscore');
    
    return {
      ball: this.createBall(),
      platforms: this.createInitialPlatforms(),
      score: 0,
      time: 0,
      isGameOver: false,
      isPlaying: false,
      highScore: savedHighScore ? parseInt(savedHighScore, 10) : 0,
      speed: this.config.initialSpeed,
    };
  }

  private createBall(): Ball {
    return {
      x: this.config.canvasWidth / 2,
      y: this.config.canvasHeight * 0.3,
      radius: this.config.ballRadius,
      velocityX: 0,
      velocityY: 0,
    };
  }

  private createInitialPlatforms(): Platform[] {
    const platforms: Platform[] = [];
    const startY = this.config.canvasHeight * 0.5;
    
    for (let i = 0; i < 8; i++) {
      platforms.push(this.createPlatform(startY + i * this.config.platformGap));
    }
    
    return platforms;
  }

  private createPlatform(y: number): Platform {
    const gapWidth = this.config.minGapWidth + 
      Math.random() * (this.config.maxGapWidth - this.config.minGapWidth);
    const maxGapStart = this.config.canvasWidth - gapWidth;
    const gapStart = Math.random() * maxGapStart;
    const color = PLATFORM_COLORS[Math.floor(Math.random() * PLATFORM_COLORS.length)];
    
    return {
      id: this.platformIdCounter++,
      y,
      gapStart,
      gapWidth,
      color,
      height: this.config.platformHeight,
    };
  }

  public start(): void {
    this.state = this.createInitialState();
    this.state.isPlaying = true;
    this.lastTime = performance.now();
    this.accumulatedTime = 0;
  }

  public update(currentTime: number): void {
    if (!this.state.isPlaying || this.state.isGameOver) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.accumulatedTime += deltaTime;

    // Update time score
    this.state.time = Math.floor(this.accumulatedTime);
    this.state.score = this.state.time;

    // Calculate speed: base gradual increase + step increase every 10 seconds
    const gradualIncrease = this.accumulatedTime * this.config.speedIncrement * 0.3;
    const levelBonus = Math.floor(this.state.time / 10) * 0.4; // +0.4 speed every 10 seconds
    this.state.speed = Math.min(
      this.config.initialSpeed + gradualIncrease + levelBonus,
      this.config.maxSpeed
    );

    this.updateBall();
    this.updatePlatforms();
    this.checkCollisions();
    this.checkGameOver();
  }

  private updateBall(): void {
    const ball = this.state.ball;
    
    // Apply gravity
    ball.velocityY += this.config.gravity;
    
    // Apply velocity
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Boundary checks (left/right walls)
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.velocityX = 0;
    }
    if (ball.x + ball.radius > this.config.canvasWidth) {
      ball.x = this.config.canvasWidth - ball.radius;
      ball.velocityX = 0;
    }
    
    // Friction
    ball.velocityX *= 0.95;
  }

  private updatePlatforms(): void {
    // Move platforms up
    this.state.platforms.forEach(platform => {
      platform.y -= this.state.speed;
    });

    // Remove platforms that are off screen (top)
    this.state.platforms = this.state.platforms.filter(p => p.y > -this.config.platformHeight);

    // Add new platforms at the bottom
    const lowestPlatform = this.state.platforms.reduce(
      (lowest, p) => p.y > lowest ? p.y : lowest,
      0
    );

    if (lowestPlatform < this.config.canvasHeight) {
      this.state.platforms.push(
        this.createPlatform(lowestPlatform + this.config.platformGap)
      );
    }
  }

  private checkCollisions(): void {
    const ball = this.state.ball;
    
    for (const platform of this.state.platforms) {
      // Check if ball is at platform height
      if (
        ball.y + ball.radius >= platform.y &&
        ball.y + ball.radius <= platform.y + platform.height + this.state.speed + 5 &&
        ball.velocityY > 0
      ) {
        // Check if ball is in the gap
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;
        const gapEnd = platform.gapStart + platform.gapWidth;
        
        // Ball is NOT in the gap - collision with platform
        if (!(ballLeft > platform.gapStart && ballRight < gapEnd)) {
          // Check if any part of ball is on platform
          if (
            (ballLeft < platform.gapStart || ballRight > gapEnd) ||
            (ballLeft < 0 || ballRight > this.config.canvasWidth)
          ) {
            // Check specific collision
            if (ballRight > platform.gapStart && ballLeft < platform.gapStart) {
              // Left edge of gap
              ball.y = platform.y - ball.radius;
              ball.velocityY = 0;
            } else if (ballLeft < gapEnd && ballRight > gapEnd) {
              // Right edge of gap
              ball.y = platform.y - ball.radius;
              ball.velocityY = 0;
            } else if (ballRight <= platform.gapStart || ballLeft >= gapEnd) {
              // Fully on platform
              ball.y = platform.y - ball.radius;
              ball.velocityY = 0;
            }
          }
        }
      }
    }
    
    // Ball pushed up with platforms
    this.state.platforms.forEach(platform => {
      if (
        ball.y + ball.radius >= platform.y &&
        ball.y - ball.radius <= platform.y + platform.height
      ) {
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;
        const gapEnd = platform.gapStart + platform.gapWidth;
        
        if (!(ballLeft > platform.gapStart && ballRight < gapEnd)) {
          ball.y = platform.y - ball.radius;
        }
      }
    });
  }

  private checkGameOver(): void {
    const ball = this.state.ball;
    
    // Game over if ball goes above screen
    if (ball.y - ball.radius < 0) {
      this.state.isGameOver = true;
      this.state.isPlaying = false;
      
      // Update high score
      if (this.state.score > this.state.highScore) {
        this.state.highScore = this.state.score;
        localStorage.setItem('falldown2-highscore', this.state.highScore.toString());
      }
    }
    
    // Also game over if ball falls below screen (shouldn't happen normally)
    if (ball.y - ball.radius > this.config.canvasHeight) {
      this.state.isGameOver = true;
      this.state.isPlaying = false;
    }
  }

  public moveBall(direction: 'left' | 'right'): void {
    if (!this.state.isPlaying || this.state.isGameOver) return;
    
    const force = direction === 'left' ? -this.config.moveSpeed : this.config.moveSpeed;
    this.state.ball.velocityX = force;
  }

  public stopBall(): void {
    if (!this.state.isPlaying) return;
    this.state.ball.velocityX *= 0.5;
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public getBall(): Ball {
    return { ...this.state.ball };
  }

  public getPlatforms(): Platform[] {
    return [...this.state.platforms];
  }

  public isGameOver(): boolean {
    return this.state.isGameOver;
  }

  public isPlaying(): boolean {
    return this.state.isPlaying;
  }
}
