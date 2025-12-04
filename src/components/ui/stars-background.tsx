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
  maxStars?: number;
}

export const StarsBackground: React.FC<StarBackgroundProps> = ({
  starDensity = 0.00035,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
  maxStars = 200,
}) => {
  const starsRef = useRef<StarProps[]>([]);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dimensionsRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

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
      const numStars = Math.min(Math.floor(area * starDensity), maxStars);
      return Array.from({ length: numStars }, () => {
        const shouldTwinkle =
          allStarsTwinkle || Math.random() < twinkleProbability;
        const baseOpacity = Math.random() * 0.5 + 0.5;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 0.05 + 0.5,
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
      maxStars,
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

    let resizeTimeout: NodeJS.Timeout;

    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Ignore invalid or too small dimensions to prevent clumping
        if (width < 50 || height < 50) return;

        // Store dimensions for render loop
        dimensionsRef.current = { width, height };

        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = width * dpr;
        const displayHeight = height * dpr;

        // Only update if dimensions actually changed to prevent unnecessary redraws
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
            ctx.scale(dpr, dpr);
          }

          // Regenerate stars with new dimensions
          starsRef.current = generateStars(width, height);
        }
      }
    };

    updateStars();

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateStars, 200);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    const canvas = canvasRef.current;
    if (canvas) {
      resizeObserver.observe(canvas);
    }

    return () => {
      if (canvas) {
        resizeObserver.unobserve(canvas);
      }
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
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
      const { width, height } = dimensionsRef.current;
      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Use stored dimensions instead of getBoundingClientRect for consistency
      ctx.clearRect(0, 0, width, height);

      // Update and draw stars
      starsRef.current.forEach((star) => {
        // Update position
        star.x += star.vx;
        star.y += star.vy;

        // Bounce off edges
        if (star.x < 0) {
          star.vx = Math.abs(star.vx);
        } else if (star.x > width) {
          star.vx = -Math.abs(star.vx);
        }

        if (star.y < 0) {
          star.vy = Math.abs(star.vy);
        } else if (star.y > height) {
          star.vy = -Math.abs(star.vy);
        }

        // Mouse interaction - Light up constellation
        const dx = star.x - mouseRef.current.x;
        const dy = star.y - mouseRef.current.y;

        // Optimization: simple box check before sqrt
        if (Math.abs(dx) < 250 && Math.abs(dy) < 250) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 250;

          if (distance < maxDistance) {
            const proximity = 1 - distance / maxDistance;
            // Enhanced brightness: stars reach near-full opacity on hover
            const hoverBrightness = 0.9 + proximity * 0.1; // 0.9 to 1.0
            star.opacity = Math.max(
              star.baseOpacity,
              star.baseOpacity +
                (hoverBrightness - star.baseOpacity) * proximity
            );
          } else {
            // Fall through to twinkle logic below
            if (star.twinkleSpeed !== null) {
              const twinkle = Math.abs(
                Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5
              );
              star.opacity = star.baseOpacity + twinkle * 0.3;
            } else {
              star.opacity = star.baseOpacity;
            }
          }
        } else {
          // Reset opacity if not near mouse - twinkle
          if (star.twinkleSpeed !== null) {
            const twinkle = Math.abs(
              Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5
            );
            star.opacity = star.baseOpacity + twinkle * 0.3;
          } else {
            star.opacity = star.baseOpacity;
          }
        }

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });

      // Draw connections with hover enhancement
      // Performance: reduced connection distance + limit connections per star
      const connectionDist = 120;
      const maxConnectionsPerStar = 3;

      starsRef.current.forEach((star, i) => {
        let connectionCount = 0;

        for (let j = i + 1; j < starsRef.current.length; j++) {
          if (connectionCount >= maxConnectionsPerStar) break;

          const otherStar = starsRef.current[j];
          const dx = star.x - otherStar.x;
          const dy = star.y - otherStar.y;

          // Optimization: simple box check
          if (Math.abs(dx) > connectionDist || Math.abs(dy) > connectionDist)
            continue;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDist) {
            connectionCount++;

            // Calculate base opacity from star opacities
            let baseOpacity =
              (1 - distance / connectionDist) *
              0.2 *
              (star.opacity + otherStar.opacity);

            // Enhance connection brightness on hover
            // Check distance from mouse to the connection line
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const lineLength = distance;

            // Project mouse point onto the line segment
            const toStar = { x: mx - star.x, y: my - star.y };
            const lineVec = { x: dx, y: dy };
            const dot = toStar.x * lineVec.x + toStar.y * lineVec.y;
            const lineLengthSq = lineLength * lineLength;

            let t = lineLengthSq > 0 ? dot / lineLengthSq : 0;
            t = Math.max(0, Math.min(1, t)); // Clamp to [0, 1]

            // Closest point on the line segment
            const closestX = star.x + t * dx;
            const closestY = star.y + t * dy;

            // Distance from mouse to the line
            const distToLine = Math.sqrt(
              (mx - closestX) ** 2 + (my - closestY) ** 2
            );

            // Enhance brightness when mouse is near the connection
            const hoverDistance = 150;
            if (distToLine < hoverDistance) {
              const hoverProximity = 1 - distToLine / hoverDistance;
              // Increase opacity significantly when hovering
              baseOpacity = Math.min(1, baseOpacity * (1 + hoverProximity * 2));
            }

            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(otherStar.x, otherStar.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${baseOpacity})`;
            // Slightly thicker line when hovering
            ctx.lineWidth = distToLine < hoverDistance ? 0.8 : 0.5;
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
