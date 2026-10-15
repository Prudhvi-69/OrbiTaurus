import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SimulatorPage } from './pages/SimulatorPage';
import { SharePage } from './pages/SharePage';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sim/:id" element={<SimulatorPage />} />
          <Route path="/share/:token" element={<SharePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
