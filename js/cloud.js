/* =========================================================================
   Grand Line Voyage — cloud profile (Firebase Auth + Firestore)
   Progress is saved locally first, then synced to users/{uid} in Firestore.
   The wanted-poster photo is synced separately (users/{uid}/extra/photo)
   because a Firestore document is limited to 1 MiB.
   ========================================================================= */
const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const cfg = window.GLV_FIREBASE || {};
const LINK_KEY = "glv-cloud-linked";           // uid this browser's data is linked to
const CLIENT = Math.random().toString(36).slice(2) + Date.now().toString(36);

const C = { state: cfg.apiKey ? "loading" : "unconfigured", user: null, lastSync: null, error: null, pending: false };
let fb = null, ref = null, photoRef = null, unsub = null, unsubPhoto = null, timer = null, applying = false;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ago = (t) => { if (!t) return "never"; const s = Math.round((Date.now() - t) / 1000); return s < 10 ? "just now" : s < 60 ? s + "s ago" : s < 3600 ? Math.round(s / 60) + " min ago" : new Date(t).toLocaleString(); };
const G = () => window.GLL;

function splitPhoto(S) {
  const copy = JSON.parse(JSON.stringify(S));
  const photo = copy.settings && copy.settings.posterPhoto || "";
  if (copy.settings) delete copy.settings.posterPhoto;
  return { json: JSON.stringify(copy), photo };
}

function paint() {
  const dot = $("#cloudDot");
  if (dot) {
    const map = { unconfigured: ["off", "Cloud sync: not set up"], loading: ["off", "Cloud sync: starting…"], signedout: ["off", "Cloud sync: signed out"],
      syncing: ["busy", "Cloud sync: saving…"], synced: ["on", "Cloud sync: up to date"], offline: ["warn", "Cloud sync: offline — changes will upload later"], error: ["err", "Cloud sync error: " + (C.error || "")] };
    const [cls, title] = map[C.state] || map.loading;
    dot.className = "cloud-dot " + cls; dot.title = title; dot.setAttribute("aria-label", title);
  }
  const card = $("#cloudCard");
  if (card) card.innerHTML = panelHTML();
}

function panelHTML() {
  const head = '<div class="card-h"><h2>Cloud sync</h2><span class="cloud-badge ' + C.state + '">' + ({ unconfigured: "Not set up", loading: "Starting…", signedout: "Signed out", syncing: "Saving…", synced: "Synced", offline: "Offline", error: "Error" }[C.state] || C.state) + "</span></div>";
  if (C.state === "unconfigured") return head + '<p class="muted">Add your Firebase web config to <code>js/firebase-config.js</code> to turn on Google sign-in and cross-device sync.</p>';
  if (!C.user) return head + '<p class="muted">Sign in with Google to keep your episodes, chapters, ratings, notes, bounties and poster in sync across every browser and device.</p>' +
    (C.error ? '<p class="cloud-err">' + esc(C.error) + "</p>" : "") +
    '<button class="btn primary" data-act="cloud-signin" ' + (C.state === "loading" ? "disabled" : "") + '><span class="g-mark">G</span> Sign in with Google</button>';
  return head + '<div class="cloud-user">' + (C.user.photoURL ? '<img src="' + esc(C.user.photoURL) + '" alt="" referrerpolicy="no-referrer">' : "") +
    "<div><b>" + esc(C.user.displayName || "Signed in") + '</b><br><span class="muted small">' + esc(C.user.email || "") + "</span></div></div>" +
    '<p class="muted small">Last synced: ' + ago(C.lastSync) + (C.state === "offline" ? " · offline, will upload when you reconnect" : "") + "</p>" +
    (C.error ? '<p class="cloud-err">' + esc(C.error) + "</p>" : "") +
    '<div class="row"><button class="btn sm" data-act="cloud-sync">Sync now</button><button class="btn sm ghost" data-act="cloud-signout">Sign out</button></div>' +
    '<p class="muted small">Signing out keeps a copy of your progress in this browser.</p>';
}

async function action(act) {
  if (act === "cloud-signin") return signIn();
  if (act === "cloud-signout") { try { await fb.signOut(fb.auth); G().toast("Signed out — progress stays in this browser"); } catch (e) { fail(e); } return; }
  if (act === "cloud-sync") { await push(true); }
}

async function signIn() {
  if (!fb) return;
  C.error = null;
  const provider = new fb.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await fb.signInWithPopup(fb.auth, provider);
  } catch (e) {
    if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/cancelled-popup-request"].includes(e.code)) {
      try { await fb.signInWithRedirect(fb.auth, provider); return; } catch (e2) { return fail(e2); }
    }
    if (e.code !== "auth/popup-closed-by-user") fail(e);
  }
}

function fail(e) {
  console.warn("[cloud]", e);
  const msg = (e && e.code === "permission-denied") ? "This Google account isn't allowed to sync here." :
    (e && e.code === "auth/unauthorized-domain") ? "This site's domain isn't authorized in Firebase (Authentication → Settings → Authorized domains)." :
    (e && (e.message || e.code)) || String(e);
  C.error = msg; C.state = C.user ? "error" : "signedout"; paint();
}

/* ---------------------------------------------------------- upload */
function schedule() {
  if (!ref || applying) return;
  C.pending = true; C.state = "syncing"; paint();
  clearTimeout(timer);
  timer = setTimeout(() => push(false), 1200);
}
let lastPhoto = null;
async function push(manual) {
  if (!ref) return;
  clearTimeout(timer);
  const S = G().S();
  const { json, photo } = splitPhoto(S);
  try {
    C.state = "syncing"; paint();
    const p = fb.setDoc(ref, { json, v: 1, client: CLIENT, savedAt: S.savedAt || Date.now(), updatedAt: fb.serverTimestamp() });
    const jobs = [p];
    if (photo !== lastPhoto) { jobs.push(fb.setDoc(photoRef, { photo, client: CLIENT, updatedAt: fb.serverTimestamp() })); lastPhoto = photo; }
    if (!navigator.onLine) { C.state = "offline"; paint(); }
    await Promise.all(jobs);
    C.pending = false; C.lastSync = Date.now(); C.error = null; C.state = "synced"; paint();
    if (manual) G().toast("Synced to the cloud");
  } catch (e) { fail(e); }
}

/* ---------------------------------------------------------- download */
function adopt(remote, photo) {
  applying = true;
  try {
    const data = JSON.parse(remote.json);
    data.settings = data.settings || {};
    const cur = G().S();
    data.settings.posterPhoto = photo != null ? photo : (cur.settings && cur.settings.posterPhoto) || "";
    G().replace(data);
  } finally { applying = false; }
}

function merge(local, cloud) {
  const out = JSON.parse(JSON.stringify(cloud));
  ["watched", "bulk", "ratings", "notes", "favs", "side", "ach", "read", "readBulk"].forEach((k) => {
    const a = local[k] || {}, b = cloud[k] || {}, m = Object.assign({}, a, b);
    if (k === "watched" || k === "read") for (const key in a) if (b[key]) m[key] = Math.min(a[key], b[key]); // keep earliest real date
    out[k] = m;
  });
  for (const key in out.bulk || {}) if (local.watched && local.watched[key] && !(local.bulk || {})[key]) delete out.bulk[key];
  out.settings = Object.assign({}, local.settings || {}, cloud.settings || {});
  if (!out.settings.posterPhoto && local.settings && local.settings.posterPhoto) out.settings.posterPhoto = local.settings.posterPhoto;
  return out;
}

function chooseDialog(localCount, cloudCount) {
  return new Promise((resolve) => {
    const box = document.createElement("div");
    box.className = "cloud-choose";
    box.innerHTML = '<div class="cb-card"><p>This browser and your cloud profile both have progress.</p>' +
      '<ul class="muted small"><li>This browser: <b>' + localCount + "</b> episodes &amp; chapters logged</li><li>Cloud profile: <b>" + cloudCount + "</b> episodes &amp; chapters logged</li></ul>" +
      '<div class="row col"><button class="btn primary" data-c="merge">Merge both (recommended)</button><button class="btn" data-c="cloud">Use cloud profile</button><button class="btn" data-c="local">Use this browser\'s progress</button></div></div>';
    box.addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (b) { box.remove(); resolve(b.dataset.c); } });
    document.body.appendChild(box);
  });
}
const count = (d) => Object.keys(d.watched || {}).length + Object.keys(d.read || {}).length;

async function attach(user) {
  ref = fb.doc(fb.db, "users", user.uid);
  photoRef = fb.doc(fb.db, "users", user.uid, "extra", "photo");
  let first = true;
  let photo = null;
  try { const ps = await fb.getDoc(photoRef); photo = ps.exists() ? (ps.data().photo || "") : null; lastPhoto = photo; } catch (e) { /* offline or none yet */ }
  unsubPhoto = fb.onSnapshot(photoRef, (snap) => {
    if (snap.metadata.hasPendingWrites || !snap.exists()) return;
    const d = snap.data();
    if (d.client === CLIENT) return;
    lastPhoto = d.photo || "";
    const cur = G().S();
    if ((cur.settings.posterPhoto || "") !== lastPhoto) { applying = true; cur.settings.posterPhoto = lastPhoto; G().replace(cur); applying = false; }
  }, () => {});
  unsub = fb.onSnapshot(ref, { includeMetadataChanges: true }, async (snap) => {
    C.state = snap.metadata.fromCache && !navigator.onLine ? "offline" : (C.pending ? "syncing" : "synced");
    if (!snap.metadata.fromCache) C.lastSync = Date.now();
    if (snap.metadata.hasPendingWrites) { paint(); return; }
    const local = G().S();
    if (first) {
      first = false;
      const linked = localStorage.getItem(LINK_KEY) === user.uid;
      if (!snap.exists()) { localStorage.setItem(LINK_KEY, user.uid); await push(false); G().toast("Cloud profile created"); return; }
      const remote = snap.data();
      const cloudData = JSON.parse(remote.json);
      if (linked || G().isEmpty(local)) { adopt(remote, photo); localStorage.setItem(LINK_KEY, user.uid); paint(); return; }
      if (G().isEmpty(cloudData)) { localStorage.setItem(LINK_KEY, user.uid); await push(false); return; }
      if (splitPhoto(local).json === remote.json) { localStorage.setItem(LINK_KEY, user.uid); paint(); return; }
      const pick = await chooseDialog(count(local), count(cloudData));
      localStorage.setItem(LINK_KEY, user.uid);
      if (pick === "cloud") adopt(remote, photo);
      else if (pick === "merge") { applying = true; G().replace(merge(local, Object.assign(cloudData, { settings: Object.assign(cloudData.settings || {}, { posterPhoto: photo || "" }) }))); applying = false; await push(false); G().toast("Merged — synced everywhere"); }
      else await push(false);
      return;
    }
    if (!snap.exists()) return;
    const remote = snap.data();
    if (remote.client === CLIENT) { paint(); return; }
    if (splitPhoto(local).json !== remote.json) { adopt(remote, null); G().toast("Updated from another device"); }
    paint();
  }, fail);
}

function detach() {
  if (unsub) unsub(); if (unsubPhoto) unsubPhoto();
  unsub = unsubPhoto = ref = photoRef = null;
}

/* ---------------------------------------------------------- boot */
async function boot() {
  if (!cfg.apiKey) { paint(); return; }
  try {
    const [app, auth, fs] = await Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-auth.js"), import(SDK + "firebase-firestore.js")]);
    const fapp = app.initializeApp(cfg);
    const a = auth.getAuth(fapp);
    let db;
    try { db = fs.initializeFirestore(fapp, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) }); }
    catch (e) { db = fs.getFirestore(fapp); }
    fb = { auth: a, db, GoogleAuthProvider: auth.GoogleAuthProvider, signInWithPopup: auth.signInWithPopup, signInWithRedirect: auth.signInWithRedirect,
      signOut: auth.signOut, doc: fs.doc, setDoc: fs.setDoc, getDoc: fs.getDoc, onSnapshot: fs.onSnapshot, serverTimestamp: fs.serverTimestamp };
    auth.getRedirectResult(a).catch(fail);
    window.GLL_onSave = () => schedule();
    auth.onAuthStateChanged(a, (user) => {
      C.user = user; C.error = null;
      detach();
      if (user) { C.state = "syncing"; paint(); attach(user).catch(fail); }
      else { C.state = "signedout"; paint(); }
    });
    window.addEventListener("online", () => { if (C.user) { C.state = C.pending ? "syncing" : "synced"; paint(); } });
    window.addEventListener("offline", () => { if (C.user) { C.state = "offline"; paint(); } });
  } catch (e) { C.state = "error"; fail(e); }
}

window.GLLCloud = { panelHTML, action };
if (window.GLL) boot(); else window.addEventListener("gll-ready", boot, { once: true });
paint();
