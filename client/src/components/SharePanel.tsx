import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

interface ShareLink { id: string; token: string; revoked: boolean; created_at: string; }

interface Props { universeId: string; isPublic: boolean; }

export function SharePanel({ universeId, isPublic }: Props) {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const { data: links } = useQuery<ShareLink[]>({
    queryKey: ['share-links', universeId],
    queryFn: () => api.get(`/universes/${universeId}/share`),
    enabled: isPublic,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post<{ token: string }>(`/universes/${universeId}/share`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['share-links', universeId] }),
    onError: (e: any) => setError(e.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (token: string) => api.delete(`/universes/${universeId}/share/${token}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['share-links', universeId] }),
  });

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isPublic) {
    return (
      <p style={{ fontSize: 12, color: '#888' }}>
        Set universe to <strong>Public</strong> to generate share links.
      </p>
    );
  }

  const activeLinks = links?.filter(l => !l.revoked) ?? [];

  return (
    <section aria-label="Share links" style={{ fontSize: 12 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13 }}>Share Links</h3>
      {error && <p role="alert" style={{ color: '#f55' }}>{error}</p>}
      <button onClick={() => createMutation.mutate()} style={{ marginBottom: 8 }}>
        + Generate Link
      </button>
      {activeLinks.length === 0 && <p style={{ color: '#666' }}>No active links.</p>}
      {activeLinks.map(l => (
        <div key={l.id} style={{
          background: '#111', border: '1px solid #333', borderRadius: 4,
          padding: '6px 8px', marginBottom: 6, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', gap: 6,
        }}>
          <code style={{ fontSize: 10, color: '#adf', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            /share/{l.token.slice(0, 12)}…
          </code>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button onClick={() => copyLink(l.token)} style={{ fontSize: 11 }}>
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            <button onClick={() => revokeMutation.mutate(l.token)}
              style={{ fontSize: 11, color: '#f55' }}>Revoke</button>
          </div>
        </div>
      ))}
    </section>
  );
}
