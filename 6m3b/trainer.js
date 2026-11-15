'use strict';

const byId = id => document.getElementById(id);
const deck = byId('deck');
const picture = byId('picture');
const prompt = byId('prompt');
const example = byId('example');
const answer = byId('answer');
const progress = byId('progress');
const choices = byId('choices');
const feedback = byId('feedback');
const reveal = byId('reveal');
const next = byId('next');
const listen = byId('listen');
const voice = new Audio();
let mode = 'cards';
let queue = [];
let position = 0;
let originalCount = 0;
let firstPassCorrect = 0;

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function start() {
  const selected = WORDS.filter(word => deck.value === 'all' || word.group === deck.value);
  queue = mode === 'test' ? shuffled(selected) : selected;
  originalCount = queue.length;
  position = 0;
  firstPassCorrect = 0;
  render();
}

function render() {
  voice.pause();
  const word = queue[position];
  const finished = !word;
  const inTest = mode === 'test';
  const homonym = word?.group === 'homonyms';
  byId('cards').setAttribute('aria-pressed', String(!inTest));
  byId('test').setAttribute('aria-pressed', String(inTest));
  picture.hidden = finished || inTest;
  example.hidden = true;
  answer.hidden = true;
  reveal.hidden = finished || inTest;
  listen.hidden = finished || inTest;
  reveal.disabled = false;
  next.hidden = finished;
  next.disabled = inTest;
  choices.replaceChildren();
  feedback.textContent = '';
  prompt.textContent = 'Повторение закончено';
  prompt.lang = 'ru';
  if (finished) {
    progress.textContent = inTest ? `С первой попытки: ${firstPassCorrect} из ${originalCount}` : 'Готово';
    return;
  }

  progress.textContent = position < originalCount
    ? `${position + 1} / ${originalCount}`
    : `Работа над ошибками · осталось ${queue.length - position}`;
  prompt.textContent = inTest ? (homonym ? word.example : word.ru) : word.en;
  prompt.lang = inTest && !homonym ? 'ru' : 'en';
  example.textContent = word.example;
  answer.textContent = word.ru;
  if (!inTest) {
    picture.src = word.image;
    return;
  }

  const label = item => homonym ? item.ru : item.en;
  const pool = WORDS.filter(item => item.group === word.group && item !== word);
  const otherSense = homonym && pool.find(item => item.en === word.en);
  const distractors = new Set(otherSense ? [label(otherSense)] : []);
  for (const item of shuffled(pool)) {
    if (distractors.size === 2) break;
    if (label(item) !== label(word)) distractors.add(label(item));
  }

  for (const text of shuffled([label(word), ...distractors])) {
    const button = document.createElement('button');
    button.textContent = text;
    button.lang = homonym ? 'ru' : 'en';
    button.addEventListener('click', () => {
      const correct = text === label(word);
      if (correct && position < originalCount) firstPassCorrect++;
      if (!correct) {
        queue.push(word);
        button.classList.add('wrong');
      }
      for (const option of choices.children) {
        option.disabled = true;
        if (option.textContent === label(word)) option.classList.add('correct');
      }
      feedback.textContent = correct ? 'Верно!' : `Правильный ответ: ${label(word)}. Эта карточка встретится ещё раз.`;
      picture.src = word.image;
      picture.hidden = false;
      example.hidden = homonym;
      listen.hidden = false;
      next.disabled = false;
      next.focus();
    });
    choices.append(button);
  }
}

listen.addEventListener('click', () => {
  const word = queue[position];
  voice.src = word.audio;
  voice.play().catch(() => {
    if (queue[position] === word) feedback.textContent = 'Не удалось воспроизвести запись.';
  });
});
reveal.addEventListener('click', () => {
  example.hidden = false;
  answer.hidden = false;
});
next.addEventListener('click', () => {
  position++;
  render();
  (mode === 'test' ? choices.firstElementChild : reveal)?.focus();
});
byId('restart').addEventListener('click', start);
deck.addEventListener('change', start);
for (const name of ['cards', 'test']) {
  byId(name).addEventListener('click', () => {
    mode = name;
    start();
  });
}
start();
