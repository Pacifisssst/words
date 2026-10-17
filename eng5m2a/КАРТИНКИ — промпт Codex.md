# Картинки для английской игры «Spidey» (5Б, Module 2a)

Пять картинок с тем же котом, что в «Коте Иксе», и одна сцена-фон.
Пока их нет — игра показывает запасные кадры кота и работает полностью.

## Как отдать Codex

Приложить файл-образец кота: `~/development/words/math5/img/w/cat-yes.webp`
(или `img/w/cat-yes.webp` из этой папки — он уже скопирован).

Промпт одним куском:

---

Draw five character images and one background scene of **the same orange cartoon cat**
as in the attached reference picture — same face, same fur colour, same friendly style.

Save ONLY into `img/codex/` of this folder. **Do not delete or overwrite any other files.**

**No text, no letters, no numbers anywhere in the images.**

Characters — white background, square 1024×1024, full body, centred:

1. `cat-bag.png` — the cat holds an open school bag; a pencil case, a ruler and a rolled map
   are falling out of it. Cheerful, slightly surprised.
2. `cat-listen.png` — the cat wears big headphones, one paw raised to its ear, eyes closed,
   listening carefully.
3. `cat-write.png` — the cat sits at a small desk with a pencil in its paw, writing in an
   exercise book, tongue sticking out with effort.
4. `cat-globe.png` — the cat hugs a globe, a small suitcase with travel stickers next to it
   (stickers are plain coloured shapes, no words).
5. `cat-wall.png` — the cat sits on top of a red brick wall, tail hanging down, proud and
   victorious, paws up.

Scene — 1280×720:

6. `scene-wall.png` — a red brick wall across the whole frame, a large spider web in the
   top-left corner, a city skyline and evening sky behind the wall. **No characters in this one.**

Style for all six: flat, friendly, bright, thick clean outlines, children's-book look,
the same as the reference cat. Nothing scary.

---

## После генерации (делаю я)

1. Посмотреть глазами — кот тот же?
2. Сжать: `cwebp -q 80 -resize 480 0 img/codex/cat-bag.png -o img/w/cat-bag.webp`
   (сцену — `-resize 640 0`).
3. Игра подхватит сама: порядок поиска `img/w/*.webp` → `img/codex/*.png` → запасной кадр.

## Чего НЕ рисовать

- **Человека-паука** и любых чужих персонажей (правило 15.10: только имена, не рисунки).
  Паутина и кирпичная стена — можно, это не персонаж.
- Детей, школу 218, надписи.
