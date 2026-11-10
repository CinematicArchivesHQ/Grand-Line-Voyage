#!/usr/bin/env python3
"""
Grand Line Logbook — data updater (run by .github/workflows/update-data.yml).

Pulls One Piece (TMDB tv id 37854) from The Movie Database and:
  * appends newly aired episodes to js/episodes.js
  * writes announced-but-unaired episodes to js/upcoming.js
  * writes season posters, episode stills and synopses to js/art.js

Needs a free TMDB key in the environment: TMDB_API_KEY (v3 key) or TMDB_TOKEN (v4 read token).
Standard library only. Safe to run repeatedly; files are only rewritten when content changes.
"""
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EPISODES_JS = os.path.join(ROOT, "js", "episodes.js")
ART_JS = os.path.join(ROOT, "js", "art.js")
UPCOMING_JS = os.path.join(ROOT, "js", "upcoming.js")
META_JS = os.path.join(ROOT, "js", "meta.js")
TV_ID = 37854
API = "https://api.themoviedb.org/3"
PLACEHOLDER = re.compile(r"^(episode|エピソード|第)\s*\d+", re.I)


def get(path, **params):
    key, token = os.environ.get("TMDB_API_KEY"), os.environ.get("TMDB_TOKEN")
    if not key and not token:
        sys.exit("Set TMDB_API_KEY or TMDB_TOKEN")
    params.setdefault("language", "en-US")
    if key:
        params["api_key"] = key
    req = urllib.request.Request(API + path + "?" + urllib.parse.urlencode(params))
    req.add_header("Accept", "application/json")
    if token and not key:
        req.add_header("Authorization", "Bearer " + token)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except Exception as e:  # rate limit / transient
            if attempt == 3:
                raise
            print("retry", path, e)
            time.sleep(2 + attempt * 3)


def read_js_array(path, var):
    txt = open(path, encoding="utf-8").read()
    m = re.search(r"window\." + var + r"\s*=\s*(\[.*\]);", txt, re.S)
    return json.loads(m.group(1)) if m else []


def write_if_changed(path, content):
    old = open(path, encoding="utf-8").read() if os.path.exists(path) else None
    if old != content:
        open(path, "w", encoding="utf-8").write(content)
        print("updated", os.path.relpath(path, ROOT))
        return True
    return False


def season_ranges():
    """Read our season start/end numbers from meta.js."""
    txt = open(META_JS, encoding="utf-8").read()
    return [(int(n), int(a), int(b)) for n, a, b in re.findall(r"\{ n: (\d+),.*?start: (\d+), end: (\d+)", txt)]


def main():
    today = dt.date.today().isoformat()
    ours = read_js_array(EPISODES_JS, "OP_EPISODES")  # [n, title, date]
    show = get(f"/tv/{TV_ID}")
    tmdb = []  # flattened TMDB episodes in broadcast order
    for s in sorted(show.get("seasons", []), key=lambda x: x["season_number"]):
        if s["season_number"] == 0:
            continue
        data = get(f"/tv/{TV_ID}/season/{s['season_number']}")
        for e in data.get("episodes", []):
            tmdb.append({
                "season": s["season_number"], "poster": s.get("poster_path"),
                "name": (e.get("name") or "").strip(), "date": e.get("air_date") or "",
                "still": e.get("still_path"), "ov": (e.get("overview") or "").strip(),
                "num": e.get("episode_number"),
            })
        time.sleep(0.25)
    tmdb.sort(key=lambda e: (e["date"] or "9999", e["season"], e["num"]))
    print(f"TMDB episodes: {len(tmdb)}; ours: {len(ours)}")

    # --- match by air date (several episodes can share a date; keep broadcast order)
    by_date_t, by_date_o = {}, {}
    for e in tmdb:
        by_date_t.setdefault(e["date"], []).append(e)
    for n, t, d in ours:
        by_date_o.setdefault(d, []).append(n)
    match = {}
    for d, nums in by_date_o.items():
        for n, e in zip(sorted(nums), by_date_t.get(d, [])):
            match[n] = e
    # fallback: TMDB lists the same episodes in the same order, so use position when dates differ slightly
    used = {id(e) for e in match.values()}
    for i, (n, t, d) in enumerate(ours):
        if n in match or i >= len(tmdb):
            continue
        e = tmdb[i]
        if id(e) in used or not e["date"] or not d:
            continue
        gap = abs((dt.date.fromisoformat(e["date"]) - dt.date.fromisoformat(d)).days)
        if gap <= 14:
            match[n] = e
            used.add(id(e))
    print(f"matched {len(match)} of {len(ours)} episodes (air date, then position)")

    # --- new aired episodes after our last one
    last_n, last_d = ours[-1][0], ours[-1][2]
    added = 0
    upcoming = []
    nxt = last_n
    for e in tmdb:
        if not e["date"] or e["date"] <= last_d:
            continue
        nxt += 1
        title = e["name"] if e["name"] and not PLACEHOLDER.match(e["name"]) else ""
        if e["date"] <= today and title:
            ours.append([nxt, title, e["date"]])
            match[nxt] = e
            added += 1
        else:
            upcoming.append([nxt, title or f"Episode {nxt}", e["date"]])
    if added:
        print(f"appending {added} new episode(s)")

    eps_js = "/* Auto-generated episode list: [number, title, original Japanese air date] */\nwindow.OP_EPISODES=" + \
        json.dumps(ours, ensure_ascii=False, separators=(",", ":")).replace("],[", "],\n[") + ";\n"
    write_if_changed(EPISODES_JS, eps_js)
    write_if_changed(UPCOMING_JS, "/* Auto-generated by tools/update_data.py: announced episodes that have not aired yet. */\nwindow.OP_UPCOMING=" +
                     json.dumps(upcoming[:12], ensure_ascii=False) + ";\n")

    # --- artwork: our season -> TMDB season with the most overlapping episodes
    posters = {}
    for sn, a, b in season_ranges():
        counts = {}
        for n in range(a, (b if b < 10 ** 6 else nxt) + 1):
            e = match.get(n)
            if e and e["poster"]:
                counts[e["poster"]] = counts.get(e["poster"], 0) + 1
        if counts:
            posters[sn] = max(counts, key=counts.get)
    art = {
        "updated": today,
        "series": show.get("poster_path"),
        "posters": posters,
        "stills": {n: e["still"] for n, e in sorted(match.items()) if e.get("still")},
        "ov": {n: e["ov"] for n, e in sorted(match.items()) if e.get("ov")},
    }
    content = "/* Auto-generated by tools/update_data.py from TMDB. */\nwindow.OP_ART=" + \
        json.dumps(art, ensure_ascii=False, separators=(",", ":")) + ";\n"
    old = open(ART_JS, encoding="utf-8").read() if os.path.exists(ART_JS) else ""
    strip = lambda t: re.sub(r'"updated":"[^"]*"', "", t)
    if strip(old) != strip(content):  # don't commit daily just because the date changed
        write_if_changed(ART_JS, content)

if __name__ == "__main__":
    main()
