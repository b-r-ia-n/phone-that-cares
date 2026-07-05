package com.ptc.seeglass

import org.json.JSONObject

/**
 * Builds the JavaScript injected into each place. The page keeps all of its
 * own behavior; we only add a thin perceptual layer:
 *  - a saturation/contrast ramp on the document root
 *  - growing space between feed items (via a CSS variable)
 *  - occasional full-bleed break cards
 */
object CareEngine {

    /** Idempotent setup: style tag + helper functions under window.__sg */
    fun ensureJs(itemSelector: String, trimCss: String): String {
        val selectorJson = JSONObject.quote(itemSelector)
        val trimJson = JSONObject.quote(trimCss)
        return """
(function() {
  if (window.__sg && document.getElementById('sg-style')) return;
  window.__sg = window.__sg || {};
  var style = document.getElementById('sg-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'sg-style';
    var sel = $selectorJson;
    var css = 'html { transition: filter 2000ms linear; }\n' +
              ':root { --sg-space: 0px; }\n';
    if (sel && sel.length) {
      css += sel + ' { margin-bottom: var(--sg-space) !important; }\n';
    }
    css += $trimJson;
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }
  window.__sg.setProgress = function(sat, con, spacePx) {
    try {
      document.documentElement.style.filter =
        'saturate(' + sat + ') contrast(' + con + ')';
      document.documentElement.style.setProperty('--sg-space', spacePx + 'px');
    } catch (e) {}
  };
  window.__sg.showBreak = function(art, line) {
    if (document.getElementById('sg-break')) return;
    var d = document.createElement('div');
    d.id = 'sg-break';
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;' +
      'background:rgba(246,243,236,0.97);display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;opacity:0;' +
      'transition:opacity 600ms ease;cursor:pointer;';
    var pre = document.createElement('pre');
    pre.textContent = art;
    pre.style.cssText = 'color:#1a1714;font-family:ui-monospace,monospace;' +
      'font-size:16px;line-height:1.5;margin:0;background:none;border:none;';
    var p = document.createElement('div');
    p.textContent = line;
    p.style.cssText = 'color:#6b645c;font-family:-apple-system,system-ui,sans-serif;' +
      'font-size:14px;margin-top:28px;letter-spacing:0.02em;';
    d.appendChild(pre);
    d.appendChild(p);
    d.addEventListener('click', function() {
      d.style.opacity = '0';
      setTimeout(function() { d.remove(); }, 650);
    });
    (document.body || document.documentElement).appendChild(d);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { d.style.opacity = '1'; });
    });
  };
})();
"""
    }

    fun setProgressJs(saturation: Double, contrast: Double, spacePx: Int): String =
        "window.__sg && window.__sg.setProgress(%.3f, %.3f, %d);"
            .format(saturation, contrast, spacePx)

    fun showBreakJs(card: BreakCards.Card): String {
        val art = JSONObject.quote(card.art)
        val line = JSONObject.quote(card.line)
        return "window.__sg && window.__sg.showBreak($art, $line);"
    }
}
