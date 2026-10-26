#!/usr/bin/env python3
"""Independent read-only comparison; never changes the pinned Spanish source."""
import hashlib
import json
import struct
import zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ES=ROOT/'source/vampire-bloodline-176x208.jar'
EN=ROOT/'source-packages/extra/vampire-bloodline-extra-jars/jars/vampire-bloodline-176-en-patch.jar'
ES_SHA='ebe705c790f989af9b81c698b2f794fdac88266e75a6b704b9fbcbe94f631ab8'
EN_SHA='05f8efed4397eb5530acba56f7a98e82ba88d538a2eb1e57d08ec669f37cf1c4'

def sha(raw):return hashlib.sha256(raw).hexdigest()

def parse_class(raw):
    if raw[:4]!=b'\xca\xfe\xba\xbe':raise ValueError('not a Java class')
    count=struct.unpack_from('>H',raw,8)[0];pos=10;pool=[None]*count;i=1
    lengths={3:4,4:4,5:8,6:8,7:2,8:2,9:4,10:4,11:4,12:4,15:3,16:2,17:4,18:4,19:2,20:2}
    while i<count:
        tag=raw[pos];pos+=1
        if tag==1:
            size=struct.unpack_from('>H',raw,pos)[0];pos+=2
            # Modified UTF-8 differs for NUL and surrogate pairs. The game has
            # neither surrogate strings nor NUL literals; support MUTF8 NUL too.
            value=raw[pos:pos+size].replace(b'\xc0\x80',b'\0').decode('utf-8');pos+=size
        else:
            if tag not in lengths:raise ValueError(f'unsupported constant-pool tag {tag}')
            size=lengths[tag];value=raw[pos:pos+size].hex();pos+=size
        pool[i]={'tag':tag,'value':value}
        i+=2 if tag in (5,6) else 1
    return {'pool':pool,'bodyOffset':pos,'body':raw[pos:]}

def verify():
    errors=[]
    result={'status':'failed','esSha256':sha(ES.read_bytes()),'enSha256':sha(EN.read_bytes()),'errors':errors}
    if result['esSha256']!=ES_SHA:errors.append('Spanish JAR hash mismatch')
    if result['enSha256']!=EN_SHA:errors.append('English JAR hash mismatch')
    with zipfile.ZipFile(ES) as es,zipfile.ZipFile(EN) as en:
        a={x for x in es.namelist() if not x.endswith('/')};b={x for x in en.namelist() if not x.endswith('/')}
        result['entryCounts']={'es':len(a),'en':len(b)}
        result['added']=sorted(b-a);result['removed']=sorted(a-b)
        if len(a)!=60 or a!=b:errors.append('JAR entry sets differ')
        changes=sorted(n for n in a&b if es.read(n)!=en.read(n));result['changedEntries']=changes
        if changes!=['Strings.class','background.png','mainCanvas.class']:errors.append('Unexpected changed entries')
        result['unchangedEntries']=sorted(a&b-set(changes))
        result['members']=[{'name':n,'esSha256':sha(es.read(n)),'enSha256':sha(en.read(n)),'equal':es.read(n)==en.read(n)} for n in sorted(a&b)]
        old=parse_class(es.read('mainCanvas.class'));new=parse_class(en.read('mainCanvas.class'))
        cpchanges=[];nontext=[]
        for i,(x,y) in enumerate(zip(old['pool'],new['pool'])):
            if x!=y:
                if x and y and x['tag']==y['tag']==1:cpchanges.append({'index':i,'es':x['value'],'en':y['value']})
                else:nontext.append(i)
        same=old['body']==new['body']
        result['mainCanvas']={'utf8Changes':cpchanges,'nonUtf8Changes':nontext,'constantPoolCountsEqual':len(old['pool'])==len(new['pool']),
            'postConstantPoolEqual':same,'esBodyOffset':old['bodyOffset'],'enBodyOffset':new['bodyOffset'],
            'bodyBytes':len(old['body']),'bodySha256':sha(old['body'])}
        if len(cpchanges)!=18 or nontext or not same or len(old['pool'])!=len(new['pool']):errors.append('mainCanvas patch exceeds the expected 18 text changes')
        result['crc']={'es':es.testzip(),'en':en.testzip()}
        if any(result['crc'].values()):errors.append('ZIP CRC mismatch')
    result['status']='failed' if errors else 'passed';return result

def main():
    result=verify();print(json.dumps(result,ensure_ascii=False,indent=2));return int(result['status']!='passed')
if __name__=='__main__':raise SystemExit(main())
