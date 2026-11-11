const LESSON_WORDS = [
  'helmet', 'scarf', 'bicycle', 'camera', 'skateboard', 'watch', 'trainers', 'present',
  'knife', 'mouse', 'child', 'foot', 'man', 'woman', 'tooth',
];
const DEMONSTRATIVES = ['This', 'These', 'That', 'Those'];

function listenAndMatch(key, distractors) {
  const word = W2K[key];
  return {
    title: 'Послушай и выбери картинку',
    audio: say2(key),
    options: shuf([key, ...distractors]),
    answer: key,
    pictureOptions: true,
    why: `Ты услышал(а) <b>${word.en}</b> — ${word.ru}.`,
  };
}

function duckQuestion(picture, answer, near, many) {
  return {
    title: 'Какое слово скажет кот?',
    picture,
    prompt: `___ ${many ? 'are ducks' : 'is a duck'}.`,
    options: DEMONSTRATIVES,
    answer,
    why: `${many ? 'Две утки' : 'Одна утка'} ${near ? 'рядом с котом' : 'далеко от кота'} → <b>${answer}</b>.`,
  };
}

function pluralQuestion(key) {
  const word = W2K[key];
  return {
    title: 'Напиши форму множественного числа',
    prompt: `one ${word.en} → two ___`,
    answer: word.pl,
    alternatives: word.altpl || [],
    why: plWhy(word),
  };
}

const LESSON_QUESTIONS = [
  listenAndMatch('helmet', ['present', 'bicycle']),
  listenAndMatch('camera', ['skateboard', 'scarf']),
  listenAndMatch('trainers', ['bicycle', 'present']),
  duckQuestion('duck-near-one', 'This', true, false),
  duckQuestion('duck-far-two', 'Those', false, true),
  duckQuestion('duck-far-one', 'That', false, false),
  duckQuestion('duck-near-two', 'These', true, true),
  {
    title: 'Выбери целое предложение',
    picture: 'near-helmet',
    options: ['That is a helmet.', 'This is a helmet.', 'These are helmets.'],
    answer: 'This is a helmet.',
    why: 'Один шлем рядом с котом → <b>This is a helmet.</b>',
  },
  {
    title: 'Выбери целое предложение',
    picture: 'far-cameras',
    options: ['Those are digital cameras.', 'These are digital cameras.', 'That is a digital camera.'],
    answer: 'Those are digital cameras.',
    why: 'Фотоаппараты далеко от кота → <b>Those are digital cameras.</b>',
  },
  pluralQuestion('watch'),
  pluralQuestion('knife'),
  pluralQuestion('mouse'),
];

function lessonPage(title, body, back) {
  if (player) player.pause();
  app.innerHTML = `<main class="wrap lesson-practice"><div class="lbar">
    <button class="iconbtn" id="x" aria-label="Назад">${IC.close}</button></div>
    <h1 class="ptitle">${title}</h1>${body}
  </main>`;
  app.querySelector('#x').onclick = () => {
    if (player) player.pause();
    back();
  };
  window.scrollTo(0, 0);
}

function lessonVocabulary() {
  const words = LESSON_WORDS.map(key => {
    const w = W2K[key];
    const forms = [w.en, ...(w.alt || [])].join(' / ') +
      (w.np ? '' : ' → ' + [w.pl, ...(key === 'bicycle' ? w.altpl : [])].join(' / '));
    return `<li class="lesson-word">${wp(key)}<div><b lang="en">${esc(forms)}</b>
      <small>${esc(w.ru)}</small></div>
      ${w.x ? '' : `<button class="iconbtn" data-word="${key}" aria-label="Слушать: ${esc(w.en)}">${IC.playic}</button>`}
    </li>`;
  }).join('');
  lessonPage('Слова урока', `<ul class="lesson-words">${words}</ul>`, home);
  app.querySelectorAll('[data-word]').forEach(button => {
    button.onclick = () => speak(say2(button.dataset.word), button);
  });
}

const LESSON_RELEASE = {id: '2026-11-12', chapter: '2b-12nov'};
const LESSON_CHAPTER = {
  id: LESSON_RELEASE.chapter, label: '2b+', release: LESSON_RELEASE.id,
  title: 'This, these, that, those',
  sub: 'Урок 12 ноября · 4 уровня',
  c: '#6d3fe0', cd: '#512cb0', ic: 'gift',
};

function makeLessonQuestion(index) {
  const q = LESSON_QUESTIONS[index];
  const base = {
    qid: '12.11: ' + (q.prompt || q.answer),
    prompt: q.audio ? 'Нажми ▶. ' + q.title : q.title,
    why: q.why,
    hint: q.picture ? 'Смотри от лица кота: рядом или далеко? Один предмет или несколько?'
      : q.audio ? 'Послушай ещё раз и сравни картинки.' : 'Вспомни пару: один предмет → несколько.',
  };
  if (q.picture) base.show = `<img class="lesson-picture" src="img/lesson-2b/${q.picture}.webp" alt="Кот показывает на предметы.">
    <p class="stepsl">Смотри от лица кота: рядом или далеко?</p>`;
  if (q.prompt) base.prompt += ' ' + q.prompt;
  if (q.audio) base.audio = q.audio;
  if (q.options) return choice({...base, ...(q.pictureOptions ? {emo: 1} : {}),
    opts: [q.answer, ...q.options.filter(option => option !== q.answer)]});
  return {...base, type: 'text', accept: [q.answer, ...(q.alternatives || [])]};
}

const LESSON_LEVELS = [
  {
    id: 'n12-listen', ch: LESSON_RELEASE.chapter, name: 'Слушай подарки',
    sub: 'слово на слух → картинка', ic: 'ear', c: '#14b8a6', cd: '#0e8f81',
    title: 'Слушай и выбирай', lead: 'Три коротких задания. Слушай слово и выбери подходящую картинку.',
    rules: [['▶', 'Запись можно слушать несколько раз.'], ['Слова урока', 'Повтори картинки и слова на карте урока.']],
    make: () => [0, 1, 2].map(makeLessonQuestion),
  },
  {
    id: 'n12-point', ch: LESSON_RELEASE.chapter, name: 'This, these, that, those',
    sub: 'рядом / далеко · один / несколько', ic: 'rule', c: '#8b5cf6', cd: '#6d3fe0',
    title: 'Что скажет кот?', lead: 'Смотри от лица кота. Выбирай слово по расстоянию и числу предметов.',
    rules: [['this / these', 'Рядом с котом: один / несколько.'], ['that / those', 'Далеко от кота: один / несколько.']],
    make: () => [3, 4, 5, 6].map(makeLessonQuestion),
  },
  {
    id: 'n12-sentence', ch: LESSON_RELEASE.chapter, name: 'Целое предложение',
    sub: 'this is / those are', ic: 'tiles', c: '#1fa8f0', cd: '#1287c6',
    title: 'Выбери предложение', lead: 'Два задания с картинками. Проверь расстояние, число предметов и is или are.',
    rules: [['this / that + is', 'Один предмет.'], ['these / those + are', 'Несколько предметов.']],
    make: () => [7, 8].map(makeLessonQuestion),
  },
  {
    id: 'n12-plural', ch: LESSON_RELEASE.chapter, name: 'Напиши много',
    sub: 'watches · knives · mice', ic: 'pen2', c: '#ff9233', cd: '#d96d10',
    title: 'Напиши множественное число', lead: 'Три коротких задания. Напиши форму слова, когда предметов несколько.',
    rules: [['watch → watches', 'После ch добавляем es.'], ['knife → knives', 'fe меняется на ves.'], ['mouse → mice', 'Особую форму запоминаем.']],
    make: () => [9, 10, 11].map(makeLessonQuestion),
  },
];
LESSON_LEVELS.forEach(level => { level.reportPrefix = '12.11 · '; });
UNITS.push(...LESSON_LEVELS);
CHS.unshift(LESSON_CHAPTER);
