import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { HomePage } from './pages/HomePage';
import { SimulatorPage } from './pages/SimulatorPage';
import { SharePage } from './pages/SharePage';

const qc = new QueryClient();

function GlobalMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    const play = () => { audio.play().catch(() => {}); window.removeEventListener('click', play); };
    window.addEventListener('click', play);
    return () => window.removeEventListener('click', play);
  }, []);

  return (
    <audio
      ref={audioRef}
      src="https://res.cloudinary.com/smomme5z/video/upload/v1792029019/Interstellar_Main_Theme_-_Extra_Extended_-_Soundtrack_by_Hans_Zimmer_320k.mp3"
      loop
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <GlobalMusic />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sim/:id" element={<SimulatorPage />} />
          <Route path="/share/:token" element={<SharePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
