'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    manifesto: 'Manifesto',
    projects: 'Projects',
    contacts: 'Contacts',
    talkToUs: 'Talk to us',
    subtitle: 'Italian software house',
    inputPlaceholder: 'How can we transform your idea?',
    designTitle: 'Italian Design',
    designDesc:
      'Refined aesthetics and maniacal attention to detail. We create interfaces that are not just functional, but emotional.',
    engineeringTitle: 'Engineering',
    engineeringDesc:
      'Clean, scalable, and performant code. We build solid technological foundations for your business.',
    visionTitle: 'Vision',
    visionDesc:
      'We transform complex ideas into intuitive digital products. From strategy to launch, we are by your side.',
    visualSection: 'Understanding The Digital Universe',
    footerText: 'Made with',
    privacy: 'Privacy',
    terms: 'Terms',
  },
  it: {
    manifesto: 'Manifesto',
    projects: 'Progetti',
    contacts: 'Contatti',
    talkToUs: 'Parla con noi',
    subtitle: 'Software House Italiana.',
    inputPlaceholder: 'Come possiamo trasformare la tua idea?',
    designTitle: 'Design Italiano',
    designDesc:
      'Estetica raffinata e attenzione maniacale ai dettagli. Creiamo interfacce che non sono solo funzionali, ma emozionanti.',
    engineeringTitle: 'Ingegneria',
    engineeringDesc:
      'Codice pulito, scalabile e performante. Costruiamo solide fondamenta tecnologiche per il tuo business.',
    visionTitle: 'Visione',
    visionDesc:
      'Trasformiamo idee complesse in prodotti digitali intuitivi. Dalla strategia al lancio, siamo al tuo fianco.',
    visualSection: "Comprendere L'Universo Digitale",
    footerText: 'Fatto con',
    privacy: 'Privacy',
    terms: 'Termini',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
