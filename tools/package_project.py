#!/usr/bin/env python3
"""Package reproducible project files, excluding Git, caches, and the output ZIP itself."""
from pathlib import Path
import hashlib, json, zipfile
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist'
OUT.mkdir(exist_ok=True)
EXCLUDE={'.git','.DS_Store','__pycache__','node_modules','.venv','dist'}
files=sorted(p for p in ROOT.rglob('*') if p.is_file() and not any(x in EXCLUDE for x in p.relative_to(ROOT).parts) and p.suffix!='.pyc')
checks={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
archive=OUT/'vampire-bloodline-web-port.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:z.write(p,Path('vampire-bloodline-web-port')/p.relative_to(ROOT))
    z.writestr('vampire-bloodline-web-port/DELIVERY_CHECKSUMS.json',json.dumps(checks,indent=2)+'\n')
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert 'vampire-bloodline-web-port/web/index.html' in z.namelist()
print(json.dumps({'path':str(archive),'files':len(files),'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()},indent=2))
