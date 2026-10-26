const KEY = 'vampire-bloodline:v1';
const initial = () => ({version:1,level:1,sublevel:1,completed:false,sound:true,graphics:'remastered4x',started:false});
function normalize(value) {
  if (!value || !Number.isInteger(value.level) || value.level<1 || value.level>5 ||
      !Number.isInteger(value.sublevel) || value.sublevel<1 || value.sublevel>3) return null;
  return {version:1,level:value.level,sublevel:value.sublevel,completed:value.completed===true,
    sound:value.sound!==false,graphics:value.graphics==='remastered4x'?'remastered4x':'original',started:value.started===true};
}
export class SaveStore {
  constructor(storage) { this.storage = storage; this.available = Boolean(storage); }
  read() {
    try {
      const raw = JSON.parse(this.storage?.getItem(KEY) || 'null');
      return (raw?.version===1 && normalize(raw)) || initial();
    } catch { this.available = false; return initial(); }
  }
  write(value) {
    const data=normalize(value);
    if (!data) return false;
    try { if(!this.storage) return false; this.storage.setItem(KEY,JSON.stringify(data)); this.available=true; return true; }
    catch { this.available=false; return false; }
  }
}
