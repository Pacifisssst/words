const choice = (prompt, answer, other, why, hint, context = '') =>
  ({ type: 'choice', prompt, answer, other, why, hint, context });
const build = (prompt, answer, other, why, hint, context = '') =>
  ({ type: 'build', prompt, answer, other, why, hint, context });
const write = (prompt, answer, why, hint) =>
  ({ type: 'write', prompt, answer, why, hint });

const sections = [
  {
    title: 'Лишнее слово', detail: 'Жанры и лексика',
    rule: [
      ['mystery · biography · fairy tale', 'Это жанры: детективная история, биография и сказка.'],
      ['author · reader · writer · story', 'Три слова называют людей. Story — это история.']
    ],
    tasks: [
      choice('Какое слово лишнее?', 'helmet', ['mystery', 'comedy', 'adventure'], 'Mystery, comedy и adventure — жанры. Helmet — шлем.', 'Какие слова могут обозначать жанр книги или фильма?'),
      choice('Какое слово лишнее?', 'thriller', ['writer', 'reader', 'detective'], 'Writer, reader и detective — люди. Thriller — жанр.', 'Три слова называют людей.'),
      choice('Какое слово лишнее?', 'boots', ['torch', 'map', 'compass'], 'Boots носят на ногах. Torch, map и compass — предметы, которыми пользуются в пути.', 'Какое слово обозначает часть одежды?'),
      choice('Какое слово лишнее?', 'delighted', ['worried', 'upset', 'afraid'], 'Delighted значит «в восторге». Остальные слова описывают неприятные чувства.', 'Найди слово с положительным значением.'),
      choice('О каком жанре идёт речь?', 'science fiction', ['biography', 'comedy', 'fairy tale'], 'Роботы и жизнь на другой планете — типичные темы научной фантастики.', 'Подумай о технологиях и жизни в будущем.', 'In 2150, robots build a city on Mars.')
    ]
  },
  {
    title: 'Словосочетания', detail: 'Глагол и подходящее слово',
    rule: [
      ['follow a clue', 'Идти по следу. Учи глагол вместе со словами, которые идут после него.'],
      ['tell a story · play a role', 'Рассказать историю · сыграть роль.']
    ],
    tasks: [
      choice('Выбери глагол.', 'explore', ['wear', 'tell', 'overcome'], 'Explore a cave — исследовать пещеру.', 'Нужен глагол со значением «исследовать».', 'The friends want to ___ a cave.'),
      choice('Выбери глагол.', 'solve', ['wear', 'smoke', 'tell'], 'Solve a mystery — раскрыть тайну.', 'Нужен глагол со значением «разгадать».', 'Can the detective ___ the mystery?'),
      choice('Выбери глагол.', 'create', ['tell', 'play', 'smoke'], 'Create a character — придумать персонажа. Play a character — сыграть его.', 'Герой будет новым: его ещё предстоит придумать.', 'The writer wants to ___ a new character for her book.'),
      choice('Выбери глагол.', 'overcome', ['explore', 'wear', 'tell'], 'Overcome an obstacle — преодолеть препятствие.', 'Что делают с препятствием, чтобы двигаться дальше?', 'The hero must ___ a difficult obstacle.'),
      choice('Выбери глагол.', 'tell', ['play', 'wear', 'put'], 'Tell a story — рассказать историю.', 'Глагол означает «рассказать».', 'Can you ___ us a funny story?'),
      choice('Выбери глагол.', 'use', ['smoke', 'overcome', 'tell'], 'Use a magnifying glass — воспользоваться лупой.', 'Лупа помогает увидеть мелкие детали.', 'You can ___ a magnifying glass to read tiny letters.'),
      choice('Выбери глагол.', 'play', ['tell', 'smoke', 'overcome'], 'Play the role of a detective — сыграть роль детектива.', 'Что делает актриса на сцене?', 'Mia will ___ the role of a detective on stage.'),
      choice('Выбери глагол.', 'wear', ['put', 'solve', 'smoke'], 'Wear a cape — носить плащ. Put on a cape — надеть плащ.', 'Речь о том, в чём человек обычно ходит.', 'The hero used to ___ a long cape.'),
      choice('Выбери глагол.', 'smoke', ['tell', 'wear', 'explore'], 'Smoke a pipe — курить трубку.', 'Речь о том, что герой делает с трубкой.', 'In the story, the old sailor used to ___ a pipe.'),
      choice('Выбери глагол.', 'put', ['play', 'solve', 'explore'], 'Put someone behind bars — посадить кого-то за решётку.', 'Здесь нужен глагол «поместить».', 'The police worked hard to ___ the thief behind bars.')
    ]
  },
  {
    title: 'Привычки в прошлом', detail: 'Used to и didn’t use to',
    rule: [
      ['+ She used to draw.', 'Раньше она часто рисовала. После used to ставь глагол в начальной форме.'],
      ['− She didn’t use to draw.', 'Раньше она не рисовала. После didn’t пиши use to без буквы d.'],
      ['? Did she use to draw?', 'Она раньше рисовала? После Did тоже пиши use to.']
    ],
    tasks: [
      build('Собери полное предложение.', 'Nina used to draw comics.', ['use'], 'Привычка была. Пиши used to + draw.', 'Для привычки с «да» выбирай used to.', 'Nina, 8 лет · draw comics (да)'),
      build('Собери полное предложение.', 'Nina didn’t use to ride a bike.', ['used'], 'Didn’t уже указывает на прошлое. Пиши didn’t use to.', 'Для «нет» начни с Nina didn’t.', 'Nina, 8 лет · ride a bike (нет)'),
      build('Собери полное предложение.', 'Max used to collect stamps.', ['use', 'collected'], 'После used to ставь начальную форму: collect.', 'Привычка была. После used to глагол не меняется.', 'Max, 7 лет · collect stamps (да)'),
      write('Eva, 6 лет · drink tea (нет)', 'Eva didn’t use to drink tea.', 'Отрицание строится так: Eva + didn’t use to + drink tea.', 'Напиши полное предложение. Начни с Eva didn’t.'),
      write('Leo, 7 лет · read comics (да)', 'Leo used to read comics.', 'Утверждение строится так: Leo + used to + read comics.', 'Напиши полное предложение. Начни с Leo used to.'),
      build('Собери вопрос о прошлой привычке.', 'Did Max use to collect stamps?', ['used'], 'Вопрос начинается с Did. После Max пиши use to без d.', 'Порядок: Did → кто? → use to → действие.', 'Max · collect stamps?')
    ]
  },
  {
    title: 'Связки времени', detail: 'Until, as soon as, after, when, then',
    rule: [
      ['until', 'До какого момента? We waited until noon.'],
      ['as soon as', 'Как только, сразу же. Call me as soon as you arrive.'],
      ['after', 'После того как. We left after the film ended.'],
      ['when', 'Когда? I was at home when she called.'],
      ['then', 'Затем. I read the note and then called Sam.']
    ],
    tasks: [
      choice('Какая связка подходит?', 'until', ['then', 'as soon as'], 'Ждали до конца дождя. Until показывает, где действие закончилось.', 'Ожидание длилось до определённого момента.', 'We stayed indoors ___ the rain stopped.'),
      choice('Как сказать «как только»?', 'as soon as', ['until', 'then'], 'As soon as показывает, что звонок случился сразу после приземления.', 'Нужна связка со значением «сразу же».', 'Nina called her dad ___ the plane landed.'),
      choice('Как сказать «после того как»?', 'after', ['until', 'then'], 'After the rain stopped значит «после того как дождь закончился».', 'Сначала дождь закончился. Потом мы вышли.', 'We went outside ___ the rain stopped.'),
      choice('Как сказать «когда»?', 'when', ['then', 'until'], 'When указывает на момент: Лена была в автобусе, когда зазвонил телефон.', 'Телефон зазвонил в тот момент, когда Лена была в автобусе.', 'Lena was on the bus ___ her phone rang.'),
      choice('Как сказать «затем»?', 'then', ['until', 'as soon as'], 'Then вводит следующее действие. Он закрыл книгу, затем выключил свет.', 'Нужно слово между двумя действиями одного человека.', 'He closed his book and ___ turned off the light.')
    ]
  },
  {
    title: 'Раскрой скобки', detail: 'Past Simple и «магнит DID»',
    rule: [
      ['I found it. → Did you find it?', 'В утверждении нужно found. После did и didn’t ставь начальную форму: find.'],
      ['She was tired. · Were they tired?', 'С was / were строй вопрос без did.'],
      ['I heard her sing. · I asked her to sing.', 'После hear + кто-то ставь глагол без to. После ask или want + кто-то ставь to.']
    ],
    tasks: [
      build('Собери полное предложение.', 'Where did Lucy hide the letter?', ['hid'], 'После did ставим hide. Did уже показывает прошедшее время.', 'Вопрос: Where → did → Lucy → начальная форма.', 'Where ___ (Lucy / hide) the letter?'),
      build('Собери полное предложение.', 'The professor wanted Nina to explore the cave.', ['want', 'explored'], 'Wanted — прошедшая форма. После wanted Nina нужно to explore.', 'В утверждении want → wanted. После Nina поставь to.', 'The professor ___ (want) Nina ___ (explore) the cave.'),
      write('Sam ___ (not / see) the message.', 'Sam didn’t see the message.', 'После didn’t нужна начальная форма see.', 'Запиши полное предложение. Did уже показывает прошедшее время.'),
      write('No, they ___ (be) afraid.', 'No, they were afraid.', 'С they прошедшая форма be — were.', 'Для they выбери между was и were.'),
      build('Собери полное предложение.', 'I heard him open the door.', ['hear', 'to'], 'Hear → heard. После heard him ставь open без to, если говоришь о целом действии.', 'Сначала поставь hear в прошедшую форму. После him используй open.', 'I ___ (hear) him ___ (open) the door.'),
      write('How ___ (Mia / feel) when she ___ (see) the shadow?', 'How did Mia feel when she saw the shadow?', 'В вопросе ставь did Mia feel. В части после when нужно saw.', 'Начни с How did Mia. Во второй части see → saw.')
    ]
  },
  {
    title: 'Формы глаголов', detail: 'Вторая форма и окончание -ed',
    rule: [
      ['walk → walked · smile → smiled', 'Правильные глаголы получают -ed. Если уже есть конечная e, добавь только d.'],
      ['go → went · read → read', 'Неправильные формы нужно запомнить. У read меняется произношение.']
    ],
    tasks: [
      write('catch → ?', 'caught', 'Catch → caught. Например: She caught the ball.', 'Форма начинается с cau-.'),
      write('send → ?', 'sent', 'Send → sent. Буква d меняется на t.', 'В конце формы будет t.'),
      write('find → ?', 'found', 'Find → found. Например: They found a clue.', 'После f пиши ou.'),
      write('hide → ?', 'hid', 'Hide → hid. Конечная e исчезает.', 'В ответе всего три буквы.'),
      write('break → ?', 'broke', 'Break → broke. Например: He broke his glasses.', 'В середине формы есть o.'),
      write('wake → ?', 'woke', 'Wake → woke. Например: I woke up early.', 'Буква a меняется на o.'),
      write('decide → ?', 'decided', 'Decide → decided. В конце уже есть e, добавь только d.', 'Это правильный глагол.'),
      write('hear → ?', 'heard', 'Hear → heard. Например: We heard a noise.', 'К форме hear добавляется d.'),
      write('leave → ?', 'left', 'Leave → left. Например: We left early.', 'Форма заканчивается на -ft.'),
      write('put → ?', 'put', 'Put → put. Вторая форма пишется так же.', 'Форма из трёх букв.'),
      write('see → ?', 'saw', 'See → saw. Например: She saw a shadow.', 'Форма начинается с sa-.'),
      write('feel → ?', 'felt', 'Feel → felt. Например: I felt afraid.', 'В конце формы пиши -lt.')
    ]
  },
  {
    title: 'Реплики в диалоге', detail: 'Подходящий ответ по смыслу',
    rule: [
      ['What’s this? → It’s a key.', 'Если спрашивают, что это, назови предмет.'],
      ['I had quite a shock. → Really? What happened?', 'Если кто-то говорит, что сильно испугался, можно спросить, что случилось.']
    ],
    tasks: [
      choice('Подбери ответ.', 'It’s just the wind. Don’t worry!', ['Yes, I like reading.', 'It’s my new coat.'], 'Собеседник услышал шум. Ответ объясняет звук и успокаивает.', 'Что могло издать такой звук?', 'Did you hear that noise outside?'),
      choice('Подбери ответ.', 'Oh no! What happened next?', ['Yes, it’s on the table.', 'Of course I can.'], 'Собеседник испугался. В ответ мы спрашиваем, что было потом.', 'Собеседник начал рассказывать историю.', 'I had quite a shock when the lights went out.'),
      choice('Подбери ответ.', 'Of course not! Let’s go in.', ['It’s a silver key.', 'I finished it yesterday.'], 'На вопрос Are you afraid? можно ответить Of course not! — «Конечно нет!»', 'Это вопрос о том, страшно ли тебе.', 'Are you afraid of the dark?'),
      choice('Подбери ответ.', 'It’s an old coin.', ['No, I didn’t.', 'I’m fine, thanks.'], 'What’s this? — вопрос о предмете. An old coin значит «старая монета».', 'В ответе нужно назвать предмет.', 'Hang on! What’s this under the stairs?')
    ]
  }
];

const mixed = [
  choice('Какое слово лишнее?', 'detective', ['biography', 'fairy tale', 'comedy'], 'Detective здесь обозначает человека. Остальные слова — названия жанров.', 'Три слова называют жанры.'),
  choice('Выбери глагол.', 'solve', ['tell', 'wear', 'smoke'], 'Solve a crime — раскрыть преступление.', 'Речь о работе детектива.', 'Can they ___ the crime?'),
  write('Ella, 7 лет · wear glasses (нет)', 'Ella didn’t use to wear glasses.', 'После didn’t пиши use to без d.', 'Начни с Ella didn’t.'),
  choice('Какая связка подходит?', 'until', ['then', 'as soon as'], 'Чтение длилось до прихода Алекса. Until показывает конец действия.', 'Найди конец действия.', 'I kept reading ___ Alex came home.'),
  write('Where ___ (you / find) the key?', 'Where did you find the key?', 'Вопрос: Where + did + you + find. После did нужна начальная форма.', 'Начни с Where did you.'),
  write('go → ?', 'went', 'Go → went. Например: He went home.', 'Форма начинается с w.'),
  choice('Подбери ответ.', 'It’s a small toy car.', ['I was at home.', 'Of course I did.'], 'На вопрос о предмете ответь, как он называется.', 'Назови предмет.', 'What’s this in the box?')
];

const listening = {
  title: 'Аудирование',
  detail: 'Короткая история · 4 вопроса',
  rule: [
    ['Before you listen', 'Сначала прочитай вопросы. Варианты помогут понять, какие детали нужно услышать.'],
    ['Listen twice', 'В первый раз пойми, что случилось. Во второй проверь детали.']
  ],
  tasks: [
    choice('Who went to the library with Nina?', 'Her cousin', ['Her brother', 'Her classmate'],
      'В записи: Nina went to the library with her cousin.', 'Прислушайся к началу истории. Кто пошёл вместе с Ниной?'),
    choice('What did Nina want to find?', 'A book about old castles', ['A book about animals', 'A book about ships'],
      'В записи: They wanted to find a book about old castles.', 'Сразу после места и спутника ты услышишь, зачем они пришли.'),
    choice('What did Nina think she could hear?', 'A cat', ['A phone', 'A dog'],
      'В записи: She thought it was a cat. Это её первая догадка.', 'Обрати внимание на слова She thought. Речь о первой догадке.'),
    choice('What made the noise?', 'A small radio', ['A toy train', 'An old clock'],
      'В записи: She found a small radio. Библиотекарь оставил его включённым.', 'В конце истории Нина заглянула за полку.')
  ]
};
