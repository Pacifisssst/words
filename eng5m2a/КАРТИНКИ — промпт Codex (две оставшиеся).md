# Две оставшиеся картинки

Codex 17.10 отдал четыре из шести: `cat-bag`, `cat-globe`, `cat-write`, `scene-wall` —
они сжаты и уже в игре. Не пришли `cat-listen` и `cat-wall`.

Ниже — ОДИН блок. Вставить в Codex как есть, ничего не дописывать.

```
Open the reference picture ~/development/words/eng5m2a/img/w/cat-bag.webp and look at it
first: both images below must show THE SAME orange cartoon cat in THE SAME costume — same
face, same green eyes, same fur colour, same friendly children's-book style, thick clean
outlines, flat bright colours.

The costume is a red and blue bodysuit with thin black web lines and a red mask over the
head with two big white almond eye shapes, ears sticking out through the mask. The cat's
orange tail and cream paws stay visible. Do not copy any existing film character or logo —
this is our own cat in a home-made costume.

Save the files into ~/development/words/eng5m2a/img/codex/ and write nothing anywhere else:
do not delete, move or overwrite any other file in that folder or the repository.

No text, no letters, no numbers anywhere in either image.

Both are plain white background, square 1024x1024, full body, centred:

1. cat-listen.png — the costumed cat wears big headphones over the mask, one paw raised to
   its ear, listening carefully, eyes slightly narrowed in concentration.
2. cat-wall.png — the costumed cat sits on top of a red brick wall, tail hanging down over
   the bricks, both paws up, proud and victorious, a thin white web strand going up out of
   the top of the frame.

Nothing scary, nothing dark: this is for ten-year-old children.
```

## Потом

1. Посмотреть глазами: кот тот же, что на четырёх уже стоящих?
2. Сжать:
   `cwebp -q 80 -resize 480 0 img/codex/cat-listen.png -o img/w/cat-listen.webp`
   `cwebp -q 80 -resize 480 0 img/codex/cat-wall.png -o img/w/cat-wall.webp`
3. `node check.mjs`, коммит только папки `eng5m2a`, push.

Игра подхватит сама: порядок поиска `img/w/*.webp` → `img/codex/*.png` → запасной кадр.
Сейчас на этих двух местах стоят `cat-think` и `cat-win` — игра полная, дети ничего
не теряют.

Мастера PNG остаются локально в `img/codex/` и в git не уходят.
