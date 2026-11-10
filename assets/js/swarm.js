// Swarm: a few cursor-bots build each section as it scrolls into view, drawing design-tool boxes ("56×17")
// on each piece before it appears, top half of the section first, then the bottom half. A section that starts
// to leave the screen takes itself apart, on-screen pieces first; scrolling back builds it again. In version
// history each version is built as it comes up, and the one it replaces falls apart.
// Flip scroll direction too often and the bots get angry (red eyes) and pause, longer each time, up to a max
// where they also say something. All content stays in the HTML; this only hides and shows it.
// Off for prefers-reduced-motion, search crawlers, and a low battery that isn't charging (the page just shows finished).
(function () {
  'use strict';

  // ---- settings (Sarthak's open choices live here) --------------------------------------------------
  var CFG = {
    sections: '.hero, #ask, #services, #versions, #oncall',
    pieces: 'h1, h2, p, .btn, .card, .label, form, .vhead, .stack, .rail',
    figure: '#avatar',                     // the cut-out figure on the Ask card: built last in its section, by a crew, slowly
    figureMs: 4000, figureCrew: 3,         // how long the crew sketches on it, and how many bots join in
    figureSteps: 8,                        // it appears bottom-up in this many steps across figureMs
    bots: matchMedia('(max-width: 640px)').matches ? 3 : 5,
    colors: ['#A5432A', '#2B4C7E', '#1F6F6B', '#8C2F45', '#4B3FD1'],
    moveMs: 380, drawMs: 300, holdMs: 120, // bot travel to a piece, drawing its box, then a beat before the next
    buildAt: 0, breakAt: 0.15,             // share of the section on screen (of the screen, for sections taller than it): build once more than this
                                           // is in (0 = any of it); take apart once a leaving section drops below this
    breakStaggerMs: 110,                   // gap between pieces falling (each takes ~0.9s, set in style.css)
    flips: 4, flipWindowMs: 2500,          // "too much" = this many direction changes within this window
    pauseStepMs: 1000, pauseMaxMs: 5000,   // each repeat pauses 1s longer, up to 5s
    calmResetMs: 10000,                    // this long without a tantrum and the anger starts over at 1s
    angryScale: 1.5, huddle: 46,           // while angry: bots grow with each repeat, up to this at the max pause, and bunch up in the middle of the screen, this far apart
    lowBattery: 0.2,                       // below this and not charging: no animation
    lines: [                               // said at the max pause, picked at random (never the same twice in a row)
      'We were almost done. Pick a direction.',
      'Up, down, up. Are you testing us?',
      'Union rules: no building on a moving floor.',
      'Scroll once more. I dare you.',
      'This is why we can’t have nice layouts.'
    ]
  };

  var root = document.documentElement;
  function off() { root.classList.remove('sw-boot', 'sw'); }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || /bot|crawl|spider|slurp/i.test(navigator.userAgent)) return off(); // search crawlers get the finished page

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var lowBattery = navigator.getBattery
    ? Promise.race([navigator.getBattery().then(function (b) { return !b.charging && b.level < CFG.lowBattery; }, function () { return false; }), sleep(400).then(function () { return false; })])
    : Promise.resolve(false);

  lowBattery.then(function (low) { if (low) off(); else start(); });

  function start() {
    // ---- sections and their pieces ------------------------------------------------------------------
    var secs = [].slice.call(document.querySelectorAll(CFG.sections)).map(function (el) { return { el: el, state: 'off', pieces: [], top: 0 }; });
    function topmost(scope) { // top-most matches only, so a card is one piece rather than its heading + text + buttons
      var all = [].slice.call(scope.querySelectorAll(CFG.pieces)).filter(function (p) { return !p.closest('.avatar-wrap, .sw-ghost, #chat'); });
      return all.filter(function (p) { return !all.some(function (q) { return q !== p && q.contains(p); }); })
        .concat([].slice.call(scope.querySelectorAll(CFG.figure)));
    }
    function mark(ps) { ps.forEach(function (p) { if (!p.classList.contains('sw-piece')) { p.classList.add('sw-piece'); p.style.setProperty('--r', (Math.random() * 14 - 7).toFixed(1) + 'deg'); } }); return ps; }
    function collect(s) { s.pieces = mark(topmost(s.el)); }
    secs.forEach(collect);
    root.classList.add('sw');
    root.classList.remove('sw-boot');

    var jobs = [], waiting = [];
    function wake() { waiting.splice(0).forEach(function (r) { r(); }); }
    function idle() { return new Promise(function (r) { waiting.push(r); }); }
    function keep(p) { return p.contains(document.activeElement) || p.querySelector('#chat:not(:empty)'); } // never pull apart what someone is using

    // Queue pieces top half first: a bottom-half piece waits until every top-half piece of its section is built.
    function queue(s, ps) {
      var r = (s.el.querySelector('.vpin') || s.el).getBoundingClientRect(), mid = r.top + r.height / 2;
      ps.filter(function (p) { return !p.classList.contains('sw-on'); })
        .map(function (p) { var b = p.getBoundingClientRect(), fig = p.matches(CFG.figure); return { s: s, gen: s.gen, p: p, y: (fig ? r.bottom - 1 : b.top) + scrollY, fig: fig, low: fig || b.top + b.height / 2 > mid }; })
        .sort(function (a, b) { return a.fig - b.fig || a.low - b.low || a.y - b.y; }) // the figure goes last: it sits on the card, so the card comes first
        .forEach(function (j) { if (!j.low) s.top++; jobs.push(j); });
      wake();
    }
    function drop(j) { if (j.gen !== j.s.gen) return; if (!j.low) j.s.top--; if (j.s.top <= 0) wake(); } // a top-half piece is finished (or gone): once none are left, the bottom half starts by itself
    function done(j) { j.p.classList.remove('sw-fall'); j.p.classList.add('sw-on'); drop(j); }
    function next() { // highest piece on the page first, so the page fills in top to bottom
      var best = -1, by = 0; // pieces still below the screen wait until they scroll in, so they're built where they're seen
      for (var i = 0; i < jobs.length; i++) {
        var j = jobs[i]; if (j.low && j.s.top > 0) continue;
        if (j.fig && !j.s.pieces.every(function (p) { return p === j.p || p.classList.contains('sw-on') || !document.contains(p); })) continue; // the figure waits for the card it stands on
        var y = j.p.getBoundingClientRect().top; // measured now: the page may have shifted since queueing
        if (y < innerHeight && (best < 0 || y < by)) { best = i; by = y; }
      }
      return best < 0 ? null : jobs.splice(best, 1)[0];
    }

    function build(s) {
      if (s.el.id === 'ask' && !s.el.classList.contains('ready')) return; // the Ask card unfolds on its own first
      s.state = 'building'; s.top = 0; s.gen = (s.gen || 0) + 1; collect(s);
      s.pieces.forEach(function (p) { p.style.removeProperty('--d'); });
      queue(s, s.pieces);
    }
    // Pieces fall apart one by one, those still on screen first, so the break-up is seen as the section leaves.
    function breakUp(ps) {
      var vh = innerHeight;
      ps.filter(function (p) { return p.classList.contains('sw-on') && !keep(p); })
        .map(function (p) { var r = p.getBoundingClientRect(); return { p: p, d: r.bottom < 0 ? -r.bottom : r.top > vh ? r.top - vh : -1 }; })
        .sort(function (a, b) { return a.d - b.d; })
        .forEach(function (x, i) {
          var p = x.p, d = i * CFG.breakStaggerMs;
          p.style.setProperty('--d', d + 'ms'); p.classList.remove('sw-on'); p.classList.add('sw-fall');
          setTimeout(function () { // once it has fallen out of sight, put it back in its real spot, unseen
            if (!p.classList.contains('sw-fall')) return;
            p.style.transition = 'none'; p.classList.remove('sw-fall'); void p.offsetWidth; p.style.transition = '';
          }, d + 1100);
        });
    }
    function unbuild(s) {
      s.state = 'off';
      jobs = jobs.filter(function (j) { return j.s !== s; });
      s.pieces.forEach(function (p) { p.classList.remove('sw-forming'); });
      breakUp(s.pieces);
    }

    // Measured on scroll rather than with IntersectionObserver: the version history section is many screens tall,
    // and its share of the screen is what matters, not its share of itself.
    function check(scrolled) { // only a scroll takes things apart, never the page shifting under a still reader
      var vh = innerHeight;
      secs.forEach(function (s) {
        var r = s.el.getBoundingClientRect(), seen = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / Math.min(r.height || 1, vh);
        var leaving = scrolled === true && (lastDir > 0 ? r.top < 0 : r.bottom > vh); // cut off on the side it's scrolling out of
        if (s.state === 'off' && seen > CFG.buildAt && (!leaving || seen >= 0.98)) build(s);
        else if (s.state !== 'off' && leaving && seen < CFG.breakAt) unbuild(s);
      });
    }
    var ticking = false;
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; check(true); if (jobs.length) wake(); }); } }, { passive: true });
    addEventListener('resize', function () { check(); });
    check();
    var ask = secs.find(function (s) { return s.el.id === 'ask'; });
    if (ask) new MutationObserver(function () { check(); }).observe(ask.el, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('focusin', function (e) { var p = e.target.closest && e.target.closest('.sw-piece'); if (p) p.classList.add('sw-on'); }); // keyboard users never land on a hidden piece

    // Version history swaps the shown version as you scroll: the outgoing one falls apart over the incoming one,
    // which the bots then build.
    var vs = secs.find(function (s) { return s.el.id === 'versions'; }), stage = document.getElementById('vstage');
    if (vs && stage) new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        [].forEach.call(m.removedNodes, function (old) {
          if (!old.classList || !old.classList.contains('vframe') || vs.state === 'off') return;
          old.classList.add('sw-ghost'); old.classList.remove('enter');
          stage.appendChild(old);
          requestAnimationFrame(function () { breakUp([].slice.call(old.querySelectorAll('.sw-piece'))); });
          setTimeout(function () { old.remove(); }, 1600);
        });
      });
    }).observe(stage, { childList: true });
    // Content drawn after load (the product cards once stats arrive, each new version) gets built too.
    secs.forEach(function (s) {
      new MutationObserver(function () {
        var fresh = topmost(s.el).filter(function (p) { return !p.classList.contains('sw-piece'); });
        if (!fresh.length) return;
        s.pieces = s.pieces.filter(function (p) { return document.contains(p) && !p.closest('.sw-ghost'); }).concat(mark(fresh));
        if (s.state !== 'off') queue(s, fresh);
      }).observe(s.el, { childList: true, subtree: true });
    });

    // ---- bots ---------------------------------------------------------------------------------------
    // Bots live in a layer over the page; for version history they hop into a layer inside its pinned frame,
    // so they stay on their piece while that frame holds still and the page scrolls underneath.
    function mkLayer(parent) {
      var l = document.createElement('div');
      l.className = 'sw-layer'; l.setAttribute('aria-hidden', 'true');
      parent.appendChild(l); return l;
    }
    var page = mkLayer(document.body), pin = document.querySelector('#versions .vpin'), pinLayer = pin && mkLayer(pin);
    if (pinLayer) pinLayer.classList.add('sw-pinned');
    var screenLayer = mkLayer(document.body); screenLayer.classList.add('sw-screen'); // the anger huddle holds still on screen while the page scrolls
    var say = document.createElement('div'); say.className = 'sw-say'; screenLayer.appendChild(say); // the line, above the huddle and in front of it
    function layerFor(p) { return pinLayer && pin.contains(p) ? pinLayer : page; }
    var bots = CFG.colors.slice(0, CFG.bots).map(function (c) {
      var el = document.createElement('div');
      el.className = 'sw-bot sw-idle'; el.style.setProperty('--c', c);
      el.innerHTML = '<span class="sw-robot"><b class="sw-ant"></b><span class="sw-tag"><i></i><i></i></span><span class="sw-body"></span></span>';
      page.appendChild(el);
      var b = { el: el, c: c, layer: page, x: innerWidth / 2, y: scrollY - 40 };
      place(b, page, b.x, b.y);
      return b;
    });
    function place(b, layer, x, y) { // x, y in the layer's own coordinates
      if (layer === page) page.style.height = root.scrollHeight + 'px';
      if (b.layer !== layer) { // hop layers without a visible jump, then glide from there
        var from = b.layer.getBoundingClientRect(), to = layer.getBoundingClientRect();
        b.el.style.transition = 'none';
        b.el.style.transform = 'translate(' + (b.x + from.left - to.left) + 'px,' + (b.y + from.top - to.top) + 'px)';
        layer.appendChild(b.el); b.layer = layer;
        void b.el.offsetWidth; b.el.style.transition = '';
      }
      b.x = x; b.y = y; b.el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }
    function at(layer, r) { var L = layer.getBoundingClientRect(); return { x: r.left - L.left, y: r.top - L.top }; }

    // The figure gets its own moment: the bot that takes it sketches boxes all over it, others join in,
    // and only after figureMs is the whole thing boxed and shown.
    var crew = null;
    async function sketch(b, p, layer) {
      while (crew && Date.now() < crew.until) {
        await calm();
        var r = p.getBoundingClientRect(), w = r.width * (0.3 + Math.random() * 0.4), h = r.height * (0.25 + Math.random() * 0.35);
        var o = at(layer, { left: r.left + Math.random() * (r.width - w), top: r.top + Math.random() * (r.height - h) });
        place(b, layer, o.x + 4, o.y + 4);
        await sleep(CFG.moveMs * 0.6);
        var box = document.createElement('div');
        box.className = 'sw-box'; box.style.setProperty('--c', b.c);
        box.style.cssText += ';left:' + o.x + 'px;top:' + o.y + 'px;width:' + w + 'px;height:' + h + 'px';
        box.innerHTML = '<span>' + Math.round(w) + '×' + Math.round(h) + '</span>';
        layer.appendChild(box);
        place(b, layer, o.x + w - 6, o.y + h - 6);
        await sleep(CFG.drawMs);
        (function (x) { setTimeout(function () { x.classList.add('sw-gone'); setTimeout(function () { x.remove(); }, 400); }, 200); })(box);
      }
    }

    async function run(b) {
      for (;;) {
        await calm();
        if (crew && crew.n < CFG.figureCrew && Date.now() < crew.until) { // join the crew on the figure
          crew.n++; b.busy = true; b.el.classList.remove('sw-idle');
          await sketch(b, crew.p, crew.layer);
          continue;
        }
        var j = next();
        b.busy = !!j;
        if (!j) { b.el.classList.add('sw-idle'); await idle(); continue; }
        if (j.s.state === 'off' || j.gen !== j.s.gen) continue; // its section left (and maybe came back): build() queued it afresh
        if (!document.contains(j.p) || j.p.closest('.sw-ghost') || j.p.classList.contains('sw-on')) { drop(j); continue; }
        var r = j.p.getBoundingClientRect(), layer = layerFor(j.p);
        if (!r.width || !r.height || r.bottom < -200) { done(j); continue; } // already scrolled past: nothing to watch
        b.el.classList.remove('sw-idle');
        if (j.fig && !crew) {
          crew = { p: j.p, layer: layer, until: Date.now() + CFG.figureMs, n: 1 }; wake();
          var fig = j.p, step = 0;
          fig.style.setProperty('--cut', '100%'); fig.classList.add('sw-forming');
          var grow = setInterval(function () { if (angry) return; step++; fig.style.setProperty('--cut', Math.max(0, 100 - step * 100 / CFG.figureSteps) + '%'); if (step >= CFG.figureSteps) clearInterval(grow); }, CFG.figureMs / CFG.figureSteps);
          await sketch(b, fig, layer);
          clearInterval(grow); crew = null;
          fig.classList.remove('sw-fall'); fig.classList.add('sw-on'); fig.classList.remove('sw-forming'); fig.style.removeProperty('--cut'); // on first, so it never blinks out
        }
        var o = at(layer, r);
        place(b, layer, o.x + Math.min(24, r.width / 2), o.y + Math.min(14, r.height / 2));
        await sleep(CFG.moveMs);
        await calm(); // an anger pause here leaves the section half-built
        if (j.s.state === 'off' || j.gen !== j.s.gen) continue;
        if (!document.contains(j.p) || j.p.closest('.sw-ghost')) { drop(j); continue; }
        r = j.p.getBoundingClientRect(); o = at(layer, r);
        var box = document.createElement('div');
        box.className = 'sw-box'; box.style.setProperty('--c', b.c);
        box.style.cssText += ';left:' + o.x + 'px;top:' + o.y + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
        box.innerHTML = '<span>' + Math.round(r.width) + '×' + Math.round(r.height) + '</span>';
        layer.appendChild(box);
        place(b, layer, o.x + r.width - 6, o.y + r.height - 6); // drag to the far corner, like drawing the box
        await sleep(CFG.drawMs);
        done(j);
        setTimeout(function () { box.classList.add('sw-gone'); setTimeout(function () { box.remove(); }, 400); }, 300);
        await sleep(CFG.holdMs);
      }
    }
    bots.forEach(run);

    // ---- anger --------------------------------------------------------------------------------------
    var angry = false, level = 0, lastFit = 0, said = -1, flips = [], lastY = scrollY, lastDir = 0, resume = [];
    function calm() { return angry ? new Promise(function (r) { resume.push(r); }) : Promise.resolve(); }
    addEventListener('scroll', function () {
      var dy = scrollY - lastY; if (Math.abs(dy) < 4) return;
      var dir = dy > 0 ? 1 : -1, now = Date.now();
      lastY = scrollY;
      if (lastDir && dir !== lastDir) flips.push(now);
      lastDir = dir;
      flips = flips.filter(function (t) { return now - t < CFG.flipWindowMs; });
      if (!angry && flips.length >= CFG.flips) tantrum(now);
    }, { passive: true });

    function tantrum(now) {
      if (now - lastFit > CFG.calmResetMs) level = 0;
      level++;
      var ms = Math.min(CFG.pauseStepMs * level, CFG.pauseMaxMs);
      angry = true; flips = [];
      var grow = Math.min(level * CFG.pauseStepMs / CFG.pauseMaxMs, 1); // 0..1, reaches 1 at the max pause
      root.style.setProperty('--sw-angry-scale', 1 + (CFG.angryScale - 1) * grow);
      root.classList.add('sw-angry');
      bots.forEach(function (b, i) { // everyone huddles in the middle of the screen, in a ring, for the whole pause
        var a = i / bots.length * 2 * Math.PI - Math.PI / 2;
        place(b, screenLayer, innerWidth / 2 + Math.cos(a) * CFG.huddle, innerHeight / 2 + Math.sin(a) * CFG.huddle * 0.7);
        b.el.classList.remove('sw-idle');
      });
      if (ms >= CFG.pauseMaxMs) { var n; do { n = Math.floor(Math.random() * CFG.lines.length); } while (n === said && CFG.lines.length > 1); said = n; say.textContent = CFG.lines[n]; say.style.bottom = (innerHeight / 2 + CFG.huddle * 0.7 + 52 * CFG.angryScale) + 'px'; say.classList.add('sw-on'); }
      setTimeout(function () {
        angry = false; lastFit = Date.now();
        root.classList.remove('sw-angry');
        say.classList.remove('sw-on');
        bots.forEach(function (b) { if (!b.busy) b.el.classList.add('sw-idle'); });
        resume.splice(0).forEach(function (r) { r(); });
      }, ms);
    }
  }
})();
