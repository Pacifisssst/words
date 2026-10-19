#!/usr/bin/env python3
# Голос стиха: Aura-2 pandora (британский), запасной путь — edge-tts Sonia (python3 voice-build.py edge)
import json,subprocess,tomllib,sys
from pathlib import Path
D=Path(__file__).resolve().parent;A=D/'audio';A.mkdir(exist_ok=True)
LINES=["I have got a pencil case,","I have got a happy face!","I have got a book that's blue,","And a pen, and homework too!",
"Yesterday I got a two,","Now I know what I must do:","Read and learn and say it right,","Get a five! Oh, what a sight!"]
WORDS={'i':'I','havegot':'have got','a':'a','pencilcase':'pencil case','happy':'happy','face':'face','book':'book',"thats":"that's",
'blue':'blue','and':'and','pen':'pen','homework':'homework','too':'too','yesterday':'yesterday','got':'got','two':'two',
'now':'now','know':'know','what':'what','must':'must','do':'Do!','read':'read','learn':'learn','say':'say','it':'it',
'right':'right','get':'get','five':'five','oh':'oh','whatasight':'what a sight','sight':'sight'}
EDGE=len(sys.argv)>1 and sys.argv[1]=='edge'
URL='https://api.cloudflare.com/client/v4/accounts/72812f8266a49c7833b29dcdc1738cc3/ai/run/@cf/deepgram/aura-2-en'
def rec(text,out,force=False):
  if out.exists() and not force:return
  if EDGE:
    subprocess.run(['python3','-m','edge_tts','-v','en-GB-SoniaNeural','--rate=-8%','-t',text,'--write-media',str(out)],check=True);return
  token=tomllib.load((Path.home()/'Library/Preferences/.wrangler/config/default.toml').open('rb'))['oauth_token']
  r=subprocess.run(['curl','-sS','--max-time','90','-X','POST',URL,'-H',f'Authorization: Bearer {token}','-H','Content-Type: application/json','--data-binary','@-'],
    input=json.dumps({'text':text,'speaker':'pandora'}).encode(),capture_output=True)
  if r.returncode or not (r.stdout[:3]==b'ID3' or r.stdout[:2] in (b'\xff\xf3',b'\xff\xfb')):
    raise SystemExit('Voice service failed: '+r.stdout[:250].decode(errors='replace'))
  out.write_bytes(r.stdout)
force=set(sys.argv[2:])
for i,t in enumerate(LINES,1):rec(t,A/f'l{i}.mp3','l%d'%i in force)
for k,t in WORDS.items():rec((t[0].upper()+t[1:]+('' if t.endswith('!') else '.')) if k!='a' else 'a.',A/f'w-{k}.mp3','w-'+k in force)
def ff(*a):subprocess.run(['ffmpeg','-v','error','-y',*a],check=True)
# медленные строки (для повтора), весь стих одним файлом
for i in range(1,9):ff('-i',str(A/f'l{i}.mp3'),'-filter:a','atempo=0.8','-ar','24000','-ac','1','-b:a','64k',str(A/f'l{i}s.mp3'))
gap=A/'_gap.mp3';ff('-f','lavfi','-i','anullsrc=r=24000:cl=mono','-t','0.6','-c:a','libmp3lame',str(gap))
lst=A/'_list.txt';lst.write_text(''.join(f"file '{A}/l{i}.mp3'\nfile '{gap}'\n" for i in range(1,9)))
ff('-f','concat','-safe','0','-i',str(lst),'-ar','24000','-ac','1','-c:a','libmp3lame','-b:a','64k',str(A/'poem.mp3'))
gap.unlink();lst.unlink()
print('ok')
