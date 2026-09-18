document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const header = document.getElementById("siteHeader");
  const burger = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  const pages = [...document.querySelectorAll(".page")];
  const pageLinks = [...document.querySelectorAll("[data-page-link]")];
  const validPages = new Set(pages.map(page => page.dataset.page));

  if (!header || !burger || !mobileNav || !pages.length) return;

  /* HEADER */
  const updateHeader = () => {
    header.classList.toggle("scrolled", window.scrollY > 30);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* MENU MOBILE */
  const setMenu = (open) => {
    burger.classList.toggle("open", open);
    mobileNav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", open);
  };

  burger.addEventListener("click", () => {
    setMenu(!burger.classList.contains("open"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && burger.classList.contains("open")) {
      setMenu(false);
      burger.focus();
    }
  });

  /* NAVEGAÇÃO */
  const normalizePage = (name) => {
    const cleanName = String(name || "").replace(/^#/, "").trim().toLowerCase();
    return validPages.has(cleanName) ? cleanName : "home";
  };

  const renderPage = (pageName, { scroll = true } = {}) => {
    const currentPage = normalizePage(pageName);

    pages.forEach((page) => {
      const active = page.dataset.page === currentPage;
      page.classList.toggle("is-active", active);
      page.setAttribute("aria-hidden", String(!active));
    });

    pageLinks.forEach((link) => {
      if (!link.dataset.pageLink) return;
      const active = normalizePage(link.dataset.pageLink) === currentPage;
      link.classList.toggle("active", active);
      if (link.closest(".primary-nav")) {
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
    });

    setMenu(false);

    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigate = (pageName, { replace = false } = {}) => {
    const currentPage = normalizePage(location.hash);
    const nextPage = normalizePage(pageName);

    if (currentPage === nextPage && location.hash === `#${nextPage}`) {
      renderPage(nextPage);
      return;
    }

    const method = replace ? "replaceState" : "pushState";
    history[method](null, "", `#${nextPage}`);
    renderPage(nextPage);
  };

  pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const pageName = link.dataset.pageLink;
      if (!pageName) return;
      event.preventDefault();
      navigate(pageName);
    });
  });

  /* VOLTAR / AVANÇAR */
  const syncFromHash = () => {
    renderPage(location.hash || "home", { scroll: true });
  };
  window.addEventListener("popstate", syncFromHash);
  window.addEventListener("hashchange", syncFromHash);

  /* PRIMEIRO CARREGAMENTO */
  renderPage(location.hash || "home", { scroll: false });

  /* ANIMAÇÕES */
  const reveals = [...document.querySelectorAll(".reveal")];

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

    reveals.forEach((element) => revealObserver.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("is-visible"));
  }
});
