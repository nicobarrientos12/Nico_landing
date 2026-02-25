document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;
    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const isTesisPage = document.body.classList.contains("page-tesis");
const isCvPage = document.body.classList.contains("page-cv");
const isBioPage = document.body.classList.contains("page-biografia");

if (isBioPage) {
  const revealTargets = document.querySelectorAll(".bio-reveal");

  if ("IntersectionObserver" in window && revealTargets.length > 0) {
    const bioObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );

    revealTargets.forEach((element) => bioObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }
}

if (isCvPage) {
  const revealTargets = document.querySelectorAll(".cv-reveal");

  if ("IntersectionObserver" in window && revealTargets.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tiltTargets = document.querySelectorAll(".cv-tilt");

  if (!prefersReducedMotion && tiltTargets.length > 0) {
    tiltTargets.forEach((card) => {
      const onMove = (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateX = (0.5 - y) * 4;
        const rotateY = (x - 0.5) * 6;
        card.style.transform = `translateY(-3px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      };

      const onLeave = () => {
        card.style.transform = "";
      };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
    });
  }
}

if (isTesisPage) {
  const revealTargets = document.querySelectorAll(
    ".hero, .section, .logo-card, .toc-list li, .impact-card, .tc-card, .tc-highlight, .tc-metrics .metric-card, .conclusion-feature, .conclusion-card"
  );

  if ("IntersectionObserver" in window && revealTargets.length > 0) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );

    revealTargets.forEach((element) => {
      element.classList.add("reveal");
      observer.observe(element);
    });
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }

  const thesisProgressFill = document.querySelector(".thesis-progress span");
  const thesisHero = document.querySelector(".thesis-hero-cinematic");

  const updateReadingProgress = () => {
    if (!thesisProgressFill) return;
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
    thesisProgressFill.style.width = `${(ratio * 100).toFixed(2)}%`;
  };

  updateReadingProgress();
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (thesisHero && !reducedMotion) {
    thesisHero.addEventListener("mousemove", (event) => {
      const rect = thesisHero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 3;
      const rotateY = (x - 0.5) * 4;
      thesisHero.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });
    thesisHero.addEventListener("mouseleave", () => {
      thesisHero.style.transform = "";
    });
  }

  const pawTrail = document.querySelector(".paw-trail") ?? (() => {
    const layer = document.createElement("div");
    layer.className = "paw-trail";
    document.body.appendChild(layer);
    return layer;
  })();

  const initCarousel = (carousel) => {
    const viewport = carousel.querySelector(".arch-viewport");
    const track = carousel.querySelector(".arch-track");
    const prevButton = carousel.querySelector(".arch-prev");
    const nextButton = carousel.querySelector(".arch-next");
    const dotsWrap = carousel.querySelector(".arch-dots");
    if (!viewport || !track || !prevButton || !nextButton || !dotsWrap) return;

    const slides = Array.from(track.querySelectorAll(".arch-card"));
    if (!slides.length) return;

    let currentIndex = 0;
    let syncFrame = null;
    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "arch-dot";
      dot.setAttribute("aria-label", `Ir a tarjeta ${index + 1}`);
      dotsWrap.appendChild(dot);
      dot.addEventListener("click", () => {
        currentIndex = index;
        renderCarousel();
      });
      return dot;
    });

    const setViewportOffset = (offset, smooth = false) => {
      if (typeof viewport.scrollTo === "function") {
        try {
          viewport.scrollTo({ left: offset, behavior: smooth ? "smooth" : "auto" });
          return;
        } catch (_) {
          // Fallback below for browsers with partial support
        }
      }
      viewport.scrollLeft = offset;
    };

    const slideWidth = () => slides[0]?.getBoundingClientRect().width || viewport.clientWidth || 1;

    const syncIndexFromScroll = () => {
      const width = slideWidth();
      const nextIndex = Math.round(viewport.scrollLeft / width);
      const boundedIndex = Math.max(0, Math.min(slides.length - 1, nextIndex));
      if (boundedIndex === currentIndex) return;
      currentIndex = boundedIndex;
      dots.forEach((dot, index) => {
        const active = index === currentIndex;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    };

    const renderCarousel = () => {
      const offset = slideWidth() * currentIndex;
      setViewportOffset(offset, true);
      dots.forEach((dot, index) => {
        const active = index === currentIndex;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    };

    prevButton.addEventListener("click", () => {
      currentIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
      renderCarousel();
    });

    nextButton.addEventListener("click", () => {
      currentIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
      renderCarousel();
    });

    viewport.addEventListener(
      "scroll",
      () => {
        if (syncFrame) cancelAnimationFrame(syncFrame);
        syncFrame = requestAnimationFrame(() => {
          syncIndexFromScroll();
          syncFrame = null;
        });
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      setViewportOffset(slideWidth() * currentIndex);
    });
    renderCarousel();
  };

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    initCarousel(carousel);
  });

  const initCountUp = () => {
    const counters = Array.from(document.querySelectorAll(".count-up[data-target]"));
    if (!counters.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setCounterValue = (element, value) => {
      const prefix = element.dataset.prefix || "";
      const suffix = element.dataset.suffix || "";
      element.textContent = `${prefix}${value}${suffix}`;
    };

    const animateCounter = (element) => {
      const target = Number(element.dataset.target || "0");
      if (!Number.isFinite(target)) return;
      if (prefersReducedMotion) {
        setCounterValue(element, Math.round(target));
        return;
      }

      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        setCounterValue(element, current);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.45 }
      );

      counters.forEach((counter) => observer.observe(counter));
    } else {
      counters.forEach((counter) => animateCounter(counter));
    }
  };

  initCountUp();

  const initDiagramLightbox = () => {
    const lightbox = document.querySelector(".diagram-lightbox");
    if (!lightbox) return;

    const content = lightbox.querySelector(".diagram-lightbox-content");
    const image = lightbox.querySelector(".diagram-lightbox-image");
    const title = lightbox.querySelector(".diagram-lightbox-title");
    const triggerButtons = Array.from(document.querySelectorAll("[data-lightbox-src]"));
    const closeButtons = Array.from(lightbox.querySelectorAll("[data-lightbox-close]"));
    if (!content || !image || !title || !triggerButtons.length) return;

    let closeTimer = null;

    const closeLightbox = () => {
      if (lightbox.hidden) return;
      lightbox.classList.remove("is-open");
      if (closeTimer) window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        lightbox.hidden = true;
        lightbox.setAttribute("aria-hidden", "true");
        image.setAttribute("src", "");
        image.setAttribute("alt", "");
        title.textContent = "";
      }, 240);
    };

    const openLightbox = (src, label, triggerElement = null) => {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }

      if (triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const deltaX = centerX - viewportCenterX;
        const deltaY = centerY - viewportCenterY;
        const originX = `${(centerX / window.innerWidth) * 100}%`;
        const originY = `${(centerY / window.innerHeight) * 100}%`;
        const baseScale = Math.max(0.78, Math.min(0.94, rect.width / Math.max(window.innerWidth * 0.92, 1)));

        content.style.setProperty("--lb-from-x", `${deltaX * 0.18}px`);
        content.style.setProperty("--lb-from-y", `${deltaY * 0.18}px`);
        content.style.setProperty("--lb-origin-x", originX);
        content.style.setProperty("--lb-origin-y", originY);
        content.style.setProperty("--lb-from-scale", String(baseScale));
      } else {
        content.style.removeProperty("--lb-from-x");
        content.style.removeProperty("--lb-from-y");
        content.style.removeProperty("--lb-origin-x");
        content.style.removeProperty("--lb-origin-y");
        content.style.removeProperty("--lb-from-scale");
      }

      image.setAttribute("src", src);
      image.setAttribute("alt", label || "Diagrama ampliado");
      title.textContent = label || "Diagrama";
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => {
        lightbox.classList.add("is-open");
      });
    };

    triggerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const src = button.getAttribute("data-lightbox-src");
        const label = button.getAttribute("data-lightbox-title") || "";
        if (!src) return;
        openLightbox(src, label, button);
      });
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", closeLightbox);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  };

  initDiagramLightbox();

  const tocLinks = Array.from(document.querySelectorAll(".toc-list a"));
  const tocContainer = document.querySelector(".tesis-index");
  let currentTocSectionId = "";

  const setActiveTocLink = (sectionId) => {
    if (!sectionId || sectionId === currentTocSectionId) return;
    currentTocSectionId = sectionId;

    let activeLink = null;
    tocLinks.forEach((link) => {
      const linkSectionId = (link.getAttribute("href") || "").replace("#", "");
      const isActive = linkSectionId === sectionId;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
        activeLink = link;
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (activeLink && tocContainer) {
      const desiredTop = activeLink.offsetTop - tocContainer.clientHeight * 0.35;
      tocContainer.scrollTo({
        top: Math.max(0, desiredTop),
        behavior: "smooth",
      });
    }
  };

  const pawPalette = {
    "datos-academicos": { soft: "rgba(116, 188, 255, 0.15)", strong: "rgba(116, 188, 255, 0.32)", accent: "#b8dbff" },
    instituciones: { soft: "rgba(212, 142, 86, 0.15)", strong: "rgba(212, 142, 86, 0.32)", accent: "#e5ad7c" },
    introduccion: { soft: "rgba(120, 196, 255, 0.16)", strong: "rgba(120, 196, 255, 0.34)", accent: "#c3e2ff" },
    objetivos: { soft: "rgba(201, 136, 82, 0.16)", strong: "rgba(201, 136, 82, 0.34)", accent: "#dfa475" },
    metodologia: { soft: "rgba(111, 181, 244, 0.16)", strong: "rgba(111, 181, 244, 0.34)", accent: "#b9dcff" },
    arquitectura: { soft: "rgba(207, 139, 84, 0.16)", strong: "rgba(207, 139, 84, 0.34)", accent: "#e1a777" },
    modulos: { soft: "rgba(118, 187, 250, 0.16)", strong: "rgba(118, 187, 250, 0.34)", accent: "#c0dfff" },
    resultados: { soft: "rgba(211, 145, 92, 0.16)", strong: "rgba(211, 145, 92, 0.34)", accent: "#e3ad80" },
    justificacion: { soft: "rgba(123, 193, 255, 0.16)", strong: "rgba(123, 193, 255, 0.34)", accent: "#c7e4ff" },
    diagramas: { soft: "rgba(206, 138, 82, 0.16)", strong: "rgba(206, 138, 82, 0.34)", accent: "#dfa675" },
    "pruebas-calidad": { soft: "rgba(112, 183, 247, 0.16)", strong: "rgba(112, 183, 247, 0.34)", accent: "#b8dcff" },
    "estimacion-costos": { soft: "rgba(210, 144, 89, 0.18)", strong: "rgba(210, 144, 89, 0.36)", accent: "#e3aa7a" },
    conclusiones: { soft: "rgba(122, 193, 255, 0.16)", strong: "rgba(122, 193, 255, 0.34)", accent: "#c5e3ff" },
  };

  const setPawTheme = (sectionId) => {
    const theme = pawPalette[sectionId] ?? pawPalette["datos-academicos"];
    document.body.style.setProperty("--paw-soft", theme.soft);
    document.body.style.setProperty("--paw-strong", theme.strong);
    document.body.style.setProperty("--chapter-accent", theme.accent);
  };

  const contentSections = Array.from(document.querySelectorAll(".section[id]"));

  const setCurrentSection = (sectionId) => {
    contentSections.forEach((section) => {
      section.classList.toggle("is-current", section.id === sectionId);
    });
  };

  const updateActiveSectionTheme = () => {
    if (!contentSections.length) return;

    const probeLine = window.innerHeight * 0.28;
    let bestSection = contentSections[0];

    contentSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= probeLine) {
        bestSection = section;
      }
    });

    if (bestSection?.id) {
      setPawTheme(bestSection.id);
      setCurrentSection(bestSection.id);
      const hasTocMatch = tocLinks.some(
        (link) => (link.getAttribute("href") || "").replace("#", "") === bestSection.id
      );
      if (hasTocMatch) setActiveTocLink(bestSection.id);
    }
  };

  setPawTheme("datos-academicos");
  setCurrentSection("datos-academicos");
  setActiveTocLink("introduccion");
  window.addEventListener("scroll", updateActiveSectionTheme, { passive: true });
  window.addEventListener("resize", updateActiveSectionTheme);
  updateActiveSectionTheme();

  tocLinks.forEach((tocLink) => {
    tocLink.addEventListener("click", () => {
      const sectionId = (tocLink.getAttribute("href") || "").replace("#", "");
      if (sectionId) {
        setPawTheme(sectionId);
        setCurrentSection(sectionId);
        setActiveTocLink(sectionId);
      }
      const linkRect = tocLink.getBoundingClientRect();
      const startX = linkRect.left + linkRect.width * 0.55;
      const startY = linkRect.top + linkRect.height * 0.5;
      const targetX = window.innerWidth * 0.52;
      const targetY = Math.min(window.innerHeight * 0.78, startY + 220);
      const stepsCount = 7;

      for (let i = 0; i < stepsCount; i += 1) {
        const progress = i / (stepsCount - 1);
        const baseX = startX + (targetX - startX) * progress;
        const baseY = startY + (targetY - startY) * progress;
        const jitterX = (i % 2 === 0 ? -1 : 1) * (5 + i * 1.2);
        const jitterY = (i % 2 === 0 ? 2 : -2);
        const step = document.createElement("span");
        step.className = "paw-step";
        step.style.left = `${baseX + jitterX}px`;
        step.style.top = `${baseY + jitterY}px`;
        step.style.setProperty("--dx", `${(i % 2 === 0 ? -8 : 8)}px`);
        step.style.setProperty("--dy", "-18px");
        step.style.setProperty("--rot", `${(i % 2 === 0 ? -14 : 14)}deg`);
        step.style.animationDelay = `${i * 70}ms`;
        pawTrail.appendChild(step);
        window.setTimeout(() => step.remove(), 1200 + i * 80);
      }
    });
  });
}
