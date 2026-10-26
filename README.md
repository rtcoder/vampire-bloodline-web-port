# Vampire Bloodline — port przeglądarkowy

Port wersji J2ME 176×208 do **HTML, CSS, JavaScript ES modules i Canvas 2D**. W repozytorium znajdują się wszystkie 15 map pięciu rozdziałów, źródłowe reguły walki i bossów, polskie dialogi, klawiatura/dotyk, dźwięki, pauza oraz zapis etapu. Gra działa lokalnie, bez Javy, emulatora, klucza API i procesu build.

## Uruchomienie

W katalogu rozpakowanego projektu:

```bash
python3 -m http.server 8080 --directory web
```

Otwórz **http://localhost:8080/**. Nie otwieraj `index.html` przez `file://` — moduły i dane wymagają serwera HTTP. Zawartość samego `web/` wystarcza do działania gry na dowolnym statycznym serwerze. Reszta projektu zawiera źródła, narzędzia i dowody weryfikacji.

## GitHub Pages

Workflow `.github/workflows/pages.yml` uruchamia się po każdym pushu do `main` oraz ręcznie przez **Actions → Deploy GitHub Pages → Run workflow** dla gałęzi `main`. Wykonuje testy JS i danych, a po ich powodzeniu publikuje wyłącznie katalog `web/`. Gra jest statyczna, więc nie wymaga kompilacji ani instalowania zależności npm.

Jednorazowo ustaw w repozytorium **Settings → Pages → Build and deployment → Source: GitHub Actions**. Workflow korzysta z wbudowanego `GITHUB_TOKEN`, bez dodatkowych sekretów. [Dokumentacja GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Domyślny adres po pierwszym udanym wdrożeniu: https://rtcoder.github.io/vampire-bloodline-web-port/.

## Sterowanie

| Akcja | Klawiatura |
|---|---|
| Lewo / prawo | ← / →, A / D albo 4 / 6 |
| Skok / wejście na drabinę | ↑, W, spacja albo 2 |
| Zejście po drabinie | ↓, S albo 8 |
| Atak / ugryzienie | J, Z albo 5 |
| Szybki skok w górę i w prawo | K, X albo 3 |
| Pauza / wznowienie | P, Escape lub przycisk Pauza |

Naciskaj atak ponownie, aby rozpocząć następny atak. Z bliska Eva gryzie kwalifikującego się przeciwnika i odzyskuje zdrowie. Z dystansu zużywa kołek. Ikona w prawym dolnym rogu pokazuje kołki lub możliwość ugryzienia. Nie dodano systemu combosów.

Nietoperz, para i spowolnienie aktywują się po zebraniu przedmiotu i mają źródłowe czasy działania. Nietoperzem steruje się we wszystkich kierunkach. Szybki skok zawsze prowadzi w prawo — tak działa oryginał.

Na ekranie dotykowym przyciski są pod grą. Można jednocześnie trzymać kierunek i skok/atak. Na komputerze pokazuje je przycisk „Pokaż dotyk”. Utrata focusu, ukrycie karty i anulowanie dotyku czyszczą wejście oraz zatrzymują grę. Dźwięk uruchamia się dopiero po interakcji.

Zapis w `localStorage` przechowuje etap, ukończenie, dźwięk i wybraną grafikę. „Kontynuuj” rozpoczyna zapisany etap, „Od początku etapu” przywraca pełne zdrowie. Brak dostępu do storage wyświetla komunikat; nie blokuje gry. „Nowa gra” wymaga potwierdzenia nadpisania istniejącego checkpointu.

## Grafika AI 4×

W „Jak grać → Grafika” można przełączyć **Oryginalna / Remaster AI 4×** na tym samym stanie gry. Wszystkie finalne obrazy mają cztery razy większą szerokość i wysokość; świat nadal ma jednostki oryginału, a widok zawsze 176×208.

Wykonano faktyczną neuronową superrozdzielczość **FSRCNN x4**, uruchomioną lokalnie przez OpenCV DNN. To zachowawcza obróbka oryginałów, nie przerysowanie postaci w innym stylu. Maska alpha pochodzi z oryginału. Osobny baseline nearest-neighbor nie jest remasterem. Pierwszy wynik generatywnego ImageGen odrzucono za zmianę stroju i układu.

Metadane, model, surowe wyjścia, hashe i oceny: [raport remasteru](docs/ASSET_REMASTER_REPORT.md), `reports/remaster/`, `assets/ai-raw/`, `tools/models/`. Podgląd animacji i porównań: **http://localhost:8080/remaster-review.html**.

## Weryfikacja

Pełny automatyczny replay przeszedł wszystkie 15 map i finał zwykłymi wejściami, bez edycji stanu: 15 496 kroków przy domyślnym ziarnie przez produkcyjny adapter wejść, zero śmierci. Dokładny zakres rzeczywiście wykonanych prób, wyniki kampanii i ograniczenia są w [docs/VERIFICATION.md](docs/VERIFICATION.md). Zgodność z uruchomionym MIDletem pozostaje **niezweryfikowana**: na tej maszynie nie było Javy ani emulatora obsługującego rozszerzenia Nokii. Nie określamy portu jako potwierdzonego „1:1”.

Kontrole lokalne (Node.js 22+ dla testów JS, Python 3.10+ dla źródeł; weryfikatory PNG dodatkowo wymagają Pillow — środowisko opisano w raporcie remasteru):

```bash
npm test
python3 -m unittest discover -s tests -p 'data*_test.py'
python3 tools/verify_source.py
python3 tools/verify_english.py
python3 tools/verify_remaster.py
python3 tools/check_tile_seams.py
```

Testy integracyjne w przeglądarce: **http://localhost:8080/qa.html**, przycisk „Uruchom testy”. Parametr `?debug` udostępnia stan diagnostyczny i rysuje hitbox gracza. Zwykła strona nie pokazuje narzędzi debug.

## Źródła i prawa

- Referencja tekstów/interfejsu: `source/vampire-bloodline-176-en-patch.jar`, SHA-256 `05f8efed4397eb5530acba56f7a98e82ba88d538a2eb1e57d08ec669f37cf1c4`.
- Angielskie tłumaczenie społecznościowe: **Lanzz, 2021, Kahvibreak**.
- Niezmieniona hiszpańska referencja mechaniki: `source/vampire-bloodline-176x208.jar`, SHA-256 `ebe705c790f989af9b81c698b2f794fdac88266e75a6b704b9fbcbe94f631ab8`.
- Oryginał: Mforma Europe / Mforma Group, 2003. Projekt Paul Jacobson i Daniel Rammelt, kod Daniel Rammelt, grafika Paul Jacobson i Matthew Risley, producent Nic Garner.

Dokładne pochodzenie i porównanie: [docs/SOURCES.md](docs/SOURCES.md). ES i EN pozostają osobnymi źródłami; oryginalny weryfikator ES zachowano. Polski przekład ma osobny plik `web/data/strings-pl.json`. Nie dodano nowych scen fabularnych.

Oryginalne JAR-y, grafiki, audio i kod pochodzący z gry zachowują prawa autorów. Istniejący plik `LICENSE` repozytorium nie zmienia licencji tych materiałów. Model FSRCNN ma własną dołączoną licencję w `tools/models/FSRCNN-LICENSE.txt`.
