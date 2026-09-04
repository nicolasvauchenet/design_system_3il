import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {instance} from '@viz-js/viz';
import sharp from 'sharp';

// Graphviz is the sole geometry/connector renderer. DOT + SVG are retained.
const root=fileURLToPath(new URL('../../../',import.meta.url));
const out=path.join(root,'office/UML/diagrammes');
const viz=await instance();
const specs=[];
const q=s=>JSON.stringify(s);
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const table=(title,rows=[],italic=false)=>`<<TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="9" COLOR="#005067"><TR><TD BGCOLOR="#EDF4F5"><B>${italic?'<I>':''}${title}${italic?'</I>':''}</B></TD></TR>${rows.map(r=>`<HR/><TR><TD ALIGN="LEFT">${r}</TD></TR>`).join('')}</TABLE>>`;
const box=(id,title,rows=[],italic=false)=>`${id} [shape=plain label=${table(title,rows,italic)}];`;
const obj=(id,title,rows=[])=>box(id,`<U>${title}</U>`,rows);
const actor=(id,name)=>box(id,`«actor»<BR/>${name}`);
const action=(id,label)=>`${id} [label=${q(label)} shape=box style="rounded,filled"];`;
const decision=id=>`${id} [shape=diamond label="" width=.42 height=.42 fixedsize=true fillcolor=white];`;
const start=id=>`${id} [shape=circle label="" width=.20 height=.20 fixedsize=true fillcolor="#122F37" color="#122F37"];`;
const end=id=>`${id} [shape=doublecircle label="" width=.20 height=.20 fixedsize=true fillcolor="#122F37" color="#122F37"];`;
const bar=id=>`${id} [shape=rect label="" width=1.8 height=.065 fixedsize=true fillcolor="#122F37" color="#122F37"];`;
const edge=(a,b,label='',attrs='')=>`${a} -> ${b} [label=${q(label)} ${attrs}];`;
const link=(a,b,label='',attrs='')=>edge(a,b,label,`dir=none ${attrs}`);
function diagram(id,title,body,opts={}){specs.push({id,title,body,...opts});}
function group(id,label,body){return `subgraph cluster_${id} {label=${q(label)};labeljust=l;style="solid";color="#95B4BC";margin=24;${body}}`;}

diagram('01-hierarchy','Les 14 types de diagrammes UML',`
rankdir=LR;
${box('u','UML')}${box('s','Structure')}${box('b','Comportement')}${box('i','Interaction')}
${box('sl','7 vues structurelles',['Classes<BR ALIGN="LEFT"/>Objets<BR ALIGN="LEFT"/>Composants<BR ALIGN="LEFT"/>Déploiement<BR ALIGN="LEFT"/>Paquets<BR ALIGN="LEFT"/>Structure composite<BR ALIGN="LEFT"/>Profils'])}
${box('bl','3 vues comportementales',['Cas d’utilisation<BR ALIGN="LEFT"/>Activités<BR ALIGN="LEFT"/>Machines à états'])}
${box('il','4 vues d’interaction',['Séquence<BR ALIGN="LEFT"/>Communication<BR ALIGN="LEFT"/>Timing<BR ALIGN="LEFT"/>Vue d’ensemble d’interaction'])}
${link('u','s')}${link('u','b')}${link('s','sl')}${link('b','bl')}${link('b','i')}${link('i','il')}`);

diagram('02-symbols','Cas d’utilisation · relations',`
rankdir=LR;
${actor('visitor','Visiteur')}${actor('client','Client')}
${edge('client','visitor','généralisation','arrowhead=empty')}
${group('sys','Système de commande',`
node [shape=ellipse]; commande [label="Passer une\ncommande"]; calcul [label="Calculer\nle total"]; promo [label="Appliquer un code\npromotionnel"];
${edge('commande','calcul','«include»','style=dashed arrowhead=vee')}
${edge('promo','commande','«extend»\n[code fourni]','style=dashed arrowhead=vee')}`)}
${link('client','commande','association')}`);
diagram('02-example--1','Commande de repas · espace client',`
rankdir=LR;${actor('v','Visiteur')}${actor('c','Client')}${edge('c','v','','arrowhead=empty')}
${group('sys','Système de commande de repas',`node [shape=ellipse];menu [label="Consulter le menu"];ins [label="S’inscrire"];conn [label="Se connecter"];cmd [label="Passer une commande"];`)}
${link('v','menu')}${link('v','ins')}${link('c','conn')}${link('c','cmd')}
`);
diagram('02-example--2','Commande de repas · cuisine',`
rankdir=LR;${actor('c','Cuisinier')}${group('sys','Système de commande de repas',`node [shape=ellipse];prep [label="Suivre la préparation"];menu [label="Gérer le menu"];add [label="Ajouter un plat"];del [label="Retirer un plat"];stocks [label="Gérer les stocks"];
${edge('add','menu','','arrowhead=empty')}${edge('del','menu','','arrowhead=empty')}`)}${link('c','prep')}${link('c','menu')}${link('c','stocks')}`);
diagram('02-example--3','Commande de repas · gestion',`
rankdir=LR;${actor('g','Gestionnaire')}${group('sys','Système de commande de repas',`node [shape=ellipse];stats [label="Consulter les statistiques\ndes commandes"];stocks [label="Commander les stocks"];`)}${link('g','stats')}${link('g','stocks')}`);

diagram('03-symbols--1','Activités · choix et fusion',`
${start('i')}${end('f')}${action('a','Vérifier le stock')}${decision('d')}${decision('m')}${action('yes','Réserver le produit')}${action('no','Signaler l’indisponibilité')}
${edge('i','a')}${edge('a','d')}${edge('d','yes','[stock > 0]')}${edge('d','no','[else]')}${edge('yes','m')}${edge('no','m')}${edge('m','f')}
${box('note','Lecture',['Cercle plein : nœud initial<BR ALIGN="LEFT"/>Cible : fin de l’activité<BR ALIGN="LEFT"/>Losange à sorties : décision<BR ALIGN="LEFT"/>Losange à entrées : fusion<BR ALIGN="LEFT"/>[condition] : garde du flux'])}`);
diagram('03-symbols--2','Activités · parallélisme et responsabilités',`
${start('i')}${bar('fork')}${bar('join')}${end('f')}
${group('c','Cuisinier',action('a','Vérifier le contenu'))}
${group('s','Système',action('b','Vérifier l’adresse'))}
${edge('i','fork')}${edge('fork','a')}${edge('fork','b')}${edge('a','join')}${edge('b','join')}${edge('join','f')}
${box('note','Lecture',['Fourche : démarre les deux branches<BR ALIGN="LEFT"/>Jonction : attend les deux branches<BR ALIGN="LEFT"/>Partition : indique le responsable'])}`);
diagram('03-example--1','Commande · préparer et emballer',`
${group('c','Cuisinier',`${start('i')}${decision('m')}${action('a','Préparer la commande')}${decision('d')}${action('b','Emballer la commande')}${end('f')}
${edge('i','m')}${edge('m','a')}${edge('a','d')}${edge('d','m','[non prête]','constraint=false')}${edge('d','b','[prête]')}${edge('b','f')}`)}`);
diagram('03-example--2','Commande · contrôler avant livraison',`
${start('i')}${decision('merge')}${bar('fork')}${bar('join')}${decision('d')}${end('f')}
${group('c','Cuisinier',action('a','Vérifier le contenu'))}
${group('s','Système',action('b','Vérifier les informations\nde livraison'))}
${edge('i','merge')}${edge('merge','fork')}${edge('fork','a')}${edge('fork','b')}${edge('a','join')}${edge('b','join')}${edge('join','d')}${edge('d','merge','[contrôles non satisfaits]','constraint=false')}${edge('d','f','[contrôles satisfaits]')}`);
diagram('03-example--3','Commande · effectuer la livraison',`
${start('i')}${decision('m')}${end('f')}
${group('l','Livreur',`${action('a','Livrer la commande')}${decision('d')}`)}
${group('s','Système',action('b','Revérifier les informations\net reprogrammer la livraison'))}
${edge('i','m')}${edge('m','a')}${edge('a','d')}${edge('d','f','[réussie]')}${edge('d','b','[échouée]')}${edge('b','m','','constraint=false')}
${box('precondition','Précondition',['Commande prête et paiement validé.'])}`);
diagram('03-example2','Activités · synchroniser deux actions',`
${action('a','Lancer la préparation du colis')}${bar('fork')}${action('b','Imprimer l’étiquette')}${action('c','Emballer le produit')}${bar('join')}${action('d','Coller l’étiquette sur le colis')}
${edge('a','fork')}${edge('fork','b')}${edge('fork','c')}${edge('b','join')}${edge('c','join')}${edge('join','d')}`);
diagram('03-example3','Activités · partitions client et fournisseur',`
${group('client','Client',`${start('i')}${action('a','Commander un produit')}${action('d','Recevoir le produit')}${action('e','Régler la facture')}`)}
${group('fourn','Fournisseur',`${action('b','Gérer la commande')}${action('c','Expédier le produit')}${action('f','Encaisser le règlement')}${end('fin')}`)}
${edge('i','a')}${edge('a','b')}${edge('b','c')}${edge('c','d')}${edge('d','e')}${edge('e','f')}${edge('f','fin')}`);
diagram('03-example4','Activités · une garde sur chaque sortie',`
${action('a','Demander l’addition')}${decision('d')}${action('b','Régler la note')}${action('c','Faire la vaisselle')}
${edge('a','d')}${edge('d','b','[prix ≤ somme disponible]')}${edge('d','c','[else]')}`);

// neato with pinned points gives sequence messages a strict time order.
function sequence(id,title,names,messages){
 let b='layout=neato; splines=line; overlap=true;';
 const step=.74, width=5, total=(messages.length+2)*step;
 names.forEach((n,c)=>{b+=`h${c} [shape=box label=${q(n)} pos="${c*width},${total}!" width=2.6 height=.55];`;
 for(let r=0;r<=messages.length;r++)b+=`p${c}_${r} [shape=point label="" width=.001 height=.001 pos="${c*width},${total-(r+1)*step}!" style=invis];`;
 b+=`h${c} -> p${c}_0 [style=dashed arrowhead=none];`;
 for(let r=0;r<messages.length;r++)b+=`p${c}_${r} -> p${c}_${r+1} [style=dashed arrowhead=none];`;
 });
 messages.forEach(([a,z,label,kind='sync'],r)=>{b+=`p${a}_${r} -> p${z}_${r} [arrowhead=${kind==='sync'?'normal':'vee'} style=${kind==='reply'?'dashed':'solid'}]; msg${r} [shape=plaintext style=solid fontsize=13 label=${q(label)} pos="${(a+Math.sign(z-a)*.5)*width},${total-(r+1)*step+.18}!"];`;});
 diagram(id,title,b,{engine:'neato'});
}
sequence('04-example--1','Commande · consultation et création',['client:Client','système:Système'],[[0,1,'consulterMenu()'],[1,0,'menu','reply'],[0,1,'passerCommande()'],[1,0,'commande créée','reply']]);
sequence('04-example--2','Commande · préparation',['système:Système','cuisinier:Cuisinier'],[[0,1,'notifierPréparation(commande)','async'],[1,0,'signalerCommandePrête()','async']]);
sequence('04-example--3','Livraison · échec (commande prête et payée)',['système:Système','livreur:Livreur','client:Client'],[[0,1,'notifierLivraison()','async'],[1,0,'signalerÉchec()','async'],[0,2,'proposerReprogrammation()','async']]);
sequence('04-example--4','Livraison · réussite (commande prête et payée)',['système:Système','livreur:Livreur','client:Client'],[[0,1,'notifierLivraison()','async'],[1,0,'signalerLivraisonRéussie()','async'],[0,2,'notifierCommandeLivrée()','async']]);
sequence('04-symbols--1','Séquence · messages et lignes de vie',['émetteur:TypeA','récepteur:TypeB'],[[0,1,'appel() · synchrone'],[1,0,'résultat · réponse','reply'],[0,1,'signal() · asynchrone','async'],[1,0,'notification() · nouveau message','async']]);
// Complete interaction frames, with lifelines passing through the operands.
function fragment(id,operator,messages){
 let b='layout=neato; splines=line; overlap=true;';
 b+='h0 [shape=box label="client:Client" pos="0,5!"];h1 [shape=box label="service:Service" pos="5,5!"];';
 b+='node [shape=point width=.001 label="" style=invis];';
 for(let c=0;c<2;c++){
   for(let r=0;r<4;r++)b+=`p${c}${r} [pos="${c*5},${4.2-r}!"];`;
   b+=`h${c}->p${c}0->p${c}1->p${c}2->p${c}3 [style=dashed arrowhead=none];`;
 }
 b+=`subgraph cluster_frame {label=${q(operator)};labeljust=l;color="#005067";margin=28;p00;p10;p01;p11;p02;p12; cornerTop [pos="-1,4.65!"];cornerBottom [pos="6,1.65!"];`;
 b+='left [pos="-1,3.2!"];right [pos="6,3.2!"];';
 if(operator==='alt')b+='left->right [style=dashed arrowhead=none];';
 messages.forEach(([r,label])=>b+=`p0${r}->p1${r} [arrowhead=normal]; msg${r} [shape=plaintext style=solid fontsize=13 label=${q(label)} pos="2.5,${4.2-r+.2}!"];`);
 b+='}';diagram(id,operator==='alt'?'Séquence · alternative':'Séquence · boucle',b,{engine:'neato'});
}
fragment('04-symbols--2','alt',[[0,'[disponible] réserver()'],[2,'[else] signalerIndisponibilité()']]);
fragment('04-symbols--3','loop',[[1,'[élément suivant disponible] traiterÉlément()']]);
diagram('04-symbols--4','Séquence · création, exécution et destruction',`
layout=neato;splines=line;overlap=true;
h [shape=box label="service:Service" pos="0,5!"];
created [shape=box label="temp:Travail" pos="5,4!"];
node [shape=point label="" width=.001 style=invis];
a [pos="0,4!"];b [pos="0,3!"];c [pos="0,2!"];d [pos="0,1!"];
x [pos="5,3!"];y [pos="5,2!"];
h->a->b->c->d [style=dashed arrowhead=none];
created->x [style=dashed arrowhead=none];
execution [shape=box style=filled label="" width=.14 height=1 pos="5,2.5!"];
destroy [shape=plaintext style=solid label="×" fontsize=30 pos="5,1!"];
y->destroy [style=dashed arrowhead=none];
a->created [label="«create»" style=dashed arrowhead=vee];
b->execution:n [label="exécuter()" arrowhead=normal];
execution:s->c [label="résultat" style=dashed arrowhead=vee];
d->destroy [label="«destroy»" arrowhead=normal];
`,{engine:'neato'});

diagram('05-symbols--1','Classes · compartiments et propriétés',`
${box('c','Classe',['+ public : Type<BR ALIGN="LEFT"/>- privé : Type<BR ALIGN="LEFT"/># protégé : Type<BR ALIGN="LEFT"/>~ paquet : Type<BR ALIGN="LEFT"/>/ dérivé : Type<BR ALIGN="LEFT"/><U>statique : Type</U>','+ opération(paramètre : Type) : Type'])}
${box('a','ClasseAbstraite',['attribut : Type','opération() : Type'],true)}${box('i','«interface»<BR/>Contrat',['+ opération() : Type'])}
{rank=same;c;a;i;}`);
diagram('05-symbols--2','Classes · relations et multiplicités',`
rankdir=LR; pack=true; packmode="array3";
${box('c','Client')}${box('o','Commande')}${link('c','o','passe','taillabel="1" headlabel="0..*" labeldistance=2')}
${box('child','Classe spécialisée')}${box('parent','Classe générale')}${edge('child','parent','généralisation','arrowhead=empty')}
${box('impl','Implémentation')}${box('inter','«interface»<BR/>Contrat')}${edge('impl','inter','réalisation','style=dashed arrowhead=empty')}
${box('whole','Tout')}${box('part','Partie')}${edge('whole','part','composition','dir=both arrowtail=diamond arrowhead=none')}
${box('agg','Ensemble')}${box('member','Élément')}${edge('agg','member','agrégation partagée','dir=both arrowtail=odiamond arrowhead=none')}
${box('use','Client de service')}${box('service','Service')}${edge('use','service','dépendance','style=dashed arrowhead=vee')}`);
diagram('05-symbols--3','Classes · navigabilité',`
rankdir=LR;
${box('a','A')}${box('b','B')}${edge('a','b','navigable vers B','arrowhead=vee')}
${box('c','C')}${box('d','D')}${edge('c','d','navigable dans les deux sens','dir=both arrowtail=vee arrowhead=vee')}`);
diagram('05-example--1','Classes · spécialiser les utilisateurs',`
${box('user','Utilisateur',['- nom : String<BR ALIGN="LEFT"/>- email : String','+ modifierProfil() : void'],true)}
${box('client','Client',['- adresse : String'])}${box('cook','Cuisinier')}${box('driver','Livreur',['- position : String<BR ALIGN="LEFT"/>- statut : String'])}
${edge('user','client','','dir=back arrowtail=empty')}${edge('user','cook','','dir=back arrowtail=empty')}${edge('user','driver','','dir=back arrowtail=empty')}`);
diagram('05-example--2','Classes · commande et lignes de commande',`
rankdir=LR;
${box('client','Client')}${box('cook','Cuisinier')}${box('driver','Livreur')}
${box('cmd','Commande',['- dateCommande : DateTime<BR ALIGN="LEFT"/>- statut : String','+ calculerTotal() : Decimal'])}
${box('line','LigneCommande',['- quantité : Integer<BR ALIGN="LEFT"/>- prixUnitaire : Decimal'])}
${box('dish','Plat',['- nom : String<BR ALIGN="LEFT"/>- description : String<BR ALIGN="LEFT"/>- prix : Decimal'])}
${box('menu','Menu',['- dateMiseÀJour : DateTime'])}
${link('client','cmd','passe','taillabel="1" headlabel="0..*"')}${link('cook','cmd','prépare','taillabel="0..*" headlabel="0..*"')}${link('driver','cmd','livre','taillabel="0..1" headlabel="0..*"')}
${edge('cmd','line','contient','dir=both arrowtail=diamond arrowhead=none taillabel="1" headlabel="1..*"')}${link('line','dish','référence','taillabel="0..*" headlabel="1"')}${link('menu','dish','propose','taillabel="0..*" headlabel="0..*"')}`);
diagram('05-example--3','Classes · services et contrats',`
rankdir=LR;
${box('c','CommandeService',['+ créerCommande() : Commande<BR ALIGN="LEFT"/>+ mettreÀJourCommande() : void'])}
${box('p','PaiementService',['+ traiterPaiement() : void<BR ALIGN="LEFT"/>+ rembourserPaiement() : void'])}${box('ip','«interface»<BR/>IPaiement',['+ traiterPaiement() : void<BR ALIGN="LEFT"/>+ rembourserPaiement() : void'])}
${box('n','NotificationService',['+ notifierClient() : void<BR ALIGN="LEFT"/>+ notifierCuisinier() : void<BR ALIGN="LEFT"/>+ notifierLivreur() : void'])}${box('in','«interface»<BR/>INotification',['+ notifierClient() : void<BR ALIGN="LEFT"/>+ notifierCuisinier() : void<BR ALIGN="LEFT"/>+ notifierLivreur() : void'])}
${box('l','LivraisonService',['+ créerLivraison() : Livraison<BR ALIGN="LEFT"/>+ obtenirLivraison(id : Integer) : Livraison'])}
${edge('c','ip','','style=dashed arrowhead=vee')}${edge('p','ip','','style=dashed arrowhead=empty')}${edge('c','in','','style=dashed arrowhead=vee')}${edge('n','in','','style=dashed arrowhead=empty')}${edge('c','l','','style=dashed arrowhead=vee')}`);
diagram('06a-symbols','Objets · un instantané du modèle',`
rankdir=LR;${obj('c','client1:Client',['nom = &quot;Sophie Dupont&quot;'])}${obj('o','commande1:Commande',['statut = &quot;En préparation&quot;'])}${link('c','o','passe')}
${box('n','Lecture',['Nom d’instance et type soulignés<BR ALIGN="LEFT"/>Attributs : valeurs concrètes<BR ALIGN="LEFT"/>Trait : lien entre deux instances<BR ALIGN="LEFT"/>Pas de messages ni de multiplicités sur cet instantané'])}`);
diagram('06a-example','Objets · commande de Sophie',`
${obj('c','client1:Client',['nom = &quot;Sophie Dupont&quot;'])}${obj('o','commande1:Commande',['statut = &quot;En préparation&quot;'])}${obj('cook','cuisinier1:Cuisinier',['nom = &quot;Michel&quot;'])}
${obj('l1','ligne1:LigneCommande',['quantité = 1<BR ALIGN="LEFT"/>prixUnitaire = 12.50'])}${obj('l2','ligne2:LigneCommande',['quantité = 1<BR ALIGN="LEFT"/>prixUnitaire = 15.00'])}
${obj('d1','plat1:Plat',['nom = &quot;Pizza Margherita&quot;<BR ALIGN="LEFT"/>prix = 12.50'])}${obj('d2','plat2:Plat',['nom = &quot;Pâtes Carbonara&quot;<BR ALIGN="LEFT"/>prix = 15.00'])}${obj('m','menu1:Menu',['dateMiseÀJour = &quot;2024-09-30&quot;'])}
${link('c','o','passe')}${link('cook','o','prépare')}${edge('o','l1','','dir=both arrowtail=diamond arrowhead=none')}${edge('o','l2','','dir=both arrowtail=diamond arrowhead=none')}${link('l1','d1')}${link('l2','d2')}${link('m','d1','propose')}${link('m','d2','propose')}`);
diagram('06b-symbols','Communication · ordre et conditions',`
rankdir=LR;${obj('a','client:Client')}${obj('b','service:CommandeService')}${obj('c','stock:Stock')}
${edge('a','b','1 : passerCommande()','arrowhead=normal')}${edge('b','c','1.1 [disponible] : réserver()\n1.2 *[i := 1..n] : traiterLigne(i)','arrowhead=normal')}
${box('n','Lecture',['Les numéros indiquent l’ordre des messages.<BR ALIGN="LEFT"/>1.1 : appel imbriqué dans 1.<BR ALIGN="LEFT"/>[condition] : envoi conditionnel.<BR ALIGN="LEFT"/>* : itération.'])}`);
diagram('06b-example','Communication · orchestration d’une commande',`
${obj('c','sophie:Client')}${obj('s','service:CommandeService')}${obj('k','michel:Cuisinier')}${obj('l','pierre:Livreur')}
${edge('c','s','1 : passerCommande()','arrowhead=normal')}${edge('s','k','1.1 : demanderPréparation()','arrowhead=vee')}${edge('k','s','2 : signalerCommandePrête()','arrowhead=vee')}${edge('s','l','3 [prête et payée] :\ndemanderLivraison()','arrowhead=vee')}${edge('l','s','4 : signalerLivraisonRéussie()','arrowhead=vee')}${edge('s','c','5 : notifierCommandeLivrée()','arrowhead=vee')}`);
diagram('06c-symbols','États · transition et choix',`
${start('i')}${end('f')}${action('a','En attente\nentry / afficherAttente()')}${decision('d')}${action('b','Acceptée')}${action('c','Refusée')}
${edge('i','a')}${edge('a','d','valider()')}${edge('d','b','[dossier complet] / enregistrer()')}${edge('d','c','[else]')}${edge('b','f')}${edge('c','f')}
${box('n','Syntaxe',['événement [garde] / effet<BR ALIGN="LEFT"/>entry / effet d’entrée<BR ALIGN="LEFT"/>do / activité pendant l’état<BR ALIGN="LEFT"/>exit / effet de sortie'])}`);
// Author-confirmed rule: payment and preparation run concurrently; delivery waits for both.
diagram('06c-example--1','Commande · création et validation',`${start('i')}${action('a','Créée')}${action('b','En traitement')}${edge('i','a')}${edge('a','b','validerCommande()')}`);
diagram('06c-example--2','Commande · traitement parallèle',`
${group('composite','En traitement',`
style="rounded";
${group('prep','Région : préparation',`style=dashed;${start('i1')}${action('a','En préparation\ndo / préparerPlats()')}${action('b','Plats prêts')}${end('f1')}${edge('i1','a')}${edge('a','b','platsPréparés()')}${edge('b','f1')}`)}
${group('pay','Région : paiement',`style=dashed;${start('i2')}${action('c','En vérification')}${action('d','Paiement validé')}${end('f2')}${edge('i2','c')}${edge('c','d','paiementAccepté()')}${edge('d','f2')}`)}
`)}
`);
diagram('06c-example--3','Commande · livraison et clôture',`
${action('a','En traitement')}${action('b','En cours de livraison\nentry / vérifierDestination()')}${action('c','Livrée\nentry / notifierClient()')}${end('f')}
${edge('a','b','/ créerLivraison()')}${edge('b','b','livraisonÉchouée() / reprogrammer()')}${edge('b','c','livraisonRéussie()')}${edge('c','f','confirmerRéception()')}
${box('completion','Achèvement du traitement',['La transition sans événement est déclenchée<BR ALIGN="LEFT"/>quand les deux régions sont terminées :<BR ALIGN="LEFT"/>plats prêts ET paiement validé.'])}
${link('completion','a','','style=dashed constraint=false')}`);

diagram('07-example--1','Composants · menus',`
rankdir=LR;${box('c','«component»<BR/>Commandes')}${box('m','«component»<BR/>Menus')}${box('i','«interface»<BR/>IMenu',['+ consulterMenu()'])}${edge('c','i','«use»','style=dashed arrowhead=vee')}${edge('m','i','','style=dashed arrowhead=empty')}`);
diagram('07-example--2','Composants · commande et paiement',`
rankdir=LR;${box('c','«component»<BR/>Commandes')}${box('p','«component»<BR/>Paiements')}${box('i','«interface»<BR/>IPaiement',['+ traiterPaiement()<BR ALIGN="LEFT"/>+ rembourserPaiement()'])}${edge('c','i','«use»','style=dashed arrowhead=vee')}${edge('p','i','','style=dashed arrowhead=empty')}`);
diagram('07-example--3','Composants · notifications et livraison',`
rankdir=LR;${box('c','«component»<BR/>Commandes')}${box('n','«component»<BR/>Notifications')}${box('l','«component»<BR/>Livraisons')}${box('i','«interface»<BR/>INotification',['+ notifierClient()<BR ALIGN="LEFT"/>+ notifierCuisinier()<BR ALIGN="LEFT"/>+ notifierLivreur()'])}${edge('c','i','«use»','style=dashed arrowhead=vee')}${edge('l','i','«use»','style=dashed arrowhead=vee')}${edge('n','i','','style=dashed arrowhead=empty')}`);
diagram('08-example','Déploiement · chemins de communication',`
rankdir=LR;node [shape=box3d];
client [label="«device»\nPoste client\n\n«executionEnvironment»\nNavigateur\n\n«artifact»\nclient web"];
server [label="«device»\nServeur applicatif\n\n«executionEnvironment»\nRuntime applicatif\n\n«artifact»\ncommandes / menus / notifications"];
db [label="«executionEnvironment»\nPostgreSQL"];
mail [label="«executionEnvironment»\nServeur SMTP externe"];
pay [label="«executionEnvironment»\nService de paiement externe"];
${link('client','server','HTTPS / API REST')}${link('server','db','Protocole PostgreSQL / TCP')}${link('server','mail','SMTP')}${link('server','pay','HTTPS')}`);

diagram('09a-example','Modèle hiérarchique · extrait d’une arborescence',`
${box('a','Grands singes actuels')}${box('o','Orangs-outans')}${box('g','Gorilles')}${box('c','Chimpanzés')}${box('h','Humains')}
${link('a','o')}${link('a','g')}${link('a','c')}${link('a','h')}${box('o1','Orang-outan de Bornéo')}${box('o2','Orang-outan de Sumatra')}${box('g1','Gorille de l’Est')}${box('g2','Gorille de l’Ouest')}${box('c1','Chimpanzé commun')}${box('c2','Bonobo')}${box('h1','Homo sapiens')}
${link('o','o1')}${link('o','o2')}${link('g','g1')}${link('g','g2')}${link('c','c1')}${link('c','c2')}${link('h','h1')}`);
diagram('09b-example','Modèle relationnel · clés et table de liaison',`
${box('s','Étudiant',['PK idÉtudiant<BR ALIGN="LEFT"/>prénom<BR ALIGN="LEFT"/>nom'])}${box('p','Fournisseur',['PK idFournisseur<BR ALIGN="LEFT"/>nom'])}${box('c','Contrat',['PK, FK idÉtudiant<BR ALIGN="LEFT"/>PK, FK idFournisseur<BR ALIGN="LEFT"/>typeOffre<BR ALIGN="LEFT"/>dateDébut'])}
${edge('c','s','FK idÉtudiant → PK','arrowhead=vee')}${edge('c','p','FK idFournisseur → PK','arrowhead=vee')}`);
diagram('09c-example','Modèle réseau · plusieurs chemins d’accès',`
${box('v','Vendeur')}${box('e','Employé')}${box('c','Client')}${box('p','Produit')}${box('t','Transaction de vente')}
${edge('v','e')}${edge('v','c')}${edge('v','p')}${edge('e','t')}${edge('c','t')}${edge('p','t')}`);
diagram('09d-example','Modèle document · champs variables et imbrication',`
rankdir=TB;${box('keys','Collection clients',['client1<BR ALIGN="LEFT"/>client2<BR ALIGN="LEFT"/>client3'])}
${box('d1','client1',['nom : Dupont<BR ALIGN="LEFT"/>prénom : Nico<BR ALIGN="LEFT"/>téléphone : { portable : … }'])}${box('d2','client2',['nom : Martin<BR ALIGN="LEFT"/>prénom : Tina<BR ALIGN="LEFT"/>téléphone : { portable : …, fixe : … }<BR ALIGN="LEFT"/>email : …'])}${box('d3','client3',['nom : Martin<BR ALIGN="LEFT"/>prénom : Tina'])}${link('keys','d1')}${link('keys','d2')}${link('keys','d3')}`);
diagram('09e-example','Entité-association · vols et départs',`
rankdir=LR;
${box('v','Vol',['<U>numéroVol</U><BR ALIGN="LEFT"/>heureDépartPrévue<BR ALIGN="LEFT"/>heureArrivéePrévue'])}${box('d','Départ',['<U>numéroDépart</U><BR ALIGN="LEFT"/>date<BR ALIGN="LEFT"/>heureDépartEffective'])}${box('a','Avion',['<U>numéroAvion</U><BR ALIGN="LEFT"/>dateMiseEnService<BR ALIGN="LEFT"/>modèle<BR ALIGN="LEFT"/>propriétaire'])}${box('p','Pilote',['<U>numéroPilote</U><BR ALIGN="LEFT"/>nom<BR ALIGN="LEFT"/>grade'])}
cor [shape=ellipse label="correspondre"];uti [shape=ellipse label="utiliser"];ass [shape=ellipse label="assurer"];
${link('d','cor','','taillabel="1,1"')}${link('cor','v','','headlabel="0,n"')}${link('d','uti','','taillabel="1,1"')}${link('uti','a','','headlabel="0,n"')}${link('d','ass','','taillabel="1,n"')}${link('ass','p','','headlabel="0,n"')}`);
diagram('09f-example--1','Entité-relation · commandes en patte d’oie',`
rankdir=LR;
${box('c','Client',['PK idClient<BR ALIGN="LEFT"/>nom<BR ALIGN="LEFT"/>email'])}${box('o','Commande',['PK idCommande<BR ALIGN="LEFT"/>FK idClient<BR ALIGN="LEFT"/>dateCommande<BR ALIGN="LEFT"/>statut'])}${box('l','LigneCommande',['PK, FK idCommande<BR ALIGN="LEFT"/>PK numéroLigne<BR ALIGN="LEFT"/>FK idPlat<BR ALIGN="LEFT"/>quantité<BR ALIGN="LEFT"/>prixUnitaire'])}${box('p','Plat',['PK idPlat<BR ALIGN="LEFT"/>nom<BR ALIGN="LEFT"/>prix'])}
${edge('c','o','','dir=both arrowtail=teetee arrowhead=crowodot')}${edge('o','l','','dir=both arrowtail=teetee arrowhead=crowtee')}${edge('p','l','','dir=both arrowtail=teetee arrowhead=crowodot')}`);
diagram('09f-example--2','Entité-relation · préparation et livraison',`
rankdir=LR;
${box('o','Commande',['PK idCommande<BR ALIGN="LEFT"/>FK idLivreur (facultatif)'])}${box('p','Paiement',['PK idPaiement<BR ALIGN="LEFT"/>FK idCommande (unique)<BR ALIGN="LEFT"/>montant : Decimal<BR ALIGN="LEFT"/>statut'])}${box('d','Livreur',['PK idLivreur<BR ALIGN="LEFT"/>nom<BR ALIGN="LEFT"/>position<BR ALIGN="LEFT"/>statut'])}${box('c','Cuisinier',['PK idCuisinier<BR ALIGN="LEFT"/>nom<BR ALIGN="LEFT"/>email'])}${box('a','AffectationPréparation',['PK, FK idCommande<BR ALIGN="LEFT"/>PK, FK idCuisinier'])}
${edge('o','p','','dir=both arrowtail=teetee arrowhead=teetee')}${edge('d','o','','dir=both arrowtail=teeodot arrowhead=crowodot')}${edge('o','a','','dir=both arrowtail=teetee arrowhead=crowodot')}${edge('c','a','','dir=both arrowtail=teetee arrowhead=crowodot')}`);
diagram('09f-example--3','Entité-relation · catalogue et menus',`
rankdir=LR;${box('m','Menu',['PK idMenu<BR ALIGN="LEFT"/>dateMiseÀJour'])}${box('a','Proposition',['PK, FK idMenu<BR ALIGN="LEFT"/>PK, FK idPlat'])}${box('p','Plat',['PK idPlat<BR ALIGN="LEFT"/>nom<BR ALIGN="LEFT"/>description<BR ALIGN="LEFT"/>prix : Decimal'])}
${edge('m','a','','dir=both arrowtail=teetee arrowhead=crowodot')}${edge('p','a','','dir=both arrowtail=teetee arrowhead=crowodot')}`);
diagram('09f-symbols','Patte d’oie · lire la multiplicité à l’extrémité',`
rankdir=LR;
${['Un seul','Zéro ou un','Un ou plusieurs','Zéro ou plusieurs'].map((label,i)=>`${box('a'+i,'A')}${box('b'+i,label)}${edge('a'+i,'b'+i,'',`arrowhead=${['teetee','teeodot','crowtee','crowodot'][i]} minlen=3`)}`).join('\n')}`);
diagram('09g-example','Clé-valeur · une valeur par clé',`
rankdir=LR;${box('u','user_123')}${box('uv','Valeur',['{ name: &quot;John Doe&quot;,<BR ALIGN="LEFT"/>  email: &quot;john.doe@example.com&quot;,<BR ALIGN="LEFT"/>  age: 30 }'])}${box('o','order_001')}${box('ov','Valeur',['{ product: &quot;Laptop&quot;,<BR ALIGN="LEFT"/>  quantity: 2,<BR ALIGN="LEFT"/>  unitPrice: 1500 }'])}${link('u','uv')}${link('o','ov')}`);
diagram('09h-example','Familles de colonnes · commandes par utilisateur',`
${box('q','Requête visée',['Retrouver les commandes d’un utilisateur<BR ALIGN="LEFT"/>dans l’ordre des dates.'])}
${box('p','Partition : user_123',['Clé de partition : user_id<BR ALIGN="LEFT"/>Clustering : date, order_id','2023-01-01 | order_001<BR ALIGN="LEFT"/>product = Laptop ; quantity = 2 ; unitPrice = 1500','2023-02-10 | order_003<BR ALIGN="LEFT"/>product = Mouse ; quantity = 1 ; unitPrice = 30'])}
${edge('q','p','accès par clé','arrowhead=vee')}`);
diagram('09i-example01','Graphe de propriétés · utilisateurs et achats',`
${box('u1','User',['id = usr_123<BR ALIGN="LEFT"/>name = John Doe<BR ALIGN="LEFT"/>age = 30'])}${box('u2','User',['id = usr_124<BR ALIGN="LEFT"/>name = Jane Smith<BR ALIGN="LEFT"/>age = 25'])}${box('p1','Product',['id = prod_001<BR ALIGN="LEFT"/>name = Laptop<BR ALIGN="LEFT"/>price = 1500'])}${box('p2','Product',['id = prod_002<BR ALIGN="LEFT"/>name = Smartphone<BR ALIGN="LEFT"/>price = 800'])}
${edge('u1','u2','FRIEND\nsince = 2022-06-15')}${edge('u1','p1','PURCHASED\ndate = 2023-01-01 ; quantity = 2')}${edge('u2','p2','PURCHASED\ndate = 2023-01-02 ; quantity = 1')}`);
diagram('09i-example02','Cypher · créer le graphe de propriétés',`
${box('code','Création des nœuds et des relations',[
esc('CREATE (u1:User {id: "usr_123", name: "John Doe", age: 30})')+'<BR ALIGN="LEFT"/>'+esc('CREATE (u2:User {id: "usr_124", name: "Jane Smith", age: 25})'),
esc('CREATE (p1:Product {id: "prod_001", name: "Laptop", price: 1500})')+'<BR ALIGN="LEFT"/>'+esc('CREATE (p2:Product {id: "prod_002", name: "Smartphone", price: 800})'),
esc('CREATE (u1)-[:PURCHASED {date: "2023-01-01", quantity: 2}]->(p1)')+'<BR ALIGN="LEFT"/>'+esc('CREATE (u2)-[:PURCHASED {date: "2023-01-02", quantity: 1}]->(p2)'),
esc('CREATE (u1)-[:FRIEND {since: "2022-06-15"}]->(u2)')])}`);

await fs.mkdir(out,{recursive:true});
const manifest={renderer:'Graphviz via @viz-js/viz',reference:'https://www.omg.org/spec/UML/2.5.1',figures:{}};
for(const s of specs){
 if(['06a-example','09h-example','09i-example01'].includes(s.id)||s.id.startsWith('06c-'))s.body='rankdir=LR;'+s.body;
 if(s.id.startsWith('03-'))s.body='rankdir=LR;'+s.body.replaceAll('width=1.8 height=.065','width=.065 height=1.2');
 const dot=`digraph G { graph [bgcolor="white" pad=.25 nodesep=.5 ranksep=.65 fontname="Arial" fontsize=20 fontcolor="#005067" labelloc=t label=${q(s.title)}]; node [fontname="Arial" fontsize=16 color="#005067" fontcolor="#122F37" fillcolor="white" style=filled penwidth=1.5 margin=".16,.10"]; edge [fontname="Arial" fontsize=13 color="#005067" fontcolor="#122F37" penwidth=1.4 arrowsize=.8 arrowhead=vee]; ${s.body} }`;
 await fs.writeFile(path.join(out,s.id+'.dot'),dot);
 const svg=viz.renderString(dot,{format:'svg',engine:s.engine||'dot'});
 await fs.writeFile(path.join(out,s.id+'.svg'),svg);
 await fs.writeFile(path.join(out,s.id+'.png'),await sharp(Buffer.from(svg),{density:190}).flatten({background:'#fff'}).png().toBuffer());
 const id=s.id.split('--')[0];(manifest.figures[id]??=[]).push({id:s.id,title:s.title});
}
// Composite views for Word; complete panels, never arbitrary crops through relations.
for(const [id,parts] of Object.entries(manifest.figures)){
 if(parts.length===1)continue;
 const images=[];let height=0;const width=2000;
 for(const part of parts){const data=await sharp(path.join(out,part.id+'.png')).resize({width}).png().toBuffer();const m=await sharp(data).metadata();images.push({input:data,top:height,left:0});height+=m.height+45;}
 await sharp({create:{width,height,channels:3,background:'#fff'}}).composite(images).png().toFile(path.join(out,id+'.png'));
}
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(`${Object.keys(manifest.figures).length} figures, ${specs.length} panneaux DOT/SVG/PNG : ${out}`);
