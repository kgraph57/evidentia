/* Copy for install. Scroll draws the protocol. A token orbits 2→5→2, cap 3. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  function textOf(sel) {
    var el = document.querySelector(sel);
    if (!el) return "";
    return (el.innerText || el.textContent || "").replace(/\u00a0/g, " ").trim();
  }

  function fallback(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {}
    document.body.removeChild(ta);
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var idle = btn.getAttribute("data-idle") || "Copy";
    var doneLabel = btn.getAttribute("data-done") || "Copied";
    btn.addEventListener("click", function () {
      var text = textOf(btn.getAttribute("data-copy"));
      if (!text) return;
      function ok() {
        btn.textContent = doneLabel;
        window.setTimeout(function () {
          btn.textContent = idle;
        }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok).catch(function () {
          fallback(text, ok);
        });
      } else {
        fallback(text, ok);
      }
    });
  });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gates = document.querySelector(".gates");
  var steps = gates ? Array.prototype.slice.call(gates.querySelectorAll(":scope > li")) : [];
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".block"));
  var loopSteps = gates
    ? Array.prototype.slice.call(gates.querySelectorAll(".loop-a, .loop-m, .loop-z"))
    : [];
  var ink = null;
  var svg = null;
  var track = null;
  var token = null;
  var loopStarted = false;
  var raf = 0;
  var reenter = gates ? gates.querySelector(".reenter") : null;

  function paintRail() {
    if (!gates || !ink) return;
    var on = steps.filter(function (li) { return li.classList.contains("is-on"); });
    if (!on.length) {
      ink.style.height = "0px";
      return;
    }
    var last = on[on.length - 1];
    var n = last.querySelector(".n");
    var top = 10;
    var end = (n ? n.offsetTop : last.offsetTop) + (n ? n.offsetHeight / 2 : 16);
    ink.style.height = Math.max(0, end - top) + "px";
  }

  function loopPathD() {
    var a = gates.querySelector(".loop-a .n");
    var z = gates.querySelector(".loop-z .n");
    if (!a || !z) return "";
    var gr = gates.getBoundingClientRect();
    var ar = a.getBoundingClientRect();
    var zr = z.getBoundingClientRect();
    var x1 = ar.left - gr.left + ar.width / 2;
    var y1 = ar.top - gr.top + ar.height / 2;
    var y2 = zr.top - gr.top + zr.height / 2;
    var x2 = x1 + 44;
    var r = 8;
    return (
      "M " + x1 + " " + (y1 + r) +
      " L " + x1 + " " + (y2 - r) +
      " Q " + x1 + " " + y2 + " " + (x1 + r) + " " + y2 +
      " L " + (x2 - r) + " " + y2 +
      " Q " + x2 + " " + y2 + " " + x2 + " " + (y2 - r) +
      " L " + x2 + " " + (y1 + r) +
      " Q " + x2 + " " + y1 + " " + (x2 - r) + " " + y1 +
      " L " + (x1 + r) + " " + y1 +
      " Q " + x1 + " " + y1 + " " + x1 + " " + (y1 + r)
    );
  }

  function ensureLoop() {
    if (!gates || svg) return;
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "loop-svg");
    svg.setAttribute("aria-hidden", "true");
    track = document.createElementNS("http://www.w3.org/2000/svg", "path");
    track.setAttribute("class", "loop-track");
    token = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    token.setAttribute("class", "loop-token");
    token.setAttribute("r", "6");
    svg.appendChild(track);
    svg.appendChild(token);
    gates.appendChild(svg);
  }

  function layoutLoop() {
    if (!gates || !track) return;
    var w = Math.max(80, gates.offsetWidth);
    var h = Math.max(1, gates.offsetHeight);
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    var d = loopPathD();
    if (!d) return;
    track.setAttribute("d", d);
  }

  function setLap(n, done) {
    if (!reenter) return;
    if (done) {
      reenter.innerHTML = '<span class="arrow">loop</span> 3 / 3 · then 6';
      return;
    }
    reenter.innerHTML = '<span class="arrow">loop</span> ' + n + " / 3 · 5 → 2";
  }

  function markNow(pt) {
    var best = null;
    var bestD = 1e9;
    loopSteps.forEach(function (li) {
      var n = li.querySelector(".n");
      if (!n) return;
      var gr = gates.getBoundingClientRect();
      var r = n.getBoundingClientRect();
      var y = r.top - gr.top + r.height / 2;
      var d = Math.abs(y - pt.y);
      if (d < bestD) {
        bestD = d;
        best = li;
      }
    });
    loopSteps.forEach(function (li) {
      if (li === best) li.classList.add("is-now");
      else li.classList.remove("is-now");
    });
  }

  function place(len, dist) {
    if (!track || !token || !len) return;
    var pt = track.getPointAtLength(((dist % len) + len) % len);
    token.setAttribute("cx", pt.x);
    token.setAttribute("cy", pt.y);
    markNow(pt);
  }

  function startLoop() {
    if (!gates || loopStarted) return;
    loopStarted = true;
    ensureLoop();
    layoutLoop();
    gates.classList.add("is-loop");
    setLap(1, false);
    if (reduce) {
      gates.classList.add("is-loop-done");
      setLap(3, true);
      return;
    }
    var len = 0;
    try { len = track.getTotalLength(); } catch (e) { len = 0; }
    if (!len) return;
    var lapMs = 1600;
    var laps = 3;
    var t0 = null;
    place(len, 0);
    function frame(now) {
      if (!t0) t0 = now;
      var elapsed = now - t0;
      var total = lapMs * laps;
      if (elapsed >= total) {
        place(len, 0);
        setLap(3, true);
        gates.classList.add("is-loop-done");
        loopSteps.forEach(function (li) { li.classList.remove("is-now"); });
        var six = gates.querySelector("li:last-child .n");
        if (six && token) {
          var gr = gates.getBoundingClientRect();
          var r = six.getBoundingClientRect();
          token.setAttribute("cx", r.left - gr.left + r.width / 2);
          token.setAttribute("cy", r.top - gr.top + r.height / 2);
        }
        return;
      }
      var lap = Math.min(laps, Math.floor(elapsed / lapMs) + 1);
      setLap(lap, false);
      place(len, (elapsed / lapMs) * len);
      raf = window.requestAnimationFrame(frame);
    }
    raf = window.requestAnimationFrame(frame);
  }

  if (gates) {
    ink = document.createElement("span");
    ink.className = "rail-ink";
    ink.setAttribute("aria-hidden", "true");
    gates.appendChild(ink);
  }

  function onStep() {
    if (gates) {
      var loopOn = steps.some(function (s) {
        return s.classList.contains("loop-z") && s.classList.contains("is-on");
      });
      if (loopOn) startLoop();
    }
    paintRail();
  }

  if (reduce) {
    steps.forEach(function (li) { li.classList.add("is-on"); });
    blocks.forEach(function (b) { b.classList.add("is-on"); });
    startLoop();
    paintRail();
    return;
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-on");
        if (e.target.parentElement === gates) onStep();
      });
    }, { threshold: 0.28, rootMargin: "0px 0px -12% 0px" });
    steps.forEach(function (li) { io.observe(li); });
    blocks.forEach(function (b) { io.observe(b); });
  } else {
    steps.forEach(function (li) { li.classList.add("is-on"); });
    blocks.forEach(function (b) { b.classList.add("is-on"); });
    startLoop();
  }

  window.addEventListener("resize", function () {
    paintRail();
    if (svg) {
      layoutLoop();
      if (!raf && gates.classList.contains("is-loop-done")) {
        var six = gates.querySelector("li:last-child .n");
        if (six && token) {
          var gr = gates.getBoundingClientRect();
          var r = six.getBoundingClientRect();
          token.setAttribute("cx", r.left - gr.left + r.width / 2);
          token.setAttribute("cy", r.top - gr.top + r.height / 2);
        }
      }
    }
  });
})();
