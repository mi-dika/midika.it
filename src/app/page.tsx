import { ShootingStars } from '@/components/ui/shooting-stars';
import { StarsBackground } from '@/components/ui/stars-background';

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <StarsBackground className="[mask-image:radial-gradient(circle_at_center,white,transparent_75%)]" />
        <ShootingStars
          starColor="#f97316"
          trailColor="#f97316"
          className="[mask-image:radial-gradient(circle_at_top,white,transparent_75%)]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
      </div>
      <main className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
          MIDIKA
        </h1>
        <p className="text-lg font-light text-white/80 sm:text-xl">
          Italian Software House
        </p>
      </main>
    </div>
  );
}
