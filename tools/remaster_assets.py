#!/usr/bin/env python3
"""Actual pretrained FSRCNN x4 inference, source-alpha normalization, provenance."""
import argparse,datetime,hashlib,json,shutil
from pathlib import Path
import cv2
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
def upscale(source,asset_id,sr,out_name=None):
    if asset_id.startswith("tiles"):return upscale_tiles(source,asset_id,sr,out_name)
    out_name=out_name or asset_id
    original=Image.open(source).convert('RGBA');rgba=np.array(original);rgb=rgba[:,:,:3].copy();a=rgba[:,:,3]
    # Palette transparency includes arbitrary RGB (e.g. magenta). Extend visible
    # colors into transparent space before neural inference to avoid color halos.
    if np.any(a==0) and np.any(a>0):
        missing=np.uint8(a==0)
        _,labels=cv2.distanceTransformWithLabels(missing,cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
        palette=rgb[a>0]
        rgb[missing>0]=palette[labels[missing>0]-1]
    tiled=asset_id.startswith('tiles')
    pad=8
    padded=np.pad(rgb,((pad,pad),(pad,pad),(0,0)),mode='wrap' if tiled else 'edge')
    inp=ROOT/f'assets/ai-inputs/{out_name}.png';Image.fromarray(padded).save(inp)
    bgr=cv2.cvtColor(padded,cv2.COLOR_RGB2BGR)
    inferred=sr.upsample(bgr)
    inferred=cv2.cvtColor(inferred,cv2.COLOR_BGR2RGB)
    raw=ROOT/f'assets/ai-raw/{out_name}-fsrcnn.png';Image.fromarray(inferred).save(raw)
    p=pad*4
    cropped=inferred[p:p+original.height*4,p:p+original.width*4]
    alpha=original.getchannel('A').resize((original.width*4,original.height*4),Image.Resampling.NEAREST)
    final=Image.fromarray(cropped);final.putalpha(alpha)
    out=ROOT/f'assets/remastered4x/{out_name}.png';final.save(out)
    baseline=original.resize(final.size,Image.Resampling.NEAREST);baseline_path=ROOT/f'assets/baseline4x/{out_name}.png';baseline.save(baseline_path)
    diff=np.abs(np.array(final).astype(float)-np.array(baseline).astype(float))[:,:,:3];visible=np.array(alpha)>0
    rec={'id':asset_id,'variant':out_name,'inputPath':str(source.relative_to(ROOT)),'inputSha256':sha(source),'inputDimensions':list(original.size),'tool':'OpenCV dnn_superres.DnnSuperResImpl.upsample','toolVersion':cv2.__version__,'model':'FSRCNN x4 (Saafke/FSRCNN_Tensorflow)','modelVersion':None,'modelSha256':sha(ROOT/'tools/models/FSRCNN_x4.pb'),'modelPath':'tools/models/FSRCNN_x4.pb','prompt':None,'seed':None,'parameters':{'algorithm':'fsrcnn','scale':4,'backend':'OpenCV DNN CPU','threads':1},'preprocessing':['RGBA conversion respecting palette transparency','nearest visible RGB extension into transparent pixels (distanceTransformWithLabels)','8 source pixels '+('wrapped' if tiled else 'replicate')+' padding; complete atlas processed in one inference'],'inferenceInputPath':str(inp.relative_to(ROOT)),'inferenceInputSha256':sha(inp),'rawOutputPath':str(raw.relative_to(ROOT)),'rawOutputSha256':sha(raw),'rawDimensions':[inferred.shape[1],inferred.shape[0]],'normalization':['remove uniform 32 output pixels of inference context on each side','restore original alpha enlarged with nearest-neighbor; RGB remains 100% neural output, no baseline RGB blend'],'outputPath':str(out.relative_to(ROOT)),'outputSha256':sha(out),'outputDimensions':list(final.size),'baselinePath':str(baseline_path.relative_to(ROOT)),'baselineSha256':sha(baseline_path),'checks':{'exact4x':final.size==(original.width*4,original.height*4),'alphaMatchesSource4x':np.array_equal(np.array(final)[:,:,3],np.array(alpha)),'visibleRgbMeanAbsoluteDifferenceFromNearest':float(diff[visible].mean()),'visibleRgbChangedPixelCount':int(np.any(diff>0,axis=2)[visible].sum())},'status':'ai_generated_unreviewed','review':None}
    (ROOT/f'reports/remaster/{out_name}.json').write_text(json.dumps(rec,indent=2)+'\n')
    return rec

def upscale_tiles(source,asset_id,sr,out_name=None):
    name=out_name or asset_id; original=Image.open(source).convert('RGBA');w,h=original.size;count=w//16
    assert h==16 and w%16==0
    inpdir=ROOT/f'assets/ai-inputs/{name}';rawdir=ROOT/f'assets/ai-raw/{name}';inpdir.mkdir(exist_ok=True);rawdir.mkdir(exist_ok=True)
    final=Image.new('RGBA',(w*4,h*4));input_montage=Image.new('RGB',(count*32,32));raw_montage=Image.new('RGB',(count*128,128));passes=[]
    for t in range(count):
        tile=original.crop((t*16,0,(t+1)*16,16));rgb=np.array(tile.convert('RGB'));a=np.array(tile.getchannel('A'))
        if np.any(a==0) and np.any(a>0):
            missing=np.uint8(a==0);_,labels=cv2.distanceTransformWithLabels(missing,cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL);palette=rgb[a>0];rgb[missing>0]=palette[labels[missing>0]-1]
        padded=np.pad(rgb,((8,8),(8,8),(0,0)),mode='wrap');inp=inpdir/f'tile-{t:02}.png';Image.fromarray(padded).save(inp)
        rawrgb=cv2.cvtColor(sr.upsample(cv2.cvtColor(padded,cv2.COLOR_RGB2BGR)),cv2.COLOR_BGR2RGB);raw=rawdir/f'tile-{t:02}.png';Image.fromarray(rawrgb).save(raw)
        crop=Image.fromarray(rawrgb[32:96,32:96]);crop.putalpha(tile.getchannel('A').resize((64,64),Image.Resampling.NEAREST));final.paste(crop,(t*64,0))
        input_montage.paste(Image.fromarray(padded),(t*32,0));raw_montage.paste(Image.fromarray(rawrgb),(t*128,0))
        passes.append({'tile':t,'sourceRect':[t*16,0,16,16],'inputPath':str(inp.relative_to(ROOT)),'inputSha256':sha(inp),'rawPath':str(raw.relative_to(ROOT)),'rawSha256':sha(raw),'rawDimensions':[128,128],'normalizationCrop':[32,32,64,64],'destinationRect':[t*64,0,64,64]})
    inp=ROOT/f'assets/ai-inputs/{name}-tile-montage.png';input_montage.save(inp);raw=ROOT/f'assets/ai-raw/{name}-tile-montage.png';raw_montage.save(raw)
    out=ROOT/f'assets/remastered4x/{name}.png';final.save(out);baseline_path=ROOT/f'assets/baseline4x/{name}.png';baseline=original.resize(final.size,Image.Resampling.NEAREST);baseline.save(baseline_path)
    diff=np.abs(np.array(final).astype(float)-np.array(baseline).astype(float))[:,:,:3];visible=np.array(final.getchannel('A'))>0
    rec={'id':asset_id,'variant':name,'inputPath':str(source.relative_to(ROOT)),'inputSha256':sha(source),'inputDimensions':list(original.size),'tool':'OpenCV dnn_superres.DnnSuperResImpl.upsample','toolVersion':cv2.__version__,'model':'FSRCNN x4 (Saafke/FSRCNN_Tensorflow)','modelVersion':None,'modelSha256':sha(ROOT/'tools/models/FSRCNN_x4.pb'),'modelPath':'tools/models/FSRCNN_x4.pb','prompt':None,'seed':None,'parameters':{'algorithm':'fsrcnn','scale':4,'backend':'OpenCV DNN CPU','threads':1,'perTile':True,'passes':count},'preprocessing':['split source into fixed16x16 tile slots','8 source pixels of independently wrapped context for each tile; no unrelated atlas neighbor may influence an edge','same model and processing for every tile'],'inferenceInputPath':str(inp.relative_to(ROOT)),'inferenceInputSha256':sha(inp),'inferenceInputKind':'diagnostic montage; actual separately inferred inputs are in tilePasses','rawOutputPath':str(raw.relative_to(ROOT)),'rawOutputSha256':sha(raw),'rawDimensions':list(raw_montage.size),'rawOutputKind':'diagnostic montage of untouched raw tiles; actual raw model results are in tilePasses','tilePasses':passes,'normalization':['crop32 pixels context from each128x128 raw neural output','paste64x64 central neural tile back into its original4x slot','restore source alpha4x nearest-neighbor; no RGB baseline blend'],'outputPath':str(out.relative_to(ROOT)),'outputSha256':sha(out),'outputDimensions':list(final.size),'baselinePath':str(baseline_path.relative_to(ROOT)),'baselineSha256':sha(baseline_path),'checks':{'exact4x':final.size==(w*4,h*4),'alphaMatchesSource4x':final.getchannel('A').tobytes()==baseline.getchannel('A').tobytes(),'visibleRgbMeanAbsoluteDifferenceFromNearest':float(diff[visible].mean()),'visibleRgbChangedPixelCount':int(np.any(diff>0,axis=2)[visible].sum())},'status':'ai_generated_unreviewed','review':None,'supersedes':f'reports/remaster/{asset_id}-atlas-rejected.json'}
    (ROOT/f'reports/remaster/{name}.json').write_text(json.dumps(rec,indent=2)+'\n');return rec

def main():
    for d in ['assets/ai-inputs','assets/ai-raw','assets/baseline4x','assets/remastered4x','web/assets/remastered4x','reports/remaster']:(ROOT/d).mkdir(parents=True,exist_ok=True)
    cv2.setNumThreads(1)
    sr=cv2.dnn_superres.DnnSuperResImpl_create();sr.readModel(str(ROOT/'tools/models/FSRCNN_x4.pb'));sr.setModel('fsrcnn',4)
    plan=json.loads((ROOT/'assets/remaster-plan.json').read_text());records=[];manifest=[]
    for a in plan['assets']:
        rec=upscale(ROOT/a['source_path'],a['id'],sr);records.append(rec)
        shutil.copy2(ROOT/rec['outputPath'],ROOT/f"web/assets/remastered4x/{a['id']}.png")
        manifest.append({'id':a['id'],'original':f"assets/original/{a['id']}.png",'remastered4x':f"assets/remastered4x/{a['id']}.png",'baseline4x':f"assets/baseline4x/{a['id']}.png",'width':a['source_width'],'height':a['source_height'],'scale':4,'status':'ai_generated_unreviewed','aiProcessingPerformed':True,'provenance':f"../reports/remaster/{a['id']}.json",'originalSha256':a['source_sha256'],'remasteredSha256':rec['outputSha256']})
        print(a['id'],rec['outputDimensions'],round(rec['checks']['visibleRgbMeanAbsoluteDifferenceFromNearest'],2),flush=True)
    en=ROOT/'web/assets/original/background.png'
    if en.exists() and sha(en)!=sha(ROOT/'assets/original/background.png'):
        rec=upscale(en,'background',sr,'background-en');records.append(rec)
        shutil.copy2(ROOT/rec['outputPath'],ROOT/'web/assets/remastered4x/background.png')
        m=next(m for m in manifest if m['id']=='background');m.update(baseline4x='assets/baseline4x/background-en.png',originalSha256=sha(en),remasteredSha256=rec['outputSha256'],provenance='../reports/remaster/background-en.json',variant='English patch; original Spanish preserved separately')
    (ROOT/'web/assets/baseline4x').mkdir(parents=True,exist_ok=True)
    for p in (ROOT/'assets/baseline4x').glob('*.png'):shutil.copy2(p,ROOT/'web/assets/baseline4x'/p.name)
    date=datetime.datetime.now(datetime.timezone.utc).isoformat()
    report={'schemaVersion':1,'generatedAt':date,'actualNeuralInferencePerformed':True,'actualAcceptedInferencePasses':sum(r['parameters'].get('passes',1) for r in records),'generativeEditAttempt':'reports/remaster/player-imagegen-rejected.json','modelSource':'https://github.com/Saafke/FSRCNN_Tensorflow','modelLicense':'Apache-2.0; tools/models/FSRCNN-LICENSE.txt','records':records}
    (ROOT/'reports/remaster-run.json').write_text(json.dumps(report,indent=2)+'\n')
    m={'schemaVersion':1,'assetScale':4,'simulationScale':1,'nominalViewport':[176,208],'aiProcessingPerformed':True,'assets':manifest}
    (ROOT/'web/data/asset-manifest.json').write_text(json.dumps(m,indent=2)+'\n')
    (ROOT/'assets/asset-manifest.json').write_text(json.dumps(m,indent=2)+'\n')
if __name__=='__main__':main()
