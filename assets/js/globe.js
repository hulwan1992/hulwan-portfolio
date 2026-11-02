/* Procedural dot-matrix globe for the Field coverage section.
   Orthographic projection on canvas 2D. No libraries, no network requests. */
(function () {
  "use strict";

  var canvas = document.getElementById("coverage-globe");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var stage = canvas.parentElement || canvas;
  var mql = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var TAU = Math.PI * 2;
  var D2R = Math.PI / 180;

  var NODES = [
    { name: "SINGAPORE", lon: 103.8, lat: 1.35, base: true,  dx: 12,  dy: 15,  anchor: "left"  },
    { name: "MALAYSIA",  lon: 101.7, lat: 3.10, base: false, dx: -12, dy: -9,  anchor: "right" },
    { name: "BRAZIL",    lon: -47.9, lat: -15.8, base: false, dx: -12, dy: 4,   anchor: "right" },
    { name: "AUSTRALIA", lon: 149.1, lat: -35.3, base: false, dx: -12, dy: 5,   anchor: "right" },
    { name: "EUROPE",    lon: 8.7,   lat: 50.1,  base: false, dx: 12,  dy: -7,  anchor: "left"  }
  ];

  var LAND = (window.GLOBE_LAND || []).map(function (p) {
    return {
      lon: p[0] * D2R,
      sinLat: Math.sin(p[1] * D2R),
      cosLat: Math.cos(p[1] * D2R)
    };
  });

  var nodes = NODES.map(function (n) {
    return {
      name: n.name,
      lon: n.lon,
      lat: n.lat,
      lonR: n.lon * D2R,
      sinLat: Math.sin(n.lat * D2R),
      cosLat: Math.cos(n.lat * D2R),
      base: n.base,
      dx: n.dx,
      dy: n.dy,
      anchor: n.anchor
    };
  });

  var arcs = [nodes[2], nodes[3], nodes[4]].map(function (target) {
    return makeArc(nodes[0], target);
  });

  var W = 0, H = 0, DPR = 1, R = 0, CX = 0, CY = 0;
  var yaw = 104 * D2R;
  var pitch = 10 * D2R;
  var auto = !(mql && mql.matches);
  var visible = false;
  var dragging = false;
  var raf = 0;
  var last = 0;
  var clock = 0;
  var resumeTimer = 0;
  var sinPitch = 0, cosPitch = 1;

  function makeArc(a, b) {
    var p1 = a.lat * D2R;
    var l1 = a.lonR;
    var p2 = b.lat * D2R;
    var l2 = b.lonR;
    var hav = Math.pow(Math.sin((p2 - p1) / 2), 2) +
      Math.cos(p1) * Math.cos(p2) * Math.pow(Math.sin((l2 - l1) / 2), 2);
    var d = 2 * Math.asin(Math.min(1, Math.sqrt(hav)));
    if (!isFinite(d) || d < 0.00001) return [];
    var pts = [];
    for (var i = 0; i <= 64; i++) {
      var t = i / 64;
      var A = Math.sin((1 - t) * d) / Math.sin(d);
      var B = Math.sin(t * d) / Math.sin(d);
      var x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
      var y = A * Math.sin(p1) + B * Math.sin(p2);
      var z = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
      var lat = Math.atan2(y, Math.sqrt(x * x + z * z));
      var lon = Math.atan2(z, x);
      pts.push({ lon: lon, sinLat: Math.sin(lat), cosLat: Math.cos(lat) });
    }
    return pts;
  }

  function project(lon, sinLat, cosLat) {
    var dl = lon - yaw;
    var cosDl = Math.cos(dl);
    var cosc = sinPitch * sinLat + cosPitch * cosLat * cosDl;
    if (cosc <= 0.002) return null;
    var x = cosLat * Math.sin(dl);
    var y = cosPitch * sinLat - sinPitch * cosLat * cosDl;
    return [CX + R * x, CY - R * y, cosc];
  }

  function drawSphere() {
    var glow = ctx.createRadialGradient(CX, CY, R * 0.78, CX, CY, R * 1.18);
    glow.addColorStop(0, "rgba(198,242,78,0)");
    glow.addColorStop(0.74, "rgba(198,242,78,0.05)");
    glow.addColorStop(1, "rgba(198,242,78,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(CX, CY, R * 1.18, 0, TAU); ctx.fill();

    var g = ctx.createRadialGradient(CX - R * 0.35, CY - R * 0.42, R * 0.08, CX, CY, R * 1.02);
    g.addColorStop(0, "#132019");
    g.addColorStop(0.5, "#0a120f");
    g.addColorStop(1, "#050807");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, TAU); ctx.fill();

    ctx.strokeStyle = "rgba(198,242,78,0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = "rgba(238,242,236,0.06)";
    ctx.beginPath(); ctx.arc(CX, CY, R * 0.99, 0, TAU); ctx.stroke();
  }

  function drawGraticule() {
    ctx.strokeStyle = "rgba(228,238,228,0.06)";
    ctx.lineWidth = 1;

    for (var lat = -60; lat <= 60; lat += 30) {
      var s = Math.sin(lat * D2R), c = Math.cos(lat * D2R);
      ctx.beginPath();
      var pen = false;
      for (var lon = -180; lon <= 180; lon += 3) {
        var q = project(lon * D2R, s, c);
        if (!q) { pen = false; continue; }
        if (!pen) { ctx.moveTo(q[0], q[1]); pen = true; }
        else ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke();
    }

    for (var lon2 = -180; lon2 < 180; lon2 += 30) {
      var lr = lon2 * D2R;
      ctx.beginPath();
      var pen2 = false;
      for (var lat2 = -80; lat2 <= 80; lat2 += 3) {
        var la = lat2 * D2R;
        var q2 = project(lr, Math.sin(la), Math.cos(la));
        if (!q2) { pen2 = false; continue; }
        if (!pen2) { ctx.moveTo(q2[0], q2[1]); pen2 = true; }
        else ctx.lineTo(q2[0], q2[1]);
      }
      ctx.stroke();
    }
  }

  function drawLand() {
    var buckets = [[], [], [], []];
    for (var i = 0; i < LAND.length; i++) {
      var p = LAND[i];
      var dl = p.lon - yaw;
      var cosDl = Math.cos(dl);
      var cosc = sinPitch * p.sinLat + cosPitch * p.cosLat * cosDl;
      if (cosc <= 0.02) continue;
      var x = CX + R * p.cosLat * Math.sin(dl);
      var y = CY - R * (cosPitch * p.sinLat - sinPitch * p.cosLat * cosDl);
      var b = Math.min(3, Math.max(0, Math.floor(cosc * 4.999)));
      buckets[b].push(x, y);
    }
    var alphas = [0.13, 0.22, 0.32, 0.44];
    for (var k = 0; k < 4; k++) {
      var arr = buckets[k];
      if (!arr.length) continue;
      ctx.fillStyle = "rgba(222,234,222," + alphas[k] + ")";
      ctx.beginPath();
      for (var j = 0; j < arr.length; j += 2) ctx.rect(arr[j], arr[j + 1], 1.35, 1.35);
      ctx.fill();
    }
  }

  function drawArcs() {
    ctx.save();
    ctx.strokeStyle = "rgba(198,242,78,0.30)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 7]);
    ctx.lineDashOffset = -((clock * 10) % 9);

    for (var a = 0; a < arcs.length; a++) {
      var arc = arcs[a];
      if (!arc.length) continue;
      ctx.beginPath();
      var pen = false;
      for (var i = 0; i < arc.length; i++) {
        var q = project(arc[i].lon, arc[i].sinLat, arc[i].cosLat);
        if (!q) { pen = false; continue; }
        if (!pen) { ctx.moveTo(q[0], q[1]); pen = true; }
        else ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(198,242,78,0.85)";
    for (var k = 0; k < arcs.length; k++) {
      var ar = arcs[k];
      if (!ar.length) continue;
      var idx = Math.floor(((clock * 0.07 + k * 0.29) % 1) * (ar.length - 1));
      var p = project(ar[idx].lon, ar[idx].sinLat, ar[idx].cosLat);
      if (p) {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 1.5, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawNodes() {
    var showLabels = W >= 440;

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var q = project(n.lonR, n.sinLat, n.cosLat);
      if (!q) continue;
      var x = q[0], y = q[1], depth = q[2];
      var rad = 2.4 + depth * 0.9;

      ctx.strokeStyle = n.base ? "rgba(198,242,78,0.7)" : "rgba(198,242,78,0.42)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, rad + 4.5, 0, TAU); ctx.stroke();

      if (n.base) {
        ctx.fillStyle = "#c6f24e";
        ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = "#080c0a";
        ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
        ctx.strokeStyle = "rgba(198,242,78,0.8)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.stroke();
      }

      if (!showLabels) continue;

      ctx.font = '500 10px "JetBrains Mono", "SFMono-Regular", Menlo, monospace';
      ctx.textBaseline = "middle";
      var align = n.anchor === "right" ? "right" : "left";
      ctx.textAlign = align;
      var tx = x + n.dx;
      var ty = y + n.dy;
      var tw = ctx.measureText(n.name).width;

      if (align === "right" && tx - tw < 6) { align = "left"; tx = x + 12; }
      else if (align === "left" && tx + tw > W - 6) { align = "right"; tx = x - 12; }

      ctx.textAlign = align;
      ty = Math.max(12, Math.min(H - 10, ty));
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(5,8,7,0.92)";
      ctx.strokeText(n.name, tx, ty);
      ctx.fillStyle = "rgba(228,236,228,0.92)";
      ctx.fillText(n.name, tx, ty);
    }
  }

  function draw() {
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    sinPitch = Math.sin(pitch);
    cosPitch = Math.cos(pitch);
    drawSphere();
    drawGraticule();
    drawLand();
    drawArcs();
    drawNodes();
  }

  function tick(now) {
    raf = 0;
    if (!visible || !auto) return;
    if (!last) last = now;
    var dt = Math.min(64, now - last);
    last = now;
    if (!dragging) {
      yaw += dt * 0.000035;
      if (yaw > Math.PI) yaw -= TAU;
    }
    clock = now / 1000;
    draw();
    if (auto && visible && !dragging) raf = requestAnimationFrame(tick);
  }

  function start() {
    if (!visible || !auto || raf) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    R = Math.min(W, H) * 0.405;
    CX = W / 2;
    CY = H / 2;
    clock = performance.now() / 1000;
    draw();
  }

  var lastX = 0, lastY = 0;

  canvas.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    stop();
    clearTimeout(resumeTimer);
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.classList.add("is-dragging");
    if (canvas.setPointerCapture) {
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    }
  });

  canvas.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    yaw -= dx * 0.006;
    pitch = Math.max(-1.0, Math.min(1.0, pitch - dy * 0.006));
    clock = performance.now() / 1000;
    draw();
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("is-dragging");
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () {
      if (visible && auto) start();
    }, 3200);
  }

  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("pointerleave", function () {
    if (dragging) endDrag();
  });

  if (mql) {
    var onMotionChange = function (e) {
      auto = !e.matches;
      if (auto) start();
      else { stop(); clock = performance.now() / 1000; draw(); }
    };
    if (mql.addEventListener) mql.addEventListener("change", onMotionChange);
    else if (mql.addListener) mql.addListener(onMotionChange);
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { resize(); }).observe(stage);
  } else {
    window.addEventListener("resize", resize);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        visible = entries[i].isIntersecting;
        if (visible) start(); else stop();
      }
    }, { threshold: 0.18 }).observe(stage);
  } else {
    visible = true;
    start();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (visible && auto) start();
  });

  resize();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (!raf) draw();
    });
  }
})();
