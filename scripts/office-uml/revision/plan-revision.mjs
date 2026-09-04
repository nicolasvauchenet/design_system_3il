import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const tmp=root+'/tmp/uml-redraw-ppt';
const manifest=JSON.parse(await fs.readFile(root+'/office/UML/diagrammes/manifest.json','utf8'));
const groups={'01-hierarchy':[6],'02-symbols':[9],'02-example':[10,11,12],'03-symbols':[17,18],'03-example':[19,20,21],'03-example2':[22],'03-example3':[23],'03-example4':[24],'04-symbols':[29,30],'04-example':[31,32,33,34],'05-symbols':[40,41],'05-example':[42],'06a-symbols':[46],'06a-example':[47],'06b-symbols':[49],'06b-example':[50],'06c-symbols':[52],'06c-example':[53,54,55],'09a-example':[59],'09b-example':[60],'09c-example':[61],'09d-example':[62],'09e-example':[64],'09f-example':[65],'09f-symbols':[66],'09g-example':[67],'09h-example':[68],'09i-example01':[69],'09i-example02':[70],'07-example':[88,89,90],'08-example':[91]};
const used=new Set(Object.values(groups).flat());
const starts=new Map(Object.entries(groups).map(([id,ns])=>[ns[0],{id,ns}]));
const map={outputSlides:[],omittedSourceSlides:[]};
async function add(n,part){
 const layout=JSON.parse(await fs.readFile(`${tmp}/source-slides/slide-${n}.json`,'utf8'));
 const edits=[];
 for(const e of layout.elements){
  if(e.kind==='shape'&&e.bbox[1]>660&&/^\d+$/.test(e.text||''))edits.push({shapeId:e.aid,action:'rewrite',role:'page-number'});
  else if(e.kind==='shape'&&e.bbox[1]===98)edits.push({shapeId:e.aid,action:'rewrite',role:'title',text:part?.title||e.text});
  else if(e.kind==='shape'&&(e.isPlaceholder||e.placeholder||e.name?.startsWith('placeholder_')))edits.push({shapeId:e.aid,action:'fill-placeholder',role:'preserve-text',text:e.text});
  if(part&&e.kind==='image'&&e.bbox[1]>=200)edits.push({shapeId:e.aid,action:'replace',role:'diagram',panel:part.id});
  if(part&&e.kind==='shape'&&e.bbox[1]===584)edits.push({shapeId:e.aid,action:'delete',role:'former-figure-comment'});
 }
 map.outputSlides.push({outputSlide:map.outputSlides.length+1,sourceSlide:n,narrativeRole:part?.title||layout.elements.find(e=>e.bbox[1]===98)?.text||'Couverture',reuseMode:'duplicate-slide',editTargets:edits,panel:part?.id});
}
for(let n=1;n<=92;n++){
 if(starts.has(n)){const {id,ns}=starts.get(n);for(const [i,part] of manifest.figures[id].entries())await add(ns[Math.min(i,ns.length-1)],part);}
 else if(!used.has(n))await add(n);
}
await fs.writeFile(tmp+'/template-frame-map.json',JSON.stringify(map,null,2));
await fs.writeFile(tmp+'/template-audit.txt','Source: existing 92-slide 3iL deck. Every source slide inspected. Preserve original masters, layouts, Arial typography, logo, margins and chrome. Replace exact diagram slots; remove only old illustration comments. Preserve every chapter, exercise and annex. All notes retained.');
await fs.writeFile(tmp+'/deviation-log.txt','Split dense figures into complete readable panels instead of image bands. Reuse the final source panel when extra slides are necessary. Replace diagram titles with neutral titles, retain font styling. Expand figure frame within x64..1216/y205..640 after removing old editorial callouts. Renumber slides. No new theme.');
console.log(map.outputSlides.length,'slides');
