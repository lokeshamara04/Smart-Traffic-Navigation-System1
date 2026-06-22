# CityFlow — Smart Traffic Navigation System

A Google Maps–style traffic routing demo built on real Indian city coordinates. Uses **Dijkstra's algorithm** + **Yen's k-shortest-paths** on a live weighted graph, with dark/light mode, geolocation detection, two map datasets (Hyderabad city roads + Telangana/regional highways), and a live traffic simulation.

---

## Features

| Feature | Detail |
|---|---|
| **Real places** | Hyderabad (14 locations), Telangana + AP, Karnataka, Maharashtra, Chhattisgarh (12 cities) |
| **Dijkstra's algorithm** | Guaranteed shortest-cost path; cost = distance × live traffic multiplier |
| **Fastest vs Shortest** | Toggle between traffic-aware (fastest) and raw-km (shortest distance) optimisation |
| **Alternate routes** | Yen's k-shortest-paths finds 2nd and 3rd best loop-free routes |
| **Live traffic simulation** | Randomly shifts congestion every 2.5 s; route recalculates in real-time |
| **Geolocation** | "Detect my location" finds nearest mapped place across both datasets |
| **Dark / Light mode** | Full CSS-variable theming; respects system preference on load |
| **Editable map** | Add new places (double-click) or roads (connect mode) |

---

## Project structure

```
cityflow/
├── index.html       # Markup + all UI controls
├── css/
│   └── style.css    # CSS-variable dark/light theme + all components
├── js/
│   └── app.js       # Graph data, Dijkstra, Yen's, geolocation, theme, simulation
└── README.md
```

---

## Run locally

No build step needed — just open the file:

```bash
# Option A — open directly
open index.html           # macOS
start index.html          # Windows
xdg-open index.html       # Linux

# Option B — serve locally (avoids any browser file-permission quirks)
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Push to GitHub

### First time (create repo)

1. Go to [github.com/new](https://github.com/new), create a **public** repo named `cityflow-traffic-navigation` (keep "Add README" **unchecked** — you already have one).

2. Inside the `cityflow` folder, run:

```bash
git init
git add .
git commit -m "Initial commit: CityFlow traffic navigation system"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/cityflow-traffic-navigation.git
git push -u origin main
```

### Updating later

```bash
git add .
git commit -m "Your change description"
git push
```

---

## Deploy on Vercel (step-by-step)

### Method A — Vercel website (easiest, no CLI needed)

1. Push your code to GitHub (steps above).
2. Go to [vercel.com](https://vercel.com) → **Sign up / Log in** with your GitHub account.
3. Click **"Add New Project"**.
4. Under **"Import Git Repository"** you will see your GitHub repos. Click **Import** next to `cityflow-traffic-navigation`.
5. Vercel auto-detects it as a static site. Leave all settings as default.
6. Click **"Deploy"**.
7. In about 30 seconds you get a live link like `https://cityflow-traffic-navigation.vercel.app`.
8. Every future `git push` to `main` automatically redeploys.

### Method B — Vercel CLI

```bash
# Install CLI (one-time)
npm install -g vercel

# Inside the cityflow folder
vercel login          # opens browser to authenticate
vercel                # first deploy — follow prompts, choose "No" for custom settings
vercel --prod         # promote to production URL
```

---

## Deploy on GitHub Pages (alternative)

1. Push to GitHub (steps above).
2. On GitHub, go to your repo → **Settings → Pages**.
3. Under **"Build and deployment"**: Source = **Deploy from a branch**, Branch = `main`, Folder = `/ (root)`.
4. Click **Save**.
5. Your live link appears at `https://<YOUR-USERNAME>.github.io/cityflow-traffic-navigation/` within ~60 seconds.

---

## Algorithm notes

**Dijkstra's algorithm** (`dijkstra` function in `app.js`) expands the node with lowest cumulative cost first. Cost = `distance × traffic_multiplier`, where multiplier is 1.0 / 1.4 / 2.0 / 3.0 for Free flow / Moderate / Heavy / Jam. In **Shortest** mode the multiplier is ignored and raw km is used.

**Yen's k-shortest-paths** (`kPaths` function) finds alternate routes by iteratively blocking segments of already-found paths and re-running Dijkstra from each "spur" node.

**ETA** is always computed from traffic-weighted time regardless of which mode chose the path — so you can see exactly what the traffic penalty is on the shortest-distance route.

**Geolocation** uses the browser's `navigator.geolocation` API to get your GPS coordinates, then finds the nearest mapped node via haversine great-circle distance across all datasets, and auto-switches the map if needed.
