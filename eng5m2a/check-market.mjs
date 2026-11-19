import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('.', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const exists = file => fs.statSync(new URL(file, root)).size > 0;
const html = read('index.html');
const choiceStart = html.indexOf('function choice(o)');
assert(choiceStart > 0);
const make = new Function(`
  const UNITS = [], CHS = [];
  const esc = String;
  const collectionHelp = (en, ru) => en + ' / ' + ru;
  const norm = text => text.toLowerCase().replace(/[.!?]+$/, '').trim();
  const shuf = items => {
    const list = [...items];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };
  ${html.slice(choiceStart, html.indexOf('\n', choiceStart))}
  ${read('market.js')}
  return { UNITS, CHS, marketSouvenirs, marketPairs, marketDraftPlaces, marketPicture };
`)();

const { UNITS, CHS, marketSouvenirs, marketPairs, marketDraftPlaces, marketPicture } = make;
assert.equal(CHS[0].id, '2d-19nov');
assert.equal(UNITS.length, 5);
assert.equal(new Set(UNITS.map(unit => unit.id)).size, 5);
for (const word of marketSouvenirs) {
  const path = 'img/market/enchanted/' + word.art + '.webp';
  assert(marketPicture(word).includes(`src="${path}"`));
  assert(exists(path) && exists('audio/market/' + word.id + '.mp3'));
}
assert(['wizard-library','market-cover','harry-owl-bus'].every(art => exists('img/market/' + art + '.webp')));
assert(exists('audio/market/harry-ryan.mp3'));

const [vocab, owl, labels, routes, grammar] = UNITS;
const orders = new Set();
for (let i = 0; i < 300; i++) {
  for (const unit of UNITS) {
    const questions = unit.make();
    const scored = questions.filter(q => q.type !== 'discover');
    assert.equal(new Set(scored.map(q => q.qid)).size, scored.length);
    for (const q of scored) {
      assert(q.prompt && q.promptRu && q.why);
      if (q.type === 'choice') {
        assert.equal(new Set(q.opts).size, q.opts.length);
        assert(q.opts[q.correct]);
      } else {
        assert(q.say && q.accept[0]);
      }
    }
  }
  const labelQuestions = labels.make();
  orders.add(labelQuestions.map(q => q.qid).join('|'));
  for (const [country, nationality] of marketPairs) {
    const q = labelQuestions.find(q => q.qid === '2d · Country: ' + country);
    assert.equal(q.opts[q.correct], nationality);
  }
}
assert(orders.size > 1);
assert.deepEqual(vocab.make().filter(q => q.type === 'discover').map(q => q.batch), [1,1,1,2,2,2]);
assert.deepEqual(owl.make().map(q => q.opts[q.correct]), ['England','Toy buses','Five']);
const routeAnswers = new Map(routes.make().map(q => [q.qid, q.opts[q.correct]]));
assert.equal(routeAnswers.get('2d · from: a pin'), 'the UK');
assert.equal(routeAnswers.get('2d · where: a pin'), 'England');
assert.equal(routeAnswers.get('2d · where: toy buses'), 'London');
assert.match(routes.make().find(q => q.qid === '2d · where: toy buses').why, /buy them in London/);
assert.deepEqual(grammar.make().map(q => q.opts[q.correct]), ['It’s a mug.', 'It’s got a Welsh dragon on it.']);

const first = 'You can buy a souvenir in Sample City.';
assert(marketDraftPlaces([first, 'You can buy postcards in Demo Town.']));
assert(!marketDraftPlaces([first, '']));
assert(!marketDraftPlaces([first, 'you can buy a mug in sample city']));
assert(!marketDraftPlaces([first, 'You can buy … in …']));
console.log('PASS: 1,500 generated level runs, assets, shuffled pairs, listening answers, routes, contractions and map validation.');
