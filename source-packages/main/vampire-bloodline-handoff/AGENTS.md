# Instrukcje dla agenta — Vampire Bloodline HTML + JavaScript

## Zadanie i zakres

Wykonaj pełny port **Vampire Bloodline** z `source/vampire-bloodline-176x208.jar` do gry przeglądarkowej **HTML + CSS + JavaScript / Canvas 2D**. Finalne grafiki mają przejść rzeczywistą obróbkę AI i mieć dokładnie **4× większą szerokość oraz wysokość**. Zachowaj rozgrywkę, postać, mapy, animacje, przeciwników, efekty krwi i dźwięki oryginalnej kopii.

Użytkownik wybrał tę konkretną grę. Nie zastępuj jej luźną inspiracją, inną grą o wampirach, emulatorowym wrapperem ani jedną demonstracyjną planszą. Dostarcz cały uruchamialny projekt jako ZIP wraz z instrukcją startu i rzetelnym raportem weryfikacji.

## Najpierw przeczytaj

1. `README.md` — cel, stan pakietu i źródło JAR-a.
2. `source/provenance.json` — dokładna kopia i jej ograniczenia.
3. `docs/REVERSE_ENGINEERING.md` oraz `reports/jar_inventory.json`.
4. `docs/IMPLEMENTATION_PLAN.md`.
5. `docs/ASSET_WORKFLOW.md` i `prompts/ASSET_REMASTER.md`.
6. Odpowiednie klasy w `reference/decompiled/`; wątpliwości rozstrzygaj na podstawie bytecode i oryginalnego działania.

Ten pakiet nie zawiera jeszcze implementacji web ani przetworzonych grafik AI. Nie raportuj odziedziczonych materiałów referencyjnych jako własnego ukończonego portu.

## Zasady pracy

- Pracuj samodzielnie nad zatwierdzonym celem. Podejmuj zwykłe decyzje implementacyjne bez pytania o zgodę na każdy plik, skrypt, test lub lokalną poprawkę.
- Dziel pracę na działające etapy z konkretnym wynikiem. W razie dostępnych agentów deleguj niezależne zadania, zachowując wyraźną własność plików.
- Komunikuj krótko potwierdzone ustalenia, realne problemy i wynik kolejnego etapu. Nie przedstawiaj planów jako wykonanej pracy.
- Blokadę opisuj precyzyjnie. Kontynuuj niezależne części. Braku narzędzia AI nie zastępuj nieoznaczonym zwykłym skalowaniem.
- Nie wymagaj w tym projekcie konkretnych pluginów lub skilli, jeżeli środowisko ich nie ma. Korzystaj z dostępnych narzędzi, które realizują te same wymagania.
- Nie instaluj nowego frameworka, nie publikuj projektu i nie kupuj usług poza zakresem potrzebnym do lokalnego wykonania. Użytkownik w tym handoffie zamówił projekt w ZIP-ie; nie wskazał hostingu.

## Źródło prawdy

Oryginalny JAR ma SHA-256:

```text
ebe705c790f989af9b81c698b2f794fdac88266e75a6b704b9fbcbe94f631ab8
```

Zachowaj JAR, `assets/original/`, `assets/audio-original/` i surowe mapy bez zmian. Wszystkie dekodowane, tłumaczone, konwertowane lub poprawione wyniki zapisuj osobno. Pamiętaj, że ta kopia zawiera hiszpańskie teksty; tożsamość bajtowa z niedostępnym uploadem Mobiles24 nie jest potwierdzona.

Przyjmij kolejność dowodów: zachowanie oryginalnej gry i bytecode → dane JAR-a → dekompilacja → opis katalogowy/wspomnienie. Raportuj sprzeczności. W szczególności **nie wymyślaj rozbudowanego systemu combosów**, jeśli kod i wersja referencyjna go nie potwierdzają. Przenieś rzeczywiste akcje, ich warunki i timingi.

Uruchom JAR w emulatorze obsługującym `com.nokia.mid.ui.FullCanvas` i `com.nokia.mid.sound.Sound`. Zanotuj emulator, wersję, ustawienia ekranu, sterowanie i dowody. Oglądanie dekompilacji nie zastępuje próby uruchomienia. Jeśli emulator jest niedostępny, kontynuuj statyczną rekonstrukcję, ale do czasu porównania oznacz zgodność jako niezweryfikowaną.

## Architektura portu

- Runtime: zwykłe JavaScript ES modules, HTML, CSS i Canvas 2D. Pliki produkcyjne pod `web/`, uruchamiane zwykłym statycznym serwerem HTTP.
- Rozdziel: stan i reguły gry, loader danych, input, rendering, audio, zapis oraz interfejs DOM. Renderer nie zmienia stanu rozgrywki.
- Zachowaj oryginalne jednostki świata i reguły całkowitoliczbowe. Konstruktor `mainCanvas` ustawia timer co **100 ms, nominalnie 10 Hz**. To punkt wyjścia do weryfikacji w emulatorze. `requestAnimationFrame` obsługuje prezentację; renderowanie w 60/120 FPS nie zwiększa liczby kroków logiki.
- Oryginalne `Sprite.draw()` i `mainCanvas.paint()` mają efekty uboczne: zmieniają m.in. pickupy, animacje, cząsteczki i stany ekranów. Przenieś je świadomie do odpowiedniej fazy aktualizacji, zachowując kolejność. Wielokrotne narysowanie tego samego stanu nie może zmieniać wyniku symulacji.
- Java `byte` jest ze znakiem. Przenieś rozróżnienie `readByte`/`readUnsignedByte`, dzielenie całkowite, przepełnienia, przesunięcia i porównania, jeśli są istotne. Nie zastępuj ich automatycznie zwykłą arytmetyką `Number`.
- Zachowaj kolejność aktualizacji, momenty trafienia, czas działania mocy, cooldowny, invulnerability i warunki przejścia poziomów. Nie dodawaj ogólnego silnika fizyki kosztem zgodności.
- Przenieś wszystkie 15 zasobów map i sprawdź ich rzeczywistą kolejność oraz przejścia. Odtwórz kodowy format danych, zamiast rysować plansze na oko.
- Warstwa zasobów używa stabilnych identyfikatorów, jawnych prostokątów atlasu, rozmiarów logicznych i anchorów. Dla renderera zachowaj tryb `original` i `remastered4x`, oparty na tym samym stanie gry.
- Zachowaj proporcje oryginalnego widoku. Letterboxing, CSS i DPR nie zmieniają hitboxów, prędkości ani zasięgu kamery.

Proponowane moduły i interfejsy są w planie. Możesz je uprościć przy zachowaniu odpowiedzialności; zmianę uzasadnij w `docs/DECISIONS.md`.

## Input, przeglądarka i użytkownik

Zdefiniuj logiczne akcje i mapuj je centralnie na klawiaturę oraz przyciski dotykowe. Zachowaj rozróżnienie wciśnięcia, trzymania i puszczenia. Utrata focusu, ukrycie karty lub `pointercancel` mają wyczyścić trzymane wejścia i bezpiecznie zatrzymać symulację. Unikaj „zakleszczonego” ruchu po powrocie do karty.

Dotyk musi obsługiwać jednoczesny ruch i atak/skok. Sterowanie nie może zasłaniać pola gry ani przewijać dokumentu podczas walki. Pauza zatrzymuje reguły i dźwięki; wznowienie nie nadrabia minut symulacji.

Uruchamiaj dźwięk po interakcji użytkownika. Zweryfikuj dekodowanie wszystkich WAV-ów, powiąż je z właściwymi zdarzeniami i zapewnij wyciszenie. Jeśli format wymaga konwersji, zachowaj źródła oraz dokumentuj parametry i mapowanie.

Zapisuj wersjonowany, serializowalny postęp i ustawienia. Obsłuż brak dostępu do storage oraz uszkodzony zapis. Zachowaj sens oryginalnych checkpointów; nie dodawaj dowolnego zapisu w środku akcji bez potrzeby.

Menu webowe i instrukcje: polski. Teksty oryginalnej wersji hiszpańskiej pozostają w danych referencyjnych; tłumaczenia są osobną warstwą. Zachowaj autorów w credits.

## Grafika AI 4× — obowiązkowy wynik

`assets/remaster-plan.json` zawiera listę wejść i dokładne docelowe wymiary. Wymiary obrazów w tym pliku są wymiarami arkuszy, nie wymiarami poszczególnych klatek. Zanim uruchomisz AI, wyprowadź podział, clipping i offsety z `GraphicObjectManager` oraz `Sprite`.

- Zachowaj Evę i wszystkie inne źródłowe postacie, kolory, stroje, broń oraz poses. To remaster istniejącej gry 2D.
- Przetwarzaj całe spójne animacje lub kontrolowane partie z tą samą referencją. Nie generuj każdej klatki jako niezależnej ilustracji.
- Zachowaj liczbę, kolejność, czas, kierunek i oryginalny anchor każdej klatki. Nie centruj automatycznie wszystkich sprite’ów.
- Zachowaj prawdziwą alpha i przezroczystość paletową. W `player.png` piksel `(0,0)` ma RGB magenta, ale alpha 0 — tło widoczne w niektórych podglądach nie jest scenografią do domalowania przez AI.
- Grafika docelowa ma wymiary `4*w × 4*h`, a rozmiar świata nadal `w × h`. W atlasie przeskaluj prostokąty źródłowe, nie geometrię symulacji.
- Efekty krwi, ugryzienia, trafienia i transformacje zachowaj zgodnie z oryginałem. Nie usuwaj ich ani nie dodawaj nowych mechanik w ramach poprawiania grafiki.
- Zapisuj wejścia, surowe wyniki AI, finalne pliki, hashe, prompt, rzeczywistą nazwę narzędzia/modelu, ustawienia i wynik oceny. Nieznane dane oznacz `null`.
- Każdą animację obejrzyj w ruchu; sprawdź alpha, broń, twarz, skalę, tile seams i zgodność z hitboxami. Wymiar 4× nie dowodzi jakości ani użycia AI.

Stosuj pełny proces z `docs/ASSET_WORKFLOW.md`. Baseline nearest-neighbor może służyć do implementacji i porównań; finalny remaster wymaga faktycznie wykonanej obróbki AI. Zasób niedokończony ma jawny status. Nowa nazwa folderu lub model wymieniony w dokumentacji bez realnego wywołania nie są wynikiem AI.

## Weryfikacja i Definition of Done

Najpierw pinuj ryzykowne reguły na małych, deterministycznych fixture’ach z oryginału. Sprawdź loader wszystkich map, kolizje na granicach, akcje ataku i transformacji, timing symulacji, śmierć/restart oraz zapis. Test, który porównuje implementację tylko z jej własnym wynikiem, nie dowodzi zgodności z JAR-em.

Gra jest ukończona, gdy:

- [ ] Cała kampania od startu do zakończenia jest dostępna i możliwa do przejścia; wszystkie mapy i wymagane starcia z bossami działają.
- [ ] Sterowanie, ruch, walka, obrażenia, krew, moce, przeciwnicy, interakcje i tempo odpowiadają źródłowej grze; odchylenia mają osobny opis.
- [ ] Menu, pauza, restart, dźwięki i zapis działają na klawiaturze oraz dotyku.
- [ ] Wszystkie docelowe grafiki przeszły AI 4× i przegląd albo mają wyraźnie uzgodniony wyjątek; sam baseline nie kończy zadania.
- [ ] Sprawdzono desktop i mały ekran dotykowy, focus/visibility, restart, wczytanie zapisu i istotne błędy w konsoli.
- [ ] Wykonano porównanie z uruchomionym oryginałem. Jeśli to zablokowane, raport mówi „zgodność niezweryfikowana”, a nie „port 1:1”.
- [ ] `web/` działa po `python3 -m http.server 8080 --directory web`; gracz nie potrzebuje Javy, emulatora, procesu build ani kluczy API.
- [ ] Dostarczono ZIP kompletnego projektu, aktualny README, polecenia kontroli i `docs/VERIFICATION.md` z tym, co rzeczywiście wykonano.

Nie kończ na samym ekranie tytułowym, pojedynczym poziomie lub liście przyszłych zadań. Jeżeli zewnętrzna blokada uniemożliwia wymagany etap, podaj ukończony zakres i dokładny warunek wznowienia.
