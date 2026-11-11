import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const words=fs.readFileSync(path.join(dir,'../5m2a/words.js'),'utf8');
const generators=html.slice(html.indexOf('// ====== помощники ======'),html.indexOf('// ====== сохранение'));
const practice=fs.readFileSync(path.join(dir,'lesson-2b.js'),'utf8');
const source=words+';'+generators+';const KEY="spidey-5b-test";'+practice;
const {questions, vocabulary}=new Function('localStorage',source+';return {questions:LESSON_QUESTIONS,vocabulary:LESSON_WORDS}')({getItem:()=>null});
assert.equal(questions.length,12);
assert.equal(vocabulary.length,15);
for(const question of questions){
  assert(question.title&&question.answer&&question.why);
  if(question.audio)assert(fs.existsSync(path.join(dir,question.audio)));
  if(question.picture)assert(fs.existsSync(path.join(dir,'img/lesson-2b',question.picture+'.webp')));
  if(question.options){
    assert.equal(new Set(question.options).size,question.options.length);
    assert(question.options.includes(question.answer));
  }
}
assert.deepEqual(questions.filter(q=>q.options?.length===4).map(q=>q.answer).sort(),['That','These','This','Those']);
const cues=JSON.parse(fs.readFileSync(path.join(dir,'space-cats/cues.json')));
for(const line of cues.lines){
  assert(line.start<line.end);
  assert(line.words.length&&line.ru);
  assert(fs.existsSync(path.join(dir,line.image)));
  assert(line.words.every(([word,time])=>word&&Number.isFinite(time)));
}
for(const [time,image] of [[29,'trainers'],[93.42,'teeth'],[97.62,'feet']]){
  assert(cues.lines.findLast(line=>line.start<=time).image.endsWith('song-'+image+'.webp'));
}
console.log('Lesson questions, four demonstrative cases, local assets and three approved song timings passed.');

// Exercise the real reporting guards with an old pending test queue.
const storageCode = html.slice(html.indexOf('// ====== сохранение'), html.indexOf('// ====== звук'));
for (const oldSave of [null, JSON.stringify({xp:222,u:{'b-words':3},t:{'b-words':12345},
  pupil:{id:'test:demo',name:'Test'},queue:[{testOnly:true}]})]) {
  const storage = new Map([['spidey-5b-v1','production-save-sentinel']]);
  if (oldSave) storage.set('spidey-5b-test',oldSave);
  const before = JSON.stringify([...storage]);
  const listeners = {};
  let requests = 0;
  const context = vm.createContext({
    LOCAL_PREVIEW:false,
    location:{search:'?test'},
    localStorage:{getItem:key=>storage.get(key) ?? null,setItem:(key,value)=>storage.set(key,value)},
    navigator:{onLine:true,sendBeacon:()=>{requests++;}},
    fetch:async()=>{requests++;return {ok:true};},
    addEventListener:(event,fn)=>{listeners[event]=fn;},
  });
  vm.runInContext(storageCode,context);
  vm.runInContext('queueResult({testOnly:true})',context);
  await vm.runInContext('flush()',context);
  await listeners.online();
  listeners.pagehide();
  assert.equal(requests,0,'Test mode attempted to send results');
  assert.equal(JSON.stringify([...storage]),before,'Test guards changed a saved result');
}
console.log('Fresh and older test saves made no fetch or beacon requests. Production storage stayed intact.');
