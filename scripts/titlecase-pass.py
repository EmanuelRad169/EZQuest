#!/usr/bin/env python3
"""Title-case UI strings (headings, kickers, subheads, buttons, nav labels)
across JSON templates and Liquid sections/snippets.

Style: proper title case. Minor words stay lowercase unless first/last.
Any word that already contains an uppercase letter or a digit is left
untouched (preserves USB-C, GaN, HDMI, 4K, USB4, EZQuest, MacBook, iMac...).

Run with --apply to write; default is dry-run (prints proposed changes).
"""
import json, re, sys, os, glob

ROOT = "/sessions/keen-modest-hypatia/mnt/EZQuest"
APPLY = "--apply" in sys.argv

MINOR = {
    "a","an","and","as","at","but","by","for","from","in","into","nor","of",
    "off","on","onto","or","over","per","so","the","to","up","via","vs","with","yet",
}

WORD_RE = re.compile(r"[0-9A-Za-z][0-9A-Za-z'’.\-/&]*")

def has_upper_or_digit(w):
    return any(c.isupper() for c in w) or any(c.isdigit() for c in w)

def title_case(text):
    # Split into word tokens, remember indices to know first/last real words.
    matches = list(WORD_RE.finditer(text))
    if not matches:
        return text
    first_i, last_i = 0, len(matches) - 1
    out = []
    cursor = 0
    for i, m in enumerate(matches):
        out.append(text[cursor:m.start()])  # separators/punct as-is
        w = m.group(0)
        cursor = m.end()
        # Preserve HTML entities (&amp; &nbsp; &mdash; ...): a word directly
        # preceded by "&" is an entity name, never a real word.
        if m.start() > 0 and text[m.start() - 1] == "&":
            out.append(w)
            continue
        # Preserve brand tokens / acronyms / anything with caps or digits.
        if has_upper_or_digit(w):
            out.append(w)
            continue
        lw = w.lower()
        if i not in (first_i, last_i) and lw in MINOR:
            out.append(lw)
        else:
            # Capitalize each hyphen-separated part (Next-Gen, Self-Service),
            # keeping minor sub-words lowercase (Day-to-Day).
            parts = w.split("-")
            capped = []
            for j, p in enumerate(parts):
                if not p:
                    capped.append(p)
                elif p.lower() in MINOR and 0 < j < len(parts) - 1:
                    capped.append(p.lower())
                else:
                    capped.append(p[0].upper() + p[1:])
            out.append("-".join(capped))
    out.append(text[cursor:])
    return "".join(out)

# ---- JSON templates -------------------------------------------------
KEY_OK = re.compile(r"(heading|subhead|title|kicker|eyebrow|label|cta.*label|tagline)", re.I)
KEY_NO = re.compile(r"(url|image|color|colour|_id$|^id$|icon|handle|type|html|body|copy|desc|paragraph|link)", re.I)

def skip_val(v):
    if not isinstance(v, str) or not v.strip():
        return True
    if "{{" in v or "{%" in v or "http" in v or v.strip().startswith("/"):
        return True
    if "shopify://" in v:
        return True
    # Only title-case short, heading-style phrases. Longer strings are almost
    # always sentence-style subheads/body and should stay in sentence case.
    if len(WORD_RE.findall(v)) > 9:
        return True
    return False

changes = []

def walk_json(obj, path):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                walk_json(v, path + "." + str(k))
            elif isinstance(v, str) and KEY_OK.search(k) and not KEY_NO.search(k) and not skip_val(v):
                nv = title_case(v)
                if nv != v:
                    changes.append((path + "." + str(k), v, nv))
                    obj[k] = nv
    elif isinstance(obj, list):
        for idx, v in enumerate(obj):
            walk_json(v, path + "[%d]" % idx)

json_files = glob.glob(ROOT + "/templates/**/*.json", recursive=True)
for jf in json_files:
    with open(jf) as f:
        raw = f.read()
    # strip leading /* ... */ banner Shopify adds (keep to re-add)
    banner = ""
    m = re.match(r"\s*/\*.*?\*/\s*", raw, re.S)
    if m:
        banner = raw[:m.end()]
        body = raw[m.end():]
    else:
        body = raw
    try:
        data = json.loads(body)
    except Exception as e:
        print("SKIP (parse) ", jf, e); continue
    before = len(changes)
    walk_json(data, os.path.relpath(jf, ROOT))
    if len(changes) > before and APPLY:
        with open(jf, "w") as f:
            f.write(banner + json.dumps(data, indent=2, ensure_ascii=False) + "\n")

for path, old, new in changes:
    print("JSON  ", path)
    print("   -", old)
    print("   +", new)

print("\nTOTAL JSON changes:", len(changes))

# ---- Liquid sections / snippets -------------------------------------
# Conservative: only single-line elements whose class marks them as a
# heading/kicker/eyebrow/subhead/section-title/CTA-or-nav label, and whose
# inner text is a plain literal (no Liquid tags, no nested markup).
LIQUID_RE = re.compile(
    r'(<(h1|h2|h3|h4|p|span|a|button|strong)\b[^>]*\bclass="[^"]*'
    r'(?:kicker|eyebrow|section-intro__heading|story-section-intro__heading|'
    r'__subhead|subheading|page-hero[^"]*__heading|__cta\b|nav__link)[^"]*"[^>]*>)'
    r'([^<>{}]+?)'
    r'(</\2>)'
)

lq_changes = []

def repl(m):
    open_tag, tag, text, close_tag = m.group(1), m.group(2), m.group(3), m.group(4)
    stripped = text.strip()
    if not stripped or not any(c.islower() for c in stripped):
        return m.group(0)
    if len(WORD_RE.findall(stripped)) > 9:
        return m.group(0)
    new_inner = title_case(text)
    if new_inner != text:
        lq_changes.append((text.strip(), new_inner.strip()))
    return open_tag + new_inner + close_tag

for lf in glob.glob(ROOT + "/sections/*.liquid") + glob.glob(ROOT + "/snippets/*.liquid"):
    with open(lf) as f:
        src = f.read()
    before = len(lq_changes)
    new_src = LIQUID_RE.sub(repl, src)
    if len(lq_changes) > before:
        print("\nLIQUID", os.path.relpath(lf, ROOT))
        for old, new in lq_changes[before:]:
            print("   -", old)
            print("   +", new)
        if APPLY:
            with open(lf, "w") as f:
                f.write(new_src)

print("\nTOTAL Liquid changes:", len(lq_changes))
print("TOTAL changes:", len(changes) + len(lq_changes), "(APPLY)" if APPLY else "(dry-run)")
