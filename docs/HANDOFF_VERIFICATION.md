# Weryfikacja pakietu wejściowego

Data: **2026-10-26**. Zakres: kompletność i powtarzalność materiałów dla agenta, nie odbiór gotowej gry.

## Wykonane kontrole

| Kontrola | Wynik |
| --- | --- |
| JAR: SHA-256 i 160 575 bajtów | Zgodne z przypiętą sumą w `source/provenance.json` |
| JAR: struktura ZIP oraz CRC | Poprawne |
| Inwentaryzacja 60 plików | Rozmiary, SHA-256 i CRC-32 zgodne z wpisami JAR-a |
| 54 wyeksportowane zasoby, w tym manifest raportowy | Identyczne bajtowo z JAR-em |
| Osobny `source/MANIFEST.MF` | Identyczny bajtowo z JAR-em |
| Wszystkie 25 PNG | Otwierają się poprawnie; wymiary odpowiadają inwentaryzacji |
| Wszystkie 13 WAV | Poprawne nagłówki PCM, mono, 8 bitów |
| Wszystkie 15 map | Pełne kolumny po 16 komórek; indeksy deskryptorów w zakresie |
| Plan remasteru: 25 wpisów | Pełne pokrycie PNG, zgodne hashe i dokładne wymiary 4× |
| Dekompilacja sześciu klas | CFR 0.152 zakończył pracę kodem 0 |
| Powtórzenie dekompilacji przez `tools/decompile.sh` | Wszystkie sześć plików Java identycznych bajtowo z dołączonym wynikiem |
| Ochrona przed nadpisaniem niepustego katalogu dekompilacji | Sprawdzona; skrypt odmawia nadpisania |
| Składnia skryptów Python i Bash | Poprawna |
| Wewnętrzne odnośniki Markdown | Docelowe pliki istnieją |
| Przegląd README, AGENTS, planu oraz workflow grafik | Brak wykrytych sprzeczności dotyczących skali, zakresu i statusu prac |

Wynik automatycznej kontroli źródeł zapisano w `reports/source_verification.json`. Dekoder formatu map na potrzeby audytu i analiza klas są opisane w `docs/REVERSE_ENGINEERING.md` oraz `reports/static_format_audit.json`.

## Jak powtórzyć kontrolę po rozpakowaniu

W katalogu głównym pakietu uruchom:

```bash
python3 tools/verify_source.py
```

Wymagany Python 3.10+, bez zewnętrznych bibliotek. Skrypt niczego nie zapisuje i nie uruchamia gry. Weryfikuje integralność materiału wejściowego, powiązania źródeł oraz plan wymiarów; nie potwierdza wykonania ani jakości przyszłego remasteru AI.

W systemie z narzędziem `sha256sum` można sprawdzić cały stan wydanej paczki:

```bash
sha256sum -c CHECKSUMS.sha256
```

`CHECKSUMS.sha256` obejmuje wszystkie pliki wydanego pakietu poza samym spisem. Po celowej edycji dokumentów lub kodu część sum zmieni się; nie jest to wtedy dowód uszkodzenia źródłowego JAR-a.

## Czego ta paczka nie potwierdza

- Nie uruchamiano MIDletu w emulatorze. Zgodność rozgrywki i timingów w działającym porcie będzie wymagała osobnego porównania.
- Nie odzyskano JAR-a bezpośrednio z Mobiles24. Załączona kopia z Internet Archive odpowiada tytułowi, rozmiarowi i materiałowi graficznemu 176×208, ale jej tożsamość bajtowa z tamtym uploadem jest nieznana.
- Nie utworzono jeszcze implementacji HTML/JS ani katalogu `web/`.
- Nie przetworzono grafik przez AI ani nie utworzono finalnych arkuszy 4×. `assets/remaster-plan.json` opisuje dopiero wejścia i cele.

Raport akceptacji gotowego portu ma powstać później jako `docs/VERIFICATION.md`; ten dokument dotyczy wyłącznie przygotowania materiału wejściowego.
