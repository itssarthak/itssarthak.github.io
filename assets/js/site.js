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
      { cls: "t-cmd", html: '<span class="t-accent">»</span> currently: architecting a no-code AI agent platform @ Stashfin' },
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

  /* ---------- footer year ---------- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
