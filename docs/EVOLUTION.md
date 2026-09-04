# Évolution et gouvernance

## Principe

Le Design System est un produit vivant. Il évolue à partir de problèmes rencontrés dans les projets 3iL, pas à partir d’une collection abstraite de composants possibles.

Avant d’ajouter un composant, vérifiez :

1. qu’un composant existant ne couvre pas déjà le besoin ;
2. que le besoin apparaît ou peut apparaître dans plusieurs supports ;
3. que son nom décrit sa fonction ;
4. que ses états et variantes sont connus ;
5. que son accessibilité peut être assurée ;
6. qu’un exemple réaliste peut être documenté.

## Cycle d’une modification

```text
Besoin réel
   ↓
Analyse des composants et jetons existants
   ↓
Proposition minimale
   ↓
Implémentation dans les sources
   ↓
Exemple dans la documentation
   ↓
Contrôles clair/sombre, clavier, responsive et file://
   ↓
Mise à jour de la documentation et du changelog
   ↓
Génération de dist/
```

## Critères d’acceptation

Une modification est terminée lorsque :

- elle répond au besoin initial sans fonctionnalité spéculative ;
- elle utilise les jetons existants ou documente les nouveaux ;
- elle ne dégrade pas les thèmes clair et sombre ;
- elle fonctionne au clavier et conserve un focus visible ;
- elle est responsive ;
- elle fonctionne depuis `file://` si elle appartient au livrable hors ligne ;
- son exemple et sa documentation sont à jour ;
- `npm run check` et `npm run build` réussissent ;
- `CHANGELOG.md` décrit l’impact pour les utilisateurs.

## Compatibilité et versions

Le projet suit les principes de versionnement sémantique :

- **correctif** (`1.0.1`) : correction sans changement d’API ;
- **mineure** (`1.1.0`) : nouveau composant ou variante compatible ;
- **majeure** (`2.0.0`) : suppression, renommage ou changement incompatible.

La version `1.0.0` constitue la première référence validée. Les contrats documentés doivent désormais être préservés dans les versions correctives et mineures ; toute rupture doit être annoncée et accompagnée d’une migration.

## Dépréciation

Un composant ne doit pas disparaître sans transition :

1. marquez-le comme déprécié dans la documentation ;
2. indiquez son remplaçant ;
3. conservez-le pendant une période convenue ;
4. retirez-le lors d’une version majeure ou d’une migration explicitement coordonnée.

## Responsabilités

L’IA peut proposer, produire et vérifier une modification. La responsabilité de la direction graphique, du vocabulaire institutionnel et des décisions de rupture reste humaine.

Pour chaque changement significatif, identifiez au minimum :

- le besoin ou projet demandeur ;
- la personne qui valide ;
- l’impact attendu ;
- les composants concernés ;
- les éventuelles migrations.

## Dette connue et prochaines étapes possibles

- enrichir les contrôles automatiques d’accessibilité ;
- documenter les navigateurs officiellement supportés ;
- isoler les composants dans des fichiers CSS par domaine si le volume le justifie ;
- ajouter des exemples imprimables dédiés aux supports pédagogiques ;
- définir un processus de revue visuelle partagé ;
- publier une version hébergée lorsque les règles d’accès sont décidées.

Ces éléments sont des pistes, pas des engagements automatiques.
