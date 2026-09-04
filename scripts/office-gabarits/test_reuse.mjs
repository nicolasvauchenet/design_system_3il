import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/VAUCHE/Dev/design_system_3il';const tmp=root+'/tmp/office-templates';
const p=await PresentationFile.importPptx(await FileBlob.load(root+'/office/Gabarits/3iL-Gabarit-Presentation.pptx'));
await fs.mkdir(tmp+'/reuse',{recursive:true});
const layouts=p.layouts.items.filter(l=>!p.masters.items.some(m=>m.id===l.id)&&l.name.startsWith('3iL'));
const report=[];
for(const l of layouts){
 const summary=l.placeholders.summary();
 if(!summary.some(ph=>ph.type==='title'))throw Error('Missing title: '+l.name);
 const s=p.slides.add();s.setLayout(l);
 s.placeholders.getItem('title').text='Mon nouveau cours';
 for(const ph of summary){
  if(ph.type==='body')s.placeholders.getItem('body').text='Un contenu ajouté depuis la disposition.';
  if(ph.type==='subtitle')s.placeholders.getItem('subtitle').text='Un sous-titre adapté à ma séance';
 }
 const n=report.length+1;
 await fs.writeFile(`${tmp}/reuse/layout-${n}.png`,new Uint8Array(await(await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));
 report.push({name:l.name,placeholders:summary});
}
if(report.length!==5)throw Error('Expected five native 3iL layouts');
await fs.writeFile(tmp+'/reuse-check.json',JSON.stringify(report,null,2));
console.log('Reusable layouts verified',report.length);
