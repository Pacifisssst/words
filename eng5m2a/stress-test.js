// Стресс-тест английской игры. Открыть http://localhost:8977/eng5m2a/index.html?test
// и выполнить в консоли:  stress(60)
// Играет вслепую: случайные ответы, пока уровень не кончится. Сохранения восстанавливаются.
// Звук и картинки проверяет не он, а node check.mjs (там файлы смотрят на диске).
function stress(GAMES, chapter) {
  if (!TEST) throw new Error('Use a test-mode preview.');
  GAMES = GAMES || 60;
  const keep = localStorage.getItem(KEY);
  const originalSave = structuredClone(save), originalChapter = CH, originalMute = muted;
  const levels = UNITS.map((unit, index) => ({unit, index}))
    .filter(({unit}) => !chapter || unit.ch === chapter);
  if (!levels.length) throw new Error('Unknown test chapter: ' + chapter);
  save.pupil = {id:'test:stress',name:'Test stress'};
  muted = true;
  const errors = [], overflow = [], stuck = [];
  let finished = 0, lost = 0, retries = 0, portfolios = 0;
  const onErr = e => errors.push(String(e.message));
  addEventListener('error', onErr);
  const wide = where => {   // в скрытой вкладке ширина 0 — тогда проверять нечего
    const d = document.documentElement;
    if (d.clientWidth > 50 && d.scrollWidth > d.clientWidth + 1) overflow.push(where + ' ' + d.scrollWidth + '>' + d.clientWidth);
  };
  for (let g = 0; g < GAMES; g++) {
    const i = levels[g % levels.length].index;
    try { lesson(i) } catch (e) { errors.push('lesson ' + i + ': ' + e.message); continue }
    let step = 0;
    for (; step < 500; step++) {
      const win = document.querySelector('.done-screen h1');
      if (win) { /Сердечки/.test(win.textContent) ? lost++ : finished++; break }
      // ⚠️ не проверять класс .show: он навешивается в requestAnimationFrame,
      // а в скрытой вкладке кадры не идут — тест будет «висеть» на живой игре.
      const nx = document.getElementById('nx');
      if (nx) { nx.click(); continue }
      wide(UNITS[i].id);
      const discover = document.querySelector('#word-next, #market-word-next');
      if (discover) { discover.click(); continue }
      const draft = document.getElementById('market-map-form');
      if (draft) {
        const fields = draft.querySelectorAll('input');
        fields[0].value = 'You can buy postcards in Sample City.';
        fields[1].value = 'You can buy a mug in Demo Town.';
        draft.requestSubmit();
        portfolios++;
        continue;
      }
      const chk = document.getElementById('chk');
      if (!chk) { errors.push('экран пропал на уровне ' + UNITS[i].id); break }
      const q = L.q;
      try {
        if (q.say) {
          document.getElementById('market-say-reveal').click();
          document.getElementById(Math.random() < .6 ? 'market-said-it' : 'market-say-again').click();
          continue;
        } else if (q.type === 'choice') {
          const right = Math.random() < .6;
          const k = right ? q.correct : (q.correct + 1) % q.opts.length;
          document.querySelector('.opt[data-o="' + k + '"], .picopt[data-o="' + k + '"]').click();
        } else if (q.type === 'build') {
          const order = Math.random() < .6 ? q.right : q.tiles;
          order.forEach(t => {
            const b = [...document.querySelectorAll('.bank .tile:not(.used)')].find(x => x.textContent === t);
            if (b) b.click();
          });
        } else {
          const t = document.getElementById('tin');
          t.value = Math.random() < .6 ? q.accept[0].toUpperCase() + ' ' : 'zzz';
          t.dispatchEvent(new Event('input'));
        }
        if (!document.getElementById('chk').disabled) {
          if (!isRight() && !L.u.boss) retries++;
          check();
        }
        else { errors.push('кнопка «Проверить» не включилась: ' + q.type + ' / ' + UNITS[i].id); break }
      } catch (e) { errors.push(UNITS[i].id + ' / ' + q.type + ': ' + e.message); break }
    }
    if (step >= 500) stuck.push(UNITS[i].id);
  }
  removeEventListener('error', onErr);
  if (keep) localStorage.setItem(KEY, keep); else localStorage.removeItem(KEY);
  save = originalSave;
  CH = originalChapter;
  muted = originalMute;
  home();
  return { games: GAMES, finished, lost, retries, portfolios, stuck, errors: [...new Set(errors)], overflow: [...new Set(overflow)] };
}
