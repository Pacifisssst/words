#!/usr/bin/env python3
# Голос главы 2b: edge-tts Sonia -8% → audio/2b/<ключ>.mp3 и <ключ>-p.mp3 (множественное).
# python3 voice-2b.py [ключ ...] — переписать только эти файлы.
import subprocess,sys
from pathlib import Path
A=Path(__file__).resolve().parent/'audio'/'2b';A.mkdir(parents=True,exist_ok=True)
W={'bicycle':('bicycle','bicycles'),'bike':('bike','bikes'),'camera':('digital camera','digital cameras'),
 'handbag':('handbag','handbags'),'helmet':('helmet','helmets'),'present':('present','presents'),
 'scarf':('scarf','scarves'),'skateboard':('skateboard','skateboards'),'trainers':('trainer','trainers'),
 'child':('child','children'),'foot':('foot','feet'),'man':('man','men'),'mouse':('mouse','mice'),
 'tooth':('tooth','teeth'),'woman':('woman','women'),'knife':('knife','knives')}
force=set(sys.argv[1:])
def rec(t,out):
  if out.exists() and out.stem.split('-')[0] not in force:return
  subprocess.run(['python3','-m','edge_tts','-v','en-GB-SoniaNeural','--rate=-8%','-t',t[0].upper()+t[1:]+'.','--write-media',str(out)],check=True)
for k,(s,p) in W.items():
  rec(s,A/f'{k}.mp3');rec(p,A/f'{k}-p.mp3')
print('ok',len(list(A.glob('*.mp3'))))
