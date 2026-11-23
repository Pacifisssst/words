'use strict';
const units=[
 {id:'music',name:'В музыкальном клубе',skill:'Listening',theme:'Слушай объявления и выбирай музыку.'},
 {id:'weekend',name:'Планы на выходные',skill:'Reading',theme:'Приглашай друзей и договаривайся о планах.'},
 {id:'city',name:'После школы',skill:'Use of English',theme:'Освой выражения для обычного разговора.'},
 {id:'time',name:'Сейчас или обычно?',skill:'Grammar',theme:'Различай привычки и события.'},
 {id:'actions',name:'Что я делаю в игре',skill:'Game actions',theme:'Запомни действия по картинкам. Расскажи, что ты делаешь в игре.'},
 {id:'opinions',name:'Почему мне нравится игра',skill:'Game opinions',theme:'Выбери фразы для рассказа о своей игре.'},
 {id:'report',name:'Слова из репортажа BBC',skill:'BBC listening',theme:'Узнай слова на слух и выбери их значение.'}
];
const app=document.getElementById('app'), status=document.getElementById('status');
const key='signal-english-progress-v1';
let state;try{state=JSON.parse(localStorage.getItem(key))||{}}catch{state={}}
state={xp:0,stars:{},mistakes:{},round:null,days:[],...state};
let vocab=[],audio,screen='home';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=arr=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const clean=s=>s.toLowerCase().replace(/[’‘]/g,"'").trim().replace(/[.!?,]/g,'').replace(/\s+/g,' ');
const btn=(t,a,cls='')=>'<button class="'+cls+'" data-act="'+a+'">'+t+'</button>';
function persist(){try{localStorage.setItem(key,JSON.stringify(state))}catch{status.textContent='Браузер не сохранил прогресс. Оставь вкладку открытой.'}document.getElementById('xp').textContent=state.xp+' XP'}
function render(html){if(audio)audio.pause();app.innerHTML=html;status.textContent='';scrollTo(0,0)}
function play(prefix,id,slow=false){if(audio)audio.pause();audio=new Audio('audio/'+prefix+id+'.mp3');audio.playbackRate=slow?.78:1;audio.play().catch(()=>{status.textContent='Запись не загрузилась. Проверь интернет и нажми ещё раз.'})}
function recommended(){const focus=new URLSearchParams(location.hash.slice(1)).get('focus');return units.find(u=>u.id===focus&&!state.stars[u.id])||units.find(u=>!state.stars[u.id])||units[0]}
function home(){
 screen='home';const next=recommended(),r=state.round,m=Object.keys(state.mistakes).length;
 render('<div class="hero"><img src="city.jpg" alt="Друзья выбирают маршрут по карте города"><section><h1>'+escape(r&&!r.done?'Продолжить урок':next.name)+'</h1><p>'+escape(r&&!r.done?'Телефон запомнил задание, на котором ты остановился.':next.theme)+'</p>'+btn(r&&!r.done?'Продолжить →':'Начать урок →',r&&!r.done?'resume':'unit-'+next.id,'primary')+'</section></div><h2>Мой маршрут</h2>'+units.map((u,i)=>'<button class="unit" data-act="unit-'+u.id+'"><span class="num">'+(state.stars[u.id]?'✓':i+1)+'</span><span><strong>'+u.name+'</strong><small>'+ (u.id==='report'?'Понимать на слух · 4 слова':u.id==='actions'||u.id==='opinions'?'Говорить · 4 выражения':'4 слова · слух, фразы и письмо')+'</small></span><i>'+(state.stars[u.id]?'★'.repeat(state.stars[u.id]):'→')+'</i></button>').join('')+'<div class="group row">'+btn('Мои ошибки · '+m,'review')+btn('Словарь со звуком','dictionary')+'</div><details class="homework"><summary>Домашнее задание</summary><p>Пройди один урок здесь и повтори трудные слова. В Duolingo выполни по одному уроку английского в три разных дня.</p><a href="https://www.duolingo.com/learn" target="_blank" rel="noopener">Открыть Duolingo</a></details><details><summary>Мои результаты</summary><p>Опыт: '+state.xp+' XP · Дней практики: '+state.days.length+'.</p>'+btn('Скачать отчёт','report')+'</details>');
}
function picture(id){
 const cue=vocab[id][4];if(!cue)return '';
 return '<figure class="memory-art"><img src="pictures/'+id+'.webp" alt="'+escape(cue)+'"><figcaption>'+escape(cue)+'</figcaption></figure>';
}
function dictionary(){screen='dict';render(btn('← Маршрут','home')+'<h1 class="sub">Словарь</h1>'+units.map(u=>'<section class="group"><h2>'+u.name+'</h2>'+vocab.map(([en,ru,phrase,skill],i)=>skill===u.skill?'<details><summary>'+escape(en)+'</summary><p>'+escape(ru)+'<br>'+escape(phrase)+'</p>'+picture(i)+'<div class="row">'+btn('▶ Слово','sound-w-'+i)+btn('▶ Фраза','sound-p-'+i)+'</div></details>':'').join('')+'</section>').join(''))}
function start(id){
 if(state.round&&!state.round.done){if(state.round.id===id){draw();return}if(!confirm('Начать другой урок? Выполненные задания уже принесли опыт.'))return}
 const unit=units.find(u=>u.id===id);
 const ids=unit?vocab.map((w,i)=>w[3]===unit.skill?i:-1).filter(i=>i>=0):Object.keys(state.mistakes).map(Number).slice(0,6);
 if(!ids.length){status.textContent='Трудных слов пока нет. Они появятся здесь после ошибки.';return}
 const q=unit?[...ids.map(i=>({id:i,kind:'learn'})),...shuffle(ids).map((i,n)=>({id:i,kind:unit.id==='report'?'hear':['hear','build','type','hear'][n]}))]:ids.map(i=>({id:i,kind:vocab[i][3]==='BBC listening'?'hear':'type'}));
 state.round={id,q,pos:0,hits:0,done:false};prepare();
}
function prepare(){const r=state.round,item=r.q[r.pos];r.feedback=null;r.typed='';r.picked=[];
 const pool=vocab.map((_,i)=>i).filter(i=>i!==item.id&&(!vocab[item.id][4]||vocab[i][3]===vocab[item.id][3]));
 r.choices=shuffle([item.id,...shuffle(pool).slice(0,3)]);
 r.tokens=shuffle(vocab[item.id][2].split(' '));persist();draw()}
function draw(){
 screen='round';const r=state.round;if(!r)return home();
 if(r.done){const speaking=r.id==='actions'||r.id==='opinions'?'<p>Теперь расскажи о своей игре вслух.</p><p class="phrase">My favourite game is …<br>I can …<br>I like it because …</p>':'';
 render('<section class="card"><div class="badge">Урок завершён</div><h1>'+r.hits+' из '+r.q.filter(x=>x.kind!=='learn').length+'</h1><p>'+(r.id==='review'?'Повторение сохранено.':'Лучшая оценка за урок: '+'★'.repeat(state.stars[r.id]))+'</p>'+speaking+btn('На маршрут','home','primary')+'</section>');return}
 const {id,kind}=r.q[r.pos],[en,ru,phrase]=vocab[id];
 let body='';
 if(kind==='learn')body='<h1 class="word">'+escape(en)+'</h1>'+picture(id)+'<p>'+escape(ru)+'</p><p class="phrase">'+escape(phrase)+'</p><div class="row">'+btn('▶ Слово','word')+btn('▶ Пример','phrase')+'</div><p></p>'+btn('Запомнил →','next','primary');
 if(kind==='hear')body='<h1>Что ты услышал?</h1><p>Послушай фразу и выбери значение знакомого выражения.</p><div class="row">'+btn('▶ Слушать','phrase','primary')+btn('Медленнее','slow')+'</div><div class="answers sub">'+r.choices.map(i=>'<button data-choice="'+i+'" '+(r.feedback?'disabled':'')+'>'+escape(vocab[i][1])+'</button>').join('')+'</div>';
 if(kind==='build')body='<h1>Собери фразу на слух</h1><p>Нажимай слова по порядку. Нажми выбранное слово, чтобы вернуть его.</p><div class="row">'+btn('▶ Слушать','phrase','primary')+btn('Медленнее','slow')+'</div><div class="chips row">'+r.picked.map((i,n)=>'<button data-undo="'+n+'" '+(r.feedback?'disabled':'')+'>'+escape(r.tokens[i])+'</button>').join('')+'</div><div class="tokens row">'+r.tokens.map((v,i)=>'<button data-token="'+i+'" '+(r.feedback||r.picked.includes(i)?'disabled':'')+'>'+escape(v)+'</button>').join('')+'</div>';
 if(kind==='type')body='<h1>Как это по-английски?</h1>'+picture(id)+'<p class="phrase">'+escape(ru)+'</p><label>Твой ответ<input id="answer" lang="en" autocomplete="off" autocorrect="off" spellcheck="false" autocapitalize="none" value="'+escape(r.typed)+'" '+(r.feedback?'disabled':'')+'></label>';
 if((kind==='type'||kind==='build')&&!r.feedback)body+='<p></p><div class="row">'+btn('Проверить','check','primary')+btn('Не помню','miss')+'</div>';
 if(r.feedback)body+='<div class="note '+(r.feedback.ok?'':'miss')+'"><strong>'+(r.feedback.ok?'Верно · +10 XP':'Запомни и попробуй ещё раз в «Моих ошибках»')+'</strong><p>'+escape(en)+' — '+escape(ru)+'<br>'+escape(phrase)+'</p>'+btn('▶ Послушать','phrase')+'</div><p></p>'+btn('Дальше →','next','primary');
 render('<div class="bar">'+btn('←','home')+'<progress value="'+r.pos+'" max="'+r.q.length+'"></progress><span>'+(r.pos+1)+' / '+r.q.length+'</span></div><section class="card">'+body+'</section>');
}
function mark(ok){const r=state.round;if(r.feedback)return;const {id}=r.q[r.pos];r.feedback={ok};if(ok){r.hits++;state.xp+=10;delete state.mistakes[id]}else state.mistakes[id]=true;persist();draw()}
function next(){const r=state.round;if(++r.pos===r.q.length){r.done=true;const total=r.q.filter(x=>x.kind!=='learn').length;
 if(r.id!=='review')state.stars[r.id]=Math.max(state.stars[r.id]||0,r.hits===total?3:r.hits*2>=total?2:1);
 const today=new Date().toLocaleDateString('en-CA');if(!state.days.includes(today))state.days.push(today);persist();draw()}else prepare()}
function report(){const content=['Signal English',state.xp+' XP',...units.map(u=>u.name+' · '+(state.stars[u.id]||0)+'/3 ★'),'Повторить: '+Object.keys(state.mistakes).map(i=>vocab[i][0]).join(', ')].join('\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='signal-english.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
app.onclick=e=>{
 const b=e.target.closest('button');if(!b)return;const a=b.dataset.act,r=state.round;
 if(b.hasAttribute('data-choice'))return mark(Number(b.dataset.choice)===r.q[r.pos].id);
 if(b.hasAttribute('data-token')||b.hasAttribute('data-undo')){if(b.hasAttribute('data-token'))r.picked.push(Number(b.dataset.token));else r.picked.splice(Number(b.dataset.undo),1);persist();draw();return}
 if(a.startsWith('unit-'))return start(a.slice(5));if(a.startsWith('sound-')){const [,p,i]=a.split('-');return play(p,i)}
 if(a==='home')return home();if(a==='resume')return draw();if(a==='review')return start('review');if(a==='dictionary')return dictionary();if(a==='report')return report();
 const item=r.q[r.pos];if(['word','phrase','slow'].includes(a))return play(a==='word'?'w':'p',item.id,a==='slow');
 if(a==='check'){const guess=item.kind==='build'?r.picked.map(i=>r.tokens[i]).join(' '):r.typed;if(!guess.trim()){status.textContent='Сначала составь или введи ответ.';return}return mark(clean(guess)===clean(vocab[item.id][item.kind==='build'?2:0]))}
 if(a==='miss')return mark(false);if(a==='next')next()
};
app.oninput=e=>{if(e.target.id==='answer'){state.round.typed=e.target.value;persist()}};
app.onkeydown=e=>{if(e.key==='Enter'&&e.target.id==='answer')app.querySelector('[data-act=check]')?.click()};
fetch('words.json?v=picture-words').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{vocab=data;persist();home()}).catch(()=>{app.textContent='Не удалось загрузить слова. Обнови страницу.'});
