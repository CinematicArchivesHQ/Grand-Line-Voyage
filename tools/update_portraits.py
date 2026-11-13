#!/usr/bin/env python3
"""Fetch a character picture from the One Piece Wiki for every character in js/meta.js.

Picks the EARLIEST look the wiki has (an anime "Pre Timeskip" infobox image when there is one),
so the Crew tab doesn't show post-time-skip designs early. Writes:
  assets/portraits/<id>.webp   (360px wide)
  js/portraits.js              window.GLV_PORTRAITS = { id: { f: wiki file, r: 1 if worth a look } }
  tools/portraits_report.md    what was picked for each character, with a "check these" list

Run from the repo root:  python tools/update_portraits.py [--force] [--only id,id]
Manual fixes: add a wiki page title to TITLES, or pin an exact file in FILES, and run again with --only.
"""
import io, json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

API = "https://onepiece.fandom.com/api.php"
UA = "GrandLineVoyage/1.0 (personal watch tracker; github.com/CinematicArchivesHQ/Grand-Line-Voyage)"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "portraits"
TIMESKIP_EP = 517  # first post-time-skip episode

# Character id -> wiki page title, when the app's display name isn't the page name.
TITLES = {
    "roger": "Gol D. Roger",
    "luffy": "Monkey D. Luffy",
    "zoro": "Roronoa Zoro",
    "garp": "Monkey D. Garp",
    "dragon": "Monkey D. Dragon",
    "ace": "Portgas D. Ace",
    "whitebeard": "Edward Newgate",
    "blackbeard": "Marshall D. Teach",
    "morgan": "Morgan",
    "clover": "Clover",
    "ryuma": "Shimotsuki Ryuma",
    "shyarly": "Shyarly",
    "lilith": "Lilith",
}
# Character id -> exact wiki file to use (wins over everything else).
FILES = {}


def api(**params):
    params.update(format="json", formatversion="2")
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except Exception as e:  # noqa: BLE001
            if attempt == 3:
                raise
            print("  retry", e)
            time.sleep(2 + attempt * 3)


def characters():
    src = (ROOT / "js" / "meta.js").read_text(encoding="utf-8")
    out = []
    for m in re.finditer(r'\bC\(\s*(\d+)\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"', src):
        out.append({"ep": int(m.group(1)), "id": m.group(2), "name": m.group(3)})
    return out


def score(fname, page):
    f = fname.lower()
    s = 0
    if "infobox" in f: s += 100
    if "anime" in f: s += 20
    if "manga" in f: s -= 5
    if re.search(r"pre[\s_-]*time[\s_-]*skip", f): s += 40
    if re.search(r"post[\s_-]*time[\s_-]*skip", f): s -= 60
    if re.search(r"\b(young|child|kid|baby)\b", f): s -= 30
    if f.startswith(page.lower()): s += 10
    if not f.endswith((".png", ".jpg", ".jpeg", ".webp")): s -= 500
    return s


def pick(ch):
    title = TITLES.get(ch["id"], ch["name"])
    d = api(action="query", titles=title, redirects=1, prop="images|pageprops|pageimages",
            imlimit="max", ppprop="disambiguation", piprop="name")
    pages = d.get("query", {}).get("pages", [])
    if not pages or pages[0].get("missing"):
        return None, title, "no wiki page"
    p = pages[0]
    page = p["title"]
    if "pageprops" in p and "disambiguation" in p["pageprops"]:
        return None, page, "disambiguation page — add to TITLES"
    if ch["id"] in FILES:
        return FILES[ch["id"]], page, ""
    imgs = [i["title"].split(":", 1)[1] for i in p.get("images", [])]
    infobox = [f for f in imgs if "infobox" in f.lower()]
    has_post = any(re.search(r"post[\s_-]*time[\s_-]*skip", f.lower()) for f in infobox)
    if infobox:
        best = max(infobox, key=lambda f: score(f, page))
        fl = best.lower()
        note = ""
        if ch["ep"] < TIMESKIP_EP and has_post and not re.search(r"pre[\s_-]*time[\s_-]*skip", fl):
            note = "may show a post-time-skip look"
        elif re.search(r"post[\s_-]*time[\s_-]*skip", fl) and ch["ep"] < TIMESKIP_EP:
            note = "post-time-skip image (no earlier one found)"
        return best, page, note
    if p.get("pageimage"):
        return p["pageimage"].replace("_", " "), page, "no infobox image; used the page's main image"
    return None, page, "no image found"


def download(fname, dest):
    from PIL import Image
    d = api(action="query", titles="File:" + fname, prop="imageinfo", iiprop="url", iiurlwidth=360)
    info = d["query"]["pages"][0].get("imageinfo")
    if not info:
        raise RuntimeError("file not found")
    url = info[0].get("thumburl") or info[0]["url"]
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        raw = r.read()
    im = Image.open(io.BytesIO(raw))
    im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
    if im.width > 360:
        im = im.resize((360, round(im.height * 360 / im.width)), Image.LANCZOS)
    im.save(dest, "WEBP", quality=82, method=6)


def main():
    force = "--force" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = set(x.strip() for x in sys.argv[sys.argv.index("--only") + 1].split(",") if x.strip())
    OUT.mkdir(parents=True, exist_ok=True)
    js_path = ROOT / "js" / "portraits.js"
    known = {}
    m = re.search(r"=\s*(\{.*\})\s*;", js_path.read_text(encoding="utf-8"), re.S) if js_path.exists() else None
    if m:
        known = json.loads(m.group(1))

    rows = []
    for ch in characters():
        cid = ch["id"]
        dest = OUT / (cid + ".webp")
        if only and cid not in only:
            if cid in known: rows.append((ch, known[cid].get("p", ""), known[cid]["f"], known[cid].get("n", "")))
            continue
        if dest.exists() and cid in known and not force:
            rows.append((ch, known[cid].get("p", ""), known[cid]["f"], known[cid].get("n", "")))
            continue
        try:
            fname, page, note = pick(ch)
            if fname:
                download(fname, dest)
                known[cid] = {"f": fname, "p": page, "r": 1 if note else 0, **({"n": note} if note else {})}
            else:
                known.pop(cid, None)
                if dest.exists(): dest.unlink()
            rows.append((ch, page, fname or "", note))
            print(f"{cid:<14} {fname or '—':<60} {note}")
        except Exception as e:  # noqa: BLE001
            rows.append((ch, "", "", "error: " + str(e)))
            print(f"{cid:<14} ERROR {e}")
        time.sleep(0.4)

    known = {k: known[k] for k in sorted(known)}
    js_path.write_text("// Generated by tools/update_portraits.py — character pictures from the One Piece Wiki.\n"
                       "// f = wiki file, p = wiki page, r = 1 when worth a manual look.\n"
                       "window.GLV_PORTRAITS = " + json.dumps(known, ensure_ascii=False, indent=0) + ";\n", encoding="utf-8")

    check = [r for r in rows if r[3]]
    lines = ["# Character pictures", "",
             f"{sum(1 for r in rows if r[2])} of {len(rows)} characters have a picture. "
             "Pictures come from each character's One Piece Wiki page, preferring the earliest (pre-time-skip) anime look.", "",
             "## Worth a look", ""]
    lines += [f"- **{r[0]['name']}** (`{r[0]['id']}`, debuts Ep {r[0]['ep']}): {r[3]}" + (f" — `{r[2]}`" if r[2] else "") for r in check] or ["Nothing flagged."]
    lines += ["", "## Everything", "", "| Character | Wiki page | File |", "|---|---|---|"]
    lines += [f"| {r[0]['name']} | {r[1]} | {r[2] or '—'} |" for r in rows]
    (ROOT / "tools" / "portraits_report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nDone. {len(check)} flagged for a look.")


if __name__ == "__main__":
    main()
