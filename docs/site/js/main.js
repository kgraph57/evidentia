/* Copy for the install block only. No typing. No replay. */
(function () {
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
})();
