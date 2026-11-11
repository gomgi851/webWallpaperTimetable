import fs from 'node:fs/promises';
import path from 'node:path';
const root=new URL('../',import.meta.url);
const lock=JSON.parse(await fs.readFile(new URL('package-lock.json',root),'utf8'));
const records=[],sections=[],missing=[];
for(const location of Object.keys(lock.packages).filter(p=>p.startsWith('node_modules/')).sort()) {
  const directory=new URL(`${location}/`,root);
  let pkg,entries;
  try {pkg=JSON.parse(await fs.readFile(new URL('package.json',directory),'utf8'));entries=await fs.readdir(directory,{withFileTypes:true});}
  catch(error){if(error.code==='ENOENT')continue;throw error;}
  const files=entries.filter(e=>e.isFile()&&/^(licen[cs]es?|copying|notice)([.-]|$)/i.test(e.name)).map(e=>e.name).sort();
  let texts=await Promise.all(files.map(async file=>({file,text:await fs.readFile(new URL(file,directory),'utf8')})));
  if(!texts.length&&['onnxruntime-web','onnxruntime-common'].includes(pkg.name)) {
    texts=[{file:'upstream ONNX Runtime LICENSE',text:await fs.readFile(new URL('public/licenses/timetable-ocr/ONNX-Runtime-LICENSE.txt',root),'utf8')}];
  }
  if(!texts.length&&pkg.name.startsWith('@rolldown/binding-')) {
    texts=await Promise.all(['LICENSE','THIRD-PARTY-LICENSE'].map(async file=>({file:`rolldown/${file}`,text:await fs.readFile(new URL(`node_modules/rolldown/${file}`,root),'utf8')})));
  }
  if(!texts.length&&pkg.name==='tr46')texts=[{file:'upstream tr46 LICENSE.md',text:await fs.readFile(new URL('public/licenses/dependencies/tr46-MIT.txt',root),'utf8')}];
  if(!texts.length&&pkg.name==='guid-typescript')texts=[{file:'package.json ISC declaration and SPDX ISC reference (no standalone upstream LICENSE published)',text:JSON.stringify(pkg,null,2)+'\n\n'+await fs.readFile(new URL('public/licenses/dependencies/ISC-reference.txt',root),'utf8')}];
  if(!texts.length)missing.push(`${pkg.name}@${pkg.version}`);
  const record={name:pkg.name,version:pkg.version,license:pkg.license||'not specified in package metadata',repository:pkg.repository?.url||pkg.repository||pkg.homepage||null,licenseFiles:texts.map(t=>t.file)};
  records.push(record);
  sections.push(`===== ${pkg.name} ${pkg.version} (${record.license}) =====\nSource: ${record.repository||'See package registry'}\n\n`+texts.map(t=>`--- ${t.file} ---\n${t.text}`).join('\n'));
}
if(missing.length)throw new Error(`Missing license text for installed packages: ${missing.join(', ')}`);
async function writeIfChanged(relative,text){const target=new URL(relative,root);try{if(await fs.readFile(target,'utf8')===text)return;}catch{}await fs.mkdir(new URL('./',target),{recursive:true});await fs.writeFile(target,text);}
await writeIfChanged('public/licenses/PROJECT-ISC.txt',await fs.readFile(new URL('LICENSE',root),'utf8'));
await writeIfChanged('public/licenses/npm-dependencies.json',JSON.stringify({scope:'Installed npm packages from package-lock.json, including build dependencies. Platform-specific optional packages not installed here are excluded.',packages:records},null,2)+'\n');
await writeIfChanged('public/licenses/npm-dependencies-NOTICES.txt',sections.join('\n\n')+'\n');
console.log(`Collected license texts for ${records.length} installed npm packages.`);
