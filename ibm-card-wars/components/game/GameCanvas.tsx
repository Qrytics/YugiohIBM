'use client';

import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

interface GameCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onAppReady?: (app: PIXI.Application) => void;
}

export function GameCanvas({
  width = 1280,
  height = 720,
  className = '',
  onAppReady,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    // Create PixiJS Application
    const initPixi = async () => {
      try {
        const app = new PIXI.Application();

        await app.init({
          width,
          height,
          backgroundColor: 0x0a0a0f, // Match theme background
          antialias: true,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
          preference: 'webgl', // Use WebGL for 60 FPS
        });

        // Mount canvas
        if (canvasRef.current) {
          canvasRef.current.appendChild(app.canvas as HTMLCanvasElement);
        }

        appRef.current = app;
        setIsReady(true);

        // FPS counter for testing
        let lastTime = performance.now();
        let frameCount = 0;

        app.ticker.add(() => {
          frameCount++;
          const now = performance.now();
          const delta = now - lastTime;

          if (delta >= 1000) {
            setFps(Math.round((frameCount * 1000) / delta));
            frameCount = 0;
            lastTime = now;
          }
        });

        // Notify parent component
        if (onAppReady) {
          onAppReady(app);
        }

        // Add a test sprite to verify rendering
        addTestGraphics(app);
      } catch (error) {
        console.error('Failed to initialize PixiJS:', error);
      }
    };

    initPixi();

    // Cleanup
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
        setIsReady(false);
      }
    };
  }, [width, height, onAppReady]);

  // Handle window resize
  useEffect(() => {
    if (!appRef.current) return;

    const handleResize = () => {
      if (appRef.current) {
        const parent = canvasRef.current;
        if (parent) {
          const { clientWidth, clientHeight } = parent;
          appRef.current.renderer.resize(clientWidth, clientHeight);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Canvas container */}
      <div
        ref={canvasRef}
        className="relative rounded-lg overflow-hidden"
        style={{ width, height }}
      />

      {/* FPS Counter */}
      {isReady && (
        <div className="absolute top-4 right-4 glass px-4 py-2 rounded-lg">
          <div className="text-sm font-mono">
            <span className="text-ibm-cyan font-bold">{fps}</span>
            <span className="text-foreground/70 ml-1">FPS</span>
          </div>
          <div className="text-xs text-foreground/50 mt-1">
            {appRef.current?.renderer.type === 1 ? 'WebGL' : 'Canvas'}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="text-ibm-cyan text-lg font-bold mb-2">
              Initializing Game Engine...
            </div>
            <div className="text-foreground/50 text-sm">Loading PixiJS</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Add test graphics to verify 60 FPS rendering
 */
function addTestGraphics(app: PIXI.Application) {
  const container = new PIXI.Container();
  app.stage.addChild(container);

  // Create IBM-themed animated card placeholder
  const card = new PIXI.Graphics();

  // Card background with gradient
  card.rect(0, 0, 200, 280);
  card.fill({ color: 0x1a1d29 });

  // Card border (IBM blue)
  card.rect(0, 0, 200, 280);
  card.stroke({ color: 0x0f62fe, width: 3 });

  // Cost gem (top left)
  card.circle(30, 30, 25);
  card.fill({ color: 0x3b82f6 });

  // Attack (bottom left)
  card.circle(30, 250, 20);
  card.fill({ color: 0xf97316 });

  // Health (bottom right)
  card.circle(170, 250, 20);
  card.fill({ color: 0xef4444 });

  // Position in center
  card.x = app.screen.width / 2 - 100;
  card.y = app.screen.height / 2 - 140;

  container.addChild(card);

  // Add text
  const title = new PIXI.Text({
    text: 'IBM Card Wars',
    style: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'bold',
    },
  });
  title.x = app.screen.width / 2 - title.width / 2;
  title.y = 50;
  container.addChild(title);

  const subtitle = new PIXI.Text({
    text: 'PixiJS Canvas Test',
    style: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fill: 0x00b4d8,
    },
  });
  subtitle.x = app.screen.width / 2 - subtitle.width / 2;
  subtitle.y = 85;
  container.addChild(subtitle);

  // Animate card (floating effect)
  let elapsed = 0;
  app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime * 0.05;
    card.y = app.screen.height / 2 - 140 + Math.sin(elapsed) * 10;

    // Rotate card slightly
    card.rotation = Math.sin(elapsed * 0.5) * 0.05;
  });

  // Add particles
  for (let i = 0; i < 20; i++) {
    const particle = new PIXI.Graphics();
    particle.circle(0, 0, 2);
    particle.fill({ color: 0x00b4d8, alpha: 0.6 });
    particle.x = Math.random() * app.screen.width;
    particle.y = Math.random() * app.screen.height;

    container.addChild(particle);

    // Animate particles
    app.ticker.add((ticker) => {
      particle.y -= ticker.deltaTime * 0.5;
      particle.alpha = 0.3 + Math.sin(elapsed + i) * 0.3;

      if (particle.y < 0) {
        particle.y = app.screen.height;
        particle.x = Math.random() * app.screen.width;
      }
    });
  }
}
