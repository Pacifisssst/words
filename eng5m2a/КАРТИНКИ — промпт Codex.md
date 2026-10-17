# Картинки для английской игры «Spidey» (5Б, Module 2a)

Ниже — ОДИН блок. Вставить в Codex как есть, ничего не дописывать: пути к образцу,
папка вывода и имена файлов уже внутри.

```
Open the reference picture ~/development/words/eng5m2a/img/w/cat-hi.webp and look at it first:
every image below must show THE SAME orange cartoon cat — same face, same fur colour, same
friendly children's-book style, thick clean outlines, flat bright colours.

In five of the six images the cat wears a spider-hero costume: a red and blue bodysuit with
thin black web lines, a red mask over the head with two big white almond eye shapes, ears
sticking out. Keep the cat's orange tail and paws visible. Do not copy any existing film
character or logo — this is our own cat in a home-made costume.

Save the files into ~/development/words/eng5m2a/img/codex/ and write nothing anywhere else:
do not delete, move or overwrite any other file in that folder or the repository.

No text, no letters, no numbers anywhere in any image.

Five characters — plain white background, square 1024x1024, full body, centred:

1. cat-bag.png — the costumed cat holds an open school bag; a pencil case, a ruler and a
   rolled map are falling out of it. Cheerful, slightly surprised.
2. cat-listen.png — the costumed cat wears big headphones over the mask, one paw raised to
   its ear, listening carefully.
3. cat-write.png — the costumed cat sits at a small desk, pencil in paw, writing in an
   exercise book, leaning in with effort.
4. cat-globe.png — the costumed cat hugs a globe, a small suitcase beside it with plain
   coloured stickers (shapes only, no words).
5. cat-wall.png — the costumed cat sits on top of a red brick wall, tail hanging down,
   both paws up, proud and victorious, a thin web strand going up out of frame.

One scene — 1280x720, no characters at all:

6. scene-wall.png — a red brick wall filling the frame, a large spider web in the top-left
   corner, an evening city skyline behind the wall.

Nothing scary, nothing dark: this is for ten-year-old children.
```

## Потом (делаю я)

1. Посмотреть глазами: кот тот же? Костюм одинаковый на всех пяти?
2. Сжать: `cwebp -q 80 -resize 480 0 img/codex/cat-bag.png -o img/w/cat-bag.webp`
   (сцену — `-resize 1024 0`: она во всю ширину экрана, 640 мылит), проверить и запушить.
3. Игра подхватит сама: порядок поиска `img/w/*.webp` → `img/codex/*.png` → запасной кадр.
   Пока картинок нет, показывается обычный Кот Икс — игра полная.

## Чего не рисовать

- Настоящего Человека-паука, его логотип и кадры из фильмов. Наш кот в своём костюме —
  как в песне «Spidey on the Wall» (его решение 17.10).
- Детей, школу 218, любые надписи.
