/* ============================================================
   Interface behaviour
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var doc = document;
  var body = doc.body;

  /* ---------------- case-study content ---------------- */

  var PROJECTS = {
    nparks: {
      scene: "canopy",
      tag: "LiDAR & AI",
      meta: "NParks Singapore · Arborise · 2023 — Now",
      title: "National tree & road network digital twin",
      intro: "A national tree and road-network dataset is only useful if every record is georeferenced, attributed and defensible. This programme turns mobile and terrestrial scans of Singapore's streets and parks into a managed digital twin used for tree and infrastructure decisions.",
      rows: [
        { label: "Brief", text: "Singapore's urban forest is mapped and maintained at national scale. NParks and Arborise-linked workstreams need current, high-confidence LiDAR data across managed areas — canopy, road corridors and associated assets." },
        { label: "My role", text: "Field Data Processing Lead. I plan and coordinate capture and processing, own QC and validation, and act as the link between field crews, validation, semantic-extraction (TSE) and software teams." },
        { label: "What I did", items: [
          "Planned and monitored mobile and terrestrial capture across managed areas",
          "Oversaw the semantic tree extraction (TSE) pipeline and validation workflow",
          "Coordinated field, validation, TSE and software teams through delivery",
          "Delivered training and workflow support for APAC partners and stakeholders"
        ] },
        { label: "Technical outputs", items: [
          "Validated national dataset — 832,000+ trees and ~3,500 km of road",
          "TSE classification, segmentation and attribute completeness",
          "QC reports and partner-facing workflow documentation"
        ] },
        { label: "Outcome", text: "Workflow performance improved by 40%. Delivery and QC were standardised across a national-scale dataset, with poor-GNSS and legacy-data issues resolved to keep continuity." }
      ],
      tags: ["Mobile LiDAR", "Terrestrial LiDAR", "Semantic extraction", "QC & validation", "Digital twin"]
    },
    refinery: {
      scene: "refinery",
      tag: "Industrial",
      meta: "Shell · ExxonMobil · SRC · Vopak · YJP Surveyors",
      title: "Refinery & industrial as-built scanning",
      intro: "Live process plants are dense, constrained and unforgiving. Terrestrial laser scanning captures them as they are — not as the drawings say they are.",
      rows: [
        { label: "Brief", text: "Refinery and industrial facilities needed accurate as-built geometry for maintenance, modification and inspection planning, without interrupting operations." },
        { label: "My role", text: "Surveyor and 3D scanning analyst — field capture, registration and point-cloud deliverables." },
        { label: "What I did", items: [
          "Terrestrial 3D laser scanning in live process plant environments",
          "Multi-scan registration and georeferencing to survey control",
          "As-built and inspection deliverables for engineering teams"
        ] },
        { label: "Technical outputs", items: [
          "Registered point clouds and as-built documentation",
          "Vessel volume and deformation outputs",
          "Inspection-ready datasets for plant assets"
        ] },
        { label: "Outcome", text: "Reliable as-built records in high-stakes environments, supporting engineering decisions where drawing accuracy matters." }
      ],
      tags: ["Terrestrial LiDAR", "Registration", "As-built", "Oil & gas"]
    },
    heritage: {
      scene: "heritage",
      tag: "Built environment",
      meta: "NHB · Resorts World Sentosa · YJP Surveyors",
      title: "Heritage documentation & Scan-to-BIM",
      intro: "Heritage fabric is irregular, layered and often undocumented. Point clouds give conservation teams a measurable record before anything changes.",
      rows: [
        { label: "Brief", text: "Heritage and complex building projects required accurate geometric documentation for conservation, digital twin and Scan-to-BIM workflows." },
        { label: "My role", text: "3D laser scanning and point-cloud processing." },
        { label: "What I did", items: [
          "3D scanning of heritage buildings and interiors",
          "Point-cloud registration and processing for conservation teams",
          "Coordination with Scan-to-BIM and digital-twin workflows"
        ] },
        { label: "Technical outputs", items: [
          "Heritage point clouds and measured records",
          "Scan-to-BIM support and digital-twin datasets",
          "Geometric documentation for conservation planning"
        ] },
        { label: "Outcome", text: "Reusable geometric records that support conservation decisions and downstream building information models." }
      ],
      tags: ["Heritage", "Digital twin", "Scan-to-BIM", "Point cloud"]
    },
    municipal: {
      scene: "municipal",
      tag: "GIS",
      meta: "MBSA & MBPJ · Geo Strata · Malaysia",
      title: "Municipal asset management at scale",
      intro: "Two municipal asset programmes, tens of thousands of hectares, and one requirement: an inventory the council can actually maintain.",
      rows: [
        { label: "Brief", text: "MBSA and MBPJ needed field-verified asset inventories at municipal scale, integrated with GIS rather than sitting in disconnected spreadsheets." },
        { label: "My role", text: "GIS Executive and Assistant Resident Engineer — led field data collection and database generation, alongside supervision of related civil works." },
        { label: "What I did", items: [
          "Led field data collection teams across municipal sections",
          "Processed LiDAR and built asset databases for MBSA and MBPJ",
          "Trained council staff and supported GIS data migration"
        ] },
        { label: "Technical outputs", items: [
          "Municipal asset database and GIS integration",
          "Field-verified inventories across 38,750 hectares",
          "Staff training and data-migration handover"
        ] },
        { label: "Outcome", text: "GIS-based asset systems supporting maintenance and planning, with internal capability built through hands-on training." }
      ],
      tags: ["GIS", "Asset management", "LiDAR", "Training"]
    },
    vessel: {
      scene: "vessel",
      tag: "Automation",
      meta: "YJP Surveyors · Singapore",
      title: "Vessel volumetrics, automated",
      intro: "Vessel volume calculations were repetitive, manual and easy to get wrong. The answer was automation, not more hours.",
      rows: [
        { label: "Brief", text: "Recurring vessel volumetric survey work needed faster, more consistent calculation and reporting." },
        { label: "My role", text: "Surveyor and analyst — scanning, processing and workflow automation." },
        { label: "What I did", items: [
          "3D scanning of vessel compartments for volumetric surveys",
          "Built Excel macro automation for repeatable volume calculation",
          "Integrated outputs with GIS-linked reporting workflows"
        ] },
        { label: "Technical outputs", items: [
          "Volumetric calculations and survey reports",
          "Reusable automation templates",
          "GIS-linked calculation records"
        ] },
        { label: "Outcome", text: "Less manual repetition and fewer transcription errors, with a repeatable process for recurring survey work." }
      ],
      tags: ["Volumetrics", "3D scanning", "Excel automation", "GIS"]
    },
    uav: {
      scene: "uav",
      tag: "R&D",
      meta: "A*STAR · YJP Surveyors · Singapore",
      title: "BVLOS UAV & mixed-reality R&D",
      intro: "Beyond-visual-line-of-sight flight, 5G transmission and mixed-reality visualisation — R&D work that tests where geospatial capture is heading.",
      rows: [
        { label: "Brief", text: "A*STAR-linked R&D workstreams explored BVLOS UAV operations, high-bandwidth data transmission and mixed-reality geospatial visualisation." },
        { label: "My role", text: "Geospatial and field support — survey planning, flight support and data handling." },
        { label: "What I did", items: [
          "Supported BVLOS flight planning and field operations",
          "Handled survey data for 5G transmission trials",
          "Contributed to mixed-reality visualisation workflows"
        ] },
        { label: "Technical outputs", items: [
          "BVLOS survey planning and flight-support records",
          "5G transmission test data",
          "Mixed-reality geospatial visualisation inputs"
        ] },
        { label: "Outcome", text: "Future-facing capture workflows tested in real operations, with 150 UAV flight hours logged by August 2023." }
      ],
      tags: ["UAV", "BVLOS", "5G", "Mixed reality"]
    }
  };

  /* ---------------- header, progress, scrollspy ---------------- */

  var head = doc.getElementById("site-head");
  var progress = doc.getElementById("scroll-progress");
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll(".nav__link"));
  var sectionIds = ["profile", "experience", "work", "capabilities", "credentials", "contact"];
  var sections = sectionIds.map(function (id) { return doc.getElementById(id); });

  function onScroll() {
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    if (head) head.classList.toggle("is-stuck", y > 16);

    var max = doc.documentElement.scrollHeight - window.innerHeight;
    if (progress) {
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    }

    var activeId = null;
    for (var i = 0; i < sections.length; i++) {
      var el = sections[i];
      if (!el) continue;
      if (el.getBoundingClientRect().top <= window.innerHeight * 0.38) activeId = sectionIds[i];
    }
    navLinks.forEach(function (link) {
      var on = link.getAttribute("data-section") === activeId;
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });
  onScroll();

  /* ---------------- mobile menu ---------------- */

  var menuBtn = doc.getElementById("menu-btn");
  var mobileMenu = doc.getElementById("mobile-menu");
  var menuTimer;

  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    clearTimeout(menuTimer);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    body.classList.toggle("menu-open", open);

    var mainEl = doc.getElementById("main");
    var footEl = doc.querySelector(".site-foot");
    if (mainEl) mainEl.inert = open;
    if (footEl) footEl.inert = open;

    if (open) {
      mobileMenu.hidden = false;
      requestAnimationFrame(function () { mobileMenu.classList.add("is-open"); });
      menuTimer = setTimeout(function () {
        var first = mobileMenu.querySelector("a");
        if (first) first.focus();
      }, reduceMotion ? 0 : 120);
    } else {
      mobileMenu.classList.remove("is-open");
      menuTimer = setTimeout(function () { mobileMenu.hidden = true; }, reduceMotion ? 0 : 280);
    }
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024 && menuBtn.getAttribute("aria-expanded") === "true") setMenu(false);
    });
  }

  /* ---------------- reveal on scroll ---------------- */

  var reveals = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------------- animated metrics ---------------- */

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) {
      el.textContent = target.toLocaleString("en-US");
      return;
    }
    var start = performance.now();
    var duration = 1600;
    function step(now) {
      var p = Math.min(1, (now - start) / duration);
      var value = Math.round(target * easeOutCubic(p));
      el.textContent = value.toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = Array.prototype.slice.call(doc.querySelectorAll("[data-count]"));
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------------- work filters ---------------- */

  var filterButtons = Array.prototype.slice.call(doc.querySelectorAll(".filter"));
  var workGrid = doc.getElementById("work-grid");
  var cards = Array.prototype.slice.call(doc.querySelectorAll(".card"));

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      filterButtons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });

      cards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-cat").split(" ").indexOf(filter) !== -1;
        card.hidden = !show;
        if (show) {
          card.classList.add("is-in");
          // let the browser lay the card out again before the observer paints it
          var canvas = card.querySelector("[data-scene]");
          if (canvas && canvas.width <= 1 && window.PortfolioVisuals) {
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(function () {
                window.PortfolioVisuals.paint(canvas, canvas.getAttribute("data-scene"));
              });
            });
          }
        }
      });

      if (workGrid) workGrid.classList.add("is-filtering");
    });
  });

  /* ---------------- project modal ---------------- */

  var modal = doc.getElementById("project-modal");
  var modalClose = doc.getElementById("modal-close");
  var modalMeta = doc.getElementById("modal-meta");
  var modalTitle = doc.getElementById("modal-title");
  var modalIntro = doc.getElementById("modal-intro");
  var modalRows = doc.getElementById("modal-rows");
  var modalTags = doc.getElementById("modal-tags");
  var modalTag = doc.getElementById("modal-tag");
  var modalCanvas = doc.getElementById("modal-canvas");
  var modalShare = doc.getElementById("modal-share");
  var lastTrigger = null;
  var currentProjectKey = null;

  function buildRows(rows) {
    modalRows.textContent = "";
    rows.forEach(function (row) {
      var wrap = doc.createElement("div");
      wrap.className = "modal__row";
      var dt = doc.createElement("dt");
      dt.textContent = row.label;
      var dd = doc.createElement("dd");

      if (row.items) {
        var ul = doc.createElement("ul");
        row.items.forEach(function (text) {
          var li = doc.createElement("li");
          li.textContent = text;
          ul.appendChild(li);
        });
        dd.appendChild(ul);
      } else {
        dd.textContent = row.text;
      }
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      modalRows.appendChild(wrap);
    });
  }

  function openProject(key, trigger) {
    var project = PROJECTS[key];
    if (!project || !modal) return;
    lastTrigger = trigger || null;

    modalMeta.textContent = project.meta;
    modalTitle.textContent = project.title;
    modalIntro.textContent = project.intro;
    modalTag.textContent = project.tag;
    buildRows(project.rows);

    modalTags.textContent = "";
    project.tags.forEach(function (tag) {
      var li = doc.createElement("li");
      li.textContent = tag;
      modalTags.appendChild(li);
    });

    currentProjectKey = key;
    if (location.hash !== "#case-" + key) {
      try { history.pushState({ case: key }, "", "#case-" + key); } catch (err) {}
    }

    body.classList.add("modal-open");
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (window.PortfolioVisuals) window.PortfolioVisuals.paint(modalCanvas, project.scene);
      });
    });
  }

  function closeProject() {
    if (!modal) return;
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  }

  doc.querySelectorAll("[data-project]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      openProject(link.getAttribute("data-project"), link);
    });
  });

  if (modal) {
    modal.addEventListener("close", function () {
      if (!privacyModal || !privacyModal.open) body.classList.remove("modal-open");
      currentProjectKey = null;
      if (location.hash.indexOf("#case-") === 0) {
        try { history.replaceState(null, "", location.pathname + location.search); } catch (err) {}
      }
      if (lastTrigger) lastTrigger.focus();
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeProject();
    });
  }
  if (modalClose) modalClose.addEventListener("click", closeProject);

  /* ---------------- copy email ---------------- */

  var toast = doc.getElementById("toast");
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
  }

  var EMAIL = "hulwanafif" + "@" + "outlook.com";

  doc.querySelectorAll("[data-email]").forEach(function (el) {
    el.setAttribute("href", "mailto:" + EMAIL);
    el.removeAttribute("target");
    el.removeAttribute("rel");
    if (el.hasAttribute("data-email-show")) el.textContent = EMAIL;
  });

  function copyText(text, message) {
    var done = function () { showToast(message); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = doc.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      doc.body.appendChild(ta);
      ta.select();
      try { doc.execCommand("copy"); done(); } catch (err) { showToast(text); }
      doc.body.removeChild(ta);
    }
  }

  doc.querySelectorAll("[data-email-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      copyText(EMAIL, "Email copied to clipboard");
    });
  });

  if (modalShare) {
    modalShare.addEventListener("click", function () {
      if (!currentProjectKey) return;
      copyText(location.href.split("#")[0] + "#case-" + currentProjectKey, "Case-study link copied");
    });
  }

  function openFromHash() {
    var match = /^#case-([a-z]+)$/.exec(location.hash);
    if (!match || !PROJECTS[match[1]]) return;
    lastTrigger = doc.querySelector('[data-project="' + match[1] + '"]');
    openProject(match[1], lastTrigger);
  }

  window.addEventListener("popstate", function () {
    if (modal && modal.open) closeProject();
  });

  window.addEventListener("hashchange", function () {
    var match = /^#case-([a-z]+)$/.exec(location.hash);
    if (match && PROJECTS[match[1]] && (!modal || !modal.open)) {
      openProject(match[1], doc.querySelector('[data-project="' + match[1] + '"]'));
    }
  });

  setTimeout(openFromHash, 220);

  /* ---------------- clock + year ---------------- */

  var clock = doc.getElementById("clock");
  var year = doc.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  function updateClock() {
    if (!clock) return;
    try {
      clock.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Singapore",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(new Date());
    } catch (err) {
      clock.textContent = new Date().toTimeString().slice(0, 5);
    }
  }
  updateClock();
  setInterval(updateClock, 30000);

  /* ---------------- privacy note ---------------- */

  var privacyModal = doc.getElementById("privacy-modal");
  var privacyClose = doc.getElementById("privacy-close");

  function closePrivacy() {
    if (!privacyModal) return;
    if (typeof privacyModal.close === "function") privacyModal.close();
    else privacyModal.removeAttribute("open");
  }

  function openPrivacy() {
    if (!privacyModal) return;
    if (modal && modal.open) closeProject();
    body.classList.add("modal-open");
    if (typeof privacyModal.showModal === "function") privacyModal.showModal();
    else privacyModal.setAttribute("open", "");
  }

  ["privacy-open", "privacy-open-2"].forEach(function (id) {
    var btn = doc.getElementById(id);
    if (btn) btn.addEventListener("click", openPrivacy);
  });
  if (privacyClose) privacyClose.addEventListener("click", closePrivacy);
  if (privacyModal) {
    privacyModal.addEventListener("close", function () {
      if (!modal || !modal.open) body.classList.remove("modal-open");
    });
    privacyModal.addEventListener("click", function (e) {
      if (e.target === privacyModal) closePrivacy();
    });
  }

  window.__portfolioReady = true;

  /* ---------------- smooth-close mobile menu on hash links ---------------- */

  doc.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      if (menuBtn && menuBtn.getAttribute("aria-expanded") === "true") setMenu(false);
    });
  });
})();
