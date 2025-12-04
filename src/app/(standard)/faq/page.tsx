import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - MiDika',
  description:
    'Frequently Asked Questions about MiDika services, policies, and team.',
};

const FAQS = [
  {
    category: 'Projects & Policies',
    questions: [
      {
        q: 'What is your project capacity?',
        a: 'To ensure the highest quality and dedication to each client, we take on a maximum of 2 projects per year. This allows us to focus entirely on delivering exceptional results without spreading our resources too thin.',
      },
      {
        q: 'What is the minimum budget for a project?',
        a: 'Our projects start at a minimum budget of €140,000. This reflects the premium quality, comprehensive service, and long-term value we provide. We believe in building robust, scalable solutions that stand the test of time.',
      },
      {
        q: 'How do I start a project with you?',
        a: 'You can start by contacting us via email or through our chat assistant. We will schedule an initial consultation to discuss your vision and requirements.',
      },
    ],
  },
  {
    category: 'About MiDika',
    questions: [
      {
        q: 'Who is MiDika?',
        a: 'MiDika is an Italian software house based in Milan, founded by Nicholas Sollazzo, Martire Baldassarre, and Domenico Magaretti. We are focused on minimalism, design, and engineering excellence.',
      },
      {
        q: 'What is your design philosophy?',
        a: "We believe in minimalism and simplicity. Our core values are KISS (Keep It Simple Stupid), DRY (Don't Repeat Yourself), YAGNI (You Aren't Gonna Need It), and TDD (Test Driven Development).",
      },
      {
        q: 'Where are you located?',
        a: 'We are headquartered in Milan, Italy, at Via Giovanni Boccaccio 37, 20123.',
      },
    ],
  },
  {
    category: 'Services & Tech',
    questions: [
      {
        q: 'What services do you offer?',
        a: 'We specialize in Custom Software Development, Web Application Development, AI Integration, and Technical Consulting. We build tailored solutions using modern technologies.',
      },
      {
        q: 'What technologies do you use?',
        a: 'We primarily use TypeScript, React, Next.js, Node.js, and Python. We rely on Tailwind CSS for styling and Vercel for deployment, ensuring high performance and scalability.',
      },
      {
        q: 'Do you work with international clients?',
        a: 'Yes, while we are deeply rooted in the Italian design tradition, we work with ambitious clients from all over the world.',
      },
      {
        q: 'How long does a typical project take?',
        a: 'Timelines vary based on complexity, but our rigorous process typically spans 3-6 months for a complete product launch. We prioritize quality over speed.',
      },
      {
        q: 'Do you offer ongoing support?',
        a: 'Yes, we offer maintenance and support packages to ensure your software remains secure, up-to-date, and performant after launch.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="flex flex-col items-center justify-start px-6 py-12 md:px-24 relative z-10">
      <div className="w-full max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-linear-to-b from-white to-white/60">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/60 max-w-2xl">
            Everything you need to know about our philosophy, services, and how
            we work.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {FAQS.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h2 className="text-xl font-semibold text-primary/80 border-b border-primary/20 pb-2">
                {section.category}
              </h2>
              <div className="space-y-8">
                {section.questions.map((item, qIdx) => (
                  <div key={qIdx} className="space-y-2 group">
                    <h3 className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                      {item.q}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/50 group-hover:text-white/70 transition-colors">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">
            Still have questions?
          </h3>
          <p className="text-white/60">
            We are here to help. Reach out to us directly or ask our AI
            assistant on the home page.
          </p>
          <div className="pt-4">
            <a
              href="mailto:info@midika.it"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
