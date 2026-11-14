const screen = document.querySelector('#screen');
const account = document.querySelector('#account');
const testMode = new URLSearchParams(location.search).has('test');
const storeKey = testMode ? 'spotlight-7m2pc-test-1' : 'spotlight-7m2pc-1';
const profileKey = storeKey + ':profile';
const finalIndex = sections.length;
const listeningIndex = finalIndex + 1;
const rounds = [...sections, { title: 'Мини-тест', tasks: mixed }, listening];
let player = null;
const arrow = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const tick = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

let pupil = read(profileKey, null);
let progress = loadProgress();
let round = null;

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing can block storage. Practice still works until exit.
  }
}

function progressKey() {
  return storeKey + ':' + (pupil ? 'pupil:' + pupil.id : 'guest');
}

function loadProgress() {
  return read(progressKey(), {});
}

function escape(value) {
  return String(value).replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function normalize(value) {
  return value.toLowerCase().replace(/[‘’]/g, "'").replace(/\bdid not\b/g, "didn't")
    .replace(/[^a-z0-9' ]+/g, '').replace(/\s+/g, ' ').trim();
}

function shuffle(values) {
  const items = [...values];
  for (let index = items.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

function meter(flags, title) {
  return `<div class="meter" role="img" aria-label="${title}">${flags.map(done =>
    `<span${done ? ' class="done"' : ''}></span>`).join('')}</div>`;
}

function show(markup, focus = true) {
  screen.innerHTML = markup;
  account.textContent = pupil ? pupil.name : 'Войти по коду';
  window.scrollTo(0, 0);
  if (focus) screen.querySelector('h1')?.focus({ preventScroll: true });
}

function home(focus = true) {
  closeRound();
  const flags = sections.map((_, index) => Boolean(progress[index]));
  const done = flags.filter(Boolean).length;
  const next = flags.indexOf(false);
  const defaultRound = next < 0 ? (progress[listeningIndex] ? finalIndex : listeningIndex) : next;
  show(`<section class="hero">
    <h1 tabindex="-1">Progress Check 2</h1>
    <p>Подготовка к контрольной · с. 24, упр. 1–7</p>
    <button type="button" class="primary" data-action="open" data-value="${defaultRound}">${done === 0 ? (pupil ? 'Начать тренировку' : 'Начать без кода') : defaultRound === finalIndex ? 'Пройти мини-тест' : 'Продолжить'}</button>
    ${meter(flags, `${done} из 7 тем пройдено`)}
  </section>
  <ol class="map" aria-label="Темы тренировки">
    ${sections.map((section, index) => `<li class="${flags[index] ? 'complete' : ''}">
      <button data-action="open" data-value="${index}" aria-label="Упражнение ${index + 1}. ${section.title}${flags[index] ? '. Пройдено' : ''}">
        <span class="step" aria-hidden="true">${flags[index] ? tick : index + 1}</span>
        <span><strong>${section.title}</strong><small>${section.detail}</small></span>
        <span class="arrow">${arrow}</span>
      </button></li>`).join('')}
    <li class="${progress[listeningIndex] ? 'complete' : ''}"><button data-action="open" data-value="${listeningIndex}">
      <span class="step" aria-hidden="true">${progress[listeningIndex] ? tick : '<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M3 15v-3a9 9 0 0 1 18 0v3M3 15v3h4v-6H3m18 3v3h-4v-6h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'}</span>
      <span><strong>${listening.title}</strong><small>${listening.detail}</small></span>
      <span class="arrow">${arrow}</span>
    </button></li>
    <li class="final-row"><button data-action="open" data-value="${finalIndex}">
      <span class="step" aria-hidden="true">7</span>
      <span><strong>Мини-тест</strong><small>${progress[finalIndex] ? 'Последний результат: ' + progress[finalIndex].score + ' из 7' : 'По одному заданию из каждой темы'}</small></span>
      <span class="arrow">${arrow}</span>
    </button></li>
  </ol>`, focus);
}

function back(label = 'Все темы') {
  return `<button type="button" class="plain" data-action="home">${label}</button>`;
}

function openRound(index) {
  closeRound();
  const section = rounds[index];
  const rules = section.rule
    ? `<ul class="rules">${section.rule.map(([example, note]) => `<li><strong>${example}</strong><p>${note}</p></li>`).join('')}</ul>`
    : '<p>Сначала ответь на все вопросы. В конце ты увидишь результат и разбор ошибок.</p>';
  const details = index === finalIndex ? '7 заданий' :
    index === listeningIndex ? 'Прочитай вопросы перед первым прослушиванием.' :
    `Упр. ${index + 1} · ${section.tasks.length} заданий`;
  const preview = index === listeningIndex ? `<ol class="preview" lang="en">${section.tasks.map(task => `<li>${task.prompt}</li>`).join('')}</ol>` : '';
  show(`<div class="navline">${back()}</div>
    <section class="panel">
      <h1 tabindex="-1">${section.title}</h1>
      <p class="micro">${details}</p>
      ${rules}
      ${preview}
      <div class="actions"><button class="primary" data-action="start" data-value="${index}">К заданиям</button></div>
    </section>`);
}

function startRound(index) {
  round = { index, tasks: rounds[index].tasks, position: 0, mistakes: [], retry: false };
  if (index === listeningIndex) {
    player = document.createElement('audio');
    player.controls = true;
    player.preload = 'metadata';
    player.src = 'listening.mp3';
    player.setAttribute('aria-label', 'История для аудирования');
  }
  renderQuestion();
}

function renderQuestion() {
  const task = round.tasks[round.position];
  const isTest = round.index === finalIndex;
  const isListening = round.index === listeningIndex;
  const instruction = task.type === 'write'
    ? (round.index === 5 || (isTest && round.position === 5) ? 'Напиши форму Past Simple.' : 'Напиши полное предложение.')
    : task.prompt;
  const context = task.type === 'write' ? task.prompt : task.context;
  const status = `${round.retry ? 'Повтор · ' : ''}${round.position + 1} из ${round.tasks.length}`;
  let controls;
  let selected = null;
  const used = [];

  if (task.type === 'choice') {
    const options = shuffle([task.answer, ...task.other]);
    controls = `<div class="options" role="group" aria-label="Варианты ответа">${options.map(option =>
      `<button type="button" class="option" data-answer="${escape(option)}" aria-pressed="false" lang="en">${escape(option)}</button>`).join('')}</div>`;
  } else if (task.type === 'build') {
    const words = shuffle([...task.answer.split(' '), ...task.other]);
    controls = `<div class="answer-line tiles" id="answer-line" role="group" aria-label="Твой ответ"><span class="micro">Нажимай на слова по порядку.</span></div>
      <div class="tiles" role="group" aria-label="Слова для ответа">${words.map((word, index) =>
        `<button type="button" class="tile" data-word="${index}" lang="en">${escape(word)}</button>`).join('')}</div>`;
  } else {
    controls = `<label for="response">Твой ответ</label>
      <input id="response" lang="en" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="160">`;
  }

  show(`<div class="navline">
      ${back()}
      ${meter(round.tasks.map((_, index) => index < round.position), status)}
      <span class="micro">${status}</span>
    </div>
    <section class="panel question">
      <h1 tabindex="-1"${isListening ? ' lang="en"' : ''}>${instruction}</h1>
      ${isListening ? '<div id="player"></div>' : ''}
      ${context ? `<div class="prompt"${context.includes('лет') ? '' : ' lang="en"'}>${escape(context).replace(/___/g, '<span class="gap">___</span>')}</div>` : ''}
      <form id="question-form">
        ${controls}
        ${isTest ? '' : `<details class="help"><summary>Подсказка</summary><p>${task.hint}</p></details>`}
        <div id="feedback" class="feedback" aria-live="polite" hidden></div>
        <div class="actions"><button class="primary" id="check" disabled>${isTest ? 'Ответить' : 'Проверить'}</button></div>
      </form>
    </section>`);

  if (isListening) document.querySelector('#player').append(player);
  const form = document.querySelector('#question-form');
  const check = document.querySelector('#check');
  const feedback = document.querySelector('#feedback');
  const line = document.querySelector('#answer-line');
  const input = document.querySelector('#response');
  let checked = false;

  function refreshTiles() {
    line.innerHTML = used.length
      ? used.map(tile => `<button type="button" class="tile" data-remove="${tile.dataset.word}" lang="en" aria-label="Убрать ${escape(tile.textContent)}">${escape(tile.textContent)}</button>`).join('')
      : '<span class="micro">Нажимай на слова по порядку.</span>';
    check.disabled = used.length === 0;
  }

  form.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || checked) return;
    if (button.hasAttribute('data-answer')) {
      selected?.setAttribute('aria-pressed', 'false');
      selected = button;
      button.setAttribute('aria-pressed', 'true');
      check.disabled = false;
    } else if (button.hasAttribute('data-word')) {
      if (button.disabled) return;
      const hadFocus = document.activeElement === button;
      used.push(button);
      button.disabled = true;
      button.classList.add('used');
      refreshTiles();
      if (hadFocus) {
        const target = form.querySelector('[data-word]:not(:disabled)') || check;
        target.focus({ preventScroll: true });
      }
    } else if (button.hasAttribute('data-remove')) {
      const index = used.findIndex(tile => tile.dataset.word === button.dataset.remove);
      const [tile] = used.splice(index, 1);
      tile.disabled = false;
      tile.classList.remove('used');
      refreshTiles();
      tile.focus({ preventScroll: true });
    }
  });

  input?.addEventListener('input', () => { check.disabled = !input.value.trim(); });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (checked) return advance();
    if (check.disabled) return;
    const answer = input ? input.value : selected ? selected.dataset.answer : used.map(tile => tile.textContent).join(' ');
    const correct = normalize(answer) === normalize(task.answer);
    if (!correct) round.mistakes.push({ task, answer });
    if (isTest) return advance();

    checked = true;
    form.querySelectorAll('input, [data-answer], [data-word], [data-remove]').forEach(control => { control.disabled = true; });
    form.querySelectorAll('[data-answer]').forEach(option => {
      if (option.dataset.answer === task.answer) option.classList.add('correct');
    });
    if (!correct) selected?.classList.add('wrong');
    feedback.classList.toggle('wrong', !correct);
    feedback.innerHTML = `<strong>${correct ? 'Верно!' : 'Правильный ответ'}</strong>
      ${correct ? '' : `<p lang="en">${escape(task.answer)}</p>`}<p>${task.why}</p>`;
    feedback.hidden = false;
    feedback.style.animation = 'feedback-in 180ms ease-out';
    check.textContent = 'Дальше';
    check.focus();
  });
}

function advance() {
  round.position++;
  if (round.position < round.tasks.length) renderQuestion();
  else finishRound();
}

function finishRound() {
  player?.pause();
  const { index, mistakes, tasks, retry } = round;
  const isTest = index === finalIndex;
  const next = index >= sections.length - 1 ? (index === listeningIndex ? finalIndex : listeningIndex) : index + 1;
  const nextText = next === finalIndex ? 'К мини-тесту' : next === listeningIndex ? 'К аудированию' : 'Следующая тема';
  const score = tasks.length - mistakes.length;
  if (isTest || !mistakes.length) {
    progress[index] = { score };
    save(progressKey(), progress);
  }
  const title = mistakes.length && !isTest ? 'Повтори сложные задания'
    : isTest ? 'Результат мини-теста' : 'Тема пройдена!';
  const review = mistakes.length && isTest
    ? `<ol class="result-list">${mistakes.map(({ task, answer }) =>
      `<li><strong>${escape(task.context || task.prompt)}</strong><br>Твой ответ: <span lang="en">${escape(answer)}</span><br>
      Правильно: <span lang="en">${escape(task.answer)}</span><br>${task.why}</li>`).join('')}</ol>` : '';
  const result = !isTest && retry && score === tasks.length
    ? 'Ты исправил ошибки.' : `Верных ответов: ${score} из ${tasks.length}.`;
  show(`<div class="navline">${back()}</div>
    <section class="panel">
      <h1 tabindex="-1">${title}</h1>
      <p class="performance">${result}</p>
      ${isTest && pupil ? `<p>${escape(pupil.name)} · Результат можно показать учителю на скриншоте.</p>` : ''}
      ${review}
      <div class="actions">
        ${isTest ? '<button class="primary" data-action="home">Все темы</button>'
          : mistakes.length ? '<button class="primary" data-action="retry">Повторить ошибки</button>'
          : `<button class="primary" data-action="open" data-value="${next}">${nextText}</button>`}
      </div>
    </section>`);
}

function retryMistakes() {
  round = { index: round.index, tasks: round.mistakes.map(item => item.task), position: 0, mistakes: [], retry: true };
  renderQuestion();
}

function closeRound() {
  player?.pause();
  player = null;
  round = null;
}

function showProfile() {
  closeRound();
  show(`<div class="navline">${back()}</div><section class="panel">
    <h1 tabindex="-1">${pupil ? 'Твой профиль' : 'Войти по коду'}</h1>
    ${pupil ? `<p>${escape(pupil.name)}</p><p>Прогресс сохраняется в этом браузере.</p>
      <div class="actions"><button class="secondary" data-action="guest">Выйти из профиля</button></div>`
      : `<p>Подойдёт твой код от тренажёра «Глаголы 7». Прогресс сохраняется в этом браузере.</p>
      <form id="login" class="profile-form">
        <label for="code">Код ученика</label>
        <input id="code" type="text" maxlength="12" autocapitalize="characters" autocomplete="off" spellcheck="false" required>
        ${testMode ? '<p class="micro">Код для демо: DEMO</p>' : ''}
        <p class="error" id="login-error" role="status"></p>
        <div class="actions"><button class="primary" id="sign-in">Войти</button>
        <button class="secondary" type="button" data-action="guest">Продолжить без кода</button></div>
      </form>`}
    </section>`);
  document.querySelector('#login')?.addEventListener('submit', signIn);
}

async function findPupil(code) {
  if (testMode) {
    return code === 'DEMO' ? { id: 'sample', name: 'Демо-ученик' } : 'invalid';
  }
  const endpoint = 'https://igra5b.evdolex.workers.dev/who?game=eng7irr5&code=' + encodeURIComponent(code);
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 8000);
  try {
    const response = await fetch(endpoint, { headers: { 'x-key': 'spidey5b-2026-open' }, signal: abort.signal, cache: 'no-store' });
    if (response.status === 404) return 'invalid';
    if (response.status === 429) return 'limited';
    if (response.ok) return (await response.json()).pupil;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function signIn(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const code = form.querySelector('#code').value.toUpperCase().replace(/\s+/g, '');
  const error = form.querySelector('#login-error');
  const submit = form.querySelector('#sign-in');
  if (!/^[A-Z0-9]{3,12}$/.test(code)) {
    error.textContent = 'Введи код из латинских букв и цифр.';
    return;
  }
  error.textContent = '';
  submit.textContent = 'Проверяем код…';
  submit.disabled = true;
  const result = await findPupil(code);
  if (!form.isConnected) return;
  submit.disabled = false;
  submit.textContent = 'Войти';
  if (result?.id && result?.name) return switchProfile({ id: result.id, name: result.name });
  error.textContent = ({
    invalid: 'Код не найден. Проверь сообщение учителя.',
    limited: 'Слишком много попыток. Попробуй позже или продолжи без кода.'
  })[result] || 'Проверить код не удалось. Попробуй позже или продолжи без кода.';
}

function switchProfile(profile) {
  pupil = profile;
  save(profileKey, pupil);
  progress = loadProgress();
  home();
}

const actions = {
  home: () => home(), open: openRound, start: startRound, retry: retryMistakes,
  profile: showProfile, guest: () => switchProfile(null)
};

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (button) actions[button.dataset.action](Number(button.dataset.value));
});
if (testMode) {
  document.title = 'Демо · ' + document.title;
  document.querySelector('.wordmark span').textContent = 'Демо';
}
home(false);
