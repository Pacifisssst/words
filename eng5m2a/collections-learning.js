// Module 2c uses short picture-led introductions before recognition and recall.
const objectOrder=['album','coin','stamp','picture','collection','age'];
COLLECTIONS.groups[0].words.sort((a,b)=>objectOrder.indexOf(a.id)-objectOrder.indexOf(b.id));
const COLLECTION_WORDS = COLLECTIONS.groups.flatMap(group => group.words);
const collectionWord = key => COLLECTION_WORDS.find(word => word.id === key || word.en === key);
const collectionHelp = (en, ru) => '<span class="help-unit"><button type="button" class="translate" data-russian="' +
  esc(ru) + '" aria-expanded="false">' + esc(en) + '</button><span class="ru-help" hidden></span></span>';

app.addEventListener('click', event => {
  const button = event.target.closest('[data-russian]');
  if (!button) return;
  const help = button.nextElementSibling;
  help.hidden = !help.hidden;
  help.textContent = button.dataset.russian;
  button.setAttribute('aria-expanded', String(!help.hidden));
});

function collectionArt(word, labelled = true) {
  if (word.number) {
    return '<div class="number-exhibit" role="img" aria-label="' + (labelled ? word.number : 'A number') + '">' +
      '<span class="exhibit-number">' + word.number + '</span><div class="ten-bundles" aria-hidden="true">' +
      Array.from({length: word.number / 10}, () => '<span>10</span>').join('') +
      '</div></div>';
  }
  if (word.visual === 'age') {
    return '<div class="age-exhibit"><img src="tom-collection/age.jpg" alt="A young collector."><span>11</span></div>';
  }
  return '<img class="word-art" src="img/collections/' + word.visual + '.webp" alt="' +
    (labelled ? esc(word.en) : 'Museum picture') + '">';
}

function collectionPictureOptions(q) {
  return '<div class="visual-options">' + q.opts.map((en, index) =>
    '<button class="opt visual-option" data-o="' + index + '" aria-label="Picture ' + (index + 1) + '">' +
    collectionArt(collectionWord(en), false) + '</button>').join('') + '</div>';
}

function collectionRecall(word) {
  const phrase = word.number ? 'How do you write this number?' :
    word.id === 'age' ? 'Your ___ tells us how old you are.' :
    word.example.replace(new RegExp(word.en.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i'), '___');
  // Inflected examples need a separate sentence to recall the dictionary form.
  const prompt = word.id === 'proud' ? 'Write the phrase: гордиться.' : phrase;
  return {
    type: 'text', qid: '2c recall: ' + word.id, wordId: word.id,
    prompt: 'Remember the word.', promptRu: 'Вспомни слово.',
    show: '<div class="recall-art">' + collectionArt(word, false) + '</div>' +
      '<p class="recall-clue">' + (word.id === 'proud'
        ? collectionHelp('Which phrase means “to take pride in something”?', word.ru)
        : collectionHelp(prompt, word.ruExample || word.ru)) + '</p>',
    accept: [word.en], why: collectionHelp(word.en, word.ru),
    hint: 'First letter: ' + word.en[0] + '. Tap the sentence for Russian.',
  };
}

function collectionRecognition(word, batch, audio) {
  const visual = ['album', 'coin', 'stamp', 'picture'].includes(word.id);
  const pool = batch;
  const otherWords = COLLECTION_WORDS.filter(w => w.id !== word.id && !pool.some(p => p.id === w.id));
  const others = shuf(pool.filter(w => w.id !== word.id)).concat(shuf(otherWords)).slice(0, 2);
  return choice({
    qid: '2c ' + (audio ? 'listen: ' : 'recognise: ') + word.id,
    wordId: word.id, prompt: audio ? 'Listen. Choose the word.' : 'Choose the word for this picture.',
    promptRu: audio ? 'Послушай. Выбери слово.' : 'Выбери слово к картинке.',
    audio: audio ? collectionAudio(word.id) : null, transcript: audio ? word.en : null,
    show: audio ? '' : '<div class="recognition-art">' + collectionArt(word, false) + '</div>' +
      (['but','because','feel','great','nice','easy'].includes(word.id)
        ? '<p class="recall-clue">' + collectionHelp(word.example.replace(new RegExp(word.en,'i'),'___'),word.ruExample) + '</p>'
        : ''),
    visualOptions: audio && visual,
    opts: [word.en, ...others.map(w => w.en)],
    why: collectionHelp(word.en, word.ru),
    hint: 'Look closely. Tap English for Russian help.',
  });
}

function collectionPractice(group) {
  const questions = [];
  for (let offset = 0; offset < group.words.length; offset += 3) {
    const batch = group.words.slice(offset, offset + 3);
    for (const word of batch) questions.push({type: 'discover', word});
    for (const word of shuf(batch)) questions.push(collectionRecognition(word, batch, false));
    for (const word of shuf(batch)) questions.push(collectionRecognition(word, batch, true));
    for (const word of shuf(batch)) questions.push(collectionRecall(word));
  }
  return questions;
}

function collectionDiscovery(q) {
  const word = q.word;
  const progress = Math.round(L.ok / L.total * 100);
  app.innerHTML = '<main class="wrap vocab-discovery"><div class="lbar">' +
    '<button class="iconbtn" id="word-exit" aria-label="Back to lesson">' + IC.close + '</button>' +
    '<div class="prog" role="progressbar" aria-valuenow="' + progress +
    '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + progress + '%"></i></div></div>' +
    '<div class="discovery-art"><button class="curio-art" id="curio" aria-label="Explore the picture">' +
    collectionArt(word) + '</button></div><div class="discovery-copy">' +
    '<div class="word-heading"><h1 lang="en">' + collectionHelp(word.en, word.ru) + '</h1>' +
    '<button class="word-play" id="word-play" aria-label="Listen to ' + esc(word.en) + '">' + IC.playic + '</button></div>' +
    '<p class="word-example" lang="en">' + collectionHelp(word.example, word.ruExample) + '</p>' +
    '<p class="tap-help">Tap English for Russian. Listen and say it.</p>' +
    '<p class="curio-comment" id="curio-comment" aria-live="polite"></p></div>' +
    '<button class="btn discovery-next" id="word-next">Got it</button></main>';
  const play = app.querySelector('#word-play');
  play.onclick = () => speak(collectionAudio(word.id), play);
  app.querySelector('#word-exit').onclick = home;
  app.querySelector('#curio').onclick = event => {
    event.currentTarget.classList.remove('curio-bounce');
    requestAnimationFrame(() => event.currentTarget.classList.add('curio-bounce'));
    app.querySelector('#curio-comment').textContent = word.id === 'coin' ? 'Careful, curator. That one rolls!' :
      word.id === 'stamp' ? 'The frog has requested a bigger frame.' :
      word.id === 'album' ? 'The raccoon is checking the pictures.' :
      word.id === 'picture' ? 'The museum’s most serious portrait.' :
      word.number ? 'Count the bundles. Ten in each one.' : 'Another discovery for the museum!';
  };
  app.querySelector('#word-next').onclick = () => {
    if (player) player.pause();
    L.queue.shift();
    ask();
  };
  setTimeout(() => {
    if (app.querySelector('#word-play') === play) play.click();
  }, 150);
  window.scrollTo(0, 0);
}

const collectionGroupNames = ['Museum finds', 'Count your collection', 'Tell us about it'];
collectionLevels.slice(0, 3).forEach((level, i) => {
  level.name = collectionGroupNames[i];
  level.sub = COLLECTIONS.groups[i].words.length + ' words · see, listen, remember';
  level.make = () => collectionPractice(COLLECTIONS.groups[i]);
});

collectionLevels[3].name = 'Useful phrases';
collectionLevels[3].title = 'Build useful phrases';
collectionLevels[3].lead = 'Practise Alex’s examples. Then create your own story.';
collectionLevels[3].rules = [["I collect …", 'Say what you collect.'], ["I've got …", 'Say how many you have.']];
collectionLevels[3].sub = 'Ideas for your own story';
collectionLevels[4].name = 'Meet Alex';
collectionLevels[4].sub = 'A girl at the museum · three short clips';
collectionLevels[4].title = 'Meet Alex';
collectionLevels[4].lead = 'Alex is a girl visiting the museum. Listen to her story, choose and build a sentence.';
collectionLevels[4].rules = [['Listen', 'Play each clip as often as you need.'], ['Slow replay', 'Take your time. Read the transcript after answering.']];
collectionLevels[5].name = 'My collection story';
collectionLevels[5].sub = 'Choose, edit and finish your own story';

collectionBuild = function(text, ru, id, audio) {
  return {
    type: 'build', qid: '2c: ' + id,
    prompt: audio ? 'Listen and build the sentence.' : 'Build the sentence.',
    promptRu: audio ? 'Послушай и собери предложение.' : 'Собери предложение.',
    audio: audio || null, transcript: audio ? text : null,
    tiles: shuf(text.split(' ')), accept: [text],
    why: collectionHelp(text, ru),
    hint: 'Start with I, My or They. Then find the verb.',
    show: audio ? '' : '<p class="phrase-help">' + collectionHelp('Tap for a meaning hint.', ru) + '</p>',
  };
};

const originalCollectionListening = collectionLevels[4].make;
collectionLevels[4].make = () => originalCollectionListening().map(q => {
  if (q.qid === '2c: listening amount') q.prompt = 'How many stamps has Alex got?';
  q.promptRu = q.type==='build' ? q.promptRu : ({
    'listen-age': 'Сколько лет Алексу?',
    'listen-collection': 'Что собирает Алекс?',
    'listen-feelings': 'Как Алекс относится к своей коллекции?',
  })[q.qid.replace('2c: ', '')] || 'Сколько марок у Алекса?';
  q.hint = 'Listen again. Find the detail you need.';
  if (q.type === 'choice') q.why = collectionHelp(q.transcript, ({
    'listen-age': 'Привет! Меня зовут Алекс. Мне одиннадцать лет. Я из России. Добро пожаловать в мой уголок Хижины Чудес!',
    'listen-collection': 'Я собираю марки. У меня пятьдесят марок в альбоме. На некоторых марках изображены забавные животные.',
    'listen-feelings': 'Я горжусь своей коллекцией, потому что она отличная. Я счастлива, когда смотрю на свои марки. Коту из музея они тоже нравятся!',
  })[q.qid.replace('2c: ', '')] || 'У меня пятьдесят марок.');
  return q;
});

const COLLECTION_PHRASE_ART = {
  name:'img/collections/listening.webp',
  'age-phrase':'img/collections/listening.webp',
  from:'img/collections/listening.webp',
  collect:'img/collections/stamp.webp',
  got:'img/collections/album.webp',
  'album-phrase':'img/collections/album.webp',
  'proud-phrase':'img/collections/proud.webp',
  'happy-phrase':'img/collections/happy.webp',
};

collectionWordList = function(words) {
  if(words === COLLECTIONS.phrases){
    return '<p class="phrase-instruction">Tap a sentence. Listen, repeat, and tap again to hide Russian.</p>' +
      '<div class="phrase-cards">' + words.map(word =>
      '<button type="button" class="phrase-card" data-collection-audio="' + word.id +
      '" aria-label="Listen and translate: ' + esc(word.en) + '" aria-expanded="false">' +
      '<span class="phrase-art"><img src="' + COLLECTION_PHRASE_ART[word.id] +
      '" alt="" loading="lazy">' +
      (word.id==='age-phrase'?'<span class="phrase-age">11</span>':'') + '</span>' +
      '<span class="phrase-copy"><span class="phrase-sentence" lang="en">' + esc(word.en) +
      '</span><span class="phrase-translation" lang="ru" hidden>' + esc(word.ru) + '</span></span>' +
      '<span class="phrase-speaker" aria-hidden="true">' + IC.playic + '</span></button>').join('') +
      '</div><p class="phrase-audio-status" role="status"></p>';
  }
  return '<ul class="collection-words">' + words.map(w =>
    '<li><div>' + collectionHelp(w.en, w.ru) + '</div><button class="iconbtn" data-collection-audio="' +
    w.id + '" aria-label="Listen to ' + esc(w.en) + '">' + IC.playic + '</button></li>').join('') + '</ul>';
};
const collectionDefaultAudioEvents = collectionAudioEvents;
collectionAudioEvents = function() {
  collectionDefaultAudioEvents();
  const phraseCards=app.querySelector('.phrase-cards');
  if(phraseCards)phraseCards.closest('.wrap').classList.add('phrase-intro');
  app.querySelectorAll('.phrase-card').forEach(button => {
    button.onclick = () => {
      app.querySelectorAll('.phrase-card.on').forEach(card => card.classList.remove('on'));
      const translation = button.querySelector('.phrase-translation');
      translation.hidden = !translation.hidden;
      button.setAttribute('aria-expanded',String(!translation.hidden));
      const status=app.querySelector('.phrase-audio-status');
      status.textContent='';
      speak(collectionAudio(button.dataset.collectionAudio),button);
      if(player){
        player.onplaying=()=>{button.dataset.audioState='playing';};
        player.onended=()=>{button.classList.remove('on');button.dataset.audioState='ended';};
        player.onerror=()=>{
          button.classList.remove('on');
          button.dataset.audioState='error';
          if(status.isConnected)status.textContent='The recording did not load. Tap the sentence to try again.';
        };
      }
    };
  });
};
collectionVocabulary = function() {
  lessonPage('Explore the words', '<p>Tap a word for Russian. Tap the picture to hear it.</p>' +
    '<div class="word-gallery">' + COLLECTION_WORDS.map(w => '<article><button class="gallery-art" data-collection-audio="' +
    w.id + '" aria-label="Listen to ' + esc(w.en) + '">' + collectionArt(w) +
    '</button>' + collectionHelp(w.en, w.ru) + '</article>').join('') + '</div>', home);
  collectionAudioEvents();
};

function collectionStory() {
  const draftKey = save.pupil?.id || 'guest';
  save.collectionDrafts = save.collectionDrafts || {};
  const draft = {...{name:'',age:'eleven',place:'Russia',item:'stamps',number:'fifty',
    detail:'nice pictures',reason:'it is great',feeling:'Collecting makes me very happy.'}, ...save.collectionDrafts[draftKey]};
  if(draft.feeling==='Collecting makes me happy.')draft.feeling='Collecting makes me very happy.';
  const select = (key, options) => '<select id="story-' + key + '">' + options.map(value =>
    '<option' + (value === draft[key] ? ' selected' : '') + '>' + esc(value) + '</option>').join('') + '</select>';
  const field = (label, ru, body) => '<div class="story-field">' + collectionHelp(label, ru) + body.replace(/<(input|select)/, '<$1 aria-label="'+esc(label)+'"') + '</div>';
  lessonPage('Create your collection story',
    '<img class="story-banner" src="img/collections/writing.webp" alt="The museum cat writes with an enormous pencil.">' +
    '<p>' + collectionHelp('Choose your details. You can invent a collection.', 'Выбери сведения для рассказа. Можно придумать коллекцию.') + '</p>' +
    '<div class="story-fields">' +
    field('My first name', 'Моё имя', '<input id="story-name" maxlength="30" autocomplete="given-name" value="' + esc(draft.name) + '" placeholder="Your first name">') +
    field('My age', 'Мой возраст', select('age',['ten','eleven','twelve','thirteen','fourteen'])) +
    field('I’m from', 'Откуда я', '<input id="story-place" maxlength="40" value="' + esc(draft.place) + '">') +
    field('I collect', 'Что я собираю', select('item',['stamps','coins','stickers','postcards','toy cars','shells'])) +
    field('How many?', 'Сколько?', select('number',['twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety','a hundred'])) +
    field('They have', 'Какие они', select('detail',['nice pictures','bright colours','interesting shapes'])) +
    field('I’m proud because', 'Почему я горжусь', select('reason',['it is great','it is interesting','it is special to me'])) +
    field('How I feel', 'Мои чувства', select('feeling',['Collecting makes me very happy.','I feel happy when I look at my collection.','I really like my wonderful collection.'])) +
    '</div><div class="story-step-line" id="story-step-line"></div><div class="story-nav"><button class="btn ghost" id="story-previous">Back</button><button class="btn" id="story-next">Next sentence</button></div><h2 id="story-result-title">Your story</h2><p class="story-count"  id="story-count" aria-live="polite"></p>' +
    '<div class="story-preview" id="story-preview"></div>' +
    '<button class="btn" id="story-edit">Edit my sentences</button>' +
    '<div id="story-editor" hidden><label for="story-text">Your own words</label>' +
    '<textarea id="story-text" rows="9" maxlength="1500"></textarea></div>' +
    '<p>' + collectionHelp('Aim for 40–50 words. Check short forms and numbers. Read your story aloud.',
      'Нужно 40–50 слов. Проверь краткие формы и числительные. Прочитай рассказ вслух.') + '</p>' +
    '<button class="btn" id="story-ready">My story is ready</button><p id="story-status" role="status"></p>', home);
  let step=0;
  let editing = !!draft.text;
  let currentStory = '';
  const textarea = app.querySelector('#story-text');
  textarea.value=draft.text || '';
  app.querySelector('#story-editor').hidden=!editing;
  const translateSentence = (text, indexes) => {
    const ageRu={ten:'десять',eleven:'одиннадцать',twelve:'двенадцать',thirteen:'тринадцать',fourteen:'четырнадцать'};
    const itemRu={stamps:'марки',coins:'монеты',stickers:'наклейки',postcards:'открытки','toy cars':'игрушечные машинки',shells:'ракушки'};
    const amountRu={twenty:'двадцать',thirty:'тридцать',forty:'сорок',fifty:'пятьдесят',sixty:'шестьдесят',seventy:'семьдесят',eighty:'восемьдесят',ninety:'девяносто','a hundred':'сто'};
    const detailsRu={'nice pictures':'красивые картинки','bright colours':'яркие цвета','interesting shapes':'интересные формы'};
    const reasonRu={'it is great':'она отличная','it is interesting':'она интересная','it is special to me':'она особенная для меня'};
    const translations = [
      'Меня зовут ' + draft.name + '.',
      'Мне ' + ageRu[draft.age] + ' лет. Я из ' + (draft.place==='Russia'?'России':draft.place) + '.',
      'Я собираю ' + itemRu[draft.item] + '.',
      'Количество предметов в моей коллекции — ' + amountRu[draft.number] + '.',
      'У них ' + detailsRu[draft.detail] + '.',
      'Я горжусь своей коллекцией, потому что ' + reasonRu[draft.reason] + '.',
      'Коллекция приносит мне радость.',
    ];
    return text.split(/(?<=[.!?])\s+/).map((sentence,i) => '<p>' + (editing ? esc(sentence) : collectionHelp(sentence, translations[indexes ? indexes[i] : i] || 'Твоё предложение.')) + '</p>').join('');
  };
  function update() {
    for (const key of ['name','age','place','item','number','detail','reason','feeling']) draft[key] = app.querySelector('#story-' + key).value.trim();
    let sentences = [
      'My name is ' + (draft.name || '___') + '.',
      "I'm " + draft.age + " years old and I'm from " + (draft.place || '___') + '.',
      'I collect ' + draft.item + '.',
      "I've got " + draft.number + ' ' + draft.item + ' in my collection.',
      'They have ' + draft.detail + '.',
      "I'm proud of my collection because " + draft.reason + '.',
      draft.feeling,
    ];
    const text = editing ? textarea.value : sentences.join(' ');
    app.querySelector('#story-status').textContent='';
    currentStory = text;
    const count = text.trim().split(/\s+/).filter(Boolean).length;
    const sentenceGroups=[[0,1],[2,3],[4],[5],[6]];
    app.querySelector('#story-step-line').innerHTML=step<5 ? translateSentence(sentenceGroups[step].map(i=>sentences[i]).join(' '),sentenceGroups[step]) : 'Your collection story';
    app.querySelectorAll('.story-field').forEach((field,index)=>{
      field.hidden=step===5 || ![[0,1,2],[3,4],[5],[6],[7]][step]?.includes(index);
    });
    const finished=step===5;
    for(const id of ['story-result-title','story-count','story-preview','story-edit','story-ready']){
      app.querySelector('#'+id).hidden=!finished;
    }
    app.querySelector('#story-editor').hidden=!finished || !editing;
    app.querySelector('#story-previous').hidden=step===0;
    app.querySelector('#story-next').hidden=finished;
    app.querySelector('#story-next').textContent=step===4?'Build my story':'Next sentence';
    app.querySelector('#story-next').disabled=step===0&&(!draft.name||!draft.place);
    app.querySelector('#story-preview').innerHTML = translateSentence(text);
    app.querySelector('#story-count').textContent = count + ' words · aim for 40–50';
    app.querySelector('#story-ready').disabled = !draft.name || !draft.place || count < 40 || count > 50;
    const savedDraft={...draft};
    delete savedDraft.text;
    if(editing)savedDraft.text=text;
    save.collectionDrafts[draftKey] = savedDraft;
    store();
  }
  app.querySelector('#story-next').onclick=()=>{step=Math.min(step+1,5);update();app.querySelector('.story-fields').scrollIntoView({block:'start'});};
  app.querySelector('#story-previous').onclick=()=>{step=Math.max(step-1,0);update();};
  app.querySelectorAll('.story-fields input,.story-fields select').forEach(input => {
    input.oninput = () => { editing = false; app.querySelector('#story-editor').hidden = true; update(); };
  });
  app.querySelector('#story-edit').onclick = () => {
    textarea.value = currentStory;
    app.querySelector('#story-editor').hidden = false;
    editing = true;
    textarea.focus();
  };
  textarea.oninput = update;
  app.querySelector('#story-ready').onclick = () => {
    save.u['c17-write'] = 3;
    save.t=save.t || {};
    save.t['c17-write'] = Date.now();
    store();
    queueResult({pupil:save.pupil,level:'c17-write',levelName:'17.11 · My collection story',
      stars:3,sec:0,mist:0,wrong:[],at:new Date().toISOString()});
    app.querySelector('#story-status').textContent = 'Your story is ready. Write it in your notebook and read it aloud.';
    app.querySelector('#story-ready').disabled=true;
  };
  update();
}

collectionWriting = collectionStory;

function collectionOption(en) {
  const word = collectionWord(en);
  const ru = word?.ru || ({
    Eleven:'Одиннадцать', Twelve:'Двенадцать', Thirteen:'Тринадцать',
    Stamps:'Марки', Coins:'Монеты', 'Toy cars':'Игрушечные машинки',
    Fifty:'Пятьдесят', Fifteen:'Пятнадцать', Forty:'Сорок',
    'She is proud of it.':'Она гордится ею.',
    'She wants to sell it.':'Она хочет её продать.',
    'She does not like it.':'Она ей не нравится.',
  })[en];
  return ru ? '<span class="help-unit"><span data-russian="'+esc(ru)+'" aria-expanded="false">'+esc(en)+'</span><span class="ru-help" hidden></span></span>' : esc(en);
}
function collectionExerciseEvents() {
  if (L.u.ch !== COLLECTION_CHAPTER) return;
  app.querySelector('#chk').textContent = 'Check';
  app.querySelector('#hb').innerHTML = IC.bulb + 'Hint';
  const slow = app.querySelector('#slow');
  if (slow) slow.textContent = 'Slow';
  const replay = app.querySelector('#ag');
  if (replay) replay.innerHTML = IC.waveic + 'Listen again';
  const play=app.querySelector('#pl');if(play)play.setAttribute('aria-label','Listen');
  app.querySelector('#x').setAttribute('aria-label','Back to lesson');
  const input = app.querySelector('#tin');
  if (input) {
    input.placeholder = 'Type the English word';
    app.querySelector('.tinhelp').textContent = 'Capital letters do not matter.';
  }
}

Object.assign(CHS.find(chapter => chapter.id === COLLECTION_CHAPTER), {
  sub:'22 words · listening · Tom’s song · your own story',
});
function collectionHomeLabels() {
  if (CH !== COLLECTION_CHAPTER) return;
  app.querySelector('#back').textContent = '← All lessons';
  app.querySelector('#mine').textContent = 'My progress';
  app.querySelector('#reset').textContent = 'Start this lesson again';
  const start = app.querySelector('.start-tag');
  if (start) start.textContent = 'Next';
}
function collectionFinishLabels() {
  if (L.u.ch !== COLLECTION_CHAPTER) return;
  app.querySelector('h1').textContent = 'Round complete!';
  app.querySelector('.done-screen > p').textContent = L.mist
    ? 'You practised the tricky words again. Good work!'
    : 'You remembered every answer. Well done!';
  app.querySelectorAll('.res b').forEach((label,index) => { label.textContent=['Points','Accuracy','Time'][index]; });
  app.querySelector('#hm').textContent = 'Back to lesson';
  const combo = app.querySelector('.done-screen > p:last-child');
  if (combo && combo.textContent.includes('Лучшая серия')) combo.textContent = 'Best run: ' + L.best + ' correct answers.';
}
