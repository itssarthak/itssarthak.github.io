// Swarm: a few cursor-bots build each section as it scrolls into view, drawing design-tool boxes ("56×17")
// on each piece before it appears. A section that scrolls out takes itself apart; scrolling back builds it again.
// Flip scroll direction too often and the bots get angry (red eyes) and pause, longer each time, up to a max
// where they also say something. All content stays in the HTML; this only hides and shows it.
// Off for prefers-reduced-motion and for a low battery that isn't charging (the page just shows finished).
(function () {
  'use strict';

  // ---- settings (Sarthak's open choices live here) --------------------------------------------------
  var CFG = {
    sections: '.hero, #ask, #services, #oncall', // version history is left alone: its pinned, scroll-driven frame fights the bots
    pieces: 'h1, h2, p, .btn, .card, .label, form',
    bots: matchMedia('(max-width: 640px)').matches ? 3 : 5,
    colors: ['#A5432A', '#2B4C7E', '#1F6F6B', '#8C2F45', '#4B3FD1'],
    moveMs: 320, drawMs: 240,              // bot travel to a piece, then drawing its box
    flips: 4, flipWindowMs: 2500,          // "too much" = this many direction changes within this window
    pauseStepMs: 1000, pauseMaxMs: 5000,   // each repeat pauses 1s longer, up to 5s
    calmResetMs: 10000,                    // this long without a tantrum and the anger starts over at 1s
    lowBattery: 0.2,                       // below this and not charging: no animation
    lines: [                               // said at the max pause, rotated
      'We were almost done. Pick a direction.',
      'Up, down, up. Are you testing us?',
      'Union rules: no building on a moving floor.',
      'Scroll once more. I dare you.',
      'This is why we can’t have nice layouts.'
    ]
  };

  var root = document.documentElement;
  function off() { root.classList.remove('sw-boot', 'sw'); }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return off();

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var lowBattery = navigator.getBattery
    ? Promise.race([navigator.getBattery().then(function (b) { return !b.charging && b.level < CFG.lowBattery; }, function () { return false; }), sleep(400).then(function () { return false; })])
    : Promise.resolve(false);

  lowBattery.then(function (low) { if (low) off(); else start(); });

  function start() {
    // ---- sections and their pieces ------------------------------------------------------------------
    var secs = [].slice.call(document.querySelectorAll(CFG.sections)).map(function (el) { return { el: el, state: 'off', pieces: [] }; });
    function collect(s) { // top-most matches only, so a card is one piece rather than its heading + text + buttons
      var all = [].slice.call(s.el.querySelectorAll(CFG.pieces)).filter(function (p) { return !p.closest('.avatar-wrap'); });
      s.pieces = all.filter(function (p) { return !all.some(function (q) { return q !== p && q.contains(p); }); });
      s.pieces.forEach(function (p) { if (!p.classList.contains('sw-piece')) { p.classList.add('sw-piece'); p.style.setProperty('--r', (Math.random() * 8 - 4).toFixed(1) + 'deg'); } });
    }
    secs.forEach(collect);
    root.classList.add('sw');
    root.classList.remove('sw-boot');

    var jobs = [], waiting = [];
    function wake() { waiting.splice(0).forEach(function (r) { r(); }); }
    function idle() { return new Promise(function (r) { waiting.push(r); }); }
    function keep(p) { return p.contains(document.activeElement) || p.querySelector('#chat:not(:empty)'); } // never pull apart what someone is using

    function build(s) {
      if (s.el.id === 'ask' && !s.el.classList.contains('ready')) return; // the Ask card unfolds on its own first
      s.state = 'building'; collect(s);
      s.pieces.forEach(function (p) { p.style.removeProperty('--d'); if (!p.classList.contains('sw-on')) jobs.push({ s: s, p: p }); });
      wake();
    }
    function unbuild(s) {
      s.state = 'off';
      jobs = jobs.filter(function (j) { return j.s !== s; });
      var on = s.pieces.filter(function (p) { return p.classList.contains('sw-on') && !keep(p); });
      on.reverse().forEach(function (p, i) { p.style.setProperty('--d', i * 45 + 'ms'); p.classList.remove('sw-on'); });
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var s = secs.find(function (x) { return x.el === e.target; }); s.seen = e.isIntersecting; e.isIntersecting ? build(s) : unbuild(s); });
    }, { rootMargin: '-12% 0px -12% 0px' });
    secs.forEach(function (s) { io.observe(s.el); });
    var ask = secs.find(function (s) { return s.el.id === 'ask'; });
    if (ask) new MutationObserver(function () { if (ask.seen && ask.state === 'off') build(ask); }).observe(ask.el, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('focusin', function (e) { var p = e.target.closest && e.target.closest('.sw-piece'); if (p) p.classList.add('sw-on'); }); // keyboard users never land on a hidden piece

    // ---- bots ---------------------------------------------------------------------------------------
    var layer = document.createElement('div');
    layer.className = 'sw-layer'; layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    var bots = CFG.colors.slice(0, CFG.bots).map(function (c, i) {
      var el = document.createElement('div');
      el.className = 'sw-bot sw-idle'; el.style.setProperty('--c', c);
      el.innerHTML = '<svg viewBox="0 0 16 16"><path d="M2 1l11 6.5-5 1.2L5.6 14z"/></svg><span class="sw-tag"><i></i><i></i></span><span class="sw-say"></span>';
      layer.appendChild(el);
      var b = { el: el, c: c, x: innerWidth / 2, y: scrollY - 40 };
      place(b, b.x, b.y);
      return b;
    });
    function place(b, x, y) { layer.style.height = root.scrollHeight + 'px'; b.x = x; b.y = y; b.el.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }

    async function run(b) {
      for (;;) {
        await calm();
        var j = jobs.shift();
        b.busy = !!j;
        if (!j) { b.el.classList.add('sw-idle'); await idle(); continue; }
        if (j.s.state !== 'building' || j.p.classList.contains('sw-on')) continue;
        var r = j.p.getBoundingClientRect();
        if (!r.width || !r.height || r.bottom < -200 || r.top > innerHeight + 200) { j.p.classList.add('sw-on'); continue; } // nothing to watch
        b.el.classList.remove('sw-idle');
        place(b, r.left + scrollX + Math.min(24, r.width / 2), r.top + scrollY + Math.min(14, r.height / 2));
        await sleep(CFG.moveMs);
        await calm(); // an anger pause here leaves the section half-built
        if (j.s.state !== 'building') continue;
        r = j.p.getBoundingClientRect();
        var box = document.createElement('div');
        box.className = 'sw-box'; box.style.setProperty('--c', b.c);
        box.style.cssText += ';left:' + (r.left + scrollX) + 'px;top:' + (r.top + scrollY) + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
        box.innerHTML = '<span>' + Math.round(r.width) + '×' + Math.round(r.height) + '</span>';
        layer.appendChild(box);
        place(b, r.right + scrollX - 6, r.bottom + scrollY - 6); // drag to the far corner, like drawing the box
        await sleep(CFG.drawMs);
        j.p.classList.add('sw-on');
        setTimeout(function () { box.classList.add('sw-gone'); setTimeout(function () { box.remove(); }, 400); }, 260);
      }
    }
    bots.forEach(run);

    // ---- anger --------------------------------------------------------------------------------------
    var angry = false, level = 0, lastFit = 0, said = 0, flips = [], lastY = scrollY, lastDir = 0, resume = [];
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
      root.classList.add('sw-angry');
      bots.forEach(function (b, i) { // bring every bot into view so the tantrum is seen
        if (b.y < scrollY + 40 || b.y > scrollY + innerHeight - 60) place(b, innerWidth * (0.2 + 0.6 * Math.random()), scrollY + innerHeight * (0.3 + 0.12 * i));
        b.el.classList.remove('sw-idle');
      });
      if (ms >= CFG.pauseMaxMs) { place(bots[0], Math.max(8, Math.min(bots[0].x, innerWidth - 270)), bots[0].y); var say = bots[0].el.querySelector('.sw-say'); say.textContent = CFG.lines[said++ % CFG.lines.length]; bots[0].el.classList.add('sw-talk'); }
      setTimeout(function () {
        angry = false; lastFit = Date.now();
        root.classList.remove('sw-angry');
        bots.forEach(function (b) { b.el.classList.remove('sw-talk'); if (!b.busy) b.el.classList.add('sw-idle'); });
        resume.splice(0).forEach(function (r) { r(); });
      }, ms);
    }
  }
})();
