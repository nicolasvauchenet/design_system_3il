import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const tmp=root+'/tmp/uml-redraw-ppt';
const inputs=fileURLToPath(new URL('./inputs/',import.meta.url));
const map=JSON.parse(await fs.readFile(inputs+'/template-frame-map.json','utf8'));
const p=await PresentationFile.importPptx(await FileBlob.load(inputs+'/template-starter.pptx'));
const notes=JSON.parse(JSON.stringify(p.toProto())).slides;
await fs.mkdir(tmp+'/final',{recursive:true});
const titleOverrides={'04-symbols--4':'Créer, exécuter et détruire un objet','04-example--3':'Livraison · scénario d’échec','04-example--4':'Livraison · scénario de réussite','09f-symbols':'Lire les cardinalités en patte d’oie','09h-example':'Familles de colonnes · accès par utilisateur'};
const audit=[];
for(const entry of map.outputSlides){
 const s=p.slides.items[entry.outputSlide-1];
 const source=JSON.parse(await fs.readFile(`${inputs}/source-slides/slide-${entry.sourceSlide}.json`,'utf8'));
 const before=JSON.parse(await (await s.export({format:'layout'})).text());
 for(const edit of entry.editTargets){
  const original=source.elements.find(e=>e.aid===edit.shapeId);
  const targetInfo=before.elements.find(e=>e.order===original.order);
  const target=p.resolve(targetInfo.aid);
  if(edit.role==='page-number')target.text.replace(targetInfo.text,String(entry.outputSlide).padStart(2,'0'));
  if(edit.role==='title'&&entry.panel)target.text.replace(targetInfo.text,titleOverrides[entry.panel]||edit.text);
  if(edit.role==='former-figure-comment')target.delete();
  if(edit.role==='diagram'){
   const bytes=await fs.readFile(root+'/office/UML/diagrammes/'+entry.panel+'.png');
   const m=await sharp(bytes).metadata();const k=Math.min(1152/m.width,435/m.height);
   target.replace({blob:new Uint8Array(bytes),contentType:'image/png',alt:entry.narrativeRole,fit:'contain'});
   target.crop={left:0,right:0,top:0,bottom:0};
   target.frame={left:(1280-m.width*k)/2,top:205,width:m.width*k,height:m.height*k};
  }
 }
 if(entry.panel)s.speakerNotes.textFrame.setText(`${entry.narrativeRole}\nDiagramme homogénéisé : diagrammes/${entry.panel}.svg ; source éditable : diagrammes/${entry.panel}.dot.\nRègle du cas commande : préparation et paiement avancent en parallèle ; la livraison attend les deux. Les vues sont des projections du même modèle, pas des modèles exhaustifs de production.\n[Sources]\nCours UML fourni par l’auteur : cours_methodologie-main.zip / 01 - UML.\nhttps://www.omg.org/spec/UML/2.5.1\n[/Sources]`);
 const layout=JSON.parse(await (await s.export({format:'layout'})).text());
 await fs.writeFile(`${tmp}/final/slide-${String(entry.outputSlide).padStart(2,'0')}.layout.json`,JSON.stringify(layout,null,2));
 await fs.writeFile(`${tmp}/final/slide-${entry.outputSlide}.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));
 audit.push({slide:entry.outputSlide,source:entry.sourceSlide,panel:entry.panel,elements:layout.elements.length});
}
await fs.writeFile(tmp+'/final-inspect.ndjson',(await p.inspect({kind:'slide,shape,image,notes,layout',maxChars:5000000})).ndjson);
await fs.writeFile(tmp+'/revision-audit.json',JSON.stringify(audit,null,2));
await (await PresentationFile.exportPptx(p)).save(root+'/office/UML/3iL-UML-Presentation-revisee.pptx');
console.log('EXPORTED',p.slides.items.length);
