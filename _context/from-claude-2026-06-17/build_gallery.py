#!/usr/bin/env python3
"""Gallery v2 — every HTML artifact across ~/Desktop, categorized by project,
with a recent strip + topic sections on one page, and pin/archive persistence.
Served from ~/Desktop so links (incl. spaced folders) resolve."""
import os, re, subprocess, html, json, sys, concurrent.futures
from urllib.parse import quote

DESKTOP = os.path.expanduser("~/Desktop")
OUT_DIR = os.path.join(DESKTOP, "PhoneThatCares/_context/from-claude-2026-06-17")
THUMBS  = os.path.join(OUT_DIR, "gallery-thumbs")
os.makedirs(THUMBS, exist_ok=True)
CHROME  = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
THUMB_MAX = 1_600_000   # don't try to screenshot files bigger than this

SKIP_DIRS = ("/node_modules/","/.git/","/.vercel/","/.astro/","/dist/","/build/",
             "/.cache/","/Library/","/.Trash/","/Delete/","/Screenshots/",
             "/.next/","/.svelte-kit/","/coverage/","/Administrative/")
SKIP_NAMES = ("gallery.html",)  # don't list the gallery in itself

# category order + classifier (first match wins)
CATS = ["Writing","PTC demos","Idea synthesis","Argos","Android build",
        "Feasibility & strategy","Phone That Cares","Design portfolio",
        "Design inspo","Emergent Ventures","Personal (archive)","Other"]

def classify(rel):
    p = rel.lower()
    if "from-claude-2026-06-17/demo" in p: return "PTC demos"
    if "/wild/" in p or "from-claude" in p: return "Writing"
    if "idea-scrape" in p: return "Idea synthesis"
    if ("telegram-agent" in p or "argos" in p or "ansel-adams" in p
        or "dashboard-telegram" in p or "dashboard-argos" in p or "chrome-ext" in p): return "Argos"
    if ("tier-explorer" in p or "forking-android" in p or "feasibility" in p
        or "synthesis" in p or "build-plan" in p or "architecture-of-attention" in p): return "Feasibility & strategy"
    if ("phone-os" in p or "android" in p or "launcher" in p or "overnight" in p
        or "argos.mock" in p or "os-mock" in p): return "Android build"
    if "emergent-ventures" in p or "ev-studio" in p: return "Emergent Ventures"
    if "design-inspo" in p: return "Design inspo"
    if "portfolio" in p or rel.startswith("JLab") or rel.startswith("Jlab"): return "Design portfolio"
    if rel.startswith("Personal"): return "Personal (archive)"
    if rel.startswith("PhoneThatCares") or "_context" in p or "/visuals/" in p or "/misc/" in p: return "Phone That Cares"
    return "Other"

# hand descriptions for the marquee items (else subtitle = folder)
DESC = {
 "PhoneThatCares/from-claude-2026-06-17/essay.html":"The draft essay — the 'embarrassed one,' from your corpus + wild/.",
 "PhoneThatCares/from-claude-2026-06-17/quotable.html":"~70 best lines from the wild/ corpus, themed and sourced.",
 "PhoneThatCares/from-claude-2026-06-17/demo-the-tide.html":"Drive the grayscale ramp — ramp, curve, and the honest 'floor' knob.",
 "PhoneThatCares/from-claude-2026-06-17/demo-fade-to-reality.html":"A feed that dissolves into your live camera after a few seconds.",
 "PhoneThatCares/_context/idea-scrape-2026-06-13/concepts.html":"11 candidate app directions from three lenses.",
 "PhoneThatCares/_context/idea-scrape-2026-06-13/brainstorm-board.html":"The full 430-idea board, deduped.",
 "PhoneThatCares/wild/2026-05-17-you-already-know.html":"screed №1 — the poster in five variants.",
 "PhoneThatCares/website/public/research/tier-explorer/index.html":"9 moves × 15 services intervention map.",
 "Jlab portfolio 2026/portfolio-todo.html":"Portfolio working doc / to-do.",
 "Jlab portfolio 2026/contact-sheet.html":"Portfolio contact sheet.",
 "Projects/design-inspo/taste-gallery.html":"28-site taste-rating gallery.",
 "Projects/design-inspo/rauno-analysis.html":"Design-taste analysis of Rauno's work.",
 "Projects/emergent-ventures/ev-studio/index.html":"Emergent Ventures studio page.",
}

def get_title(full, rel):
    try:
        with open(full, "r", errors="ignore") as f: head = f.read(9000)
    except Exception: head = ""
    m = re.search(r"<title[^>]*>(.*?)</title>", head, re.I|re.S)
    t = m.group(1).strip() if m else ""
    if not t:
        m = re.search(r"<h1[^>]*>(.*?)</h1>", head, re.I|re.S)
        t = re.sub(r"<[^>]+>","",m.group(1)).strip() if m else ""
    if not t:
        t = os.path.basename(rel).replace(".html","").replace("-"," ").replace("_"," ")
    t = re.sub(r"\s+"," ", html.unescape(t))
    return t[:80]

# ---- discover ----
items = []
seen_sig = set()
for root, dirs, files in os.walk(DESKTOP):
    if any(s.strip("/") in root.split(os.sep) for s in []):
        pass
    full_root = root + "/"
    if any(s in full_root for s in SKIP_DIRS):
        dirs[:] = []
        continue
    for fn in files:
        if not fn.endswith(".html") or fn in SKIP_NAMES: continue
        full = os.path.join(root, fn)
        rel = os.path.relpath(full, DESKTOP)
        if any(s in "/"+rel+"/" for s in SKIP_DIRS): continue
        try:
            st = os.stat(full); size = st.st_size
            date = __import__("time").strftime("%Y-%m-%d", __import__("time").localtime(st.st_mtime))
        except Exception: continue
        sig = (fn, size)               # collapse exact-dup copies (e.g. website local/github)
        if sig in seen_sig: continue
        seen_sig.add(sig)
        items.append({"rel":rel,"full":full,"size":size,"date":date,
                      "cat":classify(rel),"title":get_title(full,rel),
                      "desc":DESC.get(rel,"")})

print("found %d artifacts" % len(items), file=sys.stderr)

def slug(rel): return re.sub(r"[^A-Za-z0-9]+","_", rel.replace(".html",""))

def shoot(it):
    out = os.path.join(THUMBS, slug(it["rel"])+".png")
    if os.path.exists(out) and os.path.getsize(out) > 1000: return (it["rel"],True)
    if it["size"] > THUMB_MAX: return (it["rel"],False)
    try:
        subprocess.run([CHROME,"--headless=new","--disable-gpu","--hide-scrollbars",
            "--force-device-scale-factor=1","--window-size=1200,840",
            "--virtual-time-budget=3500","--screenshot="+out,"file://"+it["full"]],
            timeout=35, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return (it["rel"], os.path.exists(out) and os.path.getsize(out) > 1000)
    except Exception:
        return (it["rel"], False)

print("shooting thumbnails...", file=sys.stderr)
ok = {}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    for rel, good in ex.map(shoot, items):
        ok[rel]=good
for it in items:
    it["thumb"] = ("gallery-thumbs/%s.png"%slug(it["rel"])) if ok.get(it["rel"]) else ""
    it["href"]  = "file://"+quote(os.path.join(DESKTOP, it["rel"]))  # absolute so links resolve from file://
    it["sub"]   = it["desc"] or ("…/"+os.path.basename(os.path.dirname(it["rel"]) or it["rel"]))

# stable order: category order then date desc
items.sort(key=lambda d:(CATS.index(d["cat"]) if d["cat"] in CATS else 99, ), )
DATA = [{"path":it["rel"],"href":it["href"],"cat":it["cat"],"title":it["title"],
         "sub":it["sub"],"date":it["date"],"thumb":it["thumb"]} for it in items]
cats_present = [c for c in CATS if any(d["cat"]==c for d in DATA)]
miss = sum(1 for it in items if not it["thumb"])
print("WROTE: %d items, %d categories, %d without thumb"%(len(DATA),len(cats_present),miss), file=sys.stderr)

PAGE = r"""<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>artifacts — everything the instances made you</title>
<link rel="preconnect" href="https://rsms.me/"/><link rel="stylesheet" href="https://rsms.me/inter/inter.css"/>
<style>
:root{--bg:#f6f3ec;--ink:#1a1714;--soft:#45403b;--quiet:#8a857f;--rule:#e6e0d4;--accent:#8a5a2b;--accentsoft:#c4a47a;--card:#fbf9f3;--hl:#fff4d6;--pin:#b07a36}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,sans-serif;font-feature-settings:"ss01","cv11","tnum";-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
::selection{background:var(--hl)}
.wrap{max-width:1280px;margin:0 auto;padding:26px 24px 140px}
.top{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:4px}
h1{font-size:22px;font-weight:600;letter-spacing:-.02em;margin:0}
.top .meta{color:var(--quiet);font-size:12.5px;font-variant-numeric:tabular-nums}
.sub{color:var(--soft);font-size:13.5px;margin:2px 0 0;max-width:680px}
/* one-line control bar */
.bar{position:sticky;top:0;z-index:20;background:linear-gradient(var(--bg) 86%,rgba(246,243,236,0));padding:14px 0 12px;margin:14px 0 6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.search{flex:0 0 auto;width:230px;font:inherit;font-size:14px;padding:8px 13px;border:1px solid var(--rule);border-radius:999px;background:var(--card);color:var(--ink)}
.search:focus{outline:none;box-shadow:0 0 0 3px var(--accentsoft);border-color:var(--accentsoft)}
.seg{display:inline-flex;border:1px solid var(--rule);border-radius:999px;overflow:hidden;background:var(--card);flex:0 0 auto}
.seg button{font:inherit;font-size:12.5px;cursor:pointer;background:transparent;color:var(--soft);border:0;padding:7px 13px}
.seg button[aria-pressed="true"]{background:var(--ink);color:var(--bg)}
.chips{display:flex;gap:6px;flex-wrap:wrap;flex:1 1 auto}
.chips button{font:inherit;font-size:12.5px;cursor:pointer;background:transparent;color:var(--soft);border:1px solid var(--rule);border-radius:999px;padding:6px 11px;white-space:nowrap}
@media(hover:hover){.chips button:hover{border-color:var(--accentsoft);color:var(--ink)}}
.chips button[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
button:focus-visible,.card:focus-visible{outline:none;box-shadow:0 0 0 3px var(--accentsoft)}
.shead{display:flex;align-items:center;gap:10px;font-size:13px;letter-spacing:.05em;text-transform:uppercase;font-weight:600;color:var(--accent);margin:30px 0 12px;padding-bottom:6px;border-bottom:1px solid var(--rule)}
.shead .n{color:var(--quiet);font-weight:400;letter-spacing:0;text-transform:none;font-variant-numeric:tabular-nums}
.shead.pinhead{color:var(--pin)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:18px}
.card{position:relative;display:flex;flex-direction:column;text-decoration:none;color:inherit;background:var(--card);border:1px solid var(--rule);border-radius:12px;overflow:hidden;transition:transform .14s,box-shadow .14s,border-color .14s}
@media(hover:hover){.card:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(26,23,20,.08);border-color:var(--accentsoft)}}
.thumb{aspect-ratio:1200/720;background:#efeadf;overflow:hidden;border-bottom:1px solid var(--rule)}
.thumb img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;color:var(--quiet);font-size:13px;background:linear-gradient(135deg,#f0ebe0,#e7e0d2)}
.meta{padding:11px 13px 13px;display:flex;flex-direction:column;gap:4px;flex:1}
.meta .t{font-size:14px;font-weight:600;letter-spacing:-.01em;line-height:1.25}
.meta .d{font-size:12px;color:var(--soft);line-height:1.4;flex:1}
.foot{display:flex;justify-content:space-between;align-items:center;margin-top:6px}
.cat{font-size:10.5px;letter-spacing:.03em;text-transform:uppercase;color:var(--accent);font-weight:500}
.date{font-size:11.5px;color:var(--quiet);font-variant-numeric:tabular-nums}
/* card actions */
.acts{position:absolute;top:8px;right:8px;display:flex;gap:5px;opacity:0;transition:opacity .12s;z-index:2}
@media(hover:hover){.card:hover .acts{opacity:1}}
.card.pinned .acts,.card.archived .acts{opacity:1}
.acts button{width:26px;height:26px;border-radius:7px;border:1px solid var(--rule);background:rgba(251,249,243,.94);cursor:pointer;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center;color:var(--soft);backdrop-filter:blur(3px)}
.acts button:hover{border-color:var(--accentsoft);color:var(--ink)}
.card.pinned{border-color:var(--pin)}
.card.pinned .pinbtn{background:var(--pin);color:#fff;border-color:var(--pin)}
.morebtn{margin-top:16px;font:inherit;font-size:13px;cursor:pointer;background:transparent;color:var(--accent);border:1px dashed var(--accentsoft);border-radius:10px;padding:9px 16px}
.arctoggle{font:inherit;font-size:12.5px;cursor:pointer;background:transparent;color:var(--quiet);border:0;padding:0;margin-left:auto;text-decoration:underline;text-underline-offset:3px}
.empty{color:var(--quiet);margin-top:40px}
.note{margin-top:54px;padding-top:20px;border-top:1px solid var(--rule);color:var(--soft);font-size:13px;max-width:700px}
.note code{background:var(--card);padding:1px 5px;border-radius:5px;border:1px solid var(--rule)}
.hidden{display:none!important}
</style></head><body><div class="wrap">
<div class="top"><h1>Everything the instances made you</h1><span class="meta" id="meta"></span></div>
<p class="sub">Every HTML page the Claude instances have built across your Desktop — across projects, not just Phone That Cares. Hover a card to <b>pin</b> (★, sticks to top) or <b>archive</b> (✕). Pins & archives are remembered on this machine.</p>
<div class="bar">
  <input class="search" id="q" type="text" placeholder="search…" autocomplete="off" spellcheck="false"/>
  <div class="seg" id="seg">
    <button data-view="both" aria-pressed="true">recent + topics</button>
    <button data-view="recent" aria-pressed="false">recent</button>
    <button data-view="topic" aria-pressed="false">by topic</button>
  </div>
  <div class="chips" id="chips"></div>
</div>
<div id="pinned"></div>
<div id="recent"></div>
<div id="cats"></div>
<div id="archivedwrap"></div>
<p class="empty hidden" id="empty">Nothing matches.</p>
<p class="note">Served from <code>~/Desktop</code> on localhost so every link resolves (including spaced folders like <code>Jlab portfolio 2026</code>). Build/test reports, <code>Delete/</code>, and <code>Screenshots/</code> are excluded. A card with no thumbnail was too heavy to screenshot — the link still works. Re-run <code>build_gallery.py</code> to pick up new artifacts.</p>
</div>
<script>
var DATA=__DATA__, CATS=__CATS__, RECENT_N=12;
var KEY='ptc-gallery-v2';
var st=JSON.parse(localStorage.getItem(KEY)||'{}'); st.pinned=st.pinned||[]; st.archived=st.archived||[];
function save(){localStorage.setItem(KEY,JSON.stringify(st));}
var view='both', cat='all', term='', moreOpen=false, showArchived=false;

var elPinned=document.getElementById('pinned'),elRecent=document.getElementById('recent'),
 elCats=document.getElementById('cats'),elArch=document.getElementById('archivedwrap'),
 elEmpty=document.getElementById('empty'),elMeta=document.getElementById('meta'),
 chips=document.getElementById('chips'),seg=document.getElementById('seg'),q=document.getElementById('q');

function esc(s){return (s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function matches(d){var okCat=cat==='all'||d.cat===cat;
 var okT=!term||(d.title+' '+d.sub+' '+d.cat).toLowerCase().indexOf(term)>-1; return okCat&&okT;}
function card(d){
 var pinned=st.pinned.indexOf(d.path)>-1, arch=st.archived.indexOf(d.path)>-1;
 var thumb=d.thumb?('<img loading="lazy" src="'+d.thumb+'" alt="">'):('<div class="noimg">'+esc(d.title)+'</div>');
 var a=document.createElement('a'); a.className='card'+(pinned?' pinned':'')+(arch?' archived':'');
 a.href=d.href; a.target='_blank'; a.rel='noopener';
 a.innerHTML='<div class="acts">'+
   '<button class="pinbtn" title="pin to top">'+(pinned?'★':'☆')+'</button>'+
   '<button class="arcbtn" title="'+(arch?'unarchive':'archive')+'">'+(arch?'↩':'✕')+'</button>'+
   '</div>'+
   '<div class="thumb">'+thumb+'</div>'+
   '<div class="meta"><div class="t">'+esc(d.title)+'</div>'+
   '<div class="d">'+esc(d.sub)+'</div>'+
   '<div class="foot"><span class="cat">'+esc(d.cat)+'</span><span class="date">'+d.date+'</span></div></div>';
 a.querySelector('.pinbtn').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();
   var i=st.pinned.indexOf(d.path); if(i>-1)st.pinned.splice(i,1); else st.pinned.push(d.path); save(); render();});
 a.querySelector('.arcbtn').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();
   var i=st.archived.indexOf(d.path); if(i>-1)st.archived.splice(i,1); else {st.archived.push(d.path);
     var pi=st.pinned.indexOf(d.path); if(pi>-1)st.pinned.splice(pi,1);} save(); render();});
 return a;
}
function grid(list){var g=document.createElement('div'); g.className='grid';
 list.forEach(function(d){g.appendChild(card(d));}); return g;}
function head(label,n,cls){var h=document.createElement('div'); h.className='shead'+(cls?' '+cls:'');
 h.innerHTML=esc(label)+' <span class="n">'+n+'</span>'; return h;}
function byDate(a,b){return a.date<b.date?1:(a.date>b.date?-1:0);}

function render(){
 [elPinned,elRecent,elCats,elArch].forEach(function(e){e.innerHTML='';});
 var live=DATA.filter(function(d){return st.archived.indexOf(d.path)<0 && matches(d);});
 var pinnedList=live.filter(function(d){return st.pinned.indexOf(d.path)>-1;}).sort(byDate);
 var rest=live.filter(function(d){return st.pinned.indexOf(d.path)<0;});

 // pinned strip (always, both views)
 if(pinnedList.length){elPinned.appendChild(head('Pinned',pinnedList.length,'pinhead'));elPinned.appendChild(grid(pinnedList));}

 var showRecent=(view==='both'||view==='recent') && cat==='all';
 var showCats=(view==='both'||view==='topic') || cat!=='all';

 if(showRecent){
   var rec=rest.slice().sort(byDate);
   var shown=moreOpen?rec:rec.slice(0,RECENT_N);
   elRecent.appendChild(head('Recent',rec.length));
   elRecent.appendChild(grid(shown));
   if(rec.length>RECENT_N && !moreOpen){
     var mb=document.createElement('button'); mb.className='morebtn';
     mb.textContent='show '+(rec.length-RECENT_N)+' more recent  …';
     mb.addEventListener('click',function(){moreOpen=true;render();}); elRecent.appendChild(mb);
   }
 }
 if(showCats){
   var cats = cat==='all'?CATS:[cat];
   cats.forEach(function(c){
     var list=rest.filter(function(d){return d.cat===c;}).sort(byDate);
     if(!list.length) return;
     elCats.appendChild(head(c,list.length));
     elCats.appendChild(grid(list));
   });
 }
 // archived drawer
 var arc=DATA.filter(function(d){return st.archived.indexOf(d.path)>-1 && matches(d);}).sort(byDate);
 if(arc.length){
   var h=head('Archived',arc.length);
   var tg=document.createElement('button'); tg.className='arctoggle';
   tg.textContent=showArchived?'hide':'show';
   tg.addEventListener('click',function(){showArchived=!showArchived;render();});
   h.appendChild(tg); elArch.appendChild(h);
   if(showArchived) elArch.appendChild(grid(arc));
 }
 elEmpty.classList.toggle('hidden', live.length>0 || pinnedList.length>0);
 elMeta.textContent=DATA.length+' artifacts · '+cats_count()+' categories'+(st.pinned.length?(' · '+st.pinned.length+' pinned'):'')+(st.archived.length?(' · '+st.archived.length+' archived'):'');
}
function cats_count(){var s={};DATA.forEach(function(d){s[d.cat]=1;});return Object.keys(s).length;}

// build chips
(function(){
 var present={}; DATA.forEach(function(d){present[d.cat]=(present[d.cat]||0)+1;});
 function chip(key,label){var b=document.createElement('button'); b.dataset.cat=key;
  b.setAttribute('aria-pressed',key==='all'?'true':'false'); b.textContent=label;
  b.addEventListener('click',function(){cat=key;moreOpen=false;
   [].slice.call(chips.children).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});render();});
  chips.appendChild(b);}
 chip('all','all');
 CATS.forEach(function(c){ if(present[c]) chip(c,c.toLowerCase()); });
})();
[].slice.call(seg.children).forEach(function(b){b.addEventListener('click',function(){view=b.dataset.view;moreOpen=false;
 [].slice.call(seg.children).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});render();});});
q.addEventListener('input',function(){term=q.value.trim().toLowerCase();moreOpen=false;render();});
render();
</script></body></html>"""

page = (PAGE.replace("__DATA__", json.dumps(DATA))
            .replace("__CATS__", json.dumps(cats_present)))
with open(os.path.join(OUT_DIR,"gallery.html"),"w") as f: f.write(page)
print("done -> gallery.html", file=sys.stderr)
