# Historique des changements

Les changements notables du Design System 3iL sont documentés ici.

Le format s’inspire de Keep a Changelog et le projet suit les principes du versionnement sémantique.

## [Non publié]

- Support Portfolio et contribution open source : relecture des 27 sources, corrections techniques et éditoriales, Word complet avec ateliers et pistes de correction, PowerPoint de projection avec fiches complètes en notes. Répartition explicite entre oral et livrables écrits. Réemploi des gabarits Office 3iL, sans modification du contrat web.

- Relecture éditoriale du catalogue HTML : suppression du bloc final « La suite », introduction orientée réutilisation, clarification des simulations et des usages des badges, cartes, boutons et alertes. Cartes alignées sur leurs destinations, valeurs typographiques corrigées et validation du code étudiant décrite comme un contrôle de format. Composants et ancres conservés.

- Cours UML : ajout des 12 corrigés avec schémas dans une troisième annexe séparée en fin de Word, navigation interne et retour aux énoncés. Dossier Office UML réduit aux deux documents finaux, nommés `3iL-UML-Cours.docx` et `3iL-UML-Presentation.pptx` ; présentation inchangée sur le fond.

- Kit enseignants Office 1.0.0 : gabarits Word (.dotx/.docx, 7 pages types) et PowerPoint (.potx/.pptx, 10 exemples et 5 dispositions 3iL réutilisables), sans macro, avec notice et sources de fabrication. Aucun changement du contrat web.

- Modales : ajout des variantes Alerte, Confirmation, Média et Preview, avec sources HTML, décision de confirmation réinitialisée à chaque ouverture et mise en pause des médias natifs à la fermeture.

- Ajout d’un premier support Office 3iL : cours UML complet en Word et présentation PowerPoint avec exercices, annexes et notes détaillées. Guide de réutilisation et sources de fabrication conservés. Le contrat web reste en 1.0.0.

## [1.0.0] - 2026-09-04

Première version de référence, validée par le mainteneur après la recette et les ajustements finaux. Livrable local généré dans `dist/` ; aucune publication distante.

- Soulignement continu des liens, sans coupures autour des caractères descendants. Section Liens déplacée dans Fondations, après Typographie, en conservant l’ancre `#liens`.

- Sidebar : suivi de section fondé sur sa position sous le header, y compris pour les sections longues, et indication accessible du lien actif. La navigation par ancre réinitialise le filtre de recherche avant le défilement.

- Recherche du header : focus clavier explicite sur le champ, avec contour du groupe et repli sur l’input ; suppression de la neutralisation générale de son outline.

- Liens documentés dans Contenu : texte, nouvel onglet externe, téléchargement local et ressource indisponible, avec HTML copiable.
- Revue du catalogue : destinations des cartes renseignées, focus de recherche visible, vérification automatique des identifiants uniques, ancres et références ARIA.

- Focus clavier : remplacement des contours orange restants par le bleu de marque sur les liens, boutons, résumés, panneaux d’onglets, tableaux défilants et blocs de code.

### Formulaires

- Focus des champs, listes de choix, zones de texte, radios et cases à cocher en bleu de marque (bleu clair en thème sombre), au lieu de l’orange. Les erreurs conservent leur couleur distincte.

- Réorganisation en trois sections : champs et libellés, erreurs et disponibilité, formulaire complet. Sommaire et panneaux de code alignés sur cette progression.

- Select, textarea, groupes radio et cases à cocher, états lecture seule/désactivé et formulaire complet avec validation dynamique, focus sur la première erreur et réinitialisation. Exemples HTML et JavaScript disponibles, sans envoi de données.

### Pédagogie

- Blocs de code en texte brut pour tout langage : copie avec repli, numérotation optionnelle, défilement ou repli des lignes et sources HTML/JavaScript consultables. Coloration syntaxique retirée, sans ajout de dépendance.

### Structure

- Hero institutionnel : variantes accueil avec signature 3iL et entrée de cours compacte, adaptation à la largeur disponible, thèmes clair/sombre, exemples HTML et guide d’intégration.

- Ajout des conteneurs lecture, page et fluide, des grilles 2/3/4 colonnes et automatique, du panneau latéral, de l’empilement et du groupe d’actions.
- Huit exemples avec HTML indenté, liens de navigation et guide d’intégration.

### Modifié

- Retour en haut : `#introduction` cible désormais le premier bandeau. Suppression de la marge de 16 px pour aligner les bandeaux directement sous le header.

- L’ancre `#formulaires` cible désormais le bandeau de famille ; `#champs-formulaire` dessert les exemples depuis le sommaire.

- Ancres : défilement compensé par la hauteur réelle du header et une marge de 16 px, y compris à l’ouverture d’une URL avec fragment.

- Catalogue réorganisé en sept familles, d’Introduction à Pédagogie : ordre commun à la page et au sommaire, six entrées dans le header, séparateurs compacts et exemples conservés avec leur code.

- Barres de défilement : curseur bleu en thème clair, blanc en thème sombre, piste transparente et respect des couleurs forcées du système.

- Footer de la sidebar : copyright « 3iL Programmes Experts » avec année actualisée à chaque chargement.

- Utilisation du logo horizontal blanc en thème sombre dans le header et le panneau de présentation, avec retour au logo couleur en thème clair.

- Les traits des timelines relient les centres des pastilles, sans dépassement initial ni interruption avant la dernière.

- Centrage des pastilles des deux timelines sur leur trait, avec dimensions incluant explicitement les bordures.

- Navigation du header organisée en Fondations, Structure, Contenu, Formulaires et Interactions, avec des points d’entrée explicitant les composants disponibles et à venir.

### Ajouté

- Notifications toast persistantes avec fermeture et annonces accessibles, infobulles survolables/clavier, popovers non modaux avec gestion du focus et fermeture extérieure ; HTML et JavaScript documentés.

- Onglets à activation immédiate avec navigation clavier et panneaux associés.
- Modale native avec fermeture explicite ou Échap, confinement natif du focus et restitution au déclencheur ; HTML et JavaScript exposés dans la documentation.

- Timelines : chronologie datée et parcours avec états explicites.
- Tableaux : variante simple et comparatif à lignes alternées, légendes et en-têtes sémantiques, défilement horizontal accessible au clavier.

- Listes structurées : puces imbriquées, numérotation native, variantes compacte et séparée, définitions, étapes et checklist interactive sans JavaScript ; sept exemples documentés.

- Documentation de construction, d’utilisation, d’évolution et de collaboration avec l’IA.
- Instructions opérationnelles destinées aux assistants IA.
- Affichage automatique et indenté du code HTML complet pour tous les exemples documentés.
- Validation dynamique de l’exemple de code étudiant dans les formulaires.

## [0.1.0] - 2026-09-03

### Ajouté

- Fondations de couleurs, typographie et espacements 3iL.
- Composants boutons, formulaires, badges, alertes, cartes et accordéons.
- Composants pédagogiques pour objectifs, définitions, réflexes et quiz.
- Thèmes clair et sombre.
- Recherche intégrée avec filtrage et surlignage personnalisable.
- Navigation responsive avec barre latérale complète ou compacte.
- Logo XS pour la navigation compacte et les favicons.
- Génération reproductible du dossier `dist/`.
- Contrôles structurels minimaux.
