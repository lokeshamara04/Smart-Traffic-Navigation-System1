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
├── index.html       
├── css/
│   └── style.css    
├── js/
│   └── app.js       
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


## Algorithm notes

**Dijkstra's algorithm** (`dijkstra` function in `app.js`) expands the node with lowest cumulative cost first. Cost = `distance × traffic_multiplier`, where multiplier is 1.0 / 1.4 / 2.0 / 3.0 for Free flow / Moderate / Heavy / Jam. In **Shortest** mode the multiplier is ignored and raw km is used.

**Yen's k-shortest-paths** (`kPaths` function) finds alternate routes by iteratively blocking segments of already-found paths and re-running Dijkstra from each "spur" node.

**ETA** is always computed from traffic-weighted time regardless of which mode chose the path — so you can see exactly what the traffic penalty is on the shortest-distance route.

**Geolocation** uses the browser's `navigator.geolocation` API to get your GPS coordinates, then finds the nearest mapped node via haversine great-circle distance across all datasets, and auto-switches the map if needed.
