const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const shouldReduceMotion = () => prefersReducedMotion.matches;

const typewriterPhrases = [
  "Machine Learning Enthusiast",
  "Believer of Responsible AI",
  "Movie Connoisseur",
  "Book Collector",
  "Lifelong Learner",
];

let typewriterTimeoutId;
let typewriterContext;

const setTypewriterText = (text) => {
  const textElement = document.getElementById("typewriter-text");
  if (textElement) {
    textElement.textContent = text;
  }
};

const setCursorActive = (isActive) => {
  const cursorElement = document.querySelector(".hero-cursor");
  if (cursorElement) {
    cursorElement.setAttribute("data-active", isActive ? "true" : "false");
  }
};

const stopTypewriter = (preserveText = true) => {
  if (typewriterTimeoutId) {
    window.clearTimeout(typewriterTimeoutId);
    typewriterTimeoutId = undefined;
  }

  typewriterContext = undefined;

  if (preserveText) {
    setTypewriterText(typewriterPhrases[0]);
  }

  setCursorActive(false);
};

const startTypewriter = () => {
  const textElement = document.getElementById("typewriter-text");
  const cursorElement = document.querySelector(".hero-cursor");

  if (!textElement || !cursorElement) {
    return;
  }

  stopTypewriter(false);

  typewriterContext = {
    element: textElement,
    currentIndex: 0,
    charIndex: 0,
    isDeleting: false,
  };

  const tick = () => {
    if (!typewriterContext) {
      return;
    }

    const phrase = typewriterPhrases[typewriterContext.currentIndex];

    if (!typewriterContext.isDeleting) {
      typewriterContext.charIndex += 1;
      typewriterContext.element.textContent = phrase.slice(0, typewriterContext.charIndex);

      if (typewriterContext.charIndex === phrase.length) {
        typewriterContext.isDeleting = true;
        typewriterTimeoutId = window.setTimeout(tick, 1500);
        return;
      }
    } else {
      typewriterContext.charIndex -= 1;
      typewriterContext.element.textContent = phrase.slice(0, Math.max(typewriterContext.charIndex, 0));

      if (typewriterContext.charIndex <= 0) {
        typewriterContext.isDeleting = false;
        typewriterContext.currentIndex = (typewriterContext.currentIndex + 1) % typewriterPhrases.length;
        typewriterTimeoutId = window.setTimeout(tick, 480);
        return;
      }
    }

    const delay = typewriterContext.isDeleting ? 45 : 90;
    typewriterTimeoutId = window.setTimeout(tick, delay);
  };

  setCursorActive(true);
  typewriterContext.element.textContent = "";
  typewriterTimeoutId = window.setTimeout(tick, 280);
};

const initTypewriter = () => {
  if (shouldReduceMotion()) {
    stopTypewriter(true);
    return;
  }

  startTypewriter();
};

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
      const computedDelay = Math.min(index * 0.02, 0.08);
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

  initTypewriter();
};

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  revealElements();
  initTypewriter();

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", onMotionPreferenceChange);
  } else if (typeof prefersReducedMotion.addListener === "function") {
    prefersReducedMotion.addListener(onMotionPreferenceChange);
  }
});
