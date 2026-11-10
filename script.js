// Öffnungszeiten je Filiale. Tage: 0 = Sonntag … 6 = Samstag.
// Zeiten als "HH:MM"; Schließzeiten nach Mitternacht (z. B. "01:00") werden korrekt behandelt.
const HOURS = {
  mexikoplatz: {
    0: ["11:00", "24:00"],
    1: ["10:00", "24:00"],
    2: ["10:00", "24:00"],
    3: ["10:00", "24:00"],
    4: ["10:00", "24:00"],
    5: ["10:00", "01:00"],
    6: ["10:00", "01:00"],
  },
  krummelanke: {
    0: ["10:00", "22:00"],
    1: ["10:00", "22:00"],
    2: ["10:00", "22:00"],
    3: ["10:00", "22:00"],
    4: ["10:00", "22:00"],
    5: ["10:00", "24:00"],
    6: ["10:00", "24:00"],
  },
};

const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// Aktuelle Zeit in Berlin, unabhängig von der Zeitzone des Geräts.
function berlinNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { day: days[get("weekday")], min: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

// Liefert { open, until } für eine Filiale.
function status(store) {
  const { day, min } = berlinNow();
  const h = HOURS[store];

  // Läuft noch die Öffnung vom Vortag über Mitternacht?
  const prev = h[(day + 6) % 7];
  if (prev) {
    const pClose = toMin(prev[1]);
    if (pClose < toMin(prev[0]) && min < pClose) return { open: true, until: prev[1] };
  }

  const today = h[day];
  if (!today) return { open: false };
  const open = toMin(today[0]);
  let close = toMin(today[1]);
  if (close <= open) close += 24 * 60; // über Mitternacht
  if (min >= open && min < close) return { open: true, until: today[1] };
  if (min < open) return { open: false, from: today[0] };
  return { open: false };
}

function render() {
  const { day } = berlinNow();
  for (const store of Object.keys(HOURS)) {
    const s = status(store);
    const until = s.until === "24:00" ? "Mitternacht" : `${s.until} Uhr`;
    const text = s.open ? `geöffnet bis ${until}` : s.from ? `öffnet um ${s.from} Uhr` : "geschlossen";
    document.querySelectorAll(`[data-store="${store}"]`).forEach((el) => {
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
      el.querySelectorAll(".state").forEach((st) => (st.textContent = text));
    });
  }

  // Heutige Zeile in den Öffnungszeiten hervorheben.
  const rowForDay = day === 0 ? 2 : day >= 5 ? 1 : 0;
  document.querySelectorAll(".hours").forEach((t) => {
    t.querySelectorAll("tr").forEach((tr, i) => tr.classList.toggle("today", i === rowForDay));
  });
}

render();
setInterval(render, 60 * 1000);
