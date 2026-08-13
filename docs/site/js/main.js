/* Copy for install. Scroll draws the protocol. The 5→2 path runs as a loop, cap 3. */
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
  var ink = null;
  var svg = null;
  var runPath = null;
  var trackPath = null;
  var loopStarted = false;
  var reenter = gates ? gates.querySelector(".reenter") : null;
  var reenterHome = reenter ? reenter.innerHTML : "";

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
    var x2 = Math.max(x1 + 40, gates.clientWidth - 24);
    return "M " + x1 + " " + y1 + " L " + x1 + " " + y2 + " L " + x2 + " " + y2 + " L " + x2 + " " + y1 + " Z";
  }

  function layoutLoop() {
    if (!gates || !runPath || !trackPath) return;
    var d = loopPathD();
    if (!d) return;
    trackPath.setAttribute("d", d);
    runPath.setAttribute("d", d);
    var len = 0;
    try { len = runPath.getTotalLength(); } catch (e) { len = 800; }
    runPath.style.setProperty("--len", String(len));
    runPath.style.strokeDasharray = "22 " + len;
  }

  function ensureLoopSvg() {
    if (!gates || svg) return;
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "loop-svg");
    svg.setAttribute("aria-hidden", "true");
    trackPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    trackPath.setAttribute("class", "loop-track");
    runPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    runPath.setAttribute("class", "loop-run");
    svg.appendChild(trackPath);
    svg.appendChild(runPath);
    gates.appendChild(svg);
  }

  function setLap(n, done) {
    if (!reenter) return;
    if (done) {
      reenter.innerHTML = '<span class="arrow">loop</span> 3 / 3 · then 6';
      return;
    }
    reenter.innerHTML = '<span class="arrow">loop</span> ' + n + " / 3 · 5 → 2";
  }

  function startLoop() {
    if (!gates || loopStarted || reduce) return;
    loopStarted = true;
    ensureLoopSvg();
    layoutLoop();
    gates.classList.add("is-loop");
    setLap(1, false);
    if (!runPath) return;
    var lap = 1;
    runPath.addEventListener("animationiteration", function () {
      lap += 1;
      if (lap <= 3) setLap(lap, false);
    });
    runPath.addEventListener("animationend", function () {
      setLap(3, true);
      gates.classList.add("is-loop-done");
    });
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
    if (gates) {
      ensureLoopSvg();
      layoutLoop();
      gates.classList.add("is-loop");
      gates.classList.add("is-loop-done");
    }
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
    layoutLoop();
  });
})();
