const fs=require('fs');const [src,out,dir]=process.argv.slice(2);
const S=new Function(fs.readFileSync(src,'utf8')+';return SONG5')();const b=S.bday;
const map=p=>{let m;
  if(m=p.match(/^img\/b2b\/(.+)\.jpg$/))return 'img/w/2b/'+(m[1]==='bike'?'bicycle':m[1])+'.webp';
  if(m=p.match(/^img\/count\/(.+)\.jpg$/))return 'img/w/2b/n/'+m[1]+'.webp';
  if(m=p.match(/^img\/scenes\/(.+)\.jpg$/))return 'img/w/song/'+m[1]+'.webp';
  throw new Error('нет картинки '+p)};
const lines=b.lines.map(l=>{const o={t:l.t,t1:l.t1,sec:l.sec,ru:l.ru,img:map(l.img[0]),w:l.w.map(([x,c,t])=>c?[x,t,1]:[x,t])};
  if(l.ph&&l.ph.length)o.ph=l.ph.map(([t,a])=>[t,map(a[0])]);return o});
lines.forEach(l=>[l.img,...(l.ph||[]).map(p=>p[1])].forEach(p=>{if(!fs.existsSync(dir+'/'+p))throw new Error('нет файла '+p)}));
fs.writeFileSync(out,`// Песня «${b.title}» (урок 20.10, 5Б). Собрано из song.data.js урока скриптом — руками не править.
// mp3 — ../5m2b/5b/song.mp3 (та же песня, что audio/song/birthday.mp3 урока, 151 с).
// w: [слово, время, 1 = считаемое слово («two bikes»)]; ph: [время, картинка] — картинка меняется на слове.
const SONG2B=${JSON.stringify({title:b.title,src:'../5m2b/5b/song.mp3',cover:map(b.cover),end:b.end,lines})};
`);console.log(lines.length,'строк',fs.statSync(out).size,'байт');
