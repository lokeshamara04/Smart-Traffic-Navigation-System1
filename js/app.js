/* ============================================================
   CityFlow — Smart Traffic Navigation
   Algorithms : Dijkstra (shortest / fastest) + Yen's k-paths
   Data        : Real Google Maps coordinates for two datasets
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     DATASET DEFINITIONS
     Each node carries lat/lng (for geolocation matching) and
     x/y (projected onto the 1000×640 SVG canvas so the map
     preserves real geographic relative positions).
     Edge distances are real road distances (km) from NH data.
  ---------------------------------------------------------- */
  const DATASETS = {

    /* ---- HYDERABAD city roads ---- */
    hyderabad: {
      label: 'Hyderabad City Roads',
      badge: '14 real Hyderabad locations · 21 roads — coordinates from Google Maps',
      speedKmh: 30,          // realistic average city speed
      nodes: [
        { id: 'cm', name: 'Charminar',     x: 597, y: 324, lat: 17.3616, lng: 78.4747 },
        { id: 'hc', name: 'HITEC City',    x: 207, y: 165, lat: 17.4470, lng: 78.3778 },
        { id: 'gb', name: 'Gachibowli',    x:  90, y: 178, lat: 17.4401, lng: 78.3489 },
        { id: 'sb', name: 'Secunderabad',  x: 706, y: 190, lat: 17.4337, lng: 78.5016 },
        { id: 'hs', name: 'Hussain Sagar', x: 594, y: 208, lat: 17.4239, lng: 78.4738 },
        { id: 'bh', name: 'Banjara Hills', x: 452, y: 221, lat: 17.4169, lng: 78.4387 },
        { id: 'jh', name: 'Jubilee Hills', x: 325, y: 192, lat: 17.4326, lng: 78.4071 },
        { id: 'am', name: 'Ameerpet',      x: 491, y: 183, lat: 17.4375, lng: 78.4482 },
        { id: 'dn', name: 'Dilsukhnagar',  x: 827, y: 312, lat: 17.3685, lng: 78.5316 },
        { id: 'kp', name: 'Kukatpally',    x: 277, y:  90, lat: 17.4875, lng: 78.3953 },
        { id: 'ap', name: 'RGIA Airport',  x: 414, y: 550, lat: 17.2403, lng: 78.4294 },
        { id: 'up', name: 'Uppal',         x: 898, y: 250, lat: 17.4013, lng: 78.5492 },
        { id: 'lb', name: 'LB Nagar',      x: 910, y: 354, lat: 17.3457, lng: 78.5522 },
        { id: 'bg', name: 'Begumpet',      x: 582, y: 171, lat: 17.4442, lng: 78.4708 },
      ],
      edges: [
        /* id     from   to    dist(km) traffic(1-4) */
        { id:'e1',  a:'cm', b:'hs', dist:  8.7, traffic: 2 },
        { id:'e2',  a:'cm', b:'dn', dist:  7.6, traffic: 2 },
        { id:'e3',  a:'cm', b:'bh', dist:  9.1, traffic: 1 },
        { id:'e4',  a:'cm', b:'am', dist: 11.1, traffic: 2 },
        { id:'e5',  a:'dn', b:'lb', dist:  4.2, traffic: 1 },
        { id:'e6',  a:'lb', b:'up', dist:  7.7, traffic: 3 },
        { id:'e7',  a:'lb', b:'ap', dist: 21.9, traffic: 2 },
        { id:'e8',  a:'up', b:'sb', dist:  7.8, traffic: 1 },
        { id:'e9',  a:'sb', b:'hs', dist:  3.9, traffic: 1 },
        { id:'e10', a:'sb', b:'bg', dist:  4.3, traffic: 2 },
        { id:'e11', a:'hs', b:'bg', dist:  2.9, traffic: 1 },
        { id:'e12', a:'hs', b:'bh', dist:  4.8, traffic: 1 },
        { id:'e13', a:'bg', b:'am', dist:  3.1, traffic: 2 },
        { id:'e14', a:'am', b:'bh', dist:  3.1, traffic: 2 },
        { id:'e15', a:'am', b:'jh', dist:  5.5, traffic: 2 },
        { id:'e16', a:'am', b:'kp', dist:  9.9, traffic: 3 },
        { id:'e17', a:'bh', b:'jh', dist:  4.7, traffic: 1 },
        { id:'e18', a:'jh', b:'hc', dist:  4.4, traffic: 4 },  // peak congestion
        { id:'e19', a:'hc', b:'gb', dist:  4.0, traffic: 3 },
        { id:'e20', a:'hc', b:'kp', dist:  6.1, traffic: 1 },
        { id:'e21', a:'gb', b:'ap', dist: 29.8, traffic: 1 },  // ORR to airport
      ],
    },

    /* ---- TELANGANA + NEIGHBOURING STATES highways ---- */
    regional: {
      label: 'Telangana & Neighbouring States (National Highways)',
      badge: '12 cities · Telangana, AP, Karnataka, Maharashtra, Chhattisgarh · distances are real NH road distances',
      speedKmh: 70,          // highway average
      nodes: [
        /* Telangana */
        { id: 'hyd',  name: 'Hyderabad',    x: 290, y: 345, lat: 17.3850, lng: 78.4867 },
        { id: 'wgl',  name: 'Warangal',      x: 530, y: 300, lat: 17.9689, lng: 79.5941 },
        { id: 'krm',  name: 'Karimnagar',    x: 440, y: 245, lat: 18.4386, lng: 79.1288 },
        { id: 'nzb',  name: 'Nizamabad',     x: 180, y: 220, lat: 18.6725, lng: 78.0941 },
        { id: 'khm',  name: 'Khammam',       x: 650, y: 365, lat: 17.2473, lng: 80.1514 },
        { id: 'mbnr', name: 'Mahbubnagar',   x: 215, y: 425, lat: 16.7372, lng: 77.9842 },
        /* Andhra Pradesh */
        { id: 'vja',  name: 'Vijayawada',    x: 770, y: 410, lat: 16.5062, lng: 80.6480 },
        { id: 'krnl', name: 'Kurnool',       x: 350, y: 490, lat: 15.8281, lng: 78.0373 },
        /* Karnataka */
        { id: 'blr',  name: 'Bengaluru',     x:  90, y: 570, lat: 12.9716, lng: 77.5946 },
        /* Maharashtra */
        { id: 'ngp',  name: 'Nagpur',        x: 410, y: 120, lat: 21.1458, lng: 79.0882 },
        { id: 'sol',  name: 'Solapur',       x:  90, y: 380, lat: 17.6599, lng: 75.9064 },
        /* Chhattisgarh */
        { id: 'rpr',  name: 'Raipur',        x: 880, y: 120, lat: 21.2514, lng: 81.6296 },
      ],
      edges: [
        /* NH163: Hyderabad ↔ Warangal */
        { id: 'r1',  a: 'hyd',  b: 'wgl',  dist: 145, traffic: 2 },
        /* NH163: Warangal ↔ Karimnagar */
        { id: 'r2',  a: 'wgl',  b: 'krm',  dist:  70, traffic: 1 },
        /* NH765: Warangal ↔ Khammam */
        { id: 'r3',  a: 'wgl',  b: 'khm',  dist: 115, traffic: 2 },
        /* NH44: Hyderabad ↔ Nizamabad */
        { id: 'r4',  a: 'hyd',  b: 'nzb',  dist: 175, traffic: 2 },
        /* NH44: Nizamabad ↔ Nagpur */
        { id: 'r5',  a: 'nzb',  b: 'ngp',  dist: 290, traffic: 1 },
        /* NH65: Hyderabad ↔ Mahbubnagar */
        { id: 'r6',  a: 'hyd',  b: 'mbnr', dist: 100, traffic: 2 },
        /* NH44: Mahbubnagar ↔ Kurnool */
        { id: 'r7',  a: 'mbnr', b: 'krnl', dist: 140, traffic: 1 },
        /* NH44 / SH: Kurnool ↔ Bengaluru */
        { id: 'r8',  a: 'krnl', b: 'blr',  dist: 300, traffic: 1 },
        /* NH9: Hyderabad ↔ Solapur */
        { id: 'r9',  a: 'hyd',  b: 'sol',  dist: 335, traffic: 1 },
        /* NH167: Khammam ↔ Vijayawada */
        { id: 'r10', a: 'khm',  b: 'vja',  dist: 190, traffic: 2 },
        /* NH30: Raipur ↔ Nagpur */
        { id: 'r11', a: 'rpr',  b: 'ngp',  dist: 295, traffic: 1 },
        /* NH930: Warangal ↔ Raipur (via Khammam) */
        { id: 'r12', a: 'wgl',  b: 'rpr',  dist: 480, traffic: 1 },
        /* NH44: Hyderabad ↔ Vijayawada (direct express) */
        { id: 'r13', a: 'hyd',  b: 'vja',  dist: 275, traffic: 3 },
        /* NH150A: Karimnagar ↔ Nagpur */
        { id: 'r14', a: 'krm',  b: 'ngp',  dist: 340, traffic: 1 },
      ],
    },
  };

  /* ----------------------------------------------------------
     TRAFFIC CONSTANTS
  ---------------------------------------------------------- */
  const T_MULT  = { 1: 1.0, 2: 1.4, 3: 2.0, 4: 3.0 };
  const T_LABEL = { 1: 'Free flow', 2: 'Moderate', 3: 'Heavy', 4: 'Jam' };
  const T_VAR   = { 1: '--t1',      2: '--t2',      3: '--t3',  4: '--t4' };

  /* ----------------------------------------------------------
     MUTABLE GRAPH STATE
  ---------------------------------------------------------- */
  let nodes = [], edges = [], speedKmh = 30;
  let nextN = 1, nextE = 1;
  let currentKey = 'hyderabad';

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function nById(id) { return nodes.find(n => n.id === id); }
  function eById(id) { return edges.find(e => e.id === id); }

  /* Cost helpers — always use traffic-aware cost for ETA; route mode only
     affects which path Dijkstra picks, not how ETA is computed afterward. */
  let routeMode = 'fastest';   // 'fastest' | 'shortest'
  function timeCost(e) { return e.dist * T_MULT[e.traffic]; }   // always traffic-aware
  function pickCost(e) { return routeMode === 'shortest' ? e.dist : timeCost(e); }

  /* ----------------------------------------------------------
     DIJKSTRA'S ALGORITHM
     Returns { nodes:[], edges:[], dist } or null.
     `dist` is in pickCost() units (km or km×multiplier).
     ETA must be computed separately via timeCost.
  ---------------------------------------------------------- */
  function dijkstra(src, dst, xNodes, xEdges) {
    xNodes = xNodes || new Set();
    xEdges = xEdges || new Set();

    // build adjacency
    const adj = {};
    nodes.forEach(n => { if (!xNodes.has(n.id)) adj[n.id] = []; });
    edges.forEach(e => {
      if (xEdges.has(e.id) || xNodes.has(e.a) || xNodes.has(e.b)) return;
      const w = pickCost(e);
      if (adj[e.a]) adj[e.a].push({ to: e.b, w, eid: e.id });
      if (adj[e.b]) adj[e.b].push({ to: e.a, w, eid: e.id });
    });

    if (!(src in adj) || !(dst in adj)) return null;

    const dist = {}, prev = {}, vis = new Set();
    Object.keys(adj).forEach(id => (dist[id] = Infinity));
    dist[src] = 0;

    // Simple binary-heap-style PQ using a plain sorted array
    // (adequate for ≤ 20 nodes; scales fine for this use case)
    const pq = [[0, src]];

    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift();
      if (vis.has(u)) continue;
      vis.add(u);
      if (u === dst) break;
      for (const { to, w, eid } of adj[u]) {
        if (vis.has(to)) continue;
        const nd = d + w;
        if (nd < dist[to]) {
          dist[to] = nd;
          prev[to] = { node: u, eid };
          pq.push([nd, to]);
        }
      }
    }

    if (!isFinite(dist[dst])) return null;

    const pNodes = [dst], pEdges = [];
    let cur = dst;
    while (cur !== src) {
      const p = prev[cur];
      if (!p) return null;
      pEdges.unshift(p.eid);
      pNodes.unshift(p.node);
      cur = p.node;
    }
    return { nodes: pNodes, edges: pEdges, dist: dist[dst] };
  }

  /* ----------------------------------------------------------
     YEN'S K-SHORTEST PATHS (simplified, loop-free)
  ---------------------------------------------------------- */
  function kPaths(src, dst, K) {
    const first = dijkstra(src, dst);
    if (!first) return [];
    const A = [first], B = [];

    for (let k = 1; k < K; k++) {
      const prev = A[k - 1];
      for (let i = 0; i < prev.nodes.length - 1; i++) {
        const spur     = prev.nodes[i];
        const rootN    = prev.nodes.slice(0, i + 1);
        const rootE    = prev.edges.slice(0, i);
        const xEdges   = new Set();
        const xNodes   = new Set(rootN.slice(0, i)); // exclude root except spur

        // block edges already used by found paths that share this root
        for (const p of A) {
          if (p.nodes.length > i && samePrefix(p.nodes, rootN, i + 1)) {
            xEdges.add(p.edges[i]);
          }
        }

        const spurR = dijkstra(spur, dst, xNodes, xEdges);
        if (spurR) {
          const totalN   = rootN.slice(0, -1).concat(spurR.nodes);
          const totalE   = rootE.concat(spurR.edges);
          const rootCost = rootE.reduce((s, eid) => s + pickCost(eById(eid)), 0);
          const totalD   = rootCost + spurR.dist;
          const key      = totalN.join('-');
          if (!A.some(p => p.nodes.join('-') === key) &&
              !B.some(p => p.nodes.join('-') === key)) {
            B.push({ nodes: totalN, edges: totalE, dist: totalD });
          }
        }
      }
      if (!B.length) break;
      B.sort((a, b) => a.dist - b.dist);
      A.push(B.shift());
    }
    return A;
  }

  function samePrefix(a, b, len) {
    if (a.length < len) return false;
    for (let i = 0; i < len; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  /* Route stats helpers */
  function rawDist(route)   { return route.edges.reduce((s, eid) => s + eById(eid).dist, 0); }
  function etaMinutes(route) {
    const tc = route.edges.reduce((s, eid) => s + timeCost(eById(eid)), 0);
    return Math.round((tc / speedKmh) * 60);
  }

  /* Haversine — used for geolocation matching */
  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371, r = Math.PI / 180;
    const dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  /* ----------------------------------------------------------
     APP STATE
  ---------------------------------------------------------- */
  let startId = null, endId = null;
  let currentRoutes = [];
  let showAlts = false;
  let connectMode = false, connectFirst = null;
  let pendingCoords = null, pendingPair = null;
  let simTimer = null, simOn = false;
  let theme = 'dark';

  /* ----------------------------------------------------------
     DOM REFS
  ---------------------------------------------------------- */
  const $ = id => document.getElementById(id);
  const svg          = $('mapSvg');
  const layerEdges   = $('layerEdges');
  const layerRoute   = $('layerRoute');
  const layerNodes   = $('layerNodes');
  const selStart     = $('selStart');
  const selEnd       = $('selEnd');
  const selDataset   = $('selDataset');
  const btnFind      = $('btnFind');
  const btnAlts      = $('btnAlts');
  const btnFastest   = $('btnFastest');
  const btnShortest  = $('btnShortest');
  const btnLocate    = $('btnLocate');
  const btnSim       = $('btnSim');
  const btnConnect   = $('btnConnect');
  const btnAddCity   = $('btnAddCity');
  const btnReset     = $('btnReset');
  const btnTheme     = $('btnTheme');
  const livePill     = $('livePill');
  const liveDot      = $('liveDot');
  const liveText     = $('liveText');
  const resultsWrap  = $('resultsWrap');
  const resultsBox   = $('resultsBox');
  const toast        = $('toast');
  const mapBadge     = $('mapBadge');
  // modals
  const modalCity    = $('modalCity');
  const inpCityName  = $('inpCityName');
  const btnCityOk    = $('btnCityOk');
  const btnCityX     = $('btnCityX');
  const modalRoad    = $('modalRoad');
  const inpRoadDist  = $('inpRoadDist');
  const selRoadTrf   = $('selRoadTrf');
  const lblRoadTitle = $('lblRoadTitle');
  const btnRoadOk    = $('btnRoadOk');
  const btnRoadX     = $('btnRoadX');

  /* ----------------------------------------------------------
     TOAST
  ---------------------------------------------------------- */
  let toastT = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.className = 'map-toast show';
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* ----------------------------------------------------------
     DATASET SWITCH
  ---------------------------------------------------------- */
  function loadDataset(key, silent) {
    currentKey = key;
    const ds = DATASETS[key];
    nodes = clone(ds.nodes);
    edges = clone(ds.edges);
    speedKmh = ds.speedKmh;
    nextN = 1; nextE = edges.length + 1;
    startId = null; endId = null;
    currentRoutes = [];
    showAlts = false;
    btnAlts.classList.remove('active');
    btnAlts.textContent = 'Show alternate routes';
    connectMode = false; connectFirst = null;
    btnConnect.classList.remove('active');
    btnConnect.textContent = '⇄ Connect two places';
    stopSim();
    selDataset.value = key;
    mapBadge.textContent = ds.badge;
    renderAll();
    updatePanel();
    if (!silent) showToast(ds.label + ' loaded.');
  }

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */
  function populateSelects() {
    const sorted = nodes.slice().sort((a, b) => a.name.localeCompare(b.name));
    const opts = sorted.map(n => `<option value="${n.id}">${n.name}</option>`).join('');
    const blank = '<option value="">— choose —</option>';
    selStart.innerHTML = blank + opts;
    selEnd.innerHTML   = blank + opts;
    selStart.value = startId || '';
    selEnd.value   = endId   || '';
  }

  function svgPt(evt) {
    const p = svg.createSVGPoint();
    p.x = evt.clientX; p.y = evt.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }

  function renderEdges() {
    let h = '';
    edges.forEach(e => {
      const a = nById(e.a), b = nById(e.b);
      if (!a || !b) return;
      const cv = T_VAR[e.traffic];
      h += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
              stroke="var(${cv})" stroke-width="4" stroke-linecap="round" opacity=".88"/>
            <line data-eid="${e.id}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
              stroke="transparent" stroke-width="18" style="cursor:pointer">
              <title>${a.name} ↔ ${b.name} · ${e.dist} km · ${T_LABEL[e.traffic]}</title>
            </line>`;
    });
    layerEdges.innerHTML = h;
  }

  function renderRoute() {
    const drawOrder = [];
    if (currentRoutes[0]) drawOrder.push({ r: currentRoutes[0], col: 'var(--accent)', dash: '', animated: true });
    if (showAlts && currentRoutes[1]) drawOrder.push({ r: currentRoutes[1], col: 'var(--alt1)', dash: '4,8', animated: false });
    if (showAlts && currentRoutes[2]) drawOrder.push({ r: currentRoutes[2], col: 'var(--alt2)', dash: '4,8', animated: false });

    let h = '';
    // draw in reverse so best route renders on top
    [...drawOrder].reverse().forEach(({ r, col, dash, animated }, i) => {
      const pts = r.nodes.map(id => { const n = nById(id); return `${n.x},${n.y}`; }).join(' ');
      const pid = 'rp' + i + Date.now();
      h += `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="6"
              stroke-linecap="round" stroke-linejoin="round"
              stroke-dasharray="${dash}" filter="url(#glow)" opacity=".96"/>`;
      if (animated) {
        h += `<path id="${pid}" d="M ${pts.split(' ').join(' L ')}" fill="none" stroke="none"/>
              <circle r="7" fill="${col}" filter="url(#glow)">
                <animateMotion dur="3.8s" repeatCount="indefinite"><mpath href="#${pid}"/></animateMotion>
              </circle>`;
      }
    });
    layerRoute.innerHTML = h;
  }

  function renderNodes() {
    let h = '';
    nodes.forEach(n => {
      let stroke = 'var(--node-ring)', sw = 2, fill = 'var(--node-bg)';
      if (n.id === startId) { stroke = 'var(--t1)';     sw = 3.5; fill = 'var(--node-start)'; }
      if (n.id === endId)   { stroke = 'var(--accent)'; sw = 3.5; fill = 'var(--node-end)';   }
      if (connectMode && n.id === connectFirst) { stroke = 'var(--alt1)'; sw = 4; }
      h += `<g data-nid="${n.id}" style="cursor:pointer">
              <circle cx="${n.x}" cy="${n.y}" r="14" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
              <circle cx="${n.x}" cy="${n.y}" r="3.5" fill="${stroke}"/>
              <text x="${n.x}" y="${n.y - 20}" text-anchor="middle"
                font-family="Inter,sans-serif" font-size="12.5" font-weight="600"
                fill="var(--text)" stroke="var(--bg)" stroke-width="3" paint-order="stroke">${n.name}</text>
            </g>`;
    });
    layerNodes.innerHTML = h;
  }

  function renderAll() { renderEdges(); renderRoute(); renderNodes(); populateSelects(); }

  /* ----------------------------------------------------------
     ROUTE CALCULATION & RESULTS PANEL
  ---------------------------------------------------------- */
  function recalc(silent) {
    if (!startId || !endId || startId === endId) {
      currentRoutes = []; renderRoute(); updatePanel(); return;
    }
    const prevKey = currentRoutes[0] ? currentRoutes[0].nodes.join('-') : null;
    currentRoutes = kPaths(startId, endId, 3);
    renderRoute();
    updatePanel();

    if (!currentRoutes.length) {
      if (!silent) showToast('No route found between these two places.');
    } else if (!silent && currentRoutes[0].nodes.join('-') !== prevKey) {
      showToast('Route recalculated — traffic has changed.');
    }
  }

  function updatePanel() {
    if (!currentRoutes.length) {
      resultsWrap.style.display = (startId && endId) ? 'block' : 'none';
      resultsBox.innerHTML = (startId && endId)
        ? '<div class="empty-note">No path — these places aren\'t connected on this map.</div>' : '';
      return;
    }
    resultsWrap.style.display = 'block';
    const bestLabel = routeMode === 'shortest' ? '🔵 Shortest route' : '⚡ Fastest route';
    const labels = [bestLabel, '🟣 Alternate 1', '🟠 Alternate 2'];
    const cls    = ['', 'alt1', 'alt2'];

    let h = '';
    currentRoutes.forEach((route, i) => {
      if (i !== 0 && !showAlts) return;
      const km   = rawDist(route).toFixed(1);
      const eta  = etaMinutes(route);
      const path = route.nodes.map(id => nById(id).name).join(' → ');
      const segs = route.nodes.length - 1;
      // Show traffic-savings note for fastest mode
      let note = '';
      if (i === 0 && routeMode === 'fastest' && currentRoutes.length > 1) {
        const altKm = rawDist(currentRoutes[1]).toFixed(1);
        const altEta = etaMinutes(currentRoutes[1]);
        if (parseFloat(altKm) < parseFloat(km)) {
          note = `<div class="route-note">Alternate 1 is ${(altKm - km).toFixed(1)} km shorter but ${altEta - eta} min slower due to traffic.</div>`;
        }
      }
      h += `<div class="route-card ${cls[i]}">
              <div class="rc-head">
                <span class="rc-label">${labels[i]}</span>
                <span class="rc-eta">${eta} min</span>
              </div>
              <div class="rc-stats">${km} km · ${segs} segment${segs !== 1 ? 's' : ''}</div>
              <div class="rc-path">${path}</div>
              ${note}
            </div>`;
    });
    resultsBox.innerHTML = h;
  }

  /* ----------------------------------------------------------
     SVG INTERACTIONS
  ---------------------------------------------------------- */
  svg.addEventListener('click', evt => {
    const ng = evt.target.closest('[data-nid]');
    if (ng) { clickNode(ng.dataset.nid); return; }
    const eg = evt.target.closest('[data-eid]');
    if (eg) { clickEdge(eg.dataset.eid); }
  });

  svg.addEventListener('dblclick', evt => {
    if (evt.target.closest('[data-nid]') || evt.target.closest('[data-eid]')) return;
    const p = svgPt(evt);
    if (p.x < 20 || p.x > 980 || p.y < 20 || p.y > 620) return;
    pendingCoords = { x: Math.round(p.x), y: Math.round(p.y) };
    inpCityName.value = '';
    modalCity.classList.add('show');
    setTimeout(() => inpCityName.focus(), 60);
  });

  function clickNode(id) {
    if (connectMode) {
      if (!connectFirst) {
        connectFirst = id;
        renderNodes();
        showToast(nById(id).name + ' selected — click second place to connect.');
      } else if (connectFirst === id) {
        connectFirst = null; renderNodes();
      } else {
        if (edges.some(e => (e.a === connectFirst && e.b === id) || (e.a === id && e.b === connectFirst))) {
          showToast('A road already exists between these two places.');
          connectFirst = null; renderNodes(); return;
        }
        pendingPair = [connectFirst, id];
        lblRoadTitle.textContent = nById(connectFirst).name + ' ↔ ' + nById(id).name;
        const a = nById(connectFirst), b = nById(id);
        inpRoadDist.value = Math.max(1, Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 0.18));
        selRoadTrf.value = '2';
        modalRoad.classList.add('show');
      }
      return;
    }
    if (!startId)              { startId = id; }
    else if (!endId && id !== startId) { endId = id; }
    else                       { startId = id; endId = null; currentRoutes = []; }
    renderNodes(); populateSelects();
    if (startId && endId) recalc(false); else { renderRoute(); updatePanel(); }
  }

  function clickEdge(eid) {
    const e = eById(eid);
    if (!e) return;
    e.traffic = e.traffic >= 4 ? 1 : e.traffic + 1;
    renderEdges();
    showToast(`${nById(e.a).name} ↔ ${nById(e.b).name} → ${T_LABEL[e.traffic]}`);
    if (startId && endId) recalc(true);
  }

  /* ----------------------------------------------------------
     CONTROLS
  ---------------------------------------------------------- */
  selStart.addEventListener('change', () => {
    startId = selStart.value || null;
    if (startId === endId) endId = null;
    renderNodes();
    if (startId && endId) recalc(false); else { currentRoutes = []; renderRoute(); updatePanel(); }
  });
  selEnd.addEventListener('change', () => {
    endId = selEnd.value || null;
    if (endId === startId) startId = null;
    renderNodes();
    if (startId && endId) recalc(false); else { currentRoutes = []; renderRoute(); updatePanel(); }
  });

  btnFind.addEventListener('click', () => {
    if (!startId || !endId) { showToast('Pick a start and destination first.'); return; }
    recalc(false);
  });

  btnAlts.addEventListener('click', () => {
    showAlts = !showAlts;
    btnAlts.classList.toggle('active', showAlts);
    btnAlts.textContent = showAlts ? 'Hide alternate routes' : 'Show alternate routes';
    renderRoute(); updatePanel();
  });

  function setMode(m) {
    routeMode = m;
    btnFastest.classList.toggle('active', m === 'fastest');
    btnShortest.classList.toggle('active', m === 'shortest');
    if (startId && endId) recalc(true);
  }
  btnFastest.addEventListener('click',  () => setMode('fastest'));
  btnShortest.addEventListener('click', () => setMode('shortest'));
  setMode('fastest');

  selDataset.addEventListener('change', () => loadDataset(selDataset.value, false));

  /* -- Geolocation: find nearest node across BOTH datasets -- */
  btnLocate.addEventListener('click', () => {
    if (!navigator.geolocation) { showToast('Geolocation not supported by your browser.'); return; }
    btnLocate.textContent = '📡 Locating…';
    btnLocate.disabled = true;
    navigator.geolocation.getCurrentPosition(
      pos => {
        btnLocate.textContent = '📍 Detect my location';
        btnLocate.disabled = false;
        const { latitude: lat, longitude: lng } = pos.coords;
        let best = null;
        Object.keys(DATASETS).forEach(key => {
          DATASETS[key].nodes.forEach(n => {
            if (!n.lat) return;
            const d = haversine(lat, lng, n.lat, n.lng);
            if (!best || d < best.d) best = { key, id: n.id, name: n.name, d };
          });
        });
        if (!best) { showToast('No nearby mapped location found.'); return; }
        if (best.key !== currentKey) loadDataset(best.key, true);
        startId = best.id;
        if (endId === startId) endId = null;
        renderAll();
        if (startId && endId) recalc(false); else { renderRoute(); updatePanel(); }
        showToast(`📍 Nearest place: ${best.name} (~${best.d.toFixed(0)} km away) set as start.`);
      },
      err => {
        btnLocate.textContent = '📍 Detect my location';
        btnLocate.disabled = false;
        showToast('Location access denied. Choose your start manually.');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  });

  /* -- Simulation -- */
  function startSim() {
    simOn = true;
    btnSim.textContent = '⏸ Stop simulation';
    livePill.className = 'live-pill on';
    liveText.textContent = 'LIVE';
    simTimer = setInterval(() => {
      const sh = edges.slice().sort(() => Math.random() - .5);
      sh.slice(0, Math.max(1, Math.ceil(edges.length * .25))).forEach(e => {
        e.traffic = Math.min(4, Math.max(1, e.traffic + (Math.random() < .5 ? -1 : 1)));
      });
      renderEdges();
      if (startId && endId) recalc(true);
    }, 2500);
  }
  function stopSim() {
    simOn = false; clearInterval(simTimer);
    btnSim.textContent = '▶ Start live simulation';
    livePill.className = 'live-pill';
    liveText.textContent = 'SIM OFF';
  }
  btnSim.addEventListener('click', () => simOn ? stopSim() : startSim());

  /* -- Connect mode -- */
  btnConnect.addEventListener('click', () => {
    connectMode = !connectMode; connectFirst = null;
    btnConnect.classList.toggle('active', connectMode);
    btnConnect.textContent = connectMode ? '✕ Cancel connect' : '⇄ Connect two places';
    renderNodes();
    if (connectMode) showToast('Click two places on the map to connect them with a road.');
  });

  /* -- Add city modal -- */
  btnAddCity.addEventListener('click', () => showToast('Double-click any empty area on the map to add a new place.'));
  btnCityX.addEventListener('click', () => modalCity.classList.remove('show'));
  btnCityOk.addEventListener('click', () => {
    const name = inpCityName.value.trim();
    if (!name) { inpCityName.focus(); return; }
    nodes.push({ id: 'u' + nextN++, name, x: pendingCoords.x, y: pendingCoords.y });
    modalCity.classList.remove('show');
    renderAll(); showToast(name + ' added to the map.');
  });
  inpCityName.addEventListener('keydown', e => { if (e.key === 'Enter') btnCityOk.click(); });

  /* -- Add road modal -- */
  btnRoadX.addEventListener('click', () => { modalRoad.classList.remove('show'); connectFirst = null; renderNodes(); });
  btnRoadOk.addEventListener('click', () => {
    const dist    = Math.max(1, parseFloat(inpRoadDist.value) || 10);
    const traffic = parseInt(selRoadTrf.value, 10);
    edges.push({ id: 'ue' + nextE++, a: pendingPair[0], b: pendingPair[1], dist, traffic });
    modalRoad.classList.remove('show'); connectFirst = null;
    renderAll(); if (startId && endId) recalc(true);
    showToast('Road added.');
  });

  /* -- Reset -- */
  btnReset.addEventListener('click', () => loadDataset(currentKey, false));

  /* -- Theme toggle -- */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    btnTheme.textContent = theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode';
  }
  btnTheme.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  });

  // honour system preference on first load
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    theme = 'light';
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  applyTheme();
  loadDataset('hyderabad', true);

})();
