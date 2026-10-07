// The avatar above the Ask box: a 33x33 grid of head poses (assets/images/avatar/<col>_<row>.webp,
// col 0 = looking to the picture's left, row 0 = looking up, 16_16 = facing you). The head eases toward
// the pointer, follows the text cursor while you type, looks down while it answers, and back up after.
// app.js calls window.siteAvatar.thinking() / .answered() around each question.
(function () {
  var el = document.getElementById('avatar');
  if (!el) return;
  var N = 33, MID = 16;
  var EASE = 0.12;   // share of the remaining distance per frame; lower = lazier head
  var REACH = 0.3;   // full turn when the pointer is ~30% of the viewport away
  var CARET = 0.8;  // how far the head turns when the text cursor reaches either end of the box
  var HOLD = 0.6;    // step to the next pose only once clearly past halfway (stops flicker between two)
  var src = function (c, r) { return '/assets/images/avatar/' + c + '_' + r + '.webp'; };

  var goal = { x: MID, y: MID }, cur = { x: MID, y: MID }, shown = { x: MID, y: MID };
  var typing = false, waiting = false, answered = false, running = false;
  var input = document.getElementById('askIn');
  function down() { return waiting || (typing && !answered); }

  // Screen x of the text cursor in the Ask input: width of the text before it, in the input's own font.
  var measure = document.createElement('canvas').getContext('2d');
  function caretX() {
    var cs = getComputedStyle(input), b = input.getBoundingClientRect();
    measure.font = cs.font;
    var w = measure.measureText(input.value.slice(0, input.selectionStart || 0)).width;
    return Math.min(b.right, b.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth) + w - input.scrollLeft);
  }
  function downGoal() {
    if (waiting || !input) return { x: MID, y: N - 1 };
    var b = el.getBoundingClientRect(), box = input.getBoundingClientRect();
    var dx = (caretX() - (b.left + b.width / 2)) / (box.width / 2) * CARET; // scaled to the box, not the screen
    return { x: MID + Math.max(-1, Math.min(1, dx)) * MID, y: N - 1 };
  }

  // Load every pose quietly, nearest-to-front first, but only after app.js has finished warming the AI
  // model and revealed the Ask section, so 1,089 small images never compete with that download.
  function preload() {
    var order = [];
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) order.push([c, r]);
    order.sort(function (a, b) { return Math.hypot(a[0] - MID, a[1] - MID) - Math.hypot(b[0] - MID, b[1] - MID); });
    order.forEach(function (p) { new Image().src = src(p[0], p[1]); });
  }
  var sec = document.getElementById('ask');
  if (!sec || sec.classList.contains('ready')) preload();
  else new MutationObserver(function (m, ob) { if (sec.classList.contains('ready')) { ob.disconnect(); preload(); } })
    .observe(sec, { attributes: true, attributeFilter: ['class'] });

  addEventListener('pointermove', function (e) {
    var b = el.getBoundingClientRect();
    if (!b.width) return; // hidden (section not revealed yet)
    var dx = (e.clientX - (b.left + b.width / 2)) / (innerWidth * REACH);
    var dy = (e.clientY - (b.top + b.height / 2)) / (innerHeight * REACH);
    goal = { x: MID + Math.max(-1, Math.min(1, dx)) * MID, y: MID + Math.max(-1, Math.min(1, dy)) * MID };
    kick();
  }, { passive: true });

  function frame() {
    var g = down() ? downGoal() : goal;
    cur.x += (g.x - cur.x) * EASE;
    cur.y += (g.y - cur.y) * EASE;
    if (Math.abs(cur.x - shown.x) > HOLD) shown.x = Math.round(cur.x);
    if (Math.abs(cur.y - shown.y) > HOLD) shown.y = Math.round(cur.y);
    var s = src(shown.x, shown.y);
    if (el.getAttribute('src') !== s) el.setAttribute('src', s);
    // stop the loop once settled; the next pointer move or state change restarts it
    if (Math.abs(g.x - cur.x) + Math.abs(g.y - cur.y) > 0.05) requestAnimationFrame(frame); else running = false;
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

  if (input) {
    input.addEventListener('focus', function () { typing = true; answered = false; kick(); });
    input.addEventListener('input', function () { answered = false; kick(); });
    input.addEventListener('blur', function () { typing = false; kick(); });
    ['keyup', 'click', 'select'].forEach(function (t) { input.addEventListener(t, kick); }); // cursor moved without typing
  }
  window.siteAvatar = {
    thinking: function () { waiting = true; answered = false; kick(); },
    answered: function () { waiting = false; answered = true; kick(); }
  };
})();
