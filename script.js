document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const preloader = document.getElementById("preloader");
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const navItems = [...document.querySelectorAll(".nav-link")];
  const backToTop = document.getElementById("backToTop");

  body.style.overflow = "hidden";

  window.addEventListener("load", () => {
    window.setTimeout(() => {
      preloader?.classList.add("hidden");
      body.style.overflow = "";
    }, 650);
  });

  const closeMenu = () => {
    hamburger?.classList.remove("active");
    navLinks?.classList.remove("open");
    hamburger?.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  };

  hamburger?.addEventListener("click", () => {
    const isOpen = navLinks?.classList.toggle("open");
    hamburger.classList.toggle("active", Boolean(isOpen));
    hamburger.setAttribute("aria-expanded", String(Boolean(isOpen)));
    body.classList.toggle("menu-open", Boolean(isOpen));
  });

  navItems.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  let sectionPositions = [];
  let ticking = false;
  let activeSectionId = "";

  const cacheSectionPositions = () => {
    sectionPositions = sections.map((section) => ({
      id: section.id,
      top: section.offsetTop
    }));
  };

  const updateChrome = () => {
    const scrollY = window.scrollY;

    navbar?.classList.toggle("scrolled", scrollY > 36);
    backToTop?.classList.toggle("visible", scrollY > 520);

    let current = null;
    sectionPositions.forEach((section) => {
      if (scrollY >= section.top - 140) current = section;
    });

    if (!current || current.id === activeSectionId) return;
    activeSectionId = current.id;

    navItems.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeSectionId}`);
    });
  };

  cacheSectionPositions();
  updateChrome();
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateChrome();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener("resize", () => {
    cacheSectionPositions();
    updateChrome();
  }, { passive: true });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });

  const premiumSections = [
    document.getElementById("programs"),
    document.getElementById("placements"),
    document.getElementById("campus-life"),
    document.getElementById("facilities"),
    document.getElementById("faculty"),
    document.getElementById("achievements"),
    document.querySelector(".testimonials-section"),
    document.getElementById("contact")
  ].filter(Boolean);

  premiumSections.forEach((section) => section.classList.add("premium-section"));

  const premiumCards = [
    ...document.querySelectorAll("#programs .program-card, #faculty .faculty-card, .testimonials-section .testimonial-card")
  ];

  premiumCards.forEach((card) => {
    card.classList.add("premium-tilt");
  });

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.65 }
  );

  document.querySelectorAll(".stat-num").forEach((number) => {
    counterObserver.observe(number);
  });

  function animateCounter(element) {
    const target = Number(element.dataset.target || 0);
    const duration = 1700;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased).toLocaleString("en-IN");
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  const tabButtons = [...document.querySelectorAll(".tab-btn")];
  const tabPanels = [...document.querySelectorAll(".tab-content")];

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;

      tabButtons.forEach((item) => {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-selected", String(item === button));
      });

      tabPanels.forEach((panel) => {
        const isActive = panel.id === `tab-${tab}`;
        panel.classList.toggle("active", isActive);
        if (isActive) {
          panel.querySelectorAll(".reveal").forEach((item, index) => {
            item.classList.remove("visible");
            window.setTimeout(() => item.classList.add("visible"), index * 70);
          });
        }
      });
    });
  });

  const track = document.getElementById("testimonialTrack");
  const carousel = document.getElementById("testimonialCarousel");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsWrap = document.getElementById("carouselDots");
  const slides = track ? [...track.children] : [];
  let currentSlide = 0;
  let autoplayId;

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
    dot.addEventListener("click", () => {
      goToSlide(index);
      restartAutoplay();
    });
    dotsWrap?.appendChild(dot);
  });

  const dots = dotsWrap ? [...dotsWrap.children] : [];

  const goToSlide = (index) => {
    if (!track || slides.length === 0) return;
    currentSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === currentSlide));
  };

  const startAutoplay = () => {
    if (slides.length < 2) return;
    autoplayId = window.setInterval(() => goToSlide(currentSlide + 1), 5200);
  };

  const restartAutoplay = () => {
    window.clearInterval(autoplayId);
    startAutoplay();
  };

  prevBtn?.addEventListener("click", () => {
    goToSlide(currentSlide - 1);
    restartAutoplay();
  });

  nextBtn?.addEventListener("click", () => {
    goToSlide(currentSlide + 1);
    restartAutoplay();
  });

  carousel?.addEventListener("mouseenter", () => window.clearInterval(autoplayId));
  carousel?.addEventListener("mouseleave", startAutoplay);

  let touchStartX = 0;
  carousel?.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  carousel?.addEventListener("touchend", (event) => {
    const delta = touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 45) {
      goToSlide(delta > 0 ? currentSlide + 1 : currentSlide - 1);
      restartAutoplay();
    }
  }, { passive: true });

  goToSlide(0);
  startAutoplay();

  const form = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");
  const resetFormBtn = document.getElementById("resetFormBtn");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const requiredFields = [
      document.getElementById("firstName"),
      document.getElementById("lastName"),
      document.getElementById("email")
    ].filter(Boolean);

    const valid = requiredFields.every((field) => {
      const isEmail = field.type === "email";
      const valueIsValid = isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim()) : field.value.trim().length > 1;
      field.classList.toggle("is-invalid", !valueIsValid);
      return valueIsValid;
    });

    if (!valid) return;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    window.setTimeout(() => {
      form.hidden = true;
      formSuccess.hidden = false;
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send Enquiry <span aria-hidden="true">&rarr;</span>';
    }, 700);
  });

  form?.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => field.classList.remove("is-invalid"));
  });

  resetFormBtn?.addEventListener("click", () => {
    form?.reset();
    if (form) form.hidden = false;
    if (formSuccess) formSuccess.hidden = true;
  });

  document.querySelector(".marquee-track")?.addEventListener("mouseenter", (event) => {
    event.currentTarget.style.animationPlayState = "paused";
  });

  document.querySelector(".marquee-track")?.addEventListener("mouseleave", (event) => {
    event.currentTarget.style.animationPlayState = "running";
  });

  const marqueeStrip = document.querySelector(".marquee-strip");
  const marqueeTrack = document.querySelector(".marquee-track");

  if (marqueeStrip && marqueeTrack) {
    const marqueeObserver = new IntersectionObserver(
      ([entry]) => {
        marqueeTrack.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
      },
      { threshold: 0.01 }
    );

    marqueeObserver.observe(marqueeStrip);
  }
});

