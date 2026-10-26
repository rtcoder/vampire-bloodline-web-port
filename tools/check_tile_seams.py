#!/usr/bin/env python3
"""Regression check for the identified unrelated-neighbor leakage on repeated tiles."""
import argparse,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--variant',choices=['before','after'],default='after');args=parser.parse_args()
def vertical_seam(path,index):
    im=Image.open(path).convert('RGB');p=im.load();x=index*64
    return sum(abs(p[x,y][c]-p[x+63,y][c]) for y in range(64) for c in range(3))/(64*3)
records=[]
for aid,tile in [('tiles1',0),('tiles1',9),('tiles2',0),('tiles3',0),('tiles4',0)]:
    before=vertical_seam(ROOT/f'assets/ai-raw/{aid}-atlas-final-rejected.png',tile)
    after=vertical_seam(ROOT/f'assets/remastered4x/{aid}.png',tile)
    candidate=before if args.variant=='before' else after;limit=min(4.0,before*.5)
    records.append({'asset':aid,'tile':tile,'beforeMeanAbsoluteRgbBoundaryJump':before,'afterMeanAbsoluteRgbBoundaryJump':after,'maximumAcceptedBoundaryJump':limit,'passed':candidate<=limit})
result={'variant':args.variant,'metric':'mean absolute RGB difference across x=0 and x=63 when repeating selected periodic tile','scope':'known periodic floor/wall/water fragments; does not require unrelated tiles to have identical edges','passed':all(r['passed'] for r in records),'records':records}
if args.variant=='after':(ROOT/'reports/remaster-seam-regression.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2));raise SystemExit(0 if result['passed'] else 1)
