import fs from 'node:fs/promises';
import {instance} from '@viz-js/viz';
import sharp from 'sharp';
const root=process.cwd(),out=root+'/tmp/uml-corriges/figures';
await fs.mkdir(out,{recursive:true});
const viz=await instance(), specs=[];
const q=JSON.stringify;
const n=(id,label,attrs='')=>`${id} [label=${q(label)} ${attrs}];`;
const e=(a,b,label='',attrs='')=>`${a}->${b} [label=${q(label)} ${attrs}];`;
const a=(x,y,l='',attrs='')=>e(x,y,l,'dir=none '+attrs);
const init=n('i','','shape=circle width=.18 fixedsize=true fillcolor="#122F37"');
const end=n('f','','shape=doublecircle width=.18 fixedsize=true fillcolor="#122F37"');
const diamond=id=>n(id,'','shape=diamond style=filled width=.45 height=.45 fixedsize=true fillcolor=white');
const add=(id,body,engine='dot')=>specs.push({id,body,engine});
const actor=(id,label)=>n(id,'«actor»\n'+label,'shape=box style=filled');
function uc(id,title,actors,cases,links,include){
 let b='rankdir=LR;'+actors.map(([i,t])=>actor(i,t)).join('');
 b+=`subgraph cluster_system {label=${q(title)};color="#95B4BC";margin=20;`;
 b+=cases.map(([i,t])=>n(i,t,'shape=ellipse')).join('');
 if(include)b+=e(include[0],include[1],'«include»','style=dashed arrowhead=vee');
 b+='}'+links.map(([x,y])=>a(x,y)).join('');add(id,b);
}
uc('use-events','Plateforme de gestion d’événements', [['o','Organisateur client'],['c','Coordinateur agence'],['p','Participant'],['m','Service mail']], [['plan','Planifier l’événement'],['val','Valider le programme'],['lieu','Rechercher un lieu'],['four','Coordonner les fournisseurs'],['inv','Gérer les invitations'],['env','Envoyer les invitations'],['eq','Échanger avec l’équipe'],['rep','Répondre à une invitation'],['eval','Évaluer l’événement'],['bilan','Produire le bilan'],['lire','Consulter le bilan']], [['o','plan'],['o','val'],['o','eq'],['o','lire'],['c','plan'],['c','lieu'],['c','four'],['c','inv'],['c','eq'],['c','bilan'],['p','rep'],['p','eval'],['m','env']],['inv','env']);
uc('use-library','Logiciel de bibliothèque',[['b','Bibliothécaire'],['l','Lecteur'],['s','Service de notification']],[['cat','Gérer le catalogue'],['dem','Demander un emprunt'],['emp','Enregistrer un emprunt'],['dis','Vérifier la disponibilité'],['ret','Enregistrer un retour'],['rap','Envoyer un rappel']],[['b','cat'],['l','dem'],['b','emp'],['b','ret'],['l','rap'],['s','rap']],['emp','dis']);
add('activity-events',init+end+diamond('m')+diamond('d')+diamond('v')+n('type','Sélectionner le type')+n('lieu','Rechercher un lieu')+n('ctrl','Contrôler disponibilité et coût')+n('conf','Configurer les détails')+n('client','Soumettre le programme au client')+n('fin','Finaliser la planification')+e('i','type')+e('type','m')+e('m','lieu')+e('lieu','ctrl')+e('ctrl','d')+e('d','m','[lieu inadapté]','constraint=false')+e('d','conf','[lieu adapté]')+e('conf','client')+e('client','v')+e('v','fin','[approuvé]')+e('v','m','[à modifier : revoir lieu et détails]','constraint=false')+e('fin','f'));
add('activity-order',init+end+diamond('m')+diamond('stock')+diamond('paymerge')+diamond('pay')+n('pan','Composer le panier')+n('caisse','Passer à la caisse')+n('check','Vérifier tous les articles')+n('mod','Informer et modifier le panier')+n('infos','Saisir livraison et paiement')+n('trait','Traiter le paiement')+n('retry','Informer et corriger le paiement')+n('ok','Confirmer la commande')+n('mail','Envoyer l’accusé de réception')+e('i','pan')+e('pan','m')+e('m','caisse')+e('caisse','check')+e('check','stock')+e('stock','mod','[article indisponible]')+e('mod','m','','constraint=false')+e('stock','infos','[tous disponibles]')+e('infos','paymerge')+e('paymerge','trait')+e('trait','pay')+e('pay','retry','[refusé]')+e('retry','paymerge','','constraint=false')+e('pay','ok','[accepté]')+e('ok','mail')+e('mail','f'));
function sequence(id,names,rows){
 let b='layout=neato;splines=line;overlap=true;node [style=filled fontsize=20];',h=(rows.length+2)*.8;
 names.forEach((name,c)=>{b+=n('h'+c,name,`pos="${c*4.8},${h}!" width=2.6 height=.6`);
  for(let r=0;r<=rows.length;r++)b+=n(`p${c}_${r}`,'',`shape=point style=invis width=.001 pos="${c*4.8},${h-(r+1)*.8}!"`);
  b+=e('h'+c,`p${c}_0`,'','style=dashed arrowhead=none');
  for(let r=0;r<rows.length;r++)b+=e(`p${c}_${r}`,`p${c}_${r+1}`,'','style=dashed arrowhead=none');
 });
 rows.forEach(([x,y,t,kind],r)=>{b+=e(`p${x}_${r}`,`p${y}_${r}`,'',`arrowhead=${kind==='async'||kind==='return'?'vee':'normal'} style=${kind==='return'?'dashed':'solid'}`);b+=n('t'+r,t,`shape=plaintext style=solid fontsize=18 pos="${(x+Math.sign(y-x)*.5)*4.8},${h-(r+1)*.8+.22}!"`);});add(id,b,'neato');
}
sequence('sequence-conference',['organisateur:\nOrganisateur','plateforme:\nPlateforme','messagerie:\nServiceMail','participant:\nParticipant'],[[0,1,'créerConférence()'],[1,0,'participants potentiels','return'],[0,1,'sélectionnerParticipants()'],[1,2,'envoyerInvitation()','async'],[2,3,'invitation','async'],[3,2,'acceptation','async'],[2,1,'transmettreRéponse()','async'],[1,0,'proposerListeEtHoraires()'],[0,1,'valider()'],[1,2,'confirmerParticipation()','async'],[2,3,'confirmation','async']]);
sequence('sequence-atm',['client:\nClient','atm:\nATM','auth:\nAuthentification','base:\nBaseDeDonnees'],[[0,1,'insérerCarte()'],[1,0,'demanderPIN()'],[0,1,'saisirPIN()'],[1,2,'vérifierIdentité()'],[2,3,'consulterDonnéesAuth()'],[3,2,'données protégées','return'],[2,1,'identité validée','return'],[1,0,'proposerOpérations()'],[0,1,'retirer(montant)'],[1,3,'contrôlerEtDébiter()'],[3,1,'débit confirmé','return'],[1,0,'distribuerBillets()'],[1,0,'confirmerEtRendreCarte()']]);
function model(id,labels,relations){let b='rankdir=TB;';b+=Object.entries(labels).map(([key,t])=>n(key,t,'shape=box style=filled')).join('');b+=relations.map(([x,y,tail,head,label])=>a(x,y,label??'',`taillabel=${q(tail)} headlabel=${q(head)} labeldistance=1.7`)).join('');add(id,b);}
const eventLabels={ev:'Evenement',li:'Lieu',re:'ReservationLieu',pa:'Participant',ins:'Inscription',fi:'FilCommunication',me:'Message',bu:'Budget',de:'Depense',eval:'Evaluation'};
const eventRels=[['ev','re','1','0..*'],['li','re','1','0..*'],['ev','ins','1','0..*'],['pa','ins','1','0..*'],['ev','fi','1','0..*'],['fi','me','1','0..*'],['pa','me','1','0..*','expéditeur'],['pa','me','1..*','0..*','destinataires'],['ev','bu','1','0..1'],['bu','de','1','0..*'],['ins','eval','1','0..1']];
model('classes-events',eventLabels,eventRels);
model('classes-library',{b:'Bibliotheque',l:'Livre',x:'Exemplaire',u:'Lecteur',r:'Reservation',e:'Emprunt',p:'Rappel',a:'Bibliothecaire'},[['b','x','1','0..*'],['l','x','1','0..*'],['u','r','1','0..*'],['l','r','1','0..*'],['u','e','1','0..*'],['x','e','1','0..*'],['e','p','1','0..*'],['a','e','1','0..*']]);
add('communication','rankdir=LR;'+n('john','', 'shape=plain label=<<U>john:Lecteur</U>>')+n('alice','','shape=plain label=<<U>alice:Bibliothecaire</U>>')+n('livre','','shape=plain label=<<U>livre:Livre</U>>')+n('emp','','shape=plain label=<<U>emprunt:Emprunt</U>>')+e('john','alice','1 : demanderEmprunt(livre)')+e('alice','livre','1.1 : vérifierDisponibilité()')+e('alice','emp','1.2 [disponible] : enregistrer()')+e('emp','livre','1.2.1 : définirStatut(emprunte)')+e('emp','john','1.2.2 : confirmerEmprunt()','constraint=false'));
add('states',init+end+diamond('d')+n('sou','DemandeSoumise')+n('ver','VerificationDisponibilite\ndo / vérifierDisponibilité')+n('enr','EnregistrementEmprunt\ndo / enregistrerEmprunt')+n('conf','ConfirmationEmprunt\nentry / envoyerConfirmation')+n('ref','EmpruntRefuse\nentry / notifierRefus')+e('i','sou')+e('sou','ver','traiterDemande')+e('ver','d')+e('d','enr','[disponible]')+e('d','ref','[else]')+e('enr','conf')+e('conf','f','confirmationRecue')+e('ref','f'));
model('er-events',{ev:'EVENEMENT\nid_evenement',li:'LIEU\nid_lieu',re:'RESERVATION_LIEU\nid_reservation',pa:'PARTICIPANT\nid_participant',ins:'INSCRIPTION\nid_inscription',me:'MESSAGE\nid_message',dest:'DESTINATION_MESSAGE\n(id_message, id_participant)',bu:'BUDGET\nid_budget',de:'DEPENSE\nid_depense',eval:'EVALUATION\nid_evaluation'},[['ev','re','1','0..*'],['li','re','1','0..*'],['ev','ins','1','0..*'],['pa','ins','1','0..*'],['ev','me','1','0..*'],['pa','me','1','0..*','expéditeur'],['me','dest','1','1..*'],['pa','dest','1','0..*'],['ev','bu','1','0..1'],['bu','de','1','0..*'],['ins','eval','1','0..1']]);
model('er-university',{d:'DEPARTEMENT\nid_departement',c:'COURS\ncode_cours',o:'OFFRE_COURS\nid_offre',u:'ETUDIANT\nid_etudiant',p:'ENSEIGNANT\nid_enseignant',i:'INSCRIPTION\n(id_etudiant, id_offre)',a:'AFFECTATION\n(id_enseignant, id_offre)',s:'SEANCE\nid_seance',r:'SALLE\nid_salle'},[['d','c','1','0..*'],['d','u','1','0..*'],['d','p','1','0..*'],['c','o','1','0..*'],['o','i','1','0..*'],['u','i','1','0..*'],['o','a','1','0..*'],['p','a','1','0..*'],['o','s','1','0..*'],['r','s','1','0..*']]);
for(const spec of specs){
 let body=spec.body;
 if(spec.id==='communication')body=body.replace('rankdir=LR','rankdir=TB').replaceAll('shape=plain label=<','shape=box style=filled label=<');
 if(spec.id==='activity-order'){
  spec.engine='neato';body='layout=neato;splines=polyline;overlap=true;';
  const nodes=[['i','',5,12,'shape=circle style=filled width=.18 height=.18 fixedsize=true fillcolor="#122F37"'],['pan','Composer le panier',5,11],['m','',5,10,'shape=diamond style=filled width=.4 height=.4 fixedsize=true fillcolor=white'],['caisse','Passer à la caisse',5,9],['check','Vérifier tous les articles',5,8],['stock','',5,7,'shape=diamond style=filled width=.4 height=.4 fixedsize=true fillcolor=white'],['mod','Informer et modifier\nle panier',0,6],['infos','Saisir livraison\net paiement',5,6],['pm','',5,5,'shape=diamond style=filled width=.4 height=.4 fixedsize=true fillcolor=white'],['trait','Traiter le paiement',5,4],['pay','',5,3,'shape=diamond style=filled width=.4 height=.4 fixedsize=true fillcolor=white'],['retry','Informer et corriger\nle paiement',0,2],['ok','Confirmer la commande',5,2],['mail','Envoyer l’accusé\nde réception',5,1],['f','',5,0,'shape=doublecircle style=filled width=.18 height=.18 fixedsize=true fillcolor="#122F37"']];
  for(const [id,label,x,y,attrs=''] of nodes)body+=n(id,label,`pos="${x},${y}!" ${attrs}`);
  for(const [id,x,y] of [['u',-2,6],['v',-2,10],['w',-1.5,2],['z',-1.5,5]])body+=n(id,'',`shape=point style=invis width=.001 pos="${x},${y}!"`);
  for(const [x,y] of [['i','pan'],['pan','m'],['m','caisse'],['caisse','check'],['check','stock'],['infos','pm'],['pm','trait'],['trait','pay'],['ok','mail'],['mail','f']])body+=e(x,y);
  body+=e('stock','mod','[indisponible]')+e('stock','infos','[disponibles]')+e('pay','retry','[refusé]')+e('pay','ok','[accepté]');
  body+=e('mod','u','','arrowhead=none')+e('u','v','','arrowhead=none')+e('v','m')+e('retry','w','','arrowhead=none')+e('w','z','','arrowhead=none')+e('z','pm');
 }
 const dot=`digraph G {graph [bgcolor="white" fontname="Arial" pad=.25 nodesep=.55 ranksep=.65];node [shape=box style="rounded,filled" fillcolor="#EDF4F5" color="#005067" fontname="Arial" fontsize=15 margin=".15,.12"];edge [color="#005067" fontcolor="#122F37" fontname="Arial" fontsize=12 arrowsize=.8];${body}}`;
 const svg=viz.renderString(dot,{format:'svg',engine:spec.engine});
 await fs.writeFile(out+'/'+spec.id+'.dot',dot);await fs.writeFile(out+'/'+spec.id+'.svg',svg);
 await sharp(Buffer.from(svg),{density:210}).png().toFile(out+'/'+spec.id+'.png');
}
console.log('Rendered',specs.length,'solution diagrams');
