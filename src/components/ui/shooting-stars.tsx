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

    const getRandomStartPoint = () => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const radius = 200; // Spawn within this radius from center
      const angle = Math.random() * 360;
      const distance = Math.random() * radius;
      const x = centerX + distance * Math.cos((angle * Math.PI) / 180);
      const y = centerY + distance * Math.sin((angle * Math.PI) / 180);
      return { x, y, angle: angle + 180 }; // Move away from center roughly? Or just random direction? Let's keep random direction but spawn center. Actually, let's make them move generally across but confined.
      // User said "inside the brain like stuff on the center".
      // Let's spawn them in a wider area but fade them out as they leave.
    };

    const createStar = () => {
      // Spawn in a central area
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const x = centerX + (Math.random() - 0.5) * 600; // Wider spread
      const y = centerY + (Math.random() - 0.5) * 300;
      const angle = Math.random() * 360;

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

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const maxDistance = 500; // Distance at which they are fully transparent

        return prevStars
          .map((star) => {
            const newX =
              star.x + star.speed * Math.cos((star.angle * Math.PI) / 180);
            const newY =
              star.y + star.speed * Math.sin((star.angle * Math.PI) / 180);
            const newDistance = star.distance + star.speed;
            const newScale = 1 + newDistance / 100;

            // Calculate distance from center
            const dx = newX - centerX;
            const dy = newY - centerY;
            const distFromCenter = Math.sqrt(dx * dx + dy * dy);

            // Fade out as they leave the center
            const opacity = Math.max(0, 1 - (distFromCenter / maxDistance));

            if (opacity <= 0) {
              return null;
            }

            return {
              ...star,
              x: newX,
              y: newY,
              distance: newDistance,
              scale: newScale,
              opacity,
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
      className={cn('w-full h-full absolute inset-0', className)}
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
          <stop
            offset="0%"
            style={{ stopColor: trailColor, stopOpacity: 0 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: starColor, stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
    </svg>
  );
};
