# Weryfikacja Vampire Bloodline — 26.10.2026

Raport rozróżnia działanie portu, statyczną zgodność ze źródłem i porównanie z oryginałem. **Zgodność z uruchomionym oryginałem jest niezweryfikowana** — patrz ograniczenia na końcu.

## Źródła i dane

- `python3 tools/verify_source.py`: oryginalny hiszpański JAR, CRC i eksporty zachowane; jego przypiętej sumy nie zmieniono.
- `python3 tools/verify_english.py`: SHA256 angielskiego patcha zgodny ze specyfikacją, dokładnie 3 zmienione wpisy: Strings.class, background.png, mainCanvas.class; dokładnie 18 zmienionych stałych UTF-8 w mainCanvas, część po constant pool (38 107 bajtów) identyczna.
- `python3 -m unittest discover -s tests -p 'data*_test.py'`: 9 testów poprawnych. Wszystkie 15 map, 42 240 komórek, kolejność kolumn, signed deskryptory, unsigned indeksy, niepełne dane, identyczność zasobów i ekstrakcja tekstów.
- EN/ES są osobnymi danymi. PL obejmuje 4 sekcje instrukcji i 16 tablic scen. Źródło EN: Lanzz 2021/Kahvibreak, przypisanie zachowane w grze i dokumentacji.

## Symulacja

`npm test`: **30/30 PASS** — fixture’y źródła, adaptery platformy oraz pełne kampanie przez rzeczywiste wejścia.

- Fixture’y pochodzące z odczytanych reguł Java: inkluzywne zetknięcie hitboxów, zdrowie bossów, 4 kroki ruchu przesuwające bufor o kolumnę, tabela skoku/grawitacji, deatharc, moment wypuszczenia kołka, leczenie i obrażenia ugryzienia, cooldown, czasy transformacji, niezmienny hitbox 16×32, zmiana stanu bossa, EOF bufora i przenoszone między mapami liczniki.
- Niezależny przegląd portowanych metod: brak potwierdzonej rozbieżności w znormalizowanych ciałach getTileVal/addParticle/adjustOnSlope/updateGame/Sprite/GraphicObjectManager. Wyjątkiem są jawne adaptery ekranów i prezentacji. Raport `reports/source-core-review.json`.
- 45 000 kroków losowych wejść na wszystkich 15 mapach, 208 śmierci/restartów: brak wyjątków/NaN. Nie osiągnięto przejść w tej próbie; ten test nie dowodzi ukończenia kampanii.
- Zegar: ta sama liczba kroków przy 30/60/120 FPS; reset nie nadrabia ukrytego czasu. W przeglądarce pełne stany po 200 krokach są identyczne przy każdej z tych częstotliwości.
- Renderer: 240 dodatkowych wywołań (original/remastered4x) nie zmienia stanu gry.

## Przeglądarka

Chromium 155 w przeglądarce Codex, macOS. Start: `python3 -m http.server 8080 --directory web`. Wynik utrwalony w `reports/browser/integration.json`.

14 prób integracyjnych przeszło: komplet 15 map/25 grafik AI, menu/fabuła/nowa gra, dekodowanie 13 WAV w Web Audio, czystość renderera, niezależność od FPS, jednoczesne wejście klawiatury ruch+skok, focus/pauza/czyszczenie, handler ukrycia dokumentu, anulowanie dwóch wskaźników, blokada klawisza P przez instrukcję, restart/mute/checkpoint, adapter finału i credits, układ 390×844 i zapis po przeładowaniu. Ukrycie dokumentu i pointercancel sprawdzono zdarzeniami testowymi w produkcyjnych handlerach; nie przedstawiamy ich jako testu fizycznego telefonu.

Test adaptera zakończenia podaje pojedyncze testowe zdarzenie `completed`, sprawdza 4 strony finału, credits, atrybucję Lanzz i zapis ukończenia. Nie jest traktowany jako dowód walki ani przejścia kampanii — ten pochodzi z osobnych pełnych replayów.

Ręcznie przez narzędzie przeglądarki: nowa gra i pominięcie dialogu, przytrzymanie strzałki w prawo, ruch kamery, pauza klawiszem P, instrukcja, zmiana original/remastered4x, przytrzymanie przycisku ekranowego, pokazanie sterowania i kontrola małego widoku. Zrzuty są w `reports/browser/`.

Przegląd ujawnił trzy błędy adaptera wejść: brak sprawdzania `target.closest` dla Window, gubienie krótkiego naciśnięcia między krokami 100 ms oraz wznowienie gry klawiszem P/Escape pod otwartą instrukcją. Poprawiono bezpieczny odczyt celu, dodano kolejkę krawędzi wejścia i blokadę skrótów w dialogu. Testy krótkiego ataku i skoku wykazały błąd przed poprawką i przeszły po niej. Natywny Escape zamyka teraz instrukcję i pozostawia grę na pauzie (`reports/browser/native-escape-result.txt`). Końcowa próba 14/14 i konsola bez ostrzeżeń/błędów: `reports/browser/final-console.json`.

Widok 390×844: pole 367,5×434 px, sterowanie zaczyna się poniżej pola gry, bez poziomego przewijania. Jednoczesne źródła wejścia i zwalnianie niezależnych wskaźników sprawdzono w testach ActionState. **Nie użyto fizycznego telefonu z wielodotykiem**; to pozostaje ograniczeniem sprzętowym testów, nie dowodem testu na telefonie.

## Kampania

Testy tras używają wyłącznie zwykłych wejść przekazywanych do produkcyjnego Game.step. Nie zmieniają zdrowia, pozycji, stanu bossDead ani reguł. Szukanie tras na kopiach stanu nie jest teleportacją w dostarczonej sekwencji: ostateczny replay jest wykonywany od początku mapy/kampanii na niezmodyfikowanej symulacji.

**Pełna kampania ukończona z domyślnym ziarnem produkcyjnym:** 15/15 map przez produkcyjny `ActionState`/`advanceWithInput`, stan `completed`, 15 496 kroków (25 min 49,6 s czasu symulacji), zero stanów śmierci, minimum 4 HP, na końcu 100 HP. Odtworzenie jest automatyczne i zachowuje RNG oraz przenoszone liczniki pomiędzy etapami. Nie zmieniono domyślnego ziarna ani reguł, żeby dopasować je do testu. Raport: `reports/campaign-default-playthrough.json`; wejścia: `tests/game-replay-default-campaign.mjs`.

Dodatkowo osobna kampania z ziarnem 123 przeszła 15 map zarówno przez `Game.step`, jak i adapter wejścia: 15 720 kroków, minimum 4 HP, końcowe 74 HP. Raport `reports/campaign-playthrough.json`. Bossowie wymagali odmiennych wejść przy odmiennym losowaniu. Testy przypinają hashe 15 sekwencji obu kampanii i wymagają wszystkich map oraz zakończenia.

| Mapa | Kroki (domyślne ziarno) | Minimum HP | Końcowe HP |
|---|---:|---:|---:|
| m11 | 1107 | 70 | 98 |
| m12 | 1192 | 80 | 80 |
| m13 | 233 | 16 | 44 |
| m21 | 1943 | 25 | 51 |
| m22 | 1030 | 30 | 66 |
| m23 | 517 | 100 | 100 |
| m31 | 1142 | 75 | 100 |
| m32 | 1077 | 15 | 15 |
| m33 | 538 | 4 | 96 |
| m41 | 1048 | 30 | 30 |
| m42 | 2268 | 20 | 36 |
| m43 | 554 | 50 | 78 |
| m51 | 1075 | 4 | 4 |
| m52 | 1098 | 53 | 53 |
| m53 | 674 | 46 | 100 |

Osobny raport `reports/boss-playthrough.json` zawiera poprawne przejścia pięciu rzeczywistych aren z pełnej początkowej konfiguracji mapy.

## Grafika AI

Faktyczna inferencja FSRCNN x4, raw output i hashe są w `reports/remaster/`; finalny audyt w `docs/ASSET_REMASTER_REPORT.md` i `tools/verify_remaster.py`. Pierwszy ImageGen odrzucono za przebudowanie postaci. Pierwszą wersję tilesetów odrzucono po wykryciu ciemnych linii w grze; szczegóły poprawki są w rejestrze. Finalny audyt potwierdza 25/25 grafik runtime, 26 rekordów pochodzenia i 60 zaakceptowanych przebiegów sieci (kafelki przetwarzane osobno), dokładne wymiary 4×, oryginalną maskę alpha oraz RGB zgodne z surowym wynikiem sieci. Metadane obejmują 227 wycinków i 41 grup animacji. Kontrola okresowych fragmentów ścian/wody przechodzi po poprawce szwów. Zwykłe powiększenie nearest-neighbor pozostaje osobnym baseline.

## Paczka

`dist/vampire-bloodline-web-port.zip` zawiera cały projekt, źródła, wejścia i wyjścia AI, dokumentację oraz `DELIVERY_CHECKSUMS.json`. Czystą rozpakowaną kopię sprawdzono: wszystkie hashe zgodne, `npm test` 30/30, każdy ze 126 plików `web/` zwraca HTTP 200 i identyczne bajty. Raport: `reports/package-smoke.json`. Po dodaniu tego raportu ponownie zbudowano ZIP i sprawdzono CRC, kompletny manifest oraz niezmienność wszystkich plików runtime.

## Ograniczenia

- Brak Java Runtime i kompatybilnego emulatora Nokii. Polecenia sprawdzające Javę i próba startu JAR-a zakończyły się komunikatem o braku runtime; emulatora nie znaleziono. `reports/source-emulator-probe.json`. Do zamknięcia tej luki potrzebne są Java oraz emulator z FullCanvas/Sound i porównanie konkretnych scen.
- Testy odtworzenia wejść w porcie nie są nagraniami z oryginalnego telefonu. Nie potwierdzono pełnej zgodności 1:1.
- Brak fizycznego urządzenia dotykowego i testów Safari/Firefox. Testy mobilnego rozmiaru wykonano w iframe o szerokości 390 px w Chromium.
- Menu DOM, lokalny zapis JSON i obsługa platformy różnią się technicznie od telefonicznych ekranów RMS/softkeys; źródłowe reguły świata pozostają odrębne.
