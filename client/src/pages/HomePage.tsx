import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Universe } from '../types';
import { useAuthStore } from '../store/authStore';
import { AuthForm } from '../components/AuthForm';
import { SuggestionsModal } from '../components/SuggestionsModal';

export function HomePage() {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showAuth, setShowAuth] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Request fullscreen on first click anywhere
  useEffect(() => {
    const requestFs = () => {
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        el.requestFullscreen?.().catch(() => {});
      }
      window.removeEventListener('click', requestFs);
    };
    window.addEventListener('click', requestFs);
    return () => window.removeEventListener('click', requestFs);
  }, []);

  const openSim = (id: string) => {
    if (!token) { setShowAuth(true); return; }
    navigate(`/sim/${id}`);
  };

  const { data: presets } = useQuery<Universe[]>({
    queryKey: ['presets'],
    queryFn: () => api.get('/universes/presets'),
  });

  const { data: myUniverses } = useQuery<Universe[]>({
    queryKey: ['my-universes'],
    queryFn: () => api.get('/universes'),
    enabled: !!token,
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.post<{ id: string }>(`/universes/${id}/duplicate`, {}),
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ['my-universes'] }); navigate(`/sim/${r.id}`); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/universes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-universes'] }),
  });

  const exportUniverse = (id: string, name: string) => {
    window.open(`/api/universes/${id}/export`, '_blank');
  };

  const bgVideo = (
    <video autoPlay loop muted playsInline
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18, zIndex: 0, pointerEvents: 'none' }}
      src="/Solar System Background VIdeo.mp4"
    />
  );

  const header = (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/textures/EarthLogo.jpg" alt="OrbiTaurus" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
        <h1 style={{ margin: 0 }}>OrbiTaurus</h1>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {token ? (
          <button onClick={logout}>Sign Out</button>
        ) : (
          <button onClick={() => setShowAuth(true)}>Sign In / Register</button>
        )}
        <button onClick={() => setShowSuggestions(true)} style={{ background: '#1a1a3e', border: '1px solid #446' }}>💡 Suggest</button>
      </div>
    </header>
  );

  // ── DASHBOARD (always shown) ────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {bgVideo}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {header}

        {showAuth && (
          <div style={{ position: 'fixed', inset: 0, background: '#000a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <AuthForm onClose={() => setShowAuth(false)} />
          </div>
        )}
        {showSuggestions && <SuggestionsModal onClose={() => setShowSuggestions(false)} />}

        <section aria-label="Preset systems">
          <h2>Preset Systems</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {presets?.map(p => (
              <div key={p.id} style={{ background: 'rgba(17,17,17,0.85)', border: '1px solid #333', borderRadius: 8, padding: 16 }}>
                <h3 style={{ margin: '0 0 6px' }}>{p.name}</h3>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: '#aaa' }}>{p.description}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openSim(p.id)}>
                    {token ? '▶ Open' : '🔒 Sign in to Open'}
                  </button>
                  {token && (
                    <button onClick={() => duplicateMutation.mutate(p.id)}>⎘ Fork</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="My universes" style={{ marginTop: 40 }}>
          <h2>My Universes</h2>
          {myUniverses?.length === 0 && (
            <p style={{ color: '#666' }}>No universes yet. Fork a preset to get started.</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {myUniverses?.filter(u => !u.is_archived).map(u => (
              <div key={u.id} style={{ background: 'rgba(17,17,17,0.85)', border: '1px solid #333', borderRadius: 8, padding: 16 }}>
                <h3 style={{ margin: '0 0 6px' }}>{u.name}</h3>
                <p style={{ margin: '0 0 12px', fontSize: 11, color: '#666' }}>
                  {u.is_public ? '🌐 Public' : '🔒 Private'}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => navigate(`/sim/${u.id}`)}>▶ Open</button>
                  <button onClick={() => exportUniverse(u.id, u.name)}>⬇ Export</button>
                  <button onClick={() => deleteMutation.mutate(u.id)} style={{ color: '#f55' }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
