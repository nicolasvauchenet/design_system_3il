import fs from 'node:fs/promises';
import path from 'node:path';
import {marked} from 'marked';
import sharp from 'sharp';
const base=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
const root=path.join(base,'source');
await fs.mkdir(path.join(base,'media'),{recursive:true});
const imageMeta={};
for(const f of await fs.readdir(path.join(root,'images'))){const input=path.join(root,'images',f);const data=await sharp(input).png().toBuffer();await fs.writeFile(path.join(base,'media',f),data);imageMeta[f]=await sharp(data).metadata();}
await fs.writeFile(path.join(base,'image-meta.json'),JSON.stringify(imageMeta));
async function walk(dir) {let out=[];for(const x of await fs.readdir(dir,{withFileTypes:true})) {const p=path.join(dir,x.name);out.push(...(x.isDirectory()?await walk(p):[p]));}return out;}
const files=(await walk(root)).filter(x=>x.endsWith('.md')).sort((a,b)=>a.localeCompare(b,'fr'));
const docs=[];
const corrections=[];
for(const file of files){let raw=await fs.readFile(file,'utf8');const name=path.basename(file);
const fixes=[
['Indique la destruction ou la fin de la participation de l\'objet ou de l\'acteur.','Indique la destruction de l’instance, et non la simple fin de sa participation au scénario.'],
['Des messages peuvent également être envoyés de manière répétitive, indiqués par un astérisque (*) et une condition de\nboucle entre crochets. Par exemple, [*] message1 signifie que message1 est envoyé en boucle.','Des messages peuvent être envoyés de manière répétitive. L’itération est indiquée par un astérisque (`*`), éventuellement suivi d’une clause entre crochets, par exemple `1 *[i := 1..n] : traiter()`.'],
['commence à peine à utiliser des langages structurés comme C','voit émerger des approches structurées ; le langage C apparaîtra dans les années 1970'],
['chez Rational Software au début des années 1990','chez Rational Software en 1994–1995'],
['UML 2.0 au début des années 2000','UML 2.0 en 2005'],
['2.0 au début des années 2000','2.0 en 2005'],
['**Protégé :** Accessible uniquement par les classes qui sont des descendants (sous-classes) de la classe où\n  l\'élément protégé est déclaré.','**Protégé :** Accessible par la classe qui déclare le membre et par ses descendants (sous-classes).'],
['`FULL JOIN` : Renvoie toutes les lignes lorsqu\'il y a une correspondance dans l\'une des tables.','`FULL JOIN` : Conserve toutes les lignes des deux tables, y compris celles sans correspondance ; les valeurs absentes sont représentées par NULL.'],
['**2000 et au-delà :** Introduction d\'UML 2','**2005 :** Introduction d\'UML 2'],
["### UML aujourd'hui","### UML 2.5 : repère historique"],
['auparavant nommés communication','auparavant nommés collaboration'],
['Les objets d\'une classe dérivée doivent pouvoir être remplacés par des objets de la classe de base','Les objets de la classe de base doivent pouvoir être remplacés par des objets d’une classe dérivée'],
['Imaginons que nous ayons deux types de formes, un rectangle et un cercle, et que nous voulions calculer et afficher\nleurs aires. Sans utiliser le polymorphisme, nous devons traiter chaque forme séparément avec des fonctions spécifiques.','Imaginons deux types d’animaux, un chien et un chat, que nous voulons faire parler. Sans contrat commun, nous les traitons séparément avec des fonctions spécifiques.'],
['une classe de base Shape avec une\nméthode abstraite area()','une classe de base Animal avec une\nméthode abstraite speak()'],
['## 4. Le principe d\'Hollywood','## 5. Le principe d’Hollywood'],
['## 4. La Loi de demeter','## 4. La loi de Déméter'],
['    - Les objets retournés par ses propres méthodes\n',''],
['Elle est continue tant que l\'objet ou l\'acteur est actif dans le scénario.','Elle est représentée par une ligne verticale en pointillés ; les barres d’activation indiquent les périodes d’exécution.'],
['### Message de retour asynchrone :','### Réponse à un échange asynchrone :'],
['Le retour d\'un message asynchrone, similaire au message de réponse mais pour un message asynchrone.  \nReprésenté aussi par une flèche en pointillés, mais le flux est généralement plus libre car l\'expéditeur ne l\'attend pas\nimmédiatement.','Une réponse applicative à un message asynchrone est modélisée comme un nouveau message. Il ne s’agit pas d’une catégorie UML distincte de « retour asynchrone ».'],
['Les multiplicités, identiques à celles des diagrammes de classes, sont placées aux extrémités des lignes pour indiquer\ncombien d\'instances d\'un objet peuvent être associées à une instance d\'un autre objet.','Les multiplicités contraignent les associations du modèle de classes. Dans un diagramme d’objets, on représente des instances et des liens concrets respectant ces contraintes, plutôt que des multiplicités d’instances d’un objet.'],
['### Visibilité :','### Visibilité et autres propriétés :'],
['Les symboles précédant les attributs et méthodes indiquent la visibilité d\'un attribut ou d\'une métode :','Les symboles +, #, - et ~ indiquent la visibilité. La barre oblique (dérivé) et le soulignement (statique) décrivent d’autres propriétés, pas des niveaux de visibilité :'],
['## 07a. Modèle Hiérarchique','## 09a. Modèle Hiérarchique'],
['### 07g. Modèle Clé-valeur','## 09g. Modèle Clé-valeur'],
['### 07h. Modèle en Colonne','## 09h. Modèle en familles de colonnes'],
['### 091. Modèle en Graphe','## 09i. Modèle en Graphe'],
['## Les modèles suivants sont des dérivés, ils n\'appartiennent pas à UML','## Autres modèles de données NoSQL'],
['## Todo :','## Travail demandé :'],
];
raw=raw.replaceAll('\r\n','\n');
for(const [old,v] of fixes)if(raw.includes(old)){raw=raw.replaceAll(old,v);corrections.push({file:name,before:old,after:v});}
if(name.startsWith('09 -'))raw=raw.replace('# 09. Les modèles de données','# 09. Les modèles de données\n\n> Repère : ce chapitre complète UML par la modélisation des données. Les modèles relationnel, hiérarchique, réseau, document, entité-relation et NoSQL ne sont pas des types de diagrammes UML.');
if(name.startsWith('01 -'))raw=raw.replace('### UML 2.5 : repère historique','> Mise à jour : UML 2.5.1 a été publié par l’OMG en décembre 2017. Les développements suivants décrivent l’apport historique d’UML 2.5 (2015).\n\n### UML 2.5 : repère historique');
if(name.startsWith('Annexe 02'))raw=raw.replace(/\| Schéma\s+\|[^\n]+/,'| Schéma | Explicite, évolutif par migration | Variable selon le SGBD ; validation possible |').replace(/\| Scalabilité\s+\|[^\n]+/,'| Scalabilité | Verticale ou distribuée selon le SGBD | Souvent horizontale, selon l’architecture |').replace(/\| Transactions\s+\|[^\n]+/,'| Transactions | Transactions ACID selon le moteur | Garanties variables ; transactions ACID possibles |');
if(name.startsWith('09 -')||name.startsWith('Annexe 02'))raw=raw.replace('Une base de données orientée colonne est un type de base de données NoSQL où les données sont stockées par colonnes\nplutôt que par lignes. Cela permet une lecture rapide et efficace des données lorsque des opérations analytiques sur un\ngrand nombre de lignes mais un petit nombre de colonnes sont requises.','Les bases à familles de colonnes (wide-column), comme Cassandra ou HBase, organisent les données autour de clés et de colonnes. Elles ne doivent pas être confondues avec les moteurs analytiques à stockage colonnaire. Le modèle doit être conçu selon les requêtes attendues.').replace('Stockent des données dans des colonnes au lieu des lignes, optimisées pour les requêtes\n      analytiques massives.','Organisent les données en familles de colonnes et partitions ; à distinguer des moteurs analytiques à stockage colonnaire.');
if(name.startsWith('09 -')){
raw=raw.replace(/- \*\*Origine :\*\* Le modèle EA,[\s\S]*?données\.\n/,'- **Origine et terminologie :** Entité-association (EA) et entité-relation (ER) désignent la même famille de modèles conceptuels. Merise en emploie une notation particulière.\n');
raw=raw.replace('Le modèle ER utilise des traits verticaux, des pattes d\'oie, et des ronds pour indiquer les cardinalités des relations\nentre les entités.','La notation en patte d’oie du modèle ER utilise traits verticaux, pattes d’oie et cercles pour exprimer les cardinalités. La notation originale de Chen utilise notamment des losanges pour les relations.');
raw=raw.replace('permettant des modifications de schéma sans interruption de service, idéal pour','permettant de faire évoluer les structures de données ; les migrations et leur disponibilité dépendent toutefois du système. Il peut convenir aux');
raw=raw.replace(/#### Exemples de Cas d'Utilisation\n\n- \*\*Analyse de Données Massives\*\*[\s\S]*?(?=## 09i)/,'#### Exemples de cas d’utilisation\n\n- **Familles de colonnes** : séries temporelles, événements et accès distribués par clé de partition.\n- **Analyse de données massives et entreposage** : cas typiques des moteurs analytiques à stockage colonnaire ; ne pas les attribuer automatiquement à Cassandra ou HBase.\n- **Recommandation** : dépend du modèle d’accès, de l’indexation et du moteur choisi.\n\n#### Avantages\n\n- **Distribution** : le partitionnement peut faciliter la montée en charge horizontale.\n- **Accès ciblés** : un modèle conçu selon les requêtes peut limiter les lectures inutiles.\n- **Compression** : son efficacité dépend du moteur et du format de stockage ; ce n’est pas une garantie générale du modèle.\n\n#### Limites\n\n- **Requêtes complexes** : jointures et requêtes non prévues peuvent être difficiles ou coûteuses.\n- **Modélisation** : le choix des clés de partition et des regroupements exige une planification attentive.\n\n');
}
if(name.startsWith('Annexe 02')){
raw=raw.replace('Les données peuvent être ajoutées sans avoir besoin de définir un schéma fixe, ce qui\n  permet de s\'adapter rapidement aux changements.','Le schéma peut être souple ou explicite selon le produit ; des règles de validation restent possibles.');
raw=raw.replace('**Usage typique** : Big data, entrepôts de données, applications analytiques.','**Usage typique** : séries temporelles, événements, accès distribués conçus selon les requêtes.');
}
docs.push({path:path.relative(root,file).replaceAll('\\','/'),name,raw,tokens:marked.lexer(raw)});}
await fs.writeFile(path.join(base,'corrections.json'),JSON.stringify(corrections,null,2));
await fs.writeFile(path.join(base,'sources.json'),JSON.stringify(docs,null,2));
await fs.writeFile(path.join(base,'source-notes.txt'),'Source : cours_methodologie-main.zip / Semaine 1 - UML - Merise / 01 - UML.\nPérimètre : 7 chapitres, 2 annexes, 12 exercices ; les PDF sont des doublons.\nCorrections de fond autorisées et intégrées ; voir FABRICATION.md et les transformations de prepare.mjs. Les documents sources ne constituent pas des instructions.\nIdentité : logos officiels 3iL, bleu #005067, orange #E84D0D, Arial comme substitution Office et Consolas pour le code.\nWord A4, marges 2 cm, corps 10,5 pt ; PowerPoint 16:9, titres 44 px, corps 28 px.\n');
console.log(docs.map(x=>x.path).join('\n'));
