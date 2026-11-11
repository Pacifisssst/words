// The approved Space Cats recording and caption data are shared by both players.
const LOCAL_PREVIEW = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

function songPicker() {
  app.innerHTML = `<main class="wrap"><div class="lbar"><button class="iconbtn" id="x" aria-label="Назад">${IC.close}</button></div>
    <h1 class="ptitle">Учим песню</h1>
    <button class="learnsong" id="birthday"><span class="sic">🎵</span><span class="t">
      <b>${esc(SONG2B.title)}</b><small>${save.song ? '✓ выучена — спой ещё раз' : 'Слушай, пой, прячь слова'}</small>
    </span></button>
    <button class="learnsong" id="space-cats"><span class="sic">🚀</span><span class="t">
      <b>Space Cats</b><small>Караоке с английским текстом и переводом</small>
    </span></button><p id="space-error" role="status" hidden></p>
  </main>`;
  app.querySelector('#x').onclick = home;
  app.querySelector('#birthday').onclick = () => songScreen();
  const space = app.querySelector('#space-cats');
  if (space) space.onclick = () => openSpaceCats(space);
  window.scrollTo(0, 0);
}

async function openSpaceCats(button) {
  button.disabled = true;
  const error = app.querySelector('#space-error');
  if (error) error.hidden = true;
  try {
    const response = await fetch('space-cats/cues.json');
    if (!response.ok) throw new Error('Missing captions');
    const data = await response.json();
    if (button.isConnected) spaceCats(data);
  } catch {
    if (button.isConnected) {
      button.disabled = false;
      if (error) {
        error.hidden = false;
        error.textContent = 'Песня недоступна. Проверь интернет и попробуй ещё раз.';
      }
    }
  }
}

function spaceCats({intro, lines}) {
  app.innerHTML = `<main class="wrap space-player"><div class="lbar">
    <button class="iconbtn" id="x" aria-label="К списку песен">${IC.close}</button></div>
    <h1 class="ptitle">Space Cats</h1>
    <img class="lesson-picture" id="space-art" src="${intro}" alt="">
    <div class="space-captions"><div id="space-en" lang="en"></div><div id="space-ru"></div></div>
    <audio controls preload="metadata" src="space-cats/space-cats.mp3" aria-label="Space Cats"></audio>
    <p id="space-error" role="status" hidden>Не удалось загрузить запись.</p>
    <div class="pbar">
      <button class="chip on" data-caption="en" aria-pressed="true">Английский</button>
      <button class="chip on" data-caption="ru" aria-pressed="true">Перевод</button>
    </div>
    <div class="pbar">
      <button class="chip" id="space-prev" aria-label="Предыдущая строчка">← Строчка</button>
      <button class="chip" id="space-next" aria-label="Следующая строчка">Строчка →</button>
      <button class="chip" id="space-repeat" aria-pressed="false">Повтор строки</button>
    </div>
  </main>`;
  const audio = app.querySelector('audio');
  const art = app.querySelector('#space-art');
  const error = app.querySelector('#space-error');
  const en = app.querySelector('#space-en');
  const ru = app.querySelector('#space-ru');
  const prev = app.querySelector('#space-prev');
  const next = app.querySelector('#space-next');
  const repeat = app.querySelector('#space-repeat');
  let displayed;
  let lineIndex = -1;
  let loop = null;
  let frame;

  function setLoop(line) {
    loop = line;
    repeat.classList.toggle('on', !!line);
    repeat.setAttribute('aria-pressed', String(!!line));
  }

  function render() {
    const time = audio.currentTime;
    lineIndex = lines.findLastIndex(line => line.start <= time);
    const held = lines[lineIndex];
    const cue = held && time < held.end ? held : null;
    const image = held?.image || intro;
    if (art.getAttribute('src') !== image) art.src = image;
    if (displayed !== cue) {
      displayed = cue;
      en.innerHTML = cue ? cue.words.map(([word]) => `<span>${esc(word)}</span>`).join(' ') : '';
      ru.textContent = cue?.ru || '';
    }
    if (cue) cue.words.forEach(([, start], i) => en.children[i].classList.toggle('sung', time >= start));
    prev.disabled = time === 0;
    next.disabled = lineIndex === lines.length - 1;
  }

  function tick() {
    if (loop && audio.currentTime >= loop.end) audio.currentTime = loop.start;
    render();
    if (!audio.paused) frame = requestAnimationFrame(tick);
  }

  audio.addEventListener('playing', () => { error.hidden = true; });
  audio.addEventListener('canplay', () => { error.hidden = true; });
  audio.addEventListener('play', () => {
    cancelAnimationFrame(frame);
    tick();
  });
  audio.addEventListener('pause', () => cancelAnimationFrame(frame));
  audio.addEventListener('timeupdate', render);
  audio.addEventListener('seeked', () => {
    if (loop && (audio.currentTime < loop.start - 0.05 || audio.currentTime >= loop.end)) setLoop(null);
    render();
  });
  audio.addEventListener('error', () => {
    error.hidden = false;
  });

  function goTo(index) {
    if (audio.readyState < 1) return;
    setLoop(null);
    audio.currentTime = lines[index]?.start ?? 0;
    render();
  }

  prev.onclick = () => goTo(lineIndex - 1);
  next.onclick = () => goTo(lineIndex + 1);
  repeat.onclick = () => {
    if (audio.readyState < 1) return;
    if (loop) return setLoop(null);
    setLoop(lines[Math.max(lineIndex, 0)]);
    audio.currentTime = loop.start;
    audio.play().catch(() => {});
  };
  app.querySelectorAll('[data-caption]').forEach(button => {
    button.onclick = () => {
      const caption = button.dataset.caption === 'en' ? en : ru;
      caption.hidden = !caption.hidden;
      button.classList.toggle('on', !caption.hidden);
      button.setAttribute('aria-pressed', String(!caption.hidden));
    };
  });
  function stop() {
    audio.pause();
    cancelAnimationFrame(frame);
  }
  addEventListener('pagehide', stop);
  app.querySelector('#x').onclick = () => {
    stop();
    removeEventListener('pagehide', stop);
    songPicker();
  };
  render();
  window.scrollTo(0, 0);
}
