/* UNO Brokers · Botón "Escuchar": lee la página en voz alta con la voz del dispositivo */
(function () {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
  if (document.getElementById('ub-listen')) return;
  var synth = window.speechSynthesis;

  var css = '#ub-listen{position:fixed;left:16px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:9998;display:flex;align-items:center;gap:6px;font-family:Outfit,system-ui,-apple-system,sans-serif}' +
    '#ub-listen button{border:0;cursor:pointer;font:inherit;font-weight:600;font-size:15px;line-height:1;color:#fff;background:#0B1F3A;border:1.5px solid #C9A24B;border-radius:999px;padding:12px 18px;box-shadow:0 6px 18px rgba(0,0,0,.28);display:flex;align-items:center;gap:8px;-webkit-tap-highlight-color:transparent}' +
    '#ub-listen button:hover{background:#13294a}' +
    '#ub-listen button:focus-visible{outline:3px solid #F2D88E;outline-offset:2px}' +
    '#ub-listen .ub-sm{padding:12px 13px;font-size:14px;min-width:44px;justify-content:center}' +
    '#ub-listen .ub-hide{display:none}' +
    '.ub-reading{background:rgba(242,216,142,.18)!important;outline:2px solid rgba(201,162,75,.65);outline-offset:4px;border-radius:6px;transition:background .2s}' +
    '@media print{#ub-listen{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var box = document.createElement('div'); box.id = 'ub-listen'; box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Escuchar esta página');
  box.innerHTML =
    '<button type="button" id="ub-play" aria-label="Escuchar esta página"><span aria-hidden="true">🔊</span><span id="ub-label">Escuchar</span></button>' +
    '<button type="button" id="ub-speed" class="ub-sm ub-hide" aria-label="Cambiar velocidad">1x</button>' +
    '<button type="button" id="ub-stop" class="ub-sm ub-hide" aria-label="Detener lectura">■</button>';
  document.body.appendChild(box);
  var bPlay = document.getElementById('ub-play'), lbl = document.getElementById('ub-label'),
      bSpeed = document.getElementById('ub-speed'), bStop = document.getElementById('ub-stop');

  var SKIP = 'nav,footer,script,style,noscript,button,form,select,input,textarea,svg,iframe,#ub-listen,.wa-float,.wa,[aria-hidden="true"],.breadcrumb,.breadcrumbs,.share,.nav,.topbar,.menu';
  var SEL = 'h1,h2,h3,h4,p,li,summary,blockquote,tr,dt,dd,figcaption,.num,.stat-box .num,.eyebrow';

  function root() {
    return document.querySelector('article') && document.querySelector('h1') && document.querySelector('article').contains(document.querySelector('h1'))
      ? document.querySelector('article')
      : (document.querySelector('main') || document.body);
  }

  function clean(t) {
    if (t.length > 4 && !/[a-záéíóúñ]/.test(t)) t = t.charAt(0) + t.slice(1).toLowerCase();
    return t.replace(/\s+/g, ' ').replace(/\s?\((?:[A-ZÁÉÍÓÚÑ]{2,6})\)/g, '')
      .replace(/(\d)\s?m²/g, '$1 metros cuadrados').replace(/m²/g, 'metros cuadrados')
      .replace(/(\d)\s?m2\b/g, '$1 metros cuadrados')
      .replace(/(\d)\s?km\b/gi, '$1 kilómetros').replace(/(\d)\s?cm\b/g, '$1 centímetros')
      .replace(/(\d)\s?m\b/g, '$1 metros').replace(/(\d)\s?min\b/g, '$1 minutos')
      .replace(/\bKVA\b|\bkVA\b/g, 'kilovoltamperes').replace(/\bkW\b/g, 'kilowatts')
      .replace(/\bMXN\b/g, 'pesos').replace(/\bUSD\b|\bUS\$/g, 'dólares ').replace(/\bmdp\b/gi, 'millones de pesos')
      .replace(/\baprox\.\s?/gi, 'aproximadamente ').replace(/\bart\.\s?/gi, 'artículo ').replace(/\barts\.\s?/gi, 'artículos ')
      .replace(/\bfr\.\s?/gi, 'fracción ').replace(/\bfracs\.\s?/gi, 'fracciones ').replace(/\bNo\.\s?(\d)/g, 'número $1')
      .replace(/\bLGTOC\b/g, 'Ley General de Títulos y Operaciones de Crédito').replace(/\bLISR\b/g, 'Ley del I S R')
      .replace(/\bCFF\b/g, 'Código Fiscal de la Federación').replace(/\bINPC\b/g, 'Índice Nacional de Precios al Consumidor')
      .replace(/\bCLG\b/g, 'Certificado de Libertad de Gravamen').replace(/\bZMG\b/g, 'zona metropolitana de Guadalajara')
      .replace(/→|←|›|»|«|✓|✔|★|•|·/g, ', ').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\s+,/g, ',').replace(/(,\s*){2,}/g, ', ').trim();
  }

  function collect() {
    var r = root(), out = [], picked = [];
    var nodes = r.querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.closest(SKIP)) continue;
      var hd = el.closest('header');
      if (hd && (hd.querySelector('nav,.logo,.nav-cta') || /fixed|sticky/.test(window.getComputedStyle(hd).position))) continue;
      var dup = false;
      for (var j = picked.length - 1; j >= 0 && j > picked.length - 40; j--) { if (picked[j].contains(el)) { dup = true; break; } }
      if (dup) continue;
      var cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') { if (!el.closest('details')) continue; }
      var t = el.tagName === 'TR'
        ? Array.prototype.map.call(el.children, function (c) { return c.innerText || c.textContent; }).join('. ')
        : (el.innerText || el.textContent);
      t = clean(t);
      if (t.length < 2) continue;
      picked.push(el);
      // dividir en frases de hasta ~220 caracteres para que no se corte la voz
      var parts = t.match(/[^.!?¿¡;:]+[.!?;:]*|[¿¡][^?!]+[?!]/g) || [t], buf = '';
      parts.forEach(function (p) {
        if ((buf + p).length > 220 && buf) { out.push({ el: el, text: buf.trim() }); buf = ''; }
        buf += p + ' ';
      });
      if (buf.trim()) out.push({ el: el, text: buf.trim() });
    }
    return out;
  }

  var token = 0, queue = [], idx = 0, state = 'idle', rates = [1, 1.25, 1.5, 0.85], ri = 0, voice = null, lastEl = null, keep = null;

  function pickVoice() {
    var v = synth.getVoices(); if (!v.length) return null;
    var pref = ['es-MX', 'es_MX', 'es-US', 'es_US', 'es-419', 'es-ES', 'es_ES'];
    for (var i = 0; i < pref.length; i++) {
      var m = v.filter(function (x) { return x.lang === pref[i]; });
      if (m.length) { var g = m.filter(function (x) { return /google|paulina|monica|natural|premium|enhanced/i.test(x.name); }); return g[0] || m[0]; }
    }
    return v.filter(function (x) { return /^es/i.test(x.lang); })[0] || null;
  }
  voice = pickVoice();
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () { voice = pickVoice(); };

  function mark(el) {
    if (lastEl && lastEl !== el) lastEl.classList.remove('ub-reading');
    if (el && el !== lastEl) {
      el.classList.add('ub-reading');
      var rc = el.getBoundingClientRect();
      if (rc.top < 80 || rc.bottom > window.innerHeight - 90) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    lastEl = el;
  }

  function ui() {
    var on = state !== 'idle';
    bSpeed.classList.toggle('ub-hide', !on); bStop.classList.toggle('ub-hide', !on);
    bPlay.firstChild.textContent = state === 'playing' ? '❚❚' : '🔊';
    lbl.textContent = state === 'playing' ? 'Pausa' : (state === 'paused' ? 'Continuar' : 'Escuchar');
    bPlay.setAttribute('aria-label', lbl.textContent);
  }

  function speakNext() {
    if (state !== 'playing') return;
    if (idx >= queue.length) { stop(); return; }
    var item = queue[idx], my = ++token;
    mark(item.el);
    var u = new SpeechSynthesisUtterance(item.text);
    u.lang = voice ? voice.lang : 'es-MX'; if (voice) u.voice = voice;
    u.rate = rates[ri]; u.pitch = 1;
    u.onend = function () { if (my === token && state === 'playing') { idx++; speakNext(); } };
    u.onerror = function (e) { if (my === token && state === 'playing' && e.error !== 'interrupted' && e.error !== 'canceled') { idx++; speakNext(); } };
    synth.speak(u);
  }

  function play() {
    if (state === 'idle') { queue = collect(); idx = 0; if (!queue.length) return; }
    synth.cancel(); state = 'playing'; ui(); speakNext();
    clearInterval(keep); keep = setInterval(function () { if (state === 'playing' && synth.paused) synth.resume(); }, 5000);
  }
  function pause() { state = 'paused'; token++; synth.cancel(); ui(); }
  function stop() { state = 'idle'; token++; synth.cancel(); clearInterval(keep); if (lastEl) lastEl.classList.remove('ub-reading'); lastEl = null; idx = 0; ui(); }

  bPlay.addEventListener('click', function () { state === 'playing' ? pause() : play(); });
  bStop.addEventListener('click', stop);
  bSpeed.addEventListener('click', function () {
    ri = (ri + 1) % rates.length; bSpeed.textContent = String(rates[ri]).replace('.', ',') + 'x';
    if (state === 'playing') { token++; synth.cancel(); speakNext(); }
  });
  window.addEventListener('pagehide', function () { synth.cancel(); });
  try { if (window.gtag) bPlay.addEventListener('click', function () { if (state === 'playing') gtag('event', 'escuchar_pagina', { page: location.pathname }); }); } catch (e) {}
})();
