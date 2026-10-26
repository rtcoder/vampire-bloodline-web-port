const IMAGE_NAMES=['background','boss_jvh','coffin','enemy_dog','enemy_hunter','enemy_wraith','eve','eve_title','eyes','gui','icon','jvh','jvh_full','letter','menu','ngame','player','special','stuff','sword','tiles1','tiles2','tiles3','tiles4','title'];
async function json(path){const r=await fetch(path);if(!r.ok)throw Error(`Nie można wczytać ${path} (HTTP ${r.status})`);return r.json();}
async function image(path){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error(`Brak grafiki: ${path}`));i.src=path;});}
export async function loadData(){
  const [levels,strings]=await Promise.all([json('data/levels.json'),json('data/strings-pl.json')]);
  let manifest=null;
  try{manifest=await json('data/asset-manifest.json');}catch{/* originals are sufficient for running the port */}
  const assets=new Map();
  await Promise.all(IMAGE_NAMES.map(async id=>{
    const entry=manifest?.assets?.find(a=>a.id===id);
    const original=await image(entry?.original||`assets/original/${id}.png`);
    const asset={original,width:original.naturalWidth,height:original.naturalHeight,status:entry?.status||'original'};
    if(entry?.remastered4x){asset.remastered4x=await image(entry.remastered4x);if(asset.remastered4x.naturalWidth!==asset.width*4||asset.remastered4x.naturalHeight!==asset.height*4)throw Error(`Niepoprawny wymiar 4×: ${id}`);}
    assets.set(id,asset);
  }));
  return {levels,strings,assets,manifest};
}
