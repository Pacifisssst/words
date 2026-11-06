import fs from 'node:fs';
import assert from 'node:assert/strict';
const h=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const {UNITS,LINKERS}=new Function('const save={pupil:null};'+h.slice(h.indexOf('// ====== помощники ======'),h.indexOf('// ====== сохранение'))+';return {UNITS,LINKERS}')();
const u=UNITS.find(u=>u.id==='linkers'), qs=u.make();
assert.equal(qs.length,10);
assert.deepEqual(new Set(LINKERS.map(d=>d[1])),new Set(['as soon as','when','after','until','then']));
assert.equal(qs[0].book,'Ex.6 · p.19');
for(const q of qs){
 assert.equal(q.type,'build');
 assert.equal(q.right.length,3);
 assert.equal(q.accept[0],q.right.join(' '));
 assert.equal(q.tiles.length,4);
 assert.ok(q.right.every(t=>q.tiles.includes(t)));
 assert.ok(q.hint&&q.why);
}
assert.ok(UNITS.find(u=>u.boss).make().some(q=>q.qid==='linker: boss'));
console.log('Linkers: ten sentence pairs, five linkers, textbook first, boss included.');
