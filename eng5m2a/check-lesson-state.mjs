import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('lesson-state.js',import.meta.url),'utf8');
const release='2026-11-12';
const server=new Map();
let requests=0;
function client(id,{test=false,online=true}={}) {
  const storage=new Map();
  const listeners={};
  const save={pupil:{id},lessonSession:{id,token:id},xp:222,u:{bag:3,'b-words':2},t:{bag:12345},queue:[]};
  const before=JSON.stringify(save);
  const context=vm.createContext({
    KEY:test?'spidey-5b-test':'spidey-5b-v1', TEST:test, GAME:'eng5m2a',API:'http://local',
    LESSON_RELEASE:{id:release,chapter:'2b-12nov'},save,
    navigator:{onLine:online},AbortController,setTimeout,clearTimeout,
    document:{addEventListener(){}},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    app:{querySelectorAll:()=>[]},addEventListener:(event,fn)=>listeners[event]=fn,store(){},
    fetch:async(url,options)=>{
      requests++;
      const pupil=options.headers.authorization.replace('Bearer ','');
      if(options.method==='POST')server.set(pupil,[JSON.parse(options.body).release]);
      return {ok:true,status:200,json:async()=>({seen:server.get(pupil)||[]})};
    },
  });
  vm.runInContext(source,context);
  return {run:code=>vm.runInContext(code,context),save,before,listeners,storage,context};
}
const a=client('a'),b=client('a'),other=client('b');
assert.equal(a.run(`hasSeenLesson('${release}')`),false);
a.run(`saveSeenLesson('${release}')`);
await a.run('syncLessonState()');
await b.run('syncLessonState()');
assert.equal(b.run(`hasSeenLesson('${release}')`),true);
await other.run('syncLessonState()');
assert.equal(other.run(`hasSeenLesson('${release}')`),false);
for(const c of [a,b,other])assert.equal(JSON.stringify(c.save),c.before,'Sync changed level progress');
const offline=client('offline',{online:false});
offline.run(`saveSeenLesson('${release}')`);
await offline.run('syncLessonState()');
assert(!server.has('offline'));
offline.context.navigator.onLine=true;
await offline.listeners.online();
assert.deepEqual(server.get('offline'),[release]);
const test=client('test',{test:true});
const beforeRequests=requests;
test.run(`saveSeenLesson('${release}')`);
await test.run('syncLessonState()');
await test.listeners.online();
assert.equal(requests,beforeRequests);
assert.equal(JSON.stringify(test.save),test.before);
assert(test.storage.has('spidey-5b-test-lesson-seen'));
assert(!test.storage.has('spidey-5b-v1-lesson-seen'));
assert.equal(test.run("hasSeenLesson('future-release')"),false);
console.log('PASS: per-pupil badge clearing, two devices, offline retry, future releases, test isolation and unchanged level saves.');
