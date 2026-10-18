// Проверка данных игры «Глаголы 7»: node check.mjs
// Берёт генераторы прямо из index.html (между «помощники» и «сохранение») и гоняет их 300 раз.
import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const from = html.indexOf('// ====== помощники ======'), to = html.indexOf('// ====== сохранение');
if (from < 0 || to < 0) { console.error('не нашёл границы кода'); process.exit(1) }
const pre = 'const save={pupil:null};const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",\'"\':"&quot;"}[c]));';
const { UNITS, ALL, SETS, FIX, DID, PAST, USED, USEDN, UPS, VK, TESTS, reg } =
  new Function(pre + html.slice(from, to).replace(/^const esc=.*$/m, '') + ';return {UNITS,ALL,SETS,FIX,DID,PAST,USED,USEDN,UPS,VK,TESTS,reg}')();

let n = 0; const bad = new Set(); const files = new Set();
const formsOf = new Set(ALL.flatMap(v => [v.v1, v.v2, v.v3]));
for (let r = 0; r < 300; r++) UNITS.forEach(u => u.make().forEach((q, i) => {
  n++; const w = `${u.id}#${i}`;
  if (/undefined|NaN|null/.test(JSON.stringify(q))) bad.add(w + ' — undefined/NaN: ' + JSON.stringify(q).slice(0, 120));
  if (!q.qid || q.qid.length > 60) bad.add(w + ' — нет qid или длиннее 60');
  if (!q.why) bad.add(w + ' — нет объяснения');
  if (!q.hint) bad.add(w + ' — нет подсказки');
  if (q.audio) { files.add(q.audio); if (!q.prompt.includes('▶')) bad.add(w + ' — звук есть, а ▶ в тексте нет') }
  if (q.card) files.add(q.card);
  if (q.gap !== undefined && !q.gap) bad.add(w + ' — пустая строка задания');
  if (q.type === 'choice') {
    if (new Set(q.opts).size !== q.opts.length) bad.add(w + ' — повторяются варианты: ' + q.opts.join(' / '));
    if (!(q.correct >= 0)) bad.add(w + ' — correct вне списка');
    if (q.opts.length < 3) bad.add(w + ' — меньше трёх вариантов: ' + q.opts.join(' / '));
    // «неверный» вариант не должен случайно оказаться верным
    if (u.id.startsWith('v2') || u.id === 'boss' && q.qid.startsWith('V2')) {
      const v = VK[q.qid.split(': ')[1]]; q.opts.forEach((o, k) => { if (k !== q.correct && v.v2.split(' / ').includes(o)) bad.add(w + ' — второй верный вариант ' + o) });
    }
    if (q.qid.startsWith('V3')) { const v = VK[q.qid.split(': ')[1]]; q.opts.forEach((o, k) => { if (k !== q.correct && o === v.v3) bad.add(w + ' — второй верный V3') }) }
    if (q.qid.startsWith('did + V1')) { const v = VK[q.qid.split(': ')[1]]; q.opts.forEach((o, k) => { if (k !== q.correct && o === v.v1) bad.add(w + ' — второй верный V1') }) }
  } else if (q.type === 'build') {
    const t = q.tiles.slice();
    for (const x of q.right) { const k = t.indexOf(x); if (k < 0) { bad.add(w + ' — не собирается: ' + q.tiles.join(',')); break } t.splice(k, 1) }
    if (q.tiles.length - q.right.length < 1) bad.add(w + ' — нет ни одной лишней плитки');
    if (q.accept[0] !== q.right.join(' ')) bad.add(w + ' — accept не равен right');
  } else if (q.type === 'text') {
    if (!q.accept || !q.accept[0]) bad.add(w + ' — нечего принять как ответ');
    if (q.accept.some(a => a !== a.toLowerCase())) bad.add(w + ' — accept в нижнем регистре');
    if (q.gap && q.qid.startsWith('на слух') && !q.gap.includes('___')) bad.add(w + ' — во фразе нет пропуска');
  }
}));
// у каждого уровня хватает заданий
UNITS.forEach(u => { const c = u.make().length; if (c < 8) bad.add(u.id + ' — всего ' + c + ' заданий') });
// ловушки, совпавшие с настоящей формой этого же глагола
ALL.forEach(v => { if (formsOf.has(reg(v.v1)) && ![v.v1, v.v2, v.v3].includes(reg(v.v1))) {} if ([v.v2, v.v3].includes(reg(v.v1))) bad.add('reg(' + v.v1 + ') = настоящая форма') });
// данные грамматики: глагол есть в наборах, ошибка есть в предложении
[...DID, ...PAST, ...USED, ...UPS].forEach(d => { if (!VK[d[1]]) bad.add('нет глагола ' + d[1]) });
FIX.forEach(f => { if (!f[0].includes(f[1])) bad.add('FIX: в «' + f[0] + '» нет ' + f[1]) });
PAST.forEach(p => { if (!p[0].includes(`(${p[1]})`)) bad.add('PAST: нет скобки (' + p[1] + ')') });
TESTS.forEach(t => { if (!SETS[t.set] || !/^\d{4}-\d\d-\d\d$/.test(t.date)) bad.add('TESTS: плохая строка ' + JSON.stringify(t)) });
// файлы на диске
const pics = [...files].filter(f => f.endsWith('.jpg')), miss = pics.filter(f => !fs.existsSync(f));
[...files].filter(f => f.endsWith('.mp3')).forEach(f => { if (!fs.existsSync(f)) bad.add('нет звука: ' + f) });
// картинок набора 5 может ещё не быть (ждём Codex) — это не ошибка, игра показывает перевод
const missOther = miss.filter(f => !f.includes('/irr5/'));
missOther.forEach(f => bad.add('нет картинки: ' + f));

console.log(`заданий сгенерировано: ${n}, уровней: ${UNITS.length}`);
console.log(`картинок: ${pics.length - miss.length} из ${pics.length}` + (miss.length ? ` (нет: ${miss.map(f => f.split('/').pop()).join(', ')})` : ''));
if (bad.size) { console.log('ОШИБКИ:'); [...bad].slice(0, 60).forEach(b => console.log(' ✗', b)); process.exit(1) }
console.log('✓ всё чисто');
