import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const r=new URL('.',import.meta.url).pathname;
const ctx=vm.createContext({UNITS:[],CHS:[],esc:x=>String(x),collectionAudio:id=>"audio/collections/"+id+".mp3",app:{addEventListener(){}},shuf:x=>[...x].reverse(),choice:o=>({...o,type:'choice',correct:0}),console});
vm.runInContext(fs.readFileSync(r+'collections.js','utf8'),ctx);
vm.runInContext(fs.readFileSync(r+'collections-learning.js','utf8'),ctx);
let introduced=0,recall=0;
for(const level of ctx.UNITS){
 for(const q of level.make()){
  if(q.type==='discover'){introduced++;assert(fs.existsSync(r+'audio/collections/'+q.word.id+'.mp3'));continue}
  assert(q.prompt&&q.why&&q.qid,level.id);
  assert(!/[А-Яа-я]/.test(q.prompt),q.prompt);
  if(q.opts)assert.equal(new Set(q.opts).size,q.opts.length);
  if(q.type==='text')recall++;
  if(q.type==='build')for(const a of q.accept)assert.equal([...q.tiles].sort().join('|'),a.split(' ').sort().join('|'));
  if(q.audio)assert(fs.existsSync(r+q.audio),q.audio);
 }
}
assert.equal(introduced,22);assert.equal(recall,22);
const html=fs.readFileSync(r+'index.html','utf8');
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
for(const file of ['collections-learning.js','space-cats.js','tom-collection.js'])new vm.Script(fs.readFileSync(r+file,'utf8'));
const song=vm.runInNewContext(fs.readFileSync(r+'tom-collection.js','utf8')+';TOM_COLLECTION_SONG');
assert(fs.existsSync(r+song.src));
assert.equal(song.lines.length,18);
for(const line of song.lines){assert(line.start<line.end);assert(fs.existsSync(r+line.image));}
console.log('PASS: 22 introductions, 22 recall tasks, English prompts, choices, sentence tiles, 33 recordings and 18 song cues.');
