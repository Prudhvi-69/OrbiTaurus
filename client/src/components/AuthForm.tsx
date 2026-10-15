import { useState, useRef } from 'react';
import { api } from '../utils/api';
import { useAuthStore } from '../store/authStore';

export function AuthForm({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showHyperspace, setShowHyperspace] = useState(false);
  const { setToken } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const authResultRef = useRef<{ token: string } | null>(null);
  const videoEndedRef = useRef(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Show hyperspace immediately — no waiting for API
    setShowHyperspace(true);
    videoRef.current?.play();

    try {
      const res = await api.post<{ token: string }>(`/auth/${mode}`, { email, password });
      authResultRef.current = res;
      // If video already ended before API returned, close now
      if (videoEndedRef.current) {
        setToken(res.token);
        onClose();
      }
    } catch (err: any) {
      // Auth failed — stop video and show error
      setShowHyperspace(false);
      videoEndedRef.current = false;
      authResultRef.current = null;
      setError(err.message);
    }
  };

  const handleVideoEnd = () => {
    videoEndedRef.current = true;
    if (authResultRef.current) {
      setToken(authResultRef.current.token);
      onClose();
    }
    // If API hasn't returned yet, we wait — video will loop briefly
  };

  return (
    <>
      {/* Hyperspace video — always in DOM, plays instantly on submit */}
      <div style={{ display: showHyperspace ? 'block' : 'none', position: 'fixed', inset: 0, zIndex: 9999, background: '#000' }}>
        <video
          ref={videoRef}
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          src="/Hyperspace Jump Login Background.mp4"
          onEnded={handleVideoEnd}
        />
      </div>

      {!showHyperspace && (
        <div style={{ background: '#111', padding: 24, borderRadius: 8, minWidth: 300, position: 'relative', overflow: 'hidden' }}>
          <video autoPlay loop muted playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, zIndex: 0, pointerEvents: 'none' }}
            src="/Solar System Background VIdeo.mp4"
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ marginTop: 0 }}>{mode === 'login' ? 'Sign In' : 'Register'}</h2>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label>Email
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </label>
              <label>Password
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
              </label>
              {error && <p role="alert" style={{ color: '#f55', margin: 0 }}>{error}</p>}
              <button type="submit">{mode === 'login' ? 'Sign In' : 'Create Account'}</button>
            </form>
            <button onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
              style={{ marginTop: 8, background: 'none', border: 'none', color: '#88f', cursor: 'pointer' }}>
              {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
