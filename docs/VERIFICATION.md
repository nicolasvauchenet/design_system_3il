# Vérification avant 1.0.0 — 4 septembre 2026

Statut : version 1.0.0 validée par le mainteneur le 4 septembre 2026 (« tout est validé, on passe en 1.0.0 »), après les contrôles et les derniers ajustements des liens. Cette confirmation clôt la validation manuelle demandée ; elle ne constitue pas un test `file://` exécuté par l’assistant.

## Vérifications effectuées

- Syntaxe JavaScript : `node --check app.js`.
- Contrôles structurels : `npm run check` (identifiants uniques, ancres, relations ARIA, ordre du sommaire et présence des composants).
- Génération : `npm run build`. Tous les fichiers d’assets générés ont une empreinte identique aux sources.
- Navigateur intégré, HTTP local : 27 destinations de sidebar atteintes ; alignement sous le header à moins d’un pixel.
- 48 exemples et 48 panneaux HTML ; aucune image manquante au chargement.
- Onglets : flèche droite active le panneau correspondant.
- Modale : ouverture, Échap, retour du focus au déclencheur.
- Formulaire : trois erreurs sur saisie vide, focus sur le premier champ, correction, succès sans envoi, réinitialisation.
- Notifications : affichage et fermeture ; infobulle : affichage et Échap ; popover : ouverture, premier contrôle focalisé et fermeture par Échap.
- Accordéon : ouverture du second panneau ; quiz : réponse et retour textuel.
- Bloc de code : bouton Copier annonce la réussite (contenu du presse-papiers non relu).
- Sidebar compacte : logo XS affiché ; recherche : contour bleu au focus clavier.
- Responsive : vue mobile 390 × 844, ouverture/fermeture du menu et navigation ; absence de débordement global après stabilisation. Vue desktop 1440 × 900 en thème clair, vue intermédiaire en thème sombre, logos correspondants.
- Aucun message d’erreur enregistré par le navigateur pendant ces contrôles.

## Validation manuelle confirmée par le mainteneur

Le navigateur de test interdit l’ouverture des URL `file://`. Aucun contournement n’a été tenté. La vérification manuelle demandée portait sur `dist/index.html`, sans serveur et sans connexion :

1. les styles, les polices et les logos ;
2. la navigation vers Listes structurées et le retour en haut ;
3. une recherche puis un clic de navigation ;
4. les onglets, la modale, la validation et le bouton Copier (collez le résultat dans un éditeur) ;
5. le téléchargement ou l’ouverture de la fiche TXT.

Après confirmation, `package.json`, le numéro affiché dans le header et le changelog ont été synchronisés sur 1.0.0. Les contrôles et la génération ont été relancés.

## Portée

Cette recette n’est pas une certification d’accessibilité ni une matrice multi-navigateurs. Les lecteurs d’écran, l’impression réelle et les navigateurs externes n’ont pas été testés durant cette passe. La compatibilité officiellement supportée reste à définir dans la gouvernance.
