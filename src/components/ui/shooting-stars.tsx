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
  maxDistance: number;
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

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setShouldAnimate(!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Track tab visibility to avoid star burst when returning to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsVisible(visible);
      if (visible) {
        // Clear accumulated stars when tab becomes visible again
        setStars([]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!shouldAnimate || !isVisible) return;

    let timeoutId: ReturnType<typeof setTimeout>;

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
        maxDistance: Math.random() * (innerWidth + innerHeight) * 0.7 + 200, // Random distance
        opacity: 0, // Start invisible and fade in
      };
      setStars((prev) => [...prev, newStar]);

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      timeoutId = setTimeout(createStar, randomDelay);
    };

    timeoutId = setTimeout(createStar, minDelay);

    return () => clearTimeout(timeoutId);
  }, [minSpeed, maxSpeed, minDelay, maxDelay, shouldAnimate, isVisible]);

  useEffect(() => {
    if (!shouldAnimate || !isVisible) return;

    let animationFrameId: number;

    const moveStars = () => {
      setStars((prevStars) => {
        if (prevStars.length === 0) return prevStars;

        if (prevStars.length === 0) return prevStars;

        return prevStars
          .map((star) => {
            const newX =
              star.x + star.speed * Math.cos((star.angle * Math.PI) / 180);
            const newY =
              star.y + star.speed * Math.sin((star.angle * Math.PI) / 180);
            const newDistance = star.distance + star.speed;
            const newScale = 1 + newDistance / 100;

            // Check if star is finished
            if (newDistance >= star.maxDistance) {
              return null;
            }

            // Opacity logic
            let opacity = 1;
            const fadeInDistance = 100;
            const fadeOutDistance = star.maxDistance * 0.8;

            if (newDistance < fadeInDistance) {
              opacity = newDistance / fadeInDistance;
            } else if (newDistance > fadeOutDistance) {
              opacity =
                1 -
                (newDistance - fadeOutDistance) /
                  (star.maxDistance - fadeOutDistance);
            }

            return {
              ...star,
              x: newX,
              y: newY,
              distance: newDistance,
              scale: newScale,
              opacity: Math.max(0, Math.min(1, opacity)),
            };
          })
          .filter((star) => star !== null) as ShootingStar[];
      });

      animationFrameId = requestAnimationFrame(moveStars);
    };

    animationFrameId = requestAnimationFrame(moveStars);
    return () => cancelAnimationFrame(animationFrameId);
  }, [shouldAnimate, isVisible]);

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
