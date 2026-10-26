# Niezależne porównanie ES ↔ EN

Wynik: **passed**. Oba JAR-y po 60 wpisów; zmienione dokładnie `Strings.class`, `background.png`, `mainCanvas.class`. ZIP CRC poprawne.

## mainCanvas — 18 zmienionych stałych UTF-8

| Indeks constant pool | ES | EN |
| --- | --- | --- |
| 827 | cargando | loading |
| 828 | cargando gráficos | Loading graphics |
| 829 | vampire : | vampire: |
| 831 | ayuda | Help |
| 832 | sonido : on | Sound: On |
| 833 | sonido : off | Sound: Off |
| 834 | Menú principal | Main Menu |
| 835 | jugar | play |
| 836 | opciones | options |
| 837 | salir del juego | Exit Game |
| 838 | Diseño: Paul Jacobson, Daniel Rammelt~~Código: Daniel Rammelt.~~Arte: Paul Jacobson, Matthew Risley.~~Productor: Nic Garner.~~Producido por Mforma Europe.~Software copyright 2003 Mforma Group. | Design: Paul Jacobson, Daniel Rammelt ~~ Code: Daniel Rammelt. ~~ Art: Paul Jacobson, Matthew Risley. ~~ Producer: Nic Garner. ~~ Produced by Mforma Europe. ~ Software copyright 2003 Mforma Group. ~~ English Translation by Lanzz, 2021 for Kahvibreak project. |
| 842 | créditos | Credits |
| 843 | historia | Story |
| 844 | ayuda general | General Help |
| 845 | controles del jugador | player controls |
| 846 | ¿Continuar? | Continue? |
| 851 | reiniciar el juego? | Restart the game? |
| 852 | reiniciar el juego | Reset game |

Po constant pool identyczne 38107 bajtów, SHA-256 `8539af88ad4efbbecaeaae2abbe8f36b835dfe4bcee453d3a190eeaa1f690968`. Różne offsety nagłówka wynikają z długości tłumaczonych napisów; instrukcje metod, pola i atrybuty po constant pool pozostają identyczne.

Pełne hashe wszystkich 60 wpisów i oba przypięte SHA-256: `source-comparison.json`. Skrypt nie korzysta z dołączonych wcześniej raportów porównania. Ograniczenie uruchomienia: `source-emulator-probe.json`; dokumentacja danych i pochodzenia: `../docs/SOURCES.md`.
