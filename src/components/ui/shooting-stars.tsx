'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useState, useRef, useId } from 'react';

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
  opacity: number;
}

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4);
  const offset = Math.random() * window.innerWidth;

  switch (side) {
    case 0:
      return { x: offset, y: 0, angle: 45 };
    case 1:
      return { x: window.innerWidth, y: offset, angle: 135 };
    case 2:
      return { x: offset, y: window.innerHeight, angle: 225 };
    case 3:
      return { x: 0, y: offset, angle: 315 };
    default:
      return { x: 0, y: 0, angle: 45 };
  }
};
export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = '#9E00FF',
  trailColor = '#2EB9DF',
  starWidth = 20,
  starHeight = 1,
  className,
}) => {
  const [stars, setStars] = useState<ShootingStar[]>([]);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId();

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setShouldAnimate(!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;

    const createStar = () => {
      const { innerWidth, innerHeight } = window;
      const angle = 45; // Fixed angle for corner-to-corner flow

      // Spawn logic: mostly from top-left
      // We want them to cover the screen, so we spawn them along the top and left edges
      // but slightly outside so they enter the screen smoothly.

      const randomPos = Math.random() * (innerWidth + innerHeight);
      let x, y;

      if (randomPos < innerWidth) {
        // Spawn from top edge
        x = Math.random() * innerWidth;
        y = -50; // Start slightly above
      } else {
        // Spawn from left edge
        x = -50; // Start slightly left
        y = Math.random() * innerHeight;
      }

      const newStar: ShootingStar = {
        id: Date.now(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
        opacity: 1,
      };
      setStars((prev) => [...prev, newStar]);

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      setTimeout(createStar, randomDelay);
    };

    const timeoutId = setTimeout(createStar, minDelay);

    return () => clearTimeout(timeoutId);
  }, [minSpeed, maxSpeed, minDelay, maxDelay, shouldAnimate]);

  useEffect(() => {
    if (!shouldAnimate) return;

    let animationFrameId: number;

    const moveStars = () => {
      setStars((prevStars) => {
        if (prevStars.length === 0) return prevStars;

        const { innerWidth, innerHeight } = window;

        return prevStars
          .map((star) => {
            const newX =
              star.x + star.speed * Math.cos((star.angle * Math.PI) / 180);
            const newY =
              star.y + star.speed * Math.sin((star.angle * Math.PI) / 180);
            const newDistance = star.distance + star.speed;
            const newScale = 1 + newDistance / 100;

            // Check if star is out of bounds
            if (
              newX > innerWidth + 50 ||
              newY > innerHeight + 50 ||
              newX < -50 ||
              newY < -50
            ) {
              return null;
            }

            return {
              ...star,
              x: newX,
              y: newY,
              distance: newDistance,
              scale: newScale,
              opacity: 1, // Keep opacity full until it leaves screen
            };
          })
          .filter((star) => star !== null) as ShootingStar[];
      });

      animationFrameId = requestAnimationFrame(moveStars);
    };

    animationFrameId = requestAnimationFrame(moveStars);
    return () => cancelAnimationFrame(animationFrameId);
  }, [shouldAnimate]);

  if (!shouldAnimate) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      className={cn(
        'w-full h-full absolute inset-0 pointer-events-none',
        className
      )}
    >
      {stars.map((star) => (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill={`url(#${gradientId})`}
          transform={`rotate(${star.angle}, ${
            star.x + (starWidth * star.scale) / 2
          }, ${star.y + starHeight / 2})`}
          style={{ opacity: star.opacity }}
        />
      ))}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop
            offset="100%"
            style={{ stopColor: starColor, stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
    </svg>
  );
};
