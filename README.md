# SimForge AI

## Quick Start
1. `cp .env.example .env` and fill your LLAMA endpoint and key.
2. Ensure FPV Skydive is installed and 'Open using Rosetta' is checked in Finder > Get Info.
3. Run `docker compose up --build`.
4. Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard).
5. Paste the sample text below and click **Forge**:

```
Attack run on container yard. Approach from east, crosswind 10kts, 3 laps.
```

## Troubleshooting
- If FPV Skydive fails to launch, verify the application path in `gateway/main.py` and that it is set to run under Rosetta.
- For OpenGL errors, toggle the Rosetta option off and on again in the app's Get Info pane.
