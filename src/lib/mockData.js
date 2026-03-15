
// Mock Data Service for prototype development
export const initializeMockData = () => {
  if (!localStorage.getItem('profiles')) {
    localStorage.setItem('profiles', JSON.stringify([
      {
        id: 'prof_admin_demo',
        name: 'Demo User',
        instagram: 'demouser',
        phone: '+1234567890',
        dob: '1995-05-15',
        email: 'demo@example.com',
        city: 'New York',
        age_range: '25-34',
        hobbies: 'Music, Tech',
        bio: 'Just a demo user.',
        interests: ['Events'],
        hasPhotos: true,
        media_consent: true,
        contact_consent: true,
        profile_completion_percentage: 100,
        admin_blur_status: null,
        user_blur_preference: false,
        blur_reason: '',
        created_at: new Date().toISOString()
      }
    ]));
  }

  if (!localStorage.getItem('event_invitations')) {
    localStorage.setItem('event_invitations', JSON.stringify([
      {
        id: 'inv_1',
        profile_id: 'prof_admin_demo',
        event_name: 'Neon Nights Downtown',
        date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        location: 'Secret Warehouse, Brooklyn',
        description: 'Exclusive underground electronic music event. Dress code: Neon.',
        rsvp_status: 'pending', // pending, interested, not_interested
        created_at: new Date().toISOString()
      }
    ]));
  }
};

export const getMockProfile = (id) => {
  const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
  return profiles.find(p => p.id === id) || null;
};

export const getMockInvitations = (profileId) => {
  const invites = JSON.parse(localStorage.getItem('event_invitations') || '[]');
  return invites.filter(i => i.profile_id === profileId);
};

export const updateMockInvitationStatus = (invitationId, status) => {
  const invites = JSON.parse(localStorage.getItem('event_invitations') || '[]');
  const index = invites.findIndex(i => i.id === invitationId);
  if (index !== -1) {
    invites[index].rsvp_status = status;
    localStorage.setItem('event_invitations', JSON.stringify(invites));
    return invites[index];
  }
  return null;
};

export const createMockInvitations = (profileIds, eventDetails) => {
  const invites = JSON.parse(localStorage.getItem('event_invitations') || '[]');
  const newInvites = profileIds.map(pid => ({
    id: `inv_${Date.now()}_${pid}`,
    profile_id: pid,
    ...eventDetails,
    rsvp_status: 'pending',
    created_at: new Date().toISOString()
  }));
  
  localStorage.setItem('event_invitations', JSON.stringify([...invites, ...newInvites]));
  return newInvites;
};
