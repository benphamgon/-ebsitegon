/* GỌN Fitness & Yoga — interactions */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Year ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Nav: solid on scroll + mobile menu ---------- */
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-solid", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $(".nav__burger");
  const menu = $(".mobile-menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a, button", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Vạch chia ở form đăng ký ---------- */
  const SVG = "http://www.w3.org/2000/svg";
  const quad = (t, a, b, c) => (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c;
  const sTicks = $("#signupTicks");
  if (sTicks) {
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const x = quad(t, 0, 720, 1440), y = quad(t, 170, 30, 170);
      const l = document.createElementNS(SVG, "line");
      l.setAttribute("x1", x); l.setAttribute("y1", y - 4);
      l.setAttribute("x2", x); l.setAttribute("y2", y - (i % 10 === 0 ? 34 : 18));
      l.setAttribute("stroke-width", 1.5);
      sTicks.appendChild(l);
    }
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => {
    // stagger siblings in grids
    const sibs = el.parentElement ? $$(":scope > .reveal", el.parentElement) : [];
    const k = sibs.indexOf(el);
    if (k > 0) el.style.transitionDelay = `${k * 90}ms`;
    io.observe(el);
  });

  /* ---------- PT slider ---------- */
  const slides = $$(".pt__slide");
  const tabs = $$(".pt__tab");
  const SLIDE_MS = 6000;
  document.documentElement.style.setProperty("--slide-ms", SLIDE_MS + "ms");
  let cur = 0, timer;
  const go = (n) => {
    slides[cur].classList.remove("is-active");
    tabs[cur].classList.remove("is-active");
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add("is-active");
    // restart bar animation
    const bar = $(".pt__bar b", tabs[cur]);
    bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
    tabs[cur].classList.add("is-active");
    clearTimeout(timer);
    timer = setTimeout(() => go(cur + 1), SLIDE_MS);
  };
  tabs.forEach((t, i) =>
    t.addEventListener("click", (e) => {
      if (i === cur && e.target.tagName === "EM") return openModal("contactModal");
      go(i);
    })
  );
  if (slides.length) timer = setTimeout(() => go(1), SLIDE_MS);

  /* ---------- Modals ---------- */
  let lastFocus;
  const openModal = (id) => {
    const m = document.getElementById(id);
    lastFocus = document.activeElement;
    m.hidden = false;
    document.body.style.overflow = "hidden";
    if (window.__lenis) window.__lenis.stop();
    const f = $("input", m);
    if (f) setTimeout(() => f.focus(), 50);
  };
  const closeModal = (m) => {
    m.hidden = true;
    document.body.style.overflow = "";
    if (window.__lenis) window.__lenis.start();
    if (lastFocus) lastFocus.focus();
  };
  $$("[data-open-modal]").forEach((b) => b.addEventListener("click", () => openModal("contactModal")));

  /* ---------- Video giới thiệu: âm thanh (phát/dừng do motion.js điều khiển) ---------- */
  const tourVideo = $(".tour__video");
  if (tourVideo) {
    // Chế độ không hiệu ứng: tự phát khi cuộn tới, dừng khi cuộn qua
    if (document.documentElement.classList.contains("no-motion")) {
      new IntersectionObserver(
        ([e]) => (e.isIntersecting ? tourVideo.play().catch(() => {}) : tourVideo.pause()),
        { threshold: 0.35 }
      ).observe(tourVideo);
    }

    const soundBtn = $(".tour__sound");
    const setSound = (on) => {
      tourVideo.muted = !on;
      soundBtn.setAttribute("aria-pressed", on);
      const label = on ? "Tắt âm thanh" : "Bật âm thanh";
      soundBtn.setAttribute("aria-label", label);
      $("span", soundBtn).textContent = label;
      if (on) tourVideo.play().catch(() => {});
    };
    soundBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setSound(tourVideo.muted);
    });
    // Bấm vào video cũng bật/tắt âm thanh
    tourVideo.addEventListener("click", () => setSound(tourVideo.muted));
  }
  $$("[data-close-modal]").forEach((b) => b.addEventListener("click", () => closeModal(b.closest(".modal"))));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") $$(".modal:not([hidden])").forEach(closeModal);
  });

  /* ---------- Nạp ảnh trước khi cuộn tới ----------
     Safari (iPhone) đôi khi không tải ảnh loading="lazy" nằm trong vùng có hiệu ứng
     (ghim, xoay 3D, mờ dần). Khi một section còn cách ~2 màn hình, chuyển ảnh của nó
     sang tải ngay. */
  const lazyImgs = $$('img[loading="lazy"]');
  if ("IntersectionObserver" in window) {
    const sections = new Map();
    lazyImgs.forEach((img) => {
      const sec = img.closest("section, footer") || img.parentElement;
      if (!sections.has(sec)) sections.set(sec, []);
      sections.get(sec).push(img);
    });
    const pre = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        (sections.get(e.target) || []).forEach((img) => (img.loading = "eager"));
        pre.unobserve(e.target);
      }),
      { rootMargin: "200% 0px 200% 0px" }
    );
    sections.forEach((_, sec) => pre.observe(sec));
  } else {
    lazyImgs.forEach((img) => (img.loading = "eager"));
  }

  /* ---------- Toast ---------- */
  const toast = $(".toast");
  let toastT;
  const showToast = (msg, err) => {
    toast.textContent = msg;
    toast.classList.toggle("is-error", !!err);
    toast.classList.add("is-show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove("is-show"), 4200);
  };

  /* ---------- Forms ---------- */
  const endpoint = (window.GON_CONFIG && window.GON_CONFIG.FORM_ENDPOINT) || "";
  $$("[data-form]").forEach((form) => {
    // Honeypot chống spam: ô ẩn, người thật không thấy để điền.
    const hp = document.createElement("input");
    Object.assign(hp, { type: "text", name: "website", tabIndex: -1, autocomplete: "off" });
    hp.setAttribute("aria-hidden", "true");
    hp.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0";
    form.append(hp);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const btn = $("button[type=submit]", form);
      const data = Object.fromEntries(new FormData(form));
      data.page = location.href;
      btn.disabled = true;
      const label = btn.textContent;
      btn.textContent = "ĐANG GỬI...";
      try {
        if (endpoint) {
          // text/plain = "simple request": không cần preflight CORS (Apps Script không hỗ trợ OPTIONS).
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(data),
          });
          const out = await res.json().catch(() => ({}));
          if (!res.ok || out.ok === false) throw new Error(out.error || res.status);
        } else {
          await new Promise((r) => setTimeout(r, 600));
        }
        form.reset();
        const m = form.closest(".modal");
        if (m) closeModal(m);
        showToast(`Cảm ơn ${data.name || "bạn"}! GỌN sẽ liên hệ với bạn qua Zalo trong thời gian sớm nhất.`);
      } catch (err) {
        showToast("Gửi chưa thành công, vui lòng gọi hotline 0287.1234.777 hoặc thử lại.", true);
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  });
})();
