import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth.api';

export function useDashboardUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await authApi.getUsers();
        setUsers(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error('[Dashboard] Could not load users:', error);
        setError('Could not load the people list. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return { users, loading, error };
}
