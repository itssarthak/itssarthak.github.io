/* Sarthak Chhabra — site interactions */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav ---------- */
  var nav = document.querySelector(".nav");
  var progress = document.querySelector(".scroll-progress");

  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- animated counters ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var dur = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reducedMotion) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            animateCounter(en.target);
            cio.unobserve(en.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute("data-count");
    });
  }

  /* ---------- card spotlight ---------- */
  document.querySelectorAll(".bento-cell, .system-card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- terminal streaming ---------- */
  var termOut = document.getElementById("term-stream");
  if (termOut) {
    var lines = [
      { cls: "t-out", text: "loading profile … done (12ms)" },
      { cls: "t-out", text: "" },
      { cls: "t-cmd", html: '<span class="t-accent">»</span> 7+ years shipping production systems' },
      { cls: "t-cmd", html: '<span class="t-accent">»</span> recently: architected a no-code AI agent platform @ Stashfin' },
      { cls: "t-cmd", html: '<span class="t-accent">»</span> status: open to new opportunities' },
      { cls: "t-cmd", html: '<span class="t-accent">»</span> previously: LLM infra @ Zupee · 300K req/day @ 15–20ms' },
      { cls: "t-cmd", html: '<span class="t-accent">»</span> obsession: systems that let anyone deploy intelligence' }
    ];

    if (reducedMotion) {
      lines.forEach(function (l) {
        var div = document.createElement("div");
        div.className = l.cls;
        if (l.html) div.innerHTML = l.html;
        else div.textContent = l.text;
        termOut.appendChild(div);
      });
    } else {
      var li = 0;
      var startStream = function () {
        if (li >= lines.length) {
          var c = document.createElement("span");
          c.className = "t-cursor";
          termOut.appendChild(c);
          return;
        }
        var l = lines[li++];
        var div = document.createElement("div");
        div.className = l.cls;
        termOut.appendChild(div);

        if (l.html) {
          var tmp = document.createElement("div");
          tmp.innerHTML = l.html;
          var nodes = [];
          (function flatten(parent, wrap) {
            Array.prototype.forEach.call(parent.childNodes, function (n) {
              if (n.nodeType === 3) {
                n.textContent.split("").forEach(function (ch) {
                  nodes.push({ ch: ch, wrap: wrap });
                });
              } else {
                flatten(n, { tag: n.tagName, cls: n.className });
              }
            });
          })(tmp, null);

          var i = 0;
          var typeChar = function () {
            if (i >= nodes.length) { setTimeout(startStream, 140); return; }
            var n = nodes[i++];
            if (n.wrap) {
              var last = div.lastChild;
              if (!last || last.nodeType !== 1 || last.className !== n.wrap.cls) {
                last = document.createElement(n.wrap.tag.toLowerCase());
                last.className = n.wrap.cls;
                div.appendChild(last);
              }
              last.textContent += n.ch;
            } else {
              div.appendChild(document.createTextNode(n.ch));
            }
            setTimeout(typeChar, 10 + Math.random() * 22);
          };
          typeChar();
        } else {
          var txt = l.text, j = 0;
          if (!txt) { setTimeout(startStream, 90); return; }
          var typePlain = function () {
            if (j >= txt.length) { setTimeout(startStream, 140); return; }
            div.textContent += txt[j++];
            setTimeout(typePlain, 8 + Math.random() * 16);
          };
          typePlain();
        }
      };
      setTimeout(startStream, 650);
    }
  }

  /* ---------- constellation canvas ---------- */
  var canvas = document.getElementById("constellation");
  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var mouse = { x: -9999, y: -9999 };
    var W, H, raf;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.min(90, Math.floor((W * H) / 16000));
      while (particles.length < target) particles.push(spawn());
      particles.length = target;
    }

    function spawn() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.4 + 0.4,
        hue: Math.random() < 0.55 ? "103, 232, 249" : "167, 139, 250"
      };
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      var linkDist = 130;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

        var dxm = p.x - mouse.x, dym = p.y - mouse.y;
        var dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 140 && dm > 0.01) {
          p.x += (dxm / dm) * 0.6;
          p.y += (dym / dm) * 0.6;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.hue + ", 0.55)";
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            var a = (1 - Math.sqrt(d2) / linkDist) * 0.13;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(148, 163, 184, " + a + ")";
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    });

    resize();
    raf = requestAnimationFrame(tick);
  }

  /* ---------- active nav link on scroll (index only) ---------- */
  var sections = document.querySelectorAll("section[id]");
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            navAnchors.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
            });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    sections.forEach(function (s) { sio.observe(s); });
  }

  /* ---------- live project stats (portfolio only) ---------- */
  var statEls = document.querySelectorAll("[data-stat]");
  if (statEls.length && "fetch" in window) {
    var fmtStat = function (n) {
      n = Number(n) || 0;
      if (n >= 9.95e5) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
      if (n >= 1e5) return Math.round(n / 1e3) + "K";
      if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
      return String(n);
    };
    fetch("/assets/data/live-stats.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (stats) {
        if (!stats) return;
        statEls.forEach(function (el) {
          var s = stats[el.getAttribute("data-stat")];
          if (!s) return;
          var parts = [];
          if (s.downloads) parts.push(fmtStat(s.downloads) + "+ downloads");
          if (s.users) parts.push(fmtStat(s.users) + "+ users");
          if (s.users && !s.downloads && s.pageviews) parts.push(fmtStat(s.pageviews) + " views");
          if (s.clones) parts.push(fmtStat(s.clones) + " clones");
          if (s.stars) parts.push(fmtStat(s.stars) + (s.stars === 1 ? " star" : " stars"));
          if (!parts.length) return;
          el.textContent = "";
          parts.forEach(function (part, i) {
            if (i) el.appendChild(document.createTextNode(" · "));
            var chip = document.createElement("span");
            chip.className = "stat";
            chip.textContent = part;
            el.appendChild(chip);
          });
          if (stats.updated) el.title = "updated " + stats.updated;
        });
        renderTraffic(stats);
      })
      .catch(function () {});
  }

  /* ---------- daily traffic charts ---------- */
  /* Each product charts its own headline metric, so the two never share a y-axis:
     downloads run ~1000x users and would flatten the smaller series to the floor. */
  var CHART_META = {
    askmyastro: { label: "AskMyAstro", unit: "users", color: "#0891b2" },
    filedownloader: { label: "FileDownloader", unit: "downloads", color: "#7c3aed" },
  };
  var SVG_NS = "http://www.w3.org/2000/svg";
  var VB_W = 560, VB_H = 150, PAD_L = 46, PAD_R = 14, PAD_T = 14, PAD_B = 26;

  function svgEl(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  /* Round the axis top to a clean number so ticks read 0 / 3k / 6k. The ladder is
     deliberately fine-grained: a coarse one sends 514 up to 1000 and wastes half the
     plot height, flattening the very shape the chart exists to show. Steps stay
     halvable so the midpoint tick is clean too. */
  function niceCeil(v) {
    if (v <= 5) return 5;
    var mag = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / mag;
    var steps = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < steps.length; i++) if (n <= steps[i]) return steps[i] * mag;
    return 10 * mag;
  }

  function dayLabel(from, i) {
    var d = new Date(from + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + i);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }

  function drawChart(figure, key, series, range) {
    var meta = CHART_META[key];
    var all = series.values || [];
    var values = all.slice(-range);
    var offset = all.length - values.length; // day index of the first plotted value
    if (values.length < 2) return;

    var top = niceCeil(Math.max.apply(null, values)) || 5;
    var innerW = VB_W - PAD_L - PAD_R;
    var innerH = VB_H - PAD_T - PAD_B;
    var x = function (i) { return PAD_L + (i * innerW) / (values.length - 1); };
    var y = function (v) { return PAD_T + (1 - v / top) * innerH; };

    figure.textContent = "";

    var cap = document.createElement("figcaption");
    cap.className = "chart-cap";
    var strong = document.createElement("span");
    strong.className = "chart-name";
    strong.textContent = meta.label;
    var dim = document.createElement("span");
    dim.className = "chart-metric";
    dim.textContent = meta.unit + " per day · " + dayLabel(series.from, offset) +
      " – " + dayLabel(series.from, all.length - 1);
    cap.appendChild(strong);
    cap.appendChild(dim);
    figure.appendChild(cap);

    var wrap = document.createElement("div");
    wrap.className = "chart-plot";

    var total = values.reduce(function (a, b) { return a + b; }, 0);
    var svg = svgEl("svg", {
      viewBox: "0 0 " + VB_W + " " + VB_H,
      class: "chart-svg",
      role: "img",
      tabindex: "0",
      "aria-label": meta.label + ": " + meta.unit + " per day over the last " + values.length +
        " days, " + total.toLocaleString() + " total. Latest day " +
        values[values.length - 1].toLocaleString() + ".",
    });

    /* Gridlines and their ticks are recessive — hairline, one step off the surface. */
    [0, top / 2, top].forEach(function (tick) {
      svg.appendChild(svgEl("line", {
        x1: PAD_L, x2: VB_W - PAD_R, y1: y(tick), y2: y(tick), class: "chart-grid",
      }));
      var t = svgEl("text", { x: PAD_L - 8, y: y(tick) + 4, class: "chart-tick" });
      /* A tick label must state where its line actually sits: rounding 2400 to "2k"
         or the 2.5 midpoint to "3" prints a number the gridline does not mark. */
      t.textContent = tick >= 1000
        ? (tick / 1000).toFixed(tick % 1000 ? 1 : 0) + "k"
        : tick % 1 ? tick.toFixed(1) : String(tick);
      svg.appendChild(t);
    });

    var line = values.map(function (v, i) { return (i ? "L" : "M") + x(i) + " " + y(v); }).join(" ");
    svg.appendChild(svgEl("path", {
      d: line + " L" + x(values.length - 1) + " " + y(0) + " L" + x(0) + " " + y(0) + " Z",
      fill: meta.color, "fill-opacity": ".1", stroke: "none",
    }));
    svg.appendChild(svgEl("path", { d: line, class: "chart-line", stroke: meta.color }));

    /* End dot carries a surface-coloured ring so it stays legible over the line. */
    var last = values.length - 1;
    svg.appendChild(svgEl("circle", {
      cx: x(last), cy: y(values[last]), r: 4.5, fill: meta.color, class: "chart-dot",
    }));

    [[0, "start"], [last, "end"]].forEach(function (pair) {
      var t = svgEl("text", {
        x: pair[0] === 0 ? PAD_L : VB_W - PAD_R,
        y: VB_H - 8, class: "chart-xlabel", "text-anchor": pair[1],
      });
      t.textContent = dayLabel(series.from, offset + pair[0]);
      svg.appendChild(t);
    });

    var cross = svgEl("line", { class: "chart-cross", y1: PAD_T, y2: VB_H - PAD_B });
    var hoverDot = svgEl("circle", { r: 4.5, fill: meta.color, class: "chart-dot chart-hover-dot" });
    svg.appendChild(cross);
    svg.appendChild(hoverDot);

    wrap.appendChild(svg);

    var tip = document.createElement("div");
    tip.className = "chart-tip";
    tip.setAttribute("role", "status");
    wrap.appendChild(tip);
    figure.appendChild(wrap);

    /* The crosshair snaps to the nearest day, so the reader aims at a date rather
       than at a 2px line — and keyboard arrows walk the same positions. */
    var active = -1;
    function show(i) {
      if (i < 0 || i >= values.length || i === active) return;
      active = i;
      cross.setAttribute("x1", x(i));
      cross.setAttribute("x2", x(i));
      hoverDot.setAttribute("cx", x(i));
      hoverDot.setAttribute("cy", y(values[i]));
      svg.classList.add("is-hovered");
      tip.textContent = "";
      var val = document.createElement("b");
      val.textContent = values[i].toLocaleString() + " " + meta.unit;
      var day = document.createElement("span");
      day.textContent = dayLabel(series.from, offset + i);
      tip.appendChild(val);
      tip.appendChild(day);
      /* Show first, then measure: a centred tooltip on the first or last day would
         hang off the card, so clamp it to the plot once its real width is known. */
      tip.classList.add("is-on");
      var wrapW = wrap.clientWidth;
      var half = tip.offsetWidth / 2;
      var px = (x(i) / VB_W) * wrapW;
      tip.style.left = Math.max(half, Math.min(wrapW - half, px)) + "px";
    }
    function hide() {
      active = -1;
      svg.classList.remove("is-hovered");
      tip.classList.remove("is-on");
    }
    /* Clamp rather than reject: the pointer spends real time in the y-label gutter
       and past the last point, and mapping those to no-index left the first and last
       day unreadable while the tooltip kept showing a stale one. */
    function nearest(evt) {
      var box = svg.getBoundingClientRect();
      var vx = ((evt.clientX - box.left) / box.width) * VB_W;
      var i = Math.round(((vx - PAD_L) / innerW) * (values.length - 1));
      return Math.max(0, Math.min(values.length - 1, i));
    }
    svg.addEventListener("pointermove", function (e) { show(nearest(e)); });
    svg.addEventListener("pointerleave", hide);
    svg.addEventListener("blur", hide);
    svg.addEventListener("focus", function () { show(values.length - 1); });
    svg.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      show(Math.min(values.length - 1, Math.max(0, (active < 0 ? values.length - 1 : active) +
        (e.key === "ArrowRight" ? 1 : -1))));
    });

  }

  function renderTraffic(stats) {
    var panel = document.querySelector("[data-traffic]");
    if (!panel) return;
    /* A product with no usable series hides its own figure rather than leaving an
       empty grid cell; if none have one, the whole panel stays hidden. */
    var figures = [].slice.call(panel.querySelectorAll("[data-chart]")).filter(function (f) {
      var s = stats[f.getAttribute("data-chart")];
      var ok = !!(s && s.series && s.series.values && s.series.values.length > 1);
      f.hidden = !ok;
      return ok;
    });
    if (!figures.length) return;
    if (figures.length === 1) panel.querySelector(".traffic-charts").style.gridTemplateColumns = "1fr";

    var range = 30;
    var paint = function () {
      figures.forEach(function (f) {
        var key = f.getAttribute("data-chart");
        drawChart(f, key, stats[key].series, range);
      });
    };
    paint();
    panel.hidden = false;

    panel.querySelectorAll(".range-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        range = Number(btn.getAttribute("data-range"));
        panel.querySelectorAll(".range-btn").forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-on", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        paint();
      });
    });
  }

  /* ---------- footer year ---------- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
