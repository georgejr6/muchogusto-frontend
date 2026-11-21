import { useCallback, useEffect, useState } from 'react';
import { getMyInvitations } from '@/lib/apiClient';

// Loads the member's invitations with loading + error state.
export default function useMyInvitations() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getMyInvitations()
      .then((rows) => setInvites(Array.isArray(rows) ? rows : []))
      .catch((e) => setError(e.message || 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { invites, loading, error, reload: load, setInvites };
}
