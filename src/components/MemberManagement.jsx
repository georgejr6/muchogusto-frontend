import React, { useState, useEffect } from 'react';
import { Search, Users, Phone, Mail, Instagram, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUsers, setUserBlur } from '@/lib/apiClient';

const MemberManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setMembers)
      .catch(() => toast({ title: 'Failed to load members', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const handleBlurToggle = async (userId, newStatus) => {
    try {
      await setUserBlur(userId, newStatus);
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, is_blurred: newStatus } : m));
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const filtered = members
    .filter(m => {
      const term = searchTerm.toLowerCase();
      return (
        (m.name || '').toLowerCase().includes(term) ||
        (m.instagram || '').toLowerCase().includes(term) ||
        (m.phone || '').includes(term) ||
        (m.email || '').toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'completion') return (b.profile_completion || 0) - (a.profile_completion || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  if (loading) return <div className="text-center py-12 luxury-text-accent">Loading members...</div>;

  return (
    <div className="space-y-6">
      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
          <input
            type="text"
            placeholder="Search by name, Instagram, phone, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="luxury-input pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="luxury-input appearance-none bg-[rgba(15,0,26,0.9)] md:w-[200px]"
        >
          <option value="newest">Newest Joined</option>
          <option value="completion">Completion %</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-[#D4AF37]">{members.length}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Members</span>
      </div>

      {filtered.length === 0 ? (
        <div className="luxury-card p-12 text-center text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No members found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(member => (
            <div key={member.id} className="luxury-card p-4 flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-[rgba(212,175,55,0.1)] border-2 border-[#D4AF37]/40 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {member.photo_url
                  ? <img src={member.photo_url} alt="" className="w-full h-full object-cover" />
                  : <User className="w-7 h-7 text-[#D4AF37]/50" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                <div>
                  <p className="font-bold text-[#FFFDD0] truncate">{member.name || <span className="text-muted-foreground italic">No name</span>}</p>
                  {member.instagram && (
                    <p className="text-sm text-[#D4AF37] flex items-center gap-1">
                      <Instagram className="w-3.5 h-3.5" /> @{member.instagram}
                    </p>
                  )}
                </div>
                <div className="space-y-0.5">
                  {member.phone && (
                    <p className="text-sm text-[#FFFDD0]/80 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> {member.phone}
                    </p>
                  )}
                  {member.email && (
                    <p className="text-sm text-[#FFFDD0]/80 flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37]" /> {member.email}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {member.city && <span>{member.city}</span>}
                  {member.age_range && <span className="ml-2">· {member.age_range}</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  Profile: <span className="text-[#D4AF37] font-medium">{member.profile_completion || 0}%</span>
                  <span className="ml-2">· Joined {new Date(member.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Blur toggle */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded border ${
                  member.is_blurred
                    ? 'border-yellow-500/40 text-yellow-400'
                    : 'border-green-500/40 text-green-400'
                }`}>
                  {member.is_blurred ? 'Blurred' : 'Visible'}
                </span>
                <button
                  onClick={() => handleBlurToggle(member.id, !member.is_blurred)}
                  className="text-xs text-muted-foreground hover:text-[#D4AF37] transition-colors"
                >
                  {member.is_blurred ? 'Unblur' : 'Blur'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
