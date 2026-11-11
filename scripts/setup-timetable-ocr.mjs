import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await fs.readFile(new URL('../src/lib/timetable-ocr/assets.json',import.meta.url),'utf8'));
const root=new URL('../',import.meta.url);
const upstream='https://raw.githubusercontent.com/gomgi851/timetable-recognizer/33477cd';
for(const asset of manifest.assets){
  const relative=asset.file.replace(/^public\//,''),dest=new URL(`public/timetable-ocr/${relative}`,root);
  const check=bytes=>bytes.length===asset.bytes&&createHash('sha256').update(bytes).digest('hex')===asset.sha256;
  try{if(check(await fs.readFile(dest)))continue;}catch{}
  let bytes;
  if(relative.startsWith('ocr/')){
    const name=path.basename(relative),source=name==='worker.min.js'?'node_modules/tesseract.js/dist/worker.min.js':`node_modules/tesseract.js-core/${name}`;
    bytes=await fs.readFile(new URL(source,root));
  }else if(relative.startsWith('runtime/')){
    bytes=await fs.readFile(new URL(`node_modules/onnxruntime-web/dist/${path.basename(relative)}`,root));
  }else{
    const name=path.basename(relative),url=name.startsWith('room-code-v2')?`${upstream}/trained/${name}`:`https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/${name}`;
    console.log(`Downloading ${relative}`);const response=await fetch(url);if(!response.ok)throw new Error(`Model download failed: ${response.status} ${relative}`);bytes=Buffer.from(await response.arrayBuffer());
  }
  if(!check(bytes))throw new Error(`SHA-256/size mismatch: ${relative}. Refusing to install changed model/runtime.`);
  await fs.mkdir(new URL('./',dest),{recursive:true});await fs.writeFile(dest,bytes);
}
console.log('Timetable OCR models and runtimes verified (SHA-256).');
