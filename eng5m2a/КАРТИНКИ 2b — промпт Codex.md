# Картинки для главы 2b «Spidey's birthday»

Глава 2b **уже работает без них**: вместо картинок слов стоят эмодзи (🚲 📷 👜 …), вместо
двух новых котов — старые кадры. Картинки делают игру красивее, но не нужны к 20.10.

Ниже — ОДИН блок. Вставить в Codex как есть.

```
Open the reference picture ~/development/words/eng5m2a/img/w/cat-bag.webp and look at it
first. Images 1 and 2 must show THE SAME orange cartoon cat in THE SAME costume — same face,
same green eyes, same fur colour, same friendly children's-book style, thick clean outlines,
flat bright colours. The costume is a red and blue bodysuit with thin black web lines and a
red mask with two big white almond eye shapes, ears sticking out through the mask. Do not
copy any existing film character or logo — this is our own cat in a home-made costume.
Images 3–17 are single objects or people in the same flat, bright children's-book style.

Save ALL files into ~/development/words/eng5m2a/img/codex/2b/ (create this folder) and write
nothing anywhere else: do not delete, move or overwrite any other file in the repository.

No text, no letters, no numbers anywhere in any image. Nothing scary: this is for
ten-year-old children.

1. cat-gift.png — 1024x1024, plain white background, full body, centred: the costumed cat
   holds a big wrapped birthday present with a bow, happy, wearing a small party hat.
2. scene-party.png — 1280x720, a birthday party on a city rooftop at sunset: the costumed
   cat in the middle with balloons, a cake with candles (no numbers), a pile of wrapped
   presents, a bicycle and a skateboard next to the presents.

Objects 3–17: square 1024x1024, plain white background, ONE item centred, big and clear,
seen slightly from the side so a child recognises it at once:
3. bicycle.png — a red children's bicycle
4. camera.png — a small modern digital camera (not a phone)
5. handbag.png — a woman's handbag
6. helmet.png — a bicycle helmet
7. present.png — a wrapped present with a bow
8. scarf.png — a long striped knitted scarf
9. skateboard.png — a skateboard
10. trainers.png — a PAIR of sports trainers (two shoes)
11. child.png — one smiling child, about seven years old, full body
12. foot.png — one bare cartoon foot, friendly, not realistic
13. man.png — one smiling adult man, full body
14. mouse.png — one small grey cartoon mouse (the animal)
15. tooth.png — one white cartoon tooth, shiny
16. woman.png — one smiling adult woman, full body
17. knife.png — one table knife (a dinner knife, rounded, not a sharp kitchen knife)
```

## Потом

1. Посмотреть глазами: кот на 1–2 тот же, что в игре? Пришли все 17? (Codex 17.10 отдал
   4 из 6 — сверить список.)
2. Сжать (в папке `eng5m2a`):
   ```
   mkdir -p img/w/2b
   cwebp -q 80 -resize 480 0 img/codex/2b/cat-gift.png -o img/w/cat-gift.webp
   cwebp -q 80 -resize 1024 0 img/codex/2b/scene-party.png -o img/w/scene-party.webp
   for k in bicycle camera handbag helmet present scarf skateboard trainers child foot man mouse tooth woman knife; do cwebp -q 80 -resize 480 0 img/codex/2b/$k.png -o img/w/2b/$k.webp; done
   ```
3. Игра подхватит сама: если есть `img/w/2b/present.webp`, вместо эмодзи идут картинки
   (слово без своей картинки — всё равно эмодзи). Проверить глазами в `?test`.
4. `node check.mjs`, коммит только папки `eng5m2a`, push. PNG-мастера в git не уходят
   (`img/codex/` в `.gitignore`).
