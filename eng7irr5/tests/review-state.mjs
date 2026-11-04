import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const h=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const data=new Function('const save={pupil:null};'+h.slice(h.indexOf('// ====== помощники ======'),h.indexOf('// ====== сохранение'))+';return {UNITS,ALL,VK,SETS,v2Q,v3Q,formsQ}')();
let now=Date.parse('2026-11-05T10:00:00Z');class Clock extends Date{constructor(...a){super(...(a.length?a:[now]))}static now(){return now}}
const saved={xp:100,u:{set1:3},pupil:{id:'test',name:'Тест'},queue:[]}, records=[];
const ctx={...data,Date:Clock,save:saved,store(){},queueResult:r=>records.push(r),home(){},intro(){},askName(){},TEST:true,
 document:{hidden:false,addEventListener(){}},navigator:{},addEventListener(){},setInterval(){},L:null,window:{}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../review.js',import.meta.url),'utf8'),ctx);
const r=ctx.window.Review7;assert.equal(r.due().length,10);assert.equal(saved.xp,100);assert.equal(saved.u.set1,3);
const unit={id:'review',name:'Повторение',review:true};const q={verb:'go',qid:'V2: go'};
r.begin(unit);ctx.L={q,locked:false};r.question(q);now+=1000;r.tick(now);assert.equal(r.seconds(),1);
r.answer(q,true);assert.equal(saved.xp,101);assert.equal(saved.srs.go.due,'2026-11-06');r.answer(q,true);assert.equal(saved.xp,101);
ctx.document.hidden=true;now+=1000;r.tick(now);assert.equal(r.seconds(),1);ctx.document.hidden=false;
now+=61000;r.tick(now);assert.equal(r.seconds(),1);r.leave();assert.equal(records.at(-1).practice.complete,false);
now=Date.parse('2026-11-06T10:00:00Z');r.begin(unit);r.question(q);r.answer(q,true);assert.equal(saved.srs.go.due,'2026-11-09');assert.equal(saved.xp,102);
r.answer(q,false);assert.equal(saved.srs.go.due,'2026-11-07');assert.equal(saved.srs.go.step,0);r.answer(q,true);assert.equal(saved.xp,102);
r.finish(2,100);assert.equal(records.at(-1).practice.complete,true);assert.equal(records.at(-1).practice.points,1);assert.equal(saved.u.set1,3);assert(!saved.u.review);
assert(records.every(x=>Number.isInteger(x.practice.seq)&&x.practice.seq>0));
console.log('PASS: old progress, 1/3-day scheduling, lapse, one reward/day, active time, partial and complete snapshots.');

// Longer intervals, early practice and midnight rollover must not reset old level stars.
r.leave();
for(const delay of [1,3,7,14,30,30]){
 const word={verb:'see',qid:'V2: see'};r.begin(unit);ctx.L={q:word,locked:false};r.question(word);r.answer(word,true);
 const expected=new Date(now+delay*86400000).toISOString().slice(0,10);
 assert.equal(saved.srs.see.due,expected);r.leave();now=Date.parse(expected+'T10:00:00Z');
}
now=Date.parse('2026-12-01T20:59:59Z');r.begin(unit);ctx.L={q,locked:false};r.question(q);r.answer(q,true);
now+=2000;r.tick(now);r.question(q);r.answer(q,true);r.leave();
assert.equal(records.at(-1).at.slice(0,10),'2026-12-01');
assert.equal(new Date(records.at(-1).at).toLocaleDateString('en-CA',{timeZone:'Europe/Moscow'}),'2026-12-02');
console.log('PASS: 1/3/7/14/30-day progression and Moscow midnight sessions.');
