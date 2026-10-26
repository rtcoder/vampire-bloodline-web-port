#!/usr/bin/env python3
"""Reproduce mainCanvas.loadMap/loadCol's signed header and unsigned columns."""
import hashlib
import json
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EN_JAR=ROOT/'source-packages/extra/vampire-bloodline-extra-jars/jars/vampire-bloodline-176-en-patch.jar'

def signed(value): return value-256 if value>=128 else value

def decode_map(raw, name):
    if len(raw)<2: raise ValueError('truncated map header')
    tileset, count=map(signed,raw[:2])
    if tileset<0 or count<=0: raise ValueError('invalid signed map header')
    offset=2+3*count
    if len(raw)<offset: raise ValueError('truncated descriptors')
    descriptors=[[signed(v) for v in raw[i:i+3]] for i in range(2,offset,3)]
    cells=list(raw[offset:])
    if not cells or len(cells)%16: raise ValueError('truncated column: expected 16 cells')
    if any(v>=count for v in cells): raise ValueError('invalid descriptor index')
    start=[];exits=[];spawns=[]
    for i,index in enumerate(cells):
        x,y=divmod(i,16);graphic,collision,effect=descriptors[index]
        position={'x':x,'y':y}
        if collision==7: start.append(position)
        if collision==8: exits.append(position)
        if collision!=7 and 10<=graphic<37: spawns.append(dict(position,type=graphic))
    return {'id':name,'chapter':int(name[1]),'stage':int(name[2]),'tileset':tileset+1,
            'width':len(cells)//16,'height':16,'descriptors':descriptors,'cells':cells,
            'start':start[0] if start else None,'starts':start,'exits':exits,'spawns':spawns,
            'sha256':hashlib.sha256(raw).hexdigest(),'sourcePath':name}

def main():
    levels=[]
    with zipfile.ZipFile(EN_JAR) as jar:
        for chapter in range(1,6):
            for stage in range(1,4):
                name=f'm{chapter}{stage}'
                levels.append(decode_map(jar.read(name),name))
    result={'schemaVersion':1,'cellSize':16,'height':16,'order':'column-major',
            'sourceJar':str(EN_JAR.relative_to(ROOT)),'levels':levels}
    target=ROOT/'web/data/levels.json';target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
    print(f'Wrote {len(levels)} maps: {sum(len(x["cells"]) for x in levels)} cells')

if __name__=='__main__':main()
