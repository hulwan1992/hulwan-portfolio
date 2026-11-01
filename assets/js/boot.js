/* Runs before the stylesheet: enables the reveal styles only when JS is available. */
document.documentElement.classList.add("js");
window.setTimeout(function () {
  if (!window.__portfolioReady) document.documentElement.classList.remove("js");
}, 2500);
