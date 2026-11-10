// =====================================================================
//  Dream'z Kebab – Inhalte pro Filiale
//  Hier werden Öffnungszeiten, Kontakt, Bestellwege und Speisekarte gepflegt.
//  Öffnungszeiten: Tag 0 = Sonntag … 6 = Samstag, null = geschlossen.
//  Schließzeit "24:00" = Mitternacht, "01:00" = 1 Uhr nachts.
// =====================================================================

const FILLINGS = ["Chicken", "Sucuk", "Schnitzel", "Veggie", "Halloumi", "Falafel"];
const SAUCES = ["Kräuter", "Knoblauch", "Scharf", "Curry-Mango", "Hummus"];

// Karte laut Aushang im Laden (identisch mit den Wolt-Preisen).
const BASE_MENU = [
  {
    id: "klassiker",
    title: "Klassiker",
    tiles: true,
    fillings: true,
    items: [
      { name: "Bread", desc: "Im knusprigen Fladenbrot", price: "8,00", extras: [["Big", "+ 1,50"], ["Vollkorn", "+ 1,10"]] },
      { name: "Dürüm", desc: "In der dünnen Teigrolle", price: "9,00" },
      { name: "Lahmacun gerollt", desc: "Türkische Pizza, gefüllt und gerollt", price: "9,00" },
      { name: "Sandwich", desc: "Im Sandwichbrot", price: "8,50" },
      { name: "Teller", desc: "Dazu Pommes oder Reis", price: "15,00" },
    ],
  },
  {
    id: "specials",
    title: "Specials",
    items: [
      { name: "Döner Box", desc: "Mit Salat und/oder Pommes – auch mit Reis", price: "8,00" },
      { name: "Pommes", price: "4,00" },
      { name: "Currywurst", desc: "Geflügelwurst mit Currysoße", price: "3,50" },
      { name: "Currywurst mit Pommes", price: "7,00" },
      { name: "Lahmacun", price: "4,00" },
      { name: "Lahmacun mit Salat", price: "6,00" },
      { name: "Sigara Börek", desc: "1 Stück, mit Käse", price: "2,00" },
    ],
  },
  {
    id: "salat",
    title: "Salat",
    items: [
      { name: "Garten-Salat", desc: "Mixsalat, Tomate, Gurke, rote Zwiebeln und Mais", price: "6,00" },
    ],
  },
  {
    id: "fingerfood",
    title: "Fingerfood",
    sizes: ["6 Stk.", "9 Stk."],
    items: [
      { name: "Chicken Nuggets", prices: ["7,50", "8,50"] },
      { name: "Crispy Chicken Fingers", prices: ["7,50", "9,50"] },
      { name: "Hot Wings", prices: ["7,50", "9,50"] },
      { name: "Mozzarella Sticks", prices: ["7,50", "9,50"] },
      { name: "Chili-Cheese-Nuggets", prices: ["5,50", "7,50"] },
      { name: "Onion Rings", prices: ["5,50", "7,50"] },
    ],
  },
  {
    id: "dessert",
    title: "Dessert",
    items: [{ name: "Baklava", desc: "1 Stück", price: "2,00" }],
  },
];

// Getränke laut Wolt-Karte (Filiale Krumme Lanke).
const DRINKS = {
  id: "getraenke",
  title: "Getränke",
  items: [
    { name: "Ayran", desc: "0,25 l", price: "1,80" },
    { name: "Coca-Cola / Zero / Fanta / Sprite / Mezzo Mix", desc: "0,5 l", price: "2,80" },
    { name: "Fritz-Kola / Fanta Exotic / Uludağ Gazoz", desc: "0,33 l", price: "2,50" },
    { name: "Fuze Tea", desc: "0,4 l, verschiedene Sorten", price: "2,50" },
    { name: "ViO Still / Spritzig", desc: "0,5 l", price: "2,20" },
    { name: "Club Mate", desc: "0,5 l", price: "3,00" },
    { name: "Red Bull", desc: "0,25 l", price: "3,00" },
    { name: "Bier", desc: "Beck's, Berliner Kindl, Budweiser, Tyskie – 0,5 l", price: "2,80" },
    { name: "Augustiner Hell", desc: "0,5 l", price: "3,00" },
  ],
};

const STEAK = {
  id: "steak",
  title: "Steak Döner",
  badge: "Nur hier",
  note: "Echtes Steakfleisch aus der Rinderfärse, frisch vom Spieß.",
  items: [
    { name: "Steak Döner im Sesambrot", desc: "Mit Salat und Soße", price: null },
    { name: "Steak Dürüm", desc: "In der dünnen Teigrolle", price: null },
    { name: "Steak Döner Box", desc: "Mit Pommes und/oder Salat", price: null },
    { name: "Steak Döner Reis-Bowl", desc: "Auf türkischem Reis", price: null },
    { name: "Steak Döner Teller", desc: "Mit Salat, dazu Pommes oder Reis", price: null },
  ],
};

const STORES = {
  mexikoplatz: {
    slug: "mexikoplatz",
    name: "Mexikoplatz",
    fullName: "Dream'z Kebab Mexikoplatz",
    station: { type: "S", line: "S1", label: "S Mexikoplatz" },
    street: "Mexikoplatz 1",
    city: "14163 Berlin",
    phone: "+4917662243937",
    phoneDisplay: "0176 62243937",
    whatsapp: "4917662243937",
    maps: "https://maps.app.goo.gl/EiapNqf3WhWQZ3r67",
    hours: {
      0: ["11:00", "24:00"],
      1: ["10:00", "24:00"],
      2: ["10:00", "24:00"],
      3: ["10:00", "24:00"],
      4: ["10:00", "24:00"],
      5: ["10:00", "01:00"],
      6: ["10:00", "01:00"],
    },
    order: [
      { kind: "whatsapp", title: "Per WhatsApp bestellen", text: "Schreib uns deine Bestellung – abholen, ohne zu warten." },
      { kind: "phone", title: "Anrufen & abholen", text: "Ruf kurz an, wir machen alles fertig." },
    ],
    menu: [...BASE_MENU],
  },

  "krumme-lanke": {
    slug: "krumme-lanke",
    name: "Krumme Lanke",
    fullName: "Dream'z Kebab Krumme Lanke",
    tagline: "Mit Sitzplätzen und Kinderspielecke.",
    station: { type: "U", line: "U3", label: "U Krumme Lanke" },
    street: "Fischerhüttenstraße 89",
    city: "14163 Berlin",
    phone: "+493083544760",
    phoneDisplay: "030 83544760",
    maps: "https://www.google.com/maps/search/?api=1&query=Dream%27z+Kebab+2+Fischerh%C3%BCttenstra%C3%9Fe+89+14163+Berlin",
    hours: {
      0: ["12:00", "21:00"],
      1: ["10:00", "21:00"],
      2: ["10:00", "21:00"],
      3: ["10:00", "21:00"],
      4: ["10:00", "22:00"],
      5: ["10:00", "22:00"],
      6: ["12:00", "22:00"],
    },
    order: [
      { kind: "link", title: "Liefern lassen mit Wolt", text: "Bequem nach Hause bestellen.", url: "https://wolt.com/de/deu/berlin/restaurant/dreamz-kebab-burger" },
      { kind: "phone", title: "Anrufen & abholen", text: "Ruf kurz an, wir machen alles fertig." },
    ],
    menu: [STEAK, ...BASE_MENU, DRINKS],
  },
};
