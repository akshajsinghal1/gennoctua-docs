(function () {
  var HEIGHT = "5rem";

  function injectGlobalCss() {
    if (document.getElementById("gennoctua-logo-size")) return;
    var s = document.createElement("style");
    s.id = "gennoctua-logo-size";
    s.textContent =
      "img[class*='nav-logo'],img.nav-logo,nav-logo img," +
      "#navbar img[src*='dark-theme'],#navbar img[src*='zclap-logo-light']," +
      "#mobile-nav img[src*='dark-theme'],#mobile-nav img[src*='zclap-logo-light']{" +
      "height:" +
      HEIGHT +
      "!important;width:auto!important;max-height:none!important}";
    document.head.appendChild(s);
  }

  function applyInline() {
    ["#navbar", "#mobile-nav"].forEach(function (rootSel) {
      var root = document.querySelector(rootSel);
      if (!root) return;
      root.querySelectorAll("img").forEach(function (img) {
        var cls = img.getAttribute("class") || "";
        var src = (img.getAttribute("src") || "").toLowerCase();
        var hit =
          cls.indexOf("nav-logo") !== -1 ||
          src.indexOf("dark-theme") !== -1 ||
          src.indexOf("zclap-logo-light") !== -1;
        if (!hit) return;
        img.style.setProperty("height", HEIGHT, "important");
        img.style.setProperty("width", "auto", "important");
        img.style.setProperty("max-height", "none", "important");
      });
    });
  }

  function run() {
    injectGlobalCss();
    applyInline();
  }

  var t;
  function debounced() {
    clearTimeout(t);
    t = setTimeout(run, 30);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  window.addEventListener("load", run);
  setTimeout(run, 400);
  setTimeout(run, 2000);

  try {
    new MutationObserver(debounced).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  } catch (e) {
    /* ignore */
  }
})();
