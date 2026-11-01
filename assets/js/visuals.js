/* ============================================================
   Point-cloud visuals
   Procedural LiDAR-style scenes for the hero and case-study cards.
   No external libraries. Illustrative only.
   ============================================================ */

(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TAU = Math.PI * 2;

  var COLORS = {
    0: [198, 242, 78],   // laser lime
    1: [234, 246, 214],  // pale
    2: [104, 230, 196],  // scan teal
    3: [176, 220, 205],  // ice
    4: [150, 182, 130]   // dim olive
  };

  /* ---------------- deterministic random ---------------- */

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- geometry ---------------- */

  function pt(x, y, z, tone, alpha, size) {
    return { x: x, y: y, z: z, c: tone, a: alpha, s: size };
  }

  function addLine(out, rand, x0, y0, z0, x1, y1, z1, count, tone, alpha, size) {
    for (var i = 0; i <= count; i++) {
      var t = i / count;
      out.push(pt(
        x0 + (x1 - x0) * t,
        y0 + (y1 - y0) * t,
        z0 + (z1 - z0) * t,
        tone,
        alpha + rand() * 0.12,
        size
      ));
    }
  }

  function addTerrain(out, rand, n, amp, spread, tone) {
    spread = spread || 1.15;
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
        var x = (i / (n - 1) - 0.5) * 2 * spread;
        var z = (j / (n - 1) - 0.5) * 2 * spread;
        var y = Math.sin(x * 2.1) * Math.cos(z * 1.6) * amp +
          Math.sin((x + z) * 3.9) * amp * 0.35 - 0.02;
        out.push(pt(x, y, z, rand() < 0.1 ? 2 : (tone || 0), 0.2 + rand() * 0.28, 0.75 + rand() * 0.6));
      }
    }
  }

  function addTree(out, rand, cx, cz, canopyY, rad) {
    var trunkTop = canopyY - rad * 0.45;
    for (var i = 0; i < 7; i++) {
      var y = (i / 6) * trunkTop;
      out.push(pt(cx + (rand() - 0.5) * 0.014, y, cz + (rand() - 0.5) * 0.014, 4, 0.3, 0.9));
    }
    var N = 64;
    for (var k = 0; k < N; k++) {
      var t = (k + 0.5) / N;
      var phi = Math.acos(1 - 2 * t);
      var theta = Math.PI * (1 + Math.sqrt(5)) * k;
      var rr = rad * (0.72 + rand() * 0.42);
      var x = Math.sin(phi) * Math.cos(theta) * rr;
      var yy = Math.cos(phi) * rr * 0.92;
      var z = Math.sin(phi) * Math.sin(theta) * rr;
      out.push(pt(
        cx + x, canopyY + yy, cz + z,
        rand() < 0.2 ? 2 : (rand() < 0.1 ? 1 : 0),
        0.32 + rand() * 0.34,
        0.75 + rand() * 0.9
      ));
    }
  }

  function addBox(out, rand, cx, cz, w, d, h, step, tone, baseY) {
    baseY = baseY || 0;
    var nx = Math.max(3, Math.round(w / step));
    var nz = Math.max(3, Math.round(d / step));
    var ny = Math.max(2, Math.round(h / step));
    var i, j;
    // roof
    for (i = 0; i < nx; i++) {
      for (j = 0; j < nz; j++) {
        out.push(pt(
          cx - w / 2 + (i / (nx - 1)) * w,
          baseY + h,
          cz - d / 2 + (j / (nz - 1)) * d,
          tone, 0.22 + rand() * 0.25, 0.8
        ));
      }
    }
    // x-facing walls
    for (i = 0; i < nx; i++) {
      for (j = 0; j < ny; j++) {
        var x = cx - w / 2 + (i / (nx - 1)) * w;
        var y = baseY + (j / ny) * h;
        out.push(pt(x, y, cz - d / 2, tone, 0.18 + rand() * 0.2, 0.8));
        out.push(pt(x, y, cz + d / 2, tone, 0.18 + rand() * 0.2, 0.8));
      }
    }
    // z-facing walls
    for (i = 0; i < nz; i++) {
      for (j = 0; j < ny; j++) {
        var z = cz - d / 2 + (i / (nz - 1)) * d;
        var y2 = baseY + (j / ny) * h;
        out.push(pt(cx - w / 2, y2, z, tone, 0.18 + rand() * 0.2, 0.8));
        out.push(pt(cx + w / 2, y2, z, tone, 0.18 + rand() * 0.2, 0.8));
      }
    }
  }

  function addCyl(out, rand, cx, cz, r, y0, y1, levels, seg, tone, alpha) {
    for (var l = 0; l <= levels; l++) {
      var y = y0 + (y1 - y0) * (l / levels);
      for (var s = 0; s < seg; s++) {
        var a = (s / seg) * TAU;
        out.push(pt(
          cx + Math.cos(a) * r, y, cz + Math.sin(a) * r,
          tone, (alpha || 0.3) + rand() * 0.26, 0.8 + rand() * 0.3
        ));
      }
    }
  }

  function addRing(out, rand, cx, y, cz, r, seg, tone, alpha) {
    for (var s = 0; s < seg; s++) {
      var a = (s / seg) * TAU;
      out.push(pt(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r, tone, alpha, 0.85));
    }
  }

  function insidePoly(px, pz, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], zi = poly[i][1];
      var xj = poly[j][0], zj = poly[j][1];
      if ((zi > pz) !== (zj > pz) && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  }

  /* ---------------- scenes ---------------- */

  function addCanopySphere(out, r, cx, cy, cz, rad, n) {
    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n;
      var phi = Math.acos(1 - 2 * t);
      var theta = Math.PI * (1 + Math.sqrt(5)) * i;
      var rr = rad * (0.74 + r() * 0.34);
      out.push(pt(
        cx + Math.sin(phi) * Math.cos(theta) * rr,
        cy + Math.cos(phi) * rr * 0.9,
        cz + Math.sin(phi) * Math.sin(theta) * rr,
        r() < 0.12 ? 2 : (r() < 0.06 ? 1 : 0),
        0.5 + r() * 0.3,
        0.8 + r() * 0.6
      ));
    }
  }

  function addHeroTree(out, r, cx, cz, scale) {
    var trunkTop = 0.64 * scale;
    var baseR = 0.052 * scale;
    for (var l = 0; l <= 28; l++) {
      var y = (l / 28) * trunkTop;
      var rad = baseR * (1 - 0.58 * (l / 28));
      for (var s = 0; s < 10; s++) {
        var a = (s / 10) * TAU + l * 0.31;
        out.push(pt(cx + Math.cos(a) * rad, y, cz + Math.sin(a) * rad, 4, 0.5, 0.85));
      }
    }
    for (var c = 0; c < 220; c++) {
      var cy = r() * trunkTop;
      var cr = baseR * (1 - 0.55 * (cy / trunkTop)) * Math.sqrt(r());
      var ca = r() * TAU;
      out.push(pt(cx + Math.cos(ca) * cr, cy, cz + Math.sin(ca) * cr, 4, 0.45, 0.85));
    }
    var branches = [
      [-0.42, 0.18, 0.64], [0.42, 0.05, 0.68], [-0.1, -0.4, 0.72],
      [0.26, 0.36, 0.75], [-0.3, -0.26, 0.8], [0.06, 0.44, 0.66], [-0.46, -0.08, 0.7]
    ];
    branches.forEach(function (b) {
      addLine(out, r, cx, trunkTop * 0.72, cz, cx + b[0] * scale, b[2] * scale, cz + b[1] * scale, 22, 4, 0.38, 0.8);
    });
    var lobes = [
      [0, 0.8, 0, 0.31], [-0.36, 0.76, 0.02, 0.24], [0.34, 0.79, -0.03, 0.25],
      [0.02, 0.94, 0.12, 0.22], [0.12, 0.84, -0.32, 0.21], [-0.18, 0.96, -0.1, 0.18],
      [0.28, 0.68, 0.22, 0.19], [-0.3, 0.66, -0.18, 0.18], [0, 0.6, 0.04, 0.17]
    ];
    lobes.forEach(function (lb) {
      addCanopySphere(out, r, cx + lb[0] * scale, lb[1] * scale, cz + lb[2] * scale, lb[3] * scale, 260);
    });
    // interior foliage points to fill the crown
    for (var f = 0; f < 900; f++) {
      var ang = r() * TAU;
      var radius = Math.sqrt(r()) * 0.58;
      var yy = 0.58 + r() * 0.42;
      var taper = Math.sqrt(Math.max(0.05, 1 - Math.pow((yy - 0.79) / 0.27, 2)));
      out.push(pt(
        cx + Math.cos(ang) * radius * taper,
        yy * scale,
        cz + Math.sin(ang) * radius * taper * 0.8,
        r() < 0.08 ? 2 : 0,
        0.22 + r() * 0.22,
        0.6 + r() * 0.4
      ));
    }
  }

  function sceneCanopy() {
    var r = mulberry32(11);
    var out = [];
    // scan plate: concentric rings and a soft scatter of ground returns
    [0.16, 0.3, 0.46, 0.64, 0.84, 1.06, 1.32].forEach(function (rad, idx) {
      var count = 34 + idx * 9;
      for (var i = 0; i < count; i++) {
        var a = (i / count) * TAU + idx * 0.12;
        out.push(pt(Math.cos(a) * rad, 0.002 + r() * 0.004, Math.sin(a) * rad, idx < 3 ? 0 : 4, 0.22 - idx * 0.018, 0.72));
      }
    });
    for (var g = 0; g < 320; g++) {
      var ang = r() * TAU;
      var rad = 0.14 + Math.sqrt(r()) * 1.25;
      out.push(pt(Math.cos(ang) * rad, 0.001, Math.sin(ang) * rad, 0, 0.08 + r() * 0.12, 0.7));
    }
    addHeroTree(out, r, 0, 0, 1);
    return out;
  }

  function sceneRefinery() {
    var r = mulberry32(23);
    var out = [];
    addTerrain(out, r, 27, 0.025);
    // process pad
    for (var i = 0; i < 26; i++) {
      for (var j = 0; j < 16; j++) {
        out.push(pt(-0.72 + (i / 25) * 1.5, 0.002, -0.5 + (j / 15) * 0.9, 0, 0.12, 0.7));
      }
    }
    // distillation columns
    var cols = [[-0.5, 0.1, 0.62, 0.032], [-0.26, -0.16, 0.74, 0.028], [-0.02, 0.14, 0.52, 0.034]];
    cols.forEach(function (c) {
      addCyl(out, r, c[0], c[1], c[3], 0, c[2], 22, 8, 0, 0.3);
      addRing(out, r, c[0], c[2] * 0.55, c[1], c[3] * 1.7, 14, 1, 0.4);
      addRing(out, r, c[0], c[2] * 0.78, c[1], c[3] * 1.7, 14, 1, 0.35);
    });
    // flare stack
    addCyl(out, r, 0.58, 0.4, 0.009, 0, 0.94, 26, 5, 1, 0.35);
    addRing(out, r, 0.58, 0.94, 0.4, 0.024, 10, 0, 0.6);

    // horizontal storage tanks
    [[0.34, 0.43, 0.065, 0.24], [0.5, 0.44, 0.065, 0.24], [0.66, 0.43, 0.055, 0.2]].forEach(function (t) {
      var cx = t[0], cz = t[1], rad = t[2], len = t[3];
      for (var k = 0; k <= 9; k++) {
        var x = cx - len / 2 + (len * k) / 9;
        for (var s = 0; s < 10; s++) {
          var a = (s / 10) * TAU;
          out.push(pt(x, 0.11 + Math.cos(a) * rad, cz + Math.sin(a) * rad, 0, 0.24 + r() * 0.22, 0.8));
        }
      }
      addLine(out, r, cx - len / 2, 0.02, cz, cx - len / 2, 0.1, cz, 5, 4, 0.2, 0.8);
      addLine(out, r, cx + len / 2, 0.02, cz, cx + len / 2, 0.1, cz, 5, 4, 0.2, 0.8);
    });

    // pipe rack along x
    [0.12, 0.19, 0.26].forEach(function (h) {
      addLine(out, r, -0.7, h, 0.38, 0.72, h, 0.38, 90, 0, 0.22, 0.72);
    });
    for (var p = -0.7; p < 0.75; p += 0.19) {
      addLine(out, r, p, 0, 0.38, p, 0.26, 0.38, 8, 4, 0.18, 0.8);
    }
    addBox(out, r, -0.5, 0.48, 0.16, 0.12, 0.16, 0.03, 1);
    return out;
  }

  function sceneHeritage() {
    var r = mulberry32(41);
    var out = [];
    var wallZ = -0.08;

    // facade wall with three arched openings
    for (var i = 0; i < 46; i++) {
      var x = -0.58 + (i / 45) * 1.16;
      for (var j = 0; j < 32; j++) {
        var y = (j / 31) * 0.5;
        var open = false;
        [-0.3, 0, 0.3].forEach(function (cx) {
          var dx = Math.abs(x - cx);
          if (dx < 0.085) {
            if (y < 0.18) open = true;
            else if (y < 0.265 && dx * dx + (y - 0.18) * (y - 0.18) < 0.085 * 0.085) open = true;
          }
        });
        if (!open) out.push(pt(x, y, wallZ + (r() - 0.5) * 0.012, 0, 0.16 + r() * 0.2, 0.8));
      }
    }

    // arch edges
    [-0.3, 0, 0.3].forEach(function (cx) {
      for (var a = 0; a <= 18; a++) {
        var ang = Math.PI - (a / 18) * Math.PI;
        out.push(pt(cx + Math.cos(ang) * 0.085, 0.18 + Math.sin(ang) * 0.085, wallZ + 0.005, 1, 0.5, 0.85));
      }
      addLine(out, r, cx - 0.085, 0, wallZ + 0.005, cx - 0.085, 0.18, wallZ + 0.005, 8, 1, 0.4, 0.8);
      addLine(out, r, cx + 0.085, 0, wallZ + 0.005, cx + 0.085, 0.18, wallZ + 0.005, 8, 1, 0.4, 0.8);
    });

    // columns
    [-0.45, -0.15, 0.15, 0.45].forEach(function (cx) {
      addCyl(out, r, cx, 0.02, 0.03, 0.02, 0.47, 15, 9, 0, 0.28);
      addBox(out, r, cx, 0.02, 0.085, 0.085, 0.03, 0.02, 1, 0);
      addBox(out, r, cx, 0.02, 0.075, 0.075, 0.03, 0.02, 1, 0.47);
    });

    // entablature
    for (var ex = -0.62; ex <= 0.62; ex += 0.035) {
      for (var ey = 0.49; ey <= 0.56; ey += 0.018) {
        out.push(pt(ex, ey, 0.01, 1, 0.22 + r() * 0.2, 0.8));
        out.push(pt(ex, ey, wallZ, 1, 0.18, 0.8));
      }
    }

    // pediment
    addLine(out, r, -0.66, 0.56, 0.0, 0, 0.8, 0.0, 46, 1, 0.42, 0.9);
    addLine(out, r, 0, 0.8, 0.0, 0.66, 0.56, 0.0, 46, 1, 0.42, 0.9);
    addLine(out, r, -0.66, 0.56, 0.0, 0.66, 0.56, 0.0, 40, 1, 0.35, 0.9);
    for (var px = -0.58; px <= 0.58; px += 0.04) {
      var top = 0.56 + (1 - Math.abs(px) / 0.66) * 0.24;
      for (var py = 0.57; py < top - 0.02; py += 0.035) {
        out.push(pt(px, py, -0.01, 0, 0.18, 0.8));
      }
    }

    // steps and stylobate
    for (var s = 0; s < 3; s++) {
      addLine(out, r, -0.68, 0.005 + s * 0.008, 0.16 + s * 0.02, 0.68, 0.005 + s * 0.008, 0.16 + s * 0.02, 42, 1, 0.3, 0.8);
    }
    addLine(out, r, -0.6, 0.02, 0.01, -0.6, 0.02, -0.14, 6, 4, 0.2, 0.8);
    addLine(out, r, 0.6, 0.02, 0.01, 0.6, 0.02, -0.14, 6, 4, 0.2, 0.8);

    // side depth
    for (var d = 0; d < 8; d++) {
      out.push(pt(-0.6, 0.02 + d * 0.06, -0.1, 4, 0.18, 0.8));
      out.push(pt(0.6, 0.02 + d * 0.06, -0.1, 4, 0.18, 0.8));
    }

    return out;
  }

  function sceneMunicipal() {
    var r = mulberry32(57);
    var out = [];
    addTerrain(out, r, 28, 0.018);
    // road network
    var roadsX = [-0.72, -0.28, 0.18, 0.64];
    var roadsZ = [-0.62, -0.12, 0.42];
    roadsX.forEach(function (x) {
      [-0.028, 0.028].forEach(function (off) {
        for (var i = 0; i < 66; i++) {
          out.push(pt(x + off, 0.006, -1.1 + (i / 65) * 2.2, 1, 0.22, 0.7));
        }
      });
    });
    roadsZ.forEach(function (z) {
      [-0.028, 0.028].forEach(function (off) {
        for (var i = 0; i < 66; i++) {
          out.push(pt(-1.1 + (i / 65) * 2.2, 0.006, z + off, 1, 0.22, 0.7));
        }
      });
    });
    // parcel boundaries
    for (var p = 0; p < 20; p++) {
      var cx = (r() * 2 - 1) * 0.82;
      var cz = (r() * 2 - 1) * 0.82;
      var w = 0.07 + r() * 0.17;
      var d = 0.07 + r() * 0.14;
      addLine(out, r, cx - w, 0.01, cz - d, cx + w, 0.01, cz - d, 12, 0, 0.3, 0.7);
      addLine(out, r, cx + w, 0.01, cz - d, cx + w, 0.01, cz + d, 12, 0, 0.3, 0.7);
      addLine(out, r, cx + w, 0.01, cz + d, cx - w, 0.01, cz + d, 12, 0, 0.3, 0.7);
      addLine(out, r, cx - w, 0.01, cz + d, cx - w, 0.01, cz - d, 12, 0, 0.3, 0.7);
    }
    // blocks
    for (var b = 0; b < 7; b++) {
      addBox(out, r, (r() * 2 - 1) * 0.7, (r() * 2 - 1) * 0.7, 0.07 + r() * 0.07, 0.06 + r() * 0.06, 0.07 + r() * 0.13, 0.025, 1);
    }
    // asset markers
    for (var a = 0; a < 16; a++) {
      var ax = (r() * 2 - 1) * 0.85;
      var az = (r() * 2 - 1) * 0.85;
      addLine(out, r, ax, 0, az, ax, 0.055, az, 3, 2, 0.45, 0.8);
      out.push(pt(ax, 0.06, az, 2, 0.8, 1.6));
    }
    return out;
  }

  function sceneVessel() {
    var r = mulberry32(73);
    var out = [];
    // water
    for (var i = 0; i < 24; i++) {
      for (var j = 0; j < 24; j++) {
        var x = -1.1 + (i / 23) * 2.2;
        var z = -1.05 + (j / 23) * 2.1;
        out.push(pt(x, -0.15 + Math.sin(x * 5 + z * 3) * 0.004, z, 3, 0.09 + r() * 0.08, 0.7));
      }
    }
    var hull = [
      [-0.62, -0.2], [-0.44, -0.24], [0.4, -0.24],
      [0.64, 0], [0.4, 0.24], [-0.44, 0.24], [-0.62, 0.2]
    ];
    // hull sides
    for (var e = 0; e < hull.length; e++) {
      var a = hull[e], b = hull[(e + 1) % hull.length];
      for (var s = 0; s < 5; s++) {
        var t = s / 4;
        var px = a[0] + (b[0] - a[0]) * t;
        var pz = a[1] + (b[1] - a[1]) * t;
        for (var y = -0.13; y <= 0; y += 0.022) {
          out.push(pt(px, y, pz, 2, 0.34 + r() * 0.24, 0.85));
        }
      }
    }
    // deck
    for (var d = 0; d < 620; d++) {
      var dx = -0.63 + r() * 1.28;
      var dz = -0.25 + r() * 0.5;
      if (insidePoly(dx, dz, hull)) out.push(pt(dx, 0, dz, 0, 0.24 + r() * 0.22, 0.75));
    }
    // deck edge highlight
    for (var he = 0; he < hull.length; he++) {
      var ha = hull[he], hb = hull[(he + 1) % hull.length];
      addLine(out, r, ha[0], 0.002, ha[1], hb[0], 0.002, hb[1], 26, 1, 0.4, 0.85);
    }
    // cargo tank coamings
    [-0.26, 0.06, 0.36].forEach(function (cx) {
      addRing(out, r, cx, 0.006, 0, 0.075, 22, 1, 0.42);
      addCyl(out, r, cx, 0, 0.062, 0.004, 0.028, 2, 16, 0, 0.25);
    });
    // deck structures
    addBox(out, r, -0.5, 0.09, 0.06, 0.06, 0.1, 0.02, 1);
    addBox(out, r, 0.52, -0.06, 0.05, 0.05, 0.06, 0.02, 1);
    // waterline accent
    for (var w = 0; w < 40; w++) {
      var wx = -0.66 + (w / 39) * 1.34;
      out.push(pt(wx, -0.135, -0.245, 1, 0.28, 0.75));
      out.push(pt(wx, -0.135, 0.245, 1, 0.28, 0.75));
    }
    return out;
  }

  function sceneUav() {
    var r = mulberry32(91);
    var out = [];
    addTerrain(out, r, 26, 0.04);
    for (var t = 0; t < 9; t++) {
      addTree(out, r, (r() * 2 - 1) * 0.9, (r() * 2 - 1) * 0.75, 0.26 + r() * 0.14, 0.09 + r() * 0.05);
    }
    addBox(out, r, -0.45, -0.3, 0.18, 0.14, 0.32, 0.03, 1);
    addBox(out, r, 0.5, 0.34, 0.14, 0.12, 0.22, 0.03, 1);

    // high flight path
    for (var i = 0; i <= 300; i++) {
      var a = (i / 300) * TAU * 1.15;
      out.push(pt(
        Math.sin(a * 1.1) * 0.55,
        0.54 + Math.sin(a * 2.3) * 0.1,
        Math.cos(a * 0.9) * 0.48,
        i % 9 === 0 ? 2 : 1,
        0.32 + r() * 0.2,
        0.7
      ));
    }
    // lower inspection path
    for (var k = 0; k <= 140; k++) {
      var aa = (k / 140) * TAU;
      out.push(pt(
        Math.sin(aa) * 0.66,
        0.32 + Math.sin(aa * 2) * 0.05,
        Math.cos(aa * 1.2) * 0.55,
        2, 0.28, 0.7
      ));
    }
    // waypoints and corridor drops
    [[-0.5, 0.6, 0.12], [0.12, 0.62, -0.48], [0.56, 0.55, 0.1]].forEach(function (w) {
      out.push(pt(w[0], w[1], w[2], 1, 0.95, 2.4));
      addLine(out, r, w[0], 0.02, w[2], w[0], w[1] - 0.03, w[2], 14, 2, 0.1, 0.6);
    });
    return out;
  }

  var SCENES = {
    canopy: { points: null, build: sceneCanopy, cam: { yaw: 0.55, pitch: 0.16, baseY: 0.85, zoom: 0.78 } },
    refinery: { points: null, build: sceneRefinery, cam: { yaw: -0.62, pitch: 0.26, baseY: 0.61, zoom: 1 } },
    heritage: { points: null, build: sceneHeritage, cam: { yaw: 0.62, pitch: 0.17, baseY: 0.62, zoom: 0.96 } },
    municipal: { points: null, build: sceneMunicipal, cam: { yaw: 0.32, pitch: 0.94, baseY: 0.6, zoom: 0.95 } },
    vessel: { points: null, build: sceneVessel, cam: { yaw: 0.85, pitch: 0.34, baseY: 0.63, zoom: 1.08 } },
    uav: { points: null, build: sceneUav, cam: { yaw: 0.42, pitch: 0.2, baseY: 0.64, zoom: 1 } }
  };

  function getScene(name) {
    var s = SCENES[name];
    if (!s) return [];
    if (!s.points) s.points = s.build();
    return s.points;
  }

  /* ---------------- camera + render ---------------- */

  function makeCam(w, h, o) {
    o = o || {};
    var scale = Math.min(Math.max(w, h) * 0.44, h * 0.92) * (o.zoom || 1);
    return {
      w: w,
      h: h,
      yaw: o.yaw || 0,
      pitch: o.pitch === undefined ? 0.3 : o.pitch,
      baseY: h * (o.baseY === undefined ? 0.6 : o.baseY),
      scale: scale
    };
  }

  function project(p, cam) {
    var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    var x1 = p.x * cy - p.z * sy;
    var z1 = p.x * sy + p.z * cy;
    var cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    var y2 = p.y * cp + z1 * sp;
    var z2 = -p.y * sp + z1 * cp;
    var k = 2.6 / (2.6 + z2 * 0.9);
    return {
      x: cam.w * 0.5 + x1 * k * cam.scale,
      y: cam.baseY - y2 * k * cam.scale,
      k: k
    };
  }

  function render(ctx, w, h, points, cam, opt) {
    opt = opt || {};
    ctx.clearRect(0, 0, w, h);

    var glow = ctx.createRadialGradient(w * 0.5, h * 0.6, 0, w * 0.5, h * 0.6, Math.max(w, h) * 0.7);
    glow.addColorStop(0, "rgba(198,242,78,0.05)");
    glow.addColorStop(0.55, "rgba(198,242,78,0.012)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w * 0.5, cam.baseY + h * 0.01);
    ctx.scale(1, 0.26);
    var ground = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.42);
    ground.addColorStop(0, "rgba(198,242,78,0.10)");
    ground.addColorStop(0.55, "rgba(198,242,78,0.03)");
    ground.addColorStop(1, "rgba(198,242,78,0)");
    ctx.fillStyle = ground;
    ctx.fillRect(-w, -w, w * 2, w * 2);
    ctx.restore();

    var scanX = opt.scanX;
    var band = w * 0.065;
    if (scanX != null) {
      var sg = ctx.createLinearGradient(scanX - band, 0, scanX + band, 0);
      sg.addColorStop(0, "rgba(198,242,78,0)");
      sg.addColorStop(0.5, "rgba(198,242,78,0.06)");
      sg.addColorStop(1, "rgba(198,242,78,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(scanX - band, 0, band * 2, h);
    }

    ctx.globalCompositeOperation = "lighter";
    var i, q, alpha, size, col, d, boost;
    for (i = 0; i < points.length; i++) {
      var p = points[i];
      q = project(p, cam);
      if (q.x < -24 || q.x > w + 24 || q.y < -24 || q.y > h + 24) continue;
      alpha = p.a * (0.55 + q.k * 0.5);
      size = Math.max(1, p.s * Math.min(1.8, q.k * 1.15));
      col = COLORS[p.c] || COLORS[0];

      if (scanX != null) {
        d = Math.abs(q.x - scanX);
        if (d < band) {
          boost = 1 - d / band;
          boost = boost * boost;
          ctx.fillStyle = "rgba(198,242,78," + (0.055 * boost * alpha).toFixed(3) + ")";
          ctx.fillRect(q.x - size * 1.8, q.y - size * 1.8, size * 4.6, size * 4.6);
          alpha = Math.min(1, alpha + boost * 0.4);
          size += boost * 0.75;
          col = [243, 255, 217];
        }
      }

      ctx.fillStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + alpha.toFixed(3) + ")";
      ctx.fillRect(q.x, q.y, size, size);
    }
    ctx.globalCompositeOperation = "source-over";

    var vg = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.78);
    vg.addColorStop(0, "rgba(4,7,5,0)");
    vg.addColorStop(1, "rgba(4,7,5,0.6)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  /* ---------------- hero ---------------- */

  function initHero() {
    var canvas = document.getElementById("pointcloud");
    var stage = document.getElementById("scanner-stage");
    if (!canvas || !stage) return;

    var points = getScene("canopy");
    var ctx = canvas.getContext("2d");
    var azEl = document.getElementById("hud-az");
    var treesEl = document.getElementById("hud-trees");
    var w = 0, h = 0, dpr = 1;
    var yaw = 0.55;
    var mouseX = 0, mouseY = 0, smoothX = 0, smoothY = 0;
    var raf = null, last = 0, start = 0, running = false, inView = true;
    var dragging = false, lastPX = 0, lastPY = 0, dragYaw = 0, dragPitch = 0;
    var scanHint = document.getElementById("scan-hint");

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = stage.clientWidth || 480;
      h = stage.clientHeight || 480;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(ctx, w, h, points, makeCam(w, h, { yaw: yaw, pitch: 0.12, baseY: 0.85, zoom: 1.36 }), {
        scanX: REDUCED ? w * 0.64 : null
      });
    }

    function updateHud(deg) {
      if (azEl) azEl.textContent = (deg % 360).toFixed(1) + "\u00B0";
    }

    function frame(now) {
      raf = null;
      if (!running) return;
      if (!start) start = now;
      if (!last) last = now;
      var dt = Math.min(64, now - last) / 1000;
      last = now;

      if (!dragging) yaw += dt * 0.075;
      smoothX += (mouseX - smoothX) * Math.min(1, dt * 3);
      smoothY += (mouseY - smoothY) * Math.min(1, dt * 3);

      var cy = yaw + dragYaw + smoothX * 0.09;
      var pitch = 0.12 + dragPitch + smoothY * 0.022;
      var phase = ((now - start) % 7600) / 7600;
      var scanX = (phase * 1.3 - 0.15) * w;

      render(ctx, w, h, points, makeCam(w, h, { yaw: cy, pitch: pitch, baseY: 0.85, zoom: 1.36 }), { scanX: scanX });
      updateHud(((cy * 180) / Math.PI + 360) % 360);
      raf = requestAnimationFrame(frame);
    }

    function play() {
      if (REDUCED || running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function pause() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) play(); else pause();
      }, { threshold: 0.05 }).observe(stage);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause();
      else if (inView) play();
    });

    stage.addEventListener("pointerdown", function (e) {
      if (REDUCED || e.pointerType === "touch") return;
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      lastPX = e.clientX;
      lastPY = e.clientY;
      mouseX = 0;
      mouseY = 0;
      stage.classList.add("is-dragging");
      if (stage.setPointerCapture) {
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      }
    });

    stage.addEventListener("pointermove", function (e) {
      if (dragging) {
        var dx = e.clientX - lastPX;
        var dy = e.clientY - lastPY;
        lastPX = e.clientX;
        lastPY = e.clientY;
        dragYaw += dx * 0.006;
        dragPitch = Math.max(-0.14, Math.min(0.2, dragPitch + dy * 0.0025));
        return;
      }
      var rect = stage.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      if (e && e.pointerId != null && stage.releasePointerCapture) {
        try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("pointerleave", function () {
      if (dragging) return;
      mouseX = 0;
      mouseY = 0;
    });

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(resize, 180);
    });

    resize();
    if (REDUCED) {
      updateHud(31.5);
      if (scanHint) scanHint.textContent = "";
    } else {
      play();
    }

    // trees readout
    if (treesEl) {
      if (REDUCED) {
        treesEl.textContent = "832,431";
      } else {
        var t0 = performance.now();
        var tick = function (now) {
          var p = Math.min(1, (now - t0) / 2100);
          var e = 1 - Math.pow(1 - p, 3);
          treesEl.textContent = Math.round(832431 * e).toLocaleString("en-US");
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }
  }

  /* ---------------- static canvases (cards + modal) ---------------- */

  function paint(canvas, name) {
    if (!canvas) return;
    var scene = getScene(name);
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    if (!w || !h) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var conf = SCENES[name] ? SCENES[name].cam : {};
    render(ctx, w, h, scene, makeCam(w, h, conf), { scanX: w * 0.66 });
  }

  function initCards() {
    var canvases = Array.prototype.slice.call(document.querySelectorAll("[data-scene]"));
    if (!canvases.length) return;

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            paint(entry.target, entry.target.getAttribute("data-scene"));
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "120px" });
      canvases.forEach(function (c) { io.observe(c); });
    } else {
      canvases.forEach(function (c) { paint(c, c.getAttribute("data-scene")); });
    }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        canvases.forEach(function (c) {
          if (c.closest("[hidden]")) return;
          paint(c, c.getAttribute("data-scene"));
        });
      }, 220);
    });
  }

  window.PortfolioVisuals = {
    paint: paint
  };

  function boot() {
    initHero();
    initCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
