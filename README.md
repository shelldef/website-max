# Dream'z Kebab – Website

Statische Website (HTML/CSS/JS, kein Build-Schritt) für Dream'z Kebab mit zwei Filialen in 14163 Berlin:
**Mexikoplatz** (Mexikoplatz 1) und **Krumme Lanke** (Fischerhüttenstraße 89).

Beim Öffnen wählt man zuerst die Filiale, danach erscheinen deren Speisekarte, Öffnungszeiten
(mit Live-Status „geöffnet/geschlossen") und Bestellwege. Direktlinks: `index.html#mexikoplatz`,
`index.html#krumme-lanke`.

## Dateien
- `index.html` – Seitengerüst, Filialauswahl, Bestell-Fenster
- `data.js` – **alle Inhalte**: Öffnungszeiten, Telefon, Bestellwege, Speisekarte je Filiale
- `app.js` – Logik (Auswahl, Live-Status, Karte rendern)
- `styles.css`, `fonts/` – Design, selbst gehostete Schriften (DSGVO-freundlich)
- `impressum.html`, `datenschutz.html` – Rechtliches (gelb markierte Platzhalter ausfüllen!)

## Lokal ansehen
`python3 -m http.server` und http://localhost:8000 öffnen.

## Veröffentlichen (GitHub Pages)
Repository → Settings → Pages → Branch wählen → Ordner `/ (root)` → Save.
