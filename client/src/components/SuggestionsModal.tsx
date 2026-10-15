import { useState } from 'react';
import { api } from '../utils/api';

export function SuggestionsModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submit = async () => {
    if (message.trim().length < 5) return;
    setStatus('sending');
    try {
      await api.post('/suggestions', { name, email, message });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000b',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      <div style={{
        background: '#0f0f1f', border: '1px solid #333', borderRadius: 12,
        padding: 28, width: 420, maxWidth: '90vw', display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>💡 Send a Suggestion</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {status === 'sent' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <p style={{ color: '#8f8', margin: 0 }}>Thanks! Your suggestion has been sent.</p>
            <button onClick={onClose} style={{ marginTop: 16 }}>Close</button>
          </div>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
              Have an idea, found a bug, or want a new simulation? Let us know!
            </p>
            <input
              placeholder="Your name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Your email (optional, for replies)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              style={inputStyle}
            />
            <textarea
              placeholder="Your suggestion or feedback..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
            {status === 'error' && (
              <p style={{ color: '#f55', margin: 0, fontSize: 12 }}>Something went wrong. Please try again.</p>
            )}
            <button
              onClick={submit}
              disabled={message.trim().length < 5 || status === 'sending'}
              style={{ opacity: message.trim().length < 5 ? 0.5 : 1 }}
            >
              {status === 'sending' ? 'Sending…' : '📨 Send Suggestion'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#1a1a2e',
  border: '1px solid #333',
  borderRadius: 6,
  color: '#fff',
  padding: '8px 10px',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
};
