const MARKET_CHAPTER = '2d-19nov';
const MARKET_PORTFOLIO = 'm19-map';
const MARKET_AUDIO = 'audio/market/';
const MARKET_IMAGES = 'img/market/';
const MARKET_HARRY = MARKET_AUDIO + 'harry-ryan.mp3';

const marketSouvenirs = [
  { id: 'scarf', en: 'a tartan scarf', ru: 'клетчатый шарф', art: 'tartan-scarf', from: 'Scotland', where: 'Scotland' },
  { id: 'toy', en: 'a stuffed toy', ru: 'мягкая игрушка', art: 'stuffed-cow', from: 'Scotland', where: 'Scotland' },
  { id: 'buses', en: 'toy buses', ru: 'игрушечные автобусы', art: 'toy-buses', from: 'England', where: 'London', plural: true },
  { id: 'pin', en: 'a pin', ru: 'значок', art: 'union-jack-pin', from: 'the UK', where: 'England', purchase: 'a Union Jack pin' },
  { id: 'mug', en: 'a mug', ru: 'кружка', art: 'welsh-dragon-mug', from: 'Wales', where: 'Wales' },
  { id: 'hat', en: 'a hat', ru: 'шляпа', art: 'shamrock-hat', from: 'Northern Ireland', where: 'Northern Ireland' },
];

const marketPairs = [
  ['the UK', 'British'],
  ['England', 'English'],
  ['Scotland', 'Scottish'],
  ['Wales', 'Welsh'],
  ['Northern Ireland', 'Northern Irish'],
];

const marketListening = [
  { en: 'Where is Harry from?', ru: 'Откуда Гарри?', opts: ['England', 'Scotland', 'Wales'], why: 'I’m from England.' },
  { en: 'What does he collect?', ru: 'Что он коллекционирует?', opts: ['Toy buses', 'Pins', 'Hats'], why: 'I’ve got a collection of toy buses.' },
  { en: 'How many has he got?', ru: 'Сколько у него автобусов?', opts: ['Five', 'Three', 'Seven'], why: 'I’ve got five red buses. They’re all double-deckers.' },
];

const marketImage = name => MARKET_IMAGES + name + '.webp';
const marketClip = word => MARKET_AUDIO + word.id + '.mp3';
const marketPicture = (word, alt = '', className = '') =>
  '<img class="' + className + '" src="' + marketImage('enchanted/' + word.art) + '" alt="' + esc(alt) + '">';

function marketVocabulary() {
  return [marketSouvenirs.slice(0, 3), marketSouvenirs.slice(3)].flatMap((batch, index) => [
    ...batch.map(word => ({ type: 'discover', word, batch: index + 1 })),
    ...shuf(batch).map(word => choice({
      qid: '2d · Listen: ' + word.en,
      prompt: 'Listen and tap the souvenir.',
      promptRu: 'Послушай и выбери картинку.',
      audio: marketClip(word), transcript: word.en, marketPictures: true,
      opts: [word.en, ...batch.filter(item => item !== word).map(item => item.en)],
      why: collectionHelp(word.en, word.ru),
      hint: 'Послушай ещё раз. Вспомни, какой предмет ты видел.',
    })),
    ...shuf(batch).map(word => ({
      type: 'text', say: word, qid: '2d · Recall: ' + word.en,
      prompt: word.plural ? 'What are these?' : 'What is it?',
      promptRu: 'Назови предмет по-английски.',
      show: marketPicture(word, '', 'market-word-picture'),
      accept: [word.en], why: collectionHelp(word.en, word.ru),
      hint: 'Подсказка: ' + word.ru + '.',
    })),
  ]);
}

function marketQuestions() {
  return marketListening.map((item, index) => choice({
    qid: '2d · Harry: ' + item.en,
    prompt: item.en, promptRu: item.ru, media: MARKET_HARRY, opts: item.opts,
    why: esc(item.why) + (index === marketListening.length - 1
      ? '<img class="market-reveal-art" src="' + marketImage('harry-owl-bus') + '" alt="Сова Гарри ждёт игрушечный автобус.">'
      : ''),
    hint: 'Включи запись ещё раз. Можно выбрать медленный темп.',
  }));
}

function marketLabels() {
  const order = shuf(marketPairs);
  return order.map(([country, adjective]) => choice({
    qid: '2d · Country: ' + country,
    book: 'с. 41, упр. 2',
    prompt: 'Match the nationality.',
    promptRu: 'Выбери прилагательное для этой страны.',
    show: '<p class="market-country" lang="en">' + esc(country) + '</p>',
    opts: [adjective, ...shuf(marketPairs.filter(pair => pair[0] !== country)).slice(0, 3).map(pair => pair[1])],
    why: esc(country + ' → ' + adjective),
    hint: 'Вспомни пару или посмотри упражнение 2 на с. 41.',
  }));
}

function marketRoutes() {
  const locations = [...new Set(marketSouvenirs.flatMap(word => [word.from, word.where]))];
  const tasks = [
    [marketSouvenirs[0], 'from'],
    [marketSouvenirs[3], 'from'], [marketSouvenirs[3], 'where'],
    [marketSouvenirs[2], 'from'], [marketSouvenirs[2], 'where'],
    ...shuf(marketSouvenirs.filter(word => !['scarf', 'buses', 'pin'].includes(word.id))).map(word => [word, 'where']),
  ];
  return tasks.map(([word, goal]) => {
    const origin = goal === 'from';
    const prompt = origin
      ? (word.plural ? 'Where are they from?' : 'Where is it from?')
      : (word.plural ? 'Where can you buy them?' : 'Where can you buy it?');
    const answer = word[goal];
    const example = origin
      ? (word.id === 'pin' ? 'It’s British. It’s from the UK.' : (word.plural ? 'They’re from ' : 'It’s from ') + answer + '.')
      : 'You can buy ' + (word.plural ? 'them' : word.purchase || word.en) + ' in ' + answer + '.';
    return choice({
      qid: '2d · ' + goal + ': ' + word.en,
      book: 'с. 41, упр. ' + (origin ? '2' : '3'), prompt,
      promptRu: origin ? 'Откуда этот сувенир?' : 'Где можно купить этот сувенир?',
      show: '<figure class="market-item">' + marketPicture(word) +
        '<figcaption>' + collectionHelp(word.en, word.ru) + '</figcaption></figure>',
      opts: [answer, ...shuf(locations.filter(place => place !== answer)).slice(0, 3)],
      why: esc(example),
      hint: origin ? 'Назови страну, с которой связан сувенир.' : 'Смотри, куда указывает линия на карте учебника.',
    });
  });
}

function marketGrammar() {
  return [
    { long: 'It is a mug.', short: 'It’s a mug.', opts: ['It’s a mug.', 'They’re a mug.', 'It’s got a mug.'] },
    { long: 'It has got a Welsh dragon on it.', short: 'It’s got a Welsh dragon on it.',
      opts: ['It’s got a Welsh dragon on it.', 'It’s a Welsh dragon.', 'They’ve got a Welsh dragon on it.'] },
  ].map(item => choice({
    qid: '2d · Short form: ' + item.long,
    prompt: 'Choose the short form.', promptRu: 'Выбери короткую форму.',
    show: '<p class="market-country" lang="en">' + esc(item.long) + '</p>',
    opts: item.opts, why: esc(item.long + ' → ' + item.short),
    hint: 'It is → It’s. It has got → It’s got.',
  }));
}

const marketLevels = [
  { id: 'm19-window', name: 'Shop window', sub: 'Послушай и назови шесть сувениров', ic: 'bag', make: marketVocabulary },
  { id: 'm19-owl', name: 'The owl’s listening', sub: 'Узнай три факта о Гарри', ic: 'ear', make: marketQuestions },
  { id: 'm19-labels', name: 'Match the labels', sub: 'Соедини страны и прилагательные', ic: 'pair', make: marketLabels },
  { id: 'm19-routes', name: 'Send the souvenirs home', sub: 'Откуда сувенир? Где его купить?', ic: 'flag', make: marketRoutes },
  { id: MARKET_PORTFOLIO, name: 'Make your own map', sub: 'Краткие формы и два предложения для карты', ic: 'pen', make: marketGrammar },
].map(level => ({ ...level, ch: MARKET_CHAPTER, reportPrefix: '19.11 · ' }));

UNITS.push(...marketLevels);
CHS.unshift({
  id: MARKET_CHAPTER, label: '2d', title: 'The Wizard’s Souvenir Market',
  sub: '19 ноября · сувениры, аудирование и карта', c: '#79452e', cd: '#533029',
});

function marketHome() {
  const done = marketLevels.filter(level => save.u[level.id]).length;
  const next = marketLevels.find(level => !save.u[level.id]);
  app.innerHTML = topbar(done, marketLevels.length) +
    '<main class="wrap market-home"><button class="chback" id="back">← Все главы</button>' +
    '<div class="market-cover"><img src="' + marketImage('market-cover') + '" alt="">' +
    '<div><h1 lang="en">The Wizard’s<br>Souvenir Market</h1>' +
    '<p>Загляни в лавку совы. Собери пять печатей и подготовь свою карту сувениров.</p></div></div>' +
    '<div class="market-trail"><h2>Маршрут по лавке</h2><span aria-label="Печатей: ' + done + ' из 5">' + done + ' / 5</span></div>' +
    '<ol class="market-stops">' + marketLevels.map((level, index) => {
      const complete = Boolean(save.u[level.id]);
      return '<li><button class="market-stop' + (level === next ? ' market-next' : '') + '" data-market-level="' + level.id +
        '"><span class="market-seal' + (complete ? ' market-earned' : '') + '">' + (complete ? IC.check : index + 1) + '</span>' +
        '<span class="market-stop-copy"><strong lang="en">' + level.name + '</strong><small>' + level.sub + '</small></span>' +
        '<span class="market-stop-action">' + (complete ? 'Повторить' : 'Открыть') + '</span></button></li>';
    }).join('') + '</ol>' +
    (done === marketLevels.length ? '<p class="market-complete" role="status">Все печати собраны. Подготовь карту и представь её классу.</p>' : '') +
    '<button class="btn market-primary" id="mine">Мой результат для учителя</button>' +
    '<button class="reset" id="reset">Начать главу 2d заново</button></main>';
  topEvents();
  app.querySelector('#back').onclick = () => { CH = null; home(); };
  app.querySelectorAll('[data-market-level]').forEach(button => {
    button.onclick = () => {
      const index = UNITS.findIndex(unit => unit.id === button.dataset.marketLevel);
      const begin = () => marketIntro(index);
      sTap();
      save.pupil ? begin() : askName(begin);
    };
  });
  app.querySelector('#mine').onclick = () => save.pupil ? mine() : askName(mine);
  app.querySelector('#reset').onclick = () => yesNo('Стереть печати главы 2d?', 'Стереть', () => {
    marketLevels.forEach(level => {
      delete save.u[level.id];
      if (save.t) delete save.t[level.id];
    });
    store();
    home();
  });
  flush();
  window.scrollTo(0, 0);
}

function marketIntro(index) {
  const level = UNITS[index];
  if (level.id !== 'm19-owl') return lesson(index);
  app.innerHTML = '<main class="wrap market-listen-intro"><button class="chback" id="back">← К маршруту</button>' +
    '<h1 lang="en">The owl’s listening</h1><p>Сначала прочитай три вопроса. Запись откроется после кнопки «К записи».</p>' +
    '<ol>' + marketListening.map(item => '<li>' + collectionHelp(item.en, item.ru) + '</li>').join('') + '</ol>' +
    '<button class="btn market-primary" id="market-start">К записи</button></main>';
  app.querySelector('#back').onclick = home;
  app.querySelector('#market-start').onclick = () => lesson(index);
  window.scrollTo(0, 0);
}

function marketDiscover(q) {
  const word = q.word;
  app.innerHTML = '<main class="wrap market-discovery"><button class="chback" id="back">← К маршруту</button>' +
    '<p class="market-shelf">Витрина ' + q.batch + ' из 2</p>' + marketPicture(word, '', 'market-word-picture') +
    '<h1 lang="en">' + collectionHelp(word.en, word.ru) + '</h1>' +
    '<div class="market-discover-controls"><button class="btn market-primary" id="market-word-play">' + IC.playic +
    ' Послушать</button><button class="btn ghost" id="market-word-next">Дальше</button></div>' +
    '<p>Послушай и повтори. Нажми на слово, чтобы увидеть перевод.</p></main>';
  const play = app.querySelector('#market-word-play');
  play.onclick = () => speak(marketClip(word), play);
  app.querySelector('#back').onclick = home;
  app.querySelector('#market-word-next').onclick = () => { L.queue.shift(); ask(); };
  window.scrollTo(0, 0);
}

function marketPictureChoices(q) {
  return '<div class="visual-options market-picture-options">' + q.opts.map((en, index) =>
    '<button type="button" class="opt visual-option" data-o="' + index + '" aria-label="Картинка ' + (index + 1) + '">' +
    marketPicture(marketSouvenirs.find(word => word.en === en)) + '</button>').join('') + '</div>';
}

function marketAudio(q) {
  return '<div class="market-audio"><audio id="market-recording" controls preload="metadata" src="' + q.media +
    '" aria-label="Запись Гарри"></audio><button class="btn ghost" id="market-replay">С начала</button>' +
    '<button class="btn ghost" id="market-slow" aria-pressed="' + Boolean(L.marketSlow) + '">Медленно</button></div>';
}

function marketExercise(q) {
  if (q.media) {
    const recording = document.getElementById('market-recording');
    const setSpeed = () => {
      recording.defaultPlaybackRate = L.marketSlow ? .75 : 1;
      recording.playbackRate = recording.defaultPlaybackRate;
    };
    const play = () => recording.play().then(setSpeed).catch(() => {});
    setSpeed();
    document.getElementById('market-replay').onclick = () => { recording.currentTime = 0; play(); };
    document.getElementById('market-slow').onclick = event => {
      L.marketSlow = !L.marketSlow;
      event.currentTarget.setAttribute('aria-pressed', String(L.marketSlow));
      setSpeed();
      play();
    };
  }
  if (q.say) {
    const reveal = document.getElementById('market-say-reveal');
    reveal.onclick = () => {
      reveal.hidden = true;
      document.getElementById('market-say-result').hidden = false;
      document.getElementById('market-said-it').focus();
    };
    const submit = answer => { L.ans = answer; check(); };
    document.getElementById('market-said-it').onclick = () => submit(q.say.en);
    document.getElementById('market-say-again').onclick = () => submit('');
  }
}

function marketSpeakRecall(word) {
  return '<div class="market-say"><button class="btn ghost" id="market-say-reveal">Показать слово</button>' +
    '<div id="market-say-result" hidden><p lang="en">' + collectionHelp(word.en, word.ru) + '</p>' +
    '<button class="btn market-primary" id="market-said-it">Я вспомнил(а)</button> ' +
    '<button class="btn ghost" id="market-say-again">Повторить позже</button></div></div>';
}

function marketDraftPlaces(lines) {
  const places = lines.map(line => {
    const parts = line.trim().match(/^you can buy\s+(.+?)\s+in\s+(.+?)\s*[.!]?$/i);
    if (!parts || !parts.slice(1).every(part => /\p{L}/u.test(part))) return '';
    return norm(parts[2]);
  });
  return places.every(Boolean) && places[0] !== places[1];
}

function marketPortfolio() {
  const pupil = save.pupil.id;
  const lines = save.marketDrafts?.[pupil] || ['', ''];
  app.innerHTML = '<main class="wrap market-portfolio"><button class="chback" id="back">← К маршруту</button>' +
    '<h1 lang="en">Make your own map</h1><p>Выбери два места в своей стране и по одному сувениру для каждого.</p>' +
    '<p class="market-example" lang="en">You can buy a matryoshka in Moscow.</p>' +
    '<form id="market-map-form"><div class="market-draft-lines">' + lines.map((line, index) =>
      '<label>Предложение ' + (index + 1) + '<input name="line" maxlength="140" autocomplete="off" required ' +
      'placeholder="You can buy … in …" value="' + esc(line) + '"></label>').join('') + '</div>' +
    '<div class="market-portfolio-task"><h2>Portfolio · с. 41, упр. 4</h2>' +
    '<p>Найди или нарисуй карту своей страны. Отметь два места и подпиши сувениры. Подготовься представить карту классу.</p></div>' +
    '<button class="btn market-primary" type="submit">Сохранить и получить печать</button>' +
    '<p id="market-draft-status" role="status"></p></form></main>';
  const form = app.querySelector('#market-map-form');
  const status = app.querySelector('#market-draft-status');
  const fields = [...form.querySelectorAll('input')];
  const read = () => fields.map(field => field.value.trim());
  const storeDraft = () => {
    save.marketDrafts ||= {};
    save.marketDrafts[pupil] = read();
    store();
    status.textContent = '';
  };
  form.addEventListener('input', storeDraft);
  form.onsubmit = event => {
    event.preventDefault();
    if (!marketDraftPlaces(read())) {
      status.textContent = 'Напиши два предложения по образцу. Укажи разные места.';
      return;
    }
    storeDraft();
    L.portfolioReady = true;
    finish();
  };
  app.querySelector('#back').onclick = home;
  window.scrollTo(0, 0);
}
