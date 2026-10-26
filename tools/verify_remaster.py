#!/usr/bin/env python3
"""Independent integrity/layout verification; does not infer artistic quality."""
import hashlib,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
plan=json.loads((ROOT/'assets/remaster-plan.json').read_text());run=json.loads((ROOT/'reports/remaster-run.json').read_text());manifest=json.loads((ROOT/'web/data/asset-manifest.json').read_text());frames=json.loads((ROOT/'web/data/frames.json').read_text());checks=[]
for a in plan['assets']:
    p=ROOT/a['source_path'];assert sha(p)==a['source_sha256'],a['id']+' original changed'
    im=Image.open(p).convert('RGBA');out=Image.open(ROOT/f"assets/remastered4x/{a['id']}.png").convert('RGBA')
    assert out.size==(im.width*4,im.height*4),a['id']
    assert out.getchannel('A').tobytes()==im.getchannel('A').resize(out.size,Image.Resampling.NEAREST).tobytes(),a['id']+' alpha'
    checks.append(a['id'])
for r in run['records']:
    for path_key,hash_key in [('inputPath','inputSha256'),('inferenceInputPath','inferenceInputSha256'),('rawOutputPath','rawOutputSha256'),('outputPath','outputSha256'),('baselinePath','baselineSha256')]:assert sha(ROOT/r[path_key])==r[hash_key],(r['variant'],path_key)
    assert sha(ROOT/r['modelPath'])==r['modelSha256']
    raw=Image.open(ROOT/r['rawOutputPath']).convert('RGB');out=Image.open(ROOT/r['outputPath']).convert('RGB');w,h=r['outputDimensions']
    if r['parameters'].get('perTile'):
        for tile in r['tilePasses']:
            assert sha(ROOT/tile['inputPath'])==tile['inputSha256']
            assert sha(ROOT/tile['rawPath'])==tile['rawSha256']
            traw=Image.open(ROOT/tile['rawPath']).convert('RGB');tx=tile['tile']*64
            assert traw.crop((32,32,96,96)).tobytes()==out.crop((tx,0,tx+64,64)).tobytes(),(r['variant'],tile['tile'])
    else:
        assert raw.crop((32,32,32+w,32+h)).tobytes()==out.tobytes(),r['variant']+' final RGB not identical to neural inference crop'
    assert out.tobytes()!=Image.open(ROOT/r['baselinePath']).convert('RGB').tobytes(),r['variant']+' equals nearest baseline'
for a in manifest['assets']:
    assert sha(ROOT/'web'/a['original'])==a['originalSha256'],a['id']+' runtime original'
    assert sha(ROOT/'web'/a['remastered4x'])==a['remasteredSha256'],a['id']+' runtime remaster'
    assert (ROOT/'web'/a['baseline4x']).is_file()
for k,f in frames['frames'].items():
    x,y,w,h=f['rect'];a=frames['assets'][f['asset']];assert x>=0 and y>=0 and x+w<=a['width'] and y+h<=a['height'],k
    assert f['rect4x']==[v*4 for v in f['rect']],k
for k,a in frames['animations'].items():
    assert all(f in frames['frames'] for f in a['frames']),k
    if 'offsets' in a:assert len(a['offsets'])==len(a['frames']),k
    if 'durationTicks' in a:assert len(a['durationTicks'])==len(a['frames']),k
summary={'passed':True,'originalsUnchanged':len(checks),'neuralInferenceRecords':len(run['records']),'actualAcceptedNeuralPasses':sum(r['parameters'].get('passes',1) for r in run['records']),'runtimeRemasters':len(manifest['assets']),'validCropRecords':len(frames['frames']),'playbackGroups':len(frames['animations']),'rawNeuralRgbMatchesFinal':True,'sourceAlphaExact':True,'allRuntimeHashesMatch':True,'artisticApprovalInferred':False}
(ROOT/'reports/remaster-verification.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
