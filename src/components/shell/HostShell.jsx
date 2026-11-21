import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layers, CalendarDays, ShieldCheck, MapPin, UserCircle, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const items = [
  { to: '/host', label: 'Deck', icon: Layers, end: true },
  { to: '/host/events', label: 'Events', icon: CalendarDays },
  { to: '/host/verification', label: 'Verify', icon: ShieldCheck },
  { to: '/host/cities', label: 'Cities', icon: MapPin },
  { to: '/host/profile', label: 'Me', icon: UserCircle },
];

// Wraps every host page: sidebar on desktop, bottom tabs on mobile.
const HostShell = ({ children, title }) => {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-accent text-primary' : 'text-muted-foreground hover:text-foreground'}`;

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-60 shrink-0 border-r border-border p-4 md:block">
        <div className="font-display mb-6 px-3 text-xl text-primary">
          Mucho Gusto <span className="mg-eyebrow block">Host</span>
        </div>
        <nav className="space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={link}><Icon className="h-4 w-4" />{label}</NavLink>
          ))}
          <NavLink to="/admin-dashboard" className={link}><Users className="h-4 w-4" />Members &amp; messages</NavLink>
          <button
            onClick={() => { logoutAdmin(); navigate('/'); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />Sign out
          </button>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        {title && (
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
            <h1 className="text-xl">{title}</h1>
          </header>
        )}
        <main>{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 pb-safe backdrop-blur-md md:hidden" aria-label="Host">
        <ul className="flex justify-between px-2 pt-2">
          {items.map(({ to, label, icon: Icon, end }) => (
            <li key={to} className="flex-1">
              <NavLink to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-1.5 text-[11px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className="h-5 w-5" />{label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default HostShell;
