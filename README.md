# Three-Body Problem Simulator

This workspace contains:

- `three-body-simulator.html` — the interactive simulator UI
- `server.js` — a backend for persistence of saved presets and scenarios
- `package.json` — backend dependencies
## Website
[https://3-body-problem.vercel.app](url)

## Setup

1. Install dependencies:

```bash
cd "/Users/oliverueno/VSCode/3 Body Problem"
npm install
```

2. Start the backend server:

```bash
npm start
```

3. Open the simulator from the server:

- http://localhost:3000/three-body-simulator.html

4. Use all features freely:

- save and load named presets
- save and load scenarios
- export orbit data to JSON or CSV
- advanced analytics and downloads

## Notes

- Saved presets and scenarios are persisted for this browser via a cookie-backed server store.
- When backend persistence is unavailable, presets also save locally in the browser for fallback access.
