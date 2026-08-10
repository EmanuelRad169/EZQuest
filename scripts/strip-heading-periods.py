#!/usr/bin/env python3
"""Remove a single trailing period from heading/title/kicker text (not
sentence subheads or body copy). Targets JSON template values, Liquid
{% schema %} defaults + presets, hardcoded heading markup, and page-cta
render params. Dry-run by default; pass --apply to write."""
import json, re, sys, glob, os

ROOT = "/sessions/keen-modest-hypatia/mnt/EZQuest"
APPLY = "--apply" in sys.argv

HEAD = re.compile(r"(heading|title|kicker)", re.I)
NO = re.compile(r"(sub|body|copy|desc|answer|intro|label|link|url|image|icon|paragraph|closer|lead|note|statement|before|after)", re.I)

def strip_period(v):
    if not isinstance(v, str):
        return v, False
    s = v.rstrip()
    if len(s) > 1 and s.endswith(".") and not s.endswith(".."):
        trailing_ws = v[len(s):]
        return s[:-1] + trailing_ws, True
    return v, False

changes = []

def key_is_heading(k):
    return bool(HEAD.search(k)) and not NO.search(k)

# ---- JSON templates ----
def walk(obj, path, parent_key=None):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                walk(v, path + "." + str(k), k)
            elif isinstance(v, str) and key_is_heading(str(k)):
                nv, ch = strip_period(v)
                if ch:
                    obj[k] = nv; changes.append((path + "." + str(k), v, nv))

for jf in glob.glob(ROOT + "/templates/**/*.json", recursive=True):
    raw = open(jf).read()
    m = re.match(r"\s*/\*.*?\*/\s*", raw, re.S)
    banner = raw[:m.end()] if m else ""
    body = raw[m.end():] if m else raw
    try:
        data = json.loads(body)
    except Exception:
        continue
    before = len(changes)
    walk(data, os.path.relpath(jf, ROOT))
    if len(changes) > before and APPLY:
        open(jf, "w").write(banner + json.dumps(data, indent=2, ensure_ascii=False) + "\n")

# ---- Liquid: schema defaults + presets, markup, render params ----
def walk_schema(obj):
    changed = False
    if isinstance(obj, dict):
        # setting definition: {id, default}
        if "id" in obj and "default" in obj and key_is_heading(str(obj["id"])):
            nv, ch = strip_period(obj["default"])
            if ch:
                changes.append(("schema:" + str(obj["id"]), obj["default"], nv)); obj["default"] = nv; changed = True
        # preset block/section settings: {title: "..."} or {heading:...}
        if "settings" in obj and isinstance(obj["settings"], dict):
            for sk, sv in obj["settings"].items():
                if key_is_heading(sk) and isinstance(sv, str):
                    nv, ch = strip_period(sv)
                    if ch:
                        changes.append(("preset:" + sk, sv, nv)); obj["settings"][sk] = nv; changed = True
        for v in obj.values():
            if isinstance(v, (dict, list)):
                changed = walk_schema(v) or changed
    elif isinstance(obj, list):
        for v in obj:
            changed = walk_schema(v) or changed
    return changed

MARKUP_RE = re.compile(
    r'(<(h1|h2|h3|h4|p)\b[^>]*\bclass="[^"]*'
    r'(?:section-intro__heading|story-section-intro__heading|section-heading|'
    r'section-title|about-section-head__heading|ez-promise__heading|__kicker|section-kicker)[^"]*"[^>]*>)'
    r'([^<>{}]+?)(</\2>)'
)
def markup_repl(m):
    inner = m.group(3)
    nv, ch = strip_period(inner)
    if ch:
        changes.append(("markup:", inner.strip(), nv.strip()))
        return m.group(1) + nv + m.group(4)
    return m.group(0)

RENDER_RE = re.compile(r"(heading|kicker):\s*'([^']*?)\.'")
def render_repl(m):
    changes.append(("render:" + m.group(1), m.group(2) + ".", m.group(2)))
    return m.group(1) + ": '" + m.group(2) + "'"

for lf in glob.glob(ROOT + "/sections/*.liquid") + glob.glob(ROOT + "/snippets/*.liquid"):
    src = open(lf).read()
    before = len(changes)
    # schema
    sm = re.search(r"({% schema %})(.*?)({% endschema %})", src, re.S)
    if sm:
        try:
            sch = json.loads(sm.group(2))
            if walk_schema(sch):
                src = src[:sm.start()] + sm.group(1) + "\n" + json.dumps(sch, indent=2, ensure_ascii=False) + "\n" + sm.group(3) + src[sm.end():]
        except Exception as e:
            pass
    # markup + render params (outside schema — operate on whole file, schema uses JSON quotes so RENDER_RE won't hit it)
    src = MARKUP_RE.sub(markup_repl, src)
    src = RENDER_RE.sub(render_repl, src)
    if len(changes) > before:
        print("LIQUID", os.path.relpath(lf, ROOT))
        if APPLY:
            open(lf, "w").write(src)

for path, old, new in changes:
    print("  ", path, "|", repr(old), "->", repr(new))
print("\nTOTAL:", len(changes), "(APPLY)" if APPLY else "(dry-run)")
