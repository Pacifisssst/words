// Проверка данных игры: node check.mjs
// Берёт генераторы прямо из index.html (между «помощники» и концом UNITS) и гоняет их 300 раз.
import fs from 'fs'; import path from 'path';
const html = fs.readFileSync('index.html', 'utf8');
const words = fs.readFileSync('../5m2a/words.js', 'utf8');
const from = html.indexOf('// ====== помощники ======');
const to = html.indexOf('// ====== сохранение');
if (from < 0 || to < 0) { console.error('не нашёл границы кода'); process.exit(1) }
const src = words + ';globalThis.WORDS=WORDS;' + html.slice(from, to);
const { UNITS, WK, GAPS, PICWORDS, SPELL } = new Function(src + ';return {UNITS,WK,GAPS,PICWORDS,SPELL}')();

let n = 0, bad = [];
const файл = p => fs.existsSync(p.startsWith('../') ? p.replace('../', '../') : p);
const audioSeen = new Set(), picSeen = new Set();

for (let r = 0; r < 300; r++) UNITS.forEach(u => u.make().forEach((q, i) => {
  n++; const w = `${u.id}#${i}`;
  const json = JSON.stringify(q);
  if (/undefined|NaN|null/.test(json)) bad.push(w + ' — undefined/NaN в задании');
  if (!q.qid) bad.push(w + ' — нет qid (учитель не увидит, на чём ошибаются)');
  if (!q.why) bad.push(w + ' — нет объяснения');
  if (q.audio) { audioSeen.add(q.audio); if (!q.prompt.includes('▶')) bad.push(w + ' — звук есть, а ▶ в тексте нет') }
  if (q.type === 'choice') {
    if (new Set(q.opts).size !== q.opts.length) bad.push(w + ' — повторяются варианты: ' + q.opts.join(' / '));
    if (!(q.correct >= 0 && q.correct < q.opts.length)) bad.push(w + ' — correct вне списка');
    if (q.opts.length < 3) bad.push(w + ' — меньше трёх вариантов (угадать слишком легко)');
    if (q.pics) q.opts.forEach(k => { if (!WK[k]) bad.push(w + ' — нет слова ' + k); else picSeen.add(WK[k].img) });
  } else if (q.type === 'build') {
    const t = q.tiles.slice();
    for (const x of q.right) { const k = t.indexOf(x); if (k < 0) { bad.push(w + ' — предложение не собирается'); break } t.splice(k, 1) }
    if (q.tiles.length - q.right.length < 1) bad.push(w + ' — нет ни одной лишней плитки');
  } else if (q.type === 'text') {
    if (!q.accept || !q.accept[0]) bad.push(w + ' — нечего принять как ответ');
    if (q.accept.some(a => a !== a.toLowerCase())) bad.push(w + ' — accept должен быть в нижнем регистре');
  }
}));

// картинки и звук реально лежат на диске
[...audioSeen].forEach(a => { if (!fs.existsSync(a)) bad.push('нет файла звука: ' + a) });
[...picSeen].forEach(p => { if (!fs.existsSync('../5m2a/' + p)) bad.push('нет картинки: ' + p) });
GAPS.forEach(g => {
  if (!fs.existsSync('audio/' + g.f + '.mp3')) bad.push('нет записи ' + g.f);
  if (!g.t.includes('___')) bad.push(g.f + ' — во фразе нет пропуска');
  if (!g.o.includes(g.a)) bad.push(g.f + ' — верного варианта нет в списке');
});
SPELL.forEach(k => { if (!WK[k]) bad.push('SPELL: нет слова ' + k); else if (/\s/.test(WK[k].en)) bad.push('SPELL: ' + WK[k].en + ' из двух слов — писать трудно') });
PICWORDS.forEach(k => { if (!WK[k]) bad.push('PICWORDS: нет слова ' + k) });
// у каждого уровня хватает заданий
UNITS.forEach(u => { const c = u.make().length; if (c < 5) bad.push(u.id + ' — всего ' + c + ' заданий') });

const uniq = [...new Set(bad)];
console.log(`заданий проверено: ${n}, уровней: ${UNITS.length}, записей: ${audioSeen.size}`);
if (uniq.length) { console.log('ПРОБЛЕМЫ:'); uniq.slice(0, 40).forEach(b => console.log(' -', b)); process.exit(1) }
console.log('всё чисто');
