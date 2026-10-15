import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import universeRoutes from './routes/universes';
import bodyRoutes from './routes/bodies';
import extraRoutes, { resolveShareToken } from './routes/extras';
import suggestionRoutes from './routes/suggestions';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/universes', universeRoutes);
app.use('/api/universes/:universeId/bodies', bodyRoutes);
app.use('/api/universes/:universeId', extraRoutes);
app.use('/api/suggestions', suggestionRoutes);

// Public share token resolution — top-level so it doesn't need universeId
app.get('/api/share/:token/resolve', (req, res) => resolveShareToken(req.params.token, res));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Generic error handler — never leak internals (NFR10)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`OrbiTaurus API running on :${PORT}`));
