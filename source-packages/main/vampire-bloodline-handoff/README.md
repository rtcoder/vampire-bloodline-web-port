# Vampire Bloodline — pakiet dla agenta wykonującego port

**Cel: pełny port gry Java/J2ME do HTML + JavaScript, z grafiką powiększoną dokładnie 4× i odświeżoną przez AI.** Zachowujemy oryginalną rozgrywkę, układ poziomów, animacje, postać, walkę i efekty krwi.

To pakiet wejściowy dla wykonawcy: zawiera poprawne strukturalnie archiwum JAR, wyodrębnione zasoby, statyczną analizę i instrukcje. **Implementacja gry w JS oraz remaster AI mają dopiero zostać wykonane przez agenta.** Pliki w `assets/original/` są niezmienionymi oryginałami; nie są grafikami 4×.

## Zacznij tutaj

1. Przeczytaj [AGENTS.md](AGENTS.md).
2. Sprawdź materiał wejściowy: `python3 tools/verify_source.py`.
3. Przeczytaj [audyt JAR-a](docs/REVERSE_ENGINEERING.md), [plan implementacji](docs/IMPLEMENTATION_PLAN.md) i [proces remasteru AI](docs/ASSET_WORKFLOW.md).
4. Zbuduj wierną wersję gry z oryginalnymi zasobami. Przenieś ją na docelowe grafiki AI 4× po odtworzeniu klatek, punktów zaczepienia i kolizji.
5. Dowieź kompletną kampanię, końcowe zasoby AI, testy najważniejszych reguł, porównanie z oryginałem i ZIP uruchamialnego projektu.

### Polecenie do wklejenia agentowi

```text
Pracuj w rozpakowanym katalogu tego pakietu. Przeczytaj AGENTS.md i README.md,
następnie docs/REVERSE_ENGINEERING.md, docs/IMPLEMENTATION_PLAN.md oraz
docs/ASSET_WORKFLOW.md. Wykonaj pełny, wierny port Vampire Bloodline z
załączonego JAR-a do HTML + JavaScript / Canvas 2D. Grafiki mają przejść
rzeczywistą obróbkę AI i mieć dokładnie 4× większą szerokość oraz wysokość.
Zachowaj mechanikę, animacje, mapy, przeciwników, krew i dźwięki oryginału.
Zacznij od weryfikacji źródła i uruchomienia wersji referencyjnej w emulatorze
obsługującym rozszerzenia Nokii. Kontynuuj implementację etapami do pełnej
gry; raportuj konkretne blokady i nie przedstawiaj samego prototypu ani
zwykłego skalowania jako ukończonego portu z remasterem AI.
```

## Co dokładnie jest źródłem

| Właściwość | Potwierdzone dane |
| --- | --- |
| Tytuł w manifeście | Vampire Bloodline |
| Wydawca w manifeście | Mforma |
| Wersja MIDletu | 1.0.0 |
| Platforma | MIDP 1.0 / CLDC 1.0; odwołania do rozszerzeń Nokii |
| Główna klasa | `Vampire` |
| JAR | `source/vampire-bloodline-176x208.jar` |
| Rozmiar JAR-a | 160 575 bajtów |
| Zawartość | 6 klas Java, 25 PNG, 13 WAV, 15 zasobów map, manifest |
| Lokalizacja tekstów tej kopii | Hiszpańska — `reference/decompiled/Strings.java` |
| Materiał 176×208 | `eve_title.png` i `background.png`; szczegóły obszaru gry w audycie |

SHA-256 oryginalnego JAR-a:

```text
ebe705c790f989af9b81c698b2f794fdac88266e75a6b704b9fbcbe94f631ab8
```

Użytkownik wskazał [Vampire Bloodline 176×208 w Mobiles24](https://www.mobiles24.co/downloads/s/88623-109-vampire_bloodline_176x208). Strona z opisem działała, lecz pobranie JAR/JAD zwracało 404. Załączony JAR pochodzi więc z [kolekcji Internet Archive](https://archive.org/details/1000_J2ME_Games_Pack), archiwum `1000JavaGames.zip`, wpisu `828 Java Games/VampireBloodline.jar`.

Zgadza się tytuł, przybliżony rozmiar i rozdzielczość grafik. **Nie potwierdzono tożsamości bajtowej z konkretnym uploadem Mobiles24.** Szczegóły, adres pobrania i czas pozyskania są w [source/provenance.json](source/provenance.json). Oryginalnego JAD-a nie pozyskano i nie zastąpiono go wygenerowanym plikiem.

## Zawartość pakietu

| Ścieżka | Zastosowanie |
| --- | --- |
| `AGENTS.md` | Zasady pracy, zakres, ograniczenia i warunki ukończenia dla wykonawcy |
| `source/` | Niezmieniony JAR, manifest, SHA-256 i pochodzenie kopii |
| `assets/original/` | 25 oryginalnych PNG, skopiowanych bajt w bajt z JAR-a |
| `assets/audio-original/` | 13 oryginalnych WAV, skopiowanych bajt w bajt |
| `assets/remaster-plan.json` | Lista grafik, ich rozmiary i docelowe wymiary 4×; status początkowy |
| `reference/resources/` | 15 binarnych plików map `m11`…`m53` |
| `reference/decompiled/` | Wynik dekompilacji 6 klas; materiał pomocniczy do analizy |
| `reports/` | Inwentaryzacja zasobów, stałe klas i log dekompilatora |
| `docs/REVERSE_ENGINEERING.md` | Ustalenia dotyczące klas, map, sterowania i mechaniki |
| `docs/IMPLEMENTATION_PLAN.md` | Kolejność implementacji i kryteria odbioru etapów |
| `docs/ASSET_WORKFLOW.md` | Procedura AI 4×, animacje, alpha, atlasy i integracja |
| `docs/HANDOFF_VERIFICATION.md` | Wyniki rzeczywiście wykonanych kontroli tego pakietu wejściowego |
| `prompts/ASSET_REMASTER.md` | Gotowe szablony promptów do pracy na oryginalnych obrazach |
| `tools/inspect_jar.py` | Powtarzalna inwentaryzacja i ekstrakcja zasobów, bez uruchamiania gry |
| `tools/verify_source.py` | Kontrola SHA-256, CRC, zgodności zasobów i planu wymiarów |
| `tools/decompile.sh` | Powtórzenie dekompilacji z podanym lokalnym CFR |
| `CHECKSUMS.sha256` | Sumy wszystkich plików w wydanej paczce, poza samym spisem |

Dekompilacja nie jest odzyskanym repozytorium autora ani gwarancją poprawności każdego fragmentu. Przy niejasnym warunku, castach lub ostrzeżeniu CFR sprawdź bytecode i działanie wersji referencyjnej. Nie naprawiaj automatycznie nietypowych reguł, jeżeli są częścią zachowania gry.

## Docelowa technologia i zachowanie

Przyjmujemy **HTML, CSS i zwykły JavaScript z ES modules oraz Canvas 2D**. Symulacja działa niezależnie od renderera. Projekt ma dać się uruchomić jako statyczna strona, bez serwera aplikacyjnego, Javy ani emulatora po stronie gracza. Pliki zasobów mają być lokalną częścią projektu; bez zależności runtime od archiwów z grami i CDN-ów bibliotek.

To wybór techniczny dla tego handoffu. Nie wprowadzaj Reacta, TypeScriptu, Phaser ani bundlera bez konkretnej potrzeby opisanej w decyzji architektonicznej. Dla tej wielkości gry własny, niewielki renderer Canvas powinien wystarczyć; poprawność portu jest ważniejsza od zastosowanego frameworka.

Wymagane: klawiatura, obsługa dotykowa, pauza, restart, dźwięk po interakcji użytkownika, zapis postępu, responsywny układ i wszystkie poziomy źródłowej kopii. Zmiana rozmiaru okna nie może zmieniać reguł świata ani zasięgu widzenia w sposób wpływający na trudność. Zachowaj oryginalne proporcje z letterboxingiem.

Nowe przyciski i instrukcje webowe pisz po polsku. Hiszpańskie teksty źródłowe zachowaj w danych referencyjnych. Tłumaczenie fabuły na polski trzymaj osobno i porównuj z oryginałem; nie wymyślaj nowej historii ani nowych scen.

## Grafika 4× — znaczenie wymagania

4× dotyczy **obu wymiarów pliku**, np. `player.png` 496×64 → 1984×256, a nominalny obraz 176×208 → 704×832. Oznacza to 16× więcej pikseli. Punkty świata, pozycje obiektów i hitboxy pozostają w oryginalnych jednostkach.

Wymagana jest rzeczywista obróbka AI oparta na źródłowych grafikach. Zachowujemy postać Evy, paletę, stroje, kierunki ruchu, sylwetki, kolejność klatek i klimat krwawej gry 2D. Techniczne nearest-neighbor 4× służy jako materiał porównawczy. Każdy finalny zasób musi mieć zapisane pochodzenie, prompt, rzeczywisty model/narzędzie i wynik kontroli.

Pełne zasady w [ASSET_WORKFLOW.md](docs/ASSET_WORKFLOW.md). Samo przeskalowanie CSS/canvas, filtr Lanczos lub zmiana nazwy katalogu na `ai` nie spełnia tego wymagania. Brak dostępu do narzędzia AI oznacza jawną blokadę tego etapu, a nie powód do oznaczenia go jako ukończony.

## Narzędzia lokalne

Inwentaryzacja i weryfikacja wymagają wyłącznie Pythona 3.10+:

```bash
python3 tools/verify_source.py
python3 tools/inspect_jar.py --extract
```

Ekstraktor zachowuje oryginalne bajty i odmawia nadpisania zasobu inną zawartością. Nie dekoduje formatu map ani nie wyznacza automatycznie klatek atlasów.

Do ponownej dekompilacji potrzebujesz Javy i [CFR](https://www.benf.org/other/cfr/). Gotowy wynik znajduje się już w paczce; dekompilatora nie trzeba pobierać, aby rozpocząć analizę. Przykład odtworzenia do osobnego katalogu:

```bash
bash tools/decompile.sh /sciezka/do/cfr-0.152.jar reference/decompiled-local
```

Po wykonaniu gry przez agenta docelowe uruchomienie ma wyglądać tak:

```bash
python3 -m http.server 8080 --directory web
```

Otwórz `http://localhost:8080`. **Katalog `web/` jest wynikiem przyszłej implementacji i nie znajduje się jeszcze w tym pakiecie.** Nie używaj `file://` jako sposobu uruchamiania ES modules i wczytywania zasobów.

## Stan w chwili przygotowania paczki

- Sprawdzono CRC JAR-a, manifest, SHA-256 i zasoby graficzne.
- Wyodrębnione obrazy, dźwięki i mapy mają identyczne bajty jak wpisy JAR-a.
- Wykonano dekompilację i statyczne rozpoznanie kodu.
- Nie uruchamiano oryginalnego MIDletu; zgodność gameplayu wymaga jeszcze porównania w emulatorze.
- Nie wykonano portu JS ani generowania/edycji grafik przez AI.

Szczegółowy zakres kontroli opisuje [raport weryfikacji pakietu](docs/HANDOFF_VERIFICATION.md).

Oryginalny JAR i jego zasoby zachowują prawa ich autorów. Ten pakiet nie nadaje im nowej licencji.
