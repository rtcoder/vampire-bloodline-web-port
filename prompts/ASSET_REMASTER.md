# Prompty do remasteru 4×

Używaj trybu edycji z załączonymi oryginalnymi obrazami. Przed uruchomieniem zastąp pola w nawiasach danymi z audytu. Brakującej liczby klatek, wymiarów lub anchorów nie zgaduj. Wynik zawsze przechodzi kontrolę z `../docs/ASSET_WORKFLOW.md`.

## 1. Postać / kompletna animacja

```text
Edit the attached ORIGINAL Vampire Bloodline mobile-game animation sheet.
Create a faithful 4x-resolution 2D game-asset remaster, grounded strictly in
the provided pixels and the attached approved style reference.

Input sheet: [WIDTH] x [HEIGHT] pixels.
Final normalized sheet: [WIDTH*4] x [HEIGHT*4] pixels.
Animation: [ID]. Frame count: [COUNT]. Layout: [ROWS/COLUMNS OR SLOT MAP].
Facing direction and frame sequence: [EXACT VALUES FROM SOURCE].

Preserve the same character identity, silhouette, palette family, facial
features, costume, weapon, proportions, poses and action timing. Refine
existing details into coherent, crisp game artwork. Process the complete
animation as one consistent sequence. Do not independently redesign frames.

Keep every frame in its original slot. Preserve the supplied per-frame
origin, anchor and offsets; do not recenter the character. Maintain the
same framing and empty space, scaled uniformly by four. Keep the exact
frame count. Do not invent in-between frames or additional movements.

Preserve source blood and impact effects without replacing them with new
effects. Use a transparent background; keep empty areas empty. No scenery,
labels, captions, watermark, poster composition, photorealism or 3D lighting.
Do not add equipment or extend shapes into neighboring frame slots.
```

## 2. Kafelki i środowisko

```text
Edit the attached original Vampire Bloodline environment tiles together
with the supplied adjacency preview and palette reference. Produce a
faithful 4x-resolution 2D remaster.

Tile size: [W] x [H]; final size: [W*4] x [H*4].
Tile IDs, order and atlas layout: [SOURCE METADATA].
Required seamless edges and neighbors: [AUDITED ADJACENCIES].

Preserve geometry, openings, platform edges, visible collision boundaries,
material identity, color relationships and transparency. Enhance existing
detail without inventing new obstacles, doorways, decorations or lighting
that changes gameplay readability. Preserve seamless joins and repetition.
Use the supplied neighboring or wrapped border context; do not treat each
tile as an unrelated illustration. Keep all atlas slots and padding clear.
No text, labels, watermark, perspective changes or new scene composition.
```

## 3. Efekty, interfejs i ekran tytułowy

```text
Create a faithful 4x-resolution edit of this original Vampire Bloodline
[EFFECT / UI / TITLE] asset, using the source as the authoritative design.
Original dimensions: [W] x [H]. Final dimensions: [W*4] x [H*4].

Preserve layout, palette, transparency, icon meanings and visual hierarchy.
For animation, preserve all [COUNT] frames, their order, slots and anchors.
For blood and combat effects, preserve the original progression and readable
shape. Do not invent additional particles or change their perceived reach.
For text, preserve every supplied character exactly: [TRANSCRIPTION].
Do not translate, correct, replace or embellish wording or logos.
No new buttons, text, watermark, scenery or photorealistic rendering.
```

## 4. Kontrola wyniku — polecenie dla agenta

```text
Compare ORIGINAL, NEAREST-NEIGHBOR BASELINE 4X and AI OUTPUT at the same
logical scale, then inspect complete animation playback. Check identity,
palette, silhouette, per-frame anchors, offsets, weapon length, transparency,
tile seams and combat readability. Validate dimensions and frame metadata
programmatically. Record concrete defects and approve or reject each asset.
Do not infer successful AI processing from image dimensions or filenames.
Preserve raw model output and record the actual tool/model, prompt,
parameters, known seed, input/output SHA-256 and normalization operations.
```
