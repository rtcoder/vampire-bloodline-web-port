# Plan implementacji Vampire Bloodline w HTML + JavaScript

**Odbiorca:** agent wykonujący projekt. **Stan tego pliku:** plan pracy, nie raport wykonania. Użytkownik zatwierdził port i remaster AI 4×; zwykłe decyzje techniczne podejmuj samodzielnie.

**Cel:** ukończona kampania z załączonego JAR-a, oryginalna mechanika, lokalne zasoby, klawiatura i dotyk, polski interfejs oraz rzeczywisty remaster AI 4×. Domyślny stos: HTML, CSS, JavaScript ES modules i Canvas 2D. Runtime ma działać jako statyczna strona bez procesu build i bez Javy.

## Podział odpowiedzialności

Proponowane pliki powstaną podczas implementacji; nie są obecnie częścią pakietu. Zachowaj niewielkie moduły i jawne zależności. Podział można uprościć bez zmiany zakresu.

| Plik docelowy | Odpowiedzialność |
| --- | --- |
| `web/index.html`, `web/styles.css` | Canvas, menu, instrukcja, sterowanie dotykowe i responsywny układ |
| `web/js/main.js` | Start, ładowanie, ekran błędu, pętla prezentacji i zarządzanie pauzą |
| `web/js/data.js` | Wczytywanie i walidacja map, klatek, tekstów i manifestu zasobów |
| `web/js/input.js` | Akcje logiczne, klawiatura, Pointer Events, press/hold/release, reset wejść |
| `web/js/game.js` | Stan gry i pojedynczy krok symulacji, bez DOM i Canvas |
| `web/js/entities.js` | Gracz, przeciwnicy, bossowie, pociski i pickupy; w razie potrzeby rozdziel na pliki |
| `web/js/renderer.js` | Obraz z gotowego stanu; tryby `original` i `remastered4x` |
| `web/js/audio.js`, `web/js/storage.js` | Dźwięk uruchamiany interakcją oraz wersjonowany zapis |
| `web/data/levels.json`, `web/data/frames.json` | Odczytane mapy i jawne metadane atlasów |
| `web/data/strings-es.json`, `web/data/strings-pl.json` | Teksty źródłowe i osobna warstwa tłumaczenia |
| `web/data/asset-manifest.json`, `web/assets/` | Ścieżki i metadane rzeczywiście dostarczonych zasobów |
| `tools/decode_levels.py`, `tools/export_frames.py` | Powtarzalne przekształcenie oryginalnych danych |
| `tests/` | Małe fixture'y i testy reguł istotnych dla zgodności |
| `docs/DECISIONS.md`, `docs/VERIFICATION.md` | Uzasadnione decyzje, dowody, wyniki i otwarte rozbieżności |

Kontrakt symulacji może mieć postać `stepGame(state, input, rng)`, wykonywaną raz na oryginalny tick. Renderer dostaje gotowy stan i metadane klatek. Zdarzenia dźwiękowe wynikają z symulacji i są konsumowane raz; ponowne narysowanie klatki nie powtarza uderzenia, dźwięku ani obrażeń. Wstrzykiwany generator losowy pozwala odtwarzać sekwencje testowe, bez zmiany reguł losowania źródła.

## Etap 1 — referencja i granice zgodności

1. Uruchom `python3 tools/verify_source.py`. Zachowaj hash JAR-a i potwierdź kompletność materiału.
2. Przeczytaj audyt oraz wszystkie sześć klas. Wypisz powiązania zasób → metoda użycia → znaczenie; dekompilacja jest pomocą, nie oryginalnym kodem źródłowym.
3. Uruchom kopię w emulatorze wspierającym Nokia `FullCanvas` i `Sound`, przy nominalnym widoku 176×208. Zapisz nazwę, wersję i ustawienia emulatora.
4. Udokumentuj ekrany, sterowanie, chodzenie, skoki, drabiny, walkę, transformacje, otrzymanie obrażeń, śmierć, checkpoint i przejścia map. Zachowaj krótkie nagrania lub sekwencje klatek dla konkretnych scen.
5. Zanotuj ograniczenia: kopia jest hiszpańska; nie potwierdzono identyczności z uploadem Mobiles24. Jeżeli uruchomienie jest zablokowane, kontynuuj statyczną rekonstrukcję i jawnie oznacz brak porównania.

**Odbiór:** źródła nienaruszone, ustalona konfiguracja referencyjna lub dokładna blokada, lista scen do porównania. Nie obiecuj „1:1” na podstawie samego czytania kodu.

## Etap 2 — mapy, klatki i dane

1. Odtwórz dekoder z `loadMap()` i `loadCol()`. Bajt 0 to indeks tilesetu, bajt 1 to liczba deskryptorów, potem trójki bajtów ze znakiem. Pozostałe bajty są indeksami bez znaku, zapisanymi kolumnami po 16 komórek.
2. Wyeksportuj wszystkie 15 map. Dziesięć map ma 256×16 kafli, pięć aren kończących się cyfrą `3` ma 16×16. Sprawdź liczbę komórek, indeksy deskryptorów, start, wyjście i spawny. Porównaj z `reports/static_format_audit.json`.
3. Zachowaj rozróżnienie grafiki, kolizji i efektu. Typy obiektów 10–36 uruchamiają logikę spawnów. Nie zamieniaj całej mapy na sam obraz tła.
4. Wyprowadź prostokąty, kolejność, offsety i anchory klatek z `GraphicObjectManager` oraz `Sprite`. `player.png` ma mieszane rozmiary klatek; `enemy_hunter.png` ma 385 pikseli szerokości — nie przycinaj go do wielokrotności 32.
5. Przygotuj podgląd wszystkich kafli i animacji z identyfikatorami. Zachowaj alpha paletową i rzeczywiste puste fragmenty atlasu. Rozpisz wszystkie 13 dźwięków oraz źródłowe teksty.

**Odbiór:** wszystkie mapy odczytują się bez zgadywania formatu; metadane każdej używanej klatki mają wskazane źródło; nic nie nadpisuje `assets/original/` ani `reference/resources/`.

## Etap 3 — działający szkielet i oryginalne tempo

1. Dodaj statyczne `web/`, loader i czytelny błąd brakujących danych. Pierwszy działający wycinek ma wyświetlać prawdziwą pierwszą mapę i gracza z oryginalnych zasobów.
2. Wprowadź stały krok **100 ms / 10 Hz**, wynikający z `gametimer.schedule(..., 100L, 100L)`. Użyj akumulatora czasu; pauza i powrót do karty zerują zaległy czas. Wyższy FPS dotyczy prezentacji, nie częstotliwości ataku, grawitacji ani AI.
3. Przenieś efekty uboczne `Sprite.draw()` i `mainCanvas.paint()` do kontrolowanej fazy aktualizacji. Ustal ich kolejność względem `updateGame()` z referencji. Renderer ma pozostać odczytem stanu.
4. Wprowadź logiczne akcje i ich mapowanie. W źródle są m.in. 4/6, 2, 8, 3 i 5; sprawdź kontekstowe znaczenie oraz warunki press/hold/release. Nowe skróty klawiaturowe opisuj w UI.
5. Oddziel skalę tekstur, raster Canvas, rozmiar CSS i DPR. Punkt świata nadal oznacza jeden oryginalny piksel logiki.

**Odbiór:** ta sama nagrana sekwencja wejść daje ten sam wynik po tej samej liczbie ticków przy renderowaniu 30/60/120 FPS i po zmianie rozmiaru okna. Dodatkowe wywołanie renderera nie zmienia stanu.

## Etap 4 — ruch, kolizje i kamera

1. Przenieś ruch gracza, `jumpAmount`, `fastJumpAmount`, drabiny, pochyłości, upadanie i śmierć zgodnie z kolejnością obliczeń w Javie. Nie wprowadzaj „ładniejszej” paraboli skoku.
2. Odtwórz rozmiar logiczny gracza 16×32 niezależnie od szerszej klatki rysowania. Sprawdź granice prostokątów: źródłowe `isCollidingWith()` uwzględnia także styk krawędzi.
3. Przenieś kolizje typów 0–8, efekty niebezpiecznych pól, wejścia i wyjścia. Zachowaj semantykę bajtów ze znakiem, dzielenia całkowitego, castów i przesunięć tam, gdzie zmienia wynik.
4. Odtwórz `ofsX/ofsY`, przesuwanie mapy, latch gracza i blokowanie ekranu aren. Responsywność nie zwiększa zasięgu widzenia.
5. Przenieś moce i transformacje z warunkami użycia oraz czasami. Grafika mocy nie może automatycznie zmienić hitboxa, jeśli źródłowa logika tego nie robi.

**Odbiór:** porównane ruchy i kolizje na konkretnych fragmentach map; brak przenikania, zacięć na drabinie i skoku zależnego od FPS. Tryb debug pokazuje hitboxy i rzeczywiste komórki kolizji.

## Etap 5 — walka, przeciwnicy i pełna kampania

1. Przenieś stany walki, cooldowny, moment tworzenia pocisku, trafienia i ugryzienie. Źródło potwierdza kołki i ugryzienie z leczeniem; wspomnienie „combosów” nie jest podstawą do dodania nowej mechaniki.
2. Odtwórz typy przeciwników 10–13 i bossów 14–18, wraz z ich ruchami, obrażeniami i atakami specjalnymi. Zachowaj kolejność losowań i aktualizacji.
3. Powiąż efekty krwi, cząsteczki, dźwięki, pociski i zdobywanie przedmiotów z właściwymi zdarzeniami. Sprawdź śmierć gracza w trakcie ataku lub transformacji.
4. Połącz pięć rozdziałów po trzy mapy, właściwą kolejność tilesetów **1, 2, 4, 3, 3**, areny, ekrany fabularne i zakończenie. Nie kończ na jednej planszy.
5. Weryfikuj liczby i warunki w kodzie, a sporne fragmenty w bytecode. Ustalenia audytu są punktem startowym; nie zastępują pełnego portowania metod.

**Odbiór:** kompletny przebieg kampanii, wszystkie rodzaje wrogów i moce; sensowna lista scen porównanych z referencją. Weryfikacja przejść przez debug-level-select nie zastępuje próby zwykłego przejścia gry.

## Etap 6 — interfejs, zapis, audio i urządzenia dotykowe

1. Dodaj polskie menu i instrukcję. Zapisz hiszpańskie teksty oraz oddzielne polskie tłumaczenie; zachowaj credits i sens fabuły.
2. Przenieś znaczenie czterech bajtów oryginalnego zapisu: dźwięk, rozdział, etap, ukończenie. Zastosuj wersjonowany format webowy, obsługę uszkodzenia i niedostępnego storage.
3. Udostępnij pauzę, wznowienie, restart oraz wyciszenie. Pętla nie nadrabia czasu po ukryciu karty. Utrata focusu oraz `pointercancel` czyszczą trzymane wejścia.
4. Odtwórz zdarzenia audio. WAV-y są PCM mono 8-bit; `vapor.wav` ma 44100 Hz, inne 8000 Hz. `vapor.wav` i `vapour.wav` to różne pliki. Zachowaj oryginały także przy konwersji.
5. Dotyk musi obsługiwać jednoczesny ruch i atak/skok. Przyciski nie zasłaniają mapy, a gesty sterowania nie przewijają dokumentu. Sprawdź zmianę orientacji i mały ekran.

**Odbiór:** pełna pętla menu → gra → pauza → śmierć/restart → powrót do zapisu działa na klawiaturze i dotyku; brak utkniętych klawiszy, utraty postępu i odtwarzania audio przed interakcją.

## Etap 7 — rzeczywisty remaster AI 4×

Ten etap można delegować równolegle po zatwierdzeniu metadanych klatek z etapu 2. Wykonawca grafiki nie zmienia kolizji ani oryginałów.

1. Użyj `assets/remaster-plan.json`, `docs/ASSET_WORKFLOW.md` oraz szablonów z `prompts/ASSET_REMASTER.md`. Najpierw obejrzyj źródła i pełne animacje.
2. Utwórz jawny baseline do porównań. Następnie rzeczywiście przetwórz grafiki dostępnym narzędziem AI, zachowując spójne postacie i sekwencje klatek. Nie oznaczaj baseline jako AI.
3. Zachowaj surowe wyniki, prompty, rzeczywistą nazwę narzędzia/modelu, hashe i normalizację. Finalne arkusze mają dokładnie `4*w × 4*h`; zachowaj oryginalne pozycje klatek. Ewentualne atlasy pakowane do runtime są osobnym wynikiem z nowymi metadanymi i powiązaniem do tych arkuszy.
4. Sprawdź alpha, brak kolorowych obwódek, twarz, strój, broń, płynność animacji i styki kafli. Tekst i glify wymagające deterministycznej rekonstrukcji opisz jako wyjątek, zamiast akceptować błędne litery.
5. Podłącz dwa zestawy grafiki do tego samego renderera i stanu. Porównaj identyczne sceny przy `original` i `remastered4x`, z nakładką kolizji.

**Odbiór:** wymagane grafiki mają finalne wymiary, rzeczywiste pochodzenie AI i przegląd w ruchu. Brak narzędzia oznacza `blocked_ai_unavailable`; resztę portu można kontynuować, ale remaster pozostaje niedokończony.

## Etap 8 — odbiór i paczka końcowa

1. Ponownie sprawdź integralność JAR-a i oryginałów. Uruchom testy dekodera, kolizji, timingów, walki, śmierci, zapisu i wybranych odtworzonych sekwencji wejść. Testy mają sprawdzać ryzyko, nie powtarzać implementację.
2. Uruchom zwykły statyczny serwer: `python3 -m http.server 8080 --directory web`. Sprawdź kompletność zasobów, brak błędów konsoli i pobierania z zewnętrznych CDN-ów. Gracz nie potrzebuje Javy ani kluczy API.
3. Wykonaj porównanie z emulatorem, test kampanii oraz testy klawiatury i dotyku, pauzy, audio, zmiany rozmiaru, ukrycia karty i wczytania zapisu. Zapisz przeglądarki, konfigurację i rzeczywiste wyniki.
4. Uzupełnij `docs/VERIFICATION.md`: wykonane próby, dowody, znane różnice, ograniczenia i status AI każdego zasobu. Brak próby uruchomienia oryginału pozostaje jawną luką zgodności.
5. Zaktualizuj README tak, aby opisywał faktycznie istniejącą grę. Utwórz ZIP całego projektu z kodem, zasobami, instrukcją uruchomienia i materiałem referencyjnym. Nie dołączaj sekretów, cache ani plików instalacji narzędzi.

**Odbiór końcowy:** warunki z `AGENTS.md` spełnione, komenda startu działa po czystym rozpakowaniu, pełna gra jest grywalna, a użytkownik otrzymuje kompletny projekt i rzetelny raport. W przypadku rzeczywistej blokady dostarcz ukończony zakres i nazwij dokładnie niespełnione wymaganie.
