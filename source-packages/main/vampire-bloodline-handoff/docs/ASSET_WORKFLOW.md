# Grafika 4× z obróbką AI

## Cel i status

Przygotuj remaster zasobów **Vampire Bloodline, wariant 176×208** do portu HTML + JavaScript / Canvas 2D. Każdy finalny raster ma mieć dokładnie czterokrotność szerokości i wysokości odpowiedniego oryginału. Zachowaj tożsamość postaci, paletę, czytelność walki, krew, efekty i charakter oprawy 2D.

Ten dokument jest instrukcją dla wykonawcy. Nie stanowi potwierdzenia wykonanej obróbki AI. Inwentaryzacja musi wskazać osobno zasoby oryginalne, techniczne powiększenia 4×, wyniki AI oraz zatwierdzone pliki finalne.

## Niezmienne zasady

- Zachowaj JAR i wyodrębnione oryginały bez zmian. Zapisz ich SHA-256. Każda konwersja, rekonstrukcja lub poprawka powstaje jako osobny plik.
- Najpierw odczytaj atlas, kolejność klatek, przezroczystość i metadane z zasobów oraz kodu. Nazwy plików, puste piksele i widoczne odstępy nie wystarczają do odgadnięcia podziału.
- **Logika pozostaje w jednostkach oryginału, grafika ma rozdzielczość 4×.** Pozycje, prędkości, grawitacja, hitboxy, hurtboxy, zasięgi ataków i czas klatek nie zmieniają się z powodu remasteru.
- Zachowaj liczbę, kolejność i czas trwania klatek. Nie dodawaj interpolowanych animacji ani nowych ciosów. Nie uznawaj zmiany sylwetki przez AI za zmianę kolizji.
- Nie narzucaj wszystkim sprite’om zaczepienia „dół–środek”. Odtwórz oryginalne punkty zaczepienia i przesunięcia **każdej klatki**, także klatek ataku, skoku, śmierci i efektów.

## 1. Inwentaryzacja i dekodowanie

Przygotuj manifest: identyfikator zasobu, ścieżka wejściowa, hash, format, rozmiar, paleta/alpha, typ oraz źródło ustalenia. Oddziel postacie, środowisko, kafelki, efekty, UI, fonty i ekrany tytułowe. Nie zakładaj z góry liczby atlasów, animacji ani poziomów.

Jeśli grafika jest spakowana, szyfrowana prostym przekształceniem albo tworzona z palet w kodzie, odtwórz dekoder. Zweryfikuj wynik względem zachowania oryginału. Przy kluczu koloru ustal rzeczywistą wartość i warunki jej użycia; nie usuwaj automatycznie czerni lub magenty, bo mogą być częścią postaci.

Wyeksportuj arkusze kontaktowe z identyfikatorami oraz podglądy pełnych animacji. Mapowanie sprite → klatki → zdarzenia rozgrywki musi istnieć przed obróbką AI.

## 2. Techniczny punkt odniesienia 4×

Utwórz deterministyczne powiększenie metodą nearest-neighbor. Pozwala porównać geometrię, paletę, alpha i sposób wyświetlania. Oznacz je jako **baseline**, nie jako wykonany remaster AI. Lanczos, xBRZ i zwykłe skalowanie również nie zastępują wymaganej obróbki AI.

Dla nominalnego obrazu 176×208 referencyjny raster 4× ma 704×832. Faktyczne granice pola gry i HUD ustal z kodu. Rozmiar CSS, rozdzielczość tekstur i `devicePixelRatio` to osobne parametry; nie mnoż wartości przez 4 ponownie przy każdym etapie renderowania.

## 3. Obróbka AI

Wybierz rzeczywiście dostępne narzędzie edycji obrazów lub model super-resolution. Przygotuj reprezentatywną klatkę i sekwencję z oryginału jako wzorzec stylu. Wybierz zachowawczy wariant, porównaj go z całym materiałem i używaj konsekwentnie w kolejnych partiach. Rutynową ocenę wykonuj samodzielnie; nowe zakupy usług lub zasadnicza zmiana stylu wymagają osobnej decyzji użytkownika.

Przetwarzaj całą animację lub spójny zestaw postaci w jednej partii z wspólną referencją. Generowanie każdej klatki niezależnie sprzyja zmianom twarzy, stroju, skali i broni. Duże sekwencje dziel tylko z nakładającymi się klatkami referencyjnymi i porównaniem granic partii.

Wymagaj oparcia wyniku na dostarczonym obrazie. Nie zastępuj oryginalnego bohatera ogólnym „wampirem”, nie dodawaj ekwipunku, nowych poz, fotorealizmu ani efektów 3D. Zachowaj oryginalny przebieg efektów krwi i trafień. Gotowe prompty są w `../prompts/ASSET_REMASTER.md`.

Jeżeli AI nie jest dostępne, kontynuuj wierny port i pracę z baseline. Zapisz status `blocked_ai_unavailable`; etap graficzny pozostaje niedokończony. Nie opisuj zwykłego skalowania jako AI.

## 4. Normalizacja i integracja

Zachowaj surowy wynik AI. Finalny plik przygotuj osobno w dokładnym rozmiarze 4×. Jeśli narzędzie zwróciło inny rozmiar, użyj jednej udokumentowanej transformacji dla całego arkusza. Odrzuć wynik z przestawionymi klatkami lub zmienionymi proporcjami; niezależne rozciąganie poszczególnych klatek nie naprawia niespójnej animacji.

W atlasie o niezmienionym układzie prostokąt źródłowy `(sx, sy, sw, sh)` staje się `(4*sx, 4*sy, 4*sw, 4*sh)`. Analogicznie przelicz pikselowe marginesy. Współrzędne docelowe w świecie pozostają logiczne: sprite szeroki pierwotnie 12 jednostek nadal zajmuje 12 jednostek, choć tekstura ma szerokość 48 pikseli. Jeżeli przepakowujesz atlas, wygeneruj nowe prostokąty z packera i zachowaj pierwotne identyfikatory, trim-offsety oraz punkty zaczepienia.

Przy edycji wyodrębnionych klatek dodaj robocze marginesy, potem usuń je zgodnie z zapisanymi współrzędnymi. Nie pozwalaj AI domalowywać sąsiedniej klatki. Przy filtrowaniu tekstur stosuj padding i ekstruzję krawędzi, a prostokąt sprite’a trzymaj wewnątrz paddingu.

Przezroczystość sprawdź na białym, czarnym i szachownicowym tle. W razie potrzeby odtwórz maskę alpha z powiększonego oryginału. Drobne zmiany obrysu dopuszczaj tylko w jawnie określonym marginesie dla danego zasobu; zachowaj anchor, bez ucinania broni i kończyn. Nie przenoś wypełnienia tła ani kolorowych obwódek do finalnego PNG.

Kafelki obrabiaj z kontekstem sąsiadów lub zawijanym paddingiem. Sprawdź powtarzanie w siatce i wszystkie rzeczywiście używane styki. Nie poprawiaj pojedynczego kafelka kosztem szwu na całej mapie. Teksty i glify zachowaj znak po znaku: zniekształcone przez AI napisy napraw deterministycznie albo odtwórz w warstwie UI, dokumentując wyjątek.

## 5. Rejestr i odbiór

Dla każdej partii zapisz: źródłowe i wynikowe SHA-256, identyfikatory zasobów, narzędzie, rzeczywisty model i wersję, prompt, parametry, seed jeśli dostępny, datę, ścieżkę surowego wyniku, operacje normalizacji oraz decyzję oceny. Nieznane wartości oznacz `null`, nie zgaduj. Statusy: `original`, `baseline_only`, `ai_generated_unreviewed`, `approved`, `rejected`, `blocked_ai_unavailable`.

Warunki ukończenia:

- [ ] Każdy finalny zasób ma dokładne wymiary 4× i udokumentowany związek z oryginałem.
- [ ] Obróbka AI rzeczywiście wykonana; wyjątki i zasoby z samym baseline są jawne.
- [ ] Liczba, kolejność, tempo, kierunek, anchor i offset każdej klatki zachowane.
- [ ] Brak migotania stroju/twarzy, zmian długości broni, dryfowania skali i przesunięć postaci.
- [ ] Alpha, padding, odbicia i styki kafelków sprawdzone w silniku, także w ruchu.
- [ ] Podgląd hitboxów potwierdza zachowaną logikę i czytelność kontaktu z przeciwnikami.
- [ ] Dostępne porównanie oryginał/remaster przy tej samej sekwencji wejść; warto zachować przełącznik grafiki referencyjnej.
- [ ] Rejestr pozwala odtworzyć proces bez nadpisywania oryginałów.
