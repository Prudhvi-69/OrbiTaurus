import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Universe } from '../types';
import { useSimStore } from '../store/simStore';
import { useAuthStore } from '../store/authStore';
import { useSimulation } from '../hooks/useSimulation';
import { SimulatorCanvas } from '../components/SimulatorCanvas';
import { SimControls } from '../components/SimControls';
import { BodyInspector } from '../components/BodyInspector';
import { BodyForm } from '../components/BodyForm';
import { Glossary } from '../components/Glossary';
import { LimitationsNotice } from '../components/LimitationsNotice';
import { CheckpointPanel } from '../components/CheckpointPanel';
import { SharePanel } from '../components/SharePanel';
import { UniverseSettings } from '../components/UniverseSettings';

type Panel = 'bodies' | 'checkpoints' | 'share' | 'settings' | 'glossary';

export function SimulatorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { token } = useAuthStore();
  const { loadUniverse, selectBody, reducedDetail, toggleReducedDetail } = useSimStore();
  const [showAddBody, setShowAddBody] = useState(false);
  const [driftWarning, setDriftWarning] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>('bodies');
  const [loaded, setLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const { data: universe, refetch, isLoading, error } = useQuery<Universe>({
    queryKey: ['universe', id],
    queryFn: () => api.get(`/universes/${id}`),
    enabled: !!id,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (universe && !loaded) {
      loadUniverse(universe);
      setLoaded(true);
      // Keep loader visible for 5s for cinematic effect
      const t = setTimeout(() => setShowLoader(false), 5000);
      return () => clearTimeout(t);
    }
  }, [universe]);

  const { step } = useSimulation(
    universe?.settings ?? null,
    useCallback(() => setDriftWarning(true), [])
  );

  const isOwner = !!token && !!universe && !universe.is_preset;

  const restorePreset = async () => {
    if (!universe) return;
    // Duplicate the original preset fresh, then navigate to the copy
    const r = await api.post<{ id: string }>(`/universes/${universe.id}/duplicate`, {});
    navigate(`/sim/${r.id}`);
  };

  if (isLoading || showLoader) return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <video autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
        src="/Insterstellar Blackhole scene.mp4"
      />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: 28, margin: '0 0 32px', letterSpacing: 4, textTransform: 'uppercase' }}>
          {universe?.name ?? 'Loading Universe'}
        </h1>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%', background: '#88aaff',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
      `}</style>
    </div>
  );
  if (error || !universe) return <div style={{ color: '#f55', padding: 20 }}>Universe not found.</div>;

  const tabs: { key: Panel; label: string }[] = [
    { key: 'bodies', label: 'Bodies' },
    { key: 'checkpoints', label: 'Checkpoints' },
    { key: 'share', label: 'Share' },
    { key: 'settings', label: 'Settings' },
    { key: 'glossary', label: 'Glossary' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#050510', color: '#fff', overflow: 'hidden' }}>
      {/* 3D Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <SimulatorCanvas onSelectBody={selectBody} />
      </div>

      {/* Right panel */}
      <aside style={{
        width: 300, display: 'flex', flexDirection: 'column',
        background: '#0a0a1a', borderLeft: '1px solid #222', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {universe.name}
            </h1>
            <button onClick={toggleReducedDetail} style={{ fontSize: 10, padding: '2px 6px' }}
              title="Toggle render quality">
              {reducedDetail ? 'HQ' : 'LQ'}
            </button>
          </div>
          {universe.description && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#888' }}>{universe.description}</p>
          )}
        </div>

        {/* Sim controls always visible */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #222' }}>
          <SimControls universe={universe} step={step} driftWarning={driftWarning} />
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #222', flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActivePanel(t.key)}
              style={{
                flex: 1, padding: '6px 2px', fontSize: 10, borderRadius: 0,
                border: 'none', borderBottom: activePanel === t.key ? '2px solid #88f' : '2px solid transparent',
                background: 'none', color: activePanel === t.key ? '#fff' : '#666',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {activePanel === 'bodies' && (
            <>
              <BodyInspector />
              {isOwner && (
                <>
                  <button onClick={() => setShowAddBody(v => !v)} style={{ width: '100%', marginBottom: 8 }}>
                    {showAddBody ? '✕ Cancel' : '+ Add Body'}
                  </button>
                  {showAddBody && (
                    <BodyForm universeId={universe.id}
                      onSaved={() => { setShowAddBody(false); refetch(); setLoaded(false); }} />
                  )}
                </>
              )}
              <LimitationsNotice />
            </>
          )}

          {activePanel === 'checkpoints' && (
            <CheckpointPanel universe={universe} />
          )}

          {activePanel === 'share' && (
            <SharePanel universeId={universe.id} isPublic={universe.is_public} />
          )}

          {activePanel === 'settings' && isOwner && (
            <UniverseSettings universe={universe} onRestorePreset={restorePreset} />
          )}
          {activePanel === 'settings' && !isOwner && (
            <p style={{ color: '#666', fontSize: 12 }}>
              {universe.is_preset
                ? 'This is a read-only preset. Fork it to customise.'
                : 'Sign in to edit settings.'}
            </p>
          )}

          {activePanel === 'glossary' && <Glossary />}
        </div>
      </aside>
    </div>
  );
}
