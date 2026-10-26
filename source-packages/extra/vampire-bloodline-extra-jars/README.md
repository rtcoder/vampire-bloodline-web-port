# Vampire Bloodline — trzy dodatkowe JAR-y

Znalezione i pobrane **26 października 2026**. Wszystkie trzy pliki mają inne SHA-256 niż hiszpański JAR z wcześniejszego pakietu dla agenta. Archiwa przeszły kontrolę ZIP CRC; nie uruchamiano gry.

## Najbardziej przydatny do portu: angielski patch 176

`jars/vampire-bloodline-176-en-patch.jar` — **162 713 bajtów**.

Pochodzi z kolekcji **Kahvibreak 1.6**, jako `Games/VampireBloodline-176-en-patch.jar`. Angielskie teksty potwierdzono wewnątrz klas. Credits wskazują tłumaczenie **Lanzz, 2021, dla projektu Kahvibreak**. Jest to tłumaczenie społecznościowe, a nie potwierdzone oficjalne angielskie wydanie Mforma.

- [Bezpośredni JAR w Internet Archive](https://archive.org/download/kahvibreakwinbuilds/Kahvibreak%201.6.zip/Games%2FVampireBloodline-176-en-patch.jar)
- [Kolekcja źródłowa](https://archive.org/details/kahvibreakwinbuilds)

Porównanie z wcześniejszym JAR-em o SHA-256 `ebe705c790f989af9b81c698b2f794fdac88266e75a6b704b9fbcbe94f631ab8`:

| Element | Wynik |
| --- | --- |
| Liczba plików wewnątrz JAR-a | 60 w obu kopiach, z pominięciem wpisu katalogowego |
| Pliki identyczne bajtowo | 57 |
| Pliki zmienione | `Strings.class`, `background.png`, `mainCanvas.class` |
| Dodane lub usunięte pliki | Brak |
| Wszystkie 15 map | Identyczne |
| Wszystkie 13 WAV | Identyczne |
| Pozostałe 24 PNG, w tym sprite'y i kafelki | Identyczne |
| Manifest | Identyczny |
| `mainCanvas.class` | Różni się 18 wpisów UTF-8 w constant pool: menu, loading, credits i inne teksty interfejsu |
| Część `mainCanvas.class` po constant pool | Identyczna bajtowo, łącznie z instrukcjami metod |

Zmieniony `background.png` nadal ma 176×208. Szczegóły zmian są w [reports/baseline-comparison.json](reports/baseline-comparison.json) oraz [reports/maincanvas-en-patch.json](reports/maincanvas-en-patch.json).

**Rekomendacja dla agenta:** wykorzystaj ten plik jako angielską referencję tekstów i interfejsu, zachowując pierwotny hiszpański JAR do porównań. Wcześniejszy `tools/verify_source.py` celowo sprawdza hash oryginału, więc nie podmieniaj pliku w `source/` bez aktualizacji dokumentacji i świadomej zmiany przypiętego źródła. Sam hash i statyczna analiza nie potwierdzają bezbłędnego przejścia kampanii w emulatorze.

## Angielski wariant oznaczony „128”

`jars/vampire-bloodline-128-en-n6230.jar` — **62 305 bajtów**.

- [Bezpośredni JAR w Internet Archive](https://archive.org/download/kahvibreakwinbuilds/Kahvibreak%201.6.zip/Games%2FVampireBloodline-128.jar)
- Angielskie dialogi potwierdzone w `Strings.class`.
- `128` jest oznaczeniem pliku w kolekcji; rzeczywistej rozdzielczości ekranu nie sprawdzono przez uruchomienie.
- Manifest ma wersję `1.0`, branding `N6230` oraz `MIDlet-CHEAT: X`. Sama obecność tej właściwości nie potwierdza działania cheatów.
- Siedem klas, dwa osobne PNG, 15 map i kontener `dracula.lmp`; brak osobnych wpisów WAV. Nie wnioskuj z tego automatycznie, że gra nie ma żadnego dźwięku.
- To inna struktura zasobów i klas niż duża kopia 176. Nie traktuj jej jako tego samego pliku tylko z mniejszym tłem.

## Hiszpański mały wariant Andrew-Lviv

`jars/vampire-bloodline-compact-es-andrew.jar` — **61 478 bajtów**.

- [Strona gry](https://www.andrew-lviv.net/downloads/games_view.php?id=16410&page=1)
- [Bezpośredni JAR](https://www.andrew-lviv.net/downloads/games_load.php?id=16410)
- Język hiszpański potwierdzony w `c.class` i `d.class`.
- Manifest ma wersję `1.0.0` oraz vendor `[ANDREW-LVIV] / Mforma`; są to metadane zmodyfikowane przez katalog.
- Siedem klas, głównie obfuskowanych; dwa osobne PNG, `dracula.lmp` i 15 map. Rozdzielczość niezweryfikowana.
- Wszystkie 15 map jest identycznych z mapami pierwotnego dużego JAR-a.
- Różnice względem małego wariantu angielskiego obejmują klasy i `dracula.lmp`, nie tylko nazwę w manifeście. Nie wyciągano wniosków o różnicach gameplayu na podstawie samych hashy klas.

## Potwierdzone duplikaty wcześniejszego JAR-a

Pobrano i porównano również poniższe kopie. Każda ma **160 575 bajtów** i SHA-256 `ebe705c790f989af9b81c698b2f794fdac88266e75a6b704b9fbcbe94f631ab8`; nie są kolejnymi odmiennymi wariantami, dlatego nie powielono ich w ZIP-ie.

- [Dedomil — pobranie](http://dedomil.net/games/5654/download-jar/75152), [strona gry](http://dedomil.net/games/5654). Katalog opisuje go jako Nokia 6230i [SPA], 208×208, mimo identyczności z naszą kopią. Opis rozdzielczości w katalogu nie dowodzi innego buildu.
- [Internet Archive, 782-java-games](https://archive.org/download/782-java-games/VampireBloodline.jar).
- [Kahvibreak 1.6, VampireBloodline-176.jar](https://archive.org/download/kahvibreakwinbuilds/Kahvibreak%201.6.zip/Games%2FVampireBloodline-176.jar).

## Wpisy katalogowe bez zweryfikowanego pobrania

PHONEKY ma m.in. wpisy [176×208](https://mobile.phoneky.com/games/?id=j4j7878), [176×220](https://mobile.phoneky.com/games/?id=j4j153), [240×320](https://mobile.phoneky.com/games/?id=j4j57856) i [208×208 Spanish](https://mobile.phoneky.com/games/?id=j4j133768). Zwykłe pobranie zwróciło weryfikację przeglądarki zamiast JAR-a. Nie uznajemy tych etykiet za potwierdzenie dodatkowych, unikalnych plików.

Drugi listing Andrew-Lviv, ID 87431, wskazywał kopię 208×208 SPA, lecz pobranie ID 87432 zwracało HTTP 403. Nie pozyskano tego pliku i nie obchodzono blokady.

## Weryfikacja i zawartość paczki

- `reports/variants.json`: dokładne hashe, rozmiary, manifesty, źródła i daty pobrania.
- `reports/baseline-comparison.json`: porównania plik po pliku ze wcześniejszym JAR-em.
- `reports/maincanvas-en-patch.json`: zmiany stałych tekstowych i hashe identycznej dalszej części klasy.
- `SHA256SUMS.txt`: sumy kontrolne zawartości tego pakietu, poza samym spisem.

Sumy można sprawdzić na macOS: `shasum -a 256 -c SHA256SUMS.txt`, albo na Linuksie: `sha256sum -c SHA256SUMS.txt`.

JAR-y są zachowane dokładnie w postaci pobranej ze wskazanych źródeł. Zmieniono wyłącznie nazwy plików w tej paczce dla czytelności. Nie uruchamiano MIDletów ani nie weryfikowano poprawności całej kampanii. Prawa do gry i zasobów pozostają przy ich autorach.
