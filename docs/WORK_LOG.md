# Realizacja portu — 26.10.2026

Specyfikacja: polecenie użytkownika, oryginalny AGENTS.md w source-packages/main/vampire-bloodline-handoff/ i docs/IMPLEMENTATION_PLAN.md.

Praca odbywa się we wskazanym pustym projekcie. Użytkownik zatwierdził samodzielne wykonanie i delegację; nie powtarzamy zatwierdzania istniejącego planu. Paczki zachowane i wypakowane oddzielnie w source-packages/main oraz source-packages/extra. Materiały robocze skopiowane do katalogu głównego bez zmiany źródeł.

## Zadania i własność

- [x] sources_data: weryfikacja dwóch JAR, constant pool, EN/PL, dekoder 15 map, emulator i źródła runtime.
- [x] game_core: mechaniczny port Sprite/GraphicObjectManager/mainCanvas, źródłowe reguły walki i wszystkich bossów, testy fixture.
- [x] ai_assets: metadane klatek, faktyczne edycje AI, surowe wyniki, normalizacja 4×, ocena i rejestr.
- [x] koordynator: interfejs PL, input wielodotykowy, zegar 10 Hz, audio i zapis, renderer, integracja.
- [x] odbiór: uruchomienie w przeglądarce, testy, kampania, raport i ZIP.

## Kontrakty integracji

Game(levels, options), load(level,sublevel), step(input). Wejście: left/right/up/down/fire/fastJump. Symulacja generuje listę poleceń rysowania, dźwięki oraz zdarzenia fabuły/przejścia/śmierci. Renderer odtwarza listę bez zmiany stanu; prezentacja 30/60/120 Hz nie wywołuje ponownej animacji ani losowań. Dane map ustala agent źródeł wspólnie z agentem mechaniki.

## Decyzje

- Zachowujemy metodę bufora map i arytmetykę źródła; brak nowego silnika fizyki.
- Efekty uboczne źródłowego draw/paint wykonywane raz na tick poprzez rejestrator poleceń. Ułatwia audyt zgodności bez logiki w rendererze Canvas.
- DOM zapewnia polskie menu i fabułę. Oryginalne teksty EN/ES pozostają w danych. Rozmiar pola gry zawsze 176×208, tekstury AI 4×.
- Baseline i odrzucone edycje nie mogą być raportowane jako ukończony remaster.
- Testy charakterystyki kodu źródłowego nie zastępują porównania emulatorowego ani zwykłego przejścia kampanii.

## Zamknięcie implementacji

- Pełna kampania seed 123 przeszła 15 map w 15 720 krokach, bez zmian stanu i bez śmierci; osobno przechodzi ten sam replay przez produkcyjny adapter ActionState.
- 14 prób przeglądarkowych poprawnych; regresje krótkich naciśnięć i skrótów pod modalem usunięte i ponownie przejrzane przez niezależnego agenta.
- 25/25 zasobów runtime ma prawdziwy FSRCNN x4; odrzucono generatywną zmianę stroju oraz pierwsze tilesety ze szwami. Finalne szwy sprawdzone w grze.
- Oryginalnego MIDletu nie uruchomiono: brak Javy/emulatora Nokii, jawne ograniczenie w docs/VERIFICATION.md.
- Domyślne ziarno produkcyjne dodatkowo zweryfikowane przez pełne 15 map i adapter wejścia: 15 496 kroków, zero śmierci, końcowe 100 HP; bez zmiany ziarna lub mechaniki.
- ZIP rozpakowany do czystego katalogu tymczasowego: 30/30 testów Node, zgodność wszystkich hashy manifestu i 126/126 plików web dostępnych przez lokalny HTTP z identyczną zawartością. Raport reports/package-smoke.json.
