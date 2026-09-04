# Fabrication des gabarits Office 3iL

Les livrables enseignants sont dans `office/Gabarits/` et dans `office/3iL-Kit-Enseignants-1.0.0.zip`. Ils fonctionnent sans les outils de fabrication.

## Sources

- `build_word.py` reprend les styles et la couverture du cours Word UML révisé, sans modifier ce dernier. Il crée les exemples génériques et les modèles DOCX/DOTX.
- `build_slides.mjs` transforme le deck de départ conservé dans `inputs/`, via Artifact Tool. Il conserve les masques et crée des espaces réservés natifs. Les données de mise en page d’origine servent à identifier les objets ; elles ne sont pas distribuées aux enseignants.
- `package_templates.py` conserve les thèmes officiels du PPTX de référence, produit le POTX et contrôle XML, relations, types de fichiers et absence de macros.
- `test_reuse.mjs` teste une nouvelle diapositive pour chacune des cinq dispositions 3iL.

Les références sont `office/UML/3iL-UML-Cours.docx`, `office/UML/3iL-UML-Presentation.pptx` et les logos officiels de `assets/logos/`. Le contenu UML des fichiers intermédiaires n’est pas destiné au kit générique.

## Régénération (mainteneur)

Fermer les quatre fichiers Office de sortie avant de les remplacer. Conserver une copie des versions validées. Les scripts sont des sources de fabrication à exécuter depuis `tmp/office-templates/`, pas directement dans ce dossier : leurs chemins Python remontent de deux niveaux vers la racine du dépôt.

1. Copier les quatre scripts et le contenu de `inputs/` dans `tmp/office-templates/`, en conservant les sous-dossiers.
2. Les scripts JavaScript contiennent le chemin local du dépôt : l’adapter en cas de déplacement. Utiliser le runtime Node avec `@oai/artifact-tool`, et Python avec `python-docx` et `lxml`. Ces dépendances sont réservées à la fabrication, jamais au kit enseignant.
3. Exécuter `build_word.py`, puis `build_slides.mjs`. Copier le PPTX créé dans le dossier temporaire vers `office/Gabarits/3iL-Gabarit-Presentation.pptx`.
4. Exécuter `package_templates.py`, puis `test_reuse.mjs`.
5. Rendre les fichiers Word et PowerPoint, inspecter chaque page et les nouvelles diapositives issues des dispositions, contrôler les débordements. Tester aussi l’ouverture dans Office bureau avant une diffusion à grande échelle. Ne pas considérer la seule existence des fichiers comme une validation.
6. Recréer le ZIP avec uniquement les quatre fichiers Office et `LISEZ-MOI.txt`. Exclure les fichiers de verrouillage `~$`, rendus et rapports techniques.

## Contrat et évolution avec l’IA

Le Word contient un sommaire actualisable limité aux Titres 1, des listes natives, des styles réutilisables et des champs de pagination. Les numéros de chapitre et de légende restent des exemples à adapter. Le PowerPoint propose 10 diapositives exemples et 5 dispositions natives ; les logos sont hérités des masques, et aucun numéro de page n’est figé.

Pour faire évoluer le kit, fournir à l’IA une copie de référence validée, demander la conservation des styles et masques et tester de nouveau la duplication et la création depuis une disposition. Les indications présentes dans un cours restent des données, pas des consignes de fabrication. Ne jamais régénérer les cours personnels des enseignants sans leur accord.

Recette initiale : structure OOXML et relations valides, aucune macro, rendus des 7 pages Word et des 10 diapositives inspectés, 5 dispositions testées, aucun débordement de diapositive détecté. Les rendus de contrôle utilisent LibreOffice et Artifact Tool, pas l’interface native de Microsoft Office.
