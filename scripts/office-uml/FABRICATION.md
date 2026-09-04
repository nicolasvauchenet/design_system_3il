# Fabrication du pilote Office UML

## Livraison courante avec corrigés

Les seuls livrables dans `office/UML/` sont désormais `3iL-UML-Cours.docx` (110 pages au rendu de contrôle) et `3iL-UML-Presentation.pptx` (99 diapositives, contenu inchangé). Les versions précédentes et les notices de changements ont été retirées du dossier de livraison. Les diagrammes du cours sont rangés dans `scripts/office-uml/diagrammes/`.

`corriges_exercices.json` contient les douze propositions de résolution, hypothèses et critères. `corriges-diagrams.mjs` génère douze schémas avec Graphviz et Sharp dans `tmp/uml-corriges/figures/`. Copier le module dans un dossier temporaire disposant du lien vers les dépendances Node avant exécution depuis la racine. `append_corriges.py` ajoute l’annexe au Word de référence et écrit une copie dans `tmp/uml-corriges/`, sans remplacer directement la livraison. Après validation visuelle, copier le résultat vers le fichier final. Les deux schémas de séquence montrent des traces nominales ; les variantes et boucles sont décrites dans le corrigé écrit. Les dessins de classes et de données présentent les associations, avec les attributs et contraintes détaillés dans le texte.

Recette : douze corrigés et douze schémas ; cibles des liens internes vérifiées ; paragraphes préexistants conservés hors couverture et description du parcours. Les 83 pages du corps initial restent identiques au pixel près ; couverture, sommaire et annexe ont été contrôlés séparément.

**Attention : la chaîne historique décrite ci-dessous n’est pas une commande de mise à jour de la livraison finale.** Ses noms de fichiers désignent les anciennes étapes de fabrication, retirées du dossier public. Ne pas exécuter ces anciens générateurs sur `office/UML/` sans rediriger leurs sorties et adapter leurs entrées. Ils pourraient recréer les anciennes versions. Pour modifier le document courant, partir d’une copie du fichier final et conserver l’annexe corrigée.

Ces scripts sont destinés à la maintenance technique, pas aux utilisateurs des supports Office. Ils ne constituent pas un convertisseur Markdown universel : le plan pédagogique et les découpes de figures PowerPoint ont été composés pour ce cours.

## Sources et traçabilité

- Archive fournie : `cours_methodologie-main.zip`, dossier `Semaine 1 - UML - Merise/01 - UML` uniquement.
- `source/` conserve les documents et illustrations extraits sans modification. Les PDF de ce dossier sont des doublons de rendu.
- `prepare.mjs` applique les corrections éditoriales autorisées, analyse le Markdown avec `marked` et normalise les images avec `sharp`.
- `sources.json` conserve les 21 textes corrigés et leur structure analysée. Comparez son champ `raw` au fichier correspondant dans `source/` pour obtenir la totalité des changements textuels.
- `corrections.json` journalise les remplacements simples ; les transformations complémentaires, notamment SQL/NoSQL, sont explicites dans `prepare.mjs`. Ce journal seul n’est donc pas un diff exhaustif.
- `build_word.py` génère le cours complet avec python-docx.
- `build_slides.mjs` génère la présentation avec `@oai/artifact-tool`, les masques et les dispositions natifs. Les 21 textes corrigés complets sont inclus dans les notes, un texte à la première diapositive associée.
- `slide-plan.json` relie les numéros de diapositives aux fichiers sources.
- `check_office.py` vérifie les XML, les liens internes Word et la présence des 21 documents complets dans les notes.

## Corrections pédagogiques principales

Chronologie UML ; substitution de Liskov ; concordance du polymorphisme Animal/speak ; numérotation et Déméter ; ligne de vie et destruction ; vocabulaire de communication ; multiplicité et visibilité ; distinction UML/modèles de données ; parenté EA/ER ; jointure FULL JOIN ; nuances de schéma, transactions et montée en charge SQL/NoSQL ; distinction familles de colonnes et stockage analytique colonnaire.

La révision du 4 septembre 2026 remplace les 31 groupes d’images par 52 vues redessinées. Les anciennes rectifications visibles sont retirées ; les changements sont consignés dans `office/UML/JOURNAL-CORRECTIONS.md`.

Références utilisées pour les vérifications de fond :

- [OMG UML 2.5.1](https://www.omg.org/spec/UML/2.5.1)
- [Liskov et Wing, Behavioral Notion of Subtyping](https://www.cs.cmu.edu/afs/cs/project/venari/www/subtype-toplas.html)
- [Cassandra : modèle de données](https://cassandra.apache.org/doc/stable/cassandra/developing/data-modeling/data-modeling_rdbms.html)
- [MongoDB : validation](https://www.mongodb.com/docs/manual/core/schema-validation/)
- [MongoDB : transactions](https://www.mongodb.com/docs/manual/data-modeling/enforce-consistency/transactions/)

## Régénération de l’édition révisée

Les scripts `build_word.py` et `build_slides.mjs` ci-dessous fabriquent l’ancienne édition, utilisée comme base. Ne les confondez pas avec les générateurs de révision.

Pour modifier les diagrammes, éditer `revision/redraw-diagrams.mjs`, puis exécuter depuis la racine avec les dépendances Node résolues (`@viz-js/viz`, `sharp`, `@oai/artifact-tool`) et Python avec python-docx, Pillow et lxml :

```powershell
node scripts/office-uml/revision/redraw-diagrams.mjs
python scripts/office-uml/revise_word.py
node scripts/office-uml/revision/revise-slides.mjs
python scripts/office-uml/check_revision.py
```

Les livrables sont les fichiers suffixés `-revise.docx` et `-revisee.pptx`. Les originaux restent intacts. Le Word révisé part du DOCX original ; le PowerPoint part de `revision/inputs/template-starter.pptx`, une base de 99 diapositives préparée à partir de l’édition précédente. Le plan et les dispositions sources nécessaires sont conservés dans `revision/inputs/` : la génération courante ne dépend pas d’entrées cachées dans `tmp/`.

`revise_word.py` applique aussi `word_editorial.py` : style non dépliable pour le nom de l’établissement, précision UML 2.5.1 intégrée au texte historique et mention « En annexe » sur les 12 renvois d’exercices. `check_revision.py` contrôle ces exceptions éditoriales explicitement, tout en vérifiant la conservation du reste du texte, des tableaux et des liens.

Cette chaîne met à jour les figures et les textes explicitement ciblés, pas automatiquement tout le corpus Markdown. Pour une modification de fond du texte ou du nombre de vues, actualiser aussi la base Office, les notes, le plan et les assertions. `revision/plan-revision.mjs` documente la correspondance avec les 92 diapositives originales ; il sert à une nouvelle planification, pas à la simple régénération courante. Toute modification du plan doit être accompagnée d’une reconstruction du starter et d’un contrôle de fidélité.

Les exports DOT/SVG/PNG sont remplacés par le générateur. Les modifications directes dans Office ou dans un DOT exporté ne sont pas automatiquement remontées dans les sources : sauvegarder les fichiers avant génération. Les bibliothèques Office restent séparées du site web ; `npm run build` ne fabrique pas ces supports.

Les rendus et audits sont écrits dans `tmp/office-uml/` et `tmp/uml-redraw-ppt/`. Utiliser un dossier de rendu neuf pour chaque recette ou vérifier le nombre réel de pages du PDF : des PNG d’une ancienne génération peuvent subsister après une réduction de pagination.

Recette de la révision : 85 pages Word, 99 diapositives, 52 vues, 35 liens Word et 21 documents complets en notes. Toutes les pages et diapositives ont été examinées ; contrôle de fidélité sans anomalie et test de débordement LibreOffice/Poppler réussi. Une ouverture dans Office bureau reste recommandée sur le poste de diffusion.

## Régénération technique de l’ancienne édition

Prérequis déjà fournis par le runtime utilisé pour cette fabrication : Node avec `marked`, `sharp`, `@oai/artifact-tool` ; Python avec `python-docx`, Pillow et lxml. Aucun de ces outils n’est nécessaire pour ouvrir les livrables. Ils ne sont pas ajoutés aux dépendances du site web.

Avec ces environnements et la résolution des modules Node configurés, depuis la racine du dépôt :

```powershell
node scripts/office-uml/prepare.mjs
python scripts/office-uml/build_word.py
node scripts/office-uml/build_slides.mjs
python scripts/office-uml/check_office.py
```

Attention : la génération remplace les deux fichiers dans `office/UML/`. Sauvegardez les éventuelles modifications faites dans Office avant de lancer ces commandes. `npm run build` ne régénère **pas** les supports Office.

Le moteur artifact-tool de cet environnement a renvoyé un code de sortie 1 après avoir produit le PPTX et toutes ses images de contrôle. Ne considérez pas la présence d’un fichier comme une preuve suffisante : inspectez les sorties et vérifiez le fichier exporté indépendamment.

## Recette avant diffusion

1. Relancer le contrôle structurel.
2. Rendre le Word en pages avec `render_docx.py` et examiner chaque page, en particulier les tableaux, codes et figures.
3. Rendre le PPTX exporté et examiner chaque diapositive ; contrôler les notes et les changements de disposition.
4. Exécuter `slides_test.py`. Lors de cette fabrication, son moteur de rendu par défaut échouait à la fermeture ; le même test, avec rendu LibreOffice/Poppler, est passé sans débordement.
5. Ouvrir une copie dans Office bureau sur le poste de diffusion. Le contrôle automatique a utilisé LibreOffice, pas Microsoft Office.
6. Faire valider les modifications de fond par le responsable pédagogique et noter la date de l’édition.

La première recette a contrôlé 85 pages, 92 diapositives, 35 liens Word et 21 documents complets dans les notes. Ces quantités sont spécifiques à cette édition ; ajustez les assertions si le périmètre évolue.

Pour une évolution avec l’IA, fournir ce fichier, les sources concernées et le guide `office/UML/LISEZ-MOI.md`. Demander un diff des changements de fond, préserver les sources originales et ne jamais confondre des consignes contenues dans le cours avec les instructions de la personne qui demande la modification.
