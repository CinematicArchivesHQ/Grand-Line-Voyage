# Grand Line Voyage — One Piece Completionist Watchlist

A CinematicArchivesHQ fan project: a static, no-build web app for tracking every episode of the
*One Piece* anime (1999–present).

## Features
- **Faux loading voyage** – a bobbing gold coin while a little ship sails across an "ocean" loading bar (click to skip; respects reduced-motion).
- **Voyage dashboard** – next episode, up-next queue, completion %, hours watched/remaining, ETA at your pace, streak, a 22-island route map, "on this day" premieres.
- **Logbook** – all 22 seasons (named for their main arc), grouped by story arc, with title, Japanese air date, and Canon / Mixed / Filler / Recap tags. Search, filters, mark whole arcs/seasons, "mark all up to here".
- **Episode details** – ratings, favorites, notes, landmark-episode tags, characters who debut in that episode.
- **Crew guide** – ~190 key characters as wanted posters, sortable by season or by order of introduction, with a spoiler shield that unlocks characters as you watch. Straw Hat roster fills in as members join.
- **Bounty Board** – 60+ achievements that raise your personal bounty and rank (Stowaway → King of the Pirates).
- **Ship's Log** – activity heatmap, weekly chart, canon/filler breakdown, per-season completion and ratings, broadcast-year chart, finish-date calculator.
- **Side Voyages** – Netflix live action and the 15 animated films, tracked separately (never counted toward 1999-series completion).
- **Manga tracker** – every released chapter (title, volume, release date) grouped by arc, with read checkboxes, editable read dates, "read 1 → N", and manga bounties.
- **Anime ↔ manga correlation** – each episode lists the exact chapters it adapts (and each chapter the episodes that animate it), a chart plotting every episode against the chapters adapted, where your anime and manga progress line up, and adaptation pace per season.
- **Where to watch** – Crunchyroll, Netflix, Hulu and JustWatch links on every season.
- **Settings** – minutes per episode, canon-only completion mode, skip filler in "next up", export/restore JSON backups.

Progress is stored in the browser's `localStorage` (key `grandline-logbook-v1`, kept from the original name so existing progress carries over).

## Cloud profile (Firebase)
Sign in with Google under **Settings → Cloud sync** to sync progress across browsers and devices.
- `js/cloud.js` loads the Firebase SDK from Google's CDN; `js/firebase-config.js` holds the project's public web config.
- Progress lives in Firestore at `users/{uid}` (one JSON document); the wanted-poster photo at `users/{uid}/extra/photo`.
- Every change saves locally first, then uploads within ~1 second; other open devices update live. Offline changes queue and upload on reconnect.
- The first time a browser with existing progress signs in, you choose: merge, keep the cloud copy, or keep this browser's copy.
- `firestore.rules` is the security rule template (only the owner's Google account can read/write); the live rules are set in the Firebase console.

## Deploy on GitHub Pages
1. Create a repo (e.g. `onepiece-completionist-watchlist`) under CinematicArchivesHQ.
2. Upload everything in this folder to the repo root (`index.html`, `css/`, `js/`, `assets/`).
3. Settings → Pages → Deploy from branch → `main` / root.
4. Site will be at `https://cinematicarchiveshq.github.io/onepiece-completionist-watchlist/`.

## Automatic updates & artwork (TMDB)
`.github/workflows/update-data.yml` runs daily (and on demand from the **Actions** tab). It calls
`tools/update_data.py`, which pulls One Piece from TMDB and commits any changes:
- newly aired episodes are appended to `js/episodes.js` (they join the ongoing season automatically),
- announced episodes go to `js/upcoming.js` ("On the horizon" on the Voyage page),
- season posters, episode stills and episode synopses go to `js/art.js`.

**One-time setup:** get a free API key at themoviedb.org (Settings → API), then in this repo go to
Settings → Secrets and variables → Actions → New repository secret, name it `TMDB_API_KEY`, paste the key,
and run the workflow once from the Actions tab. Until then the site works without artwork.
Episode stills and synopses respect the spoiler shield (shown for watched episodes and the next one).

### Manga data (One Piece Wiki)
`.github/workflows/update-manga.yml` runs weekly (and on demand). `tools/update_manga.py` reads the
One Piece Wiki's MediaWiki API (CC BY-SA) for chapter titles, volumes, release dates, page-level
chapter→episode mapping and character debut episodes, and writes `js/manga.js`. No key needed.

## Adding episodes by hand
Append rows to `js/episodes.js` in the form `[1181,"Episode title","2027-04-04"]`, then bump
`end` for season 22 (or add a season 23) in `js/meta.js`. Arc ranges, filler ranges, highlights
and characters all live in `js/meta.js`.

## Data notes
Episode titles and Japanese air dates are compiled from public episode lists (Wikipedia, official announcements).
Arc groupings, filler classification and character debut episodes follow common fan conventions and are best-effort.
Unofficial and fan-made; no video is hosted. ONE PIECE © Eiichiro Oda / Shueisha, Toei Animation.

### Reading style (what to read before watching)
Settings → **Reading style** (or the chips on the Manga tab): *Off*, *Manga first* or *Anime first*.
- **Manga first** — Next on the voyage shows "📖 Read first: Chapters X–Y" with **Mark read** / **Open chapter**; Logbook rows get a 📖 chip. It's only a reminder — you can always mark the episode watched.
- **Anime first** — after you mark an episode watched, a toast offers to mark its chapters read.

### Poster viewer
Tap any wanted poster (Crew tab, or your own on Bounties) to hold it up to the light: it tilts with your phone's gyroscope and a sheen slides across it. iPhone asks once for Motion & Orientation access; if declined, drag a finger across the poster instead. On a computer it follows the mouse. "Reduce motion" in Settings shows it still.

