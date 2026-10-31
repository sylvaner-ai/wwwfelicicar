(function () {
  "use strict";

  // Menu mobile
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    var setOpen = function (open) {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    };
    toggle.addEventListener("click", function () {
      setOpen(!links.classList.contains("is-open"));
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
