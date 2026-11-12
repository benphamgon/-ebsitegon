/* GỌN Fitness & Yoga — interactions */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVG = "http://www.w3.org/2000/svg";

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
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a, button", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Hero dial ticks ---------- */
  // Points along the quadratic curve used in the SVG: P0(-200,y0) C(720,cy) P2(1640,y0)
  const quad = (t, a, b, c) => (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c;
  const ticks = $("#dialTicks");
  if (ticks) {
    const N = 64;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      // point on the outer ring; ticks fan outward from a vanishing point above
      const x1 = quad(t, -200, 720, 1640), y1 = quad(t, 520, 60, 520);
      const dx = x1 - 720, dy = y1 + 900, len = Math.hypot(dx, dy);
      const major = i % 8 === 0;
      const L = major ? 150 : 90;
      const line = document.createElementNS(SVG, "line");
      line.setAttribute("x1", x1 + (dx / len) * 14);
      line.setAttribute("y1", y1 + (dy / len) * 14);
      line.setAttribute("x2", x1 + (dx / len) * L);
      line.setAttribute("y2", y1 + (dy / len) * L);
      line.setAttribute("stroke-width", major ? 4 : 3);
      line.setAttribute("opacity", major ? 1 : 0.85);
      ticks.appendChild(line);
    }
    // middle long tick
    const mid = document.createElementNS(SVG, "line");
    mid.setAttribute("x1", 720); mid.setAttribute("y1", 255);
    mid.setAttribute("x2", 720); mid.setAttribute("y2", 520);
    mid.setAttribute("stroke-width", 4);
    ticks.appendChild(mid);
    // gentle rotation of the tick ring
    if (!reduceMotion) {
      let a = 0;
      const spin = () => {
        a += 0.015;
        ticks.setAttribute("transform", `translate(${Math.sin(a) * 30} 0)`);
        requestAnimationFrame(spin);
      };
      requestAnimationFrame(spin);
    }
  }

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

  /* ---------- Hero words cycling ---------- */
  const words = $$(".dial__words span");
  if (words.length) {
    let idx = 0;
    setInterval(() => {
      const prev = words[idx];
      prev.classList.remove("is-active");
      prev.classList.add("is-leaving");
      setTimeout(() => prev.classList.remove("is-leaving"), 900);
      idx = (idx + 1) % words.length;
      words[idx].classList.add("is-active");
    }, 2800);
  }

  /* ---------- Split text (manifesto title) ---------- */
  $$(".split-reveal").forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((word) => {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.append(" "); return; }
            const w = document.createElement("span");
            w.style.whiteSpace = "nowrap";
            [...word].forEach((c) => {
              const s = document.createElement("span");
              s.className = "ch";
              s.textContent = c;
              s.style.transitionDelay = `${i++ * 22}ms`;
              w.append(s);
            });
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  /* ---------- Word-by-word scroll highlight ---------- */
  const wordEls = [];
  $$(".word-reveal").forEach((el) => {
    el.innerHTML = el.textContent
      .trim()
      .split(/\s+/)
      .map((w) => `<span class="w">${w}</span>`)
      .join(" ");
    wordEls.push(el);
  });
  const updateWords = () => {
    wordEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      const vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const ws = el.children;
      const on = Math.round(p * ws.length);
      for (let i = 0; i < ws.length; i++) ws[i].classList.toggle("on", i < on);
    });
  };
  addEventListener("scroll", updateWords, { passive: true });
  updateWords();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal, .reveal-scale, .split-reveal").forEach((el, i) => {
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
    const f = $("input, video", m);
    if (f) setTimeout(() => f.focus(), 50);
    if (id === "videoModal") $("video", m).play().catch(() => {});
  };
  const closeModal = (m) => {
    m.hidden = true;
    document.body.style.overflow = "";
    const v = $("video", m);
    if (v) v.pause();
    if (lastFocus) lastFocus.focus();
  };
  $$("[data-open-modal]").forEach((b) => b.addEventListener("click", () => openModal("contactModal")));
  $$("[data-play-video]").forEach((b) => b.addEventListener("click", () => openModal("videoModal")));
  $$("[data-close-modal]").forEach((b) => b.addEventListener("click", () => closeModal(b.closest(".modal"))));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") $$(".modal:not([hidden])").forEach(closeModal);
  });

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
