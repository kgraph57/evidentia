/* Copy for install. Scroll draws the protocol. No typing. No replay. */
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

  var ink = null;
  if (gates) {
    ink = document.createElement("span");
    ink.className = "rail-ink";
    ink.setAttribute("aria-hidden", "true");
    gates.appendChild(ink);
  }

  function onStep(li, vis) {
    if (vis) li.classList.add("is-on");
    if (gates) {
      var loopOn = steps.some(function (s) {
        return s.classList.contains("loop-z") && s.classList.contains("is-on");
      });
      gates.classList.toggle("is-loop", loopOn);
    }
    paintRail();
  }

  if (reduce) {
    steps.forEach(function (li) { li.classList.add("is-on"); });
    blocks.forEach(function (b) { b.classList.add("is-on"); });
    if (gates) gates.classList.add("is-loop");
    paintRail();
    return;
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-on");
        if (e.target.parentElement === gates) onStep(e.target, true);
      });
    }, { threshold: 0.28, rootMargin: "0px 0px -12% 0px" });
    steps.forEach(function (li) { io.observe(li); });
    blocks.forEach(function (b) { io.observe(b); });
  } else {
    steps.forEach(function (li) { li.classList.add("is-on"); });
    blocks.forEach(function (b) { b.classList.add("is-on"); });
    if (gates) gates.classList.add("is-loop");
  }

  window.addEventListener("resize", paintRail);
})();
