# SIMFORGE AI

Convert DroneWERX threads into VelociDrone missions in under 2 minutes. Auto-launches the simulator on macOS M1 and streams lap scores to a real-time leaderboard.

## Quick Start

1. Install VelociDrone on macOS:
   - Download from [VelociDrone website](https://www.velocidrone.com/)
   - Enable "Open using Rosetta" in Get Info
   - Select OpenGL in graphics settings

2. Clone and setup:
   ```bash
   git clone https://github.com/yourusername/simforge-ai.git
   cd simforge-ai
   cp .env.example .env
   # Edit .env with your Together AI key
   ```

3. Start the stack:
   ```bash
   docker compose up --build
   ```

4. Visit http://localhost:3000 and paste a thread ID to forge your first mission!

## M1 Rosetta Setup

1. Right-click VelociDrone.app in Applications
2. Select "Get Info"
3. Check "Open using Rosetta"
4. Launch VelociDrone
5. Go to Settings → Graphics
6. Select "OpenGL" renderer
7. Restart VelociDrone

## API Examples

Forge a mission from a thread:
```bash
curl -X POST http://localhost:8000/forge \
  -H "Content-Type: application/json" \
  -d '{"thread_text": "123", "image_url": "https://example.com/image.jpg"}'
```

Submit a lap time:
```bash
curl -X POST http://localhost:8000/telemetry \
  -H "Content-Type: application/json" \
  -d '{"mission": "simforge_20240220_123456", "pilot": "drone_master", "lap_time_sec": 45.2}'
```

## Mock API Setup

1. Install json-server:
   ```bash
   npm install -g json-server
   ```

2. Start the mock API:
   ```bash
   json-server --watch mock-data/threads.json --port 4000
   ```

## Architecture

- Backend: Python 3.12, FastAPI, MongoDB
- Frontend: Next.js 14, TypeScript, Tailwind
- Real-time: Socket.IO
- AI: Llama 3 Vision API (Together AI)
- Simulator: VelociDrone (macOS M1)

## License

MIT
