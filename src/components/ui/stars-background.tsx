'use client';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface StarProps {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  twinkleSpeed: number | null;
  vx: number;
  vy: number;
}

interface StarBackgroundProps {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
}

export const StarsBackground: React.FC<StarBackgroundProps> = ({
  starDensity = 0.0004,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}) => {
  const starsRef = useRef<StarProps[]>([]);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setShouldAnimate(!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  const generateStars = useCallback(
    (width: number, height: number): StarProps[] => {
      const area = width * height;
      const numStars = Math.floor(area * starDensity);
      return Array.from({ length: numStars }, () => {
        const shouldTwinkle =
          allStarsTwinkle || Math.random() < twinkleProbability;
        const baseOpacity = Math.random() * 0.3 + 0.5;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 0.15 + 1.0,
          opacity: baseOpacity,
          baseOpacity,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed +
              Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
        };
      });
    },
    [
      starDensity,
      allStarsTwinkle,
      twinkleProbability,
      minTwinkleSpeed,
      maxTwinkleSpeed,
    ]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;
    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        starsRef.current = generateStars(width, height);
      }
    };

    updateStars();

    const resizeObserver = new ResizeObserver(updateStars);
    const canvas = canvasRef.current;
    if (canvas) {
      resizeObserver.observe(canvas);
    }

    return () => {
      if (canvas) {
        resizeObserver.unobserve(canvas);
      }
      resizeObserver.disconnect();
    };
  }, [
    starDensity,
    allStarsTwinkle,
    twinkleProbability,
    minTwinkleSpeed,
    maxTwinkleSpeed,
    generateStars,
    shouldAnimate,
  ]);

  useEffect(() => {
    if (!shouldAnimate) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      starsRef.current.forEach((star) => {
        // Update position
        star.x += star.vx;
        star.y += star.vy;

        // Bounce off edges
        if (star.x < 0 || star.x > canvas.width) {
          star.vx *= -1;
          star.x = Math.max(0, Math.min(star.x, canvas.width));
        }
        if (star.y < 0 || star.y > canvas.height) {
          star.vy *= -1;
          star.y = Math.max(0, Math.min(star.y, canvas.height));
        }

        // Mouse interaction - Light up
        const dx = star.x - mouseRef.current.x;
        const dy = star.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200; // Reduced interaction radius for more concentration

        let targetOpacity = star.baseOpacity;
        let scale = 1;

        if (distance < maxDistance) {
          const proximity = 1 - distance / maxDistance;
          targetOpacity =
            star.baseOpacity + (1 - star.baseOpacity) * proximity * 1.5; // Boost opacity
          scale = 1 + proximity; // Scale up star size
        }

        // Twinkle
        if (star.twinkleSpeed !== null) {
          const twinkle = Math.abs(
            Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5
          );
          targetOpacity += twinkle * 0.3; // Add twinkle effect on top
        }

        // Smooth transition for opacity
        star.opacity += (targetOpacity - star.opacity) * 0.1;
        star.opacity = Math.min(1, Math.max(0, star.opacity));

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });

      // Draw connections
      starsRef.current.forEach((star, i) => {
        for (let j = i + 1; j < starsRef.current.length; j++) {
          const otherStar = starsRef.current[j];
          const dx = star.x - otherStar.x;
          const dy = star.y - otherStar.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            // Dynamic opacity based on distance and star opacity
            const baseConnectionOpacity = 0.15 * (1 - distance / 100);
            // Use the average opacity of the two connected stars to influence connection brightness
            const connectionBrightness = (star.opacity + otherStar.opacity) / 2;
            const opacity = baseConnectionOpacity * connectionBrightness * 1.5; // Boost it a bit

            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(otherStar.x, otherStar.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldAnimate]);

  if (!shouldAnimate) {
    return <div className={cn('h-full w-full absolute inset-0', className)} />;
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn('h-full w-full absolute inset-0', className)}
    />
  );
};
