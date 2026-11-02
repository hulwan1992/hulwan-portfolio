/* Horizontal selected-work reel: arrows, edge states and progress. */
(function () {
  "use strict";

  var reel = document.getElementById("work-reel");
  if (!reel) return;

  var track = reel.querySelector(".reel__track");
  var prev = document.querySelector("[data-reel-prev]");
  var next = document.querySelector("[data-reel-next]");
  var bar = document.querySelector(".reel-progress span");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function gap() {
    if (!track) return 20;
    var styles = window.getComputedStyle(track);
    var g = parseFloat(styles.columnGap || styles.gap || "20");
    return isFinite(g) ? g : 20;
  }

  function step() {
    var card = reel.querySelector(".card");
    if (!card) return 360;
    return card.getBoundingClientRect().width + gap();
  }

  function update() {
    var max = reel.scrollWidth - reel.clientWidth;
    var progress = max > 0 ? Math.min(1, Math.max(0, reel.scrollLeft / max)) : 0;
    if (bar) bar.style.width = (progress * 100).toFixed(2) + "%";
    if (prev) prev.disabled = reel.scrollLeft <= 4;
    if (next) next.disabled = reel.scrollLeft >= max - 4;
  }

  function go(direction) {
    reel.scrollBy({
      left: direction * step(),
      behavior: reduce ? "auto" : "smooth"
    });
  }

  if (prev) prev.addEventListener("click", function () { go(-1); });
  if (next) next.addEventListener("click", function () { go(1); });
  reel.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  window.addEventListener("load", update, { once: true });
  update();
})();
