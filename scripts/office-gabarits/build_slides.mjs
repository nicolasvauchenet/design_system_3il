import fs from 'node:fs/promises';
import {FileBlob,Presentation,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/VAUCHE/Dev/design_system_3il';
const tmp=root+'/tmp/office-templates';
let p=await PresentationFile.importPptx(await FileBlob.load(tmp+'/template-starter.pptx'));
const map=JSON.parse(await fs.readFile(tmp+'/template-frame-map.json','utf8'));
await fs.mkdir(tmp+'/final',{recursive:true});
console.log((await p.inspect({kind:'layout',maxChars:25000})).ndjson);
const style=(size,color='tx1',bold=false,font='Arial')=>({typeface:font,fontSize:size,color,bold,verticalAlignment:'top',autoFit:'none',insets:{top:0,right:0,bottom:0,left:0}});
const roleHints={
 Couverture:'Remplacez le titre, le sous-titre et les métadonnées. Gardez le titre court ; utilisez le sous-titre pour les précisions.',
 Objectifs:'Présentez trois objectifs observables : identifier, appliquer, produire… Adaptez-les à la séance.',
 Chapitre:'Dupliquez cette diapositive pour ouvrir chaque grande partie. Remplacez le numéro et la question directrice.',
 Notion:'Une idée par diapositive. Trois points courts suffisent ; développez votre explication oralement ou dans ces notes.',
 Méthode:'Présentez une séquence d’actions. Dupliquez la diapositive si la méthode exige davantage d’étapes.',
 Illustration:'Utilisez le cadre central pour une image, un tableau ou un graphique via les icônes de l’espace réservé. Ajoutez une légende courte et la source dans les notes. Pour une image existante : clic droit > Changer l’image. Préservez les proportions.',
 Code:'Gardez un extrait court. Le texte est éditable, sans coloration syntaxique. Conservez les indentations ; expliquez le résultat dans les notes.',
 Exercice:'Renseignez le contexte, la consigne, le livrable et les modalités. Placez le corrigé dans une version enseignant séparée, pas dans les notes du fichier distribué.',
 Synthèse:'Concluez avec les idées essentielles et une application concrète ou la prochaine étape.',
 Ressources:'Indiquez auteur, titre, date ou version et URL. Remplacez ces exemples par les sources réellement utilisées.'
};
// The user requested native templates: keep the imported hierarchy, promote content
// slots to reusable placeholders, and inherit the authentic logo on new light slides.
const layoutsById=new Map(p.layouts.items.map(l=>[l.id,l]));
let contentMaster;
for(const m of p.masters.items){
 if(m.name.includes('Fondations'))contentMaster=m;
}
if(!contentMaster)throw Error('Content master missing');
contentMaster.images.add({blob:new Uint8Array(await fs.readFile(root+'/assets/logos/3il-horizontal.png')),contentType:'image/png',alt:'3iL Ingénieurs',fit:'contain',position:{left:991.1,top:14,width:224.79,height:64}});
await fs.writeFile(tmp+'/master-evidence.json',JSON.stringify(p.masters.items.map(m=>({id:m.id,name:m.name,placeholders:m.placeholders.summary(),proto:m.toProto()})),null,2));
const configured=new Set();
const additions=new Map();
function remember(layout,shape,index){
 const copy=structuredClone(shape.toProto());
 const originalId=copy.id;copy.id=String(100+index);copy.name='3iL '+copy.placeholderType;
 if(!additions.has(layout.id))additions.set(layout.id,[]);
 additions.get(layout.id).push({originalId,copy});
}
for(const entry of map.outputSlides){
 const s=p.slides.items[entry.outputSlide-1];
 const before=JSON.parse(await(await s.export({format:'layout'})).text());
 const original=JSON.parse(await fs.readFile(`${tmp}/template-inspect/layouts/source-slide-${String(entry.sourceSlide).padStart(2,'0')}.layout.json`,'utf8'));
 const layout=layoutsById.get(before.slide.layoutId);
 for(const edit of entry.editTargets){
  if(edit.action==='add')continue;
  const source=original.elements.find(e=>e.aid===edit.shapeId);
  const cur=before.elements.find(e=>e.order===source.order);
  const target=p.resolve(cur.aid);
  if(edit.action==='delete'){target.delete();continue;}
  target.text=edit.text;
  target.name=edit.role;
  if(edit.role==='title'||edit.role==='body'){
   const type=edit.role;const index=type==='title'?0:1;
   target.placeholderType=type;target.placeholderIndex=index;
   const st=type==='title'?style(44,'accent1',true):style(28,'tx1',false,entry.narrativeRole==='Code'?'Consolas':'Arial');
   target.text.style=st;
   if(!configured.has(layout.id)&&!layout.shapes.items.some(sh=>sh.placeholderType===type)){
    const ph=layout.shapes.add({geometry:'textbox',position:target.position,fill:'none',line:{fill:'none',width:0}});ph.placeholderType=type;ph.placeholderIndex=index;ph.text=type==='title'?'[Titre]':'[Contenu]';ph.text.style=st;
    remember(layout,ph,index);
   }
  }
  if(edit.role==='eyebrow')target.text.style=style(18,'accent2',true);
  if(edit.role.startsWith('cover-')){
   const slots={'cover-title':['title',0,90,true],'cover-subtitle':['subtitle',1,48,false],'cover-meta':['body',2,26,false]};
   const [type,index,size,bold]=slots[edit.role];
   target.placeholderType=type;target.placeholderIndex=index;target.text.style=style(size,'lt1',bold);
   if(!configured.has(layout.id)){
    const ph=layout.shapes.add({geometry:'textbox',position:target.position,fill:'none',line:{fill:'none',width:0}});ph.placeholderType=type;ph.placeholderIndex=index;ph.text=edit.text;ph.text.style=style(size,'lt1',bold);
    remember(layout,ph,index);
   }
  }
 }
 if(!configured.has(layout.id)){
  if(entry.sourceSlide!==1){
   for(const sh of layout.shapes.items){
    if(sh.placeholderType==='title')sh.text.style=style(44,'accent1',true);
    if(sh.placeholderType==='body')sh.text.style=style(28,'tx1',false,entry.narrativeRole==='Code'?'Consolas':'Arial');
   }
  }
  configured.add(layout.id);
 }
 if(entry.narrativeRole==='Illustration'){
  const cfg={type:'content',index:3,geometry:'textbox',position:{left:64,top:220,width:1152,height:400},text:'[Image, tableau ou graphique]\n\n[Légende courte et source]'};
  const ph=layout.shapes.add({geometry:'textbox',position:cfg.position});ph.placeholderType='content';ph.placeholderIndex=3;ph.text=cfg.text;ph.text.style=style(28,'tx2');
  remember(layout,ph,3);
  const shape=s.shapes.add({geometry:'textbox',name:'Visuel à remplacer',position:cfg.position});shape.placeholderType='content';shape.placeholderIndex=3;shape.text=cfg.text;shape.text.style=style(28,'tx2');
  shape.fill='bg2';shape.line={fill:'none',width:0};
 }
 s.speakerNotes.textFrame.setText('MODE D’EMPLOI — ENSEIGNANT\n'+roleHints[entry.narrativeRole]+'\n\nDupliquez cette diapositive ou utilisez Accueil > Nouvelle diapositive > une disposition 3iL. Remplacez tous les textes entre crochets. Collez en conservant le thème de destination.\n\n[Sources]\nCharte et logos officiels 3iL fournis ; dispositions reprises du support de cours UML validé.\n[Ajoutez ici les références du contenu inséré.]\n[/Sources]');
}
// The imported-layout add API allocates duplicate IDs. Rehydrate its native
// model with unique IDs before export, retaining each created placeholder.
const proto=p.toProto();
for(const [id,items] of additions){
 const layout=proto.layouts.find(l=>l.id===id);
 layout.elements=layout.elements.filter(e=>!items.some(a=>a.originalId===e.id));
 layout.elements.push(...items.map(a=>a.copy));
}
// Neutral placeholders must not inherit Office's default bulleted body style.
for(const container of [...proto.layouts,...proto.slides]){
 for(const element of container.elements??[]){
  if(!element.placeholderType)continue;
  for(const paragraph of element.paragraphs??[]){
   paragraph.paragraphStyle={...paragraph.paragraphStyle,bulletCharacter:'',marginLeft:0,indent:0};
  }
  for(const level of element.levelsStyles??[]){
   level.paragraphStyle={...level.paragraphStyle,bulletCharacter:'',marginLeft:0,indent:0};
  }
 }
}
p=await Presentation.load(proto);
await (await PresentationFile.exportPptx(p)).save(tmp+'/3iL-Gabarit-Presentation.pptx');
for(const [i,s] of p.slides.items.entries()){
 await fs.writeFile(`${tmp}/final/slide-${String(i+1).padStart(2,'0')}.layout.json`,await(await s.export({format:'layout'})).text());
 await fs.writeFile(`${tmp}/final/slide-${i+1}.png`,new Uint8Array(await(await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));
}
await fs.writeFile(tmp+'/final-inspect.ndjson',(await p.inspect({kind:'slide,shape,image,notes,layout',maxChars:1000000})).ndjson);
console.log('EXPORTED',p.slides.items.length);
