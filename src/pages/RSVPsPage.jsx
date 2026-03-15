import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ArrowLeft, Home } from 'lucide-react';
import MemberCard from '@/components/MemberCard';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, getPublicUsers, setUserBlur } from '@/lib/apiClient';

const RSVPsPage = () => {
  const navigate = useNavigate();
  const { isAdminAuthenticated } = useAuth();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (isAdminAuthenticated ? getUsers() : getPublicUsers())
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAdminAuthenticated]);

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

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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
              <div className="stats-card px-6 py-3">
                <span className="text-2xl font-bold text-[#D4AF37]">{members.length}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Users</span>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default RSVPsPage;
