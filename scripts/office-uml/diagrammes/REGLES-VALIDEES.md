# Règles métier validées pour les diagrammes

## Cycle de commande

Validation par l’auteur le 4 septembre 2026 : la préparation de la commande et la validation du paiement peuvent avancer en parallèle. La livraison ne démarre que lorsque les deux sont terminées.

La machine à états représente donc un état composite « En traitement » avec deux régions orthogonales. La transition d’achèvement vers la livraison attend la fin des deux régions. Une commande prête mais non payée ne peut pas être livrée ; une commande payée mais non prête ne peut pas l’être non plus.

Cette règle doit rester cohérente dans les vues d’activités, de séquence et de communication. Les scénarios d’échec du paiement ne sont pas détaillés dans cet exemple ; ils ne doivent pas conduire implicitement à une livraison.

Les 31 groupes de figures ont été redessinés en 52 vues et intégrés aux supports Office révisés du 4 septembre 2026. Les fichiers DOT et SVG sont conservés pour leur évolution.
