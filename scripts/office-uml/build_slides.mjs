import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import sharp from 'sharp';
process.on('uncaughtException',e=>{console.error(e.stack);process.exit(1);});
const BASE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(BASE,'../..');
const OUT=path.join(ROOT,'office/UML');
const docs=JSON.parse(await fs.readFile(path.join(BASE,'sources.json'),'utf8'));
const meta=JSON.parse(await fs.readFile(path.join(BASE,'image-meta.json'),'utf8'));
const p=Presentation.create({slideSize:{width:1280,height:720}});
p.theme.colorScheme={name:'3iL Programmes Experts',themeColors:{accent1:'#005067',accent2:'#E84D0D',accent3:'#3E338B',accent4:'#B81367',accent5:'#086694',accent6:'#00A9A6',bg1:'#FFFFFF',bg2:'#EDF4F5',tx1:'#122F37',tx2:'#5D747A',dk1:'#122F37',dk2:'#005067',lt1:'#FFFFFF',lt2:'#EDF4F5',hlink:'#086694',folHlink:'#3E338B'}};
function text(s,t,x,y,w,h,size=28,color='tx1',bold=false){const a=s.shapes.add({geometry:'textbox',name:t.slice(0,45),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=t;a.text.style={typeface:'Arial',fontSize:size,color,bold,verticalAlignment:'top',autoFit:'none',insets:{left:0,right:0,top:0,bottom:0}};return a;}
const bytes=async f=>new Uint8Array(await fs.readFile(f));
const logo=await bytes(path.join(ROOT,'assets/logos/3il-horizontal.png'));
const white=await bytes(path.join(ROOT,'assets/logos/3il-horizontal-white.png'));
const master=p.masters.add('3iL — Fondations');master.background.fill='bg1';
text(master,'3iL PROGRAMMES EXPERTS',64,672,650,20,16,'tx2');
const layouts={};
for(const [name,y,h] of [['Cours',220,360],['Illustration',175,465],['Exercice',220,360],['Code',215,395]]){
const l=p.layouts.add('3iL — '+name);l.setParentLayoutId(master.id);
const ph=l.placeholders;
const title=ph.add({type:'title',index:0,geometry:'textbox',position:{left:64,top:98,width:1152,height:110},text:'Titre'});title.text.style={typeface:'Arial',fontSize:44,bold:true,color:'accent1',insets:{left:0,right:0,top:0,bottom:0}};
if(name!=='Illustration'){const b=ph.add({type:'body',index:1,geometry:'textbox',position:{left:64,top:y,width:1152,height:h},text:''});b.text.style={typeface:'Arial',fontSize:28,color:'tx1',insets:{left:0,right:0,top:0,bottom:0}};}
layouts[name]=l;
}
const coverMaster=p.masters.add('3iL — Ouverture');coverMaster.background.fill='accent1';
coverMaster.images.add({blob:white,contentType:'image/png',alt:'3iL Ingénieurs',fit:'contain',position:{left:60,top:30,width:420,height:120}});
const cover=p.layouts.add('3iL — Couverture');cover.setParentLayoutId(coverMaster.id);
let chapter='';let current;let count=0;const plan=[];const noted=new Set();
const official=['https://www.omg.org/spec/UML/2.5.1','https://www.cs.cmu.edu/afs/cs/project/venari/www/subtype-toplas.html','https://cassandra.apache.org/doc/stable/cassandra/developing/data-modeling/data-modeling_rdbms.html','https://www.mongodb.com/docs/manual/core/schema-validation/','https://www.mongodb.com/docs/manual/data-modeling/enforce-consistency/transactions/'];
function notes(s,extra=''){
 const full=current&&!noted.has(current.path)?current.raw:'';if(current)noted.add(current.path);
 s.speakerNotes.textFrame.setText((full?'CONTENU COMPLET DU CHAPITRE OU DE L’ÉNONCÉ\n'+full+'\n\n':'')+extra+'\n[Sources]\n'+(current?'cours_methodologie-main.zip / Semaine 1 - UML - Merise / 01 - UML / '+current.path+'\n':'')+official.join('\n')+'\n[/Sources]');
}
function add(title,items=[],kind='Cours',extra=''){
 const s=p.slides.add();s.setLayout(layouts[kind]);
 const hd=s.placeholders.getItem('title');hd.text=title;hd.position={left:64,top:98,width:1152,height:110};
 const b=kind==='Illustration'?null:s.placeholders.getItem('body');if(b){b.text=items.join('\n\n');b.text.style={typeface:'Arial',fontSize:28,color:'tx1',autoFit:'none',insets:{left:0,right:0,top:0,bottom:0}};}
 s.images.add({blob:logo,contentType:'image/png',alt:'3iL Ingénieurs',fit:'contain',position:{left:991,top:14,width:225,height:64}});
 text(s,chapter.toUpperCase(),64,38,860,34,18,'accent2',true);
 text(s,String(++count).padStart(2,'0'),1154,669,62,24,18,'tx2');notes(s,extra);plan.push({n:count,title,kind,source:current?.path});return s;
}
function section(prefix,label){current=docs.find(d=>d.path.startsWith('Cours/')&&d.name.startsWith(prefix));if(!current)throw Error(prefix);chapter=label;}
async function fig(name,title,explain=''){
 const bands=({'02-example':[[0,.38],[.35,.75],[.715,1]],'03-example':[[0,.34],[.34,.64],[.64,1]],'04-example':[[0,.32],[.32,.59],[.59,.73],[.73,1]],'06c-example':[[0,.435],[.435,.73],[.73,1]],'07-example':[[0,.32],[.32,.68],[.68,1]],'03-symbols':[[0,.39],[.39,1]],'04-symbols':[[0,.69],[.69,1]],'05-symbols':[[0,.47],[.47,1]]})[name]||[[0,1]];
 const parts=bands.length;
 for(let part=0;part<parts;part++){
 const s=add(title+(parts>1?` · ${part+1}/${parts}`:''),[],'Illustration','Illustration source : images/'+name+'.png\n'+explain);
 const m=meta[name+'.png'];const top=bands[part][0];const bottom=1-bands[part][1];
 let maxh=explain?365:435;let w=1080,h=maxh;const visibleH=m.height*(1-top-bottom);
 const sc=Math.min(w/m.width,h/visibleH);w=m.width*sc;h=visibleH*sc;
 const buf=await sharp(path.join(BASE,'media',name+'.png')).extract({left:0,top:Math.floor(m.height*top),width:m.width,height:Math.min(m.height-Math.floor(m.height*top),Math.round(visibleH))}).png().toBuffer();
 s.images.add({blob:new Uint8Array(buf),contentType:'image/png',alt:title,fit:'contain',position:{left:(1280-w)/2,top:205,width:w,height:h}});
 if(explain)text(s,explain,64,584,1152,67,21,'accent1');
 }
}
function exercise(prefix,short,bullets){current=docs.find(d=>d.path.startsWith('Exercices/')&&d.name.startsWith(prefix));if(!current)throw Error(prefix);chapter='Mise en pratique';add(short,bullets,'Exercice','Énoncé complet ci-dessus. Aucun corrigé n’a été inventé.');}
const s=p.slides.add();s.setLayout(cover);text(s,'UML',64,227,1100,112,90,'lt1',true);text(s,'Modéliser les systèmes\net les données',64,355,1100,150,48,'lt1');text(s,'Cours · Exercices · Annexes',64,597,1100,40,26,'lt1');count++;plan.push({n:count,title:'UML',kind:'Couverture'});notes(s,'Support de projection accompagné du cours Word complet. Tous les fichiers Markdown ont une reprise intégrale dans les notes de leur première diapositive. Les figures source restent des images, le texte est éditable.');
chapter='Parcours';add('Du besoin au modèle',['Comprendre UML et choisir une vue pertinente.','Décrire les usages, les processus et les échanges.','Structurer les objets et les données.','Appliquer les notions dans 12 exercices ; approfondir POO, SQL et NoSQL.']);
section('01 -','01 · Comprendre UML');
add('Un langage commun pour concevoir',['Unifier les points de vue techniques et métier.','Visualiser, documenter et discuter un système avant son implémentation.','Choisir les diagrammes utiles à la question posée.']);
add('Quelques repères historiques',['1994–1995 : rapprochement des méthodes Booch, OMT et OOSE.','1997 : adoption d’UML par l’OMG.','2005 : UML 2.0 ; 2015 : UML 2.5.','2017 : publication d’UML 2.5.1.']);
add('Deux familles, plusieurs questions',['Structure : classes, objets, composants, déploiement, paquets, structure composite et profils.','Comportement : cas d’utilisation, activités et machines à états.','Interactions : séquence, communication, timing et vue d’ensemble d’interaction.']);
await fig('01-hierarchy','Lire la classification avec esprit critique','Schéma source : profils manquants ; les quatre vues d’interaction sont des diagrammes de comportement.');
section('02 -','02 · Cas d’utilisation');
add('Partir des objectifs des acteurs',['Délimitez le système et identifiez ses acteurs.','Nommez les services attendus du point de vue de l’utilisateur.','Utilisez les cas pour discuter les exigences et préparer les tests.']);
add('Distinguer les relations',['Association : participation d’un acteur à un cas.','Généralisation : spécialisation ; triangle creux vers l’élément général.','« include » : comportement inclus dans un autre cas.','« extend » : comportement ajouté sous condition au cas étendu.']);
await fig('02-symbols','La notation des cas d’utilisation','Rectification : la flèche de généralisation doit porter un triangle creux, pas une pointe pleine.');
await fig('02-example','Analyser une commande de repas','Schéma source à discuter : les relations include/extend doivent relier des cas, jamais des cadres.');
exercise("02 - Cas d'Utilisation - Exercice 1",'Exercice · Gestion d’événements',['Concevez les usages d’une plateforme d’organisation d’événements d’entreprise.','Identifiez les acteurs, les fonctionnalités et les besoins de collaboration.','Construisez le diagramme de cas d’utilisation.']);
exercise("02 - Cas d'utilisation - Exercice 2",'Exercice · Bibliothèque en ligne',['Identifiez les rôles humains et le système externe.','Couvrez la gestion des livres, l’emprunt si disponible et les rappels.','Regroupez les fonctionnalités et construisez le diagramme.']);
section('03 -','03 · Activités');
add('Décrire le cheminement d’un processus',['Modélisez les actions, le flux de contrôle et les décisions.','Utilisez les couloirs pour affecter les responsabilités.','Vérifiez les alternatives, retours et conditions de fin.']);
add('Parallélisme ou alternative ?',['Fork : divise un flux en plusieurs branches parallèles.','Join : synchronise les branches parallèles.','Merge : réunit des chemins alternatifs, sans synchronisation.','Garde : condition entre crochets sur une transition.']);
await fig('03-symbols','Les repères d’un diagramme d’activité');
await fig('03-example','Préparer et livrer une commande');
await fig('03-example2','Synchroniser plusieurs actions');
await fig('03-example3','Répartir les responsabilités');
await fig('03-example4','Exprimer les conditions de passage');
exercise("03 - Diagramme d'Activité - Exercice 1",'Exercice · Planifier un événement',['Sélection du type et du lieu, selon disponibilité et coût.','Configuration de la date, des invités et des fournisseurs.','Validation client ; retour à la configuration si nécessaire.','Modélisez le processus jusqu’au lancement des préparatifs.']);
exercise("03 - Diagramme d'Activité - Exercice 2",'Exercice · Commander en ligne',['Panier, caisse et vérification de disponibilité.','Livraison et paiement ; traiter les refus et les corrections.','Confirmation et accusé de réception.','Construisez le diagramme avec les chemins alternatifs.']);
section('04 -','04 · Séquences');
add('Rendre explicite l’ordre des échanges',['Placez les participants et leurs lignes de vie.','Ordonnez les messages de haut en bas.','Distinguez exécution, création et destruction.','Utilisez les fragments alt et loop pour les conditions et répétitions.']);
add('Choisir le bon type de message',['Synchrone : l’appelant attend la fin de l’appel.','Asynchrone : l’émetteur poursuit son exécution.','Réponse : retour associé à un appel synchrone.','Une réponse applicative asynchrone est un nouveau message.']);
await fig('04-symbols','Lire une interaction','L’intitulé « retour asynchrone » du document source n’est pas un type UML distinct.');
await fig('04-example','Suivre une commande dans le temps','Les croix du schéma source ne signifient pas « fin du scénario » : elles signifient destruction.');
exercise('04 - Diagramme de Séquence - Exercice 1','Exercice · Programmer une conférence',['Organisateur, plateforme et service de mails échangent les demandes.','Sélectionnez les participants, envoyez les invitations et collectez les réponses.','Compilez la liste, obtenez la validation et confirmez les participations.']);
exercise('04 - Diagramme de Séquence - Exercice 2','Exercice · Distributeur de billets',['Client, ATM, authentification et base de données.','Vérifiez le PIN : au maximum trois tentatives avant rétention de la carte.','Distinguez retrait et dépôt ; vérifiez les fonds.','Confirmez la transaction et rendez la carte.']);
section('05 -','05 · Classes');
add('Définir la structure du logiciel',['Classe : nom, attributs et opérations.','Classe abstraite : base non instanciable directement.','Interface : contrat à réaliser.','Le diagramme soutient la conception, la documentation et la refactorisation.']);
add('Lire les propriétés des membres',['Visibilité : + public, − privé, # protégé, ~ paquetage.','Un attribut dérivé est préfixé par /.','Un membre statique est souligné.','Dérivé et statique ne sont pas des niveaux de visibilité.']);
add('Choisir les relations utiles',['Association et navigabilité : quels objets sont liés et connus ?','Multiplicité : combien de liens sont autorisés ? Exemples : 1, 0..1, 1..*.','Généralisation, dépendance et réalisation : distinguez leurs intentions.','Agrégation et composition : deux relations tout/partie de force différente.']);
await fig('05-symbols','La notation des classes','Rectification : les multiplicités UML s’écrivent 1..* et 0..*, non 1,* et 0,n.');
await fig('05-example','Structurer la gestion des commandes');
exercise('05 - Diagramme de Classes - Exercice 1','Exercice · Classes d’une plateforme',['Événements et lieux ; participants et inscriptions.','Communications et messages ; budgets et dépenses.','Évaluations après événement.','Précisez attributs, méthodes et associations pour chaque responsabilité.']);
exercise('05 - Diagramme de Classes - Exercice 2','Exercice · Classes d’une bibliothèque',['Lecteur, bibliothécaire et bibliothèque.','Livre, emprunt et rappel.','Définissez les attributs et les méthodes indiqués dans l’énoncé.','Reliez les classes et justifiez les multiplicités.']);
section('06 -','06 · Objets et interactions');
add('Un objet est une instance concrète',['Un diagramme de classes décrit un modèle ; un diagramme d’objets montre un instant.','Nommez les instances sous la forme nomInstance:Classe, soulignée.','Renseignez les valeurs des attributs et les liens réellement présents.']);
await fig('06a-symbols','Passer de la classe à l’instance');
await fig('06a-example','Observer une configuration d’objets','Rectification : soulignez les noms d’instances ; ne confondez pas liens statiques et messages.');
add('La communication privilégie les liens',['Reliez les participants et numérotez leurs messages.','L’imbrication des numéros précise les appels.','Ajoutez conditions et répétitions lorsque le scénario l’exige.']);
await fig('06b-symbols','Les éléments d’une communication');
await fig('06b-example','Lire les échanges numérotés','Rectification : écrivez sophie:Client, et non Client:Sophie Dupont.');
add('Décrire le cycle de vie d’un objet',['Un état décrit une situation de l’objet.','Une transition répond à un événement, éventuellement sous garde.','Notation : événement [condition] / effet.','États composites et régions orthogonales décrivent des comportements plus complexes.']);
await fig('06c-symbols','États, choix et transitions','Le losange est un choix ; la garde est l’expression entre crochets portée par une transition.');
await fig('06c-example','Examiner le cycle de vie d’une commande','Schéma source à discuter : placez les gardes sur les transitions et distinguez actions et états.');
exercise('06 - Diagramme de Communication','Exercice · Réserver un livre',['John Doe demande « Les Misérables » ; Alice Smith vérifie la disponibilité.','L’emprunt est enregistré, puis confirmé au lecteur.','Créez les objets Lecteur, Bibliothécaire, Livre et Emprunt.','Numérotez les échanges et précisez les conditions.']);
exercise('06 - Diagramme État-Transition','Exercice · États d’une réservation',['Demande soumise → vérification → enregistrement → confirmation.','Précisez les événements qui déclenchent les transitions.','Ajoutez le cas EmpruntRefusé lorsque le livre n’est pas disponible.']);
section('09 -','09 · Modèles de données');
add('Compléter UML par les données',['Ces modèles ne sont pas des types de diagrammes UML.','Séparez modèle conceptuel, organisation logique et choix de stockage.','Justifiez les entités, relations, clés et contraintes selon les usages.']);
await fig('09a-example','Hiérarchique · une structure en arbre');
await fig('09b-example','Relationnel · tables et clés');
await fig('09c-example','Réseau · plusieurs liens possibles');
await fig('09d-example','Document · des structures imbriquées');
add('EA et ER : une famille, des notations',['Entité-association et entité-relation renvoient au même principe de modélisation conceptuelle.','Merise, Chen et patte d’oie emploient des conventions graphiques différentes.','Choisissez une notation et appliquez-la de manière cohérente.']);
await fig('09e-example','Lire une notation entité-association');
await fig('09f-example','Lire une notation en patte d’oie');
await fig('09f-symbols','Exprimer les cardinalités');
await fig('09g-example','Clé-valeur · accéder par une clé');
await fig('09h-example','Familles de colonnes · partir des requêtes','Ne confondez pas un système wide-column comme Cassandra et un moteur analytique colonnaire.');
await fig('09i-example01','Graphe · nœuds, relations et propriétés');
await fig('09i-example02','Cypher · créer un petit graphe');
add('Choisir selon les opérations attendues',['Clé-valeur : sessions, cache et accès directs.','Document : structures imbriquées et schéma évolutif.','Familles de colonnes : données partitionnées, requêtes prévues à la conception.','Graphe : parcours de relations, recommandations et détection de motifs.']);
exercise('07 - Modèle Entité-Relation - Exercice 1','Exercice · Données des événements',['Modélisez événements, lieux, participants et participations.','Ajoutez communications, budgets et évaluations.','Précisez attributs, associations et contraintes d’intégrité.']);
exercise('07 - Modèle Entité-Relation - Exercice 2','Exercice · Gestion universitaire',['Étudiants, enseignants, départements, salles et cours.','Reliez inscriptions, enseignements, rattachements et affectations de salles.','Définissez clés, attributs, relations et cardinalités.']);
section('Annexe 01','Annexe 01 · POO');
add('Encapsuler pour protéger les invariants',['Cachez les détails internes qui ne doivent pas être modifiés directement.','Exposez des opérations qui valident les changements d’état.','Les getters et setters sont un moyen, pas une obligation systématique.']);
add('Un contrat, plusieurs comportements',['Dog et Cat répondent à speak() selon leur type.','Une fonction commune peut manipuler le contrat Animal ou Speakable.','Ajouter un type compatible ne doit pas imposer de dupliquer le code client.']);
add('Interface et abstraction se complètent',['Une interface définit un contrat.','Une classe abstraite peut partager du comportement et laisser des opérations abstraites.','Dans l’exemple PHP : Dog et Cat sont Speakable ; Bee est Flyable.','Tous peuvent partager le contrat move() d’Animal.']);
add('SOLID · responsabilités et extension',['SRP : une responsabilité, une raison de changer.','OCP : étendre un comportement sans modifier le code stable qui le consomme.','LSP : une instance du sous-type doit pouvoir remplacer une instance du type de base.']);
add('SOLID · dépendre de contrats utiles',['ISP : plusieurs interfaces ciblées plutôt qu’un contrat trop large.','DIP : logique de haut niveau et détails dépendent d’abstractions.','Exemple : Service dépend d’IRepository, pas d’un stockage concret.']);
add('Déméter · limiter les dépendances',['Évitez de parcourir la structure interne d’autres objets.','Fragile : client → profil → adresse → rue.','Préférez une opération métier exposée par l’objet responsable.']);
add('Hollywood · inverser le contrôle',['« Ne nous appelez pas, nous vous appellerons. »','Un gestionnaire orchestre les callbacks ou écouteurs.','L’inscription déclenche un événement ; les écouteurs réalisent les actions associées.']);
// Native editable code excerpts; complete examples remain in Word and in the annex notes.
const codes=current.tokens.filter(t=>t.type==='code');
for(const [idx,title] of [[6,'Déméter · un couplage à éviter'],[7,'Déméter · une interface plus directe']]){if(codes[idx]){const cs=add(title,[],'Code');const b=cs.placeholders.getItem('body');b.text=codes[idx].text;b.text.style={typeface:'Consolas',fontSize:28,color:'tx1',insets:{left:0,top:0,right:0,bottom:0}};}}
section('Annexe 02','Annexe 02 · SQL et NoSQL');
add('SQL · structurer et garantir l’intégrité',['Tables, colonnes et lignes forment les données relationnelles.','Clés et contraintes contrôlent l’intégrité.','Index et vues facilitent certains accès.','Transactions et propriétés ACID encadrent les modifications.']);
add('Les familles de commandes SQL',['DDL : CREATE, ALTER, DROP.','DML : SELECT, INSERT, UPDATE, DELETE.','DCL : GRANT, REVOKE.','TCL : COMMIT, ROLLBACK, SAVEPOINT.']);
add('Concevoir les accès aux données',['Normalisez selon les besoins d’intégrité et de maintenance.','Choisissez les jointures selon les lignes à conserver.','Indexez les requêtes importantes et mesurez les performances.','Prévoyez transactions, droits d’accès et sauvegardes.']);
add('NoSQL · plusieurs familles de solutions',['Clé-valeur : Redis, DynamoDB ; document : MongoDB, CouchDB.','Familles de colonnes : Cassandra, HBase.','Graphe : Neo4j, ArangoDB, OrientDB.','Les garanties et les possibilités de requête varient selon le produit.']);
add('Éviter les oppositions trop simples',['SQL n’impose pas une seule stratégie de montée en charge.','NoSQL ne signifie ni « absence de schéma » ni « absence de transactions ».','Exemple : MongoDB propose validation de schéma et transactions.','Comparez les garanties, les accès et les contraintes opérationnelles.']);
chapter='Illustrations complémentaires';current=docs.find(d=>d.name.startsWith('01 -'));
await fig('07-example','Composants · organiser les services');
await fig('08-example','Déploiement · situer l’exécution');
chapter='Synthèse';add('Un modèle doit éclairer une décision',['Choisissez la vue qui répond à votre question.','Rendez explicites les hypothèses et les contraintes.','Vérifiez la cohérence entre exigences, interactions, classes et données.','Faites relire les modèles et maintenez-les avec le système.']);
await fs.mkdir(path.join(BASE,'slides-render'),{recursive:true});
await fs.writeFile(path.join(BASE,'slide-plan.json'),JSON.stringify(plan,null,2));
await fs.writeFile(path.join(BASE,'deck.json'),JSON.stringify(p.toProto()));
const pptx=await PresentationFile.exportPptx(p);await pptx.save(path.join(OUT,'3iL-UML-Presentation.pptx'));
console.log('Exported',count,'slides');
for(let i=0;i<p.slides.items.length;i++){
 const sl=p.slides.items[i];const png=await p.export({slide:sl,format:'png',scale:1});
 await fs.writeFile(path.join(BASE,'slides-render',`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
 await fs.writeFile(path.join(BASE,'slides-render',`slide-${i+1}.json`),await (await sl.export({format:'layout'})).text());
 if(i%10===0)console.log('Rendered',i+1);
}
