'use client';

import { Building2, Users, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface CompanyInfoCardProps {
  data: {
    name?: string;
    legalName?: string;
    founded?: string;
    location?: string;
    address?: string;
    vat?: string;
    phone?: string;
    email?: string;
    website?: string;
    team?: Array<{ name: string; role: string; focus: string }>;
    values?: Array<{
      acronym: string;
      meaning: string;
      description: string;
    }>;
  };
}

export function CompanyInfoCard({ data }: CompanyInfoCardProps) {
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
          <Building2 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            {data.name || 'Company Info'}
          </h3>
          {data.legalName && (
            <p className="text-xs text-white/50">{data.legalName}</p>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Contact Info */}
        {(data.email || data.phone || data.address) && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Contact
            </h4>
            <div className="space-y-1.5">
              {data.email && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Mail className="h-3.5 w-3.5 text-primary/70" />
                  <a
                    href={`mailto:${data.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {data.email}
                  </a>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Phone className="h-3.5 w-3.5 text-primary/70" />
                  <a
                    href={`tel:${data.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {data.phone}
                  </a>
                </div>
              )}
              {data.address && (
                <div className="flex items-start gap-2 text-sm text-white/80">
                  <MapPin className="h-3.5 w-3.5 text-primary/70 mt-0.5 shrink-0" />
                  <span>{data.address}</span>
                </div>
              )}
              {data.website && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Globe className="h-3.5 w-3.5 text-primary/70" />
                  <a
                    href={data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {data.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Team */}
        {data.team && data.team.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Team
            </h4>
            <div className="grid gap-2">
              {data.team.map((member, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2 border border-white/5 hover:border-primary/20 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {member.name}
                    </p>
                    <p className="text-xs text-white/60">{member.role}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {member.focus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Values */}
        {data.values && data.values.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Core Values
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {data.values.map((value, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-white/5 p-2.5 border border-white/5 hover:border-primary/20 transition-all hover:scale-[1.02]"
                >
                  <p className="text-xs font-bold text-primary mb-0.5">
                    {value.acronym}
                  </p>
                  <p className="text-xs text-white/60 leading-tight">
                    {value.meaning}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
