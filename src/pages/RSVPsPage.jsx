import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ArrowLeft, Home, Calendar, MapPin, Lock } from 'lucide-react';
import MemberCard from '@/components/MemberCard';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, getPublicUsers, setUserBlur, getPublicEvents } from '@/lib/apiClient';

const RSVPsPage = () => {
  const navigate = useNavigate();
  const { isAdminAuthenticated, isUserAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    (isAdminAuthenticated ? getUsers() : getPublicUsers())
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAdminAuthenticated]);

  useEffect(() => {
    getPublicEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setEventsLoading(false));
  }, []);

  const handleBlurToggle = async (userId, newStatus) => {
    try {
      await setUserBlur(userId, newStatus);
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, is_blurred: newStatus } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAndSortedMembers = members
    .filter(m => {
      const term = searchTerm.toLowerCase();
      return (
        (m.name || '').toLowerCase().includes(term) ||
        (m.instagram || '').toLowerCase().includes(term) ||
        (m.phone || '').includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'completion') return (b.profile_completion || 0) - (a.profile_completion || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  return (
    <>
      <Helmet>
        <title>{isAdminAuthenticated ? 'All Members | Admin' : 'Community | Mucho Gusto Xo'}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-[#0f001a] relative z-10">
        <Header />

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              {isAdminAuthenticated ? (
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="flex items-center gap-2 text-[#F1E5AC] hover:text-[#D4AF37] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-[#F1E5AC] hover:text-[#D4AF37] transition-colors"
                >
                  <Home className="w-5 h-5" /> Back to Home
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-[#FFFDD0] flex items-center gap-3">
                  <Users className="w-8 h-8 text-[#D4AF37]" />
                  {isAdminAuthenticated ? 'All Members Directory' : 'Mucho Gusto Xo Community'}
                </h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                  {isAdminAuthenticated
                    ? 'Manage and view detailed profiles of all registered users.'
                    : 'Profiles may be blurred to protect privacy while showing our community.'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#D4AF37]/30 mb-6">
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'members' ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-[#FFFDD0]'}`}
              >
                Members
                {activeTab === 'members' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'events' ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-[#FFFDD0]'}`}
              >
                Events
                {activeTab === 'events' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
              </button>
            </div>

            {/* Members Tab */}
            {activeTab === 'members' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="stats-card px-6 py-3">
                    <span className="text-2xl font-bold text-[#D4AF37]">{members.length}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider ml-2">Total Users</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="luxury-input pl-10"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="luxury-input appearance-none bg-[rgba(15,0,26,0.9)] md:w-[200px]"
                  >
                    <option value="newest">Newest Joined</option>
                    <option value="completion">Completion %</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>

                {loading ? (
                  <div className="text-center py-12 luxury-text-accent">Loading members...</div>
                ) : filteredAndSortedMembers.length === 0 ? (
                  <div className="luxury-card p-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No members found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedMembers.map(member => (
                      <MemberCard
                        key={member.id}
                        member={{ ...member, admin_blur_status: member.is_blurred }}
                        isAdmin={isAdminAuthenticated}
                        onBlurToggle={handleBlurToggle}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <>
                {eventsLoading ? (
                  <div className="text-center py-12 luxury-text-accent">Loading events...</div>
                ) : events.length === 0 ? (
                  <div className="luxury-card p-12 text-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No events available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                      <div key={event.id} className="luxury-card p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-bold text-[#FFFDD0]">{event.name}</h3>
                          {event.visibility === 'invited_only' && (
                            <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-1 rounded-full flex items-center gap-1 shrink-0 ml-2">
                              <Lock className="w-3 h-3" /> Invite Only
                            </span>
                          )}
                          {event.visibility === 'members_only' && (
                            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full shrink-0 ml-2">Members Only</span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm luxury-text-accent">
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#D4AF37]" /><span>{new Date(event.date).toLocaleDateString()} at {event.time}</span></div>
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#D4AF37]" /><span>{event.location}</span></div>
                        </div>
                        {event.description && <p className="text-sm luxury-text-accent">{event.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RSVPsPage;
