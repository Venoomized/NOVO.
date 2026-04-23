(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function wrapWords(el) {
    var text = el.textContent.trim();
    var words = text.split(/\s+/);
    el.textContent = "";
    words.forEach(function (word, i) {
      var outer = document.createElement("span");
      outer.className = "split-word";
      var inner = document.createElement("span");
      inner.className = "split-word-inner";
      inner.textContent = word + (i < words.length - 1 ? "\u00a0" : "");
      outer.appendChild(inner);
      el.appendChild(outer);
    });
  }

  function initFadeUps() {
    if (prefersReducedMotion()) return;
    gsap.utils.toArray("[data-fade-up]").forEach(function (el) {
      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      });
    });
  }

  /** Années d’activité : +1 chaque 1er août (référence au 1er août de l’année de départ). */
  function yearsSinceAugustFirst(startYear) {
    var now = new Date();
    var y = now.getFullYear();
    var years = y - startYear;
    if (now.getMonth() < 7) {
      years--;
    }
    return Math.max(0, years);
  }

  function applyDynamicYearCounters() {
    document.querySelectorAll("[data-years-start-year]").forEach(function (el) {
      var sy = parseInt(el.getAttribute("data-years-start-year"), 10);
      if (Number.isNaN(sy)) return;
      el.setAttribute("data-counter", String(yearsSinceAugustFirst(sy)));
    });
  }

  function initHomeAnimations() {
    if (prefersReducedMotion()) {
      gsap.set(".split-word-inner", { y: 0 });
      gsap.set(".hero__mock", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set("[data-reveal-clip]", { clipPath: "inset(0% 0% 0% 0%)" });
      return;
    }

    document.querySelectorAll("[data-animate-words]").forEach(wrapWords);

    gsap.to(".split-word-inner", {
      y: 0,
      duration: 0.85,
      stagger: 0.06,
      ease: "power3.out",
      delay: 0.15,
    });

    var mock = document.querySelector(".hero__mock");
    if (mock) {
      gsap.to(mock, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.1,
        ease: "power2.inOut",
        delay: 0.2,
      });
    }

    document.querySelectorAll("[data-reveal-clip]").forEach(function (el) {
      gsap.fromTo(
        el,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    document.querySelectorAll("[data-counter]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-counter"), 10);
      if (Number.isNaN(target)) return;
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
        onUpdate: function () {
          var v = obj.val;
          var out =
            decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
          el.textContent = out + suffix;
        },
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyDynamicYearCounters();

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* Évite les refresh ScrollTrigger à chaque « resize » (barre d’adresse mobile) — supprime les sauts / recalculs au scroll. */
    if (typeof ScrollTrigger.config === "function") {
      ScrollTrigger.config({ ignoreMobileResize: true });
    }

    initFadeUps();

    var page = document.body && document.body.getAttribute("data-page");
    if (page === "home") {
      initHomeAnimations();
    }
  });
})();
