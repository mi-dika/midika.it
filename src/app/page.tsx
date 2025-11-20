import { GlowingText } from '@/components/ui/glowing-text';
import { ArrowDown, ArrowRight, Brain, Code2, Palette } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section - Full Screen */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-between p-4 md:p-8">
        {/* Navigation */}
        <header className="relative z-10 flex w-full items-center justify-between">
          <span className="text-xl font-bold tracking-tighter">MiDika</span>
          <nav className="hidden gap-6 text-sm font-medium text-white/70 md:flex">
            <a href="#" className="hover:text-white transition-colors">
              Manifesto
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Progetti
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contatti
            </a>
          </nav>
          <a
            href="mailto:info@midika.it"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Parla con noi
          </a>
        </header>

        {/* Center Logo */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <GlowingText text="MiDika" />
          <p className="mt-6 max-w-2xl text-lg font-light text-white/70 sm:text-xl text-center">
            Artigiani del Software Italiano.
          </p>
        </div>

        {/* Bottom Input & Arrow */}
        <div className="flex w-full flex-col items-center gap-8 pb-8">
          <div className="relative w-full max-w-md group">
            <input
              type="text"
              placeholder="Come possiamo trasformare la tua idea?"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 pr-12 text-white backdrop-blur-sm transition-all placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-0"
              readOnly
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 p-2 text-white/50 transition-colors group-hover:bg-white/20 group-hover:text-orange-500">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <div className="animate-bounce text-white/30">
            <ArrowDown className="h-6 w-6" />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-10 flex flex-col items-center gap-24 px-4 py-24 text-center md:px-6 bg-black/50 backdrop-blur-sm">
        {/* Features Grid */}
        <div className="grid w-full max-w-6xl gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all hover:bg-white/10">
            <div className="mb-4 inline-flex rounded-full bg-orange-500/10 p-3 text-orange-500">
              <Palette className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Design Italiano</h3>
            <p className="text-sm text-white/60">
              Estetica raffinata e attenzione maniacale ai dettagli. Creiamo interfacce che non sono solo funzionali, ma emozionanti.
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all hover:bg-white/10">
            <div className="mb-4 inline-flex rounded-full bg-blue-500/10 p-3 text-blue-500">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Ingegneria</h3>
            <p className="text-sm text-white/60">
              Codice pulito, scalabile e performante. Costruiamo solide fondamenta tecnologiche per il tuo business.
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all hover:bg-white/10">
            <div className="mb-4 inline-flex rounded-full bg-purple-500/10 p-3 text-purple-500">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Visione</h3>
            <p className="text-sm text-white/60">
              Trasformiamo idee complesse in prodotti digitali intuitivi. Dalla strategia al lancio, siamo al tuo fianco.
            </p>
          </div>
        </div>

        {/* Visual Section */}
        <div className="flex min-h-[40vh] w-full items-center justify-center">
          <h2 className="max-w-4xl text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            Comprendere L'Universo Digitale
          </h2>
        </div>

        {/* Footer */}
        <footer className="w-full max-w-6xl border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <span className="text-xs text-white/40">
              © {new Date().getFullYear()} MiDika. Fatto con <span className="text-orange-500">♥</span> in Italia.
            </span>
            <div className="flex gap-6 text-xs text-white/40">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Termini
              </a>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
