import React, { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MemberCard from '@/components/MemberCard';
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

  if (loading) return <div className="text-center py-12 luxury-text-accent">Loading members...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
          <input
            type="text"
            placeholder="Search by name, Instagram, or phone..."
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

      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-[#D4AF37]">{members.length}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Members</span>
      </div>

      {filteredAndSortedMembers.length === 0 ? (
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
              isAdmin={true}
              onBlurToggle={handleBlurToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
