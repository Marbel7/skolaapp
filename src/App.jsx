import { useState, useEffect } from "react";

const STAVY = {
  zadny: {
    label: "–",
    bg: "#f1f5f9",
    text: "#64748b",
    ring: "#cbd5e1",
  },
  samostatne: {
    label: "✔ Zvládá samostatně",
    bg: "#d1fae5",
    text: "#065f46",
    ring: "#6ee7b7",
  },
  vetsinou: {
    label: "◎ Většinou zvládá",
    bg: "#cffafe",
    text: "#155e75",
    ring: "#67e8f9",
  },
  castecne: {
    label: "~ Částečně zvládá",
    bg: "#fef3c7",
    text: "#92400e",
    ring: "#fcd34d",
  },
  podpora: {
    label: "! Potřebuje podporu",
    bg: "#ffe4e6",
    text: "#9f1239",
    ring: "#fda4af",
  },
};

const CYKLUS_STAVU = ["zadny", "samostatne", "vetsinou", "castecne", "podpora"];
const KLIC_ULOZISTE = "informatika_hodnoceni_v2";

const SADY_DOVEDNOSTI = [
  {
    id: "algoritmizace",
    ikona: "🤖",
    nazev: "Algoritmizace a programování",
    dovednosti: [
      "Porozumění zadání problému",
      "Návrh algoritmu",
      "Rozdělení problému na kroky",
      "Sestavení programu z bloků",
      "Použití opakování (cyklus)",
      "Použití podmínky (když – jinak)",
      "Testování programu",
      "Hledání a oprava chyby (debugging)",
      "Vysvětlení, jak program funguje",
      "Vylepšení programu podle zpětné vazby",
    ],
  },
  {
    id: "data",
    ikona: "📊",
    nazev: "Data, informace a modelování",
    dovednosti: [
      "Vyhledání potřebné informace",
      "Rozpoznání důležitých informací",
      "Třídění informací do skupin",
      "Zápis informací do tabulky",
      "Čtení informací z tabulky nebo grafu",
      "Vytvoření jednoduchého modelu nebo diagramu",
      "Porovnání informací",
    ],
  },
  {
    id: "informacni-systemy",
    ikona: "🗄️",
    nazev: "Informační systémy",
    dovednosti: [
      "Orientace v jednoduchém informačním systému",
      "Vyhledání záznamu",
      "Přidání nebo úprava záznamu",
      "Použití třídění nebo filtrů",
      "Kontrola správnosti údajů",
    ],
  },
  {
    id: "digitalni-technologie",
    ikona: "💻",
    nazev: "Digitální technologie",
    dovednosti: [
      "Základní práce s počítačem",
      "Práce se soubory (uložení, otevření)",
      "Používání digitálních nástrojů (např. editor, Scratch)",
      "Bezpečné chování na internetu",
      "Spolupráce při práci s digitální technologií",
      "Řešení jednoduchého technického problému",
    ],
  },
];

function nactiData() {
  try {
    const raw = localStorage.getItem(KLIC_ULOZISTE);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore invalid localstorage payload
  }
  return { tridy: [] };
}

function ulozData(data) {
  localStorage.setItem(KLIC_ULOZISTE, JSON.stringify(data));
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatujDatum(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function kratkyDatum(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function sestavPrehledDovednosti(zak, dovednosti, getStav) {
  const skupiny = {
    samostatne: [],
    vetsinou: [],
    castecne: [],
    podpora: [],
    zadny: [],
  };
  dovednosti.forEach((d) => {
    const stav = getStav(zak.id, d.id);
    if (skupiny[stav] !== undefined) {
      skupiny[stav].push(d.nazev);
    } else {
      skupiny.zadny.push(d.nazev);
    }
  });
  return skupiny;
}

async function generujSlovniHodnoceni(jmeno, nazevTridy, skupiny) {
  const { samostatne, vetsinou, castecne, podpora } = skupiny;

  const prompt = `Jsi zkušený a empatický učitel informatiky na základní škole.
Napiš krátké slovní hodnocení žáka pro rodiče.

=== VSTUPNÍ DATA ===
Jméno žáka: ${jmeno}
Třída: ${nazevTridy}

Dovednosti podle úrovně zvládnutí:
- Zvládá samostatně (výborně): ${
    samostatne.length > 0 ? samostatne.join(", ") : "žádné"
  }
- Většinou zvládá (dobře): ${
    vetsinou.length > 0 ? vetsinou.join(", ") : "žádné"
  }
- Částečně zvládá (rozvíjí se): ${
    castecne.length > 0 ? castecne.join(", ") : "žádné"
  }
- Potřebuje podporu (začíná): ${
    podpora.length > 0 ? podpora.join(", ") : "žádné"
  }

=== PRAVIDLA PRO PSANÍ HODNOCENÍ ===
1. Délka textu: přesně 3 až 5 vět – ne méně, ne více.
2. Struktura textu musí být v tomto pořadí:
   a) Nejprve popiš silné stránky žáka (co mu jde dobře).
   b) Pak jemně a podporujícím tónem popiš oblasti, kde se žák ještě rozvíjí.
   c) Na závěr přidej krátké povzbuzení nebo pozitivní výhled.
3. Tón textu: pozitivní, pedagogicky vhodný, srozumitelný pro rodiče.
4. Nepoužívej: číselné hodnocení, odrážky, seznam dovedností, slova jako "výborný", "špatný".
5. Text musí znít přirozeně jako by ho napsal skutečný učitel – ne jako automatický výpis.
6. Oslovi žáka jménem (pouze křestní jméno, pokud je zadáno celé jméno).
7. Dovednosti nepřepisuj doslovně – přeformuluj je do přirozené věty.
8. Piš pouze samotný odstavec hodnocení. Žádné záhlaví, žádný podpis.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`API chyba ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content
    .map((b) => b.text || "")
    .join("")
    .trim();
}

async function generujPDF(jmeno, nazevTridy, datum, dovednosti, getStav, slovniHodnoceni) {
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const sirka = 210;
  const okrajL = 20;
  const okrajP = 20;
  const obsahSirka = sirka - okrajL - okrajP;
  let y = 20;

  doc.setFillColor(44, 62, 107);
  doc.rect(0, 0, sirka, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Formativni hodnoceni – Informatika", okrajL, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Zakladni skola", okrajL, 22);
  doc.text(`Datum: ${datum}`, sirka - okrajP, 22, { align: "right" });
  y = 44;

  doc.setTextColor(44, 62, 107);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(jmeno, okrajL, y);
  y += 6;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Trida: ${nazevTridy}`, okrajL, y);
  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(okrajL, y, sirka - okrajP, y);
  y += 8;

  doc.setTextColor(44, 62, 107);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Hodnoceni dovednosti", okrajL, y);
  y += 6;

  const sloupecDovednost = okrajL;
  const sloupecHodnoceni = okrajL + obsahSirka * 0.68;
  const vyskaRadku = 7;

  doc.setFillColor(241, 245, 249);
  doc.rect(okrajL, y - 4, obsahSirka, vyskaRadku, "F");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Dovednost", sloupecDovednost + 2, y + 0.5);
  doc.text("Hodnoceni", sloupecHodnoceni + 2, y + 0.5);
  y += vyskaRadku;

  const stavTexty = {
    samostatne: "Zvlada samostatne",
    vetsinou: "Vetsinou zvlada",
    castecne: "Castecne zvlada",
    podpora: "Potrebuje podporu",
    zadny: "—",
  };
  const stavBarvyBG = {
    samostatne: [220, 252, 231],
    vetsinou: [204, 251, 241],
    castecne: [254, 243, 199],
    podpora: [254, 226, 226],
    zadny: [248, 250, 252],
  };
  const stavBarvyText = {
    samostatne: [21, 128, 61],
    vetsinou: [13, 148, 136],
    castecne: [146, 64, 14],
    podpora: [185, 28, 28],
    zadny: [148, 163, 184],
  };

  dovednosti.forEach((d, i) => {
    const stav = getStav(d.id);
    doc.setFillColor(...(i % 2 === 0 ? [255, 255, 255] : [248, 250, 252]));
    doc.rect(okrajL, y - 4, obsahSirka, vyskaRadku, "F");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const maxDelka = 55;
    const nazevZkr = d.nazev.length > maxDelka ? `${d.nazev.slice(0, maxDelka)}…` : d.nazev;
    doc.text(nazevZkr, sloupecDovednost + 2, y + 0.5);
    doc.setFillColor(...stavBarvyBG[stav]);
    doc.roundedRect(sloupecHodnoceni, y - 3.5, 48, 5.5, 1, 1, "F");
    doc.setTextColor(...stavBarvyText[stav]);
    doc.setFont("helvetica", "bold");
    doc.text(stavTexty[stav], sloupecHodnoceni + 2, y + 0.5);

    y += vyskaRadku;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(okrajL, y, sirka - okrajP, y);
  y += 10;

  doc.setTextColor(44, 62, 107);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Slovni hodnoceni", okrajL, y);
  y += 7;

  const textHodnoceni = slovniHodnoceni || "Slovni hodnoceni nebylo vygenerovano.";
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const radky = doc.splitTextToSize(textHodnoceni, obsahSirka - 6);
  const vyskaBloku = radky.length * 5 + 10;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.3);
  doc.roundedRect(okrajL, y - 4, obsahSirka, vyskaBloku, 2, 2, "FD");
  doc.text(radky, okrajL + 4, y + 2);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(okrajL, 282, sirka - okrajP, 282);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Vygenerovano aplikaci Hodnoceni - Informatika", okrajL, 287);
  doc.text(datum, sirka - okrajP, 287, { align: "right" });

  const bezDiakritiky = jmeno
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
  doc.save(`hodnoceni_${bezDiakritiky}_${nazevTridy}.pdf`);
}

function dnesDatum() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [data, setData] = useState(nactiData);
  const [stranka, setStranka] = useState("prehled");
  const [aktivniTridaId, setAktivniTridaId] = useState(null);

  useEffect(() => {
    ulozData(data);
  }, [data]);

  const aktivniTrida = data.tridy.find((t) => t.id === aktivniTridaId);

  function otevriTridu(id) {
    setAktivniTridaId(id);
    setStranka("trida");
  }

  function otevriHodnoceni(id) {
    setAktivniTridaId(id);
    setStranka("hodnoceni");
  }

  function pridejTridu(nazev) {
    if (!nazev.trim()) return;
    setData((prev) => ({
      ...prev,
      tridy: [
        ...prev.tridy,
        { id: uid(), nazev: nazev.trim(), zaci: [], dovednosti: [], hodiny: [], hodnoceni: {} },
      ],
    }));
  }

  function smazTridu(id) {
    setData((prev) => ({ ...prev, tridy: prev.tridy.filter((t) => t.id !== id) }));
    setStranka("prehled");
  }

  function aktualizujTridu(aktualizovana) {
    setData((prev) => ({
      ...prev,
      tridy: prev.tridy.map((t) => (t.id === aktualizovana.id ? aktualizovana : t)),
    }));
  }

  return (
    <div className="min-h-screen" style={{ width: "100%", minHeight: "100vh", background: "#f8f7f4", fontFamily: "Georgia" }}>
      <nav style={{ background: "#2c3e6b" }} className="px-6 py-4 flex items-center gap-4 shadow-md">
        <span className="text-2xl">📐</span>
        <span className="text-white font-bold text-xl cursor-pointer hover:opacity-80 transition" onClick={() => setStranka("prehled")}>Hodnocení – Informatika</span>
        {aktivniTrida && stranka !== "prehled" && (
          <div className="flex items-center gap-2 ml-2 text-blue-200 text-sm">
            <span className="cursor-pointer hover:text-white" onClick={() => setStranka("prehled")}>Třídy</span>
            <span>/</span>
            <span className={`cursor-pointer hover:text-white ${stranka === "trida" ? "text-white font-semibold" : ""}`} onClick={() => setStranka("trida")}>{aktivniTrida.nazev}</span>
            {stranka === "hodnoceni" && <><span>/</span><span className="text-white font-semibold">Hodnocení</span></>}
          </div>
        )}
      </nav>

      <div className="w-full">
        {stranka === "prehled" && <Prehled tridy={data.tridy} onPridejTridu={pridejTridu} onOtevriTridu={otevriTridu} onOtevriHodnoceni={otevriHodnoceni} onSmazTridu={smazTridu} />}
        {stranka === "trida" && aktivniTrida && <DetailTridy trida={aktivniTrida} onAktualizuj={aktualizujTridu} onOtevriHodnoceni={() => otevriHodnoceni(aktivniTridaId)} onZpet={() => setStranka("prehled")} />}
        {stranka === "hodnoceni" && aktivniTrida && <HodnoticiTabulka trida={aktivniTrida} onAktualizuj={aktualizujTridu} onZpet={() => setStranka("trida")} />}
      </div>
    </div>
  );
}

function Prehled({ tridy, onPridejTridu, onOtevriTridu, onOtevriHodnoceni, onSmazTridu }) {
  const [novyNazev, setNovyNazev] = useState("");

  function handlePridat() {
    onPridejTridu(novyNazev);
    setNovyNazev("");
  }

  return (
    <div style={{ width: "100%", padding: "40px" }}>
      <h1 className="text-3xl font-bold mb-1" style={{ color: "#2c3e6b" }}>Moje třídy</h1>
      <p className="text-slate-500 mb-6 text-sm">Vyberte třídu pro správu žáků, dovedností a hodin.</p>

      <div className="flex gap-3 mb-8">
        <input type="text" placeholder="Název třídy, např. 5.A" value={novyNazev} onChange={(e) => setNovyNazev(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePridat()} className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-400 bg-white text-sm" />
        <button onClick={handlePridat} className="px-5 py-2 rounded-xl text-white text-sm font-semibold shadow transition hover:opacity-90 active:scale-95" style={{ background: "#2c3e6b" }}>+ Přidat třídu</button>
      </div>

      {tridy.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-3">🏫</div>
          <p>Zatím žádné třídy. Přidejte první třídu výše!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tridy.map((trida) => (
            <KartaTridy key={trida.id} trida={trida} onOtevri={() => onOtevriTridu(trida.id)} onHodnoceni={() => onOtevriHodnoceni(trida.id)} onSmaz={() => {
              if (window.confirm(`Smazat třídu „${trida.nazev}“? Tuto akci nelze vrátit.`)) onSmazTridu(trida.id);
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function KartaTridy({ trida, onOtevri, onHodnoceni, onSmaz }) {
  const serazeneHodiny = [...(trida.hodiny ?? [])].sort((a, b) => b.datum.localeCompare(a.datum));
  const posledniHodina = serazeneHodiny[0];
  const moznoHodnotit = trida.zaci.length > 0 && trida.dovednosti.length > 0 && (trida.hodiny?.length ?? 0) > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-bold cursor-pointer hover:underline" style={{ color: "#2c3e6b" }} onClick={onOtevri}>{trida.nazev}</h2>
        <button onClick={onSmaz} className="text-slate-300 hover:text-rose-400 transition text-lg leading-none" title="Smazat třídu">×</button>
      </div>

      <div className="flex gap-3 text-xs text-slate-500 flex-wrap">
        <span>👥 {trida.zaci.length} žáků</span>
        <span>🎯 {trida.dovednosti.length} dovedností</span>
        <span>📅 {trida.hodiny?.length ?? 0} hodin</span>
      </div>

      {posledniHodina && (
        <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-1.5">Poslední hodina: <span className="text-slate-600 font-medium">{kratkyDatum(posledniHodina.datum)}{posledniHodina.nazev ? ` – ${posledniHodina.nazev}` : ""}</span></div>
      )}

      <div className="flex gap-2 mt-1">
        <button onClick={onOtevri} className="flex-1 py-2 rounded-xl text-sm font-medium border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 transition">Spravovat</button>
        <button onClick={onHodnoceni} disabled={!moznoHodnotit} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#2c3e6b" }} title={!moznoHodnotit ? "Nejprve přidejte žáky, dovednosti a alespoň jednu hodinu" : ""}>Hodnotit →</button>
      </div>
    </div>
  );
}

function DetailTridy({ trida, onAktualizuj, onOtevriHodnoceni, onZpet }) {
  const [novyZak, setNovyZak] = useState("");
  const [novaDovednost, setNovaDovednost] = useState("");
  const [zobrazitSady, setZobrazitSady] = useState(false);

  function pridejZaka() {
    if (!novyZak.trim()) return;
    onAktualizuj({ ...trida, zaci: [...trida.zaci, { id: uid(), jmeno: novyZak.trim(), poznamka: "" }] });
    setNovyZak("");
  }

  function upravZaka(zakId, zmeny) {
    onAktualizuj({ ...trida, zaci: trida.zaci.map((z) => (z.id === zakId ? { ...z, ...zmeny } : z)) });
  }

  function odeberZaka(zakId) {
    const noveHodnoceni = {};
    Object.entries(trida.hodnoceni ?? {}).forEach(([hodinaId, zakMapa]) => {
      const { [zakId]: _, ...zbytek } = zakMapa;
      noveHodnoceni[hodinaId] = zbytek;
    });
    onAktualizuj({ ...trida, zaci: trida.zaci.filter((z) => z.id !== zakId), hodnoceni: noveHodnoceni });
  }

  function pridejDovednost() {
    if (!novaDovednost.trim()) return;
    onAktualizuj({ ...trida, dovednosti: [...trida.dovednosti, { id: uid(), nazev: novaDovednost.trim() }] });
    setNovaDovednost("");
  }

  function nactiSaduDovednosti(sada) {
    const existujiciNazvy = new Set(trida.dovednosti.map((d) => d.nazev.trim().toLowerCase()));
    const nove = sada.dovednosti.filter((nazev) => !existujiciNazvy.has(nazev.trim().toLowerCase())).map((nazev) => ({ id: uid(), nazev }));
    if (nove.length === 0) return;
    onAktualizuj({ ...trida, dovednosti: [...trida.dovednosti, ...nove] });
    setZobrazitSady(false);
  }

  function odeberDovednost(dovednostId) {
    const noveHodnoceni = {};
    Object.entries(trida.hodnoceni ?? {}).forEach(([hodinaId, zakMapa]) => {
      const novaZakMapa = {};
      Object.entries(zakMapa).forEach(([zakId, dovMapa]) => {
        const { [dovednostId]: _, ...zbytek } = dovMapa;
        novaZakMapa[zakId] = zbytek;
      });
      noveHodnoceni[hodinaId] = novaZakMapa;
    });
    onAktualizuj({ ...trida, dovednosti: trida.dovednosti.filter((d) => d.id !== dovednostId), hodnoceni: noveHodnoceni });
  }

  function pridejHodinu(datum, nazev) {
    onAktualizuj({ ...trida, hodiny: [...(trida.hodiny ?? []), { id: uid(), datum, nazev }] });
  }

  function odeberHodinu(hodinaId) {
    const noveHodnoceni = { ...(trida.hodnoceni ?? {}) };
    delete noveHodnoceni[hodinaId];
    onAktualizuj({ ...trida, hodiny: trida.hodiny.filter((h) => h.id !== hodinaId), hodnoceni: noveHodnoceni });
  }

  function upravHodinu(hodinaId, zmeny) {
    onAktualizuj({ ...trida, hodiny: trida.hodiny.map((h) => (h.id === hodinaId ? { ...h, ...zmeny } : h)) });
  }

  const moznoHodnotit = trida.zaci.length > 0 && trida.dovednosti.length > 0 && (trida.hodiny?.length ?? 0) > 0;

  return (
    <div style={{ padding: "40px" }}>
      <div className="flex items-center gap-3 mb-1">
        <button onClick={onZpet} className="text-slate-400 hover:text-slate-600 transition text-sm">← Zpět</button>
        <h1 className="text-3xl font-bold" style={{ color: "#2c3e6b" }}>Třída: {trida.nazev}</h1>
      </div>
      <p className="text-slate-500 text-sm mb-6">Spravujte žáky, dovednosti a hodiny. Pak otevřete hodnoticí tabulku.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Panel nazev="👥 Žáci" pocet={trida.zaci.length}>
          <RidekPridani placeholder="Jméno žáka, např. Anna K." hodnota={novyZak} onChange={setNovyZak} onPridat={pridejZaka} labelTlacitka="Přidat" />
          <SeznamZaku zaci={trida.zaci} onUpravit={upravZaka} onOdebrat={odeberZaka} />
        </Panel>

        <Panel nazev="🎯 Dovednosti" pocet={trida.dovednosti.length}>
          <RidekPridani placeholder="Dovednost, např. Algoritmické myšlení" hodnota={novaDovednost} onChange={setNovaDovednost} onPridat={pridejDovednost} labelTlacitka="Přidat" />
          <button onClick={() => setZobrazitSady((v) => !v)} className="w-full mb-3 py-2 rounded-xl text-sm font-medium border-2 border-dashed transition" style={zobrazitSady ? { borderColor: "#2c3e6b", color: "#2c3e6b", background: "#eef1f8" } : { borderColor: "#cbd5e1", color: "#64748b", background: "transparent" }}>
            📚 {zobrazitSady ? "Skrýt sady dovedností ▲" : "Načíst sadu dovedností ▼"}
          </button>

          {zobrazitSady && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Vyberte oblast RVP – dovednosti se přidají automaticky:</p>
              {SADY_DOVEDNOSTI.map((sada) => {
                const existujiciNazvy = new Set(trida.dovednosti.map((d) => d.nazev.trim().toLowerCase()));
                const uzMa = sada.dovednosti.filter((n) => existujiciNazvy.has(n.trim().toLowerCase())).length;
                const zbyva = sada.dovednosti.length - uzMa;
                return (
                  <button key={sada.id} onClick={() => nactiSaduDovednosti(sada)} disabled={zbyva === 0} className="w-full text-left px-3 py-2.5 rounded-lg border transition hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "#fff", borderColor: "#e2e8f0" }} title={zbyva === 0 ? "Všechny dovednosti z této sady jsou již přidány" : `Přidá ${zbyva} nových dovedností`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-700">{sada.ikona} {sada.nazev}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${zbyva === 0 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{zbyva === 0 ? "✓ Vše přidáno" : `+ ${zbyva} dovedností`}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{sada.dovednosti.length} dovedností celkem{uzMa > 0 && uzMa < sada.dovednosti.length && ` · ${uzMa} již máte`}</p>
                  </button>
                );
              })}
            </div>
          )}

          <SeznamDovednosti dovednosti={trida.dovednosti} onOdebrat={odeberDovednost} />
        </Panel>
      </div>

      <PanelHodin hodiny={trida.hodiny ?? []} onPridat={pridejHodinu} onOdebrat={odeberHodinu} onUpravit={upravHodinu} />

      <div className="mt-8 text-center">
        <button onClick={onOtevriHodnoceni} disabled={!moznoHodnotit} className="px-8 py-3 rounded-2xl text-white text-base font-bold shadow-md transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#2c3e6b" }}>Otevřít hodnoticí tabulku →</button>
        {!moznoHodnotit && <p className="text-slate-400 text-xs mt-2">Pro odemknutí tabulky přidejte žáky, dovednosti a alespoň jednu hodinu.</p>}
      </div>
    </div>
  );
}

function PanelHodin({ hodiny, onPridat, onOdebrat, onUpravit }) {
  const [noveDatum, setNoveDatum] = useState(dnesDatum());
  const [novyNazev, setNovyNazev] = useState("");
  const [otevrenyId, setOtevrenyId] = useState(null);
  const [editace, setEditace] = useState({ datum: "", nazev: "" });

  function handlePridat() {
    if (!noveDatum) return;
    onPridat(noveDatum, novyNazev.trim());
    setNovyNazev("");
    setNoveDatum(dnesDatum());
  }

  function otevriEditaci(hodina) {
    setOtevrenyId(hodina.id);
    setEditace({ datum: hodina.datum, nazev: hodina.nazev ?? "" });
  }

  function ulozEditaci(hodinaId) {
    if (!editace.datum) return;
    onUpravit(hodinaId, { datum: editace.datum, nazev: editace.nazev.trim() });
    setOtevrenyId(null);
  }

  const serazene = [...hodiny].sort((a, b) => b.datum.localeCompare(a.datum));

  return (
    <Panel nazev="📅 Hodiny" pocet={hodiny.length}>
      <div className="flex gap-2 mb-4 flex-wrap">
        <input type="date" value={noveDatum} onChange={(e) => setNoveDatum(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 text-sm bg-slate-50" />
        <input type="text" placeholder="Název hodiny (nepovinné), např. Podmínky" value={novyNazev} onChange={(e) => setNovyNazev(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePridat()} className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 text-sm bg-slate-50" />
        <button onClick={handlePridat} className="px-4 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90 active:scale-95 whitespace-nowrap" style={{ background: "#4a6fa5" }}>+ Přidat hodinu</button>
      </div>

      {serazene.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-3">Zatím žádné hodiny. Přidejte první hodinu výše.</p>
      ) : (
        <ul className="space-y-1">
          {serazene.map((hodina) => {
            const jeOtevrena = otevrenyId === hodina.id;
            return (
              <li key={hodina.id} className="rounded-xl border border-slate-100 overflow-hidden">
                <div className={`flex items-center justify-between px-3 py-2.5 group ${jeOtevrena ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 whitespace-nowrap">{kratkyDatum(hodina.datum)}</span>
                    <div>
                      <span className="text-xs text-slate-400 capitalize">{formatujDatum(hodina.datum).split(" ")[0]}</span>
                      {hodina.nazev && <span className="text-sm text-slate-700 ml-2 font-medium">– {hodina.nazev}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => (jeOtevrena ? setOtevrenyId(null) : otevriEditaci(hodina))} className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition" title="Upravit">✏️</button>
                    <button onClick={() => {
                      if (window.confirm(`Smazat hodinu ${kratkyDatum(hodina.datum)}?\nSmaže se i veškeré hodnocení z této hodiny.`)) onOdebrat(hodina.id);
                    }} className="text-slate-300 hover:text-rose-400 transition text-base leading-none px-1" title="Smazat hodinu">×</button>
                  </div>
                </div>
                {jeOtevrena && (
                  <div className="px-3 pb-3 pt-2 bg-blue-50 border-t border-blue-100 space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Datum</label>
                        <input type="date" value={editace.datum} onChange={(e) => setEditace((p) => ({ ...p, datum: e.target.value }))} className="px-3 py-1.5 rounded-lg border border-blue-200 focus:outline-none focus:border-blue-400 text-sm bg-white" autoFocus />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-xs text-slate-500 mb-1 block">Název (nepovinné)</label>
                        <input type="text" value={editace.nazev} onChange={(e) => setEditace((p) => ({ ...p, nazev: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && ulozEditaci(hodina.id)} className="w-full px-3 py-1.5 rounded-lg border border-blue-200 focus:outline-none focus:border-blue-400 text-sm bg-white" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => ulozEditaci(hodina.id)} className="flex-1 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90" style={{ background: "#2c3e6b" }}>Uložit</button>
                      <button onClick={() => setOtevrenyId(null)} className="flex-1 py-1.5 rounded-lg text-slate-600 text-xs border border-slate-200 hover:bg-slate-100">Zrušit</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function HodnoticiTabulka({ trida, onAktualizuj, onZpet }) {
  const serazeneHodiny = [...(trida.hodiny ?? [])].sort((a, b) => b.datum.localeCompare(a.datum));
  const [aktivniHodinaId, setAktivniHodinaId] = useState(serazeneHodiny[0]?.id ?? null);

  useEffect(() => {
    if (!aktivniHodinaId && serazeneHodiny.length > 0) setAktivniHodinaId(serazeneHodiny[0].id);
  }, [trida.hodiny]);

  const aktivniHodina = trida.hodiny?.find((h) => h.id === aktivniHodinaId);

  function getStav(zakId, dovednostId) {
    return trida.hodnoceni?.[aktivniHodinaId]?.[zakId]?.[dovednostId] ?? "zadny";
  }

  function prepniStav(zakId, dovednostId) {
    const dalsi = CYKLUS_STAVU[(CYKLUS_STAVU.indexOf(getStav(zakId, dovednostId)) + 1) % CYKLUS_STAVU.length];
    onAktualizuj({
      ...trida,
      hodnoceni: {
        ...trida.hodnoceni,
        [aktivniHodinaId]: {
          ...(trida.hodnoceni?.[aktivniHodinaId] ?? {}),
          [zakId]: {
            ...(trida.hodnoceni?.[aktivniHodinaId]?.[zakId] ?? {}),
            [dovednostId]: dalsi,
          },
        },
      },
    });
  }

  if (!aktivniHodina) {
    return <div className="text-center py-20 text-slate-400"><p>Žádná hodina není k dispozici.</p><button onClick={onZpet} className="mt-4 text-blue-500 text-sm hover:underline">← Zpět</button></div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <div className="flex items-center gap-3 mb-1">
        <button onClick={onZpet} className="text-slate-400 hover:text-slate-600 transition text-sm">← Zpět</button>
        <h1 className="text-3xl font-bold" style={{ color: "#2c3e6b" }}>Hodnocení: {trida.nazev}</h1>
      </div>
      <p className="text-slate-500 text-sm mb-4">Kliknutím na buňku změníte stav: <strong>— → Samostatně → Většinou → Částečně → Podpora</strong></p>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Vyberte hodinu:</p>
        <div className="flex gap-2 flex-wrap">
          {serazeneHodiny.map((hodina) => (
            <button key={hodina.id} onClick={() => setAktivniHodinaId(hodina.id)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border-2 ${aktivniHodinaId === hodina.id ? "border-blue-500 text-blue-700 bg-blue-50" : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"}`}>
              📅 {kratkyDatum(hodina.datum)}{hodina.nazev && <span className="ml-1 opacity-70">– {hodina.nazev}</span>}
            </button>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">Zobrazena: <span className="font-semibold text-slate-700">{formatujDatum(aktivniHodina.datum)}{aktivniHodina.nazev && ` – ${aktivniHodina.nazev}`}</span></div>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        {Object.entries(STAVY).map(([k, v]) => (
          <span key={k} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: v.bg, color: v.text }}>{v.label}</span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-sm border border-slate-200">
        <table className="border-collapse w-full bg-white" style={{ minWidth: `${200 + trida.dovednosti.length * 150}px` }}>
          <thead>
            <tr>
              <th className="text-left px-4 py-3 text-sm font-bold border-b border-slate-200 sticky left-0 bg-white z-10" style={{ color: "#2c3e6b", minWidth: 180 }}>Žák / Žákyně</th>
              {trida.dovednosti.map((d) => <th key={d.id} className="px-3 py-3 text-xs font-semibold text-slate-600 border-b border-slate-200 text-center" style={{ minWidth: 150 }}>{d.nazev}</th>)}
              <th className="px-3 py-3 text-xs font-semibold text-slate-400 border-b border-slate-200 text-center" style={{ minWidth: 80 }}>Souhrn</th>
            </tr>
          </thead>
          <tbody>
            {trida.zaci.map((zak, idx) => {
              const pocetZvladnutych = trida.dovednosti.filter((d) => ["samostatne", "vetsinou"].includes(getStav(zak.id, d.id))).length;
              return (
                <tr key={zak.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700 border-b border-slate-100 sticky left-0 z-10" style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <div>{zak.jmeno}</div>
                    {zak.poznamka && <div className="text-xs text-slate-400 font-normal mt-0.5 truncate max-w-xs" title={zak.poznamka}>📝 {zak.poznamka}</div>}
                  </td>
                  {trida.dovednosti.map((d) => {
                    const s = STAVY[getStav(zak.id, d.id)];
                    return (
                      <td key={d.id} className="px-2 py-2 border-b border-slate-100 text-center">
                        <button onClick={() => prepniStav(zak.id, d.id)} style={{ background: s.bg, color: s.text, border: `2px solid ${s.ring}`, width: "100%", padding: "6px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }} title="Kliknutím změníte hodnocení">{s.label}</button>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 border-b border-slate-100 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${pocetZvladnutych === trida.dovednosti.length && trida.dovednosti.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{pocetZvladnutych}/{trida.dovednosti.length}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SouhrnTridy trida={trida} getStav={getStav} />
      <PanelHodnoceniZaka trida={trida} nazevTridy={trida.nazev} getStav={getStav} />
    </div>
  );
}

function PanelHodnoceniZaka({ trida, nazevTridy, getStav }) {
  const [vybranyZakId, setVybranyZakId] = useState(null);
  const [slovniHodnoceni, setSlovniHodnoceni] = useState("");
  const [nacitaSe, setNacitaSe] = useState(false);
  const [generujePDF, setGenerujePDF] = useState(false);
  const [chyba, setChyba] = useState("");

  const vybranyZak = trida.zaci.find((z) => z.id === vybranyZakId);

  async function handleGenerujHodnoceni() {
    if (!vybranyZak) return;
    setNacitaSe(true);
    setChyba("");
    setSlovniHodnoceni("");
    try {
      const skupiny = sestavPrehledDovednosti(vybranyZak, trida.dovednosti, (zakId, dovId) => getStav(zakId, dovId));
      const text = await generujSlovniHodnoceni(vybranyZak.jmeno, nazevTridy, skupiny);
      setSlovniHodnoceni(text);
    } catch {
      setChyba("Nepodařilo se vygenerovat hodnocení. Zkontrolujte připojení k internetu.");
    } finally {
      setNacitaSe(false);
    }
  }

  async function handleGenerujPDF() {
    if (!vybranyZak) return;
    setGenerujePDF(true);
    setChyba("");

    let textHodnoceni = slovniHodnoceni;
    if (!textHodnoceni) {
      try {
        const skupiny = sestavPrehledDovednosti(vybranyZak, trida.dovednosti, (zakId, dovId) => getStav(zakId, dovId));
        textHodnoceni = await generujSlovniHodnoceni(vybranyZak.jmeno, nazevTridy, skupiny);
        setSlovniHodnoceni(textHodnoceni);
      } catch {
        textHodnoceni = "";
      }
    }

    try {
      const dnesFormatovany = new Date().toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
      await generujPDF(vybranyZak.jmeno, nazevTridy, dnesFormatovany, trida.dovednosti, (dovId) => getStav(vybranyZakId, dovId), textHodnoceni);
    } catch (e) {
      setChyba("Nepodařilo se vytvořit PDF. Zkuste to znovu.");
      console.error(e);
    } finally {
      setGenerujePDF(false);
    }
  }

  if (trida.zaci.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h3 className="font-bold text-sm mb-1" style={{ color: "#2c3e6b" }}>📝 Slovní hodnocení a report pro rodiče</h3>
      <p className="text-xs text-slate-400 mb-4">Vyberte žáka, vygenerujte hodnocení textem nebo stáhněte PDF report.</p>

      <div className="mb-4">
        <label className="text-xs text-slate-500 mb-2 block font-medium">Vyberte žáka:</label>
        <div className="flex flex-wrap gap-2">
          {trida.zaci.map((zak) => (
            <button key={zak.id} onClick={() => { setVybranyZakId(zak.id); setSlovniHodnoceni(""); setChyba(""); }} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border-2 ${vybranyZakId === zak.id ? "border-blue-500 text-blue-700 bg-blue-50" : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"}`}>{zak.jmeno}</button>
          ))}
        </div>
      </div>

      {vybranyZak && (
        <div className="flex gap-3 flex-wrap mb-4">
          <button onClick={handleGenerujHodnoceni} disabled={nacitaSe || generujePDF} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "#4a6fa5" }}>
            {nacitaSe ? <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Generuji…</> : <>✍️ Vygenerovat slovní hodnocení</>}
          </button>

          <button onClick={handleGenerujPDF} disabled={nacitaSe || generujePDF} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "#2c3e6b" }}>
            {generujePDF ? <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Vytvářím PDF…</> : <>📄 Vytvořit report pro rodiče (PDF)</>}
          </button>
        </div>
      )}

      {chyba && <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">⚠️ {chyba}</div>}

      {vybranyZak && (() => {
        const prehled = sestavPrehledDovednosti(vybranyZak, trida.dovednosti, (zakId, dovId) => getStav(zakId, dovId));
        const skupinyUI = [
          { klic: "samostatne", label: "Zvládá samostatně", barva: "bg-emerald-100 text-emerald-700", ikona: "✓" },
          { klic: "vetsinou", label: "Většinou zvládá", barva: "bg-teal-100 text-teal-700", ikona: "◎" },
          { klic: "castecne", label: "Částečně zvládá", barva: "bg-amber-100 text-amber-700", ikona: "~" },
          { klic: "podpora", label: "Potřebuje podporu", barva: "bg-rose-100 text-rose-700", ikona: "!" },
        ];
        const maNejakyStav = skupinyUI.some((s) => prehled[s.klic].length > 0);
        if (!maNejakyStav) return null;
        return (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Přehled dovedností – {vybranyZak.jmeno}<span className="ml-2 font-normal normal-case text-slate-400">(tato data obdrží AI)</span></p>
            <div className="space-y-2">
              {skupinyUI.map(({ klic, label, barva, ikona }) => prehled[klic].length > 0 ? (
                <div key={klic} className="flex gap-2 items-start">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${barva}`}>{ikona} {label}</span>
                  <span className="text-xs text-slate-600 leading-relaxed">{prehled[klic].join(" · ")}</span>
                </div>
              ) : null)}
            </div>
          </div>
        );
      })()}

      {slovniHodnoceni && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">✍️ Slovní hodnocení – {vybranyZak?.jmeno}</p>
            <button onClick={() => navigator.clipboard?.writeText(slovniHodnoceni)} className="text-xs text-blue-500 hover:text-blue-700 transition px-2 py-0.5 rounded hover:bg-blue-100" title="Kopírovat text do schránky">📋 Kopírovat</button>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed italic">„{slovniHodnoceni}"</p>
          <p className="text-xs text-slate-400 mt-3">Text byl vygenerován AI. Před použitím ho prosím zkontrolujte a upravte dle potřeby.</p>
        </div>
      )}

      {!vybranyZak && <p className="text-xs text-slate-400 text-center py-3">👆 Vyberte žáka výše a poté klikněte na jedno z tlačítek.</p>}
    </div>
  );
}

function SouhrnTridy({ trida, getStav }) {
  if (trida.zaci.length === 0 || trida.dovednosti.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h3 className="font-bold text-sm mb-3" style={{ color: "#2c3e6b" }}>📊 Přehled třídy (podle dovedností)</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "6px" }}>Dovednost</th>
            <th style={{ color: "#16a34a" }}>✔</th>
            <th style={{ color: "#0ea5e9" }}>◎</th>
            <th style={{ color: "#f59e0b" }}>~</th>
            <th style={{ color: "#dc2626" }}>!</th>
          </tr>
        </thead>
        <tbody>
          {trida.dovednosti.map((d) => {
            const pocet = { samostatne: 0, vetsinou: 0, castecne: 0, podpora: 0 };
            trida.zaci.forEach((z) => {
              const stav = getStav(z.id, d.id);
              if (stav && pocet[stav] !== undefined) pocet[stav] += 1;
            });
            return (
              <tr key={d.id}>
                <td style={{ padding: "6px" }}>{d.nazev}</td>
                <td style={{ textAlign: "center", color: "#16a34a", fontWeight: "bold" }}>{pocet.samostatne}</td>
                <td style={{ textAlign: "center", color: "#0ea5e9", fontWeight: "bold" }}>{pocet.vetsinou}</td>
                <td style={{ textAlign: "center", color: "#f59e0b", fontWeight: "bold" }}>{pocet.castecne}</td>
                <td style={{ textAlign: "center", color: "#dc2626", fontWeight: "bold" }}>{pocet.podpora}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Panel({ nazev, pocet, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h3 className="font-bold text-sm mb-3" style={{ color: "#2c3e6b" }}>{nazev} <span className="text-slate-400 font-normal">({pocet})</span></h3>
      {children}
    </div>
  );
}

function RidekPridani({ placeholder, hodnota, onChange, onPridat, labelTlacitka }) {
  return (
    <div className="flex gap-2 mb-3">
      <input type="text" placeholder={placeholder} value={hodnota} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onPridat()} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 text-sm bg-slate-50" />
      <button onClick={onPridat} className="px-4 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90 active:scale-95" style={{ background: "#4a6fa5" }}>{labelTlacitka}</button>
    </div>
  );
}

function SeznamDovednosti({ dovednosti, onOdebrat }) {
  if (dovednosti.length === 0) return <p className="text-slate-400 text-sm text-center py-4">Zatím žádné dovednosti.</p>;
  return (
    <ul className="space-y-1">
      {dovednosti.map((d) => (
        <li key={d.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 group">
          <span className="text-sm text-slate-700">{d.nazev}</span>
          <button onClick={() => onOdebrat(d.id)} className="text-slate-300 hover:text-rose-400 transition opacity-0 group-hover:opacity-100 text-base leading-none" title="Odebrat">×</button>
        </li>
      ))}
    </ul>
  );
}

function SeznamZaku({ zaci, onUpravit, onOdebrat }) {
  const [otevrenyId, setOtevrenyId] = useState(null);
  const [editace, setEditace] = useState({ jmeno: "", poznamka: "" });

  if (zaci.length === 0) return <p className="text-slate-400 text-sm text-center py-4">Zatím žádní žáci.</p>;

  function otevriEditaci(zak) {
    setOtevrenyId(zak.id);
    setEditace({ jmeno: zak.jmeno, poznamka: zak.poznamka ?? "" });
  }

  function ulozEditaci(zakId) {
    if (!editace.jmeno.trim()) return;
    onUpravit(zakId, { jmeno: editace.jmeno.trim(), poznamka: editace.poznamka.trim() });
    setOtevrenyId(null);
  }

  return (
    <ul className="space-y-1">
      {zaci.map((zak) => {
        const jeOtevreny = otevrenyId === zak.id;
        return (
          <li key={zak.id} className="rounded-xl border border-slate-100 overflow-hidden">
            <div className={`flex items-center justify-between px-3 py-2 group ${jeOtevreny ? "bg-blue-50" : "hover:bg-slate-50"}`}>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-slate-700">{zak.jmeno}</span>
                {!jeOtevreny && zak.poznamka && <p className="text-xs text-slate-400 truncate mt-0.5">📝 {zak.poznamka}</p>}
              </div>
              <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => (jeOtevreny ? setOtevrenyId(null) : otevriEditaci(zak))} className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition" title="Upravit">✏️</button>
                <button onClick={() => onOdebrat(zak.id)} className="text-slate-300 hover:text-rose-400 transition text-base leading-none px-1" title="Odebrat">×</button>
              </div>
            </div>
            {jeOtevreny && (
              <div className="px-3 pb-3 pt-2 bg-blue-50 border-t border-blue-100 space-y-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Jméno žáka</label>
                  <input type="text" value={editace.jmeno} onChange={(e) => setEditace((p) => ({ ...p, jmeno: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && ulozEditaci(zak.id)} className="w-full px-3 py-1.5 rounded-lg border border-blue-200 focus:outline-none focus:border-blue-400 text-sm bg-white" autoFocus />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Poznámka (volitelná)</label>
                  <textarea value={editace.poznamka} onChange={(e) => setEditace((p) => ({ ...p, poznamka: e.target.value }))} placeholder="Např. potřebuje více podpory, nadaný žák..." rows={2} className="w-full px-3 py-1.5 rounded-lg border border-blue-200 focus:outline-none focus:border-blue-400 text-sm bg-white resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => ulozEditaci(zak.id)} className="flex-1 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90" style={{ background: "#2c3e6b" }}>Uložit</button>
                  <button onClick={() => setOtevrenyId(null)} className="flex-1 py-1.5 rounded-lg text-slate-600 text-xs border border-slate-200 hover:bg-slate-100">Zrušit</button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
