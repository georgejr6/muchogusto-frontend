import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n.jsx';
import { fmtShort, normStatus } from '@/lib/guestUtils';

export const HostAvatar = ({ src, name, size = 'h-10 w-10' }) => (
  src ? (
    <img src={src} alt="" className={`${size} shrink-0 rounded-full border border-border object-cover`} />
  ) : (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full border border-border bg-accent font-display text-sm text-primary`}>
      {(name || 'M').trim().charAt(0).toUpperCase()}
    </div>
  )
);

// A single invitation row, used by Tonight + Invites.
const InviteCard = ({ inv }) => {
  const { t, language } = useTranslation();
  const status = normStatus(inv.status);
  return (
    <Link to={`/invites/${inv.id}`} className="mg-card mg-card-hover flex items-center gap-3 p-4">
      <HostAvatar src={inv.host_photo} name={inv.host_name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium">{inv.event_name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {fmtShort(inv.event_date, language)}{inv.event_time ? ` · ${inv.event_time}` : ''}
          {inv.host_name ? ` · ${inv.host_name}` : ''}
        </p>
        {inv.event_location && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />{inv.event_location}
          </p>
        )}
        {inv.host_note && status === 'pending' && (
          <p className="mt-1 line-clamp-1 font-display text-sm italic text-primary/90">“{inv.host_note}”</p>
        )}
      </div>
      {status === 'waitlist' && <span className="mg-chip">{t('inv.waitlist')}</span>}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
};

export default InviteCard;
