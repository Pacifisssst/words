// Проверка данных игры: node check.mjs
// Берёт генераторы прямо из index.html (между «помощники» и концом UNITS) и гоняет их 300 раз.
import fs from 'fs'; import path from 'path';
const html = fs.readFileSync('index.html', 'utf8');
const words = fs.readFileSync('../5m2a/words.js', 'utf8');
const from = html.indexOf('// ====== помощники ======');
const to = html.indexOf('// ====== сохранение');
if (from < 0 || to < 0) { console.error('не нашёл границы кода'); process.exit(1) }
const src = words + ';globalThis.WORDS=WORDS;' + html.slice(from, to);
const { UNITS, WK, GAPS, PICWORDS, SPELL, W2, WX, W2K, CHS, ONEPIC, MANYPIC, howMany, numWord } = new Function(src + ';return {UNITS,WK,GAPS,PICWORDS,SPELL,W2,WX,W2K,CHS,ONEPIC,MANYPIC,howMany,numWord}')();

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
    if (q.emo) q.opts.forEach(k => { if (!W2K[k]) bad.push(w + ' — нет слова 2b ' + k) });
    if (q.alts) q.opts.forEach((o, i) => { if (i !== q.correct && q.alts.includes(o)) bad.push(w + ' — верная форма среди неверных: ' + o) });
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
// глава 2b: у каждого слова оба звука, неверные формы правда неверные, id уровней не пересекаются
W2.forEach(x => ['', '-p'].forEach(p => { if (!fs.existsSync(`audio/2b/${x.k}${p}.mp3`)) bad.push('нет звука 2b: ' + x.k + p) }));
[...W2, ...WX].forEach(x => {
  if (x.np) return;
  if (!x.wr || x.wr.length < 3) bad.push(x.k + ' — меньше трёх неверных форм');
  else if (x.wr.some(f => f === x.pl || (x.altpl || []).includes(f))) bad.push(x.k + ' — среди неверных форм есть верная');
  if (new Set(x.wr).size !== x.wr.length) bad.push(x.k + ' — неверные формы повторяются');
});
// картинки 2b (урок 20.10): у каждого слова урока своя, «много» — ровно столько, сколько сказано
W2.forEach(x => { if (!fs.existsSync(`img/w/2b/${x.k}.webp`)) bad.push('нет картинки 2b: ' + x.k) });
Object.values(ONEPIC).forEach(f => { if (!fs.existsSync(`img/w/2b/${f}.webp`)) bad.push('нет картинки: ' + f) });
Object.entries(MANYPIC).forEach(([k, f]) => {
  if (!W2K[k]) bad.push('MANYPIC: нет слова ' + k);
  if (!fs.existsSync(`img/w/2b/n/${f}.webp`)) bad.push('нет картинки «много»: ' + f);
  if (!f.startsWith(numWord(howMany(k)) + '-')) bad.push(`${k}: в задании «${numWord(howMany(k))}», а на картинке ${f}`);
});
if (MANYPIC.trainers) bad.push('two-trainers не берём: на картинке 3 кроссовки (его решение 20.10)');
for (let r = 0; r < 200; r++) UNITS.filter(u => u.ch === '2b').forEach(u => u.make().forEach(q => {
  const m = /→ (two|three) ___/.exec(q.prompt || ''); if (!m) return;
  const k = (q.qid.split(': ')[1] || ''), w = W2.concat(WX).find(x => x.en === k);
  if (w && MANYPIC[w.k] && !MANYPIC[w.k].startsWith(m[1] + '-')) bad.push(`${q.qid}: сказано ${m[1]}, нарисовано ${MANYPIC[w.k]}`);
}));
// песня «Учим песню»
const song = new Function(fs.readFileSync('song2b.js', 'utf8') + ';return SONG2B')();
if (!fs.existsSync(song.src)) bad.push('нет mp3 песни ' + song.src);
if (!fs.existsSync(song.cover)) bad.push('нет обложки песни ' + song.cover);
song.lines.forEach((l, i) => {
  [l.img, ...(l.ph || []).map(p => p[1])].forEach(f => { if (!fs.existsSync(f)) bad.push(`песня, строчка ${i + 1}: нет ${f}`) });
  if (!(l.t1 > l.t)) bad.push(`песня, строчка ${i + 1}: конец раньше начала`);
  if (i && l.t < song.lines[i - 1].t) bad.push(`песня, строчка ${i + 1}: время назад`);
  l.w.forEach(([x, t]) => { if (t < l.t - 0.6 || t > l.t1) bad.push(`песня, строчка ${i + 1}: слово ${x} вне строчки`) });
  if (!l.ru) bad.push(`песня, строчка ${i + 1}: нет перевода`);
});
const ids = UNITS.map(u => u.id);
if (new Set(ids).size !== ids.length) bad.push('повторяются id уровней');
UNITS.forEach(u => { if (!CHS.some(c => c.id === u.ch)) bad.push(u.id + ' — без главы') });
UNITS.filter(u => u.ch === '2b').forEach(u => { if (!u.id.startsWith('b-')) bad.push(u.id + ' — id главы 2b без «b-»: смешается с 2a в журнале') });
UNITS.filter(u => u.ch === '2b' && !u.boss).forEach(u => { const r = u.make().filter(q => q.rev).length; if (r < 2 || r > 3) bad.push(u.id + ' — повторение 2a: ' + r + ' заданий') });
// у каждого уровня хватает заданий
UNITS.forEach(u => { const c = u.make().length; if (c < 5) bad.push(u.id + ' — всего ' + c + ' заданий') });

const uniq = [...new Set(bad)];
console.log(`заданий проверено: ${n}, уровней: ${UNITS.length} (2a: ${UNITS.filter(u=>u.ch==='2a').length}, 2b: ${UNITS.filter(u=>u.ch==='2b').length}), записей: ${audioSeen.size}`);
if (uniq.length) { console.log('ПРОБЛЕМЫ:'); uniq.slice(0, 40).forEach(b => console.log(' -', b)); process.exit(1) }
console.log('всё чисто');
