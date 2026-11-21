import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Moon, Mail, Bell, QrCode, User } from 'lucide-react';
import { getUnreadCount } from '@/lib/apiClient';

const items = [
  { to: '/tonight', label: 'Tonight', icon: Moon },
  { to: '/invites', label: 'Invites', icon: Mail },
  { to: '/notifications', label: 'Alerts', icon: Bell, badge: true },
  { to: '/pass', label: 'Pass', icon: QrCode },
  { to: '/me', label: 'Me', icon: User },
];

// Wraps every signed-in member page: top wordmark + bottom tab bar (mobile-first).
const GuestShell = ({ children, title }) => {
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    const load = () => getUnreadCount().then(r => alive && setUnread(r.count)).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <button onClick={() => navigate('/tonight')} className="font-display text-lg text-primary">Mucho Gusto</button>
          {title && <span className="mg-eyebrow">{title}</span>}
        </div>
      </header>
      <main>{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 pb-safe backdrop-blur-md" aria-label="Primary">
        <ul className="mx-auto flex max-w-2xl justify-between px-2 pt-2">
          {items.map(({ to, label, icon: Icon, badge }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Icon className="h-5 w-5" />
                {label}
                {badge && unread > 0 && (
                  <span className="absolute right-[28%] top-0 min-w-[16px] rounded-full bg-[hsl(var(--mg-rose))] px-1 text-center text-[10px] font-semibold text-background">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default GuestShell;
