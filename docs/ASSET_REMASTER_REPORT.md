# Remaster zasobów AI ×4 — wynik

Wykonano rzeczywistą inferencję neuronową **FSRCNN ×4** dla wszystkich 25 oryginalnych PNG oraz osobno angielskiego wariantu tła: 26 rekordów zasobów, 60 zatwierdzonych przebiegów modelu i 25 zasobów runtime. Wszystkie wyniki przeszły przegląd zasobów i mają status `approved`. Baseline nearest-neighbor jest zapisany osobno i nie jest przedstawiany jako AI.

## Narzędzie i pochodzenie

- Inferencja: OpenCV `dnn_superres.DnnSuperResImpl.upsample`, OpenCV 4.13.0, CPU, 1 wątek.
- Model: [Saafke/FSRCNN_Tensorflow, FSRCNN_x4.pb](https://github.com/Saafke/FSRCNN_Tensorflow), 41 661 bajtów; licencja Apache-2.0 dołączona w `tools/models/FSRCNN-LICENSE.txt`.
- SHA-256 modelu: `5c68d18db561aed8ead4ffedf1b897ea615baaf60ebf6c35f8e641f8fa4a21bf`. Wagi dołączono do projektu; nie potrzeba usług ani kluczy API.
- [Dokumentacja inferencji OpenCV](https://docs.opencv.org/4.10.0/d5/d29/tutorial_dnn_superres_upscale_image_single.html).
- Model nie jest modelem generatywnym sterowanym promptem: `prompt`, `seed` i nieopublikowana wersja modelu mają wartość `null`. To faktyczna super-resolution, dopuszczona w `ASSET_WORKFLOW.md`.

Przed wyborem FSRCNN wykonano rzeczywistą edycję `image_gen.imagegen` całego `player.png`. Wynik 2171×724 zmienił kostium i dodał marginesy, więc go odrzucono. Narzędzie nie ujawniło identyfikatora modelu: zapisano `null`. Surowy obraz, pełny prompt, parametry i hashe są w `assets/ai-raw/player-imagegen-rejected.png` oraz `reports/remaster/player-imagegen-rejected.json`. Ten obraz nie jest używany w grze.

## Przetwarzanie i normalizacja

1. Odczytano prawdziwe RGBA, w tym alpha paletową. RGB magenta pod alpha 0 nie staje się tłem.
2. Rozszerzono najbliższy widoczny kolor do przezroczystych pikseli wyłącznie przed inferencją, aby ograniczyć kolorowe obwódki.
3. Dodano 8 pikseli kontekstu z każdej strony: zawijany padding dla kafelków, powielony brzeg dla innych zasobów.
4. Każdy atlas postaci/efektów przeszedł pojedynczą inferencję FSRCNN ×4. Każdy z 38 kafelków środowiska przeszedł osobną inferencję z własnym zawijanym kontekstem, następnie wrócił do źródłowego slotu. Wagi są wspólne i stałe.
5. Usunięto jednakowe 32 piksele kontekstu z każdej strony wyniku/pojedynczego kafelka. Nie rozciągano ani nie przesuwano pojedynczych klatek.
6. Odtworzono oryginalną alpha powiększoną nearest-neighbor. **Całe RGB finalnego obrazu jest identyczne z odpowiednim wycinkiem surowego wyniku modelu. Nie mieszano RGB baseline z AI.**

`assets/ai-inputs/` zachowuje rzeczywiste wejścia modelu. `assets/ai-raw/` zachowuje surowe wyniki przed usunięciem paddingu. Dla kafelków podkatalogi `assets/ai-raw/tilesN/` zawierają 38 rzeczywistych surowych wyników; dodatkowe montaże są jawnie oznaczonymi diagnostykami, a nie pojedynczym przebiegiem inferencji. `assets/remastered4x/` zawiera finalne obrazy oryginalnych 25 wejść, a `background-en.png` jest osobną dodatkową pochodną. `web/assets/remastered4x/` zawiera 25 plików runtime, w tym kanoniczny angielski `background.png`. `assets/original/` pozostaje bez zmian. Różnicę tła ES/EN dokumentuje `docs/SOURCES.md`; provenance runtime tła wskazuje `reports/remaster/background-en.json`.

## Metadane i przegląd

`tools/export_frames.py` wyprowadza 227 wycinków z `GraphicObjectManager.drawPlayer`, `Sprite.draw` oraz wywołań clippingu/fontów/HUD w `mainCanvas`. `web/data/frames.json` zachowuje prostokąty źródłowe, prostokąty 4×, rozmiary logiczne, offsety i anchory. Uwzględnia 32×32 postacie,16×16 nietoperza, wycinki ugryzienia przy x 432,16×16 kafelki, variable-width fonty oraz oryginalne offsety miecza. Logika świata ma skalę 1.

`web/remaster-review.html` wyświetla 37 podglądów sekwencji/efektów oraz wszystkie 25 arkuszy obok baseline. Przejrzano działający podgląd w przeglądarce na szachownicy, białym i czarnym tle. Zapisano 37 GIF-ów w `reports/remaster/animations/` i zrzuty `reports/remaster/playback-*.png` oraz `alpha-*.png`. Klatki ataku ułożono według malejącego `refireTime`; dla gracza podgląd uwzględnia 3/1/11 nominalnych ticków. Efekty fal pokazują clipping TTL 5..1, a kolumna powtarzanie źródłowego fragmentu. Pozostałe warunkowe czasy należą do reguł runtime; diagnostyczny podgląd nie dowodzi zgodności całej symulacji.

`tools/remaster_tile_review.py` odczytał wszystkie mapy i wygenerował 339 rzeczywiście używanych par sąsiedztwa:75/97/109/58 dla tiles1..4. Arkusze `reports/remaster/tilesN-used-seams.png` porównują te połączenia. Zachowano drabiny, skosy, końce platform i źródłowe kontury bez nowych przerw alpha. Paleta pozostaje zgodna rodzinami kolorów; model wygładza źródłowy dithering; miejscami tworzy niewielkie lokalne wyostrzenie. To zachowawczy remaster super-resolution, bez projektowania nowych postaci.

Przegląd zatwierdza zasoby i ich układ. Nie zastępuje porównania z działającym JAR-em, sprawdzenia zdarzeń obrażeń ani całej kampanii. Proceduralne cząsteczki krwi nie są ukrytym PNG i pozostają zadaniem runtime. Indywidualne decyzje i ograniczenia są w `reports/remaster-review.json` oraz 26 rekordach provenance.

## Poprawka szwów wykryta w grze

Pierwszy przebieg całych pasków kafelków wprowadził ciemne pionowe linie na ścianach i wodzie. Wcześniejszy przegląd statycznych par tego nie wychwycił. Przyczyna: model widział na krawędzi kafelka inny, niepowiązany slot atlasu. Wszystkie cztery pierwsze kandydatury odrzucono i zachowano wraz z provenance jako `reports/remaster/tilesN-atlas-rejected.json`; nie są finalnymi plikami runtime.

Inferencję powtórzono dla każdego kafelka 16×16 osobno z 8 px własnego zawijanego kontekstu. Centralny wynik 64×64 wrócił do źródłowego slotu. Ponowne porównanie działającej gry po odświeżeniu potwierdza brak wprowadzonej ciemnej siatki. Dowody: `reports/browser/ai-seams-before.png`, `ai-seams-after.png` i `ai-seams-original-reference.png`.

Regresja `tools/check_tile_seams.py` mierzy skok RGB na powtarzanej pionowej krawędzi wybranych okresowych fragmentów. Test odrzuca poprzednie wyniki (`--variant before`, kod 1), a przechodzi dla poprawionych (kod 0). Średni skok spadł: ściana tiles1: 40,51→2,41; woda: 6,81→2,05; ściany tiles2/3/4: 10,57→2,60 / 14,37→2,70 / 17,26→3,73. To celowana kontrola wykrytego błędu, nie założenie, że każde dwa różne kafelki mają pasować do siebie identycznym kolorem.

## Wymiary

| Zasób | Oryginał | Wynik | Status |
|---|---:|---:|---|
| background | 176×208 | 704×832 | approved |
| boss_jvh | 768×32 | 3072×128 | approved |
| coffin | 140×67 | 560×268 | approved |
| enemy_dog | 64×16 | 256×64 | approved |
| enemy_hunter | 385×32 | 1540×128 | approved |
| enemy_wraith | 96×32 | 384×128 | approved |
| eve | 140×70 | 560×280 | approved |
| eve_title | 176×208 | 704×832 | approved |
| eyes | 29×12 | 116×48 | approved |
| gui | 83×36 | 332×144 | approved |
| icon | 15×15 | 60×60 | approved |
| jvh | 140×70 | 560×280 | approved |
| jvh_full | 90×176 | 360×704 | approved |
| letter | 182×9 | 728×36 | approved |
| menu | 40×27 | 160×108 | approved |
| ngame | 120×30 | 480×120 | approved |
| player | 496×64 | 1984×256 | approved |
| special | 280×9 | 1120×36 | approved |
| stuff | 64×104 | 256×416 | approved |
| sword | 96×32 | 384×128 | approved |
| tiles1 | 160×16 | 640×64 | approved |
| tiles2 | 160×16 | 640×64 | approved |
| tiles3 | 160×16 | 640×64 | approved |
| tiles4 | 128×16 | 512×64 | approved |
| title | 111×33 | 444×132 | approved |

## Odtworzenie i kontrola

Biblioteki są wyłącznie narzędziami developerskimi; uruchomienie `web/` nie wymaga Pythona z OpenCV ani inferencji.

```sh
python3 -m venv /tmp/vampire-remaster-env
/tmp/vampire-remaster-env/bin/python -m pip install -r tools/remaster-requirements.txt
/tmp/vampire-remaster-env/bin/python tools/export_frames.py
/tmp/vampire-remaster-env/bin/python tools/remaster_assets.py
/tmp/vampire-remaster-env/bin/python tools/remaster_review.py
/tmp/vampire-remaster-env/bin/python tools/remaster_tile_review.py
/tmp/vampire-remaster-env/bin/python tools/verify_remaster.py
/tmp/vampire-remaster-env/bin/python tools/check_tile_seams.py
python3 -m http.server 8080 --directory web
```

Podgląd: `http://localhost:8080/remaster-review.html`. Ponowna inferencja celowo zapisuje status `ai_generated_unreviewed`; zatwierdzenie jest oddzielnym wynikiem oględzin, nie efektem nazwy katalogu ani wymiarów obrazu.

Wykonana kontrola `tools/verify_remaster.py` potwierdza 25 nienaruszonych oryginałów, 26 rekordów zasobów i 60 zatwierdzonych przebiegów inferencji, 25 zgodnych hashy runtime, dokładne wymiary 4×, identyczną alpha względem powiększonego źródła, poprawne 227 wycinków i 41 grup (37 podglądów plus 4 zestawy kafelków). Weryfikuje również bajtową zgodność finalnego RGB z wycinkiem surowej inferencji i różnicę względem nearest-neighbor. Wynik: `reports/remaster-verification.json`.
