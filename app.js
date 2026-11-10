(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const STORAGE_KEY = "dreamz-filiale";

  // ---------- Zeit & Öffnungsstatus (immer Berliner Zeit) ----------
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmt = (t) => (t === "24:00" ? "0:00" : t.replace(/^0(\d)/, "$1"));

  function berlinNow() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[get("weekday")], min: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
  }

  function statusOf(store) {
    const { day, min } = berlinNow();
    const h = store.hours;
    const prev = h[(day + 6) % 7];
    if (prev && toMin(prev[1]) < toMin(prev[0]) && min < toMin(prev[1])) {
      return { open: true, text: `Geöffnet bis ${fmt(prev[1])} Uhr` };
    }
    const today = h[day];
    if (today) {
      const o = toMin(today[0]);
      let c = toMin(today[1]);
      if (c <= o) c += 1440;
      if (min >= o && min < c) {
        const soon = c - min <= 30;
        return { open: true, soon, text: soon ? `Schließt bald · ${fmt(today[1])} Uhr` : `Geöffnet bis ${fmt(today[1])} Uhr` };
      }
      if (min < o) return { open: false, text: `Öffnet heute um ${fmt(today[0])} Uhr` };
    }
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (h[d]) return { open: false, text: `Öffnet ${i === 1 ? "morgen" : DAY_NAMES[d]} um ${fmt(h[d][0])} Uhr` };
    }
    return { open: false, text: "Geschlossen" };
  }

  function todayText(store) {
    const h = store.hours[berlinNow().day];
    return h ? `Heute ${fmt(h[0])} – ${fmt(h[1])} Uhr` : "Heute geschlossen";
  }

  function paintStatus(el, s) {
    el.classList.toggle("is-open", s.open && !s.soon);
    el.classList.toggle("is-soon", !!s.soon);
    el.classList.toggle("is-closed", !s.open);
    $(".state", el).textContent = s.text;
  }

  // ---------- Bestelloptionen ----------
  function orderHref(store, opt) {
    if (opt.kind === "whatsapp") {
      const msg = encodeURIComponent(`Hallo Dream'z ${store.name}, ich möchte gern bestellen:\n`);
      return `https://wa.me/${store.whatsapp}?text=${msg}`;
    }
    if (opt.kind === "phone") return `tel:${store.phone}`;
    return opt.url;
  }
  const ICONS = {
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 7h13l-1.5 9h-10L3 7Zm4 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16 7l1-3h3"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  };

  function openOrder(slug) {
    const store = STORES[slug];
    const dlg = $("#order-sheet");
    $("#sheet-title", dlg).textContent = `Dream'z ${store.name}`;
    $(".sheet-options", dlg).innerHTML = store.order.map((o) => {
      const ext = o.kind === "link" || o.kind === "whatsapp";
      return `<a class="option option-${o.kind}" href="${esc(orderHref(store, o))}"${ext ? ' target="_blank" rel="noopener"' : ""}>
        <span class="option-icon">${ICONS[o.kind]}</span>
        <span class="option-body"><strong>${esc(o.title)}</strong><span>${esc(o.kind === "phone" ? `${store.phoneDisplay} · ${o.text}` : o.text)}</span></span>
        <span class="option-arrow" aria-hidden="true">›</span>
      </a>`;
    }).join("");
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
  }
  // Klick auf den Hintergrund schließt das Sheet
  $("#order-sheet").addEventListener("click", (e) => { if (e.target.id === "order-sheet") e.target.close(); });

  // ---------- Filialansicht rendern ----------
  function renderMenu(store) {
    const cats = $(".cats");
    cats.innerHTML = store.menu.map((c) => `<a href="#cat-${c.id}" data-cat="${c.id}">${esc(c.title)}</a>`).join("");

    $(".menu").innerHTML = store.menu.map((c) => {
      let body;
      if (c.sizes) {
        body = `<div class="size-head"><span></span>${c.sizes.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
          <ul class="rows rows-sizes">${c.items.map((it) => `<li><span class="row-name">${esc(it.name)}</span>${it.prices.map((p) => `<span class="row-price">${p} €</span>`).join("")}</li>`).join("")}</ul>`;
      } else if (c.id === "klassiker") {
        body = `<div class="tiles">${c.items.map((it) => `
          <article class="tile${it.highlight ? " tile-hl" : ""}">
            <span class="tile-emoji" aria-hidden="true">${it.emoji || ""}</span>
            <h4>${esc(it.name)}</h4>
            <p>${esc(it.desc || "")}</p>
            <p class="tile-price">${it.price} €</p>
            ${it.extras ? `<ul class="tile-extras">${it.extras.map(([n, p]) => `<li>${esc(n)} <span>${p} €</span></li>`).join("")}</ul>` : ""}
          </article>`).join("")}</div>`;
      } else {
        body = `<ul class="rows">${c.items.map((it) => `
          <li>
            <span class="row-main"><span class="row-name">${it.emoji ? `<span aria-hidden="true">${it.emoji}</span> ` : ""}${esc(it.name)}</span>${it.desc ? `<span class="row-desc">${esc(it.desc)}</span>` : ""}</span>
            <span class="row-price${it.price ? "" : " row-price-ask"}">${it.price ? `${it.price} €` : "Preis im Laden"}</span>
          </li>`).join("")}</ul>`;
      }
      return `<section class="cat${c.badge ? " cat-featured" : ""}" id="cat-${c.id}">
        <header class="cat-head"><h3>${esc(c.title)}</h3>${c.badge ? `<span class="badge">${esc(c.badge)}</span>` : ""}</header>
        ${c.note ? `<p class="cat-note">${esc(c.note)}</p>` : ""}
        ${body}
      </section>`;
    }).join("");
  }

  function renderStore(slug) {
    const store = STORES[slug];
    const root = $("#filiale");
    root.dataset.store = slug;
    $(".store-kicker", root).innerHTML = `<span class="station station-${store.station.type.toLowerCase()}">${store.station.type}</span> ${esc(store.station.label)}`;
    $(".store-title", root).textContent = store.fullName;
    $(".store-tagline", root).textContent = store.tagline || "";
    $(".store-tagline", root).hidden = !store.tagline;

    $(".store-actions", root).innerHTML = `
      <button class="btn btn-primary" data-order="${slug}">Jetzt bestellen</button>
      <a class="btn btn-soft" href="tel:${store.phone}">${ICONS.phone} ${esc(store.phoneDisplay)}</a>`;

    $(".addr", root).innerHTML = `${esc(store.street)}<br>${esc(store.city)}`;
    const route = $(".route", root);
    route.href = store.maps;
    route.innerHTML = `${ICONS.map} Route planen`;

    $(".sauces", root).innerHTML = SAUCES.map((s) => `<li>${esc(s)}</li>`).join("");

    const { day } = berlinNow();
    $(".hours", root).innerHTML = WEEK_ORDER.map((d) => {
      const h = store.hours[d];
      return `<tr${d === day ? ' class="today"' : ""}><th>${DAY_NAMES[d]}</th><td>${h ? `${fmt(h[0])} – ${fmt(h[1])}` : "geschlossen"}</td></tr>`;
    }).join("");

    renderMenu(store);
    refreshStatus();
  }

  function refreshStatus() {
    $$(".pick").forEach((card) => {
      const store = STORES[card.dataset.store];
      paintStatus($(".status", card), statusOf(store));
      $(".pick-today", card).textContent = todayText(store);
    });
    const root = $("#filiale");
    if (root.dataset.store) paintStatus($(".status", root), statusOf(STORES[root.dataset.store]));
  }

  // ---------- Auswahl / Navigation ----------
  function select(slug, { scroll = true, push = true } = {}) {
    if (!STORES[slug]) return;
    renderStore(slug);
    $("#filiale").hidden = false;
    $(".switcher").hidden = false;
    $$(".switcher [data-select]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.select === slug)));
    $(".switcher").dataset.active = slug;
    $$(".pick").forEach((p) => p.classList.toggle("is-selected", p.dataset.store === slug));
    try { localStorage.setItem(STORAGE_KEY, slug); } catch (_) {}
    if (push && location.hash !== `#${slug}`) history.pushState(null, "", `#${slug}`);
    if (scroll) $("#filiale").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  document.addEventListener("click", (e) => {
    const sel = e.target.closest("[data-select]");
    if (sel) { e.preventDefault(); select(sel.dataset.select); return; }
    const ord = e.target.closest("[data-order]");
    if (ord) { e.preventDefault(); openOrder(ord.dataset.order); return; }
    const cat = e.target.closest(".cats a");
    if (cat) {
      e.preventDefault();
      document.getElementById(cat.getAttribute("href").slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  window.addEventListener("popstate", () => {
    const slug = location.hash.slice(1);
    if (STORES[slug]) select(slug, { push: false });
  });

  // Aktive Kategorie beim Scrollen hervorheben
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$(".cats a").forEach((a) => {
        const on = a.dataset.cat === en.target.id.replace("cat-", "");
        a.classList.toggle("active", on);
        if (on) a.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      });
    });
  }, { rootMargin: "-140px 0px -60% 0px" });
  new MutationObserver(() => $$(".cat").forEach((c) => spy.observe(c))).observe($(".menu"), { childList: true });

  // ---------- Start ----------
  refreshStatus();
  setInterval(refreshStatus, 60_000);

  const fromHash = location.hash.slice(1);
  if (STORES[fromHash]) {
    select(fromHash, { push: false });
  } else {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}
    if (STORES[saved]) {
      // Zuletzt gewählte Filiale vormerken, aber die Auswahl oben zuerst zeigen.
      $$(".pick").forEach((p) => p.classList.toggle("is-last", p.dataset.store === saved));
    }
  }
})();
