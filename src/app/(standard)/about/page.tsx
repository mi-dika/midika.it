import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'MIDIKA SRL is an Italian software house based in Milan, delivering minimalist, design-focused digital solutions that prioritize clarity and usability.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-white/90">
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-white">
        About Us
      </h1>

      <p className="mb-12 text-lg leading-relaxed text-white/70">
        MIDIKA SRL is an Italian software house based in Milan, dedicated to
        delivering minimalist, design-focused digital solutions that prioritize
        clarity and usability. Our mission is to simplify the complex, offering
        elegant software products and platforms that empower businesses through
        thoughtful design and robust technology.
      </p>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-white">Who We Are</h2>
        <p className="leading-relaxed text-white/70">
          Founded on October 7, 2021 and led by Nicholas Sollazzo (CEO &amp;
          Co-Founder), MIDIKA SRL brings together a diverse team of
          professionals passionate about technology, design, and innovation. Our
          core values are rooted in simplicity, efficiency, and a relentless
          pursuit of quality. We believe in the principles of KISS (Keep It
          Simple Stupid), DRY (Don&apos;t Repeat Yourself), and YAGNI (You
          Aren&apos;t Gonna Need It), ensuring our work remains focused and
          effective. Test-driven development (TDD) is a cornerstone of our
          engineering culture, guaranteeing reliability and maintainability in
          every project we deliver.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-white">What We Do</h2>
        <p className="leading-relaxed text-white/70">
          At MIDIKA SRL, we specialize in designing and building digital
          platforms and custom software products for other businesses. We
          partner with companies to turn complex processes into simple,
          well-designed tools — from internal dashboards to customer-facing
          applications and bespoke platforms. We work with modern, cutting-edge
          technologies, including AI-powered solutions, to create software that
          is both technically robust and easy to use. Our solutions are always
          tailored to real business needs, and we continuously adapt to user
          feedback and industry trends to ensure we deliver maximum value.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-white">Our Team</h2>
        <p className="mb-4 leading-relaxed text-white/70">
          MIDIKA SRL is proud to be powered by a talented, multidisciplinary
          team. Key members include:
        </p>
        <ul className="list-inside list-disc space-y-2 text-white/70">
          <li>
            <span className="font-medium text-white">Nicholas Sollazzo</span> —
            CEO &amp; Co-Founder
          </li>
          <li>
            <span className="font-medium text-white">Baldassarre Martire</span>{' '}
            — CFO &amp; Co-Founder
          </li>
          <li>
            <span className="font-medium text-white">Domenico Magaretti</span> —
            CSO &amp; Co-Founder
          </li>
          <li>
            <span className="font-medium text-white">Vlas Bukhonskyi</span> —
            Lead AI Developer
          </li>
          <li>
            <span className="font-medium text-white">Dimitri Romeo</span> — Full
            Stack Developer
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-white/70">
          Each team member brings unique expertise, contributing to our
          collaborative and innovative environment.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Our Philosophy
        </h2>
        <p className="leading-relaxed text-white/70">
          We are more than just a software company. MIDIKA SRL is a studio where
          design meets technology, and where every product reflects our
          commitment to clarity, usability, and minimalism. We believe that
          great software should be invisible—seamlessly integrated into
          users&apos; lives and workflows, solving problems without creating new
          ones.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-white">Contact Us</h2>
        <address className="not-italic leading-relaxed text-white/70">
          <p className="font-medium text-white">MIDIKA SRL</p>
          <p>Via Giovanni Boccaccio 37</p>
          <p>20123 Milano (MI), Italy</p>
          <p className="mt-4">VAT: IT12042860960</p>
          <p>Phone: (+39) 351 989 6805</p>
          <p>
            Email:{' '}
            <a
              href="mailto:info@midika.it"
              className="text-primary hover:underline"
            >
              info@midika.it
            </a>
          </p>
          <p>
            Website:{' '}
            <a
              href="https://midika.it/"
              className="text-primary hover:underline"
            >
              https://midika.it/
            </a>
          </p>
        </address>
        <p className="mt-4 leading-relaxed text-white/70">
          For press, partnership, or general inquiries, please reach out via
          email or visit our website for more information.
        </p>
      </section>

      {/* AboutPage JSON-LD for AI crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            mainEntity: {
              '@type': 'Organization',
              name: 'MIDIKA SRL',
              url: 'https://midika.it/',
            },
          }),
        }}
      />
    </main>
  );
}
