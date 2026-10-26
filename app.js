(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var money = function (n, sym) { return (sym || "$") + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  function countTo(el, from, to, ms, sym) {
    if (reduceMotion) { el.textContent = money(to, sym); return; }
    var start = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - start) / ms);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = money(from + (to - from) * eased, sym);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* Header background once the page scrolls */
  var header = $(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 10); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Subpages: mark common blocks for scroll reveal */
  $$(".page-head .wrap > *, .flow-step, .compare-wrap, .faq details, .final, .callout, .pricing-notes, .audience .card, .docs-body > h2, .docs-body > ol, .docs-body > ul, .docs-body > .note")
    .forEach(function (el) { el.classList.add("reveal"); });
  $$(".pricing, .audience, .faq").forEach(function (el) { el.setAttribute("data-stagger", ""); });
  $$(".pricing .plan").forEach(function (el) { el.classList.add("reveal"); });

  /* Stagger children */
  $$("[data-stagger]").forEach(function (group) {
    $$(".reveal", group).forEach(function (el, i) { el.style.setProperty("--delay", (i * 0.09) + "s"); });
  });

  /* Scroll reveal */
  var revealTargets = $$(".reveal, .pd-shell");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* Cursor spotlight on cards */
  $$(".spot").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* Feature tile: live totals */
  var live = $("#live-totals");
  if (live && !reduceMotion) {
    var qtyEl = $("[data-qty]", live), totalEl = $("[data-total]", live);
    var seq = [1, 2, 3, 1], idx = 0;
    setInterval(function () {
      var prev = seq[idx]; idx = (idx + 1) % seq.length; var q = seq[idx];
      qtyEl.textContent = q;
      qtyEl.classList.add("bump");
      setTimeout(function () { qtyEl.classList.remove("bump"); }, 500);
      countTo(totalEl, 4000 + prev * 2500, 4000 + q * 2500, 700);
    }, 2200);
  }

  /* Feature tile: currency */
  var sym = $("#cur-sym");
  if (sym && !reduceMotion) {
    var cur = [["$", "6,903.00", "USD"], ["€", "6,903.00", "EUR"], ["£", "6,903.00", "GBP"], ["₹", "6,903.00", "INR"], ["A$", "6,903.00", "AUD"]], ci = 0;
    setInterval(function () {
      ci = (ci + 1) % cur.length;
      sym.classList.add("swap");
      setTimeout(function () {
        sym.textContent = cur[ci][0];
        $("#cur-amt").textContent = cur[ci][1];
        $("#cur-code").textContent = cur[ci][2];
        sym.classList.remove("swap");
      }, 250);
    }, 2000);
  }

  /* Docs: highlight current section */
  var docLinks = $$(".docs-nav a");
  if (docLinks.length && "IntersectionObserver" in window) {
    var docIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        docLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    $$(".docs-body h2[id]").forEach(function (h) { docIo.observe(h); });
  }

})();
