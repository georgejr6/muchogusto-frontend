import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageSquare,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

import EventManagement from '@/components/EventManagement';
import MemberManagement from '@/components/MemberManagement';
import MessagingSystem from '@/components/MessagingSystem';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n.jsx';
import { getEvents, getUsers } from '@/lib/apiClient';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logoutAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [overviewData, setOverviewData] = useState({ events: [], memberCount: 0 });

  useEffect(() => {
    if (activeSection === 'dashboard') {
      Promise.all([getEvents(), getUsers()])
        .then(([events, users]) => setOverviewData({ events, memberCount: users.length }))
        .catch(console.error);
    }
  }, [activeSection]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', label: t('admin.overview'), icon: LayoutDashboard },
    { id: 'events', label: t('admin.events'), icon: CalendarDays },
    { id: 'members', label: t('admin.members'), icon: Users },
    { id: 'messages', label: t('admin.messages'), icon: MessageSquare },
  ];

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="luxury-card p-6 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-[rgba(212,175,55,0.1)] rounded-full">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{overviewData.memberCount}</p>
              <p className="luxury-text-accent text-sm uppercase tracking-wider">{t('admin.total_members')}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/rsvps')}
            className="text-sm text-primary hover:text-primary/90 flex items-center gap-1 mt-2 transition-colors"
          >
            View Member Directory <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="luxury-card p-6 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-[rgba(212,175,55,0.1)] rounded-full">
              <CalendarDays className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{overviewData.events.length}</p>
              <p className="luxury-text-accent text-sm uppercase tracking-wider">{t('admin.active_events')}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('events')}
            className="text-sm text-primary hover:text-primary/90 flex items-center gap-1 mt-2 transition-colors"
          >
            Manage Events <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Recent Events</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {overviewData.events.slice(0, 4).map(event => {
            const rsvps = event.rsvps || [];
            const interested = rsvps.filter(r => r.status === 'interested').length;
            return (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="bg-[rgba(15,0,26,0.6)] border border-primary/30 p-4 rounded-lg cursor-pointer hover:bg-[rgba(212,175,55,0.1)] transition-all group flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{event.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-bold text-green-400">{interested}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Going</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'events': return <EventManagement />;
      case 'members': return <MemberManagement />;
      case 'messages': return <MessagingSystem />;
      default: return renderOverview();
    }
  };

  const adminLogoutBtn = (
    <button
      onClick={handleLogout}
      className="text-red-400 hover:text-red-300 flex items-center gap-1.5 text-sm font-medium transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">{t('admin.logout')}</span>
    </button>
  );

  return (
    <>
      <Helmet>
        <title>{t('admin.title')} | Mucho Gusto Xo</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background text-foreground relative z-10">
        <Header rightContent={adminLogoutBtn} />

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 bg-[rgba(15,0,26,0.95)] border-r border-primary/30 flex-col hidden md:flex overflow-y-auto">
            <div className="p-6 border-b border-primary/30 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="font-bold text-lg tracking-tight text-primary">MG XO ADMIN</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                        : 'text-foreground hover:bg-[rgba(212,175,55,0.1)] hover:text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}

              <div className="my-4 border-t border-primary/20" />

              <Link
                to="/rsvps"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium text-muted-foreground hover:bg-[rgba(212,175,55,0.1)] hover:text-primary"
              >
                <Users className="w-5 h-5" />
                Full Directory
              </Link>
            </nav>
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="md:hidden p-4 border-b border-primary/30 bg-[rgba(15,0,26,0.95)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-bold text-primary">ADMIN</span>
              </div>
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
                className="luxury-input py-1 px-2 text-sm w-auto bg-background"
              >
                {navItems.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
              </select>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground capitalize tracking-wide">
                    {navItems.find(i => i.id === activeSection)?.label}
                  </h2>
                  <p className="luxury-text-accent mt-1 text-sm">{t('admin.subtitle')}</p>
                </div>

                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
