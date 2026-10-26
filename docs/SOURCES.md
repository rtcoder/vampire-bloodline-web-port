# Źródła portu

Główną referencją portu jest angielski patch społecznościowy 176 z kolekcji **Kahvibreak 1.6**:

- Plik: `source-packages/extra/vampire-bloodline-extra-jars/jars/vampire-bloodline-176-en-patch.jar`.
- SHA-256: `05f8efed4397eb5530acba56f7a98e82ba88d538a2eb1e57d08ec669f37cf1c4`, 162 713 bajtów.
- Źródło archiwalne: [Kahvibreak 1.6 / Games/VampireBloodline-176-en-patch.jar](https://archive.org/download/kahvibreakwinbuilds/Kahvibreak%201.6.zip/Games%2FVampireBloodline-176-en-patch.jar).
- Atrybucja odczytana z `mainCanvas.class`: **English Translation by Lanzz, 2021 for Kahvibreak project**. To patch społecznościowy, nie potwierdzone oficjalne wydanie angielskie.

Oryginalny hiszpański JAR `source/vampire-bloodline-176x208.jar` pozostaje nienaruszony: SHA-256 `ebe705c790f989af9b81c698b2f794fdac88266e75a6b704b9fbcbe94f631ab8`, 160 575 bajtów. Jego pochodzenie, manifest, eksporty i `tools/verify_source.py` zachowano bez zmian. Angielskie źródło ma osobny verifier i raport; nie przepinano starego verifiera na inny hash.

Niezależny `python3 tools/verify_english.py` odczytuje oba JAR-y, liczy hashe, sprawdza CRC, porównuje wszystkie wpisy i parsuje constant pool. Potwierdzono dokładnie trzy zmienione wpisy: `Strings.class`, `background.png`, `mainCanvas.class`; pozostałych 57 jest identycznych. `mainCanvas.class` różni się dokładnie 18 stałymi UTF-8. Pozostałe typy stałych oraz dalsze 38 107 bajtów klasy są identyczne, SHA-256 dalszej części `8539af88ad4efbbecaeaae2abbe8f36b835dfe4bcee453d3a190eeaa1f690968`. Wszystkie 15 map, 13 WAV, 24 pozostałe PNG, manifest i pozostałe cztery klasy są identyczne. Raport: `reports/source-comparison.json`.

Autorzy zachowani w credits: projekt Paul Jacobson i Daniel Rammelt; kod Daniel Rammelt; grafika Paul Jacobson i Matthew Risley; producent Nic Garner; Mforma Europe; Software copyright 2003 Mforma Group. Prawa pozostają przy ich właścicielach.

## Dane runtime i czytelne referencje

`reference/english/classes/` przechowuje oryginalne bajty dwóch zmienionych klas. Pliki `*.constant-pool.json` pozwalają je przeczytać bez Javy. `Strings.java` odtworzono z rzeczywistych pól ConstantValue i instrukcji inicjalizatora `<clinit>` za pomocą `tools/extract_strings.py`. Czytelny `mainCanvas.java` powstał z hiszpańskiego wyniku CFR przez zastosowanie zweryfikowanych angielskich literałów; opis i liczba podmian są w `reconstruction.json`. Nie jest to nowy wynik dekompilatora ani projekt skompilowany w Javie. Stare `reference/decompiled/` pozostaje hiszpańską referencją.

`web/assets/original/` zawiera 25 PNG angielskiego JAR-a bez zmiany bajtów. Angielski `background.png` jest kanoniczny dla interfejsu; oryginalny hiszpański obraz zachowano jako `background-es.png`. `web/assets/audio/` zawiera wszystkie 13 oryginalnych WAV, a `web/assets/original/maps/` wszystkie 15 surowych map. Są to osobne kopie runtime; `assets/original/`, `assets/audio-original/` i `reference/resources/` pozostają nienaruszone.

`web/data/strings-en.json` i `strings-es.json` zawierają 4 sekcje `ruleString`, 16 tablic scen `cutString`, credits, 22 stałe `ui` i 18 literałów `runtimeUI` z `mainCanvas.class`. `runtimeUI.credits` angielskiej wersji zawiera atrybucję Lanzz. Znak `~` oznacza źródłowy podział wiersza; `~~` podział akapitu. Polska warstwa `strings-pl.json` tłumaczy wszystkie te teksty, zachowując liczbę, kolejność i zawartość scen. Nie dopisano scen ani dialogów. W polskim tekście użyto imienia **Eva**, zgodnego z hiszpańskim oryginałem (angielski patch stosuje również Eve).

## Rzeczywisty format map i kontrakt JSON

Kod `mainCanvas.loadMap()` używa `readByte()` dla nagłówka i deskryptorów oraz `read()` dla komórek. Dekoder `tools/decode_levels.py` odtwarza ten podział:

1. Bajt 0 signed: indeks tilesetu; nazwa obrazu `tiles{wartość+1}.png`.
2. Bajt 1 signed: dodatnia liczba N deskryptorów.
3. N trójek signed: `[grafika_lub_typ_obiektu, kolizja, efekt]`.
4. Pozostałe bajty unsigned: indeksy deskryptorów, **kolumnami po 16 komórek**. Brak osobnego pola szerokości; szerokość = pozostałe bajty / 16.

`web/data/levels.json` ma `schemaVersion:1`, `cellSize:16`, `height:16`, `order:"column-major"` i tablicę `levels` w kolejności m11,m12,m13,…,m53. Każda mapa:

```js
{
  id: "m11", chapter: 1, stage: 1, tileset: 1,
  width: 256, height: 16,
  descriptors: [[graphic, collision, effect], ...],
  cells: [descriptorIndex, ...], // cells[x * 16 + y]
  start: {x: 1, y: 11},         // współrzędne KAFELKÓW
  starts: [{x, y}, ...], exits: [{x, y}, ...],
  spawns: [{x, y, type}, ...],
  sha256: "hash surowej mapy", sourcePath: "m11"
}
```

Pozycje kafelków przelicza się na piksele przez `x*16`, `y*16`. `spawns` wyliczono dla grafik 10–36, z pominięciem komórek startu zgodnie z gałęzią `else if` loadera. To lista danych, nie instrukcja natychmiastowego uaktywnienia wszystkich obiektów: oryginał tworzy je w miarę odczytywania kolumn bufora 12×16. W źródłowym loaderze start ustawia gracza na x=16, a kamerę i pozycję ekranową wyznacza z y oraz `playerLatch`; nie należy mylić markera mapy z gotowym stanem kamery.

Dziesięć zwykłych map ma 256×16, pięć aren 16×16: łącznie 42 240 komórek. Każda mapa ma jeden start, zwykłe mapy po jednym wyjściu, areny nie mają deskryptora wyjścia. Kolejność tilesetów rozdziałów: **1, 2, 4, 3, 3**. Typy bossów zapisane w arenach to **14, 17, 16, 17, 18**; typ 15 nie występuje w mapach, więc nie wolno podstawiać kolejnych ID na podstawie numeru rozdziału.

Kolizje: 0 pusta, 1 blok, 2–5 skosy, 6 drabina, 7 start, 8 wyjście. Efekt 2 powoduje obrażenia, efekt 3 śmierć zgodnie z kodem gry. Grafiki 37/38 mogą być polami efektowymi/scenerią; nie są sprite’ami zakresu 10–36.

## Uruchomienie referencji

`reports/source-emulator-probe.json` dokumentuje lokalną próbę z 26.10.2026. `java -version`, `/usr/libexec/java_home -V` i próba `java -jar …176-en-patch.jar` kończą się kodem 1 z komunikatem o braku Java Runtime. `/usr/bin/java` i `javap` są systemowymi stubami. W sprawdzonych katalogach aplikacji, narzędzi i projektu nie znaleziono MicroEmulator, KEmulator ani FreeJ2ME obsługującego Nokia `FullCanvas` i `Sound`. Nie instalowano emulatora ani Javy. Nie uruchomiono MIDletu i nie zarejestrowano jego rozgrywki.

**Zgodność z uruchomionym oryginałem pozostaje niezweryfikowana.** Zamknięcie tej luki wymaga kompatybilnego środowiska J2ME/Nokia, uruchomienia wskazanego EN JAR-a w 176×208 i porównania konkretnych sekwencji wejść, walki, kamer oraz przejść. Sam identyczny bytecode pomiędzy ES i EN nie dowodzi poprawności portu JavaScript.

Kontrole:

```sh
python3 tools/verify_source.py
python3 tools/verify_english.py
python3 tools/decode_levels.py
python3 tools/extract_strings.py
python3 -m unittest discover -s tests -p 'data*_test.py'
```

Dwa generatory nadpisują wyłącznie poziomy JSON i źródłowe EN/ES JSON. Nie nadpisują polskiej warstwy ani JAR-ów. Testy porównują zrekonstruowane bajty wszystkich map z oryginalnym JAR-em, sprawdzają signed/unsigned i porządek kolumn oraz dokładność kopii zasobów i atrybucję.
