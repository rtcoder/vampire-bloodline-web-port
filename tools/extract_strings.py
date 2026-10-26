#!/usr/bin/env python3
"""Recover Strings.class data from actual fields and <clinit>, without Java."""
import json
import struct
import sys
import zipfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from verify_english import ROOT,EN,ES,parse_class,sha

class Reader:
    def __init__(self,raw):self.raw=raw;self.pos=0
    def u2(self):value=struct.unpack_from('>H',self.raw,self.pos)[0];self.pos+=2;return value
    def u4(self):value=struct.unpack_from('>I',self.raw,self.pos)[0];self.pos+=4;return value
    def take(self,n):value=self.raw[self.pos:self.pos+n];self.pos+=n;return value

def extract_strings(raw):
    parsed=parse_class(raw);cp=parsed['pool'];r=Reader(parsed['body']);r.take(6)
    r.take(2*r.u2())
    def utf(index):return cp[index]['value']
    def attrs():
        result={}
        for _ in range(r.u2()):
            name=utf(r.u2());size=r.u4();result[name]=r.take(size)
        return result
    result={}
    for _ in range(r.u2()):
        access=r.u2();name=utf(r.u2());desc=utf(r.u2());attributes=attrs()
        if 'ConstantValue' in attributes:
            index=int.from_bytes(attributes['ConstantValue'],'big')
            assert cp[index]['tag']==8
            result[name]=utf(int(cp[index]['value'],16))
    code=None
    for _ in range(r.u2()):
        access=r.u2();name=utf(r.u2());desc=utf(r.u2());attributes=attrs()
        if name=='<clinit>':
            c=Reader(attributes['Code']);c.take(4);code=c.take(c.u4())
    if code is None:raise ValueError('Strings.class missing initializer')
    stack=[];p=0
    while p<len(code):
        op=code[p];p+=1
        if 2<=op<=8:stack.append(op-3)
        elif op==16:
            v=code[p];p+=1;stack.append(v-256 if v>=128 else v)
        elif op in (18,19):
            n=1 if op==18 else 2;index=int.from_bytes(code[p:p+n],'big');p+=n
            if cp[index]['tag']!=8:raise ValueError('non-string ldc in Strings')
            stack.append(utf(int(cp[index]['value'],16)))
        elif op==189:
            p+=2;stack.append([None]*stack.pop())
        elif op==89:stack.append(stack[-1])
        elif op==83:
            val=stack.pop();index=stack.pop();array=stack.pop();array[index]=val
        elif op==179:
            index=int.from_bytes(code[p:p+2],'big');p+=2
            ref=bytes.fromhex(cp[index]['value']);nt=int.from_bytes(ref[2:4],'big')
            nameidx=int.from_bytes(bytes.fromhex(cp[nt]['value'])[:2],'big')
            result[utf(nameidx)]=stack.pop()
        elif op==177:break
        else:raise ValueError(f'unsupported Strings initializer opcode {op:02x} at {p-1}')
    if stack:raise ValueError('nonempty initializer stack')
    return result

def make_json(raw,language):
    values=extract_strings(raw)
    return {'schemaVersion':1,'language':language,'sourceClassSha256':sha(raw),
            'ruleString':values['ruleString'],'cutString':values['cutString'],
            'creditString':values['creditString'],
            'ui':{k:v for k,v in values.items() if k.startswith('String')},
            'translationCredit':'English translation by Lanzz (2021), for Kahvibreak' if language=='en' else None}

def main():
    for language,jar_path in [('es',ES),('en',EN)]:
        with zipfile.ZipFile(jar_path) as jar:
            result=make_json(jar.read('Strings.class'),language)
            pool=parse_class(jar.read('mainCanvas.class'))['pool']
            names={827:'loading',828:'loadingGraphics',829:'title',831:'help',832:'soundOn',833:'soundOff',834:'mainMenu',835:'play',836:'options',837:'exitGame',838:'credits',842:'creditsTitle',843:'story',844:'generalHelp',845:'playerControls',846:'continue',851:'restartQuestion',852:'resetGame'}
            result['runtimeUI']={name:pool[index]['value'] for index,name in names.items()}
        (ROOT/'web/data'/f'strings-{language}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('Extracted ES and EN Strings.class: 4 help sections, 16 cutscene arrays, credits, 22 UI constants plus 18 runtime UI literals each')
if __name__=='__main__':main()
