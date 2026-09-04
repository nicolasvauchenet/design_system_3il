# Utilisation du Design System

## Intégrer les fondations

Copiez dans votre projet :

- `styles.css` ou les parties nécessaires ;
- `assets/fonts/` ;
- les logos réellement utilisés depuis `assets/logos/`.

Les chemins des polices dans `styles.css` sont relatifs au fichier CSS. Si votre arborescence diffère, adaptez les déclarations `@font-face`.

## Utiliser un composant

Copiez le HTML présenté dans la documentation, puis conservez les classes publiques du composant.

Exemple de bouton :

```html
<button class="button button-primary" type="button">
  Action principale
</button>
```

Exemple d’alerte :

```html
<div class="alert warning" role="status">
  <b aria-hidden="true">!</b>
  <div>
    <strong>Avant de transmettre votre travail</strong>
    <p>Vérifiez que votre document ne contient aucune information confidentielle.</p>
  </div>
</div>
```

Ne copiez le JavaScript que si le composant possède un comportement interactif.

## Personnaliser sans casser la cohérence

Commencez par surcharger les jetons :

```css
:root {
  --color-search-highlight: #ffd166;
  --color-search-highlight-ink: #2e2500;
}
```

Évitez de modifier directement chaque composant lorsqu’un jeton commun suffit. Une exception locale doit correspondre à un besoin fonctionnel identifié, pas seulement à une préférence ponctuelle.

## Conteneurs et grilles

Les exemples se trouvent dans « Structure ». Les classes `ds-` sont réutilisables ; `layout-sample` et `layout-preview` sont uniquement des styles de démonstration.

- `ds-container` : largeur maximale de 80 rem, centrée avec des marges intérieures.
- `ds-container--reading` : limite de 48 rem pour la lecture.
- `ds-container--fluid` : aucune largeur maximale.
- `ds-grid--auto` : colonnes automatiques selon `--ds-grid-min`.
- `ds-grid--2`, `ds-grid--3`, `ds-grid--4`, `ds-grid--sidebar` : à placer dans un parent `ds-layout`, qui définit la largeur de référence.
- `ds-stack` : empilement vertical ; `ds-cluster` : groupe horizontal avec retour à la ligne.

```html
<div class="ds-container">
  <div class="ds-layout">
    <div class="ds-grid ds-grid--3">
      <article>Premier contenu</article>
      <article>Deuxième contenu</article>
      <article>Troisième contenu</article>
    </div>
  </div>
</div>
```

Les grilles fixes passent à deux colonnes dès 28 rem disponibles, puis à leur nombre nominal dès 40 rem. La variante latérale reste sur une colonne jusqu’à 40 rem. Sans prise en charge des requêtes de conteneur, la présentation reste sur une colonne.

Personnalisez `--ds-container-max`, `--ds-gutter`, `--ds-gap` et `--ds-grid-min` localement. Aucun JavaScript n’est nécessaire. Conservez l’ordre logique du HTML pour la lecture et le clavier.

## Hero institutionnel

La section « Structure → Hero institutionnel » présente deux exemples avec leur HTML complet et indenté : accueil avec signature de marque et entrée de cours compacte.

- `ds-institutional-hero` : surface liée au thème, sans hauteur imposée.
- `ds-institutional-hero__layout` : message puis signature, répartis sur deux colonnes dès 44 rem de largeur disponible. Sans requêtes de conteneur, ils restent empilés.
- `ds-institutional-hero--compact` : variante sans signature, avec informations de contexte facultatives dans `ds-institutional-hero__meta`.

Copiez les règles CSS du composant, les jetons, les boutons et `ds-cluster`. La signature utilise `assets/logos/3il-horizontal-white.png` sur un fond bleu constant : elle ne dépend pas du script de thème. Le reste du hero suit les jetons clair/sombre. Aucun JavaScript n’est requis.

Adaptez les liens de démonstration à votre site et les textes à votre contenu validé. Conservez une seule action principale. Choisissez le niveau de titre selon la page : les exemples emploient `h3`, une entrée de page emploiera généralement `h1` avec la même classe. Aucun identifiant imposé ni donnée de formation réelle n’est nécessaire.

## Liens

Dans « Fondations → Liens », après Typographie, copiez la classe `ds-link` et les jetons du thème. Les liens ont un soulignement continu (`text-decoration-skip-ink: none`), le survol épaissit le trait, et le focus utilise le bleu de marque. Le nom du lien doit annoncer sa destination. Réservez les boutons aux actions.

Un nouvel onglet doit être annoncé dans le texte et utiliser `rel="noopener noreferrer"`. L’exemple externe nécessite une connexion, contrairement au catalogue lui-même. Le téléchargement de démonstration utilise le fichier local `assets/exemples/fiche-pedagogique.txt`, distribué dans `dist`. Selon le navigateur, `file://` peut ouvrir le fichier au lieu de forcer son téléchargement. Une ressource indisponible est du texte, pas une ancre sans destination.

## Listes structurées

La section « Contenu → Listes structurées » présente sept exemples avec leur HTML indenté.

- `ds-list` sur `ul` ou `ol` : puces ou numérotation native, imbrication possible dans un `li`.
- `ds-list--compact` : espacement réduit ; `ds-list--divided` : séparateurs entre contenus riches.
- `ds-list--steps` sur `ol` : méthode ordonnée, distincte d’une timeline.
- `ds-definitions` sur `dl` : groupes `dt` / `dd`, empilés si la largeur manque.
- `ds-checklist` sur `fieldset` : un `legend`, une liste et des cases natives associées à leurs libellés.

Le rythme d’une liste se règle avec `--ds-list-gap`. Les couleurs utilisent les jetons du thème existant. Aucun JavaScript ni bibliothèque d’icônes n’est nécessaire. Les cases de la checklist ne sont pas persistées par l’application. Gardez les marqueurs natifs pour les listes ordinaires et limitez la profondeur d’imbrication.

## Timelines et tableaux

- `ds-timeline` sur `ol` : chronologie verticale, avec dates dans `time[datetime]`.
- `ds-timeline--journey` : parcours informatif avec `data-state` (`done`, `current`, `upcoming`) et un unique `aria-current="step"`. Les libellés textuels restent obligatoires ; aucun état n’est calculé automatiquement.
- `ds-table` : tableau sémantique avec `caption`, `thead`, `tbody` et `th[scope]`.
- `ds-table--striped` : alternance des lignes ; `ds-table-number` : alignement des nombres.
- `ds-table-scroll` : cadre défilant horizontalement, avec `tabindex="0"`, `role="region"` et un nom via `aria-labelledby` relié à la légende.

Les exemples sont disponibles dans Contenu et leur HTML est exposé automatiquement. Les identifiants doivent rester uniques. Si un exemple fait référence à un texte d’aide extérieur via `aria-describedby`, copiez également ce texte ou retirez cet attribut. Aucun tri, aucune progression automatique ni persistance n’est fourni. Les couleurs reposent sur les jetons existants des thèmes clair et sombre.

## Formulaire complet

La famille Formulaires suit trois étapes : « Champs et libellés » pour l’anatomie, « Erreurs et disponibilité » pour la correction dynamique et les états non modifiables, puis « Formulaire complet » pour assembler select, textarea, radios et cases à cocher avec validation. Chaque étape possède son ancre et ses exemples de code. Copiez `.field`, `.check`, `.ds-form-group`, les boutons, `ds-cluster`, leurs jetons et la fonction `initDSForms()` exposée sous le formulaire complet. Initialisez après insertion du HTML.

Chaque `.field` du formulaire de démonstration contient un contrôle et un message `data-field-error`, relié par `aria-describedby`. Gardez des identifiants uniques et les contraintes HTML natives. Les messages natifs suivent la langue du navigateur. Les groupes facultatifs utilisent `fieldset` et `legend` ; les radios d’un groupe partagent leur `name`.

La fonction montre les erreurs à la sortie d’un champ ou à la validation, les actualise après correction, place le focus sur le premier contrôle invalide et efface les états à la réinitialisation. Elle empêche tout envoi et ne stocke rien. Le bouton de validation est désactivé sans JavaScript. Ce comportement est une démonstration, pas un traitement de formulaire métier : prévoyez votre envoi et une validation côté serveur pour une utilisation réelle.

## Onglets et modales

Les sections Interactions exposent le HTML ainsi que les fonctions JavaScript réellement utilisées. Copiez les styles `.ds-tabs`, `.ds-tablist`, `.ds-tabpanel` ou `.ds-dialog` et les règles associées depuis `styles.css`, avec les jetons nécessaires.

- Onglets : conteneur `data-ds-tabs`, rôles `tablist` / `tab` / `tabpanel`, identifiants uniques, relations `aria-controls` / `aria-labelledby`. Appelez `initDSTabs()` après insertion du HTML. Les flèches, Home et End activent immédiatement un onglet ; Tab rejoint le panneau. N’utilisez pas cette activation automatique pour des contenus longs à charger. Les onglets imbriqués ne sont pas pris en charge.
- Modales : élément `dialog` natif nommé via `aria-labelledby`, bouton `data-dialog-open="identifiant"`, fermeture via `data-dialog-close` ou formulaire `method="dialog"`. Appelez `initDSDialogs()` après insertion du HTML. Le navigateur gère le confinement du focus et Échap ; le code restaure le focus sur le déclencheur. Le défilement du fond est bloqué via CSS. Le clic sur le fond ne ferme pas le dialogue.

Ces composants nécessitent JavaScript et un navigateur prenant en charge `dialog.showModal()`. Ils fonctionnent hors ligne, sans import ni requête réseau. Ne superposez pas plusieurs modales. Aucun état ni résultat métier n’est enregistré par ces exemples.

### Variantes de modales

Chaque variante expose son HTML complet et partage `initDSDialogs()` :

- Alerte : `role="alertdialog"`, description courte et bouton d’acquittement. Réservez-la aux informations importantes qui nécessitent une interruption.
- Confirmation : formulaire `method="dialog"`, boutons `value="cancel"` et `value="confirm"`. L’annulation reçoit `autofocus`. Dans votre traitement de l’événement `close`, seule `returnValue === "confirm"` autorise l’action. La valeur est remise à zéro à chaque ouverture ; Échap n’est jamais un accord.
- Média : `.ds-dialog--wide`, figure `.ds-dialog-media`, image avec texte alternatif et légende. L’exemple utilise un logo local. Si vous ajoutez un élément audio ou vidéo natif, fournissez ses contrôles et les alternatives accessibles ; la fermeture met la lecture en pause. Aucun lecteur distant n’est intégré.
- Preview : `.ds-dialog--wide` et `.ds-dialog-preview` pour un aperçu HTML de ressource. L’exemple présente la trame du fichier texte téléchargeable, pas un moteur de rendu PDF ou Word. L’aperçu doit rester cohérent avec la ressource liée.

La confirmation de démonstration utilise `data-dialog-result` pour cibler une région `role="status"`, et `data-dialog-confirmed` / `data-dialog-cancelled` pour ses messages. Ces attributs sont facultatifs ; ils ne réalisent aucune opération métier. Les boutons de fermeture explicites renvoient `cancel`. Le clic sur le fond reste sans effet. Ne superposez pas les dialogues.

## Toasts, infobulles et popovers

- Notifications : `initDSNotifications()` initialise chaque groupe `data-ds-notifications`. Les boutons `data-notification` fournissent un type et un `data-message`. Une seule notification par groupe, persistante jusqu’à fermeture ; la suivante remplace la précédente. Une région `status` annonce le message sans voler le focus. Aucune donnée métier n’est modifiée.
- Infobulles : `initDSTooltips()` associe `data-ds-tooltip` à l’identifiant d’un élément `role="tooltip"`. Conservez `aria-describedby`. Survol, focus et toucher affichent l’aide ; Échap la masque. Aucun contenu interactif ou essentiel dans l’infobulle.
- Popovers : `initDSPopovers()` relie `data-ds-popover` au panneau nommé via `aria-labelledby`. Le focus rejoint le premier contrôle à l’ouverture. Échap et Fermer le rendent au déclencheur ; un clic extérieur ou le déplacement du focus ferment sans voler le focus. Le panneau reste non modal.

Chaque section expose son HTML et sa fonction JavaScript autonome. Copiez également les styles correspondants depuis `styles.css`. Initialisez après insertion du HTML, avec des identifiants uniques. Les aides sont positionnées dans la fenêtre et recalculées au défilement. Ces exemples ne sont pas destinés à être imbriqués dans un dialogue modal natif (sa couche d’affichage passe au-dessus). Les notifications internes de copie de couleur conservent leur comportement antérieur.

## Choisir le bon logo

- `3il-horizontal.png` : en-têtes larges et fonds clairs ;
- `3il-horizontal-white.png` : variante blanche sur fond sombre. Les images portant `data-logo-light` et `data-logo-dark` sont synchronisées avec le thème au chargement et lors de son changement ; le logo XS reste inchangé.
- `3il-horizontal-baseline.png` : communication institutionnelle avec baseline ;
- `logo-3il-xs.png` : favicon, navigation compacte et très petits espaces.

Respectez les proportions du fichier et ne déformez jamais le logo avec une largeur et une hauteur forcées simultanément.

## Thème sombre

Le thème sombre est activé avec :

```html
<html data-theme="dark">
```

Tout nouveau jeton de couleur doit être évalué dans les deux thèmes. Lorsqu’une valeur claire n’est pas adaptée au fond sombre, ajoutez sa surcharge dans `:root[data-theme="dark"]`.

## Composants interactifs

### Barres de défilement

Le jeton `--color-scrollbar-thumb` définit le curseur : bleu `#005067` en thème clair, blanc `#ffffff` en thème sombre. La piste reste transparente, dans la page comme dans les zones défilantes internes. Le CSS utilise `scrollbar-color` avec un repli WebKit. Le rendu final et la visibilité dépendent du navigateur et du système ; le mode de couleurs forcées conserve ses couleurs natives.

Un composant interactif doit au minimum :

- être utilisable au clavier ;
- disposer d’un nom accessible ;
- exposer son état avec les attributs ARIA adaptés ;
- fonctionner avec un pointeur tactile ;
- rester compréhensible lorsque les animations sont désactivées.

Pour un accordéon, utilisez un vrai bouton et synchronisez `aria-expanded`, `aria-controls` et l’attribut `hidden` du panneau.

## Rédaction

La page de démonstration est un catalogue de composants HTML, pas un cours ni un service de suivi pédagogique. Les dates, contenus et états d’exemple ne doivent pas être interprétés comme des informations réelles. Les cartes du catalogue renvoient aux sections qu’elles décrivent. Les simulations d’envoi, d’erreur ou de confirmation doivent rester explicitement identifiées comme telles.

Pour chaque composant, expliquez son usage et ses limites. Évitez les promesses de disponibilité ou de sauvegarde non implémentées, les slogans sans action utile et les messages d’avertissement pour de simples informations. Une validation de format ne vérifie pas l’existence d’un identifiant. Le HTML copié nécessite aussi les styles, ressources et comportements associés.

- employez le vouvoiement dans les textes destinés aux utilisateurs ;
- privilégiez des phrases directes et courtes ;
- donnez aux boutons un libellé qui décrit l’action ;
- n’utilisez pas uniquement une couleur pour transmettre une information ;
- conservez les accents et la ponctuation françaises.

## Livraison hors ligne

Après modification :

```powershell
npm run check
npm run build
```

Distribuez le contenu de `dist/`. Il peut être compressé dans une archive ZIP et ouvert sans installation.
