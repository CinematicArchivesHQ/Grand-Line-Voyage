#!/usr/bin/env python3
"""
Grand Line Voyage — manga data builder (run by .github/workflows/update-manga.yml).

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
UA = "GrandLineVoyage/1.0 (fan watch tracker; github.com/CinematicArchivesHQ/Grand-Line-Voyage)"


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
    data = urllib.parse.urlencode({"action": "expandtemplates", "prop": "wikitext", "text": text,
                                   "title": "Chapter 1", "format": "json", "formatversion": "2"}).encode()
    req = urllib.request.Request(API, data=data, headers={"User-Agent": UA})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                return json.load(r).get("expandtemplates", {}).get("wikitext", "")
        except Exception as e:
            if attempt == 4:
                raise
            print("retry", e)
            time.sleep(3 + attempt * 4)


DATE = re.compile(r"([A-Z][a-z]+ \d{1,2}, \d{4})")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def iso(d):
    m = DATE.search(d or "")
    if not m:
        return ""
    mon, day, yr = re.match(r"([A-Za-z]+) (\d+), (\d+)", m.group(1)).groups()
    return f"{yr}-{MONTHS.index(mon) + 1:02d}-{int(day):02d}" if mon in MONTHS else ""


def chapter_info(nums):
    """Expand WC / Which volume / WhichMangaDate for many chapters in one request."""
    sep = "\n@@@SPLIT@@@\n"
    text = sep.join(f"{{{{WC|Chapter {c}}}}}@@{{{{Which volume|{c}}}}}@@{{{{WhichMangaDate|Chapter {c}}}}}" for c in nums)
    parts = expand(text).split("@@@SPLIT@@@")
    out = {}
    for c, part in zip(nums, parts):
        bits = part.strip().split("@@")
        wc = bits[0] if bits else ""
        eps = []
        for ep, pages in re.findall(r"\[\[Episode (\d+)\]\](?:\s*\(p\.\s*([^)]*)\))?", wc):
            cnt = 0
            for a, b in re.findall(r"(\d+)(?:-(\d+))?", pages or ""):
                cnt += (int(b) - int(a) + 1) if b else 1
            eps.append((int(ep), cnt or 1))
        vol = int(bits[1]) if len(bits) > 1 and bits[1].strip().isdigit() else None
        out[c] = {"eps": eps, "vol": vol, "date": iso(bits[2] if len(bits) > 2 else "")}
    return out


def split_main(eps):
    """Separate the main adaptation from later flashbacks/recaps: keep episodes near the one with the most pages."""
    if not eps:
        return [], []
    top = max(p for _, p in eps)
    best = min(e for e, p in eps if p >= max(3, top * 0.3))  # earliest substantial adaptation
    main = sorted({e for e, _ in eps if abs(e - best) <= 6})
    extra = sorted({e for e, _ in eps if abs(e - best) > 6})
    return main, extra


def meta_names():
    txt = open(os.path.join(ROOT, "js", "meta.js"), encoding="utf-8").read()
    return re.findall(r'C\((\d+), "([^"]+)", "([^"]+)"', txt)


def main():
    if "--probe" in sys.argv:
        print(json.dumps(chapter_info([1, 2, 8, 1126, 1150]), ensure_ascii=False))
        return
    eps_txt = open(EPISODES_JS, encoding="utf-8").read()
    last_ep = max(int(n) for n in re.findall(r"\[(\d+),\"", eps_txt))

    # ---- chapter pages (titles), walking until pages stop existing
    titles, n = {}, 1
    while n < 3000:
        pages = fetch_pages([f"Chapter {k}" for k in range(n, n + 50)])
        found = 0
        for k in range(n, n + 50):
            t = pages.get(f"Chapter {k}")
            if t:
                found += 1
                box = infobox(t)
                titles[k] = clean(pick(box, "ename", "title")) or clean(box.get("rname", ""))
        if found == 0:
            break
        n += 50
    last_ch = max(titles)
    print(f"chapters: {len(titles)} (latest {last_ch})")

    # ---- chapter -> episodes, volume, date
    info = {}
    nums = sorted(titles)
    for i in range(0, len(nums), 8):
        got = chapter_info(nums[i:i + 8])
        info.update(got)
        if i % 200 == 0:
            print(f"  chapters {nums[i]}+: {sum(1 for v in got.values() if v['eps'])}/{len(got)} have episodes")
        time.sleep(0.3)
    chapters, ep_main, ep_extra = [], {}, {}
    for c in nums:
        d = info.get(c, {})
        main_eps, extra = split_main([e for e in d.get("eps", []) if e[0] <= last_ep + 50])
        chapters.append([c, titles[c], d.get("vol"), d.get("date", ""), main_eps, extra])
        for e in main_eps:
            ep_main.setdefault(e, []).append(c)
        for e in extra:
            ep_extra.setdefault(e, []).append(c)
    print(f"episodes with main chapters: {len(ep_main)}; flashback references: {len(ep_extra)}")

    # ---- character debut episodes from Episode pages (charDebut field)
    debut_by_name = {}
    for s in range(1, last_ep + 1, 50):
        pages = fetch_pages([f"Episode {k}" for k in range(s, min(s + 50, last_ep + 1))])
        for k in range(s, min(s + 50, last_ep + 1)):
            box = infobox(pages.get(f"Episode {k}", ""))
            for name in re.findall(r"\[\[([^\]|#]+)", box.get("chardebut", "")):
                debut_by_name.setdefault(name.strip(), k)
    alias = {"Axe-Hand Morgan": "Morgan", "Klahadore": "Kuro", "Mr. 5 & Miss Valentine": "Gem & Mikita", "Mr. 3": "Galdino",
             "Miss Goldenweek": "Marianne", "Bon Clay": "Bentham", "Mr. 1 & Miss Doublefinger": "Daz Bonez & Zala",
             "Dr. Kureha": "Kureha", "Dr. Hiriluk": "Hiriluk", "Kohza": "Koza", "Saint Charlos": "Charlos", "Curly Dadan": "Curly Dadan",
             "Madam Shyarly": "Shyarly", "Don Chinjao": "Chinjao", "The One-Legged Toy Soldier": "Kyros", "Komurasaki": "Kozuki Hiyori",
             "Hyogoro": "Hyogoro", "Vegapunk Lilith": "Lilith", "Dr. Vegapunk": "Vegapunk", "Kozuki Momonosuke": "Kozuki Momonosuke",
             "Professor Clover": "Clover", "Marco": "Marco", "Trafalgar Law": "Trafalgar D. Water Law"}
    debuts = {}
    for ep, cid, name in meta_names():
        cands = [p.strip() for p in re.split(r"\s*&\s*|,\s*", alias.get(name, name) + " & " + name)]
        hits = [debut_by_name[c] for c in cands if c in debut_by_name]
        if hits:
            debuts[cid] = min(hits)
        else:
            print("no wiki debut match:", name)
    print(f"character debuts matched: {len(debuts)}")

    if len(chapters) < 1000 or len(ep_main) < 800:
        sys.exit("Too little data parsed — not writing manga.js")
    data = {"updated": time.strftime("%Y-%m-%d"), "source": "One Piece Wiki (CC BY-SA)",
            "chapters": chapters, "debuts": debuts}
    content = "/* Auto-generated by tools/update_manga.py from the One Piece Wiki (onepiece.fandom.com, CC BY-SA 3.0).\n" \
              "   chapters: [number, title, volume, release date, [episodes adapting it], [later flashback/recap episodes]] */\n" \
              "window.OP_MANGA=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("],[", "],\n[") + ";\n"
    old = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
    strip = lambda t: re.sub(r'"updated":"[^"]*"', "", t)
    if strip(old) != strip(content):
        open(OUT, "w", encoding="utf-8").write(content)
        print("updated js/manga.js")
    else:
        print("no changes")


if __name__ == "__main__":
    main()
