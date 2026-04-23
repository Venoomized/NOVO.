(function () {
  "use strict";

  /** ID de mesure GA4 — gtag n’est jamais chargé au premier paint ; uniquement après consentement (bannière) ou reprise d’un choix enregistré. */
  var NOVO_GA4_MEASUREMENT_ID = "G-NDHSPJS7NG";

  var COOKIE_STORAGE_KEY = "novo_cookie_consent_v1";

  var html = document.documentElement;

  /**
   * Mobile : hauteur de zone utile en px (--vv-h), imobile au scroll. Les barres
   * d’adresse / du bas changent innerHeight + les unités vh/svh = reflow. On
   * n’enregistre qu’au chargement / retournement bfcache / orientation / passage
   * mobile↔bureau, jamais sur window.resize.
   */
  function applyMobileViewportHeightLock() {
    var mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) {
      html.style.removeProperty("--vv-h");
      return;
    }
    var h;
    if (window.visualViewport && window.visualViewport.height) {
      h = window.visualViewport.height;
    } else {
      h = window.innerHeight;
    }
    if (h > 0) {
      html.style.setProperty("--vv-h", Math.round(h) + "px");
    }
  }

  function initMobileViewportHeightLock() {
    applyMobileViewportHeightLock();
    window.addEventListener("load", function () {
      setTimeout(applyMobileViewportHeightLock, 0);
    });
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) {
        setTimeout(applyMobileViewportHeightLock, 0);
      }
    });
    window.addEventListener("orientationchange", function () {
      setTimeout(applyMobileViewportHeightLock, 300);
      setTimeout(function () {
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === "function") {
          window.ScrollTrigger.refresh();
        }
      }, 400);
    });
    var mq2 = window.matchMedia("(max-width: 1023px)");
    if (typeof mq2.addEventListener === "function") {
      mq2.addEventListener("change", applyMobileViewportHeightLock);
    } else if (typeof mq2.addListener === "function") {
      mq2.addListener(applyMobileViewportHeightLock);
    }
  }
  initMobileViewportHeightLock();

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
    var navScrollY = 0;

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
      document.documentElement.classList.toggle("nav-open", open);
      if (open) {
        navScrollY = window.scrollY || document.documentElement.scrollTop;
        document.body.style.position = "fixed";
        document.body.style.top = -navScrollY + "px";
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
      } else {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        window.scrollTo(0, navScrollY);
      }
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
      var sc = document.scrollingElement || document.documentElement;
      var scrollTop = sc.scrollTop;
      var maxScroll = sc.scrollHeight - sc.clientHeight;
      var p = maxScroll > 0 ? scrollTop / maxScroll : 0;
      bar.style.width = Math.min(100, Math.max(0, p * 100)) + "%";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  var ga4Injected = false;

  function getCookieConsent() {
    try {
      var raw = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (o && typeof o.a === "boolean") return o;
    } catch (e) {
      /* ignore */
    }
    return null;
  }

  function setCookieConsent(analytics) {
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({ a: !!analytics, t: Date.now() })
      );
    } catch (e) {
      /* private mode, etc. */
    }
    window.dispatchEvent(
      new CustomEvent("novo:cookie-consent", {
        detail: { analytics: !!analytics },
      })
    );
  }

  function shouldInjectGa4() {
    var id = String(NOVO_GA4_MEASUREMENT_ID || "").trim();
    if (!id || !/^G-[A-Z0-9]+$/i.test(id)) {
      return false;
    }
    return true;
  }

  function injectGoogleAnalytics4() {
    if (ga4Injected || !shouldInjectGa4()) return;
    ga4Injected = true;

    var id = String(NOVO_GA4_MEASUREMENT_ID).trim();
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", id);

    var s = document.createElement("script");
    s.async = true;
    s.src =
      "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  function initCookieBanner() {
    var consent = getCookieConsent();
    if (consent && consent.a) {
      injectGoogleAnalytics4();
    }

    var root;
    var mainBlock;
    var detailBlock;
    var analyticsInput;
    var currentSource = "first";
    var lastFocus = null;

    function setBodyPadding() {
      if (!root || root.hasAttribute("hidden")) {
        document.body.classList.remove("has-cookie-banner");
        document.body.style.paddingBottom = "";
        return;
      }
      var h = root.offsetHeight;
      document.body.classList.add("has-cookie-banner");
      document.body.style.paddingBottom = h + "px";
    }

    function showMain() {
      if (mainBlock) mainBlock.removeAttribute("hidden");
      if (detailBlock) detailBlock.setAttribute("hidden", "");
    }

    function showDetail() {
      if (mainBlock) mainBlock.setAttribute("hidden", "");
      if (detailBlock) {
        detailBlock.removeAttribute("hidden");
        if (analyticsInput) {
          var c = getCookieConsent();
          analyticsInput.checked = c ? !!c.a : true;
        }
        var b = detailBlock.querySelector("[data-cookie-detail-back]");
        if (b) {
          if (currentSource === "footer" && getCookieConsent() !== null) {
            b.textContent = "Fermer";
            b.setAttribute("aria-label", "Fermer sans modifier");
          } else {
            b.textContent = "Retour";
            b.setAttribute("aria-label", "Retour au choix simple");
          }
        }
      }
    }

    function openBanner(source) {
      currentSource = source || "first";
      if (!root) return;
      lastFocus = document.activeElement;
      root.removeAttribute("hidden");
      root.setAttribute("aria-hidden", "false");
      if (source === "footer") {
        showDetail();
      } else {
        showMain();
      }
      setBodyPadding();
      requestAnimationFrame(function () {
        requestAnimationFrame(setBodyPadding);
      });
      setTimeout(function () {
        setBodyPadding();
        if (source === "footer" && analyticsInput) {
          analyticsInput.focus();
        } else {
          var accept = root.querySelector("[data-cookie-accept-all]");
          if (accept) accept.focus();
        }
      }, 10);
    }

    function closeBanner() {
      if (!root) return;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
      showMain();
      setBodyPadding();
      if (lastFocus && lastFocus.focus) {
        lastFocus.focus();
        lastFocus = null;
      }
    }

    function applyAcceptAll() {
      setCookieConsent(true);
      injectGoogleAnalytics4();
      closeBanner();
    }

    function applyFromDetail() {
      var on = analyticsInput && analyticsInput.checked;
      setCookieConsent(on);
      if (on) {
        injectGoogleAnalytics4();
      }
      closeBanner();
    }

    root = document.createElement("div");
    root.id = "novo-cookie-banner";
    root.className = "cookie-consent";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "novo-cookie-title");
    root.setAttribute("hidden", "");
    root.setAttribute("aria-hidden", "true");

    var panel = document.createElement("div");
    panel.className = "cookie-consent__panel";
    root.appendChild(panel);

    var title = document.createElement("h2");
    title.id = "novo-cookie-title";
    title.className = "cookie-consent__title";
    title.textContent = "Cookies";

    var lead = document.createElement("p");
    lead.className = "cookie-consent__lead";
    lead.innerHTML =
      "Nous en utilisons pour le fonctionnement du site et, si vous l’acceptez, la mesure d’audience. " +
      "<a href=\"./politique-cookies.html\">En savoir plus</a>";

    mainBlock = document.createElement("div");
    mainBlock.className = "cookie-consent__main";
    mainBlock.setAttribute("data-cookie-main", "");

    var mainRow = document.createElement("div");
    mainRow.className = "cookie-consent__mainrow";

    var copyCol = document.createElement("div");
    copyCol.className = "cookie-consent__copy";
    copyCol.appendChild(title);
    copyCol.appendChild(lead);

    var row1 = document.createElement("div");
    row1.className = "cookie-consent__actions";

    var bAccept = document.createElement("button");
    bAccept.type = "button";
    bAccept.className = "btn btn--primary cookie-consent__btn";
    bAccept.setAttribute("data-cookie-accept-all", "");
    bAccept.textContent = "Tout accepter";
    bAccept.addEventListener("click", applyAcceptAll);

    var bCustom = document.createElement("button");
    bCustom.type = "button";
    bCustom.className = "btn btn--ghost cookie-consent__btn";
    bCustom.setAttribute("data-cookie-open-detail", "");
    bCustom.textContent = "Personnaliser";
    bCustom.addEventListener("click", function () {
      currentSource = "first";
      showDetail();
      setBodyPadding();
    });

    row1.appendChild(bAccept);
    row1.appendChild(bCustom);
    mainRow.appendChild(copyCol);
    mainRow.appendChild(row1);
    mainBlock.appendChild(mainRow);
    panel.appendChild(mainBlock);

    detailBlock = document.createElement("div");
    detailBlock.className = "cookie-consent__detail";
    detailBlock.setAttribute("hidden", "");

    var pDetail = document.createElement("p");
    pDetail.className = "cookie-consent__detail-text";
    pDetail.textContent =
      "Les cookies essentiels restent actifs. Cochez pour activer l’analytique (GA4), " +
      "décochez pour refuser. Modifiable via « Gérer les cookies » en bas de page.";

    var labelRow = document.createElement("label");
    labelRow.className = "cookie-consent__toggle";
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = "novo-cookie-analytics";
    cb.setAttribute("data-cookie-analytics", "");
    analyticsInput = cb;
    var sp = document.createElement("span");
    sp.className = "cookie-consent__toggle-text";
    sp.textContent = "Cookies analytiques (mesure d’audience, Google Analytics)";
    labelRow.appendChild(cb);
    labelRow.appendChild(sp);

    var row2 = document.createElement("div");
    row2.className = "cookie-consent__actions cookie-consent__actions--secondary";

    var bSave = document.createElement("button");
    bSave.type = "button";
    bSave.className = "btn btn--primary cookie-consent__btn";
    bSave.setAttribute("data-cookie-save", "");
    bSave.textContent = "Enregistrer";
    bSave.addEventListener("click", applyFromDetail);

    var bBack = document.createElement("button");
    bBack.type = "button";
    bBack.className = "btn btn--ghost cookie-consent__btn";
    bBack.setAttribute("data-cookie-detail-back", "");
    bBack.addEventListener("click", function () {
      if (currentSource === "footer") {
        if (getCookieConsent() === null) {
          currentSource = "first";
          showMain();
          setBodyPadding();
          var acc = root.querySelector("[data-cookie-accept-all]");
          if (acc) acc.focus();
          return;
        }
        closeBanner();
        return;
      }
      showMain();
      setBodyPadding();
      var a = root.querySelector("[data-cookie-accept-all]");
      if (a) a.focus();
    });

    row2.appendChild(bSave);
    row2.appendChild(bBack);
    detailBlock.appendChild(pDetail);
    detailBlock.appendChild(labelRow);
    detailBlock.appendChild(row2);
    panel.appendChild(detailBlock);

    document.body.appendChild(root);

    window.addEventListener("resize", setBodyPadding);

    if (consent === null) {
      openBanner("first");
    }

    document.querySelectorAll("[data-cookie-settings]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var c0 = getCookieConsent();
        if (analyticsInput) {
          analyticsInput.checked = c0 ? !!c0.a : true;
        }
        openBanner("footer");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !root || root.hasAttribute("hidden") || !detailBlock) {
        return;
      }
      if (detailBlock.hasAttribute("hidden")) {
        return;
      }
      if (currentSource === "footer") {
        if (getCookieConsent() === null) {
          currentSource = "first";
          showMain();
          setBodyPadding();
          var acc2 = root.querySelector("[data-cookie-accept-all]");
          if (acc2) acc2.focus();
        } else {
          closeBanner();
        }
        e.preventDefault();
        return;
      }
      showMain();
      setBodyPadding();
      var t = root.querySelector("[data-cookie-open-detail]");
      if (t) t.focus();
      e.preventDefault();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNav();
    initContactForm();
    initScrollProgress();
    initCookieBanner();
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();
