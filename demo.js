/* Hero demo: replays the real QuoteFlowin flow (Twenty Quote tab → client page → deal won).
   Wording, layout and colors follow the app source (quote-editor.tsx, public-quote-page.ts, quote-email.ts). */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // "short": the hero loop (client accepts → deal won). "full": all five scenes with chapter buttons.
  Array.prototype.forEach.call(document.querySelectorAll(".pd[data-demo]"), function (mount) {
    createDemo(mount, mount.getAttribute("data-demo"));
  });

  function createDemo(mount, mode) {

  /* ---------- Sample data (every number on the site matches these) ---------- */
  var SELLER = {
    name: "Northwind Studio",
    phone: "+1 (503) 555-0147",
    email: "hello@northwindstudio.com",
    website: "northwindstudio.com",
    address: "18 Harbor Street, Portland, OR 97201",
    taxId: "Tax ID 12-3456789",
    payment: ["Harbor Federal Bank", "Account name: Northwind Studio LLC", "Account no: 000123456789 · Routing: 123000848"]
  };
  var CLIENT = { company: "Globex Corp", contact: "Theodore Gonzalez", email: "theodore@globex.com", address: "500 Market Street, San Francisco, CA" };
  var QUOTE_NAME = "Globex website redesign quote";
  var DEAL = "Globex website redesign";
  var REF = "Q-0003";
  var ITEMS = [["Website redesign", "1", "4000.00"], ["Mobile version", "1", "2500.00"]];
  var DISCOUNT = "10", TAX = "18";
  var MESSAGE = "Thanks for your time today. Here is the proposal we discussed.";
  var TERMS = ["Payment due within 30 days.", "Prices exclude travel."];
  var LINK = "https://crm.northwindstudio.com/s/quote/7c1e9a2f…";

  var today = new Date();
  var validDate = new Date(today.getTime() + 30 * 864e5);
  var shortDate = function (d) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
  var longDate = function (d) { return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); };
  var timeStr = function (d) { return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); };
  var usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  var money = function (n) { return usd.format(n); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var num = function (s) { var n = parseFloat(s); return isNaN(n) ? 0 : n; };

  function totals(st) {
    var lines = st.rows.map(function (r) { return num(r.q) * num(r.p); });
    var sub = lines.reduce(function (a, b) { return a + b; }, 0);
    var disc = sub * num(st.disc) / 100;
    var tax = (sub - disc) * num(st.tax) / 100;
    return { lines: lines, sub: sub, disc: disc, tax: tax, total: sub - disc + tax };
  }

  /* ---------- Icons ---------- */
  var I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8 13h8M8 17h5"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>'
  };

  /* ---------- Client quote page markup (mirrors renderQuotePage) ---------- */
  function clientPage(st, opts) {
    opts = opts || {};
    var t = totals(st), named = st.rows.filter(function (r) { return r.d.trim(); });
    var rows = named.length === 0 ? '<div class="empty-row">No line items</div>' : st.rows.map(function (r, i) {
      if (!r.d.trim()) return "";
      return '<div class="table-row"><span>' + esc(r.d) + "</span><span>" + (num(r.q) || "") + "</span><span>" + money(num(r.p)) + "</span><span>" + money(t.lines[i]) + "</span></div>";
    }).join("");
    var outcome;
    if (st.accepted) {
      outcome = '<div class="notice">Accepted by ' + esc(CLIENT.contact) + " on " + longDate(today) + ". Thank you!</div>";
    } else if (opts.preview) {
      outcome = '<div class="actions"><label>Your full name<span class="input disabled"></span></label><span class="button disabled">Accept quote</span></div>';
    } else {
      outcome = '<div class="actions" data-id="actions"><label>Your full name<span class="input" data-id="name"></span></label><span class="button" data-id="accept">Accept quote</span></div>' +
        '<div class="decline" data-id="decline"><span>Decline this quote</span></div>';
    }
    return (opts.preview ? '<div class="preview-banner">Preview — this is what your client will see</div>' : "") +
      '<div class="toolbar"><span class="button secondary' + (opts.preview ? " disabled" : "") + '">Download PDF</span></div>' +
      '<div class="invoice-card">' +
        '<header class="invoice-header"><div class="logo-area"><div class="logo-fallback"><span class="logo-text">' + SELLER.name + "</span></div></div>" +
          '<div class="title-area"><h1>QUOTE</h1><div class="meta"><span>Quote Number</span><span class="value">: ' + (st.issued ? REF : "—") + "</span></div></div></header>" +
        '<section class="bill-to"><div><h2>Quote to</h2>' +
          "<p><strong>Name</strong><span>: " + CLIENT.company + "</span></p>" +
          "<p><strong>Address</strong><span>: " + CLIENT.address + "</span></p>" +
          "<p><strong>Contact</strong><span>: " + CLIENT.contact + " · " + CLIENT.email + "</span></p></div>" +
          '<div class="date-issued"><p><span>Date Issued</span><span class="value">: ' + (st.issued ? longDate(today) : "—") + "</span></p>" +
          '<p><span>Valid Until</span><span class="value">: ' + longDate(validDate) + "</span></p></div></section>" +
        '<section class="intro"><h2>' + esc(QUOTE_NAME) + "</h2>" + (st.msg.trim() ? "<p>" + esc(st.msg) + "</p>" : "") + "</section>" +
        '<div class="table-wrapper"><div class="table-header"><span>DESCRIPTION</span><span>QUANTITY</span><span>RATE</span><span>TOTAL</span></div><div class="table-body">' + rows + "</div></div>" +
        '<div class="totals"><div class="totals-line"><span>SUBTOTAL</span><span>' + money(t.sub) + "</span></div>" +
          (t.disc > 0 ? '<div class="totals-line"><span>DISCOUNT (' + num(st.disc) + "%)</span><span>−" + money(t.disc) + "</span></div>" : "") +
          '<div class="totals-line"><span>TAX RATE (%)</span><span>' + num(st.tax) + "%</span></div>" +
          '<div class="totals-line"><span>TAX</span><span>' + money(t.tax) + "</span></div>" +
          '<div class="totals-line total"><span>TOTAL</span><span>' + money(t.total) + "</span></div></div>" +
        '<section class="payment"><h3>Payment Instructions</h3><div class="payment-body">' + SELLER.payment.map(function (l) { return "<p>" + l + "</p>"; }).join("") + "</div></section>" +
        outcome +
        '<footer class="invoice-footer"><div class="terms"><h3>Terms &amp; Conditions</h3><ul>' + TERMS.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul></div>" +
          '<div class="seller-contact">' +
            [["☎", SELLER.phone], ["✉", SELLER.email], ["⌁", SELLER.website], ["⌂", SELLER.address], ["#", SELLER.taxId]].map(function (c) {
              return '<p><span class="icon">' + c[0] + "</span>" + c[1] + "</p>";
            }).join("") + "</div></footer>" +
      "</div>" +
      '<p class="credit">Sent with QuoteFlowin</p>';
  }

  function emailBody(withLink) {
    var t = totals(state);
    return "Hi Theodore,\n\n" + esc(state.msg.trim() || "Please find our quote below.") + "\n\n" +
      "Quote " + REF + ": " + QUOTE_NAME + "\nTotal: " + money(t.total) + "\nValid until: " + shortDate(validDate) + "\n\n" +
      "You can view, download and accept the quote here:\n" +
      (withLink ? '<span class="lnk">' + LINK + "</span>" : '<span class="ph">[the quote link appears here once you send the quote]</span>') +
      "\n\nBest regards,\n" + SELLER.name;
  }

  /* ---------- Build the screen ---------- */
  var state, canvas, scale = 1, narrow = false, W = 1040, H = 600;
  var $ = function (id) { return canvas.querySelector('[data-id="' + id + '"]'); };

  function build() {
    narrow = isNarrow();
    // The hero loop sits in a half-width column, so it uses a smaller screen than the full walkthrough.
    W = narrow ? 560 : mode === "short" ? 900 : 1040;
    H = narrow && mode !== "short" ? 700 : 600;
    var validLabel = "30 days — until " + shortDate(validDate);
    mount.querySelector(".pd-viewport").innerHTML =
      '<div class="pd-canvas' + (narrow ? " narrow" : "") + '" style="width:' + W + "px;height:" + H + 'px">' +
      /* CRM frame */
      '<div class="pd-frame tw" data-id="crm">' +
        '<nav class="tw-rail"><span class="ws">N</span><i>' + I.home + "</i><i>" + I.building + "</i><i>" + I.user + '</i><i class="on">' + I.target + "</i><i>" + I.check + "</i><i>" + I.file + "</i></nav>" +
        '<div class="tw-top">' + I.target.replace("<svg", '<svg width="14" height="14"') + ' Opportunities <span>/</span> <b>' + DEAL + "</b></div>" +
        '<aside class="tw-record"><div class="av">G</div><h4>' + DEAL + "</h4>" +
          '<div class="tw-field" data-id="f-amount"><span>Amount</span><span data-id="amount"></span></div>' +
          '<div class="tw-field" data-id="f-stage"><span>Stage</span><span><span class="tw-stage" data-id="stage"></span></span></div>' +
          '<div class="tw-field opt"><span>Company</span><span><span class="tw-chip"><i>G</i>Globex Corp</span></span></div>' +
          '<div class="tw-field opt"><span>Contact</span><span><span class="tw-chip person"><i>T</i>Theodore Gonzalez</span></span></div>' +
          '<div class="tw-field opt"><span>Close date</span><span class="empty">Empty</span></div>' +
        "</aside>" +
        '<section class="tw-main">' +
          '<div class="tw-tabs"><span data-id="tab-timeline" class="keep">' + I.clock + 'Timeline</span><span>' + I.check + "Tasks</span><span>" + I.file + 'Notes</span><span>Files</span><span data-id="tab-quote" class="keep">' + I.list + "Quote</span></div>" +
          '<div class="tw-body">' +
            '<div class="tw-pane" data-id="pane-quote"><div class="tw-scroll" data-id="quote-scroll">' +
              '<div class="qe-head"><span class="fi qe-name" data-id="qname">' + QUOTE_NAME + '</span><span class="qe-num hide" data-id="qnum">' + REF + '</span><span class="tag gray" data-id="qtag">Draft</span></div>' +
              '<nav class="qe-steps"><span class="qe-step" data-id="step1"><b>1</b>Edit</span><span>→</span><span class="qe-step" data-id="step2"><b>2</b>Review &amp; share</span></nav>' +
              /* Step 1 · Edit */
              '<div class="qe-cols" data-id="edit">' +
                '<div class="qe-left">' +
                  '<div><div class="qe-row"><span class="qe-th">Description</span><span class="qe-th r">Qty</span><span class="qe-th r">Unit price</span><span class="qe-th r">Amount</span><span></span></div>' +
                  '<div class="qe-rows" data-id="rows" style="margin-top:6px"></div>' +
                  '<div class="qe-add" data-id="add" style="margin-top:6px">' + I.plus.replace("<svg", '<svg width="12" height="12"') + "Add line item</div></div>" +
                  '<div class="qe-fields">' +
                    '<label class="qe-lbl">Currency<span class="fi sel" style="width:' + (narrow ? 150 : 170) + 'px">USD — US Dollar</span></label>' +
                    '<label class="qe-lbl">Discount (%)<span class="fi num" data-id="disc" style="width:80px"></span></label>' +
                    '<label class="qe-lbl">Tax (%)<span class="fi num" data-id="tax" style="width:80px"></span></label>' +
                    '<label class="qe-lbl">Valid until<span class="fi sel">' + validLabel + "</span></label>" +
                  "</div>" +
                  '<label class="qe-lbl">Message to client<span class="fi area" data-id="msg"></span></label>' +
                  '<label class="qe-lbl">Terms<span class="fi area">' + TERMS.join("<br>") + "</span></label>" +
                  '<div class="qe-sum"><span>Subtotal</span><span data-id="s-sub"></span><span>Discount</span><span data-id="s-disc"></span><span>Tax</span><span data-id="s-tax"></span><span class="tot">Total</span><span class="tot" data-id="s-total"></span></div>' +
                  '<div class="qe-actions"><span class="muted hide" data-id="unsaved">Unsaved changes</span><span class="tbtn outline">Create quote</span><span class="tbtn solid" data-id="next">Next: Review &amp; share' + I.arrowR + "</span></div>" +
                "</div>" +
                '<div class="qe-right"><span class="qe-preview-lbl">Live preview · what your client will see</span><div class="qe-preview" style="height:500px"><div class="cq cq-mini" data-id="prev-edit"></div></div></div>' +
              "</div>" +
              /* Step 2 · Review & share */
              '<div class="qe-cols review hide" data-id="review">' +
                '<div class="qe-left" style="gap:10px">' +
                  '<div class="rv-box" data-id="rv-box"><span>Client</span><span>Globex Corp</span><span>Line items</span><span>2</span><span>Valid until</span><span>' + shortDate(validDate) + "</span>" +
                    '<span class="hide" data-id="rv-viewed-k">Viewed</span><span class="hide" data-id="rv-viewed-v">Not yet</span>' +
                    '<span class="hide" data-id="rv-acc-k">Accepted</span><span class="hide" data-id="rv-acc-v"></span>' +
                    '<span>Total</span><span><strong data-id="rv-total"></strong></span></div>' +
                  '<span class="muted" data-id="rv-hint">Check the preview. Sending locks the quote and gives you a link to share with your client.</span>' +
                  '<div class="hide" data-id="rv-link" style="display:flex;flex-direction:column;gap:6px"><span class="qe-lbl">Client link</span><span class="fi locked">' + LINK + "</span>" +
                    '<div class="rv-btns"><span class="tbtn solid">' + I.copy + 'Copy link</span><span class="tbtn outline">' + I.download + 'PDF</span><span class="tbtn ghost">' + I.external + "Open</span></div></div>" +
                  '<div class="rv-card" data-id="rv-email"><span class="lbl">Email to client</span><span class="muted" data-id="rv-email-note" style="font-size:12px">Preview. The quote number and link are added when you send.</span>' +
                    '<span class="fi">' + CLIENT.email + '</span><span class="fi">Quote ' + REF + " from " + SELLER.name + ": " + QUOTE_NAME + "</span>" +
                    '<span class="fi rv-body" data-id="rv-body"></span>' +
                    '<div class="rv-btns hide" data-id="rv-email-btns"><span class="tbtn solid">' + I.mail + 'Open in email app</span><span class="tbtn outline">' + I.copy + "Copy email</span></div></div>" +
                  '<div class="rv-foot" data-id="rv-foot"><span class="tbtn ghost" data-id="back">' + I.arrowL + 'Back to edit</span><span class="tbtn solid" data-id="send">' + I.send + 'Send quote</span><span class="tbtn outline hide" data-id="withdraw">Withdraw and edit</span></div>' +
                "</div>" +
                '<div class="qe-right"><span class="qe-preview-lbl">What your client will see</span><div class="qe-preview" style="height:520px"><div class="cq cq-mini" data-id="prev-review"></div></div></div>' +
              "</div>" +
            "</div></div>" +
            '<div class="tw-pane" data-id="pane-timeline"><div class="tl-head">' + DEAL + ' · Timeline</div><div class="tl" data-id="tl"></div></div>' +
          "</div>" +
        "</section>" +
        '<div class="tw-modal" data-id="modal"><div><h5>Send this quote?</h5><p>You will get a link to share with your client. The quote is locked while it is out for acceptance.</p>' +
          '<div class="rv-btns"><span class="tbtn outline">Cancel</span><span class="tbtn solid" data-id="confirm">Send quote</span></div></div></div>' +
        '<div class="tw-snack" data-id="snack"></div>' +
      "</div>" +
      /* Client page in a browser */
      '<div class="pd-frame br" data-id="client">' +
        '<div class="br-bar"><div class="dots"><i></i><i></i><i></i></div><div class="br-url">' + LINK.replace("https://", "") + "</div></div>" +
        '<div class="br-page"><div class="tw-scroll cq" data-id="client-page"></div></div>' +
      "</div>" +
      '<svg class="pd-cursor" data-id="cursor" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>' +
      "</div>";
    canvas = mount.querySelector(".pd-canvas");
    fit();
  }

  function isNarrow() { return mount.clientWidth < (mode === "short" ? 480 : 700); }
  function fit() {
    var vp = mount.querySelector(".pd-viewport");
    scale = vp.clientWidth / W;
    canvas.style.transform = "scale(" + scale + ")";
    vp.style.height = (H * scale) + "px";
    ["prev-edit", "prev-review"].forEach(function (id) {
      var el = $(id), box = el && el.parentNode;
      if (box && box.clientWidth) el.style.transform = "scale(" + (box.clientWidth / 900) + ")";
    });
  }

  /* ---------- Rendering helpers ---------- */
  function setField(el, text, placeholder) {
    el.textContent = text || placeholder || "";
    el.classList.toggle("ph", !text && !!placeholder);
  }
  function rowEl(i) { return $("rows").children[i]; }
  function addRow(r) {
    var div = document.createElement("div");
    div.className = "qe-row";
    div.innerHTML = '<span class="fi"></span><span class="fi num"></span><span class="fi num"></span><span class="qe-amt"></span><span class="qe-trash">' + I.trash + "</span>";
    $("rows").appendChild(div);
    paintRow($("rows").children.length - 1);
    return div;
  }
  function paintRow(i) {
    var r = state.rows[i], el = rowEl(i), t = totals(state);
    setField(el.children[0], r.d, "e.g. Homepage redesign");
    setField(el.children[1], r.q);
    setField(el.children[2], r.p, "0.00");
    el.children[3].textContent = money(t.lines[i]);
  }
  function paintTotals() {
    var t = totals(state);
    $("s-sub").textContent = money(t.sub);
    $("s-disc").textContent = (t.disc > 0 ? "−" : "") + money(t.disc);
    $("s-tax").textContent = money(t.tax);
    $("s-total").textContent = money(t.total);
    $("rv-total").textContent = money(t.total);
    $("prev-edit").innerHTML = clientPage(state, { preview: true });
  }
  function paintAll() {
    $("rows").innerHTML = "";
    state.rows.forEach(function (r) { addRow(r); });
    setField($("disc"), state.disc);
    setField($("tax"), state.tax);
    setField($("msg"), state.msg, "e.g. Thanks for your time today. Here is the proposal we discussed.");
    paintTotals();
  }
  function frame(id) {
    ["crm", "client"].forEach(function (f) { $(f).classList.toggle("on", f === id); });
  }
  function tab(name) {
    $("tab-quote").classList.toggle("on", name === "quote");
    $("tab-timeline").classList.toggle("on", name === "timeline");
    $("pane-quote").classList.toggle("on", name === "quote");
    $("pane-timeline").classList.toggle("on", name === "timeline");
  }
  function step(n) {
    $("step1").classList.toggle("on", n === 1);
    $("step2").classList.toggle("on", n === 2);
    $("edit").classList.toggle("hide", n !== 1);
    $("review").classList.toggle("hide", n !== 2);
    $("qname").classList.toggle("locked", n === 2);
    scrollTo($("quote-scroll"), 0, true);
    fit();
  }
  function tag(label, color, animate) {
    var el = $("qtag");
    el.textContent = label;
    el.className = "tag " + color;
    if (animate) { void el.offsetWidth; el.classList.add("pop"); }
  }
  function show(id, on) { $(id).classList.toggle("hide", !on); }
  function review(status) {
    var draft = status === "draft", sent = status === "sent", acc = status === "accepted";
    tag(draft ? "Draft" : sent ? "Sent" : "Accepted", draft ? "gray" : sent ? "blue" : "green");
    show("qnum", !draft);
    show("rv-viewed-k", sent); show("rv-viewed-v", sent);
    show("rv-acc-k", acc); show("rv-acc-v", acc);
    $("rv-acc-v").textContent = CLIENT.contact + " · " + timeStr(new Date());
    show("rv-hint", draft);
    $("rv-link").classList.toggle("hide", draft);
    show("rv-email", !acc);
    show("rv-email-note", draft);
    show("rv-email-btns", sent);
    $("rv-body").innerHTML = emailBody(!draft);
    show("rv-foot", !acc);
    show("back", draft); show("send", draft); show("withdraw", sent);
    state.issued = !draft;
    $("prev-review").innerHTML = clientPage(state, { preview: true });
  }
  function deal(won) {
    var stage = $("stage"), amount = $("amount");
    stage.textContent = won ? "Customer" : "Proposal";
    stage.className = "tw-stage " + (won ? "customer" : "proposal");
    amount.textContent = won ? money(totals(state).total) : "Empty";
    amount.classList.toggle("empty", !won);
  }
  function timeline(items) {
    $("tl").innerHTML = "";
    items.forEach(addEvent);
  }
  function addEvent(e) {
    var div = document.createElement("div");
    div.className = "tl-item" + (e[2] ? " ok" : "");
    div.innerHTML = "<i>" + e[3] + "</i><div><b>" + e[0] + "</b><small>" + e[1] + "</small></div><time>" + timeStr(new Date(Date.now() - e[4] * 60000)) + "</time>";
    $("tl").appendChild(div);
  }
  var EVENTS = [
    ["Quote sent", REF + " · " + QUOTE_NAME, false, I.send, 26],
    ["Quote viewed by client", CLIENT.contact + " opened the link", false, I.eye, 12],
    ["Quote accepted", "Accepted by " + CLIENT.contact + " · " + money(6903), true, I.check, 0]
  ];
  function scrollTo(el, y, instant) {
    el.dataset.y = y;
    if (instant) { el.style.transition = "none"; el.style.transform = "translateY(" + -y + "px)"; void el.offsetWidth; el.style.transition = ""; }
    else el.style.transform = "translateY(" + -y + "px)";
  }
  function offsetIn(el, container) {
    return (el.getBoundingClientRect().top - container.getBoundingClientRect().top) / scale;
  }
  function snack(text) {
    var el = $("snack");
    el.textContent = text;
    el.classList.add("on");
    later(2600, function () { el.classList.remove("on"); });
  }

  /* ---------- Timing, cancellation, cursor ---------- */
  var run = 0, visible = true, timers = [];
  function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function Cancelled() {}
  function sleep(ms) {
    var my = run;
    return new Promise(function (resolve, reject) {
      setTimeout(function check() {
        if (my !== run) return reject(new Cancelled());
        if (!visible || document.hidden) return setTimeout(check, 250);
        resolve();
      }, ms);
    });
  }
  async function ensureVisible(el) {
    var sc = el.closest(".tw-scroll");
    if (!sc) return;
    var vh = sc.parentNode.clientHeight;
    var top = offsetIn(el, sc) - (+sc.dataset.y || 0);
    var h = el.getBoundingClientRect().height / scale;
    if (top >= 8 && top + h <= vh - 8) return;
    var y = Math.max(0, (+sc.dataset.y || 0) + top - vh * 0.45);
    scrollTo(sc, y);
    await sleep(750);
  }
  async function cursorTo(el, fx, fy) {
    await ensureVisible(el);
    var c = canvas.getBoundingClientRect(), r = el.getBoundingClientRect();
    var x = (r.left - c.left) / scale + (r.width / scale) * (fx == null ? 0.5 : fx);
    var y = (r.top - c.top) / scale + (r.height / scale) * (fy == null ? 0.55 : fy);
    // Aim at where a scrolling pane is heading, not where its animation is right now.
    var sc = el.closest(".tw-scroll");
    if (sc) y += -(+sc.dataset.y || 0) - new DOMMatrix(getComputedStyle(sc).transform).m42;
    $("cursor").style.transform = "translate(" + x + "px," + y + "px)";
    return sleep(900);
  }
  function cursorPark(x, y, instant) {
    var cur = $("cursor");
    if (instant) cur.style.transition = "none";
    cur.style.transform = "translate(" + x + "px," + y + "px)";
    if (instant) { void cur.offsetWidth; cur.style.transition = ""; }
  }
  async function click(el, pressClass) {
    var cur = $("cursor");
    cur.classList.remove("click"); void cur.offsetWidth; cur.classList.add("click");
    el.classList.add(pressClass || "press");
    await sleep(170);
    el.classList.remove(pressClass || "press");
  }
  async function type(el, text, speed, onChar) {
    el.classList.add("focus");
    el.classList.remove("ph");
    for (var i = 1; i <= text.length; i++) {
      el.textContent = text.slice(0, i);
      if (onChar) onChar(text.slice(0, i));
      await sleep(speed);
    }
    el.classList.remove("focus");
  }

  /* ---------- Scenes ---------- */
  var CHAPTERS = [
    ["Edit", "Build the quote on the deal: line items, discount, tax. Totals and the client preview update as you type."],
    ["Review & send", "Review, then send. You get a private link and a ready-written email to send from your own email app."],
    ["Client view", "Your client opens the link. No account or login needed."],
    ["Accept", "They type their name and accept the quote."],
    ["Deal won", "Back in Twenty, the deal updates itself: stage Customer, amount set to the quote total."]
  ];

  function freshState() {
    return { rows: [{ d: "", q: "1", p: "" }], disc: "0", tax: "0", msg: "", issued: false, accepted: false };
  }
  function filledState() {
    return { rows: ITEMS.map(function (r) { return { d: r[0], q: r[1], p: r[2] }; }), disc: DISCOUNT, tax: TAX, msg: MESSAGE, issued: false, accepted: false };
  }

  function prep(i) {
    state = i === 0 ? freshState() : filledState();
    paintAll();
    deal(false);
    timeline([]);
    $("modal").classList.remove("on");
    show("unsaved", false);
    if (i <= 1) {
      frame("crm"); tab("quote"); step(i + 1); review("draft");
    } else if (i <= 3) {
      state.issued = true;
      frame("client");
      $("client-page").innerHTML = clientPage(state, {});
      scrollTo($("client-page"), i === 3 ? clientScrollY() : 0, true);
    } else {
      frame("crm"); tab("quote"); step(2); review("sent");
      timeline(EVENTS.slice(0, 2));
      scrollTo($("quote-scroll"), 0, true);
    }
  }
  function clientScrollY() {
    var page = $("client-page"), target = $("actions") || page.querySelector(".notice");
    var y = offsetIn(target, page) - (H - 40) * 0.55;
    return Math.max(0, y);
  }

  var scenes = [
    async function edit() {
      cursorPark(W * 0.5, H * 0.5, true);
      await sleep(500);
      for (var k = 0; k < ITEMS.length; k++) {
        if (k > 0) {
          await cursorTo($("add"), 0.3);
          $("add").classList.add("hover");
          await click($("add"), "hover");
          $("add").classList.remove("hover");
          state.rows.push({ d: "", q: "1", p: "" });
          addRow();
          paintTotals();
          await sleep(250);
        }
        var row = rowEl(k);
        await cursorTo(row.children[0], 0.2);
        show("unsaved", true);
        await type(row.children[0], ITEMS[k][0], 45, function (v) { state.rows[k].d = v; paintTotals(); });
        await cursorTo(row.children[2], 0.6);
        await type(row.children[2], ITEMS[k][2], 70, function (v) { state.rows[k].p = v; paintRow(k); paintTotals(); });
        await sleep(250);
      }
      await cursorTo($("disc"), 0.6);
      await type($("disc"), DISCOUNT, 120, function (v) { state.disc = v; paintTotals(); });
      await cursorTo($("tax"), 0.6);
      await type($("tax"), TAX, 120, function (v) { state.tax = v; paintTotals(); });
      await cursorTo($("msg"), 0.15, 0.4);
      await type($("msg"), MESSAGE, 18, function (v) { state.msg = v; if (v.length % 6 === 0 || v === MESSAGE) paintTotals(); });
      await sleep(400);
      await cursorTo($("next"), 0.5);
      await click($("next"));
      await sleep(250);
    },
    async function reviewAndSend() {
      step(2); review("draft");
      await sleep(1600);
      await cursorTo($("send"), 0.5);
      await click($("send"));
      $("modal").classList.add("on");
      await sleep(900);
      await cursorTo($("confirm"), 0.5);
      await click($("confirm"));
      $("modal").classList.remove("on");
      review("sent");
      tag("Sent", "blue", true);
      snack("Quote sent. Copy the link to share it with your client.");
      await sleep(1400);
      var sc = $("quote-scroll");
      var target = offsetIn($("rv-email-btns"), sc) - (H - 44 - 40) + 70;
      if (target > 0) { scrollTo(sc, target); await sleep(1000); }
      await cursorTo($("rv-email-btns").children[0], 0.5);
      await sleep(1500);
    },
    async function clientView() {
      state.issued = true;
      frame("client");
      var page = $("client-page");
      page.innerHTML = clientPage(state, {});
      scrollTo(page, 0, true);
      cursorPark(W * 0.7, H * 0.4, true);
      await sleep(1600);
      page.style.transition = "transform 2.6s cubic-bezier(.45,.05,.2,1)";
      scrollTo(page, clientScrollY());
      await sleep(2800);
      page.style.transition = "";
    },
    async function accept() {
      if (!$("name")) {
        // Arrived here without the client page's accept form (e.g. after a resize): redraw it.
        state.accepted = false;
        $("client-page").innerHTML = clientPage(state, {});
        scrollTo($("client-page"), clientScrollY(), true);
      }
      var name = $("name"), btn = $("accept");
      await cursorTo(name, 0.3);
      await type(name, CLIENT.contact, 55);
      await sleep(250);
      await cursorTo(btn, 0.5);
      await click(btn);
      await sleep(300);
      var notice = document.createElement("div");
      notice.className = "notice";
      notice.textContent = "Accepted by " + CLIENT.contact + " on " + longDate(today) + ". Thank you!";
      $("actions").replaceWith(notice);
      $("decline").remove();
      state.accepted = true;
      await sleep(2400);
    },
    async function dealWon() {
      frame("crm"); tab("quote"); step(2); review("sent");
      timeline(EVENTS.slice(0, 2));
      cursorPark(W * 0.6, H * 0.6, true);
      await sleep(1000);
      state.accepted = true;
      review("accepted");
      tag("Accepted", "green", true);
      await sleep(900);
      deal(true);
      $("stage").classList.add("pop");
      $("f-stage").classList.add("flash-cell");
      $("f-amount").classList.add("flash-cell");
      later(1700, function () { $("f-stage").classList.remove("flash-cell"); $("f-amount").classList.remove("flash-cell"); });
      await sleep(2000);
      if (mode === "short") { await sleep(1800); return; }
      await cursorTo($("tab-timeline"), 0.5);
      await click($("tab-timeline"), "on");
      tab("timeline");
      timeline(EVENTS.slice(0, 2));
      await sleep(500);
      addEvent(EVENTS[2]);
      await sleep(3600);
    }
  ];

  /* ---------- Chapters + loop ---------- */
  var SEQ = mode === "short" ? [3, 4] : [0, 1, 2, 3, 4];
  var SHORT_CAPTIONS = { 3: "Your client accepts on the quote page…", 4: "…and the deal in Twenty is won: Customer, $6,903.00." };
  var chapNav = mount.querySelector(".pd-chapters"), caption = mount.querySelector(".pd-caption");
  if (chapNav) chapNav.innerHTML = CHAPTERS.map(function (c, i) { return '<button type="button" data-i="' + i + '"><b>' + (i + 1) + "</b><span>" + c[0] + "</span></button>"; }).join("");
  var current = SEQ[0];
  function markChapter(i) {
    current = i;
    if (chapNav) Array.prototype.forEach.call(chapNav.children, function (b, j) {
      b.classList.toggle("on", j === i);
      b.classList.toggle("done", j < i);
    });
    if (caption) caption.textContent = mode === "short" ? SHORT_CAPTIONS[i] : CHAPTERS[i][1];
  }
  async function play(from) {
    ++run;
    timers.forEach(clearTimeout); timers = [];
    try {
      for (var k = Math.max(0, SEQ.indexOf(from)), first = true; ; k = (k + 1) % SEQ.length, first = false) {
        var i = SEQ[k];
        if (first || k === 0) {
          prep(i);
          if (mode === "short") cursorPark(W * 0.78, H * 0.3, true);
        }
        markChapter(i);
        await scenes[i]();
      }
    } catch (e) {
      if (!(e instanceof Cancelled)) throw e;
    }
  }
  if (chapNav) chapNav.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var i = +b.getAttribute("data-i");
    if (reduceMotion) { staticScene(i); return; }
    play(i);
  });

  function staticScene(i) {
    run++;
    prep(i);
    markChapter(i);
    if (i === 1) review("sent");
    if (i === 3 || i === 4) { state.accepted = true; }
    if (i === 3) { $("client-page").innerHTML = clientPage(state, {}); scrollTo($("client-page"), clientScrollY(), true); }
    if (i === 4) { review("accepted"); deal(true); }
    $("cursor").style.display = "none";
  }

  var started = false;
  function start() {
    if (started) return;
    started = true;
    if (reduceMotion) staticScene(4);
    else play(SEQ[0]);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      // The full walkthrough starts from scene 1 when the visitor first scrolls to it.
      if (visible && mode !== "short") start();
    }, { threshold: 0.3 }).observe(mount);
  } else if (mode !== "short") start();
  var lastNarrow = null;
  window.addEventListener("resize", function () {
    var n = isNarrow();
    if (n !== lastNarrow) {
      lastNarrow = n; build();
      if (started || reduceMotion) reduceMotion ? staticScene(current) : play(current);
    }
    else fit();
  });

  build();
  lastNarrow = narrow;
  if (reduceMotion) staticScene(4);
  if (mode === "short") setTimeout(start, 1400);
  }
})();
