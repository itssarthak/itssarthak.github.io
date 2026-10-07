// Sarthak, versioned. One version setting and one search engine, shared by the page, the terminal and the console.
(function () {
  'use strict';

  // ---- data -------------------------------------------------------------
  // Versions follow titles, not dates (no dates anywhere on the site). `look` picks the page style for that version;
  // company names only appear as small labels on projects.
  var STOPS = [
    { v: 'v1', title: 'Student', look: 'college', blurb: 'B.E. Computer Science. Where the system first booted.',
      stack: ['Computer Science'], projects: [['B.E. Computer Science', 'LPU', 'Graduated with an 8.7 CGPA.', ['8.7 CGPA']]] },
    { v: 'v2', title: 'Associate Software Engineer', look: 'bosch', blurb: 'Where I learned discipline: close work with product owners and careful releases.',
      stack: ['Angular', 'C#', 'SQL'], projects: [['Cross-platform applications', 'Bosch', 'Built alongside product owners, with rigorous version control.', ['−25% ticket resolution time', '−20% rework']]] },
    { v: 'v3', title: 'Software Developer', look: 'startups', blurb: 'Where I learned speed: shipping across the whole lifecycle.',
      stack: ['ReactJS', 'Angular', 'PHP', 'SQL'], projects: [['New and legacy modules', 'Signcatch', 'New features and legacy upkeep, from spec to release.', ['−20% time-to-market', '−15% churn', '+25% positive feedback']]] },
    { v: 'v4', title: 'Full Stack Developer', look: 'startups', blurb: 'Owning modules end to end, and scaling the backend behind them.',
      stack: ['NodeJS', 'VueJS', 'MongoDB', 'AWS SQS'], projects: [
        ['End-to-end modules', 'Gigforce', 'Owned new modules from design to launch.', ['+25% stability', 'fewer post-launch bugs']],
        ['Backend scaling', 'Gigforce', 'Scaled backend services for operational growth.', ['−40% peak-load latency', '−30% query time']]] },
    { v: 'v5', title: 'Senior Software Engineer', look: 'transition', blurb: 'Where I learned to build things that don’t fall over, and started moving toward AI.',
      stack: ['NodeJS', 'TypeScript', 'AWS', 'MongoDB', 'Kafka'], projects: [
        ['High-throughput processing', 'Dresma AI', 'Near-fail-proof architecture for heavy computation.', ['+50% stability', '−30% processing time']],
        ['Performance', 'Dresma AI', 'Optimisation and debugging across services.', ['−40% response time', '+30% efficiency']],
        ['Mentoring', 'Dresma AI', 'Coached junior engineers across backend, frontend and AWS.', ['+20% delivery efficiency', '−30% error rates']]] },
    { v: 'v6', title: 'Tech Lead', look: 'agents', blurb: 'Platforms that put AI agents into production, and leading the team that builds them.',
      stack: ['NodeJS', 'TypeScript', 'Postgres', 'Qdrant', 'LangGraph', 'RAG', 'AWS', 'Docker'], projects: [
        ['No-code agent platform', 'Stashfin', 'Prompt, tools, model and channels, all self-serve.', ['days → minutes', '44M tokens/day']],
        ['LLM routing engine', 'Zupee', 'One gateway for every LLM call, surviving provider outages.', ['300K+ req/day', '15–20ms', '99% uptime']],
        ['AI companion', 'Zupee', 'Multi-agent response planning with long-term memory.', ['46% D15 retention']],
        ['Dynamic tool framework', 'Stashfin', 'Any REST API becomes an agent tool, no code.', ['zero hand-written integrations']],
        ['Knowledge + memory', 'Stashfin', 'Knowledge bases without engineering; one memory across email, phone and Slack.', ['self-serve RAG']],
        ['Promo generation', 'Zupee', 'Parallel ad-creative production, run by product managers.', ['1 week → 3 hours']]] }
  ];
  var HEAD = STOPS.length - 1;
  var SERVICES = [
    { id: 'askmyastro', name: 'AskMyAstro', d: 'An AI astrologer that reads your birth chart and answers over chat.', href: 'askmyastro-demo.html', url: 'https://askmyastro.in', site: 'askmyastro.in', n: function (s) { return s.askmyastro.users; }, metric: function (s) { return [k(s.askmyastro.users), 'users']; } },
    { id: 'filedownloader', name: 'FileDownloader', d: 'Paste links, get every file at once, zipped.', href: 'filedownloader.html', url: 'https://filedownloader.in', site: 'filedownloader.in', n: function (s) { return s.filedownloader.downloads; }, metric: function (s) { return [k(s.filedownloader.downloads), 'downloads served']; } },
    { id: 'switchboard', name: 'Switchboard', d: 'Open-source dashboard for every Claude Code session on your Mac.', href: 'switchboard.html', url: 'https://github.com/itssarthak/claudecode-switchboard', site: 'GitHub', n: function (s) { return s.switchboard.clones; }, metric: function (s) { return [s.switchboard.clones, 'installs · ' + s.switchboard.stars + ' ★']; } },
    // New products (Oct 2026): the live number plus a 'New' pill beside it; drop tag once they're established
    { id: 'castbar', name: 'Castbar', d: 'Your Chromecast remote, right in your Mac menu bar.', href: null, url: 'https://github.com/itssarthak/castbar', site: 'GitHub', ph: 'https://www.producthunt.com/products/castbar', tag: 'New',
      n: function (s) { return s.castbar.clones; }, metric: function (s) { return [k(s.castbar.clones), 'clones on GitHub']; } },
    { id: 'discretedocs', name: 'DiscreteDocs', d: 'PDF tools that work inside your browser. Your files never leave your device.', href: null, url: 'https://discretedocs.com', site: 'discretedocs.com', tag: 'New',
      n: function (s) { return s.discretedocs.files; }, metric: function (s) { return [k(s.discretedocs.files), s.discretedocs.files === 1 ? 'file processed' : 'files processed']; } }
  ];
  // Ask-box suggestions: [what the chip says, the answer-bank question it leads to]. 3 show at a time; see initSuggestions().
  var SUGGEST = [
    ['What is AskMyAstro?', 'What is AskMyAstro?'],
    ['Has he led a team?', 'Do you have team-leading experience?'], 
    
    ['What has he built on his own?', 'What have you built yourself?'], ['What is Switchboard?', 'What is Switchboard?'],
    ['What is FileDownloader?', 'What is FileDownloader?'], ['What is Castbar?', 'What is Castbar?'], ['What is DiscreteDocs?', 'What is DiscreteDocs?'], ['Are these numbers real?', 'Are these numbers real?'],
    ['What did he build at Stashfin?', 'What did you do at Stashfin?'], ['How does his LLM router work?', "What's the LLM routing engine?"],
    ['How did the companion hit 46% retention?', 'How did the companion reach 46% D15 retention?'], ['How does he reduce hallucinations?', 'How do you reduce hallucinations?'],
    ['How does he keep LLM costs down?', 'How do you control LLM costs?'], ['How does he evaluate LLM outputs?', 'How do you evaluate LLM outputs?'],
    ['What\u2019s his tech stack?', "What's your tech stack?"], ['Which LLMs has he worked with?', 'Which LLM providers have you worked with?'],
    ['Which project is he proudest of?', 'What project are you proudest of?'],
    ['What\u2019s his leadership style?', "What's your leadership style?"], ['How does he mentor engineers?', 'How do you mentor engineers?'],
    
    
    ['Does he do system design?', 'Do you do system design?'], ['Why LangGraph?', 'Why LangGraph?'],
    ['How does he handle prompt injection?', 'How do you handle prompt injection?'], ['How does he monitor agents in production?', 'How do you monitor AI agents in production?'],
    ['Has he built MCP servers?', 'Have you built MCP servers?'], ['Does he use AI coding tools?', 'Do you use AI coding tools?'],
    ['How does this Ask box work?', 'How does this Ask box work?'], ['Any hidden features?', 'Any hidden features?'],
    ['Why did he build Switchboard?', 'Why did you build Switchboard?'], ['Why astrology?', 'Why astrology?'],
    ['How does he work with people outside engineering?', 'How do you work with non-technical stakeholders?'], ['What\u2019s his career story?', "What's your career story?"],
    ['Where did he study?', 'Where did you study?'], ['Frontend or backend?', 'Frontend or backend?'],
    ['What does he do outside work?', 'What do you do outside work?'], ['What languages does he speak?', 'What languages do you speak?'], ['Where is he based?', 'Where are you based?']
  ];
  var EMAIL = 'hello@sarthakchhabra.com';

  // ---- helpers ----------------------------------------------------------
  var $ = function (id) { return document.getElementById(id); };
  function k(n) { return n >= 1e5 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function md(s) { // tiny markdown: `code`, [text](url), bare emails and web addresses become links, paragraphs
    return esc(s).split('\n').map(function (p) {
      return '<p>' + p.replace(/`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|((?:https?:\/\/)?(?:[\w-]+\.)+(?:com|in|io|dev|ai|me|org|net|app)\b(?:\/[^\s<]*[^\s<.,;:!?)])?)/g, function (m, code, text, href, mail, url) {
        if (code) return '<code>' + code + '</code>';
        if (text) return '<a href="' + href + '">' + text + '</a>';
        if (mail) return '<a href="mailto:' + mail + '">' + mail + '</a>'; // the mailto handler below copies it / offers the form
        return '<a href="' + (/^https?:/.test(url) ? url : 'https://' + url) + '" target="_blank" rel="noopener">' + url + '</a>';
      }) + '</p>';
    }).join('');
  }
  function plain(s) { return s.replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1 ($2)'); }

  // The home page has the whole system; case-study pages only get the terminal (a ~$ button, top right) and console.
  var HOME = !!$('svc');
  if (!$('term')) document.body.insertAdjacentHTML('beforeend',
    '<div class="term" id="term" role="dialog" aria-label="Terminal" aria-modal="false"><div class="bar"><i></i><i></i><i></i><span>sarthak — zsh</span>' +
    '<button id="termX" aria-label="Close terminal">esc ✕</button></div><div class="out" id="out"></div>' +
    '<form class="line" id="termForm"><span id="ps1"></span><span class="gw"><span class="ghost" id="ghost" aria-hidden="true"></span><input id="termIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal input"></span></form></div>' +
    ($('termChip') ? '' : '<button class="term-fab" id="termChip" aria-label="Open terminal">~$</button>'));

  // ---- live stats -------------------------------------------------------
  var stats = null;
  var statsReady = fetch('/assets/data/live-stats.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
    .then(function (s) { stats = s; }).catch(function () {});
  function healthy() { // honest health: the numbers are only "live" if the daily refresh ran
    return stats && (Date.now() - new Date(stats.updated + 'T23:59:59Z')) < 2 * 864e5;
  }
  function fill(text) {
    return text.replace(/\{\{([\w.]+)\}\}/g, function (_, path) {
      var v = path.split('.').reduce(function (o, key) { return o && o[key]; }, stats);
      return v == null ? '…' : typeof v === 'number' ? v.toLocaleString('en-US') : v;
    });
  }

  // ---- version: one setting for everything -----------------------------
  // On the home page the version comes from scroll position inside the Version history section; above and
  // below it the site is at HEAD. Everywhere else it's HEAD.
  var era = HEAD;
  function label(i) { return STOPS[i].v + ' · ' + STOPS[i].title; }
  function setEra(i) {
    i = Math.max(0, Math.min(HEAD, i));
    var changed = i !== era; era = i;
    if (typeof setPrompt === 'function' && !mode) setPrompt();
    if (!HOME) return;
    document.body.dataset.era = STOPS[i].look;
    $('ver').textContent = label(i);
    renderStatus();
    renderStop(changed);
  }
  function eraFromArg(a) { // v3, 3, or a word from the title ("senior", "tech lead", "head")
    a = String(a).toLowerCase().trim().replace(/^v(?=\d)/, '');
    if (/^(head|now|main)$/.test(a)) return HEAD;
    if (/^\d+$/.test(a)) return +a >= 1 && +a <= STOPS.length ? +a - 1 : -1;
    return a ? STOPS.findIndex(function (s) { return s.title.toLowerCase().indexOf(a) >= 0; }) : -1;
  }
  function goEra(i) { // on home, checking out a version scrolls the history to it; elsewhere, go home at that version
    if (HOME) scrollToStop(i, true); else location.href = './?v=' + STOPS[i].v;
  }

  function sysState() { return era === 0 ? 'boot' : era < HEAD || healthy() || !stats ? '' : 'warn'; }
  function sysText() { return { boot: 'booting…', '': 'all systems operational', warn: 'degraded · live stats are stale' }[sysState()]; }
  function renderStatus() {
    var st = sysState();
    $('sysDot').className = 'dot' + (st ? ' ' + st : ''); $('sys').className = st;
    $('sys').textContent = sysText() + (stats && stats.portfolio && st !== 'boot' ? ' · ' + k(stats.portfolio.users) + ' visitors' : ''); // this site's own all-time visitors (GA4)
  }
  // The last 30 days as a small line under each number (inline SVG; stretches to the card's width).
  var SHOW_WEEK = false; // the '+N this week' badge on each card: hidden for now (Sarthak, Oct 2026); true brings it back
  function trendSvg(v) {
    if (v.length < 2) return '';
    var max = Math.max.apply(null, v) || 1, pts = v.map(function (x, i) { return (i / (v.length - 1) * 100).toFixed(1) + ',' + (26 - x / max * 24).toFixed(1); });
    return '<svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none" role="img" aria-label="Last 30 days"><path class="area" d="M0,28 L' + pts.join(' L') + ' L100,28 Z"/><polyline points="' + pts.join(' ') + '"/></svg>';
  }
  // Numbers count up from 0 the first time the cards scroll into view (skipped for reduced motion).
  function countUp() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !window.IntersectionObserver) return;
    var nums = [].slice.call($('svc').querySelectorAll('.num[data-n]'));
    nums.forEach(function (el) { el.textContent = '0'; });
    var io = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      var t0 = performance.now(), D = 1200;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 3); // ease out
        nums.forEach(function (el) { el.textContent = k(Math.round(+el.dataset.n * e)); });
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.4 });
    io.observe($('svc'));
  }
  function renderServices() { // "live now": only your own products, only at HEAD (the section sits above the history, so it always is)
    $('svcNote').textContent = stats ? 'live · refreshed ' + stats.updated : 'live · refreshed daily';
    $('svc').innerHTML = SERVICES.map(function (s, i) {
      var live = stats && stats[s.id], m = live ? s.metric(stats) : ['—', ''], v = live && stats[s.id].series ? stats[s.id].series.values : [];
      var week = v.slice(-7).reduce(function (a, b) { return a + b; }, 0);
      return '<div class="card in" style="animation-delay:' + i * 70 + 'ms"><span class="nm"><span class="dot' + (stats && !healthy() ? ' warn' : '') + '"></span>' + s.name + '</span>' +
        '<span class="d">' + s.d + '</span><span class="m"><span class="num"' + (live ? ' data-n="' + s.n(stats) + '"' : '') + '>' + m[0] + '</span>' + (s.tag ? '<span class="new">' + s.tag + '</span>' : '') +
        (SHOW_WEEK && week ? '<span class="wk">+' + k(week) + ' this week</span>' : '') + '<small>' + m[1] + '</small></span>' + trendSvg(v) +
        '<span class="go">' + (s.href ? '<a href="' + s.href + '">Watch it run →</a>' : '') + (s.ph ? '<a href="' + s.ph + '" target="_blank" rel="noopener">Product Hunt ↗</a>' : '') + '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.site + ' ↗</a></span></div>';
    }).join('');
    if (stats) countUp();
  }
  function renderStop(animate) {
    var s = STOPS[era], cos = [];
    s.projects.forEach(function (p) { if (cos.indexOf(p[1]) < 0) cos.push(p[1]); });
    [].forEach.call($('rail').children, function (li) { var j = +li.firstChild.dataset.i; li.classList.toggle('on', j === era); li.classList.toggle('past', j > era); }); // rail runs v6 → v1
    $('vstage').innerHTML = '<div class="vframe' + (animate ? ' enter' : '') + '">' +
      '<div class="vhead"><span class="vnum">' + s.v + '</span><h3>' + esc(s.title) + '</h3><span class="cos">' + cos.map(esc).join(' · ') + '</span></div>' +
      '<p class="vblurb">' + esc(s.blurb) + '</p>' +
      '<div class="vcards">' + s.projects.map(function (p, i) {
        return '<div class="card vcard" style="animation-delay:' + (animate ? 80 + i * 60 : 0) + 'ms"><span class="co">' + esc(p[1]) + '</span><b>' + esc(p[0]) + '</b><p>' + esc(p[2]) + '</p>' +
          '<div class="mets">' + p[3].map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</div></div>';
      }).join('') + '</div>' +
      '<div class="stack">stack @ ' + s.v + ': ' + s.stack.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div>';
  }

  // Scroll inside the pinned section to go back in time, v6 → v1, like the demos. Page is already at HEAD when you arrive,
  // so there's no jump in; after the section it returns to HEAD for the footer.
  var vsec = $('versions');
  function barH() { return $('status') ? $('status').offsetHeight : 0; }
  function vspan() { return vsec.offsetHeight - (innerHeight - barH()); }
  function stopFromScroll() {
    var top = vsec.getBoundingClientRect().top - barH();
    if (top > 0) return HEAD; // haven't reached the history yet
    var p = Math.min(0.9999, -top / vspan());
    return p >= 0.9999 && vsec.getBoundingClientRect().bottom < innerHeight ? HEAD : HEAD - Math.floor(p * STOPS.length);
  }
  function scrollToStop(i, smooth) {
    scrollTo({ top: vsec.offsetTop - barH() + vspan() * (HEAD - i + 0.5) / STOPS.length, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  }
  if (HOME) {
    vsec.style.setProperty('--stops', STOPS.length);
    var setBar = function () { document.documentElement.style.setProperty('--bar', barH() + 'px'); };
    setBar(); addEventListener('resize', setBar);
    $('rail').innerHTML = STOPS.map(function (s, i) { return '<li><button data-i="' + i + '"><span class="vn">' + s.v + '</span><span class="vt">' + esc(s.title) + '</span></button></li>'; }).reverse().join('');
    $('rail').onclick = function (e) { var b = e.target.closest('button'); if (b) scrollToStop(+b.dataset.i, true); };
    addEventListener('scroll', function () { var i = stopFromScroll(); if (i !== era) setEra(i); }, { passive: true }); // cheap: two rect reads; DOM only changes on a new version
  }

  // ---- mail (shared by the contact form and the terminal's `mail`) ---------
  // Same EmailJS service and template as the old contact page, so messages land in the same inbox. SDK loads on first use.
  var mailSdk;
  function loadMail() {
    return mailSdk || (mailSdk = new Promise(function (res, rej) {
      var el = document.createElement('script');
      el.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      el.onload = function () { window.emailjs.init('LhqIBx9HdNrecNXa6'); res(window.emailjs); };
      el.onerror = function (e) { mailSdk = null; rej(e); }; document.head.appendChild(el);
    }));
  }
  function sendMail(fields, via) { // fields: { fullname, email, message }; the visit details ride along inside the message
    var uad = navigator.userAgentData; // Chromium only: the real OS version and device model (the UA string freezes them)
    var hints = uad && uad.getHighEntropyValues ? uad.getHighEntropyValues(['platformVersion', 'model', 'architecture']).catch(function () { return null; }) : Promise.resolve(null);
    return Promise.all([loadMail(), hints]).then(function (r) {
      var body = fields.message + '\n\n' + visitorInfo(via, r[1]);
      return r[0].send('service_okhl58i', 'template_k5j1ftq', { fullname: fields.fullname, email: fields.email, message: body });
    });
  }

  // ---- visit details, attached to messages so replies have context (disclosed next to both senders) ----
  var SESS_KEY = 'sv.sess';
  var sess = (function () { // per-tab visit: landing, referrer, campaign tags, pages seen, questions asked
    var x = null;
    try { x = JSON.parse(sessionStorage.getItem(SESS_KEY)); } catch (e) {}
    if (!x) {
      var q = new URLSearchParams(location.search), utm = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'].forEach(function (k) { if (q.get(k)) utm[k] = q.get(k); });
      x = { start: Date.now(), landing: location.pathname + location.search, ref: document.referrer || '', utm: utm, pages: [], asked: [] };
    }
    x.pages.push(location.pathname); x.pages = x.pages.slice(-25);
    return x;
  })();
  function saveSess() { try { sessionStorage.setItem(SESS_KEY, JSON.stringify(sess)); } catch (e) {} }
  saveSess();
  var firstSeen = (function () {
    try { var f = localStorage.getItem('sv.first'); if (!f) { f = String(Date.now()); localStorage.setItem('sv.first', f); return null; } return +f; } catch (e) { return null; }
  })();
  function logAsked(q) { sess.asked.push(q.slice(0, 120)); sess.asked = sess.asked.slice(-15); saveSess(); }
  function browserOf(ua) {
    var m = ua.match(/(Edg|OPR|Firefox|SamsungBrowser|CriOS|FxiOS|Chrome)\/([\d.]+)/) || (/Safari\//.test(ua) && ua.match(/Version\/([\d.]+)/) && ['', 'Safari', ua.match(/Version\/([\d.]+)/)[1]]);
    var names = { Edg: 'Edge', OPR: 'Opera', CriOS: 'Chrome (iOS)', FxiOS: 'Firefox (iOS)', SamsungBrowser: 'Samsung Internet' };
    return m ? (names[m[1]] || m[1]) + ' ' + m[2].split('.')[0] : 'unknown';
  }
  function osOf(ua) {
    var m;
    if ((m = ua.match(/iPhone OS ([\d_]+)/))) return 'iOS ' + m[1].replace(/_/g, '.');
    if ((m = ua.match(/iPad.*OS ([\d_]+)/))) return 'iPadOS ' + m[1].replace(/_/g, '.');
    if ((m = ua.match(/Android ([\d.]+)/))) return 'Android ' + m[1];
    if ((m = ua.match(/Mac OS X ([\d_]+)/))) return 'macOS ' + m[1].replace(/_/g, '.');
    if ((m = ua.match(/Windows NT ([\d.]+)/))) return 'Windows ' + ({ '10.0': '10/11', '6.3': '8.1', '6.1': '7' }[m[1]] || m[1]);
    if (/CrOS/.test(ua)) return 'ChromeOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'unknown';
  }
  function realOs(os, h) { // swap the frozen version for the real one when the browser shares it
    if (!h || !h.platformVersion) return os;
    var major = parseInt(h.platformVersion, 10);
    if (/^macOS/.test(os)) return 'macOS ' + h.platformVersion;
    if (/^Windows/.test(os)) return 'Windows ' + (major >= 13 ? '11' : '10');
    if (/^Android/.test(os)) return 'Android ' + h.platformVersion;
    return os;
  }
  function visitorInfo(via, hints) {
    var n = navigator, ua = n.userAgent || '', now = new Date(), tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    var mins = Math.round((Date.now() - sess.start) / 60000);
    var touch = n.maxTouchPoints > 0, small = Math.min(screen.width, screen.height) < 600;
    var lines = [
      '———— sent from sarthakchhabra.com ————',
      'via:          ' + via + ' on ' + location.pathname,
      'their time:   ' + now.toString().replace(/ GMT.*$/, '') + (tz ? ' (' + tz + ')' : ''),
      'utc:          ' + now.toISOString(),
      '',
      'browser:      ' + browserOf(ua),
      'os:           ' + realOs(osOf(ua), hints) + (hints && hints.architecture ? ' · ' + hints.architecture : ''),
      'model:        ' + ((hints && hints.model) || (/iPhone|iPad/.test(ua) ? ua.match(/iPhone|iPad/)[0] : 'not shared')),
      'device:       ' + (touch ? (small ? 'phone' : 'tablet / touch screen') : 'desktop / laptop'),
      'screen:       ' + screen.width + '×' + screen.height + ' @' + (window.devicePixelRatio || 1) + 'x · window ' + innerWidth + '×' + innerHeight,
      'language:     ' + ((n.languages && n.languages.join(', ')) || n.language || '?'),
      'theme:        ' + (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') + ' mode',
      'connection:   ' + ((n.connection && n.connection.effectiveType) || '?') + (n.connection && n.connection.saveData ? ' (data saver on)' : ''),
      'hardware:     ' + (n.hardwareConcurrency || '?') + ' cores · ' + (n.deviceMemory ? n.deviceMemory + ' GB+ memory' : 'memory ?'),
      '',
      'came from:    ' + (sess.ref || 'direct / no referrer'),
      'landed on:    ' + sess.landing,
      'campaign:     ' + (Object.keys(sess.utm).length ? Object.keys(sess.utm).map(function (k) { return k + '=' + sess.utm[k]; }).join(' ') : 'none'),
      'visitor:      ' + (firstSeen ? 'returning, first seen ' + new Date(firstSeen).toDateString() : 'first visit'),
      'on site:      ' + (mins < 1 ? 'under a minute' : mins + ' min') + ' · viewing ' + label(era),
      'pages:        ' + sess.pages.join(' → '),
      'asked:        ' + (sess.asked.length ? sess.asked.map(function (q) { return '“' + q + '”'; }).join(' · ') : 'nothing'),
      '',
      'user agent:   ' + ua
    ];
    return lines.join('\n');
  }
  var DISCLOSE = 'Sending includes basic details (browser, device, timezone, pages you viewed and questions you asked here) so I have context when I reply.';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // ---- the search engine (shared) ---------------------------------------
  // Must match scripts/build-answer-index.mjs, or the vectors aren't comparable.
  var MODEL = 'Xenova/all-MiniLM-L6-v2', DTYPE = 'q8', TF = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0';
  var MATCH = 0.5, SURE = 0.7; // below SURE the top match is often wrong (0.57 sent "strength" to the weakness answer), so we ask "did you mean" instead
  function norm(q) { // identical to norm() in the build script
    return q.toLowerCase().replace(/\bsarthak('s)?\b/g, 'you').replace(/\b(he|him|he's)\b/g, 'you').replace(/\bhis\b/g, 'your');
  } // below this cosine score we say "I don't know" instead of guessing
  var indexP, modelP, onAnswered = function () {}; // the Ask box sets onAnswered to retire used suggestions
  function loadVecs(url) {
    return fetch(url, { cache: 'no-cache' }) /* revalidate each visit: a 304 when unchanged, fresh answers right after a deploy */.then(function (r) { return r.json(); }).then(function (d) {
      var bin = atob(d.vecs), v = new Int8Array(bin.length);
      for (var i = 0; i < bin.length; i++) v[i] = bin.charCodeAt(i) << 24 >> 24;
      d.v = v; return d;
    });
  }
  function loadIndex() { return indexP || (indexP = loadVecs('/answers.json')); }
  function loadModel() {
    return modelP || (modelP = import(TF).then(function (m) { return m.pipeline('feature-extraction', MODEL, { dtype: DTYPE }); }));
  }
  // The chat agent's knowledge (docs/knowledge.md), searched with a retrieval model. Must match scripts/build-answer-index.mjs.
  var KB_MODEL = 'Xenova/bge-small-en-v1.5', KB_QUERY = 'Represent this sentence for searching relevant passages: ', kbP, kbModelP;
  function loadKB() { return kbP || (kbP = loadVecs('/knowledge.json')); }
  function loadKBModel() {
    return kbModelP || (kbModelP = import(TF).then(function (m) { return m.pipeline('feature-extraction', KB_MODEL, { dtype: 'q8' }); }));
  }
  // The writer: a model on the visitor's device that answers by calling a search_answers tool over the bank.
  // Chrome's built-in Gemini Nano when it's ready (no download from us, and it doesn't invent facts the way a 1B model does),
  // else Llama 3.2 1B on WebGPU, else (most phones) the bank answer.
  // ponytail: Llama is ~1.24GB once and only knows what the bank says.
  // Tried and dropped: Qwen2.5 1.5B q4f16 prints "!!!!" on WebGPU (fp16 overflow); Qwen3 1.7B (1.4GB) runs out of browser memory.
  var LLM = 'onnx-community/Llama-3.2-1B-Instruct-q4f16', llmP, llmProgress = function () {};
  function loadLLM() { // may start before the question (on focus), so progress goes to whoever is waiting now
    return llmP || (llmP = import(TF).then(function (m) {
      var opt = { progress_callback: function (p) { llmProgress(p); } };
      return Promise.all([m.AutoTokenizer.from_pretrained(LLM, opt), m.AutoModelForCausalLM.from_pretrained(LLM, Object.assign({ dtype: 'q4f16', device: 'webgpu' }, opt))])
        .then(function (r) { return { m: m, tok: r[0], model: r[1] }; });
    }).catch(function (e) { llmP = null; throw e; }));
  }
  // An engine generates once: gen(system, prompt, schema, onText) → { text, tokens }. A schema asks for JSON matching it.
  var LLAMA = { name: 'Llama 3.2 1B Instruct', id: 'llama-3.2-1b-instruct', provider: 'transformers.js webgpu', tag: 'WebGPU · 4-bit · on your device', load: loadLLM,
    gen: async function (sys, prompt, schema, onText) {
      var L = await loadLLM(), text = '';
      var inputs = L.tok.apply_chat_template([{ role: 'system', content: sys }, { role: 'user', content: prompt }], { add_generation_prompt: true, return_dict: true });
      var out = await L.model.generate(Object.assign({}, inputs, { max_new_tokens: schema ? 80 : 300, do_sample: false,
        streamer: new L.m.TextStreamer(L.tok, { skip_prompt: true, skip_special_tokens: true, callback_function: function (x) { text += x; onText(text); } }) }));
      return { text: L.tok.batch_decode(out.slice(null, [inputs.input_ids.dims[1], null]), { skip_special_tokens: true })[0].trim(), tokens: out.dims[1] - inputs.input_ids.dims[1] };
    } };
  var NANO = { name: 'Gemini Nano', id: 'gemini-nano', provider: 'chrome built-in ai', tag: 'built into Chrome · on your device',
    // Started when the visitor clicks into the Ask box. The first session loads the model (~10s); keeping it open keeps
    // the model in memory, so the sessions each step creates start instantly. Asked twice, it loads once.
    load: function () { return NANO.warm || (NANO.warm = LanguageModel.create().catch(function (e) { NANO.warm = null; throw e; })); },
    gen: async function (sys, prompt, schema, onText) {
      // Nano ignores maxLength and once wrote a whole reply into "query" for 4,800 chunks: cut a step off at a length or time limit and use what came
      var stop = new AbortController(), cap = schema ? 60 : 400, timer = setTimeout(function () { stop.abort(); }, schema ? 20000 : 60000);
      var s = await LanguageModel.create({ initialPrompts: [{ role: 'system', content: sys }], signal: stop.signal }), text = '', n = 0;
      try { for await (var x of s.promptStreaming(prompt, Object.assign({ signal: stop.signal }, schema ? { responseConstraint: schema } : {}))) { text += x; n++; onText(text); if (n >= cap) { stop.abort(); break; } } }
      catch (e) { if (!stop.signal.aborted) throw e; }
      finally { clearTimeout(timer); s.destroy(); }
      return { text: text.trim(), tokens: n }; // ponytail: Nano doesn't report tokens; streamed chunks are close
    } };
  var engineP = (async function () {
    try { if (typeof LanguageModel !== 'undefined' && await LanguageModel.availability() === 'available') return NANO; } catch (e) {}
    // Llama only on a computer: a phone with WebGPU downloaded all 1.2GB, then crashed loading it (and it's mobile data).
    // A fine pointer means a mouse or trackpad; deviceMemory (Chrome-only) under 8GB rules out small machines.
    // Belt and braces: browsers that say they're mobile, or iPads posing as Macs (touch points on "MacIntel"), never get it either.
    var ua = navigator.userAgent, mobile = (navigator.userAgentData && navigator.userAgentData.mobile) || /Mobi|Android|iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var computer = !mobile && matchMedia('(pointer: fine)').matches && !(navigator.deviceMemory < 8);
    return navigator.gpu && computer ? LLAMA : null;
  })();
  async function lookup(q) { // the 5 knowledge sections closest to a query
    var got = await Promise.all([loadKB(), loadKBModel()]), d = got[0];
    var best = scan(d, (await got[1](KB_QUERY + q, { pooling: 'cls', normalize: true })).data);
    return Object.keys(best).sort(function (a, b) { return best[b] - best[a]; }).slice(0, 5).map(function (i) {
      return { label: 'profile · ' + d.kb[i].t, text: plain(fill(d.kb[i].a)), url: null, score: best[i] }; });
  }

  // ---- the chat agent's tools --------------------------------------------
  // Each returns { items: what the panel lists, notes: sources the reply may cite, said: what the model is told, action, draft }.
  var PAGES = { resume: ['Résumé', 'resume.html'], askmyastro: ['AskMyAstro', 'askmyastro-demo.html'], filedownloader: ['FileDownloader', 'filedownloader.html'], switchboard: ['Switchboard', 'switchboard.html'] };
  var beforePageAction = function () {}; // the Ask box sets this to leave full screen, so the visitor sees what go_to did
  var TARGETS = STOPS.map(function (s) { return s.v; }).concat(['terminal', 'contact'], Object.keys(PAGES));
  var TOOL_DOCS = [
    'search_about(query): search Sarthak\'s profile (every role with dates, skills, products, availability). Use it for anything about him: work, skills, availability, whether he is open to work, salary, how to reach him, what he built at each company, and his own products ' + SERVICES.map(function (x) { return x.name; }).join(', ') + '. Not for places or general topics. Keep the query to a few words.',
    'web_search(query): look up a general topic on the web (encyclopedia summaries), e.g. what a technology or company is. Not for facts about Sarthak.',
    'live_stats(): today\'s numbers for ' + SERVICES.filter(function (x) { return x.n; }).map(function (x) { return x.name; }).join(', ') + '.',
    'go_to(target): act on this page for the visitor, only when they ask to see or go somewhere. target is one of: ' + STOPS.map(function (s) { var cos = []; s.projects.forEach(function (p) { if (cos.indexOf(p[1]) < 0) cos.push(p[1]); });
      return s.v + ' (' + s.title + (cos.length ? ', ' + cos.join(' and ') : '') + ')'; }).join(', ') + ', terminal, contact, resume, askmyastro, filedownloader, switchboard.',
    'send_message(name, email, message): show the visitor a message form to Sarthak, prefilled with whatever they have said (leave unknown fields empty). Call it as soon as the visitor wants to message or contact Sarthak.',
    'about_assistant(): everything about you, the assistant: what you are, which model you run, what you can do, and how chats are logged. Use it whenever the visitor asks about you.',
    'reply: answer the visitor now.'];
  var DECIDE = { type: 'object', required: ['tool'], properties: { tool: { type: 'string', enum: ['search_about', 'web_search', 'live_stats', 'go_to', 'send_message', 'about_assistant', 'reply'] },
    query: { type: 'string', maxLength: 80 }, target: { type: 'string', enum: TARGETS }, name: { type: 'string' }, email: { type: 'string' }, message: { type: 'string' } } };
  var TOOLS = {
    // What it knows about itself, fetched only when asked (it once web-searched "which model are you" and claimed to be another model)
    about_assistant: async function () {
      var E = await engineP, nano = E === NANO;
      var note = { label: 'about this assistant', text: 'This chat assistant runs ' + E.name + ', ' + (nano ? 'Google\'s small AI model built into Chrome' : 'Meta\'s small open AI model') + ', entirely in the visitor\'s browser. ' +
        'Sarthak built the assistant around that model for this site; he did not make the model itself. It is here to help people get to know Sarthak. ' +
        'How it works: Sarthak wrote a profile of facts about himself; the assistant searches it by meaning, using a small search model that also runs in the browser, decides step by step which tool to use, and only states what it found. ' +
        'It can search Sarthak\'s profile, search the web and read live product stats, and it can scroll this page, open the terminal, link to pages, and show a message form to Sarthak. ' +
        'Its limits: it is a small model and can get things wrong, and it answers only from Sarthak\'s profile, web searches and live stats, not from general knowledge. ' +
        'To send Sarthak a message, the visitor fills in their name, their email (so Sarthak can reply to them) and the message in the form, and presses Send themselves; nothing is sent without that. ' +
        'It knows nothing about the visitor beyond what they type in this chat. Chats are logged anonymously (no account, name or identity attached) so Sarthak can improve the answers; what a visitor types into the message form is never logged.' };
      return { items: [{ label: 'about this assistant' }], notes: [note] };
    },
    search_about: async function (a) {
      var res = await lookup(a.query || '');
      // BGE scores unrelated text around 0.45-0.6: keep clear matches, and only those close to the best one
      var useful = res.filter(function (x) { return x.score >= 0.65 && x.score >= res[0].score - 0.15; }).slice(0, 4);
      return { items: res.map(function (x) { return { score: x.score, label: x.label }; }), notes: useful, said: useful.length ? '' : 'nothing relevant found' };
    },
    web_search: async function (a) {
      var q = a.query || '', notes = [], failed = 0, W = 'https://en.wikipedia.org/';
      var get = function (url) { return fetch(url).then(function (r) { return r.json(); }); };
      try { // DuckDuckGo's free API: instant answers only, and only for exact topic names
        var d = await get('https://api.duckduckgo.com/?format=json&no_html=1&skip_disambig=1&t=sarthakchhabra&q=' + encodeURIComponent(q));
        if (d.AbstractText) notes.push({ label: 'web · ' + (d.AbstractSource || 'DuckDuckGo') + ' · ' + d.Heading, text: d.AbstractText, url: d.AbstractURL });
        if (d.Answer) notes.push({ label: 'web · DuckDuckGo answer', text: String(d.Answer), url: 'https://duckduckgo.com/?q=' + encodeURIComponent(q) });
        (d.RelatedTopics || []).filter(function (t) { return t.Text; }).slice(0, notes.length ? 1 : 3).forEach(function (t) { notes.push({ label: 'web · ' + t.Text.split(' - ')[0], text: t.Text, url: t.FirstURL }); });
      } catch (e) { failed++; }
      if (!notes.length) try { // fall back to Wikipedia's full-text search (also free, keyless)
        var terms = q.toLowerCase().split(/[^a-z0-9+#.]+/).filter(function (w) { return w.length > 2 && !/^(what|definition|meaning|explain|about|does|the|and|for|how|who|why|info|information|details)$/.test(w); });
        // keep pages that mention most of the terms: all-of-them dropped "LPU" for "... location"; none-of-them let "LangGraph" match a maths article
        var hits = (await get(W + 'w/api.php?action=query&list=search&format=json&origin=*&srlimit=3&srsearch=' + encodeURIComponent(terms.join(' ') || q))).query.search
          .filter(function (h) { var t = (h.title + ' ' + h.snippet).toLowerCase(); return terms.filter(function (w) { return t.indexOf(w) >= 0; }).length >= Math.max(1, Math.ceil(terms.length * 0.5)); }).slice(0, 2); // half: "LPU location" lost LPU's page over "location"
        for (var h of hits) { var p = await get(W + 'api/rest_v1/page/summary/' + encodeURIComponent(h.title));
          if (p.extract) notes.push({ label: 'web · Wikipedia · ' + p.title, text: p.extract.slice(0, 600), url: p.content_urls && p.content_urls.desktop.page }); }
      } catch (e) { failed++; }
      return { items: notes.length ? notes.map(function (x) { return { label: x.label }; }) : [{ label: failed ? 'search failed (network)' : 'nothing found' }], notes: notes,
        said: notes.length ? '' : failed ? 'the web search failed this time (network error); say so and suggest trying again' : 'the web search found nothing for that' };
    },
    live_stats: async function () {
      await statsReady;
      if (!stats) return { items: [], notes: [], said: 'live stats are unavailable right now' };
      var notes = SERVICES.filter(function (s) { return s.n && stats[s.id]; }).map(function (s) { var m = s.metric(stats); return { label: 'live stats · ' + s.name, text: s.name + ' (' + s.d + '): ' + m[0] + ' ' + m[1] + (healthy() ? ', refreshed daily' : ', but the daily refresh is behind'), url: s.url }; });
      return { items: notes.map(function (x) { return { label: x.text }; }), notes: notes };
    },
    go_to: async function (a) {
      var t = a.target, i = eraFromArg(t);
      if (PAGES[t]) return { items: [{ label: 'link ready: ' + PAGES[t][0] }], said: 'a link to ' + PAGES[t][0] + ' is shown under your reply', action: { label: 'Open ' + PAGES[t][0] + ' ↗', href: PAGES[t][1] } };
      if (!PAGES[t]) beforePageAction();
      if (t === 'terminal') { openTerm(); return { items: [{ label: 'opened the terminal' }], said: 'opened the terminal' }; }
      if (t === 'contact') { $('contact').scrollIntoView({ behavior: 'smooth' }); return { items: [{ label: 'scrolled to the contact form' }], said: 'scrolled the page to the contact form' }; }
      if (i >= 0) { goEra(i); return { items: [{ label: 'scrolled to ' + label(i) }], notes: [{ label: 'this page · ' + label(i), text: 'Scrolled this page to ' + label(i) + ', the part of his history covering: ' + STOPS[i].projects.map(function (p) { return p[0] + ' at ' + p[1]; }).join(', ') }] }; }
      return { items: [{ label: 'unknown target' }], said: 'unknown target' };
    },
    send_message: async function (a) {
      // Always hand over the form, filled with whatever is known: collecting name and email over several messages was too much for a small model
      var v = function (k) { return (a[k] || '').trim(); }, email = EMAIL_RE.test(v('email')) ? v('email') : '';
      return { items: [{ label: 'draft shown' + (v('name') && email ? '' : ' (the visitor adds their name and email)') }], said: 'drafted',
        draft: { fullname: v('name'), email: email, message: v('message') } };
    }
  };
  function argsOf(c) { return c.tool === 'send_message' ? { name: c.name, email: c.email, message: c.message } : c.tool === 'go_to' ? { target: c.target } : /^(live_stats|about_assistant)$/.test(c.tool) ? {} : { query: c.query }; }
  function decision(text) { // Llama's JSON comes in assorted wrappers, so take the first {...} that parses
    for (var i = text.indexOf('{'); i >= 0; i = text.indexOf('{', i + 1))
      for (var j = text.lastIndexOf('}'); j > i; j = text.lastIndexOf('}', j - 1)) { try { var c = JSON.parse(text.slice(i, j + 1)); if (c && c.tool) return c; } catch (e) {} }
    // cut off mid-JSON (length cap): read the fields one by one; a runaway "query" is a reply in disguise, not a search
    var f = function (k) { var m = new RegExp('"' + k + '"\\s*:\\s*"([^"]*)"').exec(text); return m && m[1]; }, tool = f('tool');
    return tool && TOOLS[tool] && (f('query') || f('target')) && (f('query') || '').length <= 80 ? { tool: tool, query: f('query'), target: f('target') } : { tool: 'reply' };
  }

  // One visitor message → tool steps → a reply that may only use what the tools returned.
  // ev(type, data) drives the live panel: download, ready, think, token, thought, tool, result, done.
  // Models trained on scraped pages write Cloudflare's "[email protected]" placeholder for addresses; the only address we ever mention is EMAIL.
  function unredact(t) { return t.replace(/\[\s*email[\s\u00a0]*protected\s*\]/gi, EMAIL); }
  // ---- agent logs → PostHog LLM analytics ---------------------------------------------------------
  // One trace per visitor message: every model call ($ai_generation, with its full prompt and output) and every tool call ($ai_span),
  // grouped by conversation ($ai_session_id). Anonymous: a random id per browser, no person profiles. Local previews aren't logged.
  // Message-form fields (name, email, message) are never logged; only which ones the model filled in.
  var PH = 'https://us.i.posthog.com', PH_KEY = 'phc_p9KkWWiqmPikawWRbJnLLdyYcGu5FAEXoHW65JLfkbUv';
  var LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  function uid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }
  var vid = (function () { try { var v = localStorage.getItem('sv.vid'); if (!v) localStorage.setItem('sv.vid', v = uid()); return v; } catch (e) { return uid(); } })();
  function phLog(chat, events) {
    if (LOCAL) return; // like the site's other analytics: local previews don't count
    var now = new Date().toISOString();
    var body = JSON.stringify({ api_key: PH_KEY, batch: events.map(function (e) {
      return { event: e.event, timestamp: now, distinct_id: vid, properties: Object.assign({ $process_person_profile: false, $ai_session_id: chat.id, env: 'live', page: location.pathname }, e.properties) };
    }) });
    try { fetch(PH + '/batch/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: body.length < 60000 }).catch(function () {}); } catch (e) {} // keepalive caps the body at 64KB
  }
  function logArgs(tool, a) { // the message form's contents stay out of the logs
    return tool === 'send_message' ? { name_given: !!(a.name || '').trim(), email_given: !!(a.email || '').trim(), message_length: (a.message || '').trim().length } : a;
  }
  // Wraps a turn: whatever happens (answer, timeout, crash), its trace is sent.
  async function agentTurn(chat, E, ev) {
    var trace = uid(), log = [], t0 = performance.now(), res, err;
    try { return (res = await runTurn(chat, E, ev, { trace: trace, push: function (e) { e.properties.$ai_trace_id = trace; e.properties.$ai_parent_id = e.properties.$ai_parent_id || trace; log.push(e); } })); }
    catch (e) { err = e; throw e; }
    finally {
      log.push({ event: '$ai_trace', properties: { $ai_trace_id: trace, $ai_span_name: 'chat turn', $ai_input_state: chat[chat.length - 1].text, $ai_output_state: res ? res.text : null,
        $ai_latency: (performance.now() - t0) / 1000, $ai_is_error: !!err, $ai_error: err ? String(err.message || err) : null, model: E.id, turn: chat.filter(function (m) { return m.me; }).length,
        unverified: !!(res && (res.empty || /couldn['’]t (verify|find)|could not (verify|find)/i.test(res.text))), history_dropped: res ? res.historyDropped : 0, message_cut: !!chat[chat.length - 1].cut,
        tools_used: res ? res.toolsUsed : [], sources: res ? res.notes.map(function (n) { return n.label; }) : [], draft_shown: !!(res && res.draft) } });
      phLog(chat, log);
    }
  }
  // Chat memory: as many recent messages as fit the budget, newest first, with long replies shortened. The visitor's first
  // message always stays (it's often who they are and why they came). When the middle drops out, the model is told, so it
  // asks the visitor to remind it instead of guessing. ponytail: a character budget, not the model's real token count.
  var HISTORY_CHARS = 6000, MSG_CHARS = 1500, REPLY_CHARS = 400;
  function clip(t, n) { return t.length > n ? t.slice(0, n) + '…' : t; }
  function history(chat) {
    var line = function (m) { return (m.me ? 'Visitor: ' : 'Assistant: ') + clip(m.text, m.me ? MSG_CHARS : REPLY_CHARS); };
    var kept = [], used = line(chat[0]).length, i;
    for (i = chat.length - 1; i > 0; i--) { var l = line(chat[i]); if (used + l.length > HISTORY_CHARS) break; kept.unshift(l); used += l.length; }
    var dropped = i; // messages 1..i didn't fit
    return { dropped: dropped, text: [line(chat[0])].concat(dropped > 0 ? ['(Earlier messages in this chat are no longer visible to you. If the visitor refers to them, ask them to remind you; never guess.)'] : [], kept).join('\n') };
  }
  var BOT = 'You are the assistant on Sarthak Chhabra\'s portfolio website, chatting with a visitor about Sarthak. You speak in your own voice and refer to him as Sarthak. ' +
    'Your tone is friendly and warm. You are here to help people get to know Sarthak; never push hiring him, contacting him or any other goal yourself (if a visitor asks about those, search and share what you find). ';
  async function runTurn(chat, E, ev, L) {
    llmProgress = function (p) { if (p.status === 'progress') ev('download', p); };
    await E.load();
    ev('ready', E);
    var t0 = performance.now(), total = 0, notes = [], said = [], actions = [], draft = null, done = {};
    var mem = history(chat), talk = mem.text;
    function noteText() {
      return (notes.length ? notes.map(function (n, i) { return '[' + (i + 1) + '] ' + n.label + ': ' + n.text; }).join('\n') : '(none yet)') + (said.length ? '\n\nWhat your tools did (for you only, never quote this): ' + said.join('; ') : '');
    }
    async function gen(sys, prompt, schema, phase) {
      var t = performance.now(), n = 0;
      ev('think', { phase: phase });
      var r, err;
      try { r = await E.gen(sys, prompt, schema, function (text) { ev('token', { text: text, n: ++n, ms: performance.now() - t, phase: phase }); }); }
      catch (e) { err = e; throw e; }
      finally {
        L.push({ event: '$ai_generation', properties: { $ai_span_name: phase, $ai_model: E.id, $ai_provider: E.provider, $ai_input: [{ role: 'system', content: sys }, { role: 'user', content: prompt }],
          $ai_output_choices: r ? [{ role: 'assistant', content: r.text }] : [], $ai_output_tokens: r ? r.tokens : n, $ai_latency: (performance.now() - t) / 1000, $ai_is_error: !!err, $ai_error: err ? String(err.message || err) : null } });
      }
      total += r.tokens; r.ms = performance.now() - t; return r;
    }
    for (var step = 0; step < 4; step++) {
      var r = await gen(BOT + 'You never state a fact you have not found with a tool in this conversation. Pick the next step. Tools:\n- ' + TOOL_DOCS.join('\n- ') +
        '\nSearch before answering anything factual, one topic per search. Use web_search only for places, technologies or general topics that aren\'t about Sarthak or his products (' + SERVICES.map(function (x) { return x.name; }).join(', ') + '), and search again with other words if the notes don\'t cover it. Choose reply once the notes cover the question, or for greetings and small talk. Questions about you, the assistant, are answered with about_assistant: never search or web-search for them. Questions about Sarthak himself, including hiring, availability or salary, always go to search_about first. ' +
        'Reply with JSON only, e.g. {"tool": "search_about", "query": "work history"}. The query is a few words, never an answer.',
        talk + '\n\nThe message to handle now: "' + chat[chat.length - 1].text + '" (earlier messages are context only; don\'t research them again).\n\nNotes so far:\n' + noteText() + '\n\nNext step?', DECIDE, 'decide');
      var c = decision(r.text), key = c.tool + JSON.stringify(argsOf(c));
      ev('thought', { tokens: r.tokens, ms: r.ms, tool: c.tool });
      if (c.tool === 'reply' || !TOOLS[c.tool] || done[key]) break; // the same call twice means it's stuck: answer with what we have
      done[key] = 1;
      var args = argsOf(c), t = performance.now();
      ev('tool', { name: c.tool, args: args });
      var out;
      try { out = await TOOLS[c.tool](args); } catch (e) { out = { items: [{ label: 'failed: ' + e.message }], said: 'the tool failed' }; }
      (out.notes || []).forEach(function (n) { if (!notes.some(function (m) { return m.text === n.text; })) notes.push(n); });
      if (out.said) said.push(c.tool + ': ' + out.said);
      if (out.action) actions.push(out.action);
      if (out.draft) draft = out.draft;
      ev('result', { name: c.tool, args: args, items: out.items, ms: performance.now() - t });
      L.push({ event: '$ai_span', properties: { $ai_span_id: uid(), $ai_span_name: c.tool, $ai_input_state: logArgs(c.tool, args), $ai_latency: (performance.now() - t) / 1000,
        $ai_output_state: { results: out.items, said: out.said || null, sources: (out.notes || []).map(function (n) { return n.label; }) }, $ai_is_error: /^failed/.test((out.items[0] || {}).label || '') } });
    }
    // No sources after searching: the only honest reply is "couldn't find it" (a model left to itself fills the gap from memory).
    // searched and found nothing (only the self note, and no other tool had something to report): the reply may only say so
    var empty = !notes.length && Object.keys(done).some(function (k) { return /^(search_about|web_search|live_stats)/.test(k); }) && !said.some(function (x) { return /^(send_message|go_to)/.test(x); }) && !draft && !actions.length;
    // A ready draft gets a fixed reply: the model's own wording around it rambled and leaked the tool log
    // No notes at all (a greeting, small talk): nothing to state, and a small model left with nothing invents a bio. Greet and offer help only.
    var bare = !notes.length && !Object.keys(done).length;
    var fin = draft ? { text: draft.fullname && draft.email ? 'Here\'s your message to Sarthak. Check it below, edit anything you like, and press Send when it looks right.'
      : 'Here\'s a message to Sarthak. Add your name and email so he can reply, check the message, and press Send.', tokens: 0, ms: 0 } : await gen(bare ? BOT + 'You have not looked anything up for this message, so you know no facts right now. Reply in one or two friendly sentences: respond to what the visitor said and offer to help them get to know Sarthak (his work, projects, skills). State no facts about Sarthak at all.' : empty ? BOT + 'Your searches found nothing for this. In one or two sentences, say you couldn\'t find or verify it' + (said.length ? ' (' + said.join('; ') + ')' : '') + ' and suggest emailing ' + EMAIL + '. Don\'t describe or guess anything about the topic.' :
      BOT + 'Reply in two to four short sentences. Use ONLY facts from your notes, and cite each one with its number, like [1]. ' +
      'If a note says Sarthak would prefer people reach out to him directly about something, that is the answer: share it warmly, not as a failure. If notes are about different things that share a name, say which is which and never merge them. If the notes don\'t cover something, say you couldn\'t verify it; suggest emailing ' + EMAIL + ' only when it is about Sarthak, and otherwise don\'t mention email. Never guess or add facts of your own. You can search the web, so never say you can\'t; if a search failed or found nothing, say that.' +
      (draft ? ' A message to Sarthak is drafted under your reply: tell the visitor to check it and press Send. Don\'t say you can\'t contact him.' : '') + '\n\nYour notes:\n' + noteText(),
      talk + '\nAssistant:', null, 'reply');
    if (!draft) ev('thought', { tokens: fin.tokens, ms: fin.ms, tool: 'reply' });
    var res = { historyDropped: mem.dropped, empty: !!empty, toolsUsed: Object.keys(done), text: unredact(fin.text.replace(/^Assistant:\s*/, '').replace(/\n*(Tool log|What your tools did)[^\n]*/gi, '')), notes: notes, actions: actions, draft: draft, tokens: total, ms: performance.now() - t0, tools: Object.keys(done).length };
    if (window.sheetBeacon) sheetBeacon({ kind: 'ask', visit: sess.start, question: chat[chat.length - 1].text.slice(0, 300), corrected: '', result: 'chat · ' + E.name, matched: res.text.slice(0, 300), score: 0, alts: Object.keys(done).join(' | ').slice(0, 300) });
    ev('done', res);
    return res;
  }
  function scan(d, vec) { // best cosine score per answer
    var n = d.idx.length, dim = d.dim, best = {};
    for (var i = 0; i < n; i++) {
      var s = 0, o = i * dim;
      for (var j = 0; j < dim; j++) s += vec[j] * d.v[o + j];
      s /= 127;
      if (!(d.idx[i] in best) || s > best[d.idx[i]]) best[d.idx[i]] = s;
    }
    return best;
  }
  // ---- spelling fix: typos are corrected against the answer bank's own vocabulary ------------------
  function osa(a, b, max) { // optimal-string-alignment distance (edits incl. swapped letters), gives up past max
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) {
      var rowMin = Infinity;
      for (j = 1; j <= b.length; j++) {
        var c = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        rowMin = Math.min(rowMin, d[i][j]);
      }
      if (rowMin > max) return max + 1;
    }
    return d[a.length][b.length];
  }
  function spellFix(q, d) { // → corrected text, or q unchanged
    if (!d.vocabList) { d.vocabList = (d.vocab || '').split(' '); d.vocabSet = new Set(d.vocabList.concat((d.common || '').split(' '))); } // common English words are real words: never "fix" them
    return q.replace(/[A-Za-z][A-Za-z'-]{4,}/g, function (w) { // 5+ letters only: short words like "tall"/"tell" are too ambiguous
      var lw = w.toLowerCase();
      if (d.vocabSet.has(lw)) return w;
      var max = lw.length <= 6 ? 1 : 2, best = null, bestD = max + 1;
      for (var i = 0; i < d.vocabList.length; i++) { // list is most-frequent first, so ties go to the common word
        var c = d.vocabList[i];
        if (c[0] !== lw[0] && lw.length < 6) continue; // short typos rarely get the first letter wrong; saves work
        var dist = osa(lw, c, max);
        if (dist < bestD) { bestD = dist; best = c; if (dist === 1) break; }
      }
      return best || w;
    });
  }
  function eraOf(tag) { return tag === 'all' ? -1 : eraFromArg(tag); } // 'v5' → 4

  // step(name, ms|null) is called as each stage starts (null) and ends (ms)
  async function search(q, step, opts) {
    step = step || function () {};
    logAsked(q);
    var now = function () { return performance.now(); }, t;
    step('load', null); t = now();
    var got = await Promise.all([loadIndex(), loadModel(), statsReady]), d = got[0], embed = got[1];
    step('load', now() - t);
    var fixed = opts && opts.exact ? q : spellFix(q, d);
    step('embed', null); t = now();
    var qv = (await embed(norm(q), { pooling: 'mean', normalize: true })).data;
    var fv = fixed !== q ? (await embed(norm(fixed), { pooling: 'mean', normalize: true })).data : null;
    step('embed', now() - t);
    step('search', null); t = now();
    var best = scan(d, qv), corrected = null;
    if (fv) { // keep the correction only if it actually matches better
      var alt = scan(d, fv), top0 = Math.max.apply(null, Object.values(best)), top1 = Math.max.apply(null, Object.values(alt));
      if (top1 >= MATCH && top1 - top0 >= 0.05) { best = alt; corrected = fixed; } // only a clearly better, real match wins
    }
    step('search', now() - t);
    step('rank', null); t = now();
    var top = Object.keys(best).map(function (a) { return { i: +a, score: best[a] }; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 3);
    step('rank', now() - t);
    step('answer', null); t = now();
    var r = compose(d, top);
    r.corrected = corrected;
    step('answer', now() - t);
    if (r.hit) onAnswered(r.q);
    if (window.sheetBeacon) sheetBeacon({ kind: 'ask', visit: sess.start, question: q.slice(0, 300), corrected: corrected || '', result: r.hit ? 'answered' : r.near ? 'did you mean' : 'no answer', matched: r.q, score: +r.score.toFixed(2), alts: r.alts.join(' | ') });
    return r;
  }
  function compose(d, top) {
    var hit = top[0].score >= SURE, a = d.answers[top[0].i];
    var res = { hit: hit, near: !hit && top[0].score >= MATCH, score: top[0].score, q: a.q, alts: top.map(function (x) { return d.answers[x.i].q; }), note: '', text: '' };
    if (!hit) return res;
    res.text = /tech stack/i.test(a.q)
      ? 'At ' + label(era) + ': ' + STOPS[era].stack.join(', ') + '.' + (era < HEAD ? ' Today: ' + STOPS[HEAD].stack.join(', ') + '.' : '')
      : fill(a.a);
    var from = eraOf(a.era);
    if (from > era) res.note = 'You’re viewing ' + label(era) + '. This comes later, at ' + label(from) + '. Scroll forward, or run `git checkout ' + STOPS[from].v + '` in the terminal.';
    return res;
  }

  // ---- Ask box (home page only) --------------------------------------
  if (HOME) (function () {
  var STEPS = ['load', 'embed', 'search', 'rank', 'answer'];
  initSuggestions();
  // Download and warm the model in the background, and only show the Ask section once it's instant.
  // Save-Data visitors skip the ~23MB download: they see the section now and load on first focus.
  function reveal(label) {
    var sec = $('ask');
    sec.classList.add('ready'); sec.removeAttribute('aria-hidden'); sec.inert = false;
    if (label) sec.querySelector('.sec-h .label').textContent = label;
  }
  var saveData = navigator.connection && navigator.connection.saveData;
  if (saveData) {
    reveal();
    $('askIn').addEventListener('focus', function () { engineP.then(function (E) { if (E) { loadKB(); loadKBModel(); } else { loadIndex(); loadModel(); } }); }, { once: true });
  } else {
    addEventListener('load', function () {
      var idle = window.requestIdleCallback || function (f) { setTimeout(f, 1200); };
      idle(function () {
        var t = performance.now();
        engineP.then(function (E) { // warm whichever search this visitor will use: the chat agent's, or the direct answers'
          return E ? Promise.all([loadKB(), loadKBModel()]).then(function (r) { return r[1]('warm up', { pooling: 'cls', normalize: true }); })
            : Promise.all([loadIndex(), loadModel()]).then(function (r) { return r[1]('warm up', { pooling: 'mean', normalize: true }); }); // first run compiles; do it now, not on the visitor's question
        })
          .then(function () { reveal('runs in your browser · ready in ' + ((performance.now() - t) / 1000).toFixed(1) + 's'); })
          .catch(function () {}); // model couldn't load: keep the section hidden rather than show a broken box
      }, { timeout: 3000 });
    });
  }
  // ` and ~ are the terminal's keys; questions never need them. Strip them (typed, pasted or from a phone keyboard) and point to the terminal.
  var hintTimer;
  $('askIn').addEventListener('input', function () {
    var el = this, v = el.value, clean = v.replace(/[`~]/g, '');
    if (clean === v) return;
    var pos = el.selectionStart - (v.slice(0, el.selectionStart).length - v.slice(0, el.selectionStart).replace(/[`~]/g, '').length);
    el.value = clean; el.setSelectionRange(pos, pos);
    $('askHint').innerHTML = 'Looking for the terminal? Press ~ outside this box, or <button type="button">open it</button>.';
    $('askHint').classList.add('show');
    clearTimeout(hintTimer); hintTimer = setTimeout(function () { $('askHint').classList.remove('show'); }, 4000);
  });
  $('askHint').onclick = function (e) { if (e.target.tagName === 'BUTTON') { $('askHint').classList.remove('show'); openTerm(); } };
  $('askForm').onsubmit = function (e) { e.preventDefault(); runAsk(); };
  var chatEl = $('chat'), card = chatEl.parentNode, chat = [], asking = 0, aiBroken = false; // chat: [{ me, text }], the conversation the agent sees
  function full(on) { // the chat takes the whole screen while a conversation is going
    card.classList.toggle('full', on); document.documentElement.classList.toggle('chat-open', on);
    if (on) { pinned = true; stick(); $('askIn').focus(); } else card.scrollIntoView({ block: 'nearest' });
  }
  beforePageAction = function () { full(false); };
  function endChat() { chat = []; ++asking; chatEl.innerHTML = ''; $('chatBar').hidden = true; full(false); window.siteAvatar && siteAvatar.answered(); } // closing is "new chat": the next question starts fresh
  $('chatClose').onclick = endChat;
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && card.classList.contains('full') && !document.querySelector('.term.open')) endChat(); });
  chatEl.onclick = function (e) {
    if (e.target.dataset.q) { $('askIn').value = e.target.dataset.q; runAsk(); }
    else if (e.target.dataset.exact) runAsk(e.target.dataset.exact);
  };
  $('askIn').addEventListener('focus', function () { engineP.then(function (E) { if (E) E.load().catch(function () { aiBroken = true; }); }); }, { once: true }); // start loading as soon as they mean to ask
  function sec(ms) { return ms < 1000 ? Math.round(ms) + 'ms' : (ms / 1000).toFixed(1) + 's'; }
  // Follow the newest text unless the visitor scrolled up to read; scrolling back to the bottom re-pins.
  var pinned = true;
  chatEl.addEventListener('scroll', function () { pinned = chatEl.scrollHeight - chatEl.scrollTop - chatEl.clientHeight < 60; }, { passive: true });
  function stick() { if (pinned) chatEl.scrollTop = chatEl.scrollHeight; }
  function bubble(cls, html) { var el = document.createElement('div'); el.className = 'msg ' + cls; el.innerHTML = html; chatEl.appendChild(el); stick(); return el; }

  // The reply: [n] citations become superscripts, cited sources are listed, then any links or a message draft.
  function renderReply(ans, r) {
    var cited = [];
    var html = md(r.text).replace(/\s*\[(\d+(?:\s*,\s*\d+)*)\]/g, function (m, list) { // [1] or [1, 6]; numbers with no source are dropped
      return list.split(',').map(function (n) { n = +n; if (!r.notes[n - 1]) return ''; if (cited.indexOf(n) < 0) cited.push(n); return '<sup class="cite">' + n + '</sup>'; }).join('');
    });
    html += cited.length ? '<ol class="srcs">' + cited.sort(function (a, b) { return a - b; }).map(function (n) { var s = r.notes[n - 1];
      return '<li value="' + n + '">' + (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>' : esc(s.label)) + '</li>'; }).join('') + '</ol>' : '';
    html += r.actions.length ? '<div class="acts">' + r.actions.map(function (a) { return '<a class="btn" href="' + esc(a.href) + '" target="_blank" rel="noopener">' + esc(a.label) + '</a>'; }).join('') + '</div>' : '';
    if (r.draft) html += '<form class="draft"><p class="matched">Message to Sarthak · check it, then send</p><input name="fullname" required aria-label="Your name" placeholder="Your name" value="' + esc(r.draft.fullname) + '">' +
      '<input name="email" type="email" required aria-label="Your email" placeholder="Your email, so he can reply" value="' + esc(r.draft.email) + '"><textarea name="message" required rows="3" aria-label="Message" placeholder="Your message">' + esc(r.draft.message) + '</textarea>' +
      '<div><button class="btn p" type="submit">Send</button> <span class="form-msg"></span></div></form>';
    ans.innerHTML = (r.cut ? '<p class="note">I only read the beginning of that, it was long. Ask me about any part of it.</p>' : '') + html +
      '<p class="matched">Written by an AI in your browser' + (cited.length ? ' from the sources above' : '') + ' · it can still be wrong</p>';
    var f = ans.querySelector('form.draft');
    if (f) f.onsubmit = function (e) {
      e.preventDefault(); var b = f.querySelector('button'), m = f.querySelector('.form-msg'); b.disabled = true;
      sendMail({ fullname: f.fullname.value.trim(), email: f.email.value.trim(), message: f.message.value.trim() }, 'ask chat')
        .then(function () { m.className = 'form-msg ok'; m.textContent = 'Sent. He’ll get back to you soon.'; [].forEach.call(f.elements, function (el) { el.disabled = true; }); })
        .catch(function () { b.disabled = false; m.className = 'form-msg err'; m.textContent = 'That didn’t go through. Try again, or email ' + EMAIL + '.'; });
    };
  }
  // The activity box: one line saying what the model is doing now; click it for every step, the model's raw decisions and each tool's results.
  var DID = { search_about: 'Searched about Sarthak', web_search: 'Searched the web', live_stats: 'Read live stats', go_to: 'Went to', send_message: 'Drafted a message' };
  var DOING = { search_about: 'Searching about Sarthak', web_search: 'Web search', live_stats: 'Reading live stats', go_to: 'Going to', send_message: 'Drafting a message' };
  function doing(d) { var a = d.args; return DOING[d.name] + (a.query ? ': “' + a.query + '”' : a.target ? ' ' + (eraFromArg(a.target) >= 0 ? label(eraFromArg(a.target)) : a.target) : ''); }
  // Each step in the details says what it is and how it works, so the details read as the architecture.
  var HOW = {
    decide: 'The model reads your message and the notes so far, then picks the next tool (its raw choice is below, as JSON).',
    write: 'The model writes the reply using only the notes the tools returned, citing each one.',
    search_about: 'Searches Sarthak\'s profile by meaning: a small embedding model (BGE) turns the query into numbers in your browser and compares it with every section; the closest come back with their similarity scores.',
    web_search: 'Asks DuckDuckGo\'s free answer API for a summary, falling back to Wikipedia\'s search when it has none.',
    live_stats: 'Reads today\'s product numbers, refreshed daily from Google Analytics and GitHub.',
    go_to: 'Acts on this page for you: scrolls to a part of it, opens the terminal, or adds a link under the reply.',
    send_message: 'Opens a message form to Sarthak, filled in from the chat. Nothing is sent until you press Send.',
    about_assistant: 'Returns the assistant\'s own description: what it is, the model it runs and what it can do.'
  };
  var detailsOpen = false; // the chat header's toggle: every run's details open or closed at once, new ones included
  $('chatDetails').onclick = function () {
    detailsOpen = !detailsOpen; this.setAttribute('aria-pressed', detailsOpen);
    this.querySelector('span').textContent = detailsOpen ? 'Hide details' : 'Show details';
    [].forEach.call(chatEl.querySelectorAll('details.act'), function (d) { d.open = detailsOpen; });
  };
  function runAgent(id, E, trace, ans) {
    var seen = {}, live = null, did = [];
    trace.className = ''; // the dark .trace look is for the plain answer search; this box has its own
    trace.innerHTML = '<details class="act"><summary><span class="act-ico"></span><span class="act-now">Loading ' + esc(E.name) + '…</span><span class="act-meta"></span><span class="act-more">details</span>' +
      '<span class="act-dl"><span class="ag-bar"><i></i></span><span></span></span></summary>' +
      '<div class="act-body"><p class="act-model"><b>' + esc(E.name) + '</b> · ' + esc(E.tag) + '</p>' +
      '<p class="act-arch">How this works: the model runs in your browser. For each message it loops (decide on a tool, use it, read the results) until it has enough, then writes a reply from only what the tools returned.</p>' +
      '<ol class="act-steps"></ol></div></details>';
    var box = trace.firstChild; box.open = detailsOpen;
    var now = box.querySelector('.act-now'), meta = box.querySelector('.act-meta'), steps = box.querySelector('.act-steps'), dl = box.querySelector('.act-dl');
    function say(t) { now.textContent = t; }
    function row(html) { var li = document.createElement('li'); li.innerHTML = html; steps.appendChild(li); stick(); return li; }
    return agentTurn(chat, E, function (type, d) {
      if (id !== asking) return;
      if (type === 'download') {
        seen[d.file] = d; var got = 0, all = 0;
        Object.keys(seen).forEach(function (f) { got += seen[f].loaded || 0; all += seen[f].total || 0; });
        say('Downloading the AI model, once'); if (all < 5e7) return; // small config files arrive first; wait for the weights so the bar doesn't jump to 100%
        dl.classList.add('show');
        dl.firstChild.firstChild.style.width = (100 * got / all).toFixed(1) + '%';
        dl.lastChild.textContent = Math.round(got / 1e6).toLocaleString() + ' / ' + Math.round(all / 1e6).toLocaleString() + ' MB';
      } else if (type === 'ready') { dl.classList.remove('show'); say('Thinking…');
      } else if (type === 'think') {
        say(d.phase === 'decide' ? 'Thinking…' : 'Writing the answer…');
        live = row('<div class="act-row"><span>' + (d.phase === 'decide' ? 'Deciding the next step' : 'Writing the answer') + '</span><em>…</em></div><p class="act-how">' + HOW[d.phase === 'decide' ? 'decide' : 'write'] + '</p>' + (d.phase === 'decide' ? '<code></code>' : ''));
      } else if (type === 'token') {
        live.querySelector('em').textContent = d.n + ' tokens · ' + (d.n / d.ms * 1000).toFixed(0) + ' tok/s';
        if (d.phase === 'decide') live.querySelector('code').textContent = d.text.replace(/\s+/g, ' ').slice(0, 200);
        else { ans.innerHTML = md(unredact(d.text)).replace(/\s*\[(\d+(?:\s*,\s*\d+)*)\]/g, function (m, l) { return '<sup class="cite">' + l.replace(/\s/g, '') + '</sup>'; }).replace(/<\/p>$/, '<span class="ag-caret"></span></p>'); stick(); }
      } else if (type === 'thought') {
        live.querySelector('span').textContent = d.tool === 'reply' ? (live.querySelector('code') ? 'Decided: answer now' : 'Wrote the answer') : 'Decided: ' + DOING[d.tool];
        live.querySelector('em').textContent = d.tokens + ' tokens · ' + sec(d.ms);
      } else if (type === 'tool') {
        say(doing(d) + '…'); did.push(d);
        live = row('<div class="act-row tool"><span>' + esc(doing(d)) + '</span><em>…</em></div><p class="act-how">Tool call <code class="act-call">' + esc(d.name) + '(' + esc(JSON.stringify(d.args)) + ')</code>. ' + esc(HOW[d.name] || '') + '</p>');
      } else if (type === 'result') {
        live.querySelector('em').textContent = d.items.length + (d.items.length === 1 ? ' result · ' : ' results · ') + sec(d.ms);
        if (d.items.length) live.insertAdjacentHTML('beforeend', '<ol class="act-res">' + d.items.map(function (x) { return '<li>' + (x.score != null ? '<b>' + x.score.toFixed(2) + '</b>' : '') + esc(x.label) + '</li>'; }).join('') + '</ol>');
        stick();
      } else if (type === 'done') {
        box.classList.add('done');
        var by = {}; did.forEach(function (x) { var v = x.args.query ? '“' + x.args.query + '”' : x.args.target ? doing(x).replace(DOING.go_to + ' ', '') : ''; (by[x.name] = by[x.name] || []).push(v); });
        say(did.length ? Object.keys(by).map(function (k) { var v = by[k].filter(Boolean); return DID[k] + (v.length ? ': ' + v.join(', ') : ''); }).join(' · ') : 'Answered without searching');
        meta.textContent = sec(d.ms);
        row('<div class="act-row"><span>Total</span><em>' + d.tools + (d.tools === 1 ? ' tool call · ' : ' tool calls · ') + d.tokens + ' tokens · ' + sec(d.ms) + '</em></div>');
        d.cut = chat[chat.length - 1].cut; renderReply(ans, d);
        stick();
      }
    });
  }
  async function runAsk(exact) { // exact: re-ask this text without the spelling fix
    var q = typeof exact === 'string' ? exact : $('askIn').value.trim(); if (!q) return;
    $('askIn').value = ''; $('chatBar').hidden = false; pinned = true; window.siteAvatar && siteAvatar.thinking(); // the avatar looks down while it works
    if (!card.classList.contains('full')) full(true);
    var id = ++asking, times = {}, searched = q;
    bubble('me', '<p>' + esc(q) + '</p>');
    var bot = bubble('bot', '<div class="trace show"></div><div class="answer"></div>'), trace = bot.firstChild, ans = bot.lastChild;
    if (!chat.id) chat.id = uid(); // one conversation id until the chat is closed
    chat.push({ me: true, text: q, cut: q.length > MSG_CHARS }); // a very long paste: only the beginning reaches the model
    var E = !aiBroken && await engineP;
    if (E) {
      logAsked(q);
      try { var r = await runAgent(id, E, trace, ans); if (id === asking) { chat.push({ me: false, text: r.text }); window.siteAvatar && siteAvatar.answered(); } return; }
      catch (err) { var failed = err; } // this turn failed: answer from the bank instead (a model that can't load at all is caught on focus and not retried)
      if (id !== asking) return;
    }
    function draw(cur) {
      trace.innerHTML = '<div class="st done"><i>searched</i><b>“' + esc(searched) + '”</b></div>' + STEPS.map(function (s) {
        if (s === 'load' && times.load != null && times.load < 50) return ''; // already warm: don't show the one-time download
        var st = times[s] != null ? 'done' : s === cur ? 'run' : '';
        var label = s === 'load' ? 'warm-up' : s;
        var val = times[s] != null ? times[s].toFixed(times[s] < 10 ? 1 : 0) + 'ms' : s === cur ? (s === 'load' ? 'downloading model, once…' : '…') : '';
        return '<div class="st ' + st + '"><i>' + label + '</i><b>' + val + '</b></div>';
      }).join('');
    }
    try {
      var r = await search(q, function (name, ms) { if (id !== asking) return; if (ms != null) times[name] = ms; draw(ms == null ? name : null); }, { exact: typeof exact === 'string' });
      if (id !== asking) return;
      if (r.corrected) { searched = r.corrected; draw(null); }
      trace.innerHTML += '<div class="st done"><i>match</i><b>' + r.score.toFixed(2) + '</b>&nbsp;“' + esc(r.q) + '”</div>';
      var didYou = r.corrected ? '<p class="didyou">Showing results for <b>' + esc(r.corrected) + '</b> · <button type="button" data-exact="' + esc(q) + '">search “' + esc(q) + '” instead</button></p>' : '';
      // No on-device AI here (Safari before 26, Firefox, phones): say so once per chat, so visitors know what they're getting
      var hint = !E && !chat.hinted ? (chat.hinted = true, '<p class="note">The full AI chat runs in Chrome or Edge on a computer. Here you get Sarthak\u2019s pre-written answers.</p>') : '';
      ans.innerHTML = hint + didYou + (r.hit
        ? '<p class="matched">Answering: <b>' + esc(r.q) + '</b></p>' + (r.note ? '<p class="note">' + md(r.note).slice(3, -4) + '</p>' : '') + md(r.text)
        : '<p>' + (r.near ? 'Did you mean:' : 'No answer for that. Closest I can answer:') + '</p><div class="alts">' +
          r.alts.map(function (a) { return '<button type="button" data-q="' + esc(a) + '">' + esc(a) + '</button>'; }).join('') +
          '</div>');
      chat.push({ me: false, text: r.hit ? r.text : '' });
      phLog(chat, [{ event: '$ai_trace', properties: { $ai_trace_id: uid(), $ai_span_name: 'chat turn', $ai_input_state: q, $ai_output_state: r.hit ? r.text : (r.near ? 'did you mean: ' : 'no answer; closest: ') + r.alts.join(' | '),
        model: 'answer-bank', fallback_reason: E ? 'agent failed: ' + String((failed && failed.message) || failed) : 'no on-device model', match: r.q, match_score: r.score, corrected: r.corrected || null } }]);
      stick(); window.siteAvatar && siteAvatar.answered();
    } catch (err) {
      if (id !== asking) return;
      trace.classList.remove('show');
      ans.innerHTML = '<p>The search engine couldn’t load (offline, or the model download was blocked). Ask me directly: <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.</p>';
      window.siteAvatar && siteAvatar.answered();
    }
  }

  // Contact form (sends through sendMail, shared with the terminal).
  (function () {
    var f = $('contact'), btn = $('sendBtn'), msg = $('formMsg');
    f.addEventListener('input', function () { loadMail().catch(function () {}); btn.disabled = !f.checkValidity(); msg.textContent = ''; msg.className = 'form-msg'; });
    f.onsubmit = function (e) {
      e.preventDefault();
      if (!f.checkValidity()) return;
      btn.disabled = true; btn.textContent = 'Sending…';
      sendMail({ fullname: f.fullname.value.trim(), email: f.email.value.trim(), message: f.message.value.trim() }, 'contact form')
        .then(function () { f.reset(); msg.className = 'form-msg ok'; msg.textContent = 'Sent. I’ll get back to you within a day.'; })
        .catch(function () { btn.disabled = false; msg.className = 'form-msg err'; msg.innerHTML = 'That didn’t go through. Try again, or email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.'; })
        .then(function () { btn.textContent = 'Send message'; });
    };
  })();

  // 3 random suggestions stay put (even across reloads) until one is used: clicked, or its answer reached by a typed
  // question. A used one is swapped for a fresh random one. "Used" is remembered with a timestamp and forgotten after
  // SEEN_DAYS, so someone returning later sees them again. Browser storage only; everything works without it.
  function initSuggestions() {
    var KEY = 'sv.suggest', SEEN_DAYS = 3, SHOW = 3, now = Date.now(), st = {};
    try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    var seen = st.seen || {}, shown = st.shown || [];
    Object.keys(seen).forEach(function (t) { if (now - seen[t] > SEEN_DAYS * 864e5) delete seen[t]; });
    var texts = SUGGEST.map(function (x) { return x[0]; });
    function save() { try { localStorage.setItem(KEY, JSON.stringify({ seen: seen, shown: shown })); } catch (e) {} }
    function pickOne() {
      var free = texts.filter(function (t) { return !seen[t] && shown.indexOf(t) < 0; });
      if (!free.length) { seen = {}; free = texts.filter(function (t) { return shown.indexOf(t) < 0; }); } // all used: start over
      return free[Math.floor(Math.random() * free.length)];
    }
    function chip(t, fresh) { return '<button type="button" data-t="' + esc(t) + '"' + (fresh ? ' class="fresh"' : '') + '>' + esc(t) + '</button>'; }
    shown = shown.filter(function (t) { return texts.indexOf(t) >= 0 && !seen[t]; });
    while (shown.length < SHOW) shown.push(pickOne());
    $('sugg').innerHTML = shown.map(function (t) { return chip(t); }).join('');
    save();
    // Retiring a chip, over 5 seconds: it fades out, the chips to its right slide over to close the gap,
    // then the replacement fades in at the end of the row.
    var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function retire(t) {
      seen[t] = Date.now();
      var i = shown.indexOf(t);
      if (i >= 0) {
        shown.splice(i, 1);
        var next = pickOne(); shown.push(next);
        var el = [].find.call($('sugg').children, function (c) { return c.dataset.t === t; });
        if (el && !calm) {
          el.disabled = true; el.style.overflow = 'hidden'; el.style.whiteSpace = 'nowrap';
          var w = el.offsetWidth;
          el.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.85)' }], { duration: 350, easing: 'ease-in', fill: 'forwards' }).finished
            .then(function () {
              return el.animate([{ width: w + 'px', marginRight: '0px', paddingLeft: '11px', paddingRight: '11px' },
                { width: '0px', marginRight: '-6px', paddingLeft: '0px', paddingRight: '0px' }], { duration: 550, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished;
            })
            .then(function () { el.remove(); });
        } else if (el) el.remove();
        setTimeout(function () {
          var there = [].some.call($('sugg').children, function (c) { return c.dataset.t === next; });
          if (shown.indexOf(next) >= 0 && !there) $('sugg').insertAdjacentHTML('beforeend', chip(next, true));
        }, 5000);
      }
      save();
    }
    onAnswered = function (answerQ) {
      SUGGEST.forEach(function (x) { if (x[1] === answerQ && (shown.indexOf(x[0]) >= 0 || !seen[x[0]])) retire(x[0]); });
    };
    $('sugg').onclick = function (e) {
      if (e.target.tagName !== 'BUTTON') return;
      var t = e.target.textContent;
      $('askIn').value = t; retire(t); runAsk();
    };
  }

  })();

  // ---- terminal ---------------------------------------------------------
  // A small shell over the site's own content: a virtual filesystem, git over the versions, live tools, and mail.
  // Anything that isn't a command is asked to the search engine.
  var term = $('term'), out = $('out'), tin = $('termIn'), greeted = false;
  var hist = [], hi = 0, cwd = [], mode = null; // mode: an interactive program (mail, top) that owns the input
  try { hist = JSON.parse(localStorage.getItem('sv.hist')) || []; } catch (e) {}
  hi = hist.length;
  function print(html, cls) { var el = document.createElement('div'); if (cls) el.className = cls; el.innerHTML = html; out.appendChild(el); out.scrollTop = out.scrollHeight; return el; }
  function openTerm() {
    term.classList.add('open'); tin.focus();
    if (!greeted) { greeted = true; print('<span class="c">Welcome to the backstage.</span> Type <b>help</b>, or just ask a question.'); }
  }
  function closeTerm() { term.classList.remove('open'); tin.blur(); }
  function ps1() { return 'sarthak@' + STOPS[era].v + ' ~' + (cwd.length ? '/' + cwd.join('/') : '') + ' %'; }
  function setPrompt(p) { $('ps1').textContent = p || ps1(); }

  function statusText() {
    var lines = ['version ' + label(era), 'system  ' + sysText()];
    if (era === HEAD && stats) SERVICES.forEach(function (s) { if (!stats[s.id]) return; var m = s.metric(stats); lines.push((healthy() ? '● ' : '◐ ') + s.name.padEnd(15) + m[0] + ' ' + m[1]); });
    return lines.join('\n');
  }
  function slug(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  // -- virtual filesystem: built from the same data as the page, so it never drifts ----------------------
  function file(read, run) { return { read: read, run: run }; }
  function stopText(s) {
    return '# ' + s.v + ' · ' + s.title + '\n' + s.blurb + '\n\n' + s.projects.map(function (p) {
      return '## ' + p[0] + '  (' + p[1] + ')\n' + p[2] + '\n' + p[3].map(function (m) { return '  › ' + m; }).join('\n');
    }).join('\n\n') + '\n\nstack: ' + s.stack.join(', ');
  }
  var FS = { dir: {
    'about.md': file(function () { return '# Sarthak Chhabra\nTech Lead, 7+ years. I build the platforms that put AI agents into production:\nrouting engines, RAG pipelines and no-code tooling that turn weeks of engineering\ninto minutes of configuration.\n\nGurgaon, India · IST (UTC+5:30)'; }),
    'contact.md': file(function () { return 'email     ' + EMAIL + '\nlinkedin  linkedin.com/in/sarthak-chhabra\n\nor write to me right here: run `mail`'; }),
    'stack.json': file(function () { return JSON.stringify({ version: STOPS[HEAD].v, stack: STOPS[HEAD].stack }, null, 2); }),
    'resume.pdf': file(function () { return 'binary file. opening it instead…'; }, function () { window.open('/Sarthak%20Resume.pdf', '_blank', 'noopener'); }),
    '.secrets': file(function () { return 'nice try. the only secret is that I read every message. run `mail`.'; }),
    'side-quests': { dir: {} },
    'versions': { dir: {} }
  } };
  SERVICES.forEach(function (sv) {
    FS.dir['side-quests'].dir[sv.id + '.md'] = file(function () {
      var m = stats && stats[sv.id] ? sv.metric(stats) : ['—', ''];
      return '# ' + sv.name + '\n' + sv.d + '\n\nlive      ' + m[0] + ' ' + m[1] + '\nsite      ' + sv.url + (sv.href ? '\n\nwatch it run: `open ' + sv.id + '`' : '');
    });
  });
  STOPS.forEach(function (st) { FS.dir.versions.dir[st.v + '-' + slug(st.title) + '.md'] = file(function () { return stopText(st); }); });

  function resolve(p) { // → { node, path } or null
    var parts = (p || '').startsWith('/') || p === '~' || (p || '').startsWith('~/') ? [] : cwd.slice();
    (p || '').replace(/^~\/?|^\//, '').split('/').forEach(function (x) {
      if (!x || x === '.') return;
      if (x === '..') parts.pop(); else parts.push(x);
    });
    var node = FS;
    for (var i = 0; i < parts.length; i++) { if (!node.dir || !node.dir[parts[i]]) return null; node = node.dir[parts[i]]; }
    return { node: node, path: parts };
  }
  function listing(node, all) {
    return Object.keys(node.dir).filter(function (n) { return all || n[0] !== '.'; })
      .map(function (n) { return node.dir[n].dir ? '<span class="dir">' + n + '/</span>' : esc(n); }).join('   ');
  }
  function tree(node, pre) {
    var names = Object.keys(node.dir).filter(function (n) { return n[0] !== '.'; });
    return names.map(function (n, i) {
      var last = i === names.length - 1, kid = node.dir[n];
      return pre + (last ? '└── ' : '├── ') + (kid.dir ? '<span class="dir">' + n + '/</span>' : esc(n)) + (kid.dir ? '\n' + tree(kid, pre + (last ? '    ' : '│   ')) : '');
    }).join('\n').replace(/\n$/, '');
  }

  // -- git over the versions --------------------------------------------------------------------------
  function gitLog(graph) {
    return STOPS.slice().reverse().map(function (st, i) {
      var head = i === 0 ? ' <span class="a">(HEAD → main)</span>' : '';
      var line = (graph ? '* ' : '') + '<span class="a">' + st.v + '</span>' + head + '  ' + esc(st.title);
      if (graph && i === 0) line += '\n|\\\n| * <span class="a">side-quests</span>  ' + SERVICES.map(function (x) { return x.name; }).join(', ') + '\n|/';
      if (graph && i < STOPS.length - 1) line += '\n|';
      return line;
    }).join('\n') + (graph ? '\n<span class="d">(root)</span>' : '');
  }
  function gitDiff(a, b) {
    var A = STOPS[a], B = STOPS[b], o = ['<span class="d">diff --career ' + A.v + ' ' + B.v + '</span>'];
    if (A.title !== B.title) o.push('<span class="e">- title: ' + esc(A.title) + '</span>', '<span class="c">+ title: ' + esc(B.title) + '</span>');
    var coA = A.projects.map(function (p) { return p[1]; }), coB = B.projects.map(function (p) { return p[1]; });
    coA.filter(function (c, i) { return coA.indexOf(c) === i && coB.indexOf(c) < 0; }).forEach(function (c) { o.push('<span class="e">- at: ' + esc(c) + '</span>'); });
    coB.filter(function (c, i) { return coB.indexOf(c) === i && coA.indexOf(c) < 0; }).forEach(function (c) { o.push('<span class="c">+ at: ' + esc(c) + '</span>'); });
    A.stack.filter(function (x) { return B.stack.indexOf(x) < 0; }).forEach(function (x) { o.push('<span class="e">- stack: ' + esc(x) + '</span>'); });
    B.stack.filter(function (x) { return A.stack.indexOf(x) < 0; }).forEach(function (x) { o.push('<span class="c">+ stack: ' + esc(x) + '</span>'); });
    B.projects.forEach(function (p) { o.push('<span class="c">+ shipped: ' + esc(p[0]) + ' (' + p[3].join(', ') + ')</span>'); });
    return o.join('\n');
  }

  // -- live tools -------------------------------------------------------------------------------------
  var BARS = ' ▁▂▃▄▅▆▇█';
  function spark(vals) {
    var max = Math.max.apply(null, vals) || 1;
    return vals.map(function (v) { return BARS[Math.max(1, Math.round(v / max * 8))]; }).join(''); // quiet days sit on the baseline, not blank
  }
  function topFrame(tick) {
    if (!stats) return 'live stats are still loading…';
    var rows = SERVICES.filter(function (sv) { return sv.n && stats[sv.id]; }).map(function (sv) { // top only shows products with live numbers
      var ser = (stats[sv.id] && stats[sv.id].series) || { values: [], metric: '' }, vals = ser.values.slice(-21), m = sv.metric(stats);
      var sp = spark(vals), cur = tick % Math.max(1, vals.length);
      sp = sp.slice(0, cur) + '<span class="a">' + sp[cur] + '</span>' + sp.slice(cur + 1);
      return sv.name.padEnd(15) + sp + '  ' + m[0] + ' ' + m[1] + '  <span class="d">' + ser.metric + '/day</span>';
    });
    return '<span class="b">top</span> <span class="d">· side quests, last 21 days · refreshed ' + stats.updated + ' · press q to quit</span>\n' + rows.join('\n');
  }
  function startTop() {
    var el = print(topFrame(0)), tick = 0;
    mode = { type: 'top', stop: function () { clearInterval(iv); mode = null; setPrompt(); } };
    var iv = setInterval(function () { el.innerHTML = topFrame(++tick); }, 350);
    setPrompt('(top running · q to quit)');
  }
  function ping(host) {
    var t, n = 0, times = [], el = print('PING ' + esc(host) + ' <span class="d">(https round trip)</span>');
    function one() {
      t = performance.now();
      return fetch('https://' + host + '/favicon.ico?_=' + Date.now(), { mode: 'no-cors', cache: 'no-store' }).then(function () {
        var ms = performance.now() - t; times.push(ms);
        el.innerHTML += '\nreply from ' + esc(host) + ': time=' + ms.toFixed(0) + ' ms';
      });
    }
    var chain = Promise.resolve();
    for (var i = 0; i < 4; i++) chain = chain.then(one).then(function () { return new Promise(function (r) { setTimeout(r, 250); }); });
    return chain.then(function () {
      var avg = times.reduce(function (a, b) { return a + b; }, 0) / times.length;
      el.innerHTML += '\n<span class="d">4 sent, 4 received · avg ' + avg.toFixed(0) + ' ms</span>';
    }).catch(function () { el.innerHTML += '\n<span class="e">' + esc(host) + ' did not answer</span>'; });
  }
  function neofetch() {
    var logo = ['  ███████ ', ' ██       ', '  ██████  ', '       ██ ', ' ███████  ', '          ', ' v e r s i o n e d'];
    var info = [
      '<span class="a">sarthak</span>@<span class="a">' + STOPS[HEAD].v + '</span>',
      '------------------------',
      '<span class="a">Email</span>   ' + EMAIL,
      '<span class="a">OS</span>      ' + label(HEAD),
      '<span class="a">Uptime</span>  7+ years shipping',
      '<span class="a">Host</span>    Gurgaon, India',
      '<span class="a">Shell</span>   zsh (in your browser)',
      '<span class="a">Stack</span>   ' + STOPS[HEAD].stack.slice(0, 5).join(', '),
      '<span class="a">Quests</span>  ' + SERVICES.length + ' live side quests',
      '<span class="a">Status</span>  open to Tech Lead / EM roles'
    ];
    return info.map(function (l, i) { return '<span class="a">' + (logo[i] || '').padEnd(19) + '</span>' + l; }).join('\n');
  }

  // -- mail: name → email → message → confirm -------------------------------------------------------
  function startMail() {
    mode = { type: 'mail', step: 0, data: {}, stop: function () { mode = null; setPrompt(); print('<span class="d">mail cancelled</span>'); } };
    print('<span class="d">Writing to Sarthak. Ctrl+C to cancel.\n' + esc(DISCLOSE) + '</span>');
    setPrompt('name:');
  }
  function mailStep(v) {
    var m = mode, d = m.data;
    print('<span class="c">' + esc($('ps1').textContent) + '</span> ' + esc(v));
    if (m.step === 0) { if (!v.trim()) return print('a name, please', 'e'); d.fullname = v.trim(); m.step = 1; return setPrompt('email:'); }
    if (m.step === 1) { if (!EMAIL_RE.test(v.trim())) return print('that email doesn’t look right, try again', 'e'); d.email = v.trim(); m.step = 2; return setPrompt('message:'); }
    if (m.step === 2) { if (v.trim().length < 5) return print('a few more words, please', 'e'); d.message = v.trim(); m.step = 3; return setPrompt('send? (y/n)'); }
    if (m.step === 3) {
      if (!/^y/i.test(v)) return m.stop();
      mode = null; setPrompt('sending…');
      return sendMail(d, 'terminal `mail`').then(function () { print('<span class="c">sent.</span> I’ll get back to you within a day.'); })
        .catch(function () { print('that didn’t go through. email ' + EMAIL + ' directly.', 'e'); })
        .then(function () { setPrompt(); });
    }
  }

  // -- commands ---------------------------------------------------------------------------------------
  var HELP = [
    ['explore', [['ls [-a] [dir]', 'list files'], ['cd <dir>', 'change directory (~, .., side-quests, versions)'], ['cat <file>', 'print a file'], ['tree', 'everything at once'], ['pwd', 'where am I']]],
    ['history', [['git log [--graph]', 'every version'], ['git show v5', 'one version in detail'], ['git diff v5 v6', 'what changed between two versions'], ['git branch', 'side quests'], ['git checkout v3', 'roll the site back']]],
    ['live', [['top', 'side quests, live'], ['neofetch', 'who is this'], ['uptime', 'how long I’ve been shipping'], ['ping <host>', 'e.g. ping askmyastro.in'], ['status', 'system health']]],
    ['talk', [['ask "…"', 'ask me anything (or just type a question)'], ['mail', 'send me a message from here'], ['open / visit <project>', 'watch its demo / open the real product'], ['contact', 'email and LinkedIn']]],
    ['shell', [['clear, Ctrl+L', ''], ['Ctrl+C', 'cancel'], ['Tab, →', 'autocomplete'], ['home, exit', '']]]
  ];
  var CMDS = ['help', 'ls', 'cd', 'cat', 'tree', 'pwd', 'git', 'top', 'neofetch', 'uptime', 'ping', 'status', 'ask', 'mail', 'open', 'visit', 'contact', 'whoami', 'clear', 'home', 'exit', 'history'];
  var GIT = ['log', 'log --graph', 'show', 'diff', 'branch', 'checkout', 'status'];

  async function exec(line) {
    print('<span class="c">' + esc(ps1()) + '</span> ' + esc(line));
    var m = line.trim().match(/^(\S+)\s*(.*)$/); if (!m) return;
    var cmd = m[1].toLowerCase(), arg = m[2].trim(), r;
    switch (cmd) {
      case 'help':
        return print(HELP.map(function (g) {
          return '<span class="a">' + g[0] + '</span>\n' + g[1].map(function (c) { return '  ' + esc(c[0].padEnd(24)) + '<span class="d">' + esc(c[1]) + '</span>'; }).join('\n');
        }).join('\n'));
      case 'ls': {
        var all = /(^|\s)-a\b/.test(arg); arg = arg.replace(/(^|\s)-a\b/, '').trim();
        r = resolve(arg || '.');
        if (!r) return print('ls: ' + esc(arg) + ': no such file or directory', 'e');
        return print(r.node.dir ? listing(r.node, all) : esc(arg));
      }
      case 'cd':
        r = resolve(arg || '~');
        if (!r || !r.node.dir) return print('cd: not a directory: ' + esc(arg), 'e');
        cwd = r.path; return setPrompt();
      case 'pwd': return print('~' + (cwd.length ? '/' + cwd.join('/') : ''));
      case 'cat': case 'less': case 'more': {
        if (!arg) return print('usage: cat <file>', 'e');
        r = resolve(arg);
        if (!r) return print('cat: ' + esc(arg) + ': no such file', 'e');
        if (r.node.dir) return print('cat: ' + esc(arg) + ': is a directory. try `ls ' + esc(arg) + '`', 'e');
        print(esc(r.node.read())); if (r.node.run) r.node.run(); return;
      }
      case 'tree': return print('<span class="dir">~/</span>\n' + tree(FS, ''));
      case 'git': {
        var sub = arg.split(/\s+/), g = sub[0];
        if (g === 'log') return print(gitLog(/--graph|--oneline/.test(arg)));
        if (g === 'branch') return print('* <span class="c">main</span>\n' + SERVICES.map(function (x) { return '  side-quest/' + x.id; }).join('\n'));
        if (g === 'status') return print('On branch main\nHEAD at ' + label(era) + '\nnothing to commit, open to opportunities');
        if (g === 'show') { var i = eraFromArg(sub[1] || 'v6'); if (i < 0) return print('usage: git show v1 … v6', 'e'); return print(esc(stopText(STOPS[i]))); }
        if (g === 'diff') {
          var x = eraFromArg(sub[1] || 'v5'), y = eraFromArg(sub[2] || (sub[1] ? 'v6' : 'v6'));
          if (x < 0 || y < 0) return print('usage: git diff v5 v6', 'e');
          return print(gitDiff(x, y));
        }
        if (g === 'checkout') {
          var target = sub.slice(1).join(' ');
          var sq = SERVICES.find(function (q) { return target === 'side-quest/' + q.id; });
          if (sq) { location.href = '/' + sq.href; return; }
          var ci = eraFromArg(target);
          if (ci < 0) return print('usage: git checkout v1 … v' + STOPS.length + ', e.g. git checkout v3', 'e');
          goEra(ci); return print('HEAD is now at ' + label(ci) + '. ' + STOPS[ci].blurb, 'd');
        }
        return print('git: try log, show, diff, branch, checkout or status', 'e');
      }
      case 'top': case 'htop': return startTop();
      case 'neofetch': case 'whoami': return print(neofetch());
      case 'uptime': return print('up 7+ years, ' + STOPS.length + ' versions, load average: ' + SERVICES.length + ' side quests');
      case 'ping': {
        var host = (arg || 'askmyastro.in').replace(/^https?:\/\//, '').split('/')[0];
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) return print('usage: ping askmyastro.in', 'e');
        return ping(host);
      }
      case 'status': return print(esc(statusText()));
      case 'mail': return startMail();
      case 'contact': return print(esc(FS.dir['contact.md'].read()));
      case 'history': return print(hist.slice(-20).map(function (h, i) { return String(i + 1).padStart(3) + '  ' + esc(h); }).join('\n'));
      case 'open': case 'visit': {
        var s = SERVICES.find(function (x) { return x.id === arg.toLowerCase(); });
        if (!s) { r = resolve(arg); if (r && !r.node.dir) { print(esc(r.node.read())); if (r.node.run) r.node.run(); return; } }
        if (!s) return print('usage: ' + cmd + ' <' + SERVICES.map(function (x) { return x.id; }).join('|') + '>', 'e');
        if (cmd === 'visit') { window.open(s.url, '_blank', 'noopener'); return print('opened ' + s.url, 'd'); }
        if (!s.href) { window.open(s.url, '_blank', 'noopener'); return print('opened ' + s.url, 'd'); } // no demo page yet
        location.href = '/' + s.href; return;
      }
      case 'clear': out.innerHTML = ''; return;
      case 'exit': return closeTerm();
      case 'home': location.href = '/'; return;
      case 'sudo': return print('nice try. this incident has been logged 🙂', 'e');
      case 'rm': return print('rm: permission denied. the past is read-only; try `git log`.', 'e');
      case 'ask': default: {
        // Not a command: ask the engine. (Single unknown words still get asked; they're usually names or topics.)
        var q = (cmd === 'ask' ? arg : line).replace(/^["']|["']$/g, '').trim();
        if (!q) return print('usage: ask "is he open to remote roles?"', 'e');
        if (cmd !== 'ask') print('<span class="d">not a command, asking the system…</span>');
        var t = {};
        r = await search(q, function (n, ms) { if (ms != null) t[n] = ms; });
        if (r.corrected) print('<span class="d">showing results for “' + esc(r.corrected) + '”</span>');
        print('<span class="d">' + ['embed', 'search', 'rank', 'answer'].map(function (n) { return n + ' ' + t[n].toFixed(1) + 'ms'; }).join(' · ') + ' · match ' + r.score.toFixed(2) + '</span>');
        return print(r.hit ? esc(plain((r.note ? r.note + '\n' : '') + r.text)) : (r.near ? 'did you mean: ' : 'no confident match. closest: ') + r.alts.map(esc).join(' | ') + '\nor run `mail` to ask me directly', r.hit ? '' : 'e');
      }
    }
  }

  // -- input: history, autocomplete with a ghost hint, Ctrl+C / Ctrl+L -------------------------------
  var ghost = $('ghost');
  function completions(v) {
    var parts = v.split(' ');
    if (parts.length === 1) return CMDS.filter(function (c) { return c.indexOf(v) === 0; });
    var head = parts.slice(0, -1).join(' ') + ' ', last = parts[parts.length - 1];
    if (/^git $/.test(head)) return GIT.filter(function (g) { return g.indexOf(last) === 0; }).map(function (g) { return head + g; });
    if (/^git (show|checkout|diff( v\d)?) $/.test(head)) return STOPS.map(function (x) { return x.v; }).filter(function (x) { return x.indexOf(last) === 0; }).map(function (x) { return head + x; });
    if (/^(open|visit) $/.test(head)) return SERVICES.map(function (x) { return x.id; }).filter(function (x) { return x.indexOf(last) === 0; }).map(function (x) { return head + x; });
    if (/^(ls( -a)?|cd|cat|less|open) $/.test(head)) { // paths
      var dir = last.lastIndexOf('/') >= 0 ? last.slice(0, last.lastIndexOf('/') + 1) : '', base = last.slice(dir.length), rr = resolve(dir || '.');
      if (!rr || !rr.node.dir) return [];
      return Object.keys(rr.node.dir).filter(function (n) { return n[0] !== '.' && n.indexOf(base) === 0; })
        .map(function (n) { return head + dir + n + (rr.node.dir[n].dir ? '/' : ''); });
    }
    return [];
  }
  function updateGhost() {
    var v = tin.value, c = !mode && v ? completions(v) : [];
    ghost.innerHTML = c.length === 1 && c[0] !== v ? '<span>' + esc(v) + '</span>' + esc(c[0].slice(v.length)) : '';
  }
  function accept() {
    var c = completions(tin.value);
    if (c.length === 1) { tin.value = c[0] + (/\/$/.test(c[0]) || /^(ask|cd|cat|ls|open|visit|ping|git( \w+)?)$/.test(c[0]) ? (/\/$/.test(c[0]) ? '' : ' ') : ''); updateGhost(); return true; }
    if (c.length > 1) { // extend to the common prefix, list the options
      var pre = c.reduce(function (a, b) { var i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(0, i); });
      if (pre.length > tin.value.length) tin.value = pre; else print(c.map(function (x) { return esc(x.split(' ').pop()); }).join('   '), 'd');
      updateGhost(); return true;
    }
    return false;
  }
  $('termForm').onsubmit = function (e) {
    e.preventDefault();
    var v = tin.value; tin.value = ''; updateGhost();
    if (mode && mode.type === 'mail') return mailStep(v);
    if (mode && mode.type === 'top') { mode.stop(); return; }
    if (!v.trim()) return;
    hist.push(v); hist = hist.slice(-50); hi = hist.length;
    try { localStorage.setItem('sv.hist', JSON.stringify(hist)); } catch (err) {}
    exec(v).catch(function () { print('the search engine couldn’t load. run `mail` to reach me directly.', 'e'); });
  };
  tin.addEventListener('input', updateGhost);
  tin.addEventListener('keydown', function (e) {
    if (mode && mode.type === 'top' && (e.key === 'q' || e.key === 'Escape' || (e.ctrlKey && e.key === 'c'))) { e.preventDefault(); e.stopPropagation(); mode.stop(); print('<span class="d">top: stopped</span>'); return; }
    if (e.ctrlKey && e.key === 'c') { e.preventDefault(); if (mode) mode.stop(); else { print('<span class="c">' + esc(ps1()) + '</span> ' + esc(tin.value) + '^C'); tin.value = ''; updateGhost(); } return; }
    if (e.ctrlKey && e.key === 'l') { e.preventDefault(); out.innerHTML = ''; return; }
    if (mode) return;
    if (e.key === 'Tab') { e.preventDefault(); accept(); }
    else if (e.key === 'ArrowRight' && tin.selectionStart === tin.value.length && ghost.textContent) { e.preventDefault(); accept(); }
    else if (e.key === 'ArrowUp' && hi > 0) { e.preventDefault(); tin.value = hist[--hi]; updateGhost(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); tin.value = hist[hi] || ''; updateGhost(); }
  });
  $('termChip').onclick = function () { term.classList.contains('open') ? closeTerm() : openTerm(); };
  $('termX').onclick = closeTerm;
  document.addEventListener('keydown', function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.key === '~' || e.key === '`') && (!typing || e.target === tin)) { e.preventDefault(); term.classList.contains('open') ? closeTerm() : openTerm(); }
    else if (e.key === 'Escape' && term.classList.contains('open') && !(mode && mode.type === 'top')) closeTerm();
  });

  // ---- email buttons: mailto does nothing for people without a mail app (most Gmail-in-browser users), so every
  // click also copies the address and offers the contact form. The mail app still opens when there is one.
  var toastTimer;
  function toast(html) {
    var t = $('toast') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'toast', className: 'toast', role: 'status' }));
    t.innerHTML = html; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 5000);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a) return;
    var addr = a.getAttribute('href').slice(7).split('?')[0];
    var form = HOME ? '#oncall' : '/#oncall';
    var done = function (copied) { toast((copied ? 'Copied <b>' + esc(addr) + '</b>' : '<b>' + esc(addr) + '</b>') + ' · or <a href="' + form + '">write to me here →</a>'); };
    if (navigator.clipboard) navigator.clipboard.writeText(addr).then(function () { done(true); }, function () { done(false); }); else done(false);
  });

  // ---- devtools console: the backstage ----------------------------------
  window.sarthak = {
    help: function () { console.log('%csarthak.help()      this list\nsarthak.ask("...")  ask me anything\nsarthak.checkout("v2")  roll the site back\nsarthak.status()    system health\nsarthak.terminal()  open the terminal', 'font-family:monospace'); },
    ask: function (q) {
      var t = {};
      return search(String(q), function (n, ms) { if (ms != null) t[n] = +ms.toFixed(1) + 'ms'; }).then(function (r) {
        console.table(t);
        var text = r.hit ? plain((r.note ? r.note + '\n' : '') + r.text) : (r.near ? 'Did you mean: ' : 'No confident match. Closest: ') + r.alts.join(' | ');
        console.log(text); return text;
      });
    },
    checkout: function (v) { var i = eraFromArg(v); if (i < 0) return "usage: sarthak.checkout('v2')"; goEra(i); return 'HEAD is now at ' + label(i); },
    status: function () { console.log(statusText()); },
    terminal: function () { openTerm(); return 'opened'; }
  };
  console.log('%c\n ┌─┐┌─┐┬─┐┌┬┐┬ ┬┌─┐┬┌─\n └─┐├─┤├┬┘ │ ├─┤├─┤├┴┐\n └─┘┴ ┴┴└─ ┴ ┴ ┴┴ ┴┴ ┴  versioned\n',
    'color:#A5432A;font-family:monospace;font-weight:bold');
  console.log('%cyou found the backstage 👋\n\nsarthak.help()  sarthak.ask("...")  sarthak.checkout("v2")  sarthak.status()  sarthak.terminal()',
    'font-family:monospace;font-size:12px');

  // ---- boot -------------------------------------------------------------
  setEra(HEAD);
  if (HOME) {
    renderStop(false);
    statsReady.then(function () { renderStatus(); renderServices(); });
    var want = eraFromArg(new URLSearchParams(location.search).get('v') || '');
    if (want >= 0) addEventListener('load', function () { scrollToStop(want, false); });
  }
})();
