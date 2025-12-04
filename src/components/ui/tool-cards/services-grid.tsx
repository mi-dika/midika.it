'use client';

import { Briefcase, Code, Globe, Sparkles, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface Service {
  name: string;
  description: string;
  technologies?: string[];
  areas?: string[];
}

interface ServicesGridProps {
  services: Service[];
}

const serviceIcons = {
  'Custom Software Development': Code,
  'Web Application Development': Globe,
  'AI Integration': Sparkles,
  'Technical Consulting': Wrench,
  default: Briefcase,
};

export function ServicesGrid({ services }: ServicesGridProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={cn(
        'my-2 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm',
        'transform transition-all duration-500 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
          <Briefcase className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Our Services</h3>
          <p className="text-xs text-white/50">
            {services.length} service{services.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="grid gap-3">
          {services.map((service, index) => {
            const Icon =
              serviceIcons[service.name as keyof typeof serviceIcons] ||
              serviceIcons.default;

            return (
              <div
                key={index}
                className={cn(
                  'group relative overflow-hidden rounded-lg border border-white/5 bg-white/5 p-4',
                  'hover:border-primary/30 hover:bg-white/10 transition-all duration-300',
                  'hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/10'
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Icon */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary group-hover:bg-primary/30 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    {service.name}
                  </h4>
                </div>

                {/* Description */}
                <p className="mb-3 text-xs leading-relaxed text-white/70">
                  {service.description}
                </p>

                {/* Technologies/Areas */}
                {(service.technologies || service.areas) && (
                  <div className="flex flex-wrap gap-1.5">
                    {(service.technologies || service.areas)?.map(
                      (item, itemIndex) => (
                        <span
                          key={itemIndex}
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/60 transition-all group-hover:border-primary/30 group-hover:text-primary/80"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
