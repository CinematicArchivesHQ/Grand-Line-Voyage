/* =========================================================================
   Grand Line Voyage — One Piece (1999) completionist watchlist
   A CinematicArchivesHQ fan project. Unofficial; no video is hosted here.
   ========================================================================= */
(function () {
  "use strict";

  const M = window.OP_META;
  const RAW = window.OP_EPISODES;
  const KEY = "grandline-logbook-v1";
  const BERRY = "฿";

  /* ---------------------------------------------------------------- utils */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => Number(n).toLocaleString("en-US");
  const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const DAY = 86400000;
  const pad = (n) => String(n).padStart(2, "0");
  const dayKey = (ts) => { const d = new Date(ts); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const todayKey = () => dayKey(Date.now());
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const niceDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return MONTHS[m - 1] + " " + d + ", " + y; };
  const niceTs = (ts) => { const d = new Date(ts); return MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); };
  const bounty = (n) => BERRY + " " + fmt(n);
  const shortBounty = (n) => n >= 1e9 ? BERRY + (n / 1e9).toFixed(n % 1e9 ? 2 : 0).replace(/\.?0+$/, "") + "B" : n >= 1e6 ? BERRY + Math.round(n / 1e6) + "M" : BERRY + fmt(n);
  const hours = (mins) => { const h = Math.floor(mins / 60); return h >= 1 ? fmt(h) + "h " + (mins % 60) + "m" : mins + "m"; };
  const initials = (name) => name.replace(/\(.*?\)/g, "").split(/[\s&,.]+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("") || name[0];

  /* ------------------------------------------------------------- dataset */
  M.SEASONS.forEach((x) => { if (x.ongoing) x.end = Infinity; });
  const ART = window.OP_ART || null;
  const UPCOMING = window.OP_UPCOMING || [];
  const IMG = "https://image.tmdb.org/t/p/";
  const inR = (n, rs) => rs.some(([a, b]) => n >= a && n <= b);
  const SEASON_BY_EP = {};
  const EP = RAW.map(([n, t, d]) => {
    const type = inR(n, M.FILLER) ? "filler" : inR(n, M.MIXED) ? "mixed" : inR(n, M.RECAP) ? "recap" : "canon";
    const s = M.SEASONS.find((x) => n >= x.start && n <= x.end);
    const arc = (M.ARCS.find(([a, b]) => n >= a && n <= b) || [0, 0, s.title])[2];
    return { n, t, d, type, s: s.n, arc, year: Number(d.slice(0, 4)) };
  });
  const EPN = {};
  EP.forEach((e) => { EPN[e.n] = e; SEASON_BY_EP[e.n] = e.s; });
  const FIRST = EP[0].n, LAST = EP[EP.length - 1].n;
  const SEASON = {};
  M.SEASONS.forEach((s) => { SEASON[s.n] = s; s.eps = EP.filter((e) => e.s === s.n); s.last = s.eps.length ? s.eps[s.eps.length - 1].n : s.start; });
  const MG = window.OP_MANGA || null;
  const CH = MG ? MG.chapters.map(([n, t, v, d, eps, fx]) => ({ n, t, v, d, eps: eps || [], fx: fx || [] })).filter((c) => !c.d || c.d <= todayKey()) : [];
  const CHN = {}, EP_CH = {}, EP_FX = {};
  CH.forEach((c) => { CHN[c.n] = c; c.eps.forEach((e) => (EP_CH[e] = EP_CH[e] || []).push(c.n)); c.fx.forEach((e) => (EP_FX[e] = EP_FX[e] || []).push(c.n)); });
  const LAST_CH = CH.length ? CH[CH.length - 1].n : 0;
  const MARCS = (() => { const seen = new Set(); return Object.keys(M.MANGA).map((k) => ({ name: k, a: M.MANGA[k][0], b: M.MANGA[k][1] || Infinity })).filter((r) => { if (seen.has(r.a)) return false; seen.add(r.a); return true; }).sort((x, y) => x.a - y.a); })();
  const chArc = (n) => (MARCS.filter((r) => n >= r.a && n <= r.b).pop() || { name: "Other" }).name;
  const chRange = (list) => { if (!list.length) return null; const a = Math.min(...list), b = Math.max(...list); return a === b ? "Ch. " + a : "Ch. " + a + "–" + b; };
  const epsChapters = (eps) => { const out = []; eps.forEach((e) => (EP_CH[e.n] || []).forEach((c) => out.push(c))); return out; };
  function manga(e) {
    if (EP_CH[e.n]) { const r = chRange(EP_CH[e.n]); return { text: (EP_CH[e.n].length > 1 ? "Chapters " : "Chapter ") + r.slice(4), short: r }; }
    const one = M.ONE_TO_ONE.find((o) => e.n >= o.from);
    if (one && e.type !== "filler") return { text: "Chapter " + (e.n - one.offset), short: "Ch. " + (e.n - one.offset) };
    if (e.type === "filler") return { text: "Anime-original — not in the manga" + (M.MANGA[e.arc] ? " (set during the " + e.arc + " arc)" : ""), short: "Anime-original" };
    const r = M.MANGA[e.arc];
    if (r) return { text: e.arc + " arc · chapters " + r[0] + "–" + (r[1] || "ongoing"), short: "Ch. " + r[0] + "–" + (r[1] || "…") };
    if (M.MANGA_NOTE[e.arc]) return { text: M.MANGA_NOTE[e.arc], short: "Cover story" };
    return null;
  }
  function seasonChapters(s) {
    if (MG) { const r = chRange(epsChapters(s.eps)); return r ? r.slice(4) : null; }
    let a = Infinity, b = 0, open = false;
    s.eps.forEach((e) => { const one = M.ONE_TO_ONE.find((o) => e.n >= o.from); if (one && e.type !== "filler") { a = Math.min(a, e.n - one.offset); b = Math.max(b, e.n - one.offset); return; } const r = M.MANGA[e.arc]; if (r && e.type !== "filler") { a = Math.min(a, r[0]); if (r[1]) b = Math.max(b, r[1]); else open = true; } });
    return isFinite(a) ? a + "–" + (open && !b ? "…" : b) : null;
  }
  const stillOf = (n) => ART && ART.stills && ART.stills[n];
  const posterOf = (s) => ART && ART.posters && ART.posters[s];
  const TYPE_LABEL = { canon: "Canon", mixed: "Mixed", filler: "Filler", recap: "Recap" };
  const DEBUTS = {};
  const CHARS = M.CHARACTERS.map((c, i) => Object.assign({}, c, { i }, MG && MG.debuts && MG.debuts[c.id] && Math.abs(MG.debuts[c.id] - c.ep) <= 15 ? { ep: MG.debuts[c.id] } : {})).sort((a, b) => a.ep - b.ep || a.i - b.i);
  CHARS.forEach((c, i) => { c.order = i + 1; c.s = SEASON_BY_EP[c.ep] || 1; (DEBUTS[c.ep] = DEBUTS[c.ep] || []).push(c); });
  const PRE_GROUP = { nami: "Civilian", zoro: "Civilian", usopp: "Civilian", sanji: "Civilian", chopper: "Ally", robin: "Antagonist", franky: "Civilian", brook: "Pirate", jinbe: "Pirate" };
  const GROUP_COLOR = { "Straw Hat": "#f2b632", Pirate: "#d7263d", Marine: "#4f8cff", Ally: "#3ddc97", Antagonist: "#9b3dff", Civilian: "#c9b58b", Royalty: "#ff8fd0", Revolutionary: "#ff7a1a", "World Government": "#8fa3b8", Giant: "#7bc950", Legend: "#ffd98a" };

  /* --------------------------------------------------------------- state */
  const DEFAULT = () => ({
    v: 1, watched: {}, bulk: {}, ratings: {}, notes: {}, favs: {}, side: {}, ach: {}, read: {}, readBulk: {},
    settings: { name: "Rookie Pirate", posterPhoto: "", minutes: 24, goal: 3, spoiler: true, completion: "all", skipFiller: false, reduceMotion: false, art: true },
    created: Date.now()
  });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEFAULT();
      const d = JSON.parse(raw), def = DEFAULT();
      const out = Object.assign(def, d);
      out.settings = Object.assign(DEFAULT().settings, d.settings || {});
      ["watched", "bulk", "ratings", "notes", "favs", "side", "ach", "read", "readBulk"].forEach((k) => { if (!out[k] || typeof out[k] !== "object") out[k] = {}; });
      return out;
    } catch (e) { return DEFAULT(); }
  }
  let S = load();
  let storageOK = true;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); storageOK = true; } catch (e) { storageOK = false; } }

  const UI = { openArcs: {}, hideRead: false, chQ: "", type: "all", hideWatched: false, q: "", crewSort: "season", crewGroup: "all", crewQ: "", paceCalc: null };

  /* ------------------------------------------------------------ derived */
  const isW = (n) => !!S.watched[n];
  const counts = (e) => S.settings.completion === "canon" ? (e.type === "canon" || e.type === "mixed") : true;
  function progress(list = EP) {
    let done = 0, total = 0;
    for (const e of list) { if (!counts(e)) continue; total++; if (isW(e.n)) done++; }
    return { done, total, pct: pct(done, total) };
  }
  const watchedCount = () => Object.keys(S.watched).length;
  const maxWatched = () => { let m = 0; for (const k in S.watched) { const n = +k; if (n > m) m = n; } return m; };
  function stillOK(n) { if (!S.settings.art) return false; if (!S.settings.spoiler || isW(n)) return true; const nx = nextEp(); return !!(nx && nx.n === n); }
  function nextEp() {
    for (const e of EP) {
      if (isW(e.n)) continue;
      if (S.settings.skipFiller && (e.type === "filler" || e.type === "recap")) continue;
      if (!counts(e)) continue;
      return e;
    }
    return null;
  }
  function activity() {
    const map = {};
    for (const k in S.watched) { if (S.bulk[k]) continue; const dk = dayKey(S.watched[k]); map[dk] = (map[dk] || 0) + 1; }
    for (const k in S.side) { const v = S.side[k]; if (v && v !== true) { const dk = dayKey(v); map[dk] = (map[dk] || 0) + 1; } }
    return map;
  }
  function streaks(act) {
    const days = Object.keys(act).sort();
    let best = 0, run = 0, prev = null;
    for (const d of days) {
      const t = new Date(d + "T12:00:00").getTime();
      run = prev != null && Math.round((t - prev) / DAY) === 1 ? run + 1 : 1;
      best = Math.max(best, run); prev = t;
    }
    let cur = 0, t = new Date(todayKey() + "T12:00:00").getTime();
    if (!act[dayKey(t)]) t -= DAY;
    while (act[dayKey(t)]) { cur++; t -= DAY; }
    return { best, cur };
  }
  function pace() {
    const since = Date.now() - 30 * DAY;
    let n = 0;
    for (const k in S.watched) if (!S.bulk[k] && S.watched[k] >= since) n++;
    const p = n / 30;
    return p > 0.05 ? p : 0;
  }
  const minsPer = () => clamp(+S.settings.minutes || 24, 1, 60);

  /* ------------------------------------------------------- achievements */
  const R = (cur, max) => [Math.min(cur, max), max];
  const seasonDone = (s) => SEASON[s].eps.every((e) => isW(e.n));
  const ACH = [];
  const A = (id, name, desc, b, icon, check, hidden) => ACH.push({ id, name, desc, b, icon, check, hidden: !!hidden });
  A("first", "Romance Dawn", "Watch Episode 1.", 5e6, "⚓", () => R(isW(1) ? 1 : 0, 1));
  [[10, "Setting Sail", 1e7], [50, "East Blue Regular", 3e7], [100, "Century Voyager", 6e7], [250, "Grand Line Veteran", 1.2e8],
   [500, "Halfway to Laugh Tale?", 2.5e8], [750, "New World Navigator", 3.5e8], [1000, "One Thousand Leagues", 5e8], [1100, "Living Legend", 6e8]]
    .forEach(([n, name, b]) => A("count" + n, name, "Watch " + fmt(n) + " episodes.", b, "🧭", () => R(watchedCount(), n)));
  A("allaired", "Completionist", "Watch every aired episode of the 1999 series.", 1.5e9, "👑", () => R(watchedCount(), EP.length));
  M.SEASONS.forEach((s) => A("season" + s.n, "Conquered: " + s.short, "Finish Season " + s.n + " — " + s.title + (s.ongoing ? " (as aired so far)" : "") + ".",
    Math.round((2e7 + s.eps.length * 1.2e6) / 1e6) * 1e6, "🏝️", () => R(s.eps.filter((e) => isW(e.n)).length, s.eps.length)));
  A("ep1000", "The Big One-Oh-Oh-Oh", "Watch Episode 1000.", 1e8, "🎉", () => R(isW(1000) ? 1 : 0, 1));
  const typeCount = (t) => EP.filter((e) => e.type === t);
  A("filler10", "Side Quest Enjoyer", "Watch 10 filler episodes.", 1e7, "🍙", () => R(typeCount("filler").filter((e) => isW(e.n)).length, 10));
  A("fillerall", "Filler Connoisseur", "Watch every filler episode. Respect.", 2e8, "🍖", () => { const f = typeCount("filler"); return R(f.filter((e) => isW(e.n)).length, f.length); });
  A("canonall", "Purist's Path", "Watch every canon and mixed episode.", 4e8, "📜", () => { const f = EP.filter((e) => e.type === "canon" || e.type === "mixed"); return R(f.filter((e) => isW(e.n)).length, f.length); });
  A("streak3", "Steady Winds", "Log episodes 3 days in a row.", 1e7, "🌊", (c) => R(c.streak.best, 3));
  A("streak7", "Trade Winds", "Log episodes 7 days in a row.", 3e7, "🌬️", (c) => R(c.streak.best, 7));
  A("streak30", "Calm Belt? Never Heard of It", "Log episodes 30 days in a row.", 1.5e8, '<img class="ui-sprite pixel-sprite" src="assets/pixel-going-merry.png" width="24" height="24" alt="">', (c) => R(c.streak.best, 30));
  A("binge10", "Gear Second", "Log 10 episodes in a single day.", 4e7, "💨", (c) => R(c.maxDay, 10));
  A("binge25", "Gear Fourth", "Log 25 episodes in a single day. Please drink water.", 1e8, "💥", (c) => R(c.maxDay, 25));
  A("night", "Night Watch", "Log an episode between midnight and 4 AM.", 1.5e7, "🌙", (c) => R(c.night ? 1 : 0, 1));
  A("rate10", "Food Critic", "Rate 10 episodes.", 1e7, "⭐", () => R(Object.keys(S.ratings).length, 10));
  A("rate100", "Michelin Inspector", "Rate 100 episodes.", 8e7, "🌟", () => R(Object.keys(S.ratings).length, 100));
  A("notes5", "Log Keeper", "Write notes on 5 episodes.", 1e7, "🪶", () => R(Object.values(S.notes).filter((v) => v && v.trim()).length, 5));
  A("favs10", "Treasure Hoarder", "Favorite 10 episodes.", 1e7, '<img class="ui-sprite pixel-sprite" src="assets/pixel-doubloon.png" width="24" height="24" alt="">', () => R(Object.keys(S.favs).length, 10));
  A("merry", "Thank You", "Reach Episode 312.", 7e7, "🐑", () => R(isW(312) ? 1 : 0, 1), true);
  A("timeskip", "Two Years Later", "Reach the second half of the story (Episode 517).", 1.5e8, "⏳", () => R(isW(517) ? 1 : 0, 1), true);
  M.CREW_JOINS.slice(1).forEach((c, i) => A("crew-" + c.id, "Nakama: " + c.role, c.name + " officially joins the crew.", 2e7 + i * 1e7, "🏴", () => R(isW(c.ep) ? 1 : 0, 1), true));
  A("caughtup", "Caught Up!", "Watch the most recent aired episode.", 2e8, "📡", () => R(isW(LAST) ? 1 : 0, 1));
  A("la1", "Live Action Debut", "Finish Season 1 of the Netflix live-action series.", 3e7, "🎬", () => R(sideCount("la1"), 8));
  A("la2", "Into the Grand Line (Live)", "Finish Season 2 of the Netflix live-action series.", 3e7, "🎥", () => R(sideCount("la2"), 8));
  const readCount = () => Object.keys(S.read).length;
  A("read1", "Romance Dawn (Manga)", "Read Chapter 1 of the manga.", 5e6, "📖", () => R(S.read[1] ? 1 : 0, 1));
  [[100, "Bookworm", 5e7], [500, "Scholar of Ohara", 2e8], [1000, "Poneglyph Reader", 5e8]].forEach(([n, name, b]) =>
    A("read" + n, name, "Read " + fmt(n) + " manga chapters.", b, "📚", () => R(readCount(), n)));
  A("readall", "Caught Up (Manga)", "Read every released chapter.", 1e9, "🗞️", () => R(readCount(), LAST_CH || 1));
  A("films", "Movie Night", "Watch all 15 animated films.", 1.2e8, "🍿", () => R(sideCount("films"), 15));
  function sideCount(gid) { return Object.keys(S.side).filter((k) => k.startsWith(gid + ":") && S.side[k]).length; }

  function achContext() {
    const act = activity();
    let maxDay = 0; for (const k in act) maxDay = Math.max(maxDay, act[k]);
    let night = false;
    for (const k in S.watched) { if (S.bulk[k]) continue; const h = new Date(S.watched[k]).getHours(); if (h < 4) { night = true; break; } }
    return { act, maxDay, night, streak: streaks(act) };
  }
  function evalAch() {
    const ctx = achContext();
    return ACH.map((a) => { const [cur, max] = a.check(ctx); return Object.assign({}, a, { cur, max, done: cur >= max, at: S.ach[a.id] }); });
  }
  function checkAch(silent) {
    const res = evalAch();
    let changed = false;
    res.forEach((a) => {
      if (a.done && !S.ach[a.id]) { S.ach[a.id] = Date.now(); changed = true; if (!silent) toastAch(a); }
      if (!a.done && S.ach[a.id]) { delete S.ach[a.id]; changed = true; }
    });
    if (changed) save();
    return res;
  }
  const totalBounty = () => ACH.reduce((s, a) => s + (S.ach[a.id] ? a.b : 0), 0);
  function rankFor(b) {
    if (b >= 4e9) return "King of the Pirates";
    if (b >= 2e9) return "Emperor of the Sea";
    if (b >= 8e8) return "Warlord of the Sea";
    if (b >= 2e8) return "Worst Generation";
    if (b >= 5e7) return "Supernova";
    if (b > 0) return "Rookie";
    return "Stowaway";
  }

  /* -------------------------------------------------------------- actions */
  function setWatched(n, val, opts = {}) {
    if (val) { S.watched[n] = opts.ts || Date.now(); if (opts.bulk) S.bulk[n] = 1; else delete S.bulk[n]; }
    else { delete S.watched[n]; delete S.bulk[n]; }
  }
  function toggle(n) { setWatched(n, !isW(n)); commit(); }
  function markRange(a, b, val) {
    const ts = Date.now();
    EP.forEach((e) => { if (e.n >= a && e.n <= b) { if (val) { if (!isW(e.n)) setWatched(e.n, true, { ts, bulk: true }); } else setWatched(e.n, false); } });
    commit();
  }
  function commit(silent) { save(); checkAch(silent); rerender(); }

  /* ---------------------------------------------------------------- toast */
  function toast(html, cls = "") {
    const box = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast " + cls;
    el.innerHTML = html;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add("in"));
    setTimeout(() => { el.classList.remove("in"); setTimeout(() => el.remove(), 400); }, cls.includes("ach") ? 5200 : 2600);
  }
  function toastAch(a) {
    toast('<div class="t-wanted">NEW BOUNTY</div><div class="t-ico">' + a.icon + '</div><div><b>' + esc(a.name) + "</b><br><span>+" + bounty(a.b) + "</span></div>", "ach");
  }

  /* ------------------------------------------------------------- routing */
  const ROUTES = ["voyage", "log", "manga", "crew", "bounties", "stats", "side", "helm"];
  function route() {
    const h = (location.hash || "#voyage").slice(1).split("/");
    return { view: ROUTES.includes(h[0]) ? h[0] : "voyage", arg: h[1] ? decodeURIComponent(h[1]) : null };
  }
  function rerender() {
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
    if ($("#modal").classList.contains("open") && $("#modal").dataset.ep) openEp(+$("#modal").dataset.ep, true);
    else if ($("#modal").classList.contains("open") && $("#modal").dataset.ch) openCh(+$("#modal").dataset.ch, true);
  }
  function render() {
    const r = route();
    $$(".nav a").forEach((a) => a.classList.toggle("active", a.dataset.view === r.view));
    const main = $("#main");
    const views = { voyage: vVoyage, log: vLog, manga: vManga, crew: vCrew, bounties: vBounties, stats: vStats, side: vSide, helm: vSettings };
    main.innerHTML = views[r.view](r.arg);
    main.dataset.view = r.view;
    const p = progress();
    $("#hdrProgress").style.width = p.pct + "%";
    $("#hdrPct").textContent = p.pct + "%";
    if (r.view === "log" && UI.q) { const i = $("#logSearch"); if (i && document.activeElement !== i && UI._focusSearch) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
  }

  /* ------------------------------------------------------------- pieces */
  const badge = (t) => '<span class="badge b-' + t + '">' + TYPE_LABEL[t] + "</span>";
  const ring = (p, size = 64, stroke = 6, color = "var(--gold)") => {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    return '<svg class="ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '" aria-hidden="true"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="' + stroke + '"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + (c * p / 100) + " " + c + '" transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')"/></svg>';
  };
  const bar = (p, color) => '<div class="bar"><span style="width:' + clamp(p, 0, 100) + "%" + (color ? ";background:" + color : "") + '"></span></div>';
  const ago = (iso) => { const y = new Date().getFullYear() - Number(iso.slice(0, 4)); return y <= 0 ? "this year" : y === 1 ? "1 year ago" : y + " years ago"; };

  function epRow(e) {
    const w = isW(e.n), hl = M.HIGHLIGHTS[e.n];
    return '<div class="ep-row t-' + e.type + (w ? " is-w" : "") + '" data-ep="' + e.n + '">' +
      '<button class="chk" data-act="toggle" data-ep="' + e.n + '" aria-pressed="' + w + '" aria-label="' + (w ? "Unmark" : "Mark") + " episode " + e.n + ' watched"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></button>' +
      '<span class="ep-num">' + e.n + "</span>" +
      '<button class="ep-title" data-act="open" data-ep="' + e.n + '">' + esc(e.t) + (hl ? ' <span class="hl" title="' + esc(hl) + '">✦</span>' : "") + (S.notes[e.n] ? ' <span class="has-note" title="Has notes">✎</span>' : "") + "</button>" +
      '<span class="ep-date">' + niceDate(e.d) + "</span>" + badge(e.type) +
      '<button class="fav' + (S.favs[e.n] ? " on" : "") + '" data-act="fav" data-ep="' + e.n + '" aria-label="Favorite">' + (S.favs[e.n] ? "★" : "☆") + "</button></div>";
  }

  /* -------------------------------------------------------------- VOYAGE */
  function vVoyage() {
    const p = progress(), nx = nextEp(), mp = minsPer();
    const remaining = p.total - p.done;
    const pc = pace(), goal = +S.settings.goal || 3;
    const rate = pc || goal;
    const eta = remaining ? new Date(Date.now() + Math.ceil(remaining / rate) * DAY) : null;
    const act = activity(), st = streaks(act);
    let hero;
    if (nx) {
      const s = SEASON[nx.s], hl = M.HIGHLIGHTS[nx.n];
      hero = '<section class="hero card' + (stillOf(nx.n) && stillOK(nx.n) ? " has-still" : "") + '" style="--accent:' + s.color + '">' +
        '<div class="hero-kicker">Next on the voyage</div>' +
        '<div class="hero-ep">Episode ' + nx.n + "</div>" +
        '<h1 class="hero-title">' + esc(nx.t) + "</h1>" +
        '<div class="hero-meta"><span>Season ' + s.n + " · " + esc(s.title) + "</span><span>" + esc(nx.arc) + " arc</span><span>Aired " + niceDate(nx.d) + "</span>" + badge(nx.type) + "</div>" +
        (hl ? '<div class="hero-hl">✦ ' + esc(hl) + "</div>" : "") +
        (manga(nx) ? '<div class="hero-manga">📖 ' + esc(manga(nx).text) + "</div>" : "") +
        (stillOf(nx.n) && stillOK(nx.n) ? '<img onerror="this.remove()" class="hero-still" src="' + IMG + "w500" + stillOf(nx.n) + '" alt="" loading="lazy">' : "") +
        '<div class="hero-actions"><button class="btn primary" data-act="toggle" data-ep="' + nx.n + '">Mark watched</button><button class="btn" data-act="open" data-ep="' + nx.n + '">Details</button><a class="btn ghost" href="#log/' + s.n + '">Open Season ' + s.n + "</a></div>" +
        '<div class="queue"><div class="queue-h">Then…</div>' + EP.filter((e) => e.n > nx.n && !isW(e.n) && counts(e) && !(S.settings.skipFiller && (e.type === "filler" || e.type === "recap"))).slice(0, 4).map((e) =>
          '<button class="q-item" data-act="open" data-ep="' + e.n + '"><b>' + e.n + "</b><span>" + esc(e.t) + "</span>" + badge(e.type) + "</button>").join("") + "</div>" + watchLinks() + "</section>";
    } else {
      hero = '<section class="hero card done"><div class="hero-kicker">You\'ve caught up</div><h1 class="hero-title">The horizon awaits.</h1><p class="muted">You have logged every aired episode' + (S.settings.completion === "canon" ? " in canon mode" : "") + '. ' + (UPCOMING.length ? "Next up: episode " + UPCOMING[0][0] + " on " + niceDate(UPCOMING[0][2]) + "." : "The anime returns in 2027; new episodes are added automatically as they air.") + '</p><div class="hero-actions"><a class="btn primary" href="#bounties">See your bounty</a><a class="btn" href="#side">Side voyages</a></div></section>';
    }

    const tiles = [
      ["Complete", p.pct + "%", fmt(p.done) + " / " + fmt(p.total) + " episodes"],
      ["Hours at sea", hours(watchedCount() * mp), "≈ " + mp + " min per episode"],
      ["Left to sail", hours(remaining * mp), fmt(remaining) + " episodes"],
      ["Landfall ETA", eta ? MONTHS[eta.getMonth()] + " " + eta.getFullYear() : "—", eta ? "at " + (Math.round(rate * 10) / 10) + " eps/day " + (pc ? "(your 30-day pace)" : "(your goal)") : "nothing left!"],
      ["Streak", st.cur + (st.cur === 1 ? " day" : " days"), "best: " + st.best],
      ["Bounty", shortBounty(totalBounty()), rankFor(totalBounty())]
    ].map(([k, v, s]) => '<div class="tile"><div class="tile-k">' + k + '</div><div class="tile-v">' + v + '</div><div class="tile-s">' + s + "</div></div>").join("");

    const recent = Object.keys(S.watched).filter((k) => !S.bulk[k]).sort((a, b) => S.watched[b] - S.watched[a]).slice(0, 6).map((k) => EPN[k]).filter(Boolean);
    const md = todayKey().slice(5);
    const onThisDay = EP.filter((e) => e.d.slice(5) === md);
    const achs = Object.keys(S.ach).sort((a, b) => S.ach[b] - S.ach[a]).slice(0, 3).map((id) => ACH.find((a) => a.id === id)).filter(Boolean);

    return '<div class="voyage">' + hero +
      '<section class="tiles">' + tiles + "</section>" +
      horizon() +
      '<section class="card map-card"><div class="card-h"><h2>The Route</h2><span class="muted">22 seasons · tap an island</span></div>' + routeMap() + "</section>" +
      '<div class="cols">' +
      '<section class="card"><div class="card-h"><h2>Recently logged</h2></div>' + (recent.length ? '<div class="mini-list">' + recent.map((e) =>
        '<button class="mini" data-act="open" data-ep="' + e.n + '"><b>' + e.n + "</b><span>" + esc(e.t) + "</span><em>" + niceTs(S.watched[e.n]) + "</em></button>").join("") + "</div>" : '<p class="muted">Nothing logged yet. Mark your first episode above — or use <a href="#helm">Quick Start</a> if you\'re already partway through.</p>') + "</section>" +
      '<section class="card"><div class="card-h"><h2>On this day</h2><span class="muted">' + MONTHS[new Date().getMonth()] + " " + new Date().getDate() + "</span></div>" + (onThisDay.length ? '<div class="mini-list">' + onThisDay.map((e) =>
        '<button class="mini" data-act="open" data-ep="' + e.n + '"><b>' + e.n + "</b><span>" + (S.settings.spoiler && e.n > maxWatched() + 1 ? '<i class="muted">Title hidden (spoiler shield)</i>' : esc(e.t)) + "</span><em>" + e.year + " · " + ago(e.d) + "</em></button>").join("") + "</div>" : '<p class="muted">No episodes premiered on this date. Quiet seas.</p>') + "</section>" +
      '<section class="card"><div class="card-h"><h2>Latest bounties</h2><a href="#bounties" class="muted">All →</a></div>' + (achs.length ? achs.map((a) => '<div class="ach-mini"><span>' + a.icon + "</span><div><b>" + esc(a.name) + "</b><br><em>+" + bounty(a.b) + "</em></div></div>").join("") : '<p class="muted">No bounties yet. The Marines haven\'t heard of you… yet.</p>') + "</section>" +
      "</div></div>";
  }

  function watchLinks() {
    return '<div class="watch"><span class="watch-h">Where to watch</span>' + M.STREAMING.map((x) => '<a class="watch-a" href="' + x.url + '" target="_blank" rel="noopener" title="' + esc(x.note) + '">' + esc(x.name) + " ↗</a>").join("") + "</div>";
  }
  function horizon() {
    if (!UPCOMING.length) return "";
    return '<section class="card horizon"><div class="card-h"><h2>On the horizon</h2><span class="muted">announced episodes · updated automatically</span></div><div class="mini-list">' +
      UPCOMING.slice(0, 6).map(([n, t, d]) => '<div class="mini"><b>' + n + "</b><span>" + (S.settings.spoiler ? '<i class="muted">Title hidden until it airs</i>' : esc(t)) + "</span><em>Airs " + niceDate(d) + "</em></div>").join("") + "</div></section>";
  }
  function routeMap() {
    const n = M.SEASONS.length, gap = 92, W = n * gap + 40, H = 170;
    const nx = nextEp(), cur = nx ? nx.s : n;
    const pts = M.SEASONS.map((s, i) => [30 + i * gap + 20, 85 + Math.sin(i * 1.15) * 38]);
    let d = "M" + pts[0][0] + " " + pts[0][1];
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; d += " C" + (x0 + gap / 2) + " " + y0 + "," + (x1 - gap / 2) + " " + y1 + "," + x1 + " " + y1; }
    let svg = '<div class="map-scroll"><svg class="routemap" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Voyage map of 22 seasons">';
    svg += '<path d="' + d + '" fill="none" stroke="rgba(242,182,50,.35)" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>';
    M.SEASONS.forEach((s, i) => {
      const [x, y] = pts[i], pr = progress(s.eps), done = pr.pct >= 100;
      const r = 20, c = 2 * Math.PI * (r + 5);
      svg += '<a href="#log/' + s.n + '" class="isle' + (done ? " done" : "") + (s.n === cur ? " cur" : "") + '"><title>Season ' + s.n + ": " + esc(s.title) + " — " + pr.pct + "%</title>" +
        '<ellipse cx="' + x + '" cy="' + (y + 16) + '" rx="30" ry="7" fill="rgba(255,255,255,.06)"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 5) + '" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 5) + '" fill="none" stroke="' + s.color + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (c * pr.pct / 100) + " " + c + '" transform="rotate(-90 ' + x + " " + y + ')"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (done ? s.color : "#0e2c4d") + '" stroke="' + s.color + '" stroke-width="1.5"/>' +
        '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" class="isle-n" fill="' + (done ? "#06182b" : "#e9eef5") + '">' + s.n + "</text>" +
        '<text x="' + x + '" y="' + (y + 44) + '" text-anchor="middle" class="isle-l">' + esc(s.short) + "</text></a>";
    });
    const [sx, sy] = pts[cur - 1];
    svg += '<g transform="translate(' + (sx - 20) + "," + (sy - 55) + ')"><g class="map-ship">' +
      '<image class="pixel-sprite" href="assets/pixel-going-merry.png" width="40" height="40"/></g></g>';
    return svg + "</svg></div>";
  }

  /* ----------------------------------------------------------------- LOG */
  function vLog(arg) {
    if (arg && SEASON[arg]) return vSeason(+arg);
    const q = UI.q.trim().toLowerCase();
    let results = "";
    if (q) {
      const num = /^\d+$/.test(q) ? +q : null;
      const hits = EP.filter((e) => (num != null ? String(e.n).startsWith(q) : (e.t.toLowerCase().includes(q) || e.arc.toLowerCase().includes(q)))).filter(passFilter).slice(0, 80);
      results = '<section class="card"><div class="card-h"><h2>Search results</h2><span class="muted">' + hits.length + (hits.length === 80 ? "+" : "") + " found</span></div>" + (hits.length ? '<div class="ep-list">' + hits.map(epRow).join("") + "</div>" : '<p class="muted">No episodes match “' + esc(UI.q) + "”.</p>") + "</section>";
    }
    const grid = M.SEASONS.map((s) => {
      const pr = progress(s.eps), types = { canon: 0, mixed: 0, filler: 0, recap: 0 };
      s.eps.forEach((e) => types[e.type]++);
      return '<a class="season-card' + (pr.pct >= 100 ? " done" : "") + '" href="#log/' + s.n + '" style="--accent:' + s.color + '">' +
        (posterOf(s.n) && S.settings.art ? '<img onerror="this.remove()" class="sc-poster" src="' + IMG + "w185" + posterOf(s.n) + '" alt="" loading="lazy">' : "") +
        '<div class="sc-top"><span class="sc-num">' + pad(s.n) + "</span>" + ring(pr.pct, 54, 5, s.color) + '<span class="sc-pct">' + Math.round(pr.pct) + "%</span></div>" +
        '<div class="sc-title">' + esc(s.title) + "</div>" +
        '<div class="sc-meta">Episodes ' + s.start + "–" + s.last + (s.ongoing ? "+" : "") + " · " + s.years + (seasonChapters(s) ? " · Ch. " + seasonChapters(s) : "") + "</div>" +
        '<div class="sc-types">' + Object.keys(types).filter((t) => types[t]).map((t) => '<i class="dot d-' + t + '"></i>' + types[t] + " " + t).join(" ") + "</div>" +
        '<div class="sc-foot">' + pr.done + " / " + pr.total + " watched" + (s.ongoing ? ' <span class="live">● Ongoing</span>' : "") + "</div></a>";
    }).join("");
    return '<div class="page-h"><h1>The Logbook</h1><p class="muted">All ' + EP.length + " episodes, Oct 20, 1999 → " + niceDate(EPN[LAST].d) + ". Twenty-two seasons, each named for its main arc.</p></div>" +
      filterBar(true) + results + '<div class="season-grid">' + grid + "</div>";
  }
  function filterBar(withSearch) {
    const chips = ["all", "canon", "mixed", "filler", "recap"].map((t) => '<button class="chip' + (UI.type === t ? " on" : "") + '" data-act="ftype" data-v="' + t + '">' + (t === "all" ? "All" : TYPE_LABEL[t]) + "</button>").join("");
    return '<div class="filterbar">' + (withSearch ? '<input id="logSearch" class="search" type="search" placeholder="Search titles, arcs or an episode number…" value="' + esc(UI.q) + '" aria-label="Search episodes">' : "") +
      '<div class="chips">' + chips + '<label class="tog"><input type="checkbox" data-act="hidew"' + (UI.hideWatched ? " checked" : "") + "> Hide watched</label></div></div>";
  }
  const passFilter = (e) => (UI.type === "all" || e.type === UI.type) && !(UI.hideWatched && isW(e.n));

  function vSeason(n) {
    const s = SEASON[n], pr = progress(s.eps), mp = minsPer();
    const groups = [];
    s.eps.forEach((e) => { const g = groups[groups.length - 1]; if (g && g.arc === e.arc) g.eps.push(e); else groups.push({ arc: e.arc, eps: [e] }); });
    const types = { canon: 0, mixed: 0, filler: 0, recap: 0 };
    s.eps.forEach((e) => types[e.type]++);
    const debuts = CHARS.filter((c) => c.s === n);
    const shown = debuts.filter((c) => !locked(c)).length;
    const body = groups.map((g) => {
      const vis = g.eps.filter(passFilter);
      if (!vis.length) return "";
      const gp = progress(g.eps), a = g.eps[0].n, b = g.eps[g.eps.length - 1].n;
      return '<section class="arc"><div class="arc-h"><div><h3>' + esc(g.arc) + '</h3><span class="muted">Episodes ' + a + (a !== b ? "–" + b : "") + " · " + g.eps.length + " ep" + (g.eps.length > 1 ? "s" : "") + (MG ? (chRange(epsChapters(g.eps)) ? " · 📖 " + chRange(epsChapters(g.eps)) : " · Anime-original") : manga(g.eps[0]) ? " · 📖 " + esc(manga(g.eps[0]).short) : "") + "</span></div>" +
        '<div class="arc-tools">' + bar(gp.pct, s.color) + '<span class="muted">' + gp.done + "/" + gp.total + '</span><button class="btn sm" data-act="range" data-a="' + a + '" data-b="' + b + '" data-v="' + (gp.pct >= 100 ? 0 : 1) + '">' + (gp.pct >= 100 ? "Clear arc" : "Mark arc") + "</button></div></div>" +
        '<div class="ep-list">' + vis.map(epRow).join("") + "</div></section>";
    }).join("");
    return '<div class="season-view" style="--accent:' + s.color + '">' +
      '<div class="crumbs"><a href="#log">← All seasons</a></div>' +
      '<header class="season-h card"><div class="sh-l"><div class="sh-kicker">Season ' + n + " · " + s.years + (s.ongoing ? ' · <span class="live">● Ongoing</span>' : "") + "</div><h1>" + esc(s.title) + '</h1><p class="sh-blurb">' + esc(s.blurb) + "</p>" +
      '<div class="sh-stats"><span><b>' + s.eps.length + "</b> episodes</span><span><b>" + s.start + "–" + s.last + "</b></span>" + (seasonChapters(s) ? "<span>📖 Manga ch. <b>" + seasonChapters(s) + "</b></span>" : "") + "<span><b>" + hours(s.eps.length * mp) + "</b> runtime</span>" +
      Object.keys(types).filter((t) => types[t]).map((t) => '<span><i class="dot d-' + t + '"></i><b>' + types[t] + "</b> " + t + "</span>").join("") + "</div>" +
      '<div class="sh-actions"><button class="btn primary" data-act="range" data-a="' + s.start + '" data-b="' + s.end + '" data-v="' + (pr.pct >= 100 ? 0 : 1) + '">' + (pr.pct >= 100 ? "Clear season" : "Mark season watched") + '</button><a class="btn ghost" href="#crew">' + shown + "/" + debuts.length + " characters introduced →</a></div>" + watchLinks() + "</div>" +
      (posterOf(n) && S.settings.art ? '<img onerror="this.remove()" class="sh-poster" src="' + IMG + "w342" + posterOf(n) + '" alt="Season ' + n + ' artwork" loading="lazy">' : "") +
      '<div class="sh-r">' + ring(pr.pct, 132, 10, s.color) + '<div class="sh-pct"><b>' + Math.round(pr.pct) + "%</b><span>" + pr.done + " / " + pr.total + "</span></div></div></header>" +
      filterBar(false) + (body || '<p class="muted center">Nothing matches the current filters.</p>') +
      '<div class="season-nav">' + (n > 1 ? '<a class="btn" href="#log/' + (n - 1) + '">← Season ' + (n - 1) + "</a>" : "<span></span>") + (n < 22 ? '<a class="btn" href="#log/' + (n + 1) + '">Season ' + (n + 1) + " →</a>" : "") + "</div></div>";
  }

  /* --------------------------------------------------------------- MODAL */
  function openEp(n, keep) {
    const e = EPN[n]; if (!e) return;
    const s = SEASON[e.s], w = isW(n), r = S.ratings[n] || 0, hl = M.HIGHLIGHTS[n];
    const deb = (DEBUTS[n] || []);
    const modal = $("#modal");
    modal.dataset.ep = n;
    const stars = [1, 2, 3, 4, 5].map((i) => '<button class="star' + (i <= r ? " on" : "") + '" data-act="rate" data-ep="' + n + '" data-v="' + i + '" aria-label="Rate ' + i + '">★</button>').join("");
    const st = stillOf(n) && stillOK(n) ? '<img onerror="this.remove()" class="m-still" src="' + IMG + "w780" + stillOf(n) + '" alt="">' : "";
    const ov = ART && ART.ov && ART.ov[n];
    const mg = manga(e);
    $("#modalBody").innerHTML = st +
      '<div class="m-head" style="--accent:' + s.color + '"><div class="m-kicker">Season ' + s.n + " · " + esc(s.title) + " · " + esc(e.arc) + '</div><div class="m-num">Episode ' + n + "</div><h2>" + esc(e.t) + "</h2>" +
      '<div class="m-meta">' + badge(e.type) + "<span>Aired " + niceDate(e.d) + " (" + ago(e.d) + ")</span><span>≈ " + minsPer() + " min</span></div></div>" +
      (hl ? '<div class="m-hl">✦ ' + esc(hl) + "</div>" : "") +
      (e.type === "filler" ? '<p class="m-note">Anime-original filler — skippable without missing the main story, though some are genuinely fun.</p>' : e.type === "mixed" ? '<p class="m-note">Mixed — mostly canon with some anime-original padding.</p>' : e.type === "recap" ? '<p class="m-note">Recap / retrospective episode.</p>' : "") +
      '<div class="m-actions"><button class="btn ' + (w ? "" : "primary") + '" data-act="toggle" data-ep="' + n + '">' + (w ? "✓ Watched — undo" : "Mark watched") + '</button><button class="btn" data-act="upto" data-ep="' + n + '">Mark all up to here</button><button class="btn ghost fav' + (S.favs[n] ? " on" : "") + '" data-act="fav" data-ep="' + n + '">' + (S.favs[n] ? "★ Favorite" : "☆ Favorite") + "</button></div>" +
      (w ? '<div class="m-when"><label for="watchDate">Watched on</label><input type="date" id="watchDate" data-ep="' + n + '" value="' + dayKey(S.watched[n]) + '" min="' + e.d + '" max="' + todayKey() + '">' +
        (S.bulk[n] ? '<span class="muted">Bulk-marked — set the real date and it will count toward your streaks and activity.</span>' : '<span class="muted">Change it if you watched this on another day.</span>') + "</div>" : "") +
      (EP_CH[n] ? '<div class="m-sec"><div class="m-lbl">Adapts manga</div><div class="m-chs">' + EP_CH[n].map((c) => '<button class="chip-ch' + (S.read[c] ? " on" : "") + '" data-act="opench" data-ch="' + c + '"><b>Ch. ' + c + "</b>" + esc(CHN[c].t) + "</button>").join("") + "</div>" +
        (EP_FX[n] ? '<div class="small muted" style="margin-top:6px">Also revisits (flashback/recap): ' + EP_FX[n].map((c) => '<button class="link" data-act="opench" data-ch="' + c + '">Ch. ' + c + "</button>").join(", ") + "</div>" : "") + "</div>"
        : mg ? '<div class="m-sec"><div class="m-lbl">Manga</div><div>📖 ' + esc(mg.text) + "</div></div>" : "") +
      (ov ? '<div class="m-sec"><div class="m-lbl">Synopsis</div>' + (w || !S.settings.spoiler || UI.reveal === n ? '<p class="m-syn">' + esc(ov) + '</p><div class="tmdb small muted">Synopsis via TMDB</div>' : '<button class="btn sm ghost" data-act="reveal" data-ep="' + n + '">Reveal synopsis (may contain spoilers)</button>') + "</div>" : "") +
      '<div class="m-sec"><div class="m-lbl">Your rating</div><div class="stars">' + stars + (r ? '<button class="link" data-act="rate" data-ep="' + n + '" data-v="0">clear</button>' : "") + "</div></div>" +
      '<div class="m-sec"><div class="m-lbl">Log notes</div><textarea id="noteBox" data-ep="' + n + '" placeholder="Thoughts, favorite moments, theories…">' + esc(S.notes[n] || "") + "</textarea></div>" +
      (deb.length ? '<div class="m-sec"><div class="m-lbl">First appearances</div><div class="m-debuts">' + deb.map((c) => locked(c) ? '<span class="deb locked">??? <em>watch to reveal</em></span>' : '<a class="deb" href="#crew" data-act="closemodal"><i style="background:' + (GROUP_COLOR[groupOf(c)] || "#999") + '"></i>' + esc(c.name) + "</a>").join("") + "</div></div>" : "") +
      '<div class="m-nav">' + (n > FIRST ? '<button class="btn sm" data-act="open" data-ep="' + (n - 1) + '">← ' + (n - 1) + "</button>" : "<span></span>") + '<a class="btn sm ghost" href="#log/' + s.n + '" data-act="closemodal">Season ' + s.n + "</a>" + (n < LAST ? '<button class="btn sm" data-act="open" data-ep="' + (n + 1) + '">' + (n + 1) + " →</button>" : "<span></span>") + "</div>";
    if (!keep) { modal.classList.add("open"); document.body.classList.add("noscroll"); $("#modalClose").focus({ preventScroll: true }); }
  }
  function closeModal() { const m = $("#modal"); m.classList.remove("open"); delete m.dataset.ep; delete m.dataset.ch; document.body.classList.remove("noscroll"); }

  /* --------------------------------------------------------------- MANGA */
  const maxRead = () => { let m = 0; for (const k in S.read) if (+k > m) m = +k; return m; };
  function animeCovers() { const mw = maxWatched(); let m = 0; for (const e in EP_CH) if (+e <= mw) for (const c of EP_CH[e]) if (c > m) m = c; return m; }
  function chapterEp(c) { const x = CHN[c]; return x && x.eps.length ? Math.max(...x.eps) : null; }
  const lastAdapted = () => { let m = 0; CH.forEach((c) => { if (c.eps.length && c.n > m) m = c.n; }); return m; };

  function vManga() {
    if (!MG) return '<div class="page-h"><h1>Manga</h1><p class="muted">The chapter list is built by the repo\'s “Update manga data” GitHub Action. Run it once from the Actions tab and the manga tracker will appear here.</p></div>';
    const read = Object.keys(S.read).length, mr = maxRead(), cov = animeCovers(), mw = maxWatched(), la = lastAdapted();
    const readEq = mr ? chapterEp(mr) : null;
    const vols = {}; CH.forEach((c) => { if (c.v) { const v = vols[c.v] = vols[c.v] || { t: 0, r: 0 }; v.t++; if (S.read[c.n]) v.r++; } });
    const volsDone = Object.values(vols).filter((v) => v.r === v.t).length;
    let delta;
    if (!mr && !mw) delta = "Log some episodes or chapters and this will show how they line up.";
    else if (mr > cov) delta = "Your reading is <b>" + (mr - cov) + " chapter" + (mr - cov === 1 ? "" : "s") + " ahead</b> of your anime." + (mr > la ? " You're past everything the anime has adapted." : "");
    else if (cov > mr) delta = "Your anime is <b>" + (cov - mr) + " chapter" + (cov - mr === 1 ? "" : "s") + " ahead</b> of your reading.";
    else delta = "Your anime and manga are <b>perfectly in sync</b>.";
    const tiles = [
      ["Chapters read", fmt(read), "of " + fmt(LAST_CH) + " released · " + pct(read, LAST_CH) + "%"],
      ["Volumes complete", volsDone, "of " + Object.keys(vols).length + " collected volumes"],
      ["Your anime covers", cov ? "Ch. " + cov : "—", mw ? "through Episode " + mw : "no episodes logged"],
      ["Your manga equals", mr ? (readEq ? "Ep. " + readEq : "Beyond anime") : "—", mr ? "through Chapter " + mr : "no chapters logged"],
      ["Anime has adapted", "Ch. " + la, fmt(LAST_CH - la) + " chapters not animated yet"]
    ].map(([k, v, x]) => '<div class="tile"><div class="tile-k">' + k + '</div><div class="tile-v">' + v + '</div><div class="tile-s">' + x + "</div></div>").join("");
    const sync = '<section class="card sync"><div class="card-h"><h2>Anime ↔ Manga</h2><span class="muted">every episode plotted against the chapters it adapts</span></div>' +
      '<p class="sync-msg">' + delta + "</p>" + corrChart(mw, mr) +
      '<div class="row" style="margin-top:12px"><button class="btn primary" data-act="syncRead"' + (cov ? "" : " disabled") + '>Mark chapters my anime covers as read</button>' +
      (mr && mr < LAST_CH ? '<button class="btn" data-act="opench" data-ch="' + (mr + 1) + '">Next chapter: ' + (mr + 1) + " →</button>" : !mr && cov ? '<button class="btn" data-act="opench" data-ch="' + Math.min(cov + 1, LAST_CH) + '">Continue the story in the manga: Ch. ' + Math.min(cov + 1, LAST_CH) + " →</button>" : "") + "</div></section>";
    const pace = '<section class="card"><div class="card-h"><h2>Adaptation pace</h2><span class="muted">manga chapters per episode, by season</span></div>' + paceChart() + "</section>";
    // chapter list grouped by manga arc
    const q = UI.chQ.trim().toLowerCase(), nextUnread = (CH.find((c) => !S.read[c.n]) || CH[CH.length - 1]).n;
    const groups = MARCS.map((r) => ({ r, chs: CH.filter((c) => c.n >= r.a && c.n <= r.b) })).filter((g) => g.chs.length);
    const list = groups.map((g) => {
      let chs = g.chs;
      if (q) chs = chs.filter((c) => String(c.n) === q || c.t.toLowerCase().includes(q));
      if (UI.hideRead) chs = chs.filter((c) => !S.read[c.n]);
      if (!chs.length) return "";
      const rd = g.chs.filter((c) => S.read[c.n]).length, a = g.chs[0].n, b = g.chs[g.chs.length - 1].n;
      const open = q || (UI.openArcs[g.r.name] != null ? UI.openArcs[g.r.name] : nextUnread >= a && nextUnread <= b);
      const epsA = g.chs.flatMap((c) => c.eps);
      return '<details class="marc"' + (open ? " open" : "") + ' data-marc="' + esc(g.r.name) + '"><summary><div><h3>' + esc(g.r.name) + '</h3><span class="muted">Chapters ' + a + "–" + b + (g.chs[0].v ? " · Vol. " + g.chs[0].v + (g.chs[g.chs.length - 1].v && g.chs[g.chs.length - 1].v !== g.chs[0].v ? "–" + g.chs[g.chs.length - 1].v : "") : "") + (epsA.length ? " · Episodes " + Math.min(...epsA) + "–" + Math.max(...epsA) : " · not animated yet") + "</span></div>" +
        '<div class="arc-tools">' + bar(pct(rd, g.chs.length)) + '<span class="muted">' + rd + "/" + g.chs.length + "</span></div></summary>" +
        '<div class="ep-list">' + chs.map(chRow).join("") + "</div></details>";
    }).join("");
    return '<div class="page-h"><h1>The Manga</h1><p class="muted">Every released chapter of Eiichiro Oda\'s manga, tracked separately from the anime and mapped to the episodes that adapt it.</p></div>' +
      '<section class="tiles tiles5">' + tiles + "</section>" + sync + pace +
      '<div class="filterbar"><input id="chSearch" class="search" type="search" placeholder="Search chapter titles or a number…" value="' + esc(UI.chQ) + '"><div class="chips"><label class="tog"><input type="checkbox" data-act="rhide"' + (UI.hideRead ? " checked" : "") + '> Hide read</label>' +
      '<input id="readUpTo" class="mini-num" type="number" min="1" max="' + LAST_CH + '" placeholder="Ch. #"><button class="btn sm" data-act="ruptoInput">Read 1 → N</button></div></div>' +
      (list || '<p class="muted center">No chapters match.</p>') +
      '<p class="muted small">Chapter titles, volumes, release dates and the page-level chapter↔episode mapping come from the <a href="https://onepiece.fandom.com/" target="_blank" rel="noopener">One Piece Wiki</a> (CC BY-SA), refreshed weekly' + (MG.updated ? " · last update " + niceDate(MG.updated) : "") + ".</p>";
  }
  function chRow(c) {
    const r = !!S.read[c.n];
    const eps = c.eps.length ? '<button class="ch-eps" data-act="open" data-ep="' + c.eps[0] + '">Ep ' + (c.eps.length > 1 ? c.eps[0] + "–" + c.eps[c.eps.length - 1] : c.eps[0]) + (c.eps.every((e) => isW(e)) ? " ✓" : "") + "</button>" : '<span class="ch-eps none">Not animated</span>';
    return '<div class="ep-row ch-row' + (r ? " is-w" : "") + '"><button class="chk" data-act="rtoggle" data-ch="' + c.n + '" aria-pressed="' + r + '" aria-label="Mark chapter ' + c.n + ' read"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></button>' +
      '<span class="ep-num">' + c.n + '</span><button class="ep-title" data-act="opench" data-ch="' + c.n + '">' + esc(c.t || "Chapter " + c.n) + "</button>" +
      '<span class="ep-date">' + (c.v ? "Vol. " + c.v + " · " : "") + (c.d ? niceDate(c.d) : "") + "</span>" + eps + "</div>";
  }
  function openCh(n, keep) {
    const c = CHN[n]; if (!c) return;
    const r = !!S.read[n], modal = $("#modal");
    delete modal.dataset.ep; modal.dataset.ch = n;
    $("#modalBody").innerHTML = '<div class="m-head" style="--accent:#f2b632"><div class="m-kicker">Manga · ' + esc(chArc(n)) + " arc" + (c.v ? " · Volume " + c.v : "") + '</div><div class="m-num">Chapter ' + n + "</div><h2>" + esc(c.t || "Chapter " + n) + '</h2><div class="m-meta">' + (c.d ? "<span>Released " + niceDate(c.d) + " (" + ago(c.d) + ")</span>" : "") + "</div></div>" +
      '<div class="m-actions"><button class="btn ' + (r ? "" : "primary") + '" data-act="rtoggle" data-ch="' + n + '">' + (r ? "✓ Read — undo" : "Mark read") + '</button><button class="btn" data-act="rupto" data-ch="' + n + '">Mark all up to here</button></div>' +
      (r ? '<div class="m-when"><label for="readDate">Read on</label><input type="date" id="readDate" data-ch="' + n + '" value="' + dayKey(S.read[n]) + '" min="' + (c.d || "1997-07-19") + '" max="' + todayKey() + '">' + (S.readBulk[n] ? '<span class="muted">Bulk-marked — set the real date if you know it.</span>' : "") + "</div>" : "") +
      '<div class="m-sec"><div class="m-lbl">Animated in</div>' + (c.eps.length ? '<div class="m-chs">' + c.eps.map((e) => '<button class="chip-ch' + (isW(e) ? " on" : "") + '" data-act="open" data-ep="' + e + '"><b>Ep. ' + e + "</b>" + (S.settings.spoiler && !isW(e) && e > maxWatched() + 1 ? "<i>title hidden</i>" : esc(EPN[e] ? EPN[e].t : "")) + "</button>").join("") + "</div>" : '<p class="muted">Not animated yet — this chapter is ahead of the anime.</p>') +
      (c.fx.length ? '<div class="small muted" style="margin-top:6px">Revisited in flashbacks/recaps: ' + c.fx.map((e) => '<button class="link" data-act="open" data-ep="' + e + '">Ep. ' + e + "</button>").join(", ") + "</div>" : "") + "</div>" +
      '<div class="m-nav">' + (CHN[n - 1] ? '<button class="btn sm" data-act="opench" data-ch="' + (n - 1) + '">← Ch. ' + (n - 1) + "</button>" : "<span></span>") + '<a class="btn sm ghost" href="#manga" data-act="closemodal">All chapters</a>' + (CHN[n + 1] ? '<button class="btn sm" data-act="opench" data-ch="' + (n + 1) + '">Ch. ' + (n + 1) + " →</button>" : "<span></span>") + "</div>";
    if (!keep) { modal.classList.add("open"); document.body.classList.add("noscroll"); }
  }
  function corrChart(mw, mr) {
    const W = 860, H = 300, L = 46, B = 30, T = 14, Rr = 14;
    const pts = []; let run = 0;
    EP.forEach((e) => { const c = EP_CH[e.n]; if (c) run = Math.max(run, ...c); if (run) pts.push([e.n, run]); });
    const xmax = LAST, ymax = Math.max(LAST_CH, 1);
    const x = (v) => L + (v / xmax) * (W - L - Rr), y = (v) => H - B - (v / ymax) * (H - B - T);
    let svg = '<div class="map-scroll"><svg class="chart corr" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Anime episodes plotted against manga chapters">';
    for (let i = 0; i <= 4; i++) { const v = Math.round(ymax * i / 4); svg += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y(v) + '" y2="' + y(v) + '" class="grid"/><text x="' + (L - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end" class="ax">' + v + "</text>"; }
    M.SEASONS.forEach((s, i) => { if (i % 3 === 0 || s.n === 22) svg += '<line x1="' + x(s.start) + '" x2="' + x(s.start) + '" y1="' + T + '" y2="' + (H - B) + '" class="grid"/><text x="' + x(s.start) + '" y="' + (H - 10) + '" text-anchor="middle" class="ax">Ep ' + s.start + "</text>"; });
    if (mw) svg += '<rect x="' + L + '" y="' + T + '" width="' + (x(mw) - L) + '" height="' + (H - B - T) + '" class="corr-w"/>';
    if (mr) svg += '<rect x="' + L + '" y="' + y(mr) + '" width="' + (W - Rr - L) + '" height="' + (H - B - y(mr)) + '" class="corr-r"/>';
    svg += '<polyline fill="none" stroke="var(--gold)" stroke-width="2.2" stroke-linejoin="round" points="' + pts.filter((p, i) => i % 2 === 0 || i === pts.length - 1).map((p) => x(p[0]).toFixed(1) + "," + y(p[1]).toFixed(1)).join(" ") + '"/>';
    if (mw) { const cy = animeCovers(); svg += '<line x1="' + x(mw) + '" x2="' + x(mw) + '" y1="' + T + '" y2="' + (H - B) + '" class="corr-lw"/><circle cx="' + x(mw) + '" cy="' + y(cy) + '" r="5" class="corr-dw"><title>Your anime: Ep ' + mw + " ≈ Ch. " + cy + '</title></circle><text x="' + (x(mw) + 6) + '" y="' + (T + 12) + '" class="ax corr-tw">You (anime) · Ep ' + mw + "</text>"; }
    if (mr) svg += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y(mr) + '" y2="' + y(mr) + '" class="corr-lr"/><text x="' + (L + 6) + '" y="' + (y(mr) - 6) + '" class="ax corr-tr">You (manga) · Ch. ' + mr + "</text>";
    return svg + '</svg></div><div class="legend"><i class="lg-line"></i><span>Chapters adapted so far</span><i class="lg-w2"></i><span>Watched</span><i class="lg-r2"></i><span>Read</span></div>';
  }
  function paceChart() {
    const rows = M.SEASONS.map((s) => { const chs = new Set(epsChapters(s.eps)); return { s, v: chs.size / s.eps.length, chs: chs.size }; });
    const max = Math.max(...rows.map((r) => r.v), 0.1);
    return '<div class="sbars">' + rows.map((r) => '<a class="sbar" href="#log/' + r.s.n + '"><span class="sb-n">S' + r.s.n + '</span><span class="sb-t">' + esc(r.s.short) + "</span>" + bar(r.v / max * 100, r.s.color) + '<span class="sb-p">' + r.v.toFixed(2) + '</span><span class="sb-r">' + r.chs + " ch</span></a>").join("") + '</div><p class="muted small">Lower numbers mean slower pacing: fewer chapters per episode.</p>';
  }

  /* ---------------------------------------------------------------- CREW */
  const locked = (c) => S.settings.spoiler && maxWatched() < c.ep;
  const groupOf = (c) => (c.joins && S.settings.spoiler && maxWatched() < c.joins) ? (PRE_GROUP[c.id] || "Pirate") : c.g;
  // First safe episode for the selected poster. Null keeps unverified reveals behind the shield.
  const WANTED_POSTERS = {
    "ace": null,
    "alvida": null,
    "arlong": null,
    "beckman": null,
    "bege": null,
    "bellamy": null,
    "bigmom": null,
    "bonclay": null,
    "bonney": null,
    "brook": 517,
    "buggy": null,
    "caesar": null,
    "cavendish": null,
    "chopper": 320,
    "cracker": null,
    "crocodile": null,
    "decken": null,
    "doflamingo": null,
    "dorry-brogy": null,
    "drake": null,
    "foxy": null,
    "franky": 320,
    "garp": null,
    "hancock": 415,
    "hawkins": null,
    "higuma": 4,
    "jinbe": 570,
    "kaido": null,
    "kid": null,
    "klahadore": null,
    "koby": null,
    "krieg": null,
    "kuma": 958,
    "law": null,
    "luffy": 522,
    "mihawk": 1086,
    "moria": null,
    "mr3": null,
    "nami": 320,
    "olvia": null,
    "rayleigh": null,
    "robin": 278,
    "roger": 958,
    "sabo": null,
    "sanji": 746,
    "shanks": 958,
    "soldier": null,
    "teach": null,
    "tiger": null,
    "usopp": 320,
    "whitebeard": 958,
    "zoro": 320,
  };
  function crewCard(c) {
    if (locked(c)) {
      return '<div class="poster locked"><div class="p-wanted">WANTED</div><div class="p-photo"><span>?</span></div><div class="p-name">???</div><div class="p-sub">Unlocks after Episode ' + c.ep + '</div><div class="p-foot">#' + c.order + " · Season " + c.s + "</div></div>";
    }
    const g = groupOf(c), aboard = c.joins && (!S.settings.spoiler || maxWatched() >= c.joins);
    const crew = aboard ? M.CREW_JOINS.find((x) => x.id === c.id) : null;
    const reveal = WANTED_POSTERS[c.id];
    const showPoster = reveal !== undefined && (!S.settings.spoiler || (reveal !== null && maxWatched() >= reveal));
    const posterImage = reveal === undefined ? "" : '<img class="p-art" src="assets/wanted/' + c.id + '.webp" alt="' + esc(c.name) + ' wanted poster" loading="lazy" decoding="async">';
    const posterFallback = '<div class="p-wanted">WANTED</div><div class="p-photo"><span>' + esc(initials(c.name)) + '</span><em class="p-group">' + esc(g) + "</em></div>";
    const posterReveal = posterImage && !showPoster
      ? '<details class="p-reveal"><summary>Show poster (bounty spoilers)</summary>' + posterImage + '</details>' : "";
    return '<article class="poster" style="--g:' + (GROUP_COLOR[g] || "#c9b58b") + '">' +
      (showPoster ? posterImage : posterFallback + posterReveal) +
      '<div class="p-name">' + esc(c.name) + "</div>" + (c.epithet ? '<div class="p-epi">“' + esc(c.epithet) + "”</div>" : "") +
      (crew ? '<div class="p-crew">Straw Hat Pirates · ' + esc(crew.role) + "</div>" : "") +
      '<p class="p-bio">' + esc(c.bio) + "</p>" +
      '<dl class="p-dl"><dt>Affiliation</dt><dd>' + esc(c.aff) + "</dd>" + (c.df ? "<dt>Devil Fruit</dt><dd>" + esc(c.df) + "</dd>" : "") + "</dl>" +
      '<div class="p-foot"><button class="link" data-act="open" data-ep="' + c.ep + '">Debut · Ep ' + c.ep + "</button><span>#" + c.order + " · S" + c.s + "</span></div></article>";
  }
  function vCrew() {
    const q = UI.crewQ.trim().toLowerCase();
    let list = CHARS.filter((c) => UI.crewGroup === "all" || (!locked(c) && groupOf(c) === UI.crewGroup));
    if (q) list = list.filter((c) => !locked(c) && (c.name + " " + c.epithet + " " + c.aff).toLowerCase().includes(q));
    const unlocked = CHARS.filter((c) => !locked(c)).length;
    const groups = Object.keys(GROUP_COLOR);
    const controls = '<div class="filterbar"><input id="crewSearch" class="search" type="search" placeholder="Search the crew guide…" value="' + esc(UI.crewQ) + '">' +
      '<div class="chips"><button class="chip' + (UI.crewSort === "season" ? " on" : "") + '" data-act="csort" data-v="season">By season</button><button class="chip' + (UI.crewSort === "order" ? " on" : "") + '" data-act="csort" data-v="order">By order of introduction</button>' +
      '<select id="crewGroup" aria-label="Filter by group"><option value="all">All groups</option>' + groups.map((g) => '<option' + (UI.crewGroup === g ? " selected" : "") + ">" + g + "</option>").join("") + "</select>" +
      '<label class="tog"><input type="checkbox" data-act="spoiler"' + (S.settings.spoiler ? " checked" : "") + "> Spoiler shield</label></div></div>";
    const lockNote = (cs) => {
      const lk = cs.filter(locked);
      if (!lk.length) return "";
      return '<div class="locked-strip"><span class="lk-ico">🔒</span><div><b>' + lk.length + " more character" + (lk.length > 1 ? "s" : "") + " ahead</b><br><span class=\"muted\">Next unlocks after Episode " + lk[0].ep + "</span></div><div class=\"lk-dots\">" + lk.slice(0, 24).map(() => "<i></i>").join("") + "</div></div>";
    };
    const grid = (cs) => { const open = cs.filter((c) => !locked(c)); return (open.length ? '<div class="poster-grid">' + open.map(crewCard).join("") + "</div>" : "") + lockNote(cs); };
    let body;
    if (UI.crewSort === "season") {
      body = M.SEASONS.map((s) => {
        const cs = list.filter((c) => c.s === s.n);
        if (!cs.length) return "";
        const allLocked = cs.every(locked);
        return '<section class="crew-season' + (allLocked ? " sealed" : "") + '" style="--accent:' + s.color + '"><h2><span>Season ' + s.n + "</span> " + (allLocked ? "· · ·" : esc(s.title)) + "</h2>" + grid(cs) + "</section>";
      }).join("");
    } else {
      body = grid(list);
    }
    return '<div class="page-h"><h1>Crew &amp; Characters</h1><p class="muted">' + CHARS.length + " key characters, ordered by first anime appearance. " + (S.settings.spoiler ? "Spoiler shield is on — characters unlock as you watch their debut episode (" + unlocked + " of " + CHARS.length + " unlocked)." : "Spoiler shield is off — everyone is visible.") + "</p></div>" +
      crewRoster() + controls + (S.settings.spoiler ? '<p class="muted small">The spoiler shield hides later bounties. Use “Show poster” on an unlocked character to reveal their artwork.</p>' : "") + (body || '<p class="muted center">No characters match.</p>') +
      '<p class="muted small">Poster artwork from the <a href="https://onepiece.fandom.com/wiki/Bounty/Gallery" target="_blank" rel="noopener noreferrer">One Piece Wiki wanted poster gallery</a>.</p>';
  }
  function crewRoster() {
    const mw = maxWatched();
    return '<section class="card roster"><div class="card-h"><h2>The Straw Hat Roster</h2><span class="muted">fills in as they come aboard</span></div><div class="roster-row">' +
      M.CREW_JOINS.map((c, i) => {
        const on = !S.settings.spoiler || mw >= c.ep;
        return '<div class="seat' + (on ? " on" : "") + '"><div class="seat-n">' + (i + 1) + '</div><div class="seat-name">' + (on ? esc(c.name) : "???") + '</div><div class="seat-role">' + (on ? esc(c.role) : "Ep " + c.ep) + "</div></div>";
      }).join("") + "</div></section>";
  }

  /* ------------------------------------------------------------ BOUNTIES */
  function posterPhoto() {
    const photo = S.settings.posterPhoto;
    return typeof photo === "string" && photo.length < 1000000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(photo) ? photo : "";
  }
  function personalPosterPhoto() {
    const photo = posterPhoto();
    return '<div class="mw-photo">' + (photo ? '<img src="' + photo + '" alt="Your wanted poster photo">'
      : '<span>' + esc(initials(S.settings.name || "R")) + '</span>') + '</div>';
  }
  function vBounties() {
    const res = evalAch(), tb = totalBounty(), earned = res.filter((a) => a.done).length;
    const poster = '<section class="mywanted"><div class="mw-poster"><div class="mw-top">WANTED</div>' + personalPosterPhoto() + '<div class="mw-dead">DEAD OR ALIVE</div><div class="mw-name">' + esc((S.settings.name || "Rookie Pirate").toUpperCase()) + '</div><div class="mw-bounty"><span>' + BERRY + "</span>" + fmt(tb) + '<em>-</em></div><div class="mw-marine">GRAND LINE VOYAGE</div></div>' +
      '<div class="mw-info"><div class="mw-rank">' + rankFor(tb) + '</div><h1>Bounty Board</h1><p class="muted">Every milestone raises your bounty. ' + earned + " of " + res.length + ' bounties claimed.</p>' + bar(pct(earned, res.length)) +
      '<p class="muted small">Ranks: Stowaway → Rookie → Supernova (' + shortBounty(5e7) + ") → Worst Generation (" + shortBounty(2e8) + ") → Warlord (" + shortBounty(8e8) + ") → Emperor (" + shortBounty(2e9) + ") → King of the Pirates (" + shortBounty(4e9) + ').</p><a class="btn sm" href="#helm">Edit wanted poster</a></div></section>';
    const cats = [["Milestones", (a) => /^(first|count|allaired|ep1000|caughtup|timeskip|merry)/.test(a.id)], ["Seasons", (a) => a.id.startsWith("season")], ["Crew", (a) => a.id.startsWith("crew-")], ["Habits", (a) => /^(streak|binge|night|rate|notes|favs|filler|canon)/.test(a.id)], ["Manga", (a) => /^read/.test(a.id)], ["Side Voyages", (a) => /^(la\d|films)/.test(a.id)]];
    const grid = cats.map(([name, f]) => '<section><h2 class="cat-h">' + name + '</h2><div class="ach-grid">' + res.filter(f).map((a) => {
      const secret = a.hidden && !a.done;
      return '<div class="ach' + (a.done ? " got" : "") + '"><div class="ach-ico">' + (secret ? "❔" : a.icon) + '</div><div class="ach-body"><div class="ach-name">' + (secret ? "Secret bounty" : esc(a.name)) + '</div><div class="ach-desc">' + (secret ? "Keep sailing to reveal this one." : esc(a.desc)) + "</div>" +
        (a.done ? '<div class="ach-at">Claimed ' + niceTs(a.at || Date.now()) + "</div>" : a.max > 1 ? bar(pct(a.cur, a.max)) + '<div class="ach-at">' + fmt(a.cur) + " / " + fmt(a.max) + "</div>" : "") +
        '</div><div class="ach-b">' + shortBounty(a.b) + "</div></div>";
    }).join("") + "</div></section>").join("");
    return poster + grid;
  }

  /* --------------------------------------------------------------- STATS */
  function vStats() {
    const act = activity(), st = streaks(act), mp = minsPer(), wc = watchedCount();
    const first = Object.values(S.watched).reduce((m, v) => Math.min(m, v), Infinity);
    const daysAtSea = isFinite(first) ? Math.max(1, Math.ceil((Date.now() - first) / DAY)) : 0;
    const activeDays = Object.keys(act).length;
    const typeW = { canon: 0, mixed: 0, filler: 0, recap: 0 }, typeT = { canon: 0, mixed: 0, filler: 0, recap: 0 };
    EP.forEach((e) => { typeT[e.type]++; if (isW(e.n)) typeW[e.type]++; });
    const rated = Object.keys(S.ratings);
    const avgR = rated.length ? (rated.reduce((s, k) => s + S.ratings[k], 0) / rated.length).toFixed(2) : "—";
    const seasonAvg = M.SEASONS.map((s) => { const rs = s.eps.filter((e) => S.ratings[e.n]).map((e) => S.ratings[e.n]); return rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0; });
    const bestS = seasonAvg.reduce((bi, v, i) => (v > seasonAvg[bi] ? i : bi), 0);
    const remaining = progress().total - progress().done;
    const tiles = [
      ["Episodes logged", fmt(wc), pct(wc, EP.length) + "% of the series"],
      ["Time at sea", hours(wc * mp), (wc * mp / 1440).toFixed(1) + " full days"],
      ["Days since first log", fmt(daysAtSea), activeDays + " active days"],
      ["Avg per active day", activeDays ? (Object.values(act).reduce((a, b) => a + b, 0) / activeDays).toFixed(1) : "—", "excludes bulk marks"],
      ["Longest streak", st.best + " days", "current: " + st.cur],
      ["Average rating", avgR, rated.length + " rated" + (seasonAvg[bestS] ? " · top: S" + (bestS + 1) : "")]
    ].map(([k, v, s]) => '<div class="tile"><div class="tile-k">' + k + '</div><div class="tile-v">' + v + '</div><div class="tile-s">' + s + "</div></div>").join("");
    const calcN = UI.paceCalc || +S.settings.goal || 3;
    const finish = remaining ? new Date(Date.now() + Math.ceil(remaining / calcN) * DAY) : null;
    return '<div class="page-h"><h1>Ship\'s Log</h1><p class="muted">Reports from the voyage so far. Bulk-marked episodes count toward totals but not toward pace, streaks or activity.</p></div>' +
      '<section class="tiles">' + tiles + "</section>" +
      '<section class="card"><div class="card-h"><h2>Activity</h2><span class="muted">last 52 weeks</span></div>' + heatmap(act) + "</section>" +
      '<div class="cols two">' +
      '<section class="card"><div class="card-h"><h2>Weekly episodes</h2><span class="muted">last 16 weeks</span></div>' + weekly(act) + "</section>" +
      '<section class="card"><div class="card-h"><h2>What you\'ve watched</h2></div>' + donut(typeW, typeT) + "</section></div>" +
      '<section class="card"><div class="card-h"><h2>Season completion</h2><span class="muted">with your average rating</span></div>' + seasonBars(seasonAvg) + "</section>" +
      '<section class="card"><div class="card-h"><h2>Through the broadcast years</h2><span class="muted">episodes aired per year · your share watched</span></div>' + yearChart() + "</section>" +
      '<section class="card calc"><div class="card-h"><h2>Landfall calculator</h2></div><p>At <input id="paceCalc" type="number" min="1" max="100" value="' + calcN + '" aria-label="Episodes per day"> episodes a day, you\'ll finish the remaining <b>' + fmt(remaining) + "</b> episodes in <b>" + fmt(Math.ceil(remaining / calcN)) + " days</b>" + (finish ? " — around <b>" + niceTs(finish) + "</b>" : "") + ". That's about <b>" + hours(Math.round(calcN * mp)) + "</b> a day.</p></section>";
  }
  function heatmap(act) {
    const cell = 12, gap = 3, weeks = 53;
    const end = new Date(); end.setHours(12, 0, 0, 0);
    const start = new Date(end.getTime() - ((weeks - 1) * 7 + end.getDay()) * DAY);
    const W = weeks * (cell + gap) + 30, H = 7 * (cell + gap) + 22;
    let svg = '<div class="map-scroll"><svg class="heat" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Activity heatmap">';
    let lastM = -1;
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const t = new Date(start.getTime() + (w * 7 + d) * DAY);
        if (t > end) continue;
        const k = dayKey(t.getTime()), v = act[k] || 0;
        const lvl = v === 0 ? 0 : v < 2 ? 1 : v < 4 ? 2 : v < 8 ? 3 : 4;
        svg += '<rect x="' + (30 + w * (cell + gap)) + '" y="' + (16 + d * (cell + gap)) + '" width="' + cell + '" height="' + cell + '" rx="3" class="h' + lvl + '"><title>' + k + ": " + v + " episode" + (v === 1 ? "" : "s") + "</title></rect>";
        if (d === 0 && t.getMonth() !== lastM) { lastM = t.getMonth(); svg += '<text x="' + (30 + w * (cell + gap)) + '" y="10" class="ax">' + MONTHS[lastM] + "</text>"; }
      }
    }
    ["", "Mon", "", "Wed", "", "Fri", ""].forEach((l, i) => { if (l) svg += '<text x="0" y="' + (26 + i * (cell + gap)) + '" class="ax">' + l + "</text>"; });
    return svg + '</svg></div><div class="legend"><span>Less</span><i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i><span>More</span></div>';
  }
  function weekly(act) {
    const weeks = 16, now = new Date(); now.setHours(12, 0, 0, 0);
    const sow = new Date(now.getTime() - now.getDay() * DAY);
    const data = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const s0 = new Date(sow.getTime() - i * 7 * DAY); let v = 0;
      for (let d = 0; d < 7; d++) v += act[dayKey(s0.getTime() + d * DAY)] || 0;
      data.push({ label: MONTHS[s0.getMonth()] + " " + s0.getDate(), v });
    }
    const max = Math.max(4, ...data.map((d) => d.v)), W = 560, H = 200, bw = (W - 40) / weeks;
    let svg = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Episodes per week">';
    [0, 0.5, 1].forEach((f) => { const y = 170 - f * 150; svg += '<line x1="30" x2="' + W + '" y1="' + y + '" y2="' + y + '" class="grid"/><text x="24" y="' + (y + 4) + '" text-anchor="end" class="ax">' + Math.round(max * f) + "</text>"; });
    data.forEach((d, i) => {
      const h = (d.v / max) * 150, x = 34 + i * bw;
      svg += '<rect x="' + x + '" y="' + (170 - h) + '" width="' + (bw - 6) + '" height="' + Math.max(h, d.v ? 2 : 0) + '" rx="3" class="barv"><title>Week of ' + d.label + ": " + d.v + "</title></rect>";
      if (i % 3 === 0) svg += '<text x="' + (x + (bw - 6) / 2) + '" y="188" text-anchor="middle" class="ax">' + d.label + "</text>";
    });
    return svg + "</svg>";
  }
  function donut(w, t) {
    const order = ["canon", "mixed", "filler", "recap"], col = { canon: "var(--canon)", mixed: "var(--mixed)", filler: "var(--filler)", recap: "var(--recap)" };
    const total = Object.values(w).reduce((a, b) => a + b, 0), R0 = 70, C = 2 * Math.PI * R0;
    let off = 0, arcs = "";
    if (total) order.forEach((k) => { const f = w[k] / total; if (!f) return; arcs += '<circle cx="90" cy="90" r="' + R0 + '" fill="none" stroke="' + col[k] + '" stroke-width="22" stroke-dasharray="' + (C * f) + " " + C + '" stroke-dashoffset="' + (-off * C) + '" transform="rotate(-90 90 90)"/>'; off += f; });
    return '<div class="donut"><svg viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="Watched by episode type"><circle cx="90" cy="90" r="' + R0 + '" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="22"/>' + arcs +
      '<text x="90" y="88" text-anchor="middle" class="d-big">' + fmt(total) + '</text><text x="90" y="108" text-anchor="middle" class="ax">watched</text></svg><ul>' +
      order.map((k) => '<li><i class="dot d-' + k + '"></i><b>' + TYPE_LABEL[k] + "</b><span>" + w[k] + " / " + t[k] + "</span>" + bar(pct(w[k], t[k]), col[k]) + "</li>").join("") + "</ul></div>";
  }
  function seasonBars(avg) {
    return '<div class="sbars">' + M.SEASONS.map((s, i) => {
      const p = progress(s.eps);
      return '<a class="sbar" href="#log/' + s.n + '"><span class="sb-n">S' + s.n + '</span><span class="sb-t">' + esc(s.short) + "</span>" + bar(p.pct, s.color) + '<span class="sb-p">' + Math.round(p.pct) + '%</span><span class="sb-r">' + (avg[i] ? "★ " + avg[i].toFixed(1) : "") + "</span></a>";
    }).join("") + "</div>";
  }
  function yearChart() {
    const yrs = {}; EP.forEach((e) => { const y = yrs[e.year] = yrs[e.year] || { a: 0, w: 0 }; y.a++; if (isW(e.n)) y.w++; });
    const keys = Object.keys(yrs).map(Number).sort(), max = Math.max(...keys.map((k) => yrs[k].a));
    const W = 760, H = 210, bw = (W - 40) / keys.length;
    let svg = '<div class="map-scroll"><svg class="chart" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Episodes per broadcast year">';
    [0, 0.5, 1].forEach((f) => { const y = 175 - f * 150; svg += '<line x1="30" x2="' + W + '" y1="' + y + '" y2="' + y + '" class="grid"/><text x="24" y="' + (y + 4) + '" text-anchor="end" class="ax">' + Math.round(max * f) + "</text>"; });
    keys.forEach((k, i) => {
      const a = yrs[k].a, wv = yrs[k].w, ha = (a / max) * 150, hw = (wv / max) * 150, x = 34 + i * bw;
      svg += '<rect x="' + x + '" y="' + (175 - ha) + '" width="' + (bw - 5) + '" height="' + ha + '" rx="2" class="bara"><title>' + k + ": " + a + " aired</title></rect>";
      if (wv) svg += '<rect x="' + x + '" y="' + (175 - hw) + '" width="' + (bw - 5) + '" height="' + hw + '" rx="2" class="barv"><title>' + k + ": " + wv + " watched of " + a + "</title></rect>";
      if (i % 2 === 0) svg += '<text x="' + (x + (bw - 5) / 2) + '" y="194" text-anchor="middle" class="ax">\'' + String(k).slice(2) + "</text>";
    });
    return svg + '</svg></div><div class="legend"><i class="lg-a"></i><span>Aired</span><i class="lg-w"></i><span>Watched</span></div>';
  }

  /* ---------------------------------------------------------------- SIDE */
  function vSide() {
    return '<div class="page-h"><h1>Side Voyages</h1><p class="muted">Extras outside the 1999 anime. These are <b>non-canon to your completion</b> — they never affect your main progress, but they do have their own bounties.</p></div>' +
      M.SIDE.map((sec) => '<section class="card side"><div class="card-h"><h2>' + esc(sec.title) + '</h2></div><p class="muted">' + esc(sec.note) + "</p>" +
        sec.items.map((g) => {
          const done = sideCount(g.id);
          return '<div class="side-g"><div class="side-gh"><h3>' + esc(g.group) + "</h3>" + (g.list.length ? '<span class="muted">' + done + " / " + g.list.length + "</span>" : '<span class="muted">Announced</span>') + "</div>" +
            (g.list.length ? bar(pct(done, g.list.length)) + '<div class="ep-list">' + g.list.map((t, i) => {
              const k = g.id + ":" + (i + 1), w = !!S.side[k];
              return '<div class="ep-row' + (w ? " is-w" : "") + '"><button class="chk" data-act="side" data-k="' + k + '" aria-pressed="' + w + '"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></button><span class="ep-num">' + (i + 1) + '</span><span class="ep-title static">' + esc(t) + '</span><span class="ep-date">≈ ' + g.mins + " min</span></div>";
            }).join("") + "</div>" : '<p class="muted small">Season 3 of the live-action series has been announced and is in production. Episodes will be added here when titles are confirmed.</p>') + "</div>";
        }).join("") + "</section>").join("");
  }

  /* ------------------------------------------------------------ SETTINGS */
  function vSettings() {
    const st = S.settings;
    return '<div class="page-h"><h1>Settings &amp; Backup</h1><p class="muted">Your progress lives in this browser only (localStorage). Export a backup to move devices or keep it safe.' + (storageOK ? "" : ' <b class="warn">Storage is unavailable in this browser — progress will not persist.</b>') + "</p></div>" +
      '<div class="cols two">' +
      '<section class="card"><div class="card-h"><h2>Quick start</h2></div><p class="muted">Already partway through? Mark everything up to an episode in one go.</p><div class="row"><input id="uptoN" type="number" min="1" max="' + LAST + '" placeholder="e.g. 516"><button class="btn primary" data-act="uptoInput">Mark 1 → N watched</button></div></section>' +
      '<section class="card"><div class="card-h"><h2>Your wanted poster</h2></div><label class="field">Pirate name<input id="setName" maxlength="28" value="' + esc(st.name) + '"></label>' +
      '<label class="field">Poster photo<input id="setPosterPhoto" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="posterPhotoHelp"></label>' +
      '<p id="posterPhotoHelp" class="muted small">Choose a JPG, PNG, or WebP up to 20 MB. The photo stays in this browser and is included in your backup.</p>' +
      (posterPhoto() ? personalPosterPhoto() + '<button class="btn sm" type="button" data-act="removePosterPhoto">Remove photo</button>' : "") + '</section>' +
      '<section class="card"><div class="card-h"><h2>Voyage</h2></div>' +
      '<label class="field">Minutes per episode <span class="muted">(24 full · ~20 skipping OP/ED)</span><input id="setMin" type="number" min="1" max="60" value="' + st.minutes + '"></label>' +
      '<label class="field">Daily goal (episodes) <span class="muted">used for ETA until you have a pace</span><input id="setGoal" type="number" min="1" max="100" value="' + st.goal + '"></label>' +
      '<label class="field">Completion counts<select id="setComp"><option value="all"' + (st.completion === "all" ? " selected" : "") + '>Every episode (true completionist)</option><option value="canon"' + (st.completion === "canon" ? " selected" : "") + ">Canon + mixed only</option></select></label>" +
      '<label class="tog block"><input type="checkbox" id="setSkip"' + (st.skipFiller ? " checked" : "") + "> Skip filler &amp; recaps in “Next on the voyage”</label>" +
      '<label class="tog block"><input type="checkbox" id="setSpoil"' + (st.spoiler ? " checked" : "") + "> Spoiler shield (hide characters &amp; crew until their debut)</label>" +
      '<label class="tog block"><input type="checkbox" id="setArt"' + (st.art ? " checked" : "") + "> Show artwork from TMDB (episode stills respect the spoiler shield)</label>" +
      '<label class="tog block"><input type="checkbox" id="setMotion"' + (st.reduceMotion ? " checked" : "") + "> Reduce motion (skip the loading voyage)</label></section>" +
      '<section class="card"><div class="card-h"><h2>Backup</h2></div><p class="muted">Download your full log (episodes, ratings, notes, bounties) as a JSON file, or restore one.</p>' +
      '<div class="row"><button class="btn primary" data-act="export">Export backup</button><label class="btn">Restore backup<input type="file" id="importFile" accept="application/json,.json" hidden></label></div>' +
      '<div class="danger"><h3>Danger zone</h3><p class="muted small">Erase every log entry, rating, note and bounty from this browser.</p><button class="btn danger-btn" data-act="reset">Reset everything</button></div></section></div>' +
      '<section class="card about"><div class="card-h"><h2>About</h2></div><p>Grand Line Voyage is an unofficial, fan-made tracker from <b>CinematicArchivesHQ</b>. No episodes are hosted or streamed here. Episode titles and Japanese air dates are compiled from public episode lists; arc groupings, filler classification and character debut episodes follow common fan conventions and may differ slightly from other guides. ONE PIECE © Eiichiro Oda / Shueisha, Toei Animation.</p></section>';
  }

  /* ------------------------------------------------------------- events */
  document.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-act]");
    if (!t) { if (ev.target.id === "modal") closeModal(); return; }
    const act = t.dataset.act, n = +t.dataset.ep;
    switch (act) {
      case "removePosterPhoto": setPosterPhoto(""); break;
      case "toggle": {
        const was = isW(n); toggle(n);
        if (!was) toast("✓ Logged episode " + n);
        break;
      }
      case "open": ev.preventDefault(); openEp(n); break;
      case "fav": if (S.favs[n]) delete S.favs[n]; else S.favs[n] = Date.now(); commit(); break;
      case "rate": { const v = +t.dataset.v; if (v) S.ratings[n] = v; else delete S.ratings[n]; commit(); break; }
      case "upto": {
        const missing = EP.filter((e) => e.n <= n && !isW(e.n)).length;
        if (!missing) { toast("Everything up to " + n + " is already logged"); break; }
        confirmBox("Mark " + missing + " episode" + (missing > 1 ? "s" : "") + " up to #" + n + " as watched?", () => { markRange(FIRST, n, true); toast("Logged " + missing + " episodes"); });
        break;
      }
      case "range": {
        const a = +t.dataset.a, b = +t.dataset.b, v = t.dataset.v === "1";
        if (!v) confirmBox("Clear episodes " + a + "–" + b + " from your log?", () => markRange(a, b, false));
        else markRange(a, b, true);
        break;
      }
      case "ftype": UI.type = t.dataset.v; rerender(); break;
      case "csort": UI.crewSort = t.dataset.v; rerender(); break;
      case "side": { const k = t.dataset.k; if (S.side[k]) delete S.side[k]; else S.side[k] = Date.now(); commit(); break; }
      case "closemodal": closeModal(); break;
      case "reveal": UI.reveal = n; openEp(n, true); break;
      case "opench": ev.preventDefault(); openCh(+t.dataset.ch); break;
      case "rtoggle": { const c = +t.dataset.ch; if (S.read[c]) { delete S.read[c]; delete S.readBulk[c]; } else S.read[c] = Date.now(); commit(); break; }
      case "rupto": {
        const c = +t.dataset.ch, missing = CH.filter((x) => x.n <= c && !S.read[x.n]).length;
        if (!missing) { toast("Everything up to chapter " + c + " is already read"); break; }
        confirmBox("Mark " + missing + " chapter" + (missing > 1 ? "s" : "") + " up to #" + c + " as read?", () => { const ts = Date.now(); CH.forEach((x) => { if (x.n <= c && !S.read[x.n]) { S.read[x.n] = ts; S.readBulk[x.n] = 1; } }); commit(); toast("Marked " + missing + " chapters read"); });
        break;
      }
      case "ruptoInput": { const v = +$("#readUpTo").value; if (v >= 1 && v <= LAST_CH) { const missing = CH.filter((x) => x.n <= v && !S.read[x.n]).length; confirmBox("Mark chapters 1–" + v + " read? (" + missing + " new)", () => { const ts = Date.now(); CH.forEach((x) => { if (x.n <= v && !S.read[x.n]) { S.read[x.n] = ts; S.readBulk[x.n] = 1; } }); commit(); }); } else toast("Enter a chapter between 1 and " + LAST_CH); break; }
      case "syncRead": {
        const cov = animeCovers(), missing = CH.filter((x) => x.n <= cov && !S.read[x.n]).length;
        if (!missing) { toast("Already in sync"); break; }
        confirmBox("Mark the " + missing + " chapters your watched episodes cover (through Ch. " + cov + ") as read?", () => { const ts = Date.now(); CH.forEach((x) => { if (x.n <= cov && !S.read[x.n]) { S.read[x.n] = ts; S.readBulk[x.n] = 1; } }); commit(); });
        break;
      }
      case "rhide": UI.hideRead = !UI.hideRead; rerender(); break;
      case "uptoInput": { const v = +$("#uptoN").value; if (v >= 1 && v <= LAST) { const missing = EP.filter((e) => e.n <= v && !isW(e.n)).length; confirmBox("Mark episodes 1–" + v + " watched? (" + missing + " new)", () => { markRange(FIRST, v, true); toast("Welcome aboard — logged through episode " + v); }); } else toast("Enter an episode between 1 and " + LAST); break; }
      case "export": exportData(); break;
      case "reset": confirmBox("Really erase all progress? This cannot be undone (export a backup first!).", () => { S = DEFAULT(); save(); rerender(); toast("Log wiped. A fresh voyage begins."); }, "Erase everything"); break;
      case "cb-yes": { const f = confirmBox._fn; closeConfirm(); if (f) f(); break; }
      case "cb-no": closeConfirm(); break;
    }
  });
  document.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.dataset.act === "hidew") { UI.hideWatched = t.checked; rerender(); return; }
    if (t.dataset.act === "spoiler") { S.settings.spoiler = t.checked; commit(true); return; }
    if (t.id === "crewGroup") { UI.crewGroup = t.value; rerender(); return; }
    const st = S.settings;
    if (t.id === "setPosterPhoto") { uploadPosterPhoto(t.files[0], t); return; }
    if (t.id === "setName") st.name = t.value.trim() || "Rookie Pirate";
    else if (t.id === "setMin") st.minutes = clamp(+t.value || 24, 1, 60);
    else if (t.id === "setGoal") st.goal = clamp(+t.value || 3, 1, 100);
    else if (t.id === "setComp") st.completion = t.value;
    else if (t.id === "setSkip") st.skipFiller = t.checked;
    else if (t.id === "setSpoil") st.spoiler = t.checked;
    else if (t.id === "setMotion") st.reduceMotion = t.checked;
    else if (t.id === "setArt") st.art = t.checked;
    else if (t.id === "importFile") { importData(t.files[0]); return; }
    else if (t.id === "readDate") {
      const c = +t.dataset.ch, v = t.value;
      if (!S.read[c] || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
      if (v > todayKey()) { toast("That date is in the future"); t.value = dayKey(S.read[c]); return; }
      const d = new Date(v + "T20:00:00"); S.read[c] = d.getTime(); delete S.readBulk[c]; commit(); toast("Chapter " + c + " dated " + niceDate(v)); return;
    }
    else if (t.id === "watchDate") {
      const n = +t.dataset.ep, v = t.value;
      if (!isW(n) || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
      if (v > todayKey()) { toast("That date is in the future"); t.value = dayKey(S.watched[n]); return; }
      const prev = new Date(S.watched[n]), d = new Date(v + "T00:00:00");
      d.setHours(S.bulk[n] ? 20 : prev.getHours(), S.bulk[n] ? 0 : prev.getMinutes(), 0, 0);
      S.watched[n] = d.getTime();
      delete S.bulk[n];
      commit(true);
      toast("Episode " + n + " dated " + niceDate(v));
      return;
    }
    else if (t.id === "paceCalc") { UI.paceCalc = clamp(+t.value || 1, 1, 100); rerender(); return; }
    else return;
    commit(true);
    toast("Settings saved");
  });
  document.addEventListener("toggle", (ev) => { const d = ev.target; if (d.dataset && d.dataset.marc) UI.openArcs[d.dataset.marc] = d.open; }, true);
  let qTimer;
  document.addEventListener("input", (ev) => {
    const t = ev.target;
    if (t.id === "logSearch") { clearTimeout(qTimer); qTimer = setTimeout(() => { UI.q = t.value; UI._focusSearch = true; rerender(); UI._focusSearch = false; const i = $("#logSearch"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 220); }
    if (t.id === "chSearch") { clearTimeout(qTimer); qTimer = setTimeout(() => { UI.chQ = t.value; rerender(); const i = $("#chSearch"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 250); }
    if (t.id === "crewSearch") { clearTimeout(qTimer); qTimer = setTimeout(() => { UI.crewQ = t.value; rerender(); const i = $("#crewSearch"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 220); }
    if (t.id === "noteBox") { const n = +t.dataset.ep, v = t.value; if (v.trim()) S.notes[n] = v; else delete S.notes[n]; save(); clearTimeout(t._nt); t._nt = setTimeout(() => checkAch(), 600); }
  });
  document.addEventListener("keydown", (ev) => {
    const m = $("#modal");
    if (ev.key === "Escape") { if ($("#confirm").classList.contains("open")) closeConfirm(); else if (m.classList.contains("open")) closeModal(); return; }
    if (!m.classList.contains("open") || /TEXTAREA|INPUT/.test(document.activeElement.tagName)) return;
    const n = +m.dataset.ep;
    if (ev.key === "ArrowRight" && n < LAST) openEp(n + 1, true);
    else if (ev.key === "ArrowLeft" && n > FIRST) openEp(n - 1, true);
    else if (ev.key.toLowerCase() === "w") toggle(n);
  });
  window.addEventListener("hashchange", () => { closeModal(); render(); window.scrollTo(0, 0); });

  function confirmBox(msg, fn, yes) {
    confirmBox._fn = fn;
    $("#confirmMsg").textContent = msg;
    $("#confirmYes").textContent = yes || "Yes, do it";
    $("#confirm").classList.add("open");
    $("#confirmYes").focus();
  }
  function closeConfirm() { $("#confirm").classList.remove("open"); confirmBox._fn = null; }

  let posterPhotoRequest = 0;
  function setPosterPhoto(photo) {
    posterPhotoRequest++;
    const oldPhoto = S.settings.posterPhoto;
    S.settings.posterPhoto = photo;
    save();
    if (!storageOK) {
      S.settings.posterPhoto = oldPhoto;
      toast("Could not save the change. Browser storage is full or unavailable.");
      return;
    }
    rerender();
    toast(photo ? "Wanted poster photo saved" : "Wanted poster photo removed");
  }
  async function uploadPosterPhoto(file, input) {
    if (!file) return;
    const request = ++posterPhotoRequest, state = S;
    input.value = "";
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 20 * 1024 * 1024) {
      toast("Choose a JPG, PNG, or WebP image up to 20 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const scale = Math.min(1, 720 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#e7cf9c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      if (request === posterPhotoRequest && state === S) setPosterPhoto(canvas.toDataURL("image/jpeg", .86));
    } catch (e) {
      if (request === posterPhotoRequest && state === S) toast("That image could not be opened.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(Object.assign({ app: "grand-line-voyage", exported: new Date().toISOString() }, S), null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "grand-line-voyage-" + todayKey() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Backup downloaded");
  }
  function importData(file) {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result);
        if (!d || typeof d.watched !== "object") throw new Error("bad");
        confirmBox("Restore this backup (" + Object.keys(d.watched).length + " episodes)? It replaces your current log.", () => {
          const def = DEFAULT();
          S = Object.assign(def, d); S.settings = Object.assign(DEFAULT().settings, d.settings || {});
          delete S.app; delete S.exported;
          save(); checkAch(true); rerender(); toast("Backup restored");
        }, "Restore");
      } catch (e) { toast("That file isn't a Grand Line Voyage backup"); }
    };
    rd.readAsText(file);
  }

  /* ---------------------------------------------------------- loader */
  function runLoader() {
    const L = $("#loader");
    if (!L) return;
    const reduce = S.settings.reduceMotion || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reduce) { L.remove(); return; }
    const msgs = ["Charting the Grand Line…", "Loading 1,180 episodes of cargo…", "Restocking the meat supply…", "Consulting the Log Pose…", "Waking up the navigator…", "Raising the sails…"];
    const fill = $("#lFill"), ship = $("#lShip"), txt = $("#lText"), pctEl = $("#lPct");
    const dur = 2600, t0 = performance.now();
    let mi = 0;
    const iv = setInterval(() => { mi = (mi + 1) % msgs.length; txt.textContent = msgs[mi]; }, 520);
    const step = (t) => {
      const k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 2.2);
      fill.style.width = (e * 100) + "%";
      ship.style.setProperty("--voyage-progress", e);
      pctEl.textContent = Math.round(e * 100) + "%";
      if (k < 1) requestAnimationFrame(step);
      else { clearInterval(iv); txt.textContent = "Land ho!"; setTimeout(() => { L.classList.add("gone"); setTimeout(() => L.remove(), 700); }, 280); }
    };
    requestAnimationFrame(step);
    L.addEventListener("click", () => { clearInterval(iv); L.classList.add("gone"); setTimeout(() => L.remove(), 600); }, { once: true });
  }

  /* ------------------------------------------------------------ boot */
  if (ART) { const f = $(".foot"); const d = document.createElement("div"); d.className = "muted small"; d.innerHTML = 'Artwork and synopses from <a href="https://www.themoviedb.org/tv/37854" target="_blank" rel="noopener">TMDB</a>. This product uses the TMDB API but is not endorsed or certified by TMDB.' + (ART.updated ? " Data refreshed " + niceDate(ART.updated) + "." : ""); f.appendChild(d); }
  checkAch(true);
  render();
  runLoader();
  window.GLL = { S: () => S, EP, CHARS, ACH, evalAch }; // handy for debugging in the console
})();
