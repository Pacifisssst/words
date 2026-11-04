/* Daily retrieval and activity snapshots share the game's existing local save and result queue. */
(() => {
  const DAY = 86400000, intervals = [1, 3, 7, 14, 30];
  const today = () => new Date().toLocaleDateString('en-CA', {timeZone:'Europe/Moscow'});
  const after = (day, n) => new Date(Date.parse(day+'T00:00:00Z') + n*DAY).toISOString().slice(0,10);
  const wordCount=n=>n+' '+(n%100>=11&&n%100<=14?'глаголов':n%10===1?'глагол':n%10>=2&&n%10<=4?'глагола':'глаголов');
  let session = null, lastInput = Date.now(), tickAt = Date.now(), lastCheckpoint = Date.now();
  const ensure = () => {
    save.srs ||= {};
    // Old stars seed the schedule; existing levels, points and IDs remain untouched.
    UNITS.filter(u => u.set && save.u[u.id]).forEach(u => SETS[u.set].forEach(v => {
      save.srs[v.v1] ||= {step:-1, due:today()};
    }));
  };
  function due() {
    ensure();
    return ALL.filter(v => save.srs[v.v1] && save.srs[v.v1].due <= today())
      .sort((a,b) => save.srs[a.v1].due.localeCompare(save.srs[b.v1].due));
  }
  function snapshot(complete=false, stars=0, points=null) {
    if (!session || !Object.values(session.verbs).some(v => v.tries)) return null;
    return {pupil:save.pupil, level:session.unit.id, levelName:session.unit.name,
      stars, sec:Math.floor(session.ms/1000), mist:session.mist,
      wrong:session.wrong.slice(0,40), at:session.at,
      practice:{mode:session.unit.review?'review':'learn', complete, seq:++session.seq,
        points:points ?? session.points,
        verbs:Object.values(session.verbs).filter(v=>v.tries).map(v=>({
          verb:v.verb, tries:v.tries, wrong:v.wrong, sec:Math.floor(v.ms/1000), points:v.points}))}};
  }
  function checkpoint(send=false) {
    const rec=snapshot(); if (!rec) return;
    save.activePractice=rec; store();
    if(send) queueResult(rec);
  }
  function end(complete=false, stars=0, points=null) {
    const rec=snapshot(complete,stars,points);
    if(rec) queueResult(rec);
    session=null; delete save.activePractice; store();
  }
  function begin(unit) {
    end(); ensure();
    session={unit, day:today(), at:new Date().toISOString(), ms:0, mist:0, points:0, seq:0, verbs:{}, wrong:[]};
    lastInput=tickAt=Date.now();
  }
  function question(q) {
    if(!session)return;
    lastInput=Date.now();
    if(VK[q.verb]) session.verbs[q.verb] ||= {verb:q.verb,tries:0,wrong:0,ms:0,points:0};
  }
  function answer(q, good) {
    rollover(q);
    if(!session || !VK[q.verb])return;
    const v=session.verbs[q.verb]; v.tries++;
    if(!good){v.wrong++;session.mist++;if(!session.wrong.includes(q.qid))session.wrong.push(q.qid)}
    const day=today(), st=save.srs[q.verb] ||= {step:-1,due:day};
    if(!good){st.step=0;st.due=after(day,1);st.graded=day}
    else if(st.graded!==day && st.due<=day){
      st.step=Math.min(st.step+1,intervals.length-1);st.due=after(day,intervals[st.step]);st.graded=day;
    }
    if(session.unit.review && good && st.rewardDay!==day){
      st.rewardDay=day;v.points=1;session.points++;save.xp++;
    }
    checkpoint();
  }
  function rollover(q=L?.q){
    if(session && session.day!==today()){
      const unit=session.unit;begin(unit);if(q)question(q);
    }
  }
  function tick(now=Date.now()) {
    rollover();
    const delta=Math.min(Math.max(now-tickAt,0),1500); tickAt=now;
    if(session && !document.hidden && !L?.locked && now-lastInput<60000){
      session.ms+=delta;
      const v=session.verbs[L?.q?.verb];if(v)v.ms+=delta;
    }
    if(now-lastCheckpoint>=30000){checkpoint(true);lastCheckpoint=now}
  }
  function panel() {
    const list=due(), count=Object.values(save.srs).filter(v=>v.rewardDay===today()).length;
    const next=Object.values(save.srs).map(v=>v.due).sort()[0];
    const info=list.length ? `${wordCount(list.length)} пора повторить · до 12 за подход`
      : next ? `На сегодня всё. Следующее повторение: ${next.split('-').reverse().join('.')}`
      : 'Пройди один уровень — изученные глаголы появятся здесь.';
    return `<section class="review-card"><h2>Повторение на сегодня</h2><p>${info}</p>
      <p class="review-small">Повторено сегодня: ${wordCount(count)}. Баллы: +${count}. Один балл за глагол в день.</p>
      ${list.length?'<button class="btn blue" id="daily-review">Повторить изученное</button>':''}</section>`;
  }
  function start() {
    const selected=due().slice(0,12);if(!selected.length)return home();
    const unit={id:'review',name:'Повторение на сегодня',review:true,c:'#1fa8f0',cd:'#1287c6',
      title:'Вспомни изученные глаголы',lead:'Ответь сам, затем проверь и послушай. Ошибки вернутся в конце.',
      rules:[['За правильный ответ','+1 балл за каждый глагол, один раз в день'],['Когда снова?','Через 1, 3, 7, 14 или 30 дней'],['Если ошибся','Снова завтра; сейчас попробуем ещё раз']],
      make:()=>selected.map((v,i)=>[v2Q,v3Q,formsQ][(i+Date.parse(today()+'T00:00:00Z')/DAY)%3](v))};
    save.pupil?intro(unit):askName(()=>intro(unit));
  }
  const finish=(stars,xp)=>{const review=!!session?.unit.review;end(true,stars,review?null:xp);return !review};
  window.Review7={begin,question,answer,panel,start,finish,leave:()=>end(),tick,
    seconds:()=>Math.floor((session?.ms||0)/1000), points:()=>session?.points||0,due,
    // The same clock function is driven by deterministic tests; no browser timer mocking is required.
    current:()=>session};
  for(const ev of ['pointerdown','keydown'])addEventListener(ev,()=>{lastInput=Date.now()},{passive:true});
  document.addEventListener('visibilitychange',()=>{tickAt=Date.now();if(document.hidden)checkpoint(true)});
  addEventListener('pagehide',()=>{
    checkpoint(true);
    if(!TEST && save.queue?.length)try{navigator.sendBeacon(API+'/log?key='+encodeURIComponent(SEND_KEY),
      new Blob([JSON.stringify({game:GAME,items:save.queue.slice(0,20)})],{type:'application/json'}))}catch{}
  });
  setInterval(tick,1000);
  if(save.activePractice){queueResult(save.activePractice);delete save.activePractice;store()}
  ensure();home();
})();
