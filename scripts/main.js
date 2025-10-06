const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const shouldReduceMotion = () => prefersReducedMotion.matches;

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
      const computedDelay = Math.min(index * 0.08, 0.6);
      element.style.setProperty("--delay", `${computedDelay.toFixed(2)}s`);
    }
  });

  if ("IntersectionObserver" in window && !shouldReduceMotion()) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10%",
      }
    );

    animatedElements.forEach((element) => observer.observe(element));
  } else {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
  }
};

const initHeroTilt = () => {
  const portrait = document.querySelector(".hero-portrait[data-tilt]");
  if (!portrait || shouldReduceMotion()) {
    return;
  }

  if (portrait.dataset.tiltInitialized === "true") {
    return;
  }

  portrait.dataset.tiltInitialized = "true";

  const maxTilt = 8;
  let animationFrame;

  const resetTilt = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    }

    portrait.classList.remove("is-tilting");
    portrait.style.setProperty("--tilt-x", "0deg");
    portrait.style.setProperty("--tilt-y", "0deg");

    requestAnimationFrame(() => {
      portrait.removeAttribute("data-tilt-active");
    });
  };

  const updateTilt = (event) => {
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    if (shouldReduceMotion()) {
      resetTilt();
      return;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    animationFrame = requestAnimationFrame(() => {
      const rect = portrait.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((offsetX - centerX) / centerX) * maxTilt;
      const rotateX = -((offsetY - centerY) / centerY) * maxTilt;

      portrait.setAttribute("data-tilt-active", "true");
      portrait.classList.add("is-tilting");
      portrait.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      portrait.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
    });
  };

  portrait.addEventListener("pointermove", updateTilt);
  portrait.addEventListener("pointerenter", updateTilt);
  portrait.addEventListener("pointerleave", resetTilt);
  portrait.addEventListener("pointercancel", resetTilt);
  portrait.addEventListener("pointerup", resetTilt);
};

const onMotionPreferenceChange = (event) => {
  if (event.matches) {
    document
      .querySelectorAll("[data-animate]")
      .forEach((element) => {
        element.classList.add("is-visible");
        element.style.removeProperty("--delay");
      });
  } else {
    revealElements();
    initHeroTilt();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  revealElements();
  initHeroTilt();

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", onMotionPreferenceChange);
  } else if (typeof prefersReducedMotion.addListener === "function") {
    prefersReducedMotion.addListener(onMotionPreferenceChange);
  }
});
