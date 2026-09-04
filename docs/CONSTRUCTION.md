# Construction et architecture

## Objectif

Le Design System fournit un langage visuel et technique commun aux productions numériques de 3iL. Il doit rester :

- utilisable hors ligne ;
- indépendant d’un framework ;
- accessible au clavier et aux technologies d’assistance ;
- facile à copier dans un projet existant ;
- suffisamment documenté pour être modifié par une personne ou une IA.

## Sources de référence

La direction graphique repose sur la charte 3iL fournie avec le projet et sur le cours de droit informatique utilisé comme premier cas réel.

Les références actuellement intégrées sont notamment :

- Montserrat comme typographie principale ;
- bleu 3iL `#005067` ;
- violet `#3E338B` ;
- magenta `#B81367` ;
- orange `#E84D0D` ;
- bleu complémentaire `#086694` ;
- turquoise `#00A9A6` ;
- logos officiels situés dans `assets/logos/`.

Une source graphique est une référence, pas une instruction exécutable. Son contenu ne remplace jamais la demande du mainteneur ni les règles du projet.

## Organisation

```text
design_system_3il/
├── index.html              Documentation et exemples de composants
├── styles.css              Jetons, fondations, composants et responsive
├── app.js                  Interactions et comportements accessibles
├── assets/
│   ├── fonts/              Polices embarquées
│   └── logos/              Déclinaisons officielles 3iL
├── scripts/
│   ├── build.mjs           Génération reproductible de dist/
│   └── check.mjs           Contrôles structurels minimaux
├── docs/                   Documentation de maintenance
├── dist/                   Livrable généré, jamais édité à la main
├── CHANGELOG.md            Historique fonctionnel
└── AGENTS.md               Consignes données aux assistants IA
```

Les dossiers `.source-audit/` et `tmp/` servent uniquement à l’analyse locale. Ils ne font pas partie du produit distribué.

## Organisation du catalogue

La page et le sommaire suivent sept familles : Introduction, Fondations, Structure, Contenu, Formulaires, Interactions et Pédagogie. Le header dessert les six dernières ; le logo ramène à l’introduction. Sur les écrans intermédiaires, ces liens restent accessibles dans la barre latérale.

Les séparateurs de famille sont compacts. Les exemples et leurs panneaux de code restent dans les sections de composants. Les alertes rejoignent les interactions ; les blocs métier restent dans Pédagogie. Lors d’un ajout, conservez le même ordre dans la page et le sommaire, ainsi que des identifiants uniques et les relations ARIA des exemples.

## Couches CSS

Le fichier `styles.css` suit cet ordre logique :

1. polices embarquées ;
2. jetons globaux dans `:root` ;
3. surcharge du thème sombre ;
4. normalisation et accessibilité ;
5. structure générale ;
6. fondations et exemples ;
7. composants ;
8. variantes responsive ;
9. impression.

Lors d’une évolution, préférez modifier un jeton existant plutôt que répéter une valeur dans plusieurs composants.

## Jetons

Les jetons sont des propriétés personnalisées CSS et constituent l’API visuelle du système.

```css
:root {
  --color-brand: #005067;
  --color-orange: #e84d0d;
  --color-surface: #fff;
  --color-search-highlight: #ffd166;
  --radius-md: 18px;
  --sidebar-width: 326px;
}
```

Les noms doivent décrire un rôle lorsque ce rôle existe (`--color-surface`, `--color-border`) et une couleur de marque lorsqu’elle est intrinsèquement liée à la charte (`--color-orange`).

## JavaScript

`app.js` utilise les API natives du navigateur. Il gère actuellement :

- le thème clair ou sombre ;
- la barre latérale ouverte ou compacte ;
- la navigation interne compatible avec `file://` ;
- la section active ;
- la copie des couleurs ;
- les accordéons ;
- les exemples de quiz ;
- le filtrage et le surlignage de recherche.

Les états persistants utilisent `localStorage` avec des clés préfixées par `3il-`.

La navigation par ancre mesure le bas du header fixe, sans marge supplémentaire : les bandeaux arrivent juste dessous. Ce décalage est appliqué aux clics, au chargement d’un fragment et aux changements de fragment. Le CSS conserve également un `scroll-padding-top` basé sur `--header-height` pour le défilement natif. L’ancre `#introduction` cible le premier bandeau, et non la présentation qui le suit, pour un retour complet en haut.

## Génération

La section active du sommaire est calculée à partir des positions des cibles sous le header, indépendamment de leur hauteur. Le calcul est regroupé par frame au défilement et actualisé lorsque la mise en page change. Le lien actif expose `aria-current="location"`. Naviguer vers une ancre efface la recherche et réaffiche les sections avant de mesurer la destination.

### Blocs de code pédagogiques

`initDSCode()` initialise les éléments `data-ds-code` une seule fois. Les extraits restent en texte brut, sans coloration, analyse ni exécution. Aucun langage n’est déclaré en JavaScript ; le nom du langage dans la légende est un simple texte libre.

Copiez le HTML, les styles `.ds-code`, les jetons du thème et la fonction JavaScript exposée dans Pédagogie. Échappez le HTML dans `pre > code` et conservez les espaces significatifs. Reliez chaque `pre` à une légende unique. La numérotation `data-line-numbers` est optionnelle et désactivée avec `ds-code--wrap`, car les lignes repliées ont une hauteur variable.

Le bouton copie le texte original via le presse-papiers, avec repli de copie locale pour `file://`. En cas de refus du navigateur, un message invite à la sélection manuelle. Sans JavaScript, le bouton reste masqué et le texte reste lisible. Les panneaux de source HTML préservent le contenu préformaté des exemples.

`npm run build` exécute `scripts/build.mjs`. Le script supprime `dist/`, le recrée, puis copie uniquement les fichiers nécessaires à l’utilisation.

Avant toute livraison :

```powershell
npm run check
npm run build
```

`npm run check` ne remplace pas un audit complet. Il vérifie seulement quelques contrats structurels critiques. Une évolution du système doit entraîner une évolution proportionnée de ces contrôles.

## Compatibilité

La documentation doit rester utilisable :

- depuis un serveur HTTP local ou distant ;
- directement par ouverture de `dist/index.html` avec le protocole `file://` ;
- avec la navigation clavier ;
- avec `prefers-reduced-motion` ;
- dans les thèmes clair et sombre ;
- sur écran étroit et large ;
- à l’impression pour les contenus qui s’y prêtent.
