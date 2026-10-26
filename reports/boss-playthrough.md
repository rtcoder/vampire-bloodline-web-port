# Powtórki aren bossów

`node tools/test_boss_routes.mjs` odtwarza wszystkie pięć rzeczywistych aren ze świeżego `new Game(levels,{seed:1}).load(chapter,3)`. Zapis `tests/boss-replays.json` zawiera skompresowane sekwencje zwykłych wejść kierunkowych i ataku. Wykonanie powtórki wywołuje wyłącznie `Game.step(input)`; nie zmienia pozycji, zdrowia, RNG, stanu przeciwnika ani flagi zwycięstwa. W każdej próbie zdrowie zaczyna od źródłowego 100, boss dochodzi do 0, a gracz pozostaje żywy.

| Mapa | Typ bossa z mapy | Kroki | Minimalne zdrowie | Zdrowie końcowe | Wynik |
| --- | --- | ---: | ---: | ---: | --- |
| m13 | 14 | 159 | 70 | 100 | transition |
| m23 | 17 | 546 | 50 | 100 | transition |
| m33 | 16 | 457 | 50 | 100 | transition |
| m43 | 17 | 676 | 6 | 40 | transition |
| m53 | 18 | 646 | 50 | 78 | completed |

Są to niezależne próby aren, nie dowód jednej ciągłej kampanii ani porównanie z uruchomionym MIDletem. Osobne dane pełnej kampanii muszą uwzględniać przenoszone liczniki i RNG.

Narzędzie eksportuje `bossInput(game)`, `runBossPolicy(game,maxTicks,options)` i `findBossRoute(game,copyGame,maxTicks)` do wyszukiwania wejść. Ostatnia funkcja porównuje warianty na kopiach, zwraca zwycięskie wejścia i pozostawia rzeczywisty stan nietknięty; dopiero zwykłe odtworzenie wejść na rzeczywistej instancji jest dowodem przejścia. Nie każda konfiguracja startowa wygrywa prostą polityką zachłanną, dlatego końcowe testy opierają się na zapisanych i ponownie zweryfikowanych wejściach.
