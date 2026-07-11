"""Headed screenshot harness for blacks-wind. Usage:
python3 shoot_blacks.py out_prefix [seconds_to_settle] [wind_0..1000]
Shots: default cam, south-side view, top-down-ish, close cliff view.
"""
import sys
from playwright.sync_api import sync_playwright

BASE = "/Users/b/Desktop/PhoneThatCares/.claude/worktrees/overnight-thin-air/apps/blacks-wind"
prefix = sys.argv[1] if len(sys.argv) > 1 else "shot"
settle = float(sys.argv[2]) if len(sys.argv) > 2 else 12
wind = sys.argv[3] if len(sys.argv) > 3 else None

ANGLES = [
    ("main",  -2.90, 0.13, 1600),
    ("south", -1.75, 0.10, 1500),   # looking north along the cliff
    ("high",  -2.60, 0.85, 2200),   # high oblique
    ("close", -2.95, 0.06, 650),    # low over the water, close to the face
]

with sync_playwright() as p:
    b = p.chromium.launch(headless=False, args=["--enable-unsafe-webgpu", "--window-position=1600,900", "--window-size=1100,700"])
    pg = b.new_page(viewport={"width":1080,"height":640})
    logs = []
    pg.on("console", lambda m: logs.append(f"[{m.type}] {m.text[:200]}"))
    pg.on("pageerror", lambda e: logs.append(f"[PAGEERROR] {str(e)[:200]}"))
    pg.goto(f"file://{BASE}/index.html")
    if wind is not None:
        pg.evaluate(f"window.__setWind({wind})")
    pg.wait_for_timeout(int(settle * 1000))
    for name, az, el, dist in ANGLES:
        pg.evaluate(f"window.__setCam({az}, {el}, {dist})")
        pg.wait_for_timeout(400)
        pg.screenshot(path=f"{prefix}-{name}.png")
    hud = pg.evaluate("document.getElementById('glider').textContent + ' | ' + document.getElementById('readout').textContent")
    fps = pg.evaluate("""new Promise(res => { let n=0; const t0=performance.now();
      const f=()=>{n++; if(performance.now()-t0<1500) requestAnimationFrame(f); else res((n/1.5).toFixed(0));};
      requestAnimationFrame(f); })""")
    print("HUD:", hud, "| fps:", fps)
    seen = set()
    for l in logs:
        if l[:90] in seen: continue
        seen.add(l[:90]); print(l)
    b.close()
print("done")
