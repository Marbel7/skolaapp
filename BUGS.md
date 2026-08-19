# SkolaApp — Known Bugs & Debugging Notes

## BUG-001: Bílá obrazovka po přihlášení na iOS Safari

**Status:** Opraveno (commit `5a5ade86ca34`, `37f0614ebc3e`)

**Symptom:**
- Na iPhone Safari: přihlášení → Google obrazovka → bílá obrazovka → návrat na login
- Na desktopu fungovalo správně

**Root cause:**
`mobile-enhancement.js` přepsal `fbSignIn()` na `signInWithRedirect` s `setPersistence` Promise wrapperem pro iOS.

Po redirect flow:
1. Stránka se znovu načte
2. `onAuthStateChanged(null)` přijde jako první → `fbShowLoginOverlay()` → login viditelný
3. `getRedirectResult()` najde usera ale nevolal `fbHideLoginOverlay()`
4. Výsledek: aplikace zůstala na login obrazovce

Navíc `provider.setCustomParameters({ prompt: 'select_account' })` způsoboval
problémy s popup flow na iOS Safari (Rodinný Dashboard tento parametr nemá a funguje).

**Oprava:**
- Odstraněn iOS redirect flow z `mobile-enhancement.js`
- Odstraněn `setCustomParameters` z `fbSignIn()`
- `fbSignIn()` je přímý `auth.signInWithPopup(provider)` bez wrapperů

**Funkční pattern (stejný jako Rodinný Dashboard):**
```js
function fbSignIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  // BEZ setCustomParameters
  // BEZ setPersistence Promise wrapperu
  // BEZ signInWithRedirect
  auth.signInWithPopup(provider).catch(function(err) { ... });
}
```

**Poučení:**
- `signInWithRedirect` na iOS Safari + GitHub Pages způsobuje blank page problém
- `Promise wrapper před signInWithPopup` přeruší user gesture context → Safari zablokuje popup
- Referenční implementace = Rodinný Dashboard (funguje) — neodchylovat se bez testu

---

## BUG-002: Úkoly se nezobrazují po přihlášení (accordion race condition)

**Status:** Opraveno (TaskEngine v1.0)

**Symptom:**
- Stat karty ukazovaly správný počet (13/28) ale accordion byl prázdný
- Po refresh stránky se úkoly zobrazily
- Přidání/checkbox/mazání nefungovalo na mobilu

**Root cause:**
Více vrstev záplat způsobilo race condition:
1. `renderTasks()` se volal synchronně při startu (`tasks = []`) → zapsal "Žádné úkoly"
2. Firestore `onSnapshot` přišel s daty → `renderTasks()` znovu
3. TIF `MutationObserver` nebo `hookRender` znovu aplikoval accordion stav
4. Výsledek: accordion se někdy zavřel nebo zobrazil prázdný stav

Navíc: `fbSetupListeners()` (onSnapshot) + `fbLoadAll()` (get().then) běžely paralelně
a přepisovaly `tasks[]` nezávisle.

**Oprava:**
Nový `TaskEngine` (soubor `task-engine.js`):
- Jeden `onSnapshot` listener jako jediný zdroj pravdy
- `TaskEngine.render()` jako jediné místo které zapisuje do `#taskList`
- Žádný localStorage fallback pro tasks
- Optimistic update s rollback při Firestore chybě

**Firestore cesta:** `users/{uid}/tasks`
**Datový model:** `{ id, text, done, priority, createdAt }`

---

## BUG-003: Checkbox a smazání nefungovaly na iOS Safari

**Status:** Opraveno

**Symptom:**
- Klik na checkbox → pouze modré ohraničení, žádná fajfka
- Klik na × → nic se nestalo
- Na desktopu fungovalo

**Root cause:**
- `overflow: hidden` na `.tck` button → iOS Safari bug blokuje touch events
- TIF accordion handler běžel v capture phase (`true`) → interferoval s touch event model

**Oprava:**
- `overflow: visible` na `.tck`
- Accordion handler přepnut na bubbling phase (`false`)
- Explicitní skip list: `.tck, .tdel, [data-action], #taskAddBtn` → nechej event probublat

---

## Obecná pravidla pro debugging iOS Safari auth

1. **Nikdy nepoužívej `signInWithRedirect` na GitHub Pages** — cross-origin auth handler způsobuje blank page
2. **Nikdy nepoužívej Promise wrapper před `signInWithPopup`** — přeruší user gesture context
3. **Referenční implementace = Rodinný Dashboard** (`Marbel7/rodinny-dashboard`) — funguje na stejném iPhone
4. **Jedna změna = jeden test** — neměň SDK + auth + hosting najednou
5. **`setCustomParameters({ prompt: 'select_account' })` může způsobit problémy na iOS** — Rodinný Dashboard ho nemá

