(function () {
  "use strict";

  // Menu mobile
  var nav = document.getElementById("nav");
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (nav && toggle && links) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Apparition au défilement
  var revealed = document.querySelectorAll("[data-reveal], #steps");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Configurateur de durée
  var range = document.getElementById("cfg-duree");
  var out = document.getElementById("cfg-out");
  var end = document.getElementById("cfg-end");
  var cta = document.getElementById("cfg-cta");
  var options = document.querySelectorAll("#configurator .option");
  var category = "Berline";

  var dureeOption = function (months) {
    if (months <= 1) return "1 mois";
    if (months <= 3) return "2 à 3 mois";
    if (months <= 6) return "4 à 6 mois";
    if (months <= 12) return "7 à 12 mois";
    return "13 à 24 mois";
  };

  if (range && out && end) {
    var updateRange = function () {
      var months = parseInt(range.value, 10);
      out.textContent = months + " mois";
      range.style.setProperty("--fill", ((months - 1) / 23) * 100 + "%");
      var d = new Date();
      d.setMonth(d.getMonth() + months);
      end.textContent = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    };
    range.addEventListener("input", updateRange);
    updateRange();

    options.forEach(function (btn) {
      btn.addEventListener("click", function () {
        options.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        category = btn.getAttribute("data-cat");
      });
    });

    // Préremplit le formulaire avec les choix du configurateur
    if (cta) {
      cta.addEventListener("click", function () {
        var duree = document.getElementById("duree");
        var categorie = document.getElementById("categorie");
        if (duree) duree.value = dureeOption(parseInt(range.value, 10));
        if (categorie) categorie.value = category;
      });
    }
  }

  // Onglets de la flotte
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var selectTab = function (tab) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
    });
  };
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) {
        e.preventDefault();
        selectTab(next);
        next.focus();
      }
    });
  });

  // Formulaire de devis
  var form = document.getElementById("quote-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var submit = form.querySelector('button[type="submit"]');
  var time = document.getElementById("form-time");
  var debut = document.getElementById("debut");

  if (time) time.value = String(Math.floor(Date.now() / 1000));
  if (debut) {
    var d = new Date();
    debut.min = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  var showStatus = function (type, message) {
    status.hidden = false;
    status.className = "form-status is-" + type;
    status.textContent = message;
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submit.disabled = true;
    submit.textContent = "Envoi en cours…";
    status.hidden = true;

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !data.ok) throw new Error(data.error || "Erreur d'envoi");
          return data;
        });
      })
      .then(function () {
        form.reset();
        if (time) time.value = String(Math.floor(Date.now() / 1000));
        showStatus("success", "Merci, votre demande a bien été envoyée. Un conseiller vous répond sous 4 h ouvrées.");
      })
      .catch(function (err) {
        showStatus("error", (err && err.message && err.message !== "Failed to fetch" ? err.message + ". " : "") +
          "Vous pouvez aussi nous écrire directement à contact@felicicar.fr.");
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = "Envoyer ma demande";
      });
  });
})();
