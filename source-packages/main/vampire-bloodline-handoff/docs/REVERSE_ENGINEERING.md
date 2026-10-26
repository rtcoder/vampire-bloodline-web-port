# Audyt statyczny: Vampire Bloodline → HTML + JavaScript

## Zakres i wiarygodność

Przeanalizowano rzeczywisty [JAR](../source/vampire-bloodline-176x208.jar), SHA-256 `ebe705c790f989af9b81c698b2f794fdac88266e75a6b704b9fbcbe94f631ab8`. Pochodzenie opisuje [provenance.json](../source/provenance.json): Internet Archive, `1000JavaGames.zip`, element `828 Java Games/VampireBloodline.jar`. Nie potwierdzono identyczności bajtowej z niedostępnym pobraniem Mobiles24. Ta kopia zawiera **hiszpańskie teksty**; nie zakładać angielskiej ani polskiej lokalizacji.

CFR 0.152 zdekompilował wszystkie sześć klas, kończąc kodem 0. Zweryfikowano CRC obu archiwów oraz MD5 dekompilatora `8a85ada8cec494121246805a5562b82b`. [Log](../reports/decompiler.log) zawiera polecenie. Ostrzeżenia dotyczą nieobecnych bibliotek Nokia/MIDP. Pliki w `reference/decompiled/` są wynikiem narzędzia, nie odzyskanym projektem autora; nazwy lokalnych zmiennych i odtworzone typy mogą być niedoskonałe. **Nie uruchamiano MIDletu ani nie porównywano gry na żywo z emulatorem.** Poniższe ustalenia wynikają z kodu i bajtów zasobów.

## Mapa kodu

| Plik referencyjny | Najważniejsze punkty wejścia |
| --- | --- |
| [Vampire.java](../reference/decompiled/Vampire.java) | `startApp()` tworzy ekran, `pauseApp()` deleguje pauzę. |
| [ScrollTimerTask.java](../reference/decompiled/ScrollTimerTask.java) | `run()`, `splashType == 5`: aktualizacja, repaint, serviceRepaints. |
| [mainCanvas.java](../reference/decompiled/mainCanvas.java) | Konstruktor: ekran/timer/audio; `loadMap()`, `loadCol()`, `gameLoader()`, `updateGame()`, `paint()`, `keyPressed()`, `keyReleased()`, RMS. |
| [GraphicObjectManager.java](../reference/decompiled/GraphicObjectManager.java) | `loadSpriteGFX()`, `drawPlayer()`, `paint()`, `paintSprites()`, `getRandom()`. |
| [Sprite.java](../reference/decompiled/Sprite.java) | Konstruktor typów, `draw()`, `isCollidingWith()`, `setCollisionRectangle()`. |
| [Strings.java](../reference/decompiled/Strings.java) | `ruleString`, `cutString`: instrukcje, fabuła, etapy i napisy. |

`mainCanvas` dziedziczy po Nokia `FullCanvas`. Nie trzeba przenosić tej biblioteki: jej rolę przejmują Canvas 2D, obsługa wejścia, dźwięku i zapisu przeglądarki.

## Czas, ruch i kamera

Konstruktor wywołuje `gametimer.schedule(..., 100L, 100L)`: **nominalnie jeden krok co 100 ms, czyli 10 Hz**. Nie przepisuj `updateGame()` jako wywołania co klatkę 60/120 Hz. Rozdziel zegar symulacji od `requestAnimationFrame`; interpolacja obrazu może być późniejszym dodatkiem. Oryginalny timer nie gwarantuje idealnego czasu na każdym telefonie.

Szerokość świata widocznego wynosi `gameWidth = 176`. Wysokość jest zaokrąglonym w dół do wielokrotności 16 `getHeight()`; dla ekranu 176×208 wynosi 208. `CELL_SIZE = 16`; gracz ma logiczne 16×32, choć rysowana klatka zwykle 32×32. Przy 4× obraz ma **704×832**, ale pozycje, kolizje i prędkości pozostają w oryginalnych jednostkach.

Ruch poziomy i drabina to zwykle 4 px/krok. `jumpAmount = [16,16,12,12,8,8,8,4,4,4,0]`, `fastJumpAmount = [16,12,8,8,4,4,0]`, `deathArc = [-8,-4,0,4,8,8,16]`. To dyskretne reguły, nie ogólny silnik grawitacji. `adjustOnSlope()` rozstrzyga skosy. `ofsX`, `ofsY`, `moveX`, `moveY`, `playerLatch`, `lockScreen` sterują przewijaniem; pojawienie bossa blokuje kamerę.

**Pułapka:** `Sprite.draw()` przesuwa kołyszące się pickupy i zwiększa liczniki animacji. `mainCanvas.paint()` aktualizuje cząsteczki i przejścia ekranów. Przenieś te skutki uboczne do ustalonej fazy kroku, zachowując kolejność; sam renderer powinien tylko odczytywać stan. Inaczej wyższy FPS zmieni rozgrywkę.

## Format poziomów

`loadMap()` otwiera `m` + numer rozdziału + podetapu: `m11`…`m53`, **bez rozszerzenia**. Jest pięć rozdziałów po trzy etapy. [Raport bajtowy](../reports/static_format_audit.json) zawiera wszystkie deskryptory, rozmiary i walidację indeksów.

1. Bajt 0, odczyt signed: indeks tilesetu; obraz to `tiles{indeks+1}.png`.
2. Bajt 1, signed: liczba deskryptorów N.
3. N trójek signed: `[grafika/typ obiektu, kolizja, efekt]`.
4. Pozostałe bajty: indeksy deskryptorów, odczytywane unsigned, **kolumnami**, po 16 komórek wysokości.

Dziesięć zwykłych map ma 256×16 komórek; pięć map kończących się `3` ma 16×16. Wszystkie mają pełne kolumny i poprawne indeksy. Kolejność tilesetów rozdziałów to **1, 2, 4, 3, 3**, nie kolejność numeryczna rozdziałów. Oryginał utrzymuje bufor 12×16 i doczytuje kolumny przez `loadCol()`.

Drugi element deskryptora: 0 pustka, 1 blok, 2–5 skosy, 6 drabina, 7 start, 8 wyjście. Trzeci element: wartość 2 odbiera graczowi 4 zdrowia na krok w sprawdzanym miejscu, 3 uruchamia śmierć (`updateGame()`, sprawdzenia `getTileVal(2,...)`). Typy graficzne 10–36 uruchamiają także tworzenie sprite’ów; nie traktuj ich wyłącznie jako kafli tła.

## Sterowanie, walka i przeciwnicy

`keyPressed()/keyReleased()` rozpoznają akcje MIDP i klawiaturę liczbową. Standard: 4/6 ruch, 2 skok lub drabina, 8 zejście, 3 szybki skok ukośny, 5 atak. W kodzie istnieje osobne mapowanie Nokia 3650. Port może dodać WASD, strzałki i dotyk, zachowując te same akcje i warunki blokowania wejścia.

Stany obejmują `state_fire = 3`, `state_death = 9`, `state_bitten = 15`, `state_bite = 16`, `state_melee = 17`, `state_fjump = 18`, `state_call_stake = 19`, `state_call_ray = 20`. Sama obecność stałej nie dowodzi użycia jej przez gracza. Nie znaleziono osobnego systemu punktacji lub łańcuchów combo; pamięciowego opisu „combosy” nie należy przekładać na wymyślony mechanizm.

`gameLoader()` ustawia zdrowie 100 i zero kołków. Atak rozpoczyna licznik `refireTime = 15`; jeśli blisko stoi kwalifikujący się łowca/boss, następuje ugryzienie. W stanie ugryzienia gracz odzyskuje 2 zdrowia na krok, do 100; końcowe obrażenia celu wynoszą 20. W przeciwnym razie atak zużywa kołek i tworzy pocisk typu 101 przy liczniku 13. Pocisk zadaje 5 obrażeń typom 10–13; ta gałąź nie obejmuje bossów. Pickup 25 ustawia zapas na pięć kołków.

Typy 10/11 to warianty łowców, 12 pies, 13 upiór, 14–18 bossowie ze zdrowiem odpowiednio 60/100/140/160/200. Ich reguły w `updateGame()` obejmują zasięg, atak wręcz, pociski, ruch i specjalne ataki bossa. Zachowaj kolejność warunków i losowania `getRandom(3)`. „AI” przeciwników to te reguły; AI do remasteru grafik jest osobnym procesem. Pickupy 19/20/21 aktywują nietoperza, parę i spowolnienie przeciwników. Spowolnienie pomija część aktualizacji przeciwników na co drugim kroku.

## Grafika, audio i zapis

W archiwum jest 25 PNG i 13 WAV. `player.png` ma 496×64: zawiera różne szerokości klatek, w tym nietoperza 16×16. `drawPlayer()` wyznacza wycinki i przesunięcia; kierunki korzystają także z osobnych rzędów. `enemy_hunter.png` ma nietypowe **385×32**; nie usuwaj ostatniej kolumny automatycznie. `boss_jvh.png` ma 768×32. Atlas odtwórz z operacji clip/draw, nie z założenia jednolitej siatki. Hitboxy pozostają niezależne od obrazu; `isCollidingWith()` zalicza również dotknięcie krawędzi.

Konstruktor ładuje dziewięć dźwięków: slow, bat, vapor, fjump, suck, sun, sword, throw, die. Wszystkie 13 plików ma WAV PCM, mono, 8 bitów; `vapor.wav` ma 44100 Hz, pozostałe 8000 Hz. `vapour.wav` i `vapor.wav` to osobne zasoby. Zachowaj też cztery pliki nieużyte w tym loaderze.

`readRecords()/writeRecords()` zapisują w RMS `r`, rekord 1, cztery bajty: dźwięk, rozdział, podetap, ukończenie. Odtwórz w wersjonowanym `localStorage`. Zachowaj menu, pauzę, instrukcje i teksty etapów; nie myl zapisu etapu z pełnym snapshotem gry.

## Następne kroki

Najpierw uruchom referencję w emulatorze i nagraj wejście oraz przebieg pierwszej mapy i bossa. Następnie zaimplementuj dekoder map, atlas, symulację 100 ms, walkę i stany ekranów. Sprawdź osobno rozpoznane skutki uboczne renderowania, signed/unsigned, dzielenie całkowite i modyfikowanie kolekcji podczas iteracji. Dopiero po porównaniu zachowania podłącz atlas 4× i remaster AI. Bez takiego porównania uczciwy status to „port oparty na analizie statycznej”, a nie potwierdzona zgodność 1:1.
