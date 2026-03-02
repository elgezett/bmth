// Intro gift animation + scroll-triggered memories

const setupIntroAnimation = () => {
  const body = document.body;
  const introScreen = document.querySelector(".intro-screen");
  const giftLid = document.querySelector(".intro-gift-lid");

  if (!introScreen || !giftLid) {
    // Ensure we always land at the very top of the page
    window.scrollTo(0, 0);
    body.classList.add("intro-complete");
    return;
  }

  let finished = false;

  const finishIntro = () => {
    if (finished) return;
    finished = true;

    // After the gift opens, make sure the viewport shows the hero at the very top
    window.scrollTo(0, 0);

    body.classList.add("intro-complete");
    introScreen.classList.add("intro-screen--done");

    // After fade-out, fully remove to avoid intercepting clicks
    setTimeout(() => {
      introScreen.style.display = "none";
    }, 800);
  };

  giftLid.addEventListener("animationend", (event) => {
    if (event.animationName === "giftLidOpen") {
      finishIntro();
    }
  });

  // Safety timeout in case animationend doesn't fire
  setTimeout(finishIntro, 7000);
};

const setupMemoriesAnimation = () => {
  const memories = Array.from(document.querySelectorAll(".memory"));

  if (!("IntersectionObserver" in window) || memories.length === 0) {
    // Fallback: just reveal all memories if IntersectionObserver isn't supported
    memories.forEach((mem) => {
      mem.classList.add("memory-visible");
    });
    return;
  }

  const animationClasses = [
    "memory-anim-fade-up",
    "memory-anim-slide-left",
    "memory-anim-slide-right",
    "memory-anim-pop",
    "memory-anim-tilt",
    "memory-anim-zoom",
    "memory-anim-rotate",
    "memory-anim-swing",
    "memory-anim-lift",
    "memory-anim-wave",
  ];

  let currentIndex = 0;
  let previousAnimation = null;

  const chooseNextAnimation = () => {
    if (animationClasses.length === 1) return animationClasses[0];

    let candidate;
    let safety = 0;
    do {
      candidate =
        animationClasses[Math.floor(Math.random() * animationClasses.length)];
      safety += 1;
      // avoid same animation directly after another
    } while (candidate === previousAnimation && safety < 10);

    previousAnimation = candidate;
    return candidate;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      // sort so that elements higher on the page process first
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.target.dataset.memoryIndex - b.target.dataset.memoryIndex);

      visibleEntries.forEach((entry) => {
        const element = entry.target;

        if (element.dataset.animated === "true") {
          observer.unobserve(element);
          return;
        }

        const animationClass = chooseNextAnimation();

        element.classList.add("memory-visible", animationClass);
        element.dataset.animated = "true";

        // Slight staggering effect as you scroll quickly
        const delay = Math.min(currentIndex * 40, 240); // cap delay
        element.style.animationDelay = `${delay}ms`;

        currentIndex += 1;
        observer.unobserve(element);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  memories.forEach((memory, index) => {
    memory.dataset.memoryIndex = index.toString();
    observer.observe(memory);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  setupIntroAnimation();
  setupMemoriesAnimation();
});

