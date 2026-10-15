import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export function SharePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    api.get<{ universe_id: string }>(`/share/${token}/resolve`)
      .then(r => navigate(`/sim/${r.universe_id}`, { replace: true }))
      .catch(() => navigate('/', { replace: true }));
  }, [token]);

  return <div style={{ color: '#fff', padding: 20 }}>Resolving share link…</div>;
}
