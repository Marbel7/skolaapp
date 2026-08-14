# SkolaApp — kompletní mobilní návrh

## 1. Produktový princip

Mobilní dashboard má být **rychlý pracovní nástroj**, ne zmenšená desktopová aplikace.

Hlavní otázka při každém návrhovém rozhodnutí:

> Co chce uživatel udělat jednou rukou během několika sekund?

Proto je spodní navigace permanentní a centrální akce je vždy dostupná.

## 2. Spodní navigace

Pořadí:

1. **Přehled** — návrat na hlavní dashboard.
2. **Materiály** — rychlý přístup k souborům a materiálům.
3. **Zachytit** — centrální akce, opticky dominantní.
4. **Evidence** — provozní evidence.
5. **Nastavení** — konfigurace aplikace.

Navigace je plovoucí, respektuje safe-area a má velmi lehký vizuální odstup od obsahu.

Ikonky současných rychlých odkazů se v této fázi **nemění**.

## 3. Centrální akce: Zachytit

Centrální tlačítko není pouze mikrofon. Je to **univerzální inbox pro okamžité zachycení informace**.

### Dvě základní volby

- **Úkol** — věc, kterou je potřeba udělat.
- **Myšlenka** — poznámka, nápad, připomínka nebo myšlenkový záchyt.

Obě volby používají existující úkolový a poznámkový systém aplikace. Nevytváříme paralelní úložiště.

## 4. Rychlé zachycení — modal / bottom sheet

Po klepnutí na centrální akci se otevře bottom sheet:

- grabber nahoře
- titulek **Rychlé zachycení**
- krátké vysvětlení bez technického žargonu
- segment Úkol / Myšlenka
- hlasová akce
- textové pole jako fallback i primární vstup v první verzi
- Zrušit / Uložit

Sheet je navržen pro jednu ruku a má minimální počet rozhodnutí.

## 5. Hlasový vstup — roadmapa

### V1

Mikrofon otevře Quick Capture. Textový vstup je okamžitě připraven.

### V2

Klepnutí na mikrofon spustí Web Speech API / podporovanou speech-to-text vrstvu.

Příklad:

> „Zítra ráno zkontrolovat rozvrh šesté bé.“

Výsledek se zobrazí jako editovatelný text před uložením.

### V3

Lehká klasifikace obsahu:

- „udělat / zkontrolovat / poslat / zavolat“ → návrh Úkol
- „nápad / poznámka / nezapomenout“ → návrh Myšlenka
- datum a čas → návrh termínu

Automatické rozhodnutí nikdy nesmí uživateli znemožnit ruční změnu.

## 6. UX pravidla

- Jedna dominantní akce na obrazovce.
- Dotykové cíle minimálně přibližně 44 px.
- Nezvyšovat počet navigačních položek jen proto, že existují na desktopu.
- Nepřidávat další globální FAB mimo centrální tlačítko.
- Nevyžadovat výběr sekce před uložením.
- Po uložení dát krátkou vizuální zpětnou vazbu.
- Ztráta rozepsaného obsahu nesmí nastat při náhodném zavření.
- Spodní navigace nesmí zakrývat poslední řádky obsahu.
- Respektovat `safe-area-inset-bottom` na iOS.

## 7. Vizuální systém

Používáme současný Iris systém aplikace:

- primární: `#6C5CE7`
- pozadí: `#F7F7FA`
- surface: `#FFFFFF`
- border: `#E8E8F0`
- text: `#202033`
- sekundární text: `#7C8198`

Centrální tlačítko má být jediný prvek spodní navigace s výrazným vyvýšením a stínem.

## 8. Chování při scrollování

Spodní navigace zůstává dostupná. Obsah stránky se posouvá pod ní.

Horní desktopová navigace se na mobilu redukuje na jednoduchý sticky header:

- logo / název
- notifikace
- uživatelská identita podle dostupného prostoru

## 9. Desktop

Desktopový dashboard se v této fázi nemění. Nový shell je primárně mobilní vrstva.

Neprovádět současně redesign desktopových rychlých odkazů nebo jejich ikon.

## 10. Implementační pořadí

1. Mobilní shell a spodní navigace.
2. Quick Capture bottom sheet.
3. Napojení Úkol / Myšlenka na existující ukládání.
4. Toast / potvrzení uložení.
5. Reálný speech-to-text.
6. Parsování termínů a jednoduchá klasifikace.
7. Teprve potom případné vizuální úpravy jednotlivých dashboardových karet.

## 11. Akceptační kritéria

Hotovo je tehdy, když uživatel na telefonu dokáže:

- otevřít libovolnou hlavní sekci jedním klepnutím,
- otevřít Quick Capture jedním klepnutím,
- zvolit Úkol nebo Myšlenka bez opuštění aktuální stránky,
- uložit text bez hledání konkrétní sekce,
- bezpečně zavřít sheet bez ztráty rozpracovaného textu,
- následně najít uložený obsah ve standardní sekci aplikace.
