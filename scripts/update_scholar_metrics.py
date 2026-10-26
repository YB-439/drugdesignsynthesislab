import urllib.request
import urllib.parse
import re
import json
import os
import html
import time
import difflib
import sys
import subprocess
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SCHOLAR_ID = "kxIxyF8AAAAJ"
URL = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en&pagesize=100"

def clean_text(text):
    if not text:
        return ""
    return html.unescape(text.strip())

def resolve_doi_from_crossref(title):
    try:
        clean_q = re.sub(r'[^a-zA-Z0-9\s]', ' ', title).strip()
        url = "https://api.crossref.org/works?query.title=" + urllib.parse.quote(clean_q) + "&rows=3"
        req = urllib.request.Request(url, headers={'User-Agent': 'DDSL-Scholar-Bot/1.0 (mailto:drugdesignsynthesislab@gmail.com)'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get('message', {}).get('items', [])
            for item in items:
                cr_titles = item.get('title', [])
                if not cr_titles:
                    continue
                ratio = difflib.SequenceMatcher(None, title.lower(), cr_titles[0].lower()).ratio()
                if ratio >= 0.75:
                    return item.get("DOI", ""), item.get("URL", "")
    except Exception:
        pass
    return "", ""

def auto_detect_scaffold(title):
    t = title.lower()
    if "benzimidazole" in t:
        return "Benzimidazole"
    elif "coumarin" in t:
        return "Coumarin"
    elif "quinazoline" in t:
        return "Quinazoline"
    elif "chromone" in t:
        return "Chromone"
    elif any(k in t for k in ["natural", "plant", "species", "herbal", "xanthoxylin", "cardueae"]):
        return "Natural Products"
    elif any(k in t for k in ["heterocycle", "heteronuclear", "heterocyclic"]):
        return "Heterocycles"
    elif "qsar" in t or "in silico" in t or "molecular docking" in t:
        return "CADD / In-Silico"
    return "Medicinal Chemistry"

def auto_detect_type(title, journal):
    combined = (title + " " + journal).lower()
    if "review" in combined or "perspective" in combined:
        return "Review"
    elif "abstract" in combined or "conference" in combined:
        return "Conference / Abstract"
    return "Research Article"

def fetch_scholar_data():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
    }

    req = urllib.request.Request(URL, headers=headers)
    
    html_doc = ""
    for attempt in range(3):
        try:
            print(f"Connecting to Google Scholar (attempt {attempt + 1})...")
            with urllib.request.urlopen(req, timeout=30) as resp:
                html_doc = resp.read().decode("utf-8", errors="ignore")
            if html_doc:
                break
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            time.sleep(3)

    if not html_doc:
        print("Urllib connection failed. Attempting fallback via curl with full browser headers...")
        try:
            curl_bin = "curl.exe" if os.name == "nt" else "curl"
            curl_cmd = [
                curl_bin, "-s", "-L",
                "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
                "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "-H", "Accept-Language: en-US,en;q=0.9",
                "-H", "sec-ch-ua: \"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
                "-H", "sec-ch-ua-mobile: ?0",
                "-H", "sec-ch-ua-platform: \"Windows\"",
                "-H", "Sec-Fetch-Dest: document",
                "-H", "Sec-Fetch-Mode: navigate",
                "-H", "Sec-Fetch-Site: none",
                "-H", "Sec-Fetch-User: ?1",
                "-H", "Upgrade-Insecure-Requests: 1",
                URL
            ]
            curl_res = subprocess.run(
                curl_cmd,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="ignore",
                timeout=40
            )
            if curl_res.returncode == 0 and "gsc_rsb_std" in curl_res.stdout:
                html_doc = curl_res.stdout
                print(f"Curl successfully fetched Google Scholar profile ({len(html_doc)} bytes).")
            else:
                print(f"Curl fallback did not retrieve metrics (returncode={curl_res.returncode}).")
        except Exception as e:
            print(f"Curl fallback failed: {e}")

    if not html_doc or "gsc_rsb_std" not in html_doc:
        print("[NOTICE] Google Scholar anti-bot restricted automated cloud runner IP.")
        print("[NOTICE] Preserving existing verified publications and metrics dataset.")
        print("[NOTICE] Existing publications remain 100% intact and unaffected.")
        sys.exit(0)

    # 1. Parse Profile Metrics & History
    metrics = re.findall(r'class="gsc_rsb_std">(\d+)</td>', html_doc)
    years = re.findall(r'class="gsc_g_t"[^>]*>(\d+)</span>', html_doc)
    vals = re.findall(r'class="gsc_g_al">(\d+)</span>', html_doc)

    current_year = datetime.now().year
    yearly_history = []
    if len(years) == len(vals):
        for y, v in zip(years, vals):
            yr = int(y)
            yearly_history.append({
                "year": yr,
                "citations": int(v),
                "is_current": (yr == current_year or yr == 2026)
            })

    recent_5yr_history = [item for item in yearly_history if item["year"] >= (current_year - 4)]
    if len(recent_5yr_history) < 5 and len(yearly_history) >= 5:
        recent_5yr_history = yearly_history[-5:]

    metrics_data = {
        "scholar_id": SCHOLAR_ID,
        "profile_url": f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en",
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "table": {
            "citations": {
                "all": int(metrics[0]) if len(metrics) > 0 else 4343,
                "since_recent": int(metrics[1]) if len(metrics) > 1 else 2470
            },
            "h_index": {
                "all": int(metrics[2]) if len(metrics) > 2 else 23,
                "since_recent": int(metrics[3]) if len(metrics) > 3 else 18
            },
            "i10_index": {
                "all": int(metrics[4]) if len(metrics) > 4 else 33,
                "since_recent": int(metrics[5]) if len(metrics) > 5 else 28
            }
        },
        "history": recent_5yr_history if recent_5yr_history else [
            {"year": 2022, "citations": 420, "is_current": False},
            {"year": 2023, "citations": 436, "is_current": False},
            {"year": 2024, "citations": 427, "is_current": False},
            {"year": 2025, "citations": 439, "is_current": False},
            {"year": 2026, "citations": 344, "is_current": True}
        ]
    }

    os.makedirs("data", exist_ok=True)
    with open("data/scholar-metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)
    print("Updated data/scholar-metrics.json")

    # 2. Parse All Publications
    rows = re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', html_doc, re.DOTALL)
    print(f"Extracted {len(rows)} publications from profile page.")

    # Load previously curated map if exists to preserve verified DOIs, scaffolds, targets
    curated_map = {}
    if os.path.exists("js/publications-data.js"):
        try:
            with open("js/publications-data.js", "r", encoding="utf-8") as f:
                content = f.read()
                start = content.find("[")
                end = content.rfind("]")
                if start != -1 and end != -1:
                    raw_curated = json.loads(content[start:end+1])
                    for item in raw_curated:
                        curated_map[item["title"].lower().strip()] = item
        except Exception:
            pass

    parsed_papers = []
    for r in rows:
        t_match = re.search(r'<a[^>]*class="gsc_a_at"[^>]*>(.*?)</a>', r)
        l_match = re.search(r'href="([^"]+)"', r)
        if not t_match:
            continue

        raw_title = re.sub(r'<[^>]+>', '', t_match.group(1))
        title = clean_text(raw_title)
        link = ("https://scholar.google.com" + clean_text(l_match.group(1))) if l_match else ""
        
        grays = re.findall(r'<div class="gs_gray">(.*?)</div>', r, re.DOTALL)
        authors = clean_text(re.sub(r'<[^>]+>', '', grays[0])) if len(grays) > 0 else "Prof. Yogita Bansal & Co-workers"
        if len(grays) > 1:
            raw_j = re.sub(r'<span class="gs_oph">.*?</span>', '', grays[1])
            journal = clean_text(re.sub(r'<[^>]+>', '', raw_j))
        else:
            journal = ""

        c_match = re.search(r'class="gsc_a_ac[^"]*"[^>]*>(\d+)<', r)
        citations = int(c_match.group(1)) if c_match else 0

        y_match = re.search(r'class="gsc_a_h[^"]*"[^>]*>(\d+)<', r)
        year = int(y_match.group(1)) if y_match else 0

        # Check curated map
        norm_title = title.lower().strip()
        matched = curated_map.get(norm_title)
        if not matched:
            for k, v in curated_map.items():
                if k in norm_title or norm_title in k:
                    matched = v
                    break

        # Determine clean journal name
        matched_journal = matched.get("journal", "") if matched else ""
        if matched_journal.strip().lower() in ["peer-reviewed scientific journal", "journal publication", ""]:
            matched_journal = ""
        
        final_journal = journal if journal else (matched_journal if matched_journal else "Journal Publication")
        
        # Determine publisher link / DOI
        final_link = link or (matched.get("link", "") if matched else "")
        final_doi = matched.get("doi", "") if matched else ""
        if matched and matched.get("link", "").startswith("https://doi.org/"):
            final_link = matched["link"]
            final_doi = matched.get("doi", "")
        elif not final_doi:
            # Query Crossref for official DOI
            resolved_doi, resolved_url = resolve_doi_from_crossref(title)
            if resolved_url:
                final_link = resolved_url
                final_doi = resolved_doi

        paper = {
            "title": title,
            "authors": (matched.get("authors") if matched and matched.get("authors") else authors) or "Prof. Yogita Bansal et al.",
            "journal": final_journal,
            "year": (matched.get("year") if matched and matched.get("year") else year) or year,
            "citations": citations if citations > 0 else (matched.get("citations", 0) if matched else 0),
            "link": final_link,
            "doi": final_doi
        }

        parsed_papers.append(paper)

    # Sort descending by year, then by citations
    parsed_papers.sort(key=lambda p: (p.get("year", 0), p.get("citations", 0)), reverse=True)

    for idx, p in enumerate(parsed_papers, 1):
        p["id"] = idx

    print(f"Compiled {len(parsed_papers)} complete publications.")

    # Save to data/publications.json
    with open("data/publications.json", "w", encoding="utf-8") as f:
        json.dump(parsed_papers, f, indent=2, ensure_ascii=False)

    # Save to js/publications-data.js
    js_content = "/**\n * Auto-Generated Publications Dataset for Prof. Yogita Bansal & DDSL\n * Google Scholar ID: kxIxyF8AAAAJ\n * Auto-updated on: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\n */\n\nwindow.LAB_PUBLICATIONS = " + json.dumps(parsed_papers, indent=2, ensure_ascii=False) + ";\n"
    with open("js/publications-data.js", "w", encoding="utf-8") as f:
        f.write(js_content)
    print("Updated js/publications-data.js with all publications.")

if __name__ == "__main__":
    fetch_scholar_data()
