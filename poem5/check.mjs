// node check.mjs — генерирует все задания много раз и ищет пустое, дубли вариантов, несобираемые строки, нет mp3
import fs from 'fs';
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const js=html.slice(html.indexOf('// ====== помощники ======'),html.indexOf('// ====== сохранение'));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let bad=0,n=0;const err=m=>{bad++;if(bad<30)console.log('✗',m)};
for(const pk of ['a','b']){
const ls={getItem:()=>null,setItem:()=>{}};
const env=new Function('esc','location','localStorage',js.replace(/^const esc=.*$/m,'')+';return {UNITS,POEM,W,RHYMES,plain,TITLE};')(esc,{search:'?p='+pk},ls);
const {UNITS,POEM,W,plain,TITLE}=env;console.log('стих',pk,TITLE,POEM.length,'строк');
const has=f=>fs.existsSync(new URL('./'+f,import.meta.url));
for(const k in W)if(!has('audio/w-'+k+'.mp3'))err('нет звука слова '+k);
POEM.forEach(l=>{if(!has(l.audio))err('нет '+l.audio);if(!has(l.slow))err('нет '+l.slow);
  if(plain(l.b.join(' '))!==plain(l.en))err('плитки не собирают строку '+l.n+': '+l.b.join(' ')+' ≠ '+plain(l.en));
  l.g.forEach(([a])=>{if(!l.en.includes(a))err('пропуск «'+a+'» не найден в строке '+l.n)});});
for(let r=0;r<400;r++)for(const u of UNITS){if(u.screen)continue;const qs=u.make();
  if(!qs.length)err(u.id+' пусто');
  for(const q of qs){n++;
    if(!q.why||/undefined|NaN/.test(JSON.stringify(q)))err(u.id+' undefined/NaN '+q.qid);
    if(q.type==='choice'){if(new Set(q.opts).size!==q.opts.length)err(u.id+' дубли вариантов '+q.qid+' '+q.opts);
      if(q.correct<0)err(u.id+' нет верного '+q.qid);
      if(q.gap&&q.gap.includes('___')&&q.opts.some((o,i)=>i!==q.correct&&q.gap.replace('___',o)===q.gap.replace('___',q.opts[q.correct])))err('два верных '+q.qid);
      if(q.gap&&/___/.test(q.gap)===false&&q.qid.startsWith('пропуск'))err('пропуск не спрятан '+q.qid);}
    if(q.type==='build'){const t=[...q.tiles];for(const w of q.right){const i=t.indexOf(w);if(i<0){err('нет плитки '+w);break}t.splice(i,1)}
      if(q.tiles.length!==q.right.length)err('лишние плитки '+q.qid);}
    if(q.audio&&!has(q.audio))err('нет '+q.audio);}}
}
console.log(bad?`✗ ${bad} проблем`:`✓ ${n} заданий, всё чисто`);process.exit(bad?1:0);
