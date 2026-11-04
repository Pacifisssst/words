import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=html.slice(html.indexOf('function queueResult('),html.indexOf("addEventListener('online',flush)"));
let release, requests=[];const delivered=new Map();
const ctx={TEST:false,save:{queue:[]},navigator:{onLine:true},store(){},API:'test',GAME:'eng7irr5',SEND_KEY:'test',
 fetch:async(url,opt)=>{const batch=JSON.parse(opt.body).items;requests.push(batch);if(requests.length===1)await new Promise(r=>release=r);
 for(const rec of batch){const key=rec.at+rec.level,old=delivered.get(key);if(!old||rec.practice.seq>old.practice.seq)delivered.set(key,rec)}
 return {ok:true,json:async()=>({saved:batch.length})}}};
vm.createContext(ctx);vm.runInContext(source,ctx);
const rec=(i,seq=1)=>({at:'test'+i,level:'review',pupil:{id:'test'},practice:{seq}});
ctx.queueResult(rec(0));ctx.queueResult(rec(0,2));for(let i=1;i<=25;i++)ctx.queueResult(rec(i));release();
for(let i=0;i<20&&ctx.save.queue.length;i++)await new Promise(r=>setTimeout(r,1));
assert.equal(ctx.save.queue.length,0);assert.equal(delivered.size,26);assert.equal(delivered.get('test0review').practice.seq,2);
assert(requests.every(a=>a.length<=20));
console.log('PASS: batched offline queue retains newer snapshots created during an in-flight request.');
