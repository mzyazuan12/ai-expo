# SimForge AI

## Quick Start with Webots

1. Install requirements:
   ```bash
   pip install -r backend/gateway/requirements.txt
   ```
2. Start the backend:
   ```bash
   MISSION_ID=test python -m backend.gateway.main &
   ```
3. Forge a mission:
   ```bash
   curl -X POST http://localhost:8000/forge \
      -H "Content-Type: application/json" \
      -d '{"thread_text":"Test mission","environment":"stadium"}'
   ```
4. Simulate:
   ```bash
   curl -X POST http://localhost:8000/simulate/<mission_id>
   ```
   Replace `<mission_id>` with the ID returned from the forge step.

If successful, Webots should launch, gates should be visible, and telemetry should POST to `/telemetry`.
