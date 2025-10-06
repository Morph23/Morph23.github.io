const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const shouldReduceMotion = () => prefersReducedMotion.matches;

let revealObserver;

const setCurrentYear = () => {
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
};

const revealElements = () => {
  const animatedElements = Array.from(document.querySelectorAll("[data-animate]"));
  if (!animatedElements.length) {
    return;
  }

  animatedElements.forEach((element, index) => {
    if (element.dataset.delay) {
      const delay = Number.parseFloat(element.dataset.delay);
      if (!Number.isNaN(delay)) {
        element.style.setProperty("--delay", `${delay}s`);
      }
      return;
    }

    if (!element.style.getPropertyValue("--delay")) {
      const computedDelay = Math.min(index * 0.06, 0.35);
      element.style.setProperty("--delay", `${computedDelay.toFixed(2)}s`);
    }
  });

  if ("IntersectionObserver" in window && !shouldReduceMotion()) {
    if (revealObserver) {
      revealObserver.disconnect();
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            return;
          }

          if (entry.boundingClientRect.bottom <= 0 || entry.boundingClientRect.top >= viewportHeight) {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -12%",
      }
    );

    animatedElements.forEach((element) => revealObserver.observe(element));
  } else {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = undefined;
    }
    animatedElements.forEach((element) => element.classList.add("is-visible"));
  }
};

const onMotionPreferenceChange = (event) => {
  if (event.matches) {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = undefined;
    }
    document
      .querySelectorAll("[data-animate]")
      .forEach((element) => {
        element.classList.add("is-visible");
        element.style.removeProperty("--delay");
      });
  } else {
    revealElements();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  revealElements();

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", onMotionPreferenceChange);
  } else if (typeof prefersReducedMotion.addListener === "function") {
    prefersReducedMotion.addListener(onMotionPreferenceChange);
  }
});
