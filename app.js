const root = document.documentElement;
document.querySelectorAll("[data-copyright]").forEach((element) => {
  element.textContent = `© ${new Date().getFullYear()} 3iL Programmes Experts`;
});
const themeToggle = document.querySelector("#theme-toggle");
const menuToggle = document.querySelector("#menu-toggle");
const sidebarCollapse = document.querySelector("#sidebar-collapse");
const sidebar = document.querySelector("#side-nav");
const search = document.querySelector("#component-search");
const toast = document.querySelector("#toast");
const sections = [...document.querySelectorAll(".doc-section")];
const navLinks = [...document.querySelectorAll(".sidebar a")];

const storedTheme = localStorage.getItem("3il-theme");
if (storedTheme === "dark" || (!storedTheme && matchMedia("(prefers-color-scheme: dark)").matches)) {
  root.dataset.theme = "dark";
}

function syncThemeButton() {
  const dark = root.dataset.theme === "dark";
  document.querySelectorAll("[data-logo-light][data-logo-dark]").forEach((logo) => {
    logo.src = dark ? logo.dataset.logoDark : logo.dataset.logoLight;
  });
  themeToggle.setAttribute("aria-label", dark ? "Activer le thème clair" : "Activer le thème sombre");
}
syncThemeButton();

function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  sidebarCollapse.setAttribute("aria-expanded", String(!collapsed));
  sidebarCollapse.setAttribute("aria-label", collapsed ? "Développer la barre latérale" : "Réduire la barre latérale");
  sidebarCollapse.querySelector("strong").textContent = collapsed ? "Développer" : "Réduire";
  localStorage.setItem("3il-sidebar-collapsed", String(collapsed));
}

setSidebarCollapsed(localStorage.getItem("3il-sidebar-collapsed") === "true");
sidebarCollapse.addEventListener("click", () => {
  setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed"));
});

navLinks.forEach((link) => link.setAttribute("title", link.textContent.trim()));

const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

function escapeHtmlText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtmlAttribute(value) {
  return escapeHtmlText(value).replaceAll('"', "&quot;");
}

function serializeExampleNode(node, depth = 0) {
  const indentation = "  ".repeat(depth);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue.trim();
    return text ? [`${indentation}${escapeHtmlText(text)}`] : [];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const tag = node.tagName.toLowerCase();
  const attributes = [...node.attributes]
    .filter(({ name }) => name !== "data-code-example")
    .map(({ name, value }) => value === "" ? name : `${name}="${escapeHtmlAttribute(value)}"`)
    .join(" ");
  const openingTag = `<${tag}${attributes ? ` ${attributes}` : ""}>`;

  if (voidElements.has(tag)) return [`${indentation}${openingTag}`];
  if (tag === "pre") return [`${indentation}${openingTag}${node.innerHTML}</pre>`];

  const children = [...node.childNodes].filter((child) => child.nodeType !== Node.TEXT_NODE || child.nodeValue.trim());
  if (!children.length) return [`${indentation}${openingTag}</${tag}>`];

  if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
    return [`${indentation}${openingTag}${escapeHtmlText(children[0].nodeValue.trim())}</${tag}>`];
  }

  return [
    `${indentation}${openingTag}`,
    ...children.flatMap((child) => serializeExampleNode(child, depth + 1)),
    `${indentation}</${tag}>`,
  ];
}

function formatExampleHtml(element) {
  return [...element.childNodes]
    .flatMap((node) => serializeExampleNode(node))
    .join("\n");
}

document.querySelectorAll("[data-code-example]").forEach((example) => {
  const details = document.createElement("details");
  details.className = "code-block";
  if (!example.parentElement.classList.contains("demo-panel")) {
    details.classList.add("code-block-standalone");
  }

  const summary = document.createElement("summary");
  summary.textContent = "Voir le code HTML complet";

  const pre = document.createElement("pre");
  const code = document.createElement("code");
  code.textContent = formatExampleHtml(example);
  pre.append(code);
  details.append(summary, pre);
  example.insertAdjacentElement("afterend", details);
});

document.querySelectorAll("[data-validated-field]").forEach((field) => {
  const input = field.querySelector("input");
  const message = field.querySelector("em");

  function updateValidationState() {
    const valid = input.validity.valid;
    field.classList.toggle("valid", valid);
    field.classList.toggle("invalid", !valid);
    input.setAttribute("aria-invalid", String(!valid));
    message.textContent = valid
      ? "Format valide : 8 caractères alphanumériques."
      : "Saisissez les 8 caractères alphanumériques de votre identifiant.";
  }

  input.addEventListener("input", updateValidationState);
  input.addEventListener("blur", updateValidationState);
  updateValidationState();
});

themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("3il-theme", root.dataset.theme);
  syncThemeButton();
});

menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!open));
  sidebar.classList.toggle("open", !open);
});

navLinks.forEach((link) => link.addEventListener("click", () => {
  sidebar.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

function scrollToAnchor(target, behavior = "auto") {
  if (search.value || document.querySelector(".filtered-out")) {
    search.value = "";
    sections.forEach((section) => section.classList.remove("filtered-out"));
    updateSearchHighlights("");
  }
  const header = document.querySelector(".site-header");
  const offset = header.getBoundingClientRect().bottom;
  window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset), behavior });
}

function resolveAnchor(hash) {
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener("click", (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const target = resolveAnchor(link.getAttribute("href"));
  if (!target) return;
  event.preventDefault();
  scrollToAnchor(target, matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth");
}));

function alignCurrentAnchor() {
  const target = resolveAnchor(window.location.hash);
  if (target) scrollToAnchor(target, "instant");
}
window.addEventListener("load", alignCurrentAnchor);
window.addEventListener("hashchange", alignCurrentAnchor);

function updateActiveNavigation() {
  const limit = document.querySelector(".site-header").getBoundingClientRect().bottom + 2;
  const candidates = navLinks.map((link) => ({ link, target: resolveAnchor(link.hash) }))
    .filter(({ target }) => target && target.getClientRects().length);
  let current = candidates[0];
  for (const candidate of candidates) {
    if (candidate.target.getBoundingClientRect().top <= limit) current = candidate;
    else break;
  }
  navLinks.forEach((link) => {
    const active = link === current?.link;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
let navigationFrame;
function scheduleNavigationUpdate() {
  if (navigationFrame) return;
  navigationFrame = requestAnimationFrame(() => {
    navigationFrame = null;
    updateActiveNavigation();
  });
}
window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
window.addEventListener("resize", scheduleNavigationUpdate);
window.addEventListener("load", scheduleNavigationUpdate);
document.addEventListener("toggle", scheduleNavigationUpdate, true);
new ResizeObserver(scheduleNavigationUpdate).observe(document.querySelector("main"));
scheduleNavigationUpdate();

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 1800);
}

document.querySelectorAll("[data-copy]").forEach((token) => token.addEventListener("click", async () => {
  const value = token.dataset.copy;
  try {
    if (!navigator.clipboard) throw new Error("Clipboard API indisponible");
    await navigator.clipboard.writeText(value);
    showToast(`${value} copié`);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    showToast(copied ? `${value} copié` : `Valeur : ${value}`);
  }
}));

document.querySelectorAll(".accordion button").forEach((button) => button.addEventListener("click", () => {
  const expanded = button.getAttribute("aria-expanded") === "true";
  const panel = document.getElementById(button.getAttribute("aria-controls"));
  button.setAttribute("aria-expanded", String(!expanded));
  button.querySelector("span").textContent = expanded ? "+" : "−";
  panel.hidden = expanded;
}));

document.querySelectorAll("[data-answer]").forEach((button) => button.addEventListener("click", () => {
  const feedback = button.closest(".quiz-block").querySelector(".quiz-feedback");
  const correct = button.dataset.answer === "yes";
  feedback.textContent = correct ? "Exact. Une adresse IP peut permettre d’identifier indirectement une personne." : "Pas tout à fait : elle peut permettre une identification indirecte.";
}));

function initDSTabs(scope = document) {
  scope.querySelectorAll("[data-ds-tabs]").forEach((group) => {
    if (group.dataset.tabsReady) return;
    group.dataset.tabsReady = "true";
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const panels = [...group.querySelectorAll('[role="tabpanel"]')];
    function activate(tab, focus = true) {
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute("aria-controls"); });
      if (focus) tab.focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        activate(tabs[next]);
      });
    });
    if (tabs.length) activate(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0], false);
  });
}

function initDSDialogs(scope = document) {
  scope.querySelectorAll("[data-dialog-open]").forEach((trigger) => {
    if (trigger.dataset.dialogReady) return;
    const dialog = document.getElementById(trigger.dataset.dialogOpen);
    if (!(dialog instanceof HTMLDialogElement)) return;
    trigger.dataset.dialogReady = "true";
    trigger.addEventListener("click", () => {
      if (dialog.open) return;
      dialog.returnValue = "";
      dialog.addEventListener("close", () => {
        dialog.querySelectorAll("video, audio").forEach((media) => media.pause());
        const result = document.getElementById(dialog.dataset.dialogResult);
        if (result) result.textContent = dialog.returnValue === "confirm"
          ? dialog.dataset.dialogConfirmed : dialog.dataset.dialogCancelled;
        if (trigger.isConnected) trigger.focus();
      }, { once: true });
      dialog.showModal();
    });
  });
  scope.querySelectorAll("[data-dialog-close]").forEach((button) => {
    if (button.dataset.closeReady) return;
    button.dataset.closeReady = "true";
    button.addEventListener("click", () => button.closest("dialog").close("cancel"));
  });
}

initDSTabs();
initDSDialogs();

// Exposer le comportement réellement exécuté, sans maintenir une copie distincte.
function initDSNotifications(scope = document) {
  scope.querySelectorAll("[data-ds-notifications]").forEach((group) => {
    if (group.dataset.notificationsReady) return;
    group.dataset.notificationsReady = "true";
    const card = group.querySelector("[data-notification-card]");
    const message = group.querySelector("[data-notification-message]");
    const announcer = group.querySelector("[data-notification-announcer]");
    const close = group.querySelector("[data-notification-close]");
    let source;
    let announcement;
    group.querySelectorAll("[data-notification]").forEach((button) => {
      button.addEventListener("click", () => {
        source = button;
        card.dataset.kind = button.dataset.notification;
        message.textContent = button.dataset.message;
        card.hidden = false;
        clearTimeout(announcement);
        announcer.textContent = "";
        announcement = setTimeout(() => { announcer.textContent = message.textContent; }, 50);
      });
    });
    close.addEventListener("click", () => {
      const restore = card.contains(document.activeElement);
      card.hidden = true;
      clearTimeout(announcement);
      announcer.textContent = "";
      if (restore && source?.isConnected) source.focus();
    });
  });
}

function initDSTooltips(scope = document) {
  scope.querySelectorAll("[data-ds-tooltip]").forEach((trigger) => {
    if (trigger.dataset.tooltipReady) return;
    const tooltip = document.getElementById(trigger.dataset.dsTooltip);
    if (!tooltip) return;
    trigger.dataset.tooltipReady = "true";
    let timer;
    function position() {
      if (tooltip.hidden) return;
      const anchor = trigger.getBoundingClientRect();
      const box = tooltip.getBoundingClientRect();
      const width = document.documentElement.clientWidth;
      const height = window.innerHeight;
      tooltip.style.left = `${Math.max(12, Math.min(anchor.left, width - box.width - 12))}px`;
      const below = anchor.bottom + 8;
      tooltip.style.top = `${Math.max(12, Math.min(below + box.height > height - 12 ? anchor.top - box.height - 8 : below, height - box.height - 12))}px`;
    }
    function show() { clearTimeout(timer); tooltip.hidden = false; position(); }
    function hide() { clearTimeout(timer); tooltip.hidden = true; }
    function leave() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!trigger.matches(":hover") && !tooltip.matches(":hover") && document.activeElement !== trigger) hide();
      }, 150);
    }
    trigger.addEventListener("pointerenter", show);
    trigger.addEventListener("focus", show);
    trigger.addEventListener("click", show);
    trigger.addEventListener("pointerleave", leave);
    trigger.addEventListener("blur", leave);
    tooltip.addEventListener("pointerenter", () => clearTimeout(timer));
    tooltip.addEventListener("pointerleave", leave);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") hide(); });
    document.addEventListener("pointerdown", (event) => {
      if (!trigger.contains(event.target) && !tooltip.contains(event.target)) hide();
    });
    window.addEventListener("resize", position);
    document.addEventListener("scroll", position, true);
  });
}

function initDSPopovers(scope = document) {
  scope.querySelectorAll("[data-ds-popover]").forEach((trigger) => {
    if (trigger.dataset.popoverReady) return;
    const panel = document.getElementById(trigger.dataset.dsPopover);
    if (!panel) return;
    trigger.dataset.popoverReady = "true";
    function position() {
      if (panel.hidden) return;
      const anchor = trigger.getBoundingClientRect();
      const box = panel.getBoundingClientRect();
      const width = document.documentElement.clientWidth;
      const height = window.innerHeight;
      panel.style.left = `${Math.max(12, Math.min(anchor.left, width - box.width - 12))}px`;
      const below = anchor.bottom + 8;
      panel.style.top = `${Math.max(12, Math.min(below + box.height > height - 12 ? anchor.top - box.height - 8 : below, height - box.height - 12))}px`;
    }
    function close(restore = false) {
      if (panel.hidden) return;
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (restore) trigger.focus();
    }
    trigger.addEventListener("click", () => {
      if (!panel.hidden) { close(); return; }
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      position();
      (panel.querySelector('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]') || panel).focus();
    });
    panel.querySelectorAll("[data-popover-close]").forEach((button) => button.addEventListener("click", () => close(true)));
    panel.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener("click", () => {
      close();
      const target = document.getElementById(link.hash.slice(1));
      if (target) { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
    }));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) { event.preventDefault(); close(true); }
    });
    document.addEventListener("click", (event) => {
      if (!trigger.contains(event.target) && !panel.contains(event.target)) close();
    });
    document.addEventListener("focusin", (event) => {
      if (!trigger.contains(event.target) && !panel.contains(event.target)) close();
    });
    window.addEventListener("resize", position);
    document.addEventListener("scroll", position, true);
  });
}

initDSNotifications();
initDSTooltips();
initDSPopovers();

function initDSCode(scope = document) {
  scope.querySelectorAll("[data-ds-code]").forEach((block) => {
    if (block.dataset.codeReady) return;
    const code = block.querySelector("pre code");
    const button = block.querySelector("[data-code-copy]");
    const status = block.querySelector("[data-code-status]");
    if (!code || !button || !status) return;
    block.dataset.codeReady = "true";
    const source = code.textContent;
    if (block.hasAttribute("data-line-numbers")) {
      // A separate, hidden-from-AT gutter never enters copied code.
      const gutter = document.createElement("span");
      gutter.className = "ds-code__numbers";
      gutter.setAttribute("aria-hidden", "true");
      gutter.textContent = source.split("\n").map((_, index) => index + 1).join("\n");
      // Wrapped lines have variable heights: omit the gutter for this variant.
      if (!block.classList.contains("ds-code--wrap")) code.before(gutter);
    }
    button.hidden = false;
    button.addEventListener("click", async () => {
      status.textContent = "";
      try {
        await navigator.clipboard.writeText(source);
        status.textContent = "Code copié.";
      } catch {
        const input = document.createElement("textarea");
        input.value = source;
        input.style.cssText = "position:fixed;left:-9999px;top:0";
        document.body.append(input);
        input.select();
        let copied = false;
        try { copied = document.execCommand("copy"); } catch { /* Manual copy remains available. */ }
        input.remove();
        button.focus({ preventScroll: true });
        status.textContent = copied ? "Code copié." : "Copie indisponible : sélectionnez le code puis copiez-le manuellement.";
      }
    });
  });
}
initDSCode();

function initDSForms(scope = document) {
  scope.querySelectorAll("[data-ds-form]").forEach((form) => {
    if (form.dataset.formReady) return;
    form.dataset.formReady = "true";
    const status = form.querySelector("[data-form-status]");
    const fields = [...form.querySelectorAll(".field")];
    const touched = new Set();
    form.noValidate = true;
    form.querySelector("[data-form-submit]").disabled = false;
    status.textContent = "Démonstration : aucune donnée ne sera envoyée.";
    function validate(field) {
      const control = field.querySelector("input, select, textarea");
      const invalid = control.willValidate && !control.validity.valid;
      field.classList.toggle("invalid", invalid);
      control.setAttribute("aria-invalid", String(invalid));
      field.querySelector("[data-field-error]").textContent = invalid ? control.validationMessage : "";
      return !invalid;
    }
    fields.forEach((field) => {
      const control = field.querySelector("input, select, textarea");
      control.addEventListener("blur", () => { touched.add(field); validate(field); });
      ["input", "change"].forEach((event) => control.addEventListener(event, () => {
        status.textContent = "";
        if (touched.has(field)) validate(field);
      }));
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      fields.forEach((field) => { touched.add(field); validate(field); });
      const invalid = [...form.elements].filter((control) => control.willValidate && !control.validity.valid);
      if (invalid.length) {
        status.textContent = `Veuillez corriger ${invalid.length} champ(s).`;
        invalid[0].focus();
      } else {
        status.textContent = "Saisie valide. Démonstration uniquement : aucune donnée envoyée ou enregistrée.";
      }
    });
    form.addEventListener("reset", () => {
      touched.clear();
      fields.forEach((field) => {
        field.classList.remove("invalid");
        field.querySelector("input, select, textarea").removeAttribute("aria-invalid");
        field.querySelector("[data-field-error]").textContent = "";
      });
      status.textContent = "Formulaire réinitialisé.";
    });
  });
}
initDSForms();

[["onglets", initDSTabs], ["modales", initDSDialogs], ["notifications", initDSNotifications], ["infobulles", initDSTooltips], ["popovers", initDSPopovers], ["blocs-code", initDSCode], ["formulaire-complet", initDSForms]].forEach(([id, initialize]) => {
  const details = document.createElement("details");
  details.className = "code-block code-block-standalone";
  const summary = document.createElement("summary");
  summary.textContent = "Voir le JavaScript complet";
  const pre = document.createElement("pre");
  const code = document.createElement("code");
  code.textContent = `${initialize.toString()}\n\n${initialize.name}();`;
  pre.append(code);
  details.append(summary, pre);
  document.getElementById(id).append(details);
});

function updateSearchHighlights(query) {
  if (!("highlights" in CSS) || typeof Highlight === "undefined") return;
  CSS.highlights.delete("search-match");
  if (!query) return;

  const ranges = [];
  const normalizedQuery = query.toLocaleLowerCase("fr");
  const visibleSections = sections.filter((section) => !section.classList.contains("filtered-out"));

  visibleSections.forEach((section) => {
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim() || node.parentElement.closest("script, style")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.nodeValue.toLocaleLowerCase("fr");
      let start = 0;
      while ((start = text.indexOf(normalizedQuery, start)) !== -1) {
        const range = new Range();
        range.setStart(node, start);
        range.setEnd(node, start + query.length);
        ranges.push(range);
        start += query.length;
      }
    }
  });

  if (ranges.length) CSS.highlights.set("search-match", new Highlight(...ranges));
}

search.addEventListener("input", () => {
  const query = search.value.trim().toLocaleLowerCase("fr");
  sections.forEach((section) => {
    const haystack = `${section.dataset.search || ""} ${section.textContent}`.toLocaleLowerCase("fr");
    section.classList.toggle("filtered-out", query && !haystack.includes(query));
  });
  updateSearchHighlights(query);
});
