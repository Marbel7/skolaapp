# DEBUGGING RULES — ŠkolaApp

Tento dokument je povinný checklist pro každou větší změnu nebo opravu aplikace.

## 1. Nejdřív diagnostika, potom oprava

- Neopravuj symptom naslepo.
- Nejdříve najdi skutečný zdroj problému a celý datový/eventový tok, který k němu vede.
- Před změnou ověř aktuální runtime stav v browseru a Console.
- Pokud chyba může být v externí službě (Firebase/Firestore/Auth), ověř nejdříve, zda problém skutečně vzniká tam.

## 2. Jeden zdroj pravdy

Každý důležitý stav musí mít jasně určený jediný source of truth.

Pro tasks je architektura:

```text
Firestore
   ↓
TaskEngine.state
   ↓
TaskEngine.render()
   ↓
UI
```

Nesmí existovat paralelní databáze nebo druhý autoritativní stav.

## 3. Nikdy nestav nový systém vedle starého

- Pokud nahrazuješ starý modul, nejdříve zjisti všechny jeho závislosti a všechna jeho volání.
- Nový systém nesmí být jen další paralelní vrstva.
- Starý systém odstraň až poté, co je nový připravený a jeho závislosti jsou vyřešené.
- Po odstranění funkce vyhledej její výskyt v celém projektu a ověř, že nezůstala žádná stará volání.

## 4. Renderování

Pro tasks musí existovat jediný vstupní bod pro renderování:

```text
TaskEngine.render()
```

Před změnou rendereru vždy ověř:

- kdo renderer volá,
- kolikrát se volá,
- zda starý renderer ještě existuje,
- zda na něj nejsou navázané event handlery,
- zda jiný modul nemanipuluje přímo s task DOM.

## 5. Event handlery

- Před přidáním event handleru vyhledej existující handlery stejného eventu.
- Zvláštní pozornost věnuj capture vs. bubble fázi.
- Nesmí existovat dva handlery provádějící stejnou akci.
- Po změně event systému ověř kliknutí na desktopu i mobilu.

## 6. Firestore / Firebase

- Tasks používají současnou Firestore cestu a datový model, pokud není výslovně schválena změna.
- Pro realtime tasks používej pouze jeden `onSnapshot` listener.
- Nepřidávej paralelní `.get().then()` loader, pokud je `onSnapshot` zdrojem pravdy.
- LocalStorage nesmí být druhým zdrojem pravdy pro tasks.
- Optimistic update je povolen pouze tehdy, pokud je jasně definováno, jak jej potvrdí nebo vrátí Firestore.
- Při práci s Firebase vždy ověř, zda je objekt skutečně dostupný jako `window.*`. Například `const db = ...` není automaticky totéž jako `window.db`.

## 7. Legacy kompatibilita

- Před odstraněním globální proměnné nebo funkce vyhledej všechny její reference.
- Pokud starší část aplikace očekává např. `window.tasks`, nejdříve zjisti, kdo ji používá.
- Kompatibilní alias nesmí vytvořit druhý zdroj pravdy.

## 8. Bezpečnost změn

Před každou větší změnou:

1. vytvoř bezpečný backup commit,
2. změnu prováděj po logických krocích,
3. po každém kroku ověř Console,
4. pokud je potřeba měnit Firestore data, Firebase konfiguraci, Firestore rules nebo nesouvisející systém, ZASTAV se a vyžádej si schválení.

## 9. Runtime kontrola

Po implementaci vždy ověř:

- Console bez nových relevantních chyb,
- správné načtení dat po reloadu,
- správnou akci uživatele bez reloadu,
- správné uložení na server,
- potvrzení změny přes realtime listener,
- chování po odhlášení/přihlášení.

## 10. Desktop + mobil

Každou změnu interakce ověř minimálně na:

- desktop Chrome,
- iPhone Safari.

Pokud je funkce realtime, ověř také synchronizaci mezi dvěma zařízeními.

## 11. Testovací tok pro tasks

Minimální test:

1. načíst tasks,
2. přidat task,
3. ověřit okamžité zobrazení bez reloadu,
4. ověřit Firestore zápis,
5. toggle hotovo,
6. ověřit Firestore změnu,
7. smazat,
8. reload,
9. ověřit stav z Firestore,
10. ověřit druhé zařízení.

Při realtime testu musí být jasné, že výsledný stav přišel z Firestore/onSnapshot a není pouze lokálně vykreslený.

## 12. Když něco nefunguje

Postupuj v tomto pořadí:

```text
UI problém?
↓
Console chyba?
↓
Event handler funguje?
↓
Volá se správná funkce?
↓
Mění se state?
↓
Proběhne Firestore write?
↓
Přijde onSnapshot?
↓
Aktualizuje se state?
↓
Proběhne jediný render?
↓
Zobrazí se správné UI?
```

Nezahajuj náhodné změny více vrstev najednou.

## 13. Zásadní pravidlo

> **Neopravuj symptom. Nejdříve najdi skutečný zdroj problému a celý datový/eventový tok, který k němu vede.**

Cílem není pouze „aby to fungovalo“, ale aby po opravě zůstal systém jednodušší, s jedním jasným zdrojem pravdy a bez paralelních mechanismů.
