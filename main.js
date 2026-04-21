(function () {
  "use strict";

  var html = document.documentElement;

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    var input = document.getElementById("theme-toggle");
    if (input) {
      input.checked = theme === "dark";
      input.setAttribute(
        "aria-label",
        theme === "dark"
          ? "Passer en mode clair"
          : "Passer en mode sombre"
      );
    }
  }

  /** Pas de localStorage : thème système au chargement, toggle jusqu'au rechargement. */
  function initTheme() {
    applyTheme(getSystemTheme());

    var input = document.getElementById("theme-toggle");
    if (!input) return;

    input.addEventListener("change", function () {
      applyTheme(input.checked ? "dark" : "light");
    });
  }

  function initNav() {
    var openBtn = document.querySelector(".nav-toggle");
    var drawer = document.querySelector(".mobile-drawer");
    var backdrop = document.querySelector(".mobile-drawer__backdrop");
    var panel = document.querySelector(".mobile-drawer__panel");

    if (!openBtn || !drawer) return;

    function setOpen(open) {
      openBtn.setAttribute("aria-expanded", open ? "true" : "false");
      openBtn.setAttribute(
        "aria-label",
        open ? "Fermer le menu" : "Ouvrir le menu"
      );
      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.classList.toggle("nav-open", open);
    }

    openBtn.addEventListener("click", function () {
      var expanded = openBtn.getAttribute("aria-expanded") === "true";
      setOpen(!expanded);
    });

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setOpen(false);
      });
    }

    if (panel) {
      panel.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          setOpen(false);
        });
      });
    }

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  var WEB3FORMS_KEY_PLACEHOLDER = "REPLACE_WEB3FORMS_ACCESS_KEY";

  function initContactForm() {
    var form = document.getElementById("contact-form");
    var statusEl = document.getElementById("contact-form-status");
    var submitBtn = document.getElementById("contact-submit-btn");
    if (!form) return;

    function setStatus(kind, text) {
      if (!statusEl) return;
      statusEl.hidden = false;
      statusEl.textContent = text;
      statusEl.className = "contact-form__status contact-form__status--" + kind;
    }

    function clearStatus() {
      if (!statusEl) return;
      statusEl.hidden = true;
      statusEl.textContent = "";
      statusEl.className = "contact-form__status";
    }

    /** Messages FR (setCustomValidity) — appliqués avant checkValidity pour éviter les bulles vides (Prénom/Nom, etc.). */
    function syncContactFieldMessages() {
      var fields = form.querySelectorAll("input, textarea, select");
      var i;
      var el;

      for (i = 0; i < fields.length; i++) {
        el = fields[i];
        if (el.willValidate) el.setCustomValidity("");
      }

      for (i = 0; i < fields.length; i++) {
        el = fields[i];
        if (!el.willValidate) continue;
        if (el.type === "hidden") continue;
        if (el.classList.contains("contact-form__honey")) continue;

        if (el.required) {
          if (el.type === "checkbox") {
            if (!el.checked) el.setCustomValidity("Ça, c'est obligatoire.");
          } else if (!String(el.value || "").trim()) {
            el.setCustomValidity("Ça, c'est obligatoire.");
          }
        }

        if (el.validity.customError) continue;

        if (el.type === "email" && el.value && el.validity.typeMismatch) {
          el.setCustomValidity("Indique une adresse e-mail valide.");
        } else if (el.type === "tel" && el.value && el.validity.tooShort) {
          el.setCustomValidity("Ce numéro semble incomplet.");
        }
      }
    }

    form.addEventListener("input", function (e) {
      var el = e.target;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement
      ) {
        el.setCustomValidity("");
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearStatus();

      syncContactFieldMessages();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var accessKeyInput = form.querySelector('[name="access_key"]');
      var accessKey = accessKeyInput ? String(accessKeyInput.value || "").trim() : "";
      if (!accessKey || accessKey === WEB3FORMS_KEY_PLACEHOLDER) {
        setStatus(
          "error",
          "Clé Web3Forms manquante : remplacez REPLACE_WEB3FORMS_ACCESS_KEY dans la page Contact par votre clé."
        );
        return;
      }

      var fd = new FormData(form);
      var first = String(fd.get("firstName") || "").trim();
      var last = String(fd.get("lastName") || "").trim();
      var email = String(fd.get("email") || "").trim();
      var phone = String(fd.get("phone") || "").trim();
      var activity = String(fd.get("activity") || "").trim();
      var message = String(fd.get("message") || "").trim();

      var fullName = first + " " + last;
      var phoneFull = phone;

      var lines = [
        "Activité : " + activity,
        "",
        "Téléphone : " + phoneFull,
        "Email : " + email,
      ];
      if (message) {
        lines.push("", "Message :", message);
      }
      var bodyText = lines.join("\n");

      var payload = {
        access_key: accessKey,
        subject: "Contact NOVO. — " + fullName,
        name: fullName,
        email: email,
        message: bodyText,
      };

      payload.phone = phoneFull;
      payload.activity = activity;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
      }

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data && data.success) {
            setStatus(
              "success",
              "Merci. Votre message a bien été envoyé — nous vous répondons sous 24 h."
            );
            form.reset();
            if (accessKeyInput) {
              accessKeyInput.value = accessKey;
            }
          } else {
            var err =
              (data && data.message) ||
              "Envoi impossible. Réessayez ou écrivez à info@novodesign.ch.";
            setStatus("error", err);
          }
        })
        .catch(function () {
          setStatus(
            "error",
            "Problème de connexion. Réessayez ou écrivez à info@novodesign.ch."
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute("aria-busy");
          }
        });
    });
  }

  function initScrollProgress() {
    var bar = document.querySelector(".scroll-progress");
    if (!bar) return;

    function update() {
      var scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      var docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      var p = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.width = Math.min(100, Math.max(0, p * 100)) + "%";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNav();
    initContactForm();
    initScrollProgress();
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();
