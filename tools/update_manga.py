#!/usr/bin/env python3
"""
Grand Line Logbook — manga data builder (run by .github/workflows/update-manga.yml).

Reads the One Piece Wiki (onepiece.fandom.com, CC BY-SA) through its MediaWiki API and writes js/manga.js:
  chapters: [[number, title, volume, release date], ...]
  ep:       {episode: [chapters adapted], ...}
Standard library only. Pass --probe to print raw infobox fields for a few pages (debugging).
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "js", "manga.js")
EPISODES_JS = os.path.join(ROOT, "js", "episodes.js")
API = "https://onepiece.fandom.com/api.php"
UA = "GrandLineLogbook/1.0 (fan watch tracker; github.com/CinematicArchivesHQ/Grand-Line-Voyage)"


def api(**params):
    params.update(format="json", formatversion="2")
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(params), headers={"User-Agent": UA})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:
            if attempt == 4:
                raise
            print("retry", e)
            time.sleep(3 + attempt * 4)


def fetch_pages(titles):
    """Return {title: wikitext} for up to 50 titles, following redirects."""
    out = {}
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        d = api(action="query", prop="revisions", rvprop="content", rvslots="main", redirects="1", titles="|".join(batch))
        q = d.get("query", {})
        back = {}
        for r in q.get("redirects", []) + q.get("normalized", []):
            back[r["to"]] = back.get(r["from"], r["from"])
        for p in q.get("pages", []):
            if p.get("missing") or "revisions" not in p:
                continue
            text = p["revisions"][0]["slots"]["main"]["content"]
            out[back.get(p["title"], p["title"])] = text
            out[p["title"]] = text
        time.sleep(0.6)
    return out


def infobox(text):
    """Parse the first template's |key = value params (top level only)."""
    m = re.search(r"\{\{\s*(Chapter|Episode)[ _]?Box", text, re.I) or re.search(r"\{\{", text)
    if not m:
        return {}
    i, depth, start = m.start(), 0, m.start()
    while i < len(text):
        if text.startswith("{{", i):
            depth += 1; i += 2; continue
        if text.startswith("}}", i):
            depth -= 1; i += 2
            if depth == 0:
                break
            continue
        i += 1
    body = text[start + 2:i - 2]
    parts, cur, d = [], "", 0
    for ch in body:
        if ch in "{[":
            d += 1
        elif ch in "}]":
            d -= 1
        if ch == "|" and d == 0:
            parts.append(cur); cur = ""
        else:
            cur += ch
    parts.append(cur)
    res = {}
    for p in parts[1:]:
        if "=" in p:
            k, v = p.split("=", 1)
            res[k.strip().lower()] = v.strip()
    return res


def clean(v):
    v = re.sub(r"<ref.*?(</ref>|/>)", "", v, flags=re.S)
    v = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", v)
    v = re.sub(r"\{\{[^{}]*\}\}", "", v)
    v = re.sub(r"<[^>]+>", "", v)
    v = re.sub(r"'''?", "", v)
    return re.sub(r"\s+", " ", v).strip()


def ints(v, hi):
    v = clean(v)
    out = []
    for a, b in re.findall(r"(\d+)\s*(?:[-–]\s*(\d+))?", v):
        a = int(a)
        b = int(b) if b else a
        if 0 < a <= hi and a <= b <= hi and b - a < 40:
            out.extend(range(a, b + 1))
    return sorted(set(out))


def pick(box, *keys):
    for k in keys:
        if box.get(k):
            return box[k]
    return ""


def expand(text):
    d = api(action="expandtemplates", prop="wikitext", text=text, title="Chapter 1")
    return d.get("expandtemplates", {}).get("wikitext", "")


def explore():
    for c in (1, 2, 8, 100, 1000, 1126, 1140, 1150, 1170):
        print(f"=== ch{c}:", json.dumps(expand(f"{{{{WC|Chapter {c}}}}}@@{{{{Which volume|{c}}}}}@@{{{{WhichMangaDate|Chapter {c}}}}}"), ensure_ascii=False)[:600])
    return
    for t, txt in fetch_pages(["Template:Chapter Box", "Template:Episode Box"]).items():
        if t.startswith("Template"):
            print(f"=== {t}:", json.dumps(txt[:2500], ensure_ascii=False))
    d = api(action="query", list="allpages", apnamespace="828", aplimit="500")
    names = [p["title"] for p in d.get("query", {}).get("allpages", [])]
    print("=== modules:", json.dumps(names, ensure_ascii=False))


def main():
    probe = "--probe" in sys.argv
    if probe:
        explore()
        return
    eps_txt = open(EPISODES_JS, encoding="utf-8").read()
    last_ep = max(int(n) for n in re.findall(r"\[(\d+),\"", eps_txt))

    # ---- chapters: walk until several consecutive pages are missing
    chapters, n, misses = [], 1, 0
    while misses < 3 and n < 3000:
        titles = [f"Chapter {k}" for k in range(n, n + 50)]
        pages = fetch_pages(titles)
        for k in range(n, n + 50):
            t = pages.get(f"Chapter {k}")
            if not t:
                misses += 1
                continue
            misses = 0
            box = infobox(t)
            if probe and k in (1, 1000):
                print(f"--- Chapter {k} raw:", json.dumps(t[:3000], ensure_ascii=False))
            title = clean(pick(box, "ename", "title", "eng", "english"))
            vol = ints(pick(box, "vol", "volume"), 300)
            date = clean(pick(box, "date", "release", "released"))
            chapters.append([k, title, vol[0] if vol else None, date])
            if misses >= 3:
                break
        n += 50
        if probe and n > 100:
            break
    print(f"chapters found: {len(chapters)}")

    # ---- episodes -> chapters
    ep_map = {}
    hi = chapters[-1][0] + 5 if chapters else 2000
    for s in range(1, last_ep + 1, 50):
        pages = fetch_pages([f"Episode {k}" for k in range(s, min(s + 50, last_ep + 1))])
        for k in range(s, min(s + 50, last_ep + 1)):
            t = pages.get(f"Episode {k}")
            if not t:
                continue
            box = infobox(t)
            if probe and k in (1, 30):
                print(f"--- Episode {k} raw:", json.dumps(t[:3500], ensure_ascii=False))
            chs = ints(pick(box, "chapter", "chapters", "adapted", "manga"), hi)
            if chs:
                ep_map[k] = chs
        if probe and s > 1:
            break
    print(f"episodes with chapters: {len(ep_map)} of {last_ep}")
    if probe:
        return
    if len(chapters) < 1000 or len(ep_map) < 900:
        sys.exit("Too little data parsed — not writing manga.js")

    data = {"updated": time.strftime("%Y-%m-%d"), "source": "One Piece Wiki (CC BY-SA)", "chapters": chapters, "ep": ep_map}
    content = "/* Auto-generated by tools/update_manga.py from the One Piece Wiki (CC BY-SA 3.0). */\nwindow.OP_MANGA=" + \
        json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    old = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
    strip = lambda s: re.sub(r'"updated":"[^"]*"', "", s)
    if strip(old) != strip(content):
        open(OUT, "w", encoding="utf-8").write(content)
        print("updated js/manga.js")
    else:
        print("no changes")


if __name__ == "__main__":
    main()
