# 3iL Design System

Bibliothèque web réutilisable pour les sites, applications et supports pédagogiques de 3iL.

Le projet utilise uniquement **HTML5, CSS3 et JavaScript ES6**. Il fonctionne sans serveur, sans dépendance front-end et sans connexion Internet une fois le dossier `dist/` généré.

## Documentation

- [Gabarits Word et PowerPoint pour les enseignants](office/Gabarits/LISEZ-MOI.txt) — modèles natifs et exemples prêts à adapter ; [fabrication](scripts/office-gabarits/README.md).

- [Construction et architecture](docs/CONSTRUCTION.md)
- [Utilisation du Design System](docs/UTILISATION.md)
- [Évolution et gouvernance](docs/EVOLUTION.md)
- [Collaboration avec l’IA](docs/IA.md)
- [Historique des changements](CHANGELOG.md)

## Démarrage rapide

```powershell
cd design_system_3il
npm run check
npm run build
```

Ouvrez ensuite `dist/index.html` dans un navigateur.

Pour travailler sur le projet :

```powershell
npm run dev
```

Puis ouvrez `http://localhost:4173`.

## Règle essentielle

Modifiez uniquement les sources à la racine et dans `assets/`. Ne modifiez jamais directement `dist/` : ce dossier est supprimé puis recréé par `npm run build`.

```text
Sources                     Génération                 Livrable
index.html  ─┐
styles.css  ─┼─> npm run build ────────────────> dist/
app.js      ─┤
assets/     ─┘
```

## Supports Office

Le premier cours pilote est disponible en [Word](office/UML/3iL-UML-Cours.docx) et [PowerPoint](office/UML/3iL-UML-Presentation.pptx). Le Word contient les 12 exercices et leurs corrigés dans une annexe séparée en fin de document. Le PowerPoint conserve les énoncés sans corrigés. Le dossier de livraison ne contient que ces deux documents ; les sources techniques restent dans `scripts/office-uml/`. Ces fichiers s’utilisent directement dans Office bureau, indépendamment du `dist/` web. La fabrication est documentée dans [scripts/office-uml/FABRICATION.md](scripts/office-uml/FABRICATION.md).

Le cours Portfolio et contribution open source est disponible en [Word](office/Portfolio/3iL-Portfolio-Cours.docx) et [PowerPoint](office/Portfolio/3iL-Portfolio-Presentation.pptx). Il reprend les cinq parties du cours relu et corrigé. Le Word contient les ateliers et les pistes de correction en annexe ; le PowerPoint propose une synthèse de projection et les fiches complètes dans les notes. L’oral reste centré sur le portfolio et la contribution, les autres domaines étant évalués à l’écrit. Voir le [dossier de fabrication et de relecture](scripts/office-portfolio/FABRICATION.md).

## Version du Design System

Version de référence : **1.0.0**, validée le 4 septembre 2026. Consultez le [rapport de vérification](docs/VERIFICATION.md) pour le périmètre des contrôles et leurs limites.

Cette version pose les fondations visuelles, les composants génériques et plusieurs composants pédagogiques. Le système est destiné à évoluer avec les besoins réels des équipes 3iL, avec ou sans assistance par IA.
