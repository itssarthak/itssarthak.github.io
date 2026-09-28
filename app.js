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
    { id: 'askmyastro', name: 'AskMyAstro', d: 'An AI astrologer that reads your birth chart and answers over chat.', href: 'askmyastro-demo.html', url: 'https://askmyastro.in', site: 'askmyastro.in', metric: function (s) { return [k(s.askmyastro.users), 'users']; } },
    { id: 'filedownloader', name: 'FileDownloader', d: 'Paste links, get every file at once, zipped.', href: 'filedownloader.html', url: 'https://filedownloader.in', site: 'filedownloader.in', metric: function (s) { return [k(s.filedownloader.downloads), 'downloads served']; } },
    { id: 'switchboard', name: 'Switchboard', d: 'Open-source dashboard for every Claude Code session on your Mac.', href: 'switchboard.html', url: 'https://github.com/itssarthak/claudecode-switchboard', site: 'GitHub', metric: function (s) { return [s.switchboard.clones, 'installs · ' + s.switchboard.stars + ' ★']; } }
  ];
  // Ask-box suggestions: [what the chip says, the answer-bank question it leads to]. 3 show at a time; see initSuggestions().
  var SUGGEST = [
    ['Is he open to remote roles?', 'Remote or relocation?'], ['What is AskMyAstro?', 'What is AskMyAstro?'],
    ['Has he led a team?', 'Do you have team-leading experience?'], ['What role is he looking for?', 'What role are you looking for?'],
    ['When can he start?', 'When can you start?'], ['Why should we hire him?', 'Why should we hire you?'],
    ['What has he built on his own?', 'What have you built yourself?'], ['What is Switchboard?', 'What is Switchboard?'],
    ['What is FileDownloader?', 'What is FileDownloader?'], ['Are these numbers real?', 'Are these numbers real?'],
    ['What did he build at Stashfin?', 'What did you do at Stashfin?'], ['How does his LLM router work?', "What's the LLM routing engine?"],
    ['How did the companion hit 46% retention?', 'How did the companion reach 46% D15 retention?'], ['How does he reduce hallucinations?', 'How do you reduce hallucinations?'],
    ['How does he keep LLM costs down?', 'How do you control LLM costs?'], ['How does he evaluate LLM outputs?', 'How do you evaluate LLM outputs?'],
    ['What\u2019s his tech stack?', "What's your tech stack?"], ['Which LLMs has he worked with?', 'Which LLM providers have you worked with?'],
    ['What\u2019s the hardest problem he\u2019s solved?', "What's the hardest technical problem you've solved?"], ['Which project is he proudest of?', 'What project are you proudest of?'],
    ['What\u2019s his leadership style?', "What's your leadership style?"], ['How does he mentor engineers?', 'How do you mentor engineers?'],
    ['IC or manager?', 'Individual contributor or manager?'], ['Is he open to early-stage startups?', 'Are you open to early-stage startups?'],
    ['Can he work US or European hours?', 'Can you work US or European hours?'], ['Is he open to contract work?', 'Are you open to contract or freelance work?'],
    ['Does he do system design?', 'Do you do system design?'], ['Why LangGraph?', 'Why LangGraph?'],
    ['How does he handle prompt injection?', 'How do you handle prompt injection?'], ['How does he monitor agents in production?', 'How do you monitor AI agents in production?'],
    ['Has he built MCP servers?', 'Have you built MCP servers?'], ['Does he use AI coding tools?', 'Do you use AI coding tools?'],
    ['How does this Ask box work?', 'How does this Ask box work?'], ['Any hidden features?', 'Any hidden features?'],
    ['Why did he build Switchboard?', 'Why did you build Switchboard?'], ['Why astrology?', 'Why astrology?'],
    ['How does he work with non-tech teams?', 'How do you work with non-technical stakeholders?'], ['What\u2019s his career story?', "What's your career story?"],
    ['Where did he study?', 'Where did you study?'], ['Frontend or backend?', 'Frontend or backend?']
  ];
  var EMAIL = 'hello@sarthakchhabra.com';

  // ---- helpers ----------------------------------------------------------
  var $ = function (id) { return document.getElementById(id); };
  function k(n) { return n >= 1e5 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function md(s) { // tiny markdown: `code`, [text](url), paragraphs
    return esc(s).split('\n').map(function (p) {
      return '<p>' + p.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>') + '</p>';
    }).join('');
  }
  function plain(s) { return s.replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1 ($2)'); }

  // The home page has the whole system; case-study pages only get the terminal (a ~$ button, top right) and console.
  var HOME = !!$('svc');
  if (!$('term')) document.body.insertAdjacentHTML('beforeend',
    '<div class="term" id="term" role="dialog" aria-label="Terminal" aria-modal="false"><div class="bar"><i></i><i></i><i></i><span>sarthak — zsh</span>' +
    '<button id="termX" aria-label="Close terminal">esc ✕</button></div><div class="out" id="out"></div>' +
    '<form class="line" id="termForm"><span id="ps1"></span><input id="termIn" autocomplete="off" spellcheck="false" aria-label="Terminal input"></form></div>' +
    ($('termChip') ? '' : '<button class="term-fab" id="termChip" aria-label="Open terminal">~$</button>'));

  // ---- live stats -------------------------------------------------------
  var stats = null;
  var statsReady = fetch('/assets/data/live-stats.json').then(function (r) { return r.json(); })
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
    $('ps1').textContent = 'sarthak@' + STOPS[i].v + ' ~ %';
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
    $('sysDot').className = 'dot' + (st ? ' ' + st : ''); $('sys').className = st; $('sys').textContent = sysText();
  }
  function renderServices() { // "live now": only your own products, only at HEAD (the section sits above the history, so it always is)
    $('svcNote').textContent = stats ? 'live · refreshed ' + stats.updated : 'live · refreshed daily';
    $('svc').innerHTML = SERVICES.map(function (s, i) {
      var m = stats ? s.metric(stats) : ['—', ''];
      return '<div class="card in" style="animation-delay:' + i * 70 + 'ms"><span class="nm"><span class="dot' + (stats && !healthy() ? ' warn' : '') + '"></span>' + s.name + '</span>' +
        '<span class="d">' + s.d + '</span><span class="m">' + m[0] + '<small>' + m[1] + '</small></span>' +
        '<span class="go"><a href="' + s.href + '">Watch it run →</a><a href="' + s.url + '" target="_blank" rel="noopener">' + s.site + ' ↗</a></span></div>';
    }).join('');
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

  // ---- the search engine (shared) ---------------------------------------
  // Must match scripts/build-answer-index.mjs, or the vectors aren't comparable.
  var MODEL = 'Xenova/all-MiniLM-L6-v2', DTYPE = 'q8', TF = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0';
  var MATCH = 0.5;
  function norm(q) { // identical to norm() in the build script
    return q.toLowerCase().replace(/\bsarthak('s)?\b/g, 'you').replace(/\b(he|him|he's)\b/g, 'you').replace(/\bhis\b/g, 'your');
  } // below this cosine score we say "I don't know" instead of guessing
  var indexP, modelP, onAnswered = function () {}; // the Ask box sets onAnswered to retire used suggestions
  function loadIndex() {
    return indexP || (indexP = fetch('/answers.json').then(function (r) { return r.json(); }).then(function (d) {
      var bin = atob(d.vecs), v = new Int8Array(bin.length);
      for (var i = 0; i < bin.length; i++) v[i] = bin.charCodeAt(i) << 24 >> 24;
      d.v = v; return d;
    }));
  }
  function loadModel() {
    return modelP || (modelP = import(TF).then(function (m) { return m.pipeline('feature-extraction', MODEL, { dtype: DTYPE }); }));
  }
  function eraOf(tag) { return tag === 'all' ? -1 : eraFromArg(tag); } // 'v5' → 4

  // step(name, ms|null) is called as each stage starts (null) and ends (ms)
  async function search(q, step) {
    step = step || function () {};
    var now = function () { return performance.now(); }, t;
    step('load', null); t = now();
    var got = await Promise.all([loadIndex(), loadModel(), statsReady]), d = got[0], embed = got[1];
    step('load', now() - t);
    step('embed', null); t = now();
    var qv = (await embed(norm(q), { pooling: 'mean', normalize: true })).data;
    step('embed', now() - t);
    step('search', null); t = now();
    var n = d.idx.length, dim = d.dim, best = {};
    for (var i = 0; i < n; i++) {
      var s = 0, o = i * dim;
      for (var j = 0; j < dim; j++) s += qv[j] * d.v[o + j];
      s /= 127;
      if (!(d.idx[i] in best) || s > best[d.idx[i]]) best[d.idx[i]] = s;
    }
    step('search', now() - t);
    step('rank', null); t = now();
    var top = Object.keys(best).map(function (a) { return { i: +a, score: best[a] }; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 3);
    step('rank', now() - t);
    step('answer', null); t = now();
    var r = compose(d, top);
    step('answer', now() - t);
    if (r.hit) onAnswered(r.q);
    return r;
  }
  function compose(d, top) {
    var hit = top[0].score >= MATCH, a = d.answers[top[0].i];
    var res = { hit: hit, score: top[0].score, q: a.q, alts: top.map(function (x) { return d.answers[x.i].q; }), note: '', text: '' };
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
    $('askIn').addEventListener('focus', function () { loadIndex(); loadModel(); }, { once: true });
  } else {
    addEventListener('load', function () {
      var idle = window.requestIdleCallback || function (f) { setTimeout(f, 1200); };
      idle(function () {
        var t = performance.now();
        Promise.all([loadIndex(), loadModel()])
          .then(function (r) { return r[1]('warm up', { pooling: 'mean', normalize: true }); }) // first run compiles; do it now, not on the visitor's question
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
  $('answer').onclick = function (e) { if (e.target.dataset.q) { $('askIn').value = e.target.dataset.q; runAsk(); } };

  var asking = 0;
  async function runAsk() {
    var q = $('askIn').value.trim(); if (!q) return;
    var id = ++asking, trace = $('trace'), times = {};
    trace.classList.add('show'); $('answer').innerHTML = '';
    function draw(cur) {
      trace.innerHTML = STEPS.map(function (s) {
        if (s === 'load' && times.load != null && times.load < 50) return ''; // already warm: don't show the one-time download
        var st = times[s] != null ? 'done' : s === cur ? 'run' : '';
        var label = s === 'load' ? 'warm-up' : s;
        var val = times[s] != null ? times[s].toFixed(times[s] < 10 ? 1 : 0) + 'ms' : s === cur ? (s === 'load' ? 'downloading model, once…' : '…') : '';
        return '<div class="st ' + st + '"><i>' + label + '</i><b>' + val + '</b></div>';
      }).join('');
    }
    try {
      var r = await search(q, function (name, ms) { if (id !== asking) return; if (ms != null) times[name] = ms; draw(ms == null ? name : null); });
      if (id !== asking) return;
      trace.innerHTML += '<div class="st done"><i>match</i><b>' + r.score.toFixed(2) + '</b>&nbsp;“' + esc(r.q) + '”</div>';
      $('answer').innerHTML = r.hit
        ? (r.note ? '<p class="note">' + md(r.note).slice(3, -4) + '</p>' : '') + md(r.text)
        : '<p>I don’t have an answer for that one, and I won’t make one up. Closest questions I can answer:</p><div class="alts">' +
          r.alts.map(function (a) { return '<button type="button" data-q="' + esc(a) + '">' + esc(a) + '</button>'; }).join('') +
          '</div><p>Or ask me directly: <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>. Psst: try the terminal (press ~), it knows more tricks.</p>';
    } catch (err) {
      if (id !== asking) return;
      trace.classList.remove('show');
      $('answer').innerHTML = '<p>The search engine couldn’t load (offline, or the model download was blocked). Ask me directly: <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.</p>';
    }
  }

  // Contact form: same EmailJS service and template as the old contact page, so messages land in the same inbox.
  // The SDK loads only once someone starts typing.
  (function () {
    var f = $('contact'), btn = $('sendBtn'), msg = $('formMsg'), sdk;
    function loadSdk() {
      return sdk || (sdk = new Promise(function (res, rej) {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        s.onload = function () { window.emailjs.init('LhqIBx9HdNrecNXa6'); res(window.emailjs); };
        s.onerror = rej; document.head.appendChild(s);
      }));
    }
    f.addEventListener('input', function () { loadSdk().catch(function () {}); btn.disabled = !f.checkValidity(); msg.textContent = ''; msg.className = 'form-msg'; });
    f.onsubmit = function (e) {
      e.preventDefault();
      if (!f.checkValidity()) return;
      btn.disabled = true; btn.textContent = 'Sending…';
      loadSdk().then(function (ej) { return ej.sendForm('service_okhl58i', 'template_k5j1ftq', f); })
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
  var term = $('term'), out = $('out'), tin = $('termIn'), hist = [], hi = 0, greeted = false;
  var CMDS = ['help', 'status', 'ask', 'git checkout', 'git log', 'ls', 'open', 'visit', 'home', 'whoami', 'contact', 'clear', 'exit'];
  function print(html, cls) { var el = document.createElement('div'); if (cls) el.className = cls; el.innerHTML = html; out.appendChild(el); out.scrollTop = out.scrollHeight; }
  function openTerm() {
    term.classList.add('open'); tin.focus();
    if (!greeted) { greeted = true; print('<span class="c">Welcome to the backstage.</span> Type <b>help</b> to see what I can do.', ''); }
  }
  function closeTerm() { term.classList.remove('open'); tin.blur(); }
  function statusText() {
    var lines = ['version ' + label(era), 'system  ' + sysText()];
    if (era === HEAD && stats) SERVICES.forEach(function (s) { var m = s.metric(stats); lines.push((healthy() ? '● ' : '◐ ') + s.name.padEnd(15) + m[0] + ' ' + m[1]); });
    return lines.join('\n');
  }
  var RUN = {
    help: function () {
      return ['help                  this list', 'status                system and side-quest health', 'ask "..."             ask me anything', 'git checkout <v1–v6>  roll the system back (or a title: senior, tech lead)',
        'git log               every version', 'ls                    list side quests', 'open <project>        watch its demo', 'visit <project>       open the real product', 'home                  back to the home page', 'whoami                who is this', 'contact               how to reach me', 'clear, exit'].join('\n');
    },
    status: statusText,
    whoami: function () { return 'Sarthak Chhabra. Tech Lead, 7+ years. I build the platforms that put AI agents into production. Gurgaon, India.'; },
    contact: function () { return 'email     ' + EMAIL + '\nlinkedin  linkedin.com/in/sarthak-chhabra'; },
    ls: function () { return SERVICES.map(function (s) { return s.id; }).join('   '); },
    clear: function () { out.innerHTML = ''; return ''; },
    exit: function () { closeTerm(); return ''; },
    home: function () { location.href = './'; return ''; }
  };
  async function exec(line) {
    print('<span class="c">' + esc($('ps1').textContent) + '</span> ' + esc(line));
    var m = line.trim().match(/^(\S+)\s*(.*)$/); if (!m) return;
    var cmd = m[1].toLowerCase(), arg = m[2].trim();
    if (cmd === 'git' && /^checkout\b/.test(arg)) { cmd = 'checkout'; arg = arg.replace(/^checkout\s*/, ''); }
    else if (cmd === 'git' && /^log\b/.test(arg)) cmd = 'log';
    if (cmd === 'checkout') {
      var i = eraFromArg(arg);
      if (i < 0) return print('usage: git checkout v1 … v' + STOPS.length + ', e.g. git checkout v3', 'e');
      goEra(i); return print('HEAD is now at ' + label(i) + '. ' + STOPS[i].blurb, 'd');
    }
    if (cmd === 'log') return print(STOPS.slice().reverse().map(function (s) {
      return '<span class="a">' + s.v + '</span>  ' + esc(s.title) + '  <span class="d">' + esc(s.projects.map(function (p) { return p[0]; }).join(', ')) + '</span>';
    }).join('\n'));
    if (cmd === 'open' || cmd === 'visit') {
      var s = SERVICES.find(function (x) { return x.id === arg.toLowerCase(); });
      if (!s) return print('usage: ' + cmd + ' <' + SERVICES.map(function (x) { return x.id; }).join('|') + '>', 'e');
      if (cmd === 'visit') { window.open(s.url, '_blank', 'noopener'); return print('opened ' + s.url, 'd'); }
      location.href = s.href; return;
    }
    if (cmd === 'ask') {
      var q = arg.replace(/^["']|["']$/g, '');
      if (!q) return print('usage: ask "is he open to remote roles?"', 'e');
      var t = {};
      var r = await search(q, function (n, ms) { if (ms != null) t[n] = ms; });
      print('<span class="d">' + ['embed', 'search', 'rank', 'answer'].map(function (n) { return n + ' ' + t[n].toFixed(1) + 'ms'; }).join(' · ') + ' · match ' + r.score.toFixed(2) + '</span>');
      return print(r.hit ? esc(plain((r.note ? r.note + '\n' : '') + r.text)) : 'no confident match. closest: ' + r.alts.map(esc).join(' | ') + '\nor email ' + EMAIL, r.hit ? '' : 'e');
    }
    if (cmd === 'sudo') return print('nice try. this incident has been logged 🙂', 'e');
    if (RUN[cmd]) { var o = RUN[cmd](); if (o) print(esc(o)); return; }
    print('command not found: ' + esc(cmd) + '. try <b>help</b>', 'e');
  }
  $('termForm').onsubmit = function (e) {
    e.preventDefault();
    var v = tin.value; tin.value = ''; if (!v.trim()) return;
    hist.push(v); hi = hist.length;
    exec(v).catch(function () { print('the search engine couldn’t load. email ' + EMAIL, 'e'); });
  };
  tin.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') { // complete commands, then eras / services
      e.preventDefault();
      var v = tin.value, pool = CMDS;
      if (/^git checkout /.test(v)) pool = STOPS.map(function (x) { return 'git checkout ' + x.v; });
      else if (/^(open|visit) /.test(v)) pool = SERVICES.map(function (x) { return v.split(' ')[0] + ' ' + x.id; });
      var hits = pool.filter(function (c) { return c.indexOf(v) === 0; });
      if (hits.length === 1) tin.value = hits[0] + (pool === CMDS && /^(ask|open|visit|git checkout)$/.test(hits[0]) ? ' ' : '');
      else if (hits.length > 1) print(hits.join('   '), 'd');
    } else if (e.key === 'ArrowUp' && hi > 0) { e.preventDefault(); tin.value = hist[--hi]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); tin.value = hist[hi] || ''; }
  });
  $('termChip').onclick = function () { term.classList.contains('open') ? closeTerm() : openTerm(); };
  $('termX').onclick = closeTerm;
  document.addEventListener('keydown', function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.key === '~' || e.key === '`') && (!typing || e.target === tin)) { e.preventDefault(); term.classList.contains('open') ? closeTerm() : openTerm(); }
    else if (e.key === 'Escape' && term.classList.contains('open')) closeTerm();
  });

  // ---- devtools console: the backstage ----------------------------------
  window.sarthak = {
    help: function () { console.log('%csarthak.help()      this list\nsarthak.ask("...")  ask me anything\nsarthak.checkout("v2")  roll the site back\nsarthak.status()    system health\nsarthak.terminal()  open the terminal', 'font-family:monospace'); },
    ask: function (q) {
      var t = {};
      return search(String(q), function (n, ms) { if (ms != null) t[n] = +ms.toFixed(1) + 'ms'; }).then(function (r) {
        console.table(t);
        var text = r.hit ? plain((r.note ? r.note + '\n' : '') + r.text) : 'No confident match. Closest: ' + r.alts.join(' | ');
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
