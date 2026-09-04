import { readFile } from "node:fs/promises";

const requiredFiles = ["index.html", "styles.css", "app.js"];
const contents = await Promise.all(requiredFiles.map((file) => readFile(file, "utf8")));
const [html, css, js] = contents;

const sidebar = html.match(/<nav aria-label="Sommaire de la documentation">([\s\S]*?)<\/nav>/)[1];
const catalogIds = [...sidebar.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
const positions = catalogIds.map((id) => html.indexOf(`id="${id}"`, html.indexOf('<main')));
const topNav = html.match(/<nav class="top-nav"[^>]*>([\s\S]*?)<\/nav>/)[1];

const checks = [
  [html.includes('id="liens"') && html.includes('href="#liens"') && css.includes('.ds-link:hover'), "Les liens et leurs états sont documentés"],
  [(() => {
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    const targets = [...html.matchAll(/<a\b[^>]*\bhref="#([^"]*)"/g)].map((match) => match[1]);
    const aria = [...html.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)].flatMap((match) => match[1].split(/\s+/));
    return new Set(ids).size === ids.length && [...targets, ...aria].every((id) => ids.includes(id));
  })(), "Les identifiants sont uniques et les ancres et références ARIA ont une cible"],
  [html.includes('id="formulaire-complet"') && html.includes('href="#formulaire-complet"') && js.includes('function initDSForms(') && js.includes('initDSForms();') && css.includes('.ds-form-group'), "Le formulaire complet expose ses champs et sa validation"],
  [html.includes('href="#blocs-code"') && html.includes('id="blocs-code"') && js.includes('function initDSCode(') && js.includes('initDSCode();') && css.includes('.ds-code--wrap'), "Les blocs de code pédagogiques sont documentés et initialisés"],
  [html.includes('href="#hero-institutionnel"') && html.includes('id="hero-institutionnel"') && ["ds-institutional-hero", "ds-institutional-hero--compact", "ds-institutional-hero__signature"].every((name) => html.includes(name) && css.includes(`.${name}`)), "Le hero institutionnel expose ses variantes et sa navigation"],
  [["fondations", "structure", "contenu", "formulaires", "interactions", "pedagogie"].every((id) => html.includes(`<div id="${id}" class="section-divider"`)), "Les ancres des familles ciblent leurs bandeaux"],
  [html.includes('<div id="introduction" class="section-divider"') && js.includes('const offset = header.getBoundingClientRect().bottom;') && js.includes('window.addEventListener("load", alignCurrentAnchor)') && js.includes('window.addEventListener("hashchange", alignCurrentAnchor)') && css.includes('scroll-padding-top: var(--header-height);'), "Les ancres ciblent les bandeaux sans marge supplémentaire sous le header"],
  [positions.every((position, index) => position >= 0 && (index === 0 || position > positions[index - 1])), "Le sommaire suit exactement l’ordre des sections"],
  [(sidebar.match(/class="nav-label"/g) || []).length === 7, "Le sommaire contient sept familles"],
  [["fondations", "structure", "contenu", "formulaires", "interactions", "pedagogie"].every((id) => topNav.includes(`href="#${id}"`)), "Le header dessert les six familles après l’introduction"],
  [["notifications", "infobulles", "popovers"].every((id) => html.includes(`href="#${id}"`) && html.includes(`id="${id}"`)), "Les notifications et aides sont reliées à la navigation"],
  [["ds-notification", "ds-tooltip", "ds-popover"].every((name) => html.includes(name) && css.includes(`.${name}`)), "Les notifications et aides disposent de leurs styles"],
  [["initDSNotifications", "initDSTooltips", "initDSPopovers"].every((name) => js.includes(`function ${name}(`) && js.includes(`${name}();`)), "Les comportements des notifications et aides sont initialisés"],
  [["onglets", "modales"].every((id) => html.includes(`href="#${id}"`) && html.includes(`id="${id}"`)), "Les onglets et modales sont reliés à la navigation"],
  [["course", "practice", "resources"].every((name) => html.includes(`aria-controls="module-panel-${name}"`) && html.includes(`id="module-panel-${name}"`) && html.includes(`aria-labelledby="module-tab-${name}"`)), "Les relations des onglets de démonstration sont présentes"],
  [js.includes("dialog.showModal()") && js.includes('dialog.addEventListener("close"') && js.includes("trigger.focus()"), "La modale utilise l’ouverture native et restaure le focus"],
  [["ds-timeline", "ds-timeline--journey", "ds-table", "ds-table--striped", "ds-table-scroll"].every((name) => html.includes(name) && css.includes(`.${name}`)), "Les timelines et tableaux ont leurs styles et exemples"],
  [["timelines", "tableaux"].every((id) => html.includes(`href="#${id}"`) && html.includes(`id="${id}"`)), "Les timelines et tableaux sont reliés à la navigation"],
  [["table-simple-caption", "table-compare-caption"].every((id) => html.includes(`aria-labelledby="${id}"`) && html.includes(`<caption id="${id}">`)), "Les régions des tableaux sont reliées à leur légende"],
  [["ds-list", "ds-list--compact", "ds-list--divided", "ds-list--steps", "ds-definitions", "ds-checklist"].every((name) => html.includes(name) && css.includes(`.${name}`)), "Les listes structurées disposent de styles et d’exemples"],
  [html.includes('href="#listes"') && html.includes('id="listes"'), "La navigation dessert les listes structurées"],
  [html.includes('lang="fr"'), "La langue du document est définie"],
  [html.includes('id="main-content"'), "La cible du lien d’évitement existe"],
  [css.includes(":focus-visible"), "Les styles de focus clavier existent"],
  [css.includes("prefers-reduced-motion"), "Les préférences de mouvement sont respectées"],
  [js.includes("aria-expanded"), "Les composants divulgués exposent leur état"],
  [["conteneurs", "grilles"].every((id) => html.includes(`id="${id}"`) && html.includes(`href="#${id}"`)), "Les sections de structure sont accessibles depuis la navigation"],
  [["ds-container--reading", "ds-container--fluid", "ds-grid--2", "ds-grid--3", "ds-grid--4", "ds-grid--auto", "ds-grid--sidebar", "ds-stack", "ds-cluster"].every((name) => html.includes(name) && css.includes(`.${name}`)), "Toutes les variantes de structure disposent de styles et d’exemples"],
  [css.includes("container-type: inline-size") && css.includes("@container (min-width: 28rem)") && css.includes("@container (min-width: 40rem)"), "Les seuils adaptatifs des grilles sont déclarés"],
];

for (const [ok, label] of checks) {
  if (!ok) throw new Error(`Échec : ${label}`);
  console.log(`✓ ${label}`);
}
