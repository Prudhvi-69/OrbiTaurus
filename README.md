# Orbitos — Personal Universe Simulator

An educational 3D simulator for creating simplified planetary systems. **Not a precision astrophysics engine.**

## Scientific Model & Limitations

- **Numerical method:** Velocity Verlet integration (symplectic, better energy conservation than Euler)
- **Gravitational constant:** Scaled G for educational clarity, not SI units
- **Drift:** Numerical drift accumulates over long simulations — results are approximate
- **Body count limit:** Max 20 bodies (performance constraint)
- **Timestep:** Fixed at 0.01 simulation units; smaller = more accurate but slower
- **No relativistic effects**, no tidal forces, no collision physics (bodies pass through)
- **Simulation duration:** Unbounded but UI warns after 10,000 steps

## Stack

- **Frontend:** React + TypeScript + Three.js + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & install

```bash
# Root
npm install

# Client
cd client && npm install

# Server
cd ../server && npm install
```

### 2. Environment

```bash
cp server/.env.example server/.env
# Fill in DATABASE_URL and JWT_SECRET
```

### 3. Database

```bash
cd server
npm run db:migrate
npm run db:seed
```

### 4. Run

```bash
# From root (runs both client and server)
npm run dev
```

Client: http://localhost:5173  
Server: http://localhost:3001

## Constraints

| Limit | Value |
|-------|-------|
| Max bodies per universe | 20 |
| Max universes per user | 50 |
| Max checkpoints per universe | 10 |
| Simulation speed range | 0.1× – 10× |
| Supported numeric range | 1e-6 to 1e12 |

## MVP Status

- [x] Visitor loads preset and controls simulation
- [x] User saves/reloads universe parameters
- [x] Invalid values rejected at API and UI
- [x] Share links are read-only; private universes not exposed
- [x] README documents model and limitations
