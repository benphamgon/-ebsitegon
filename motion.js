/* GỌN — hiệu ứng chuyển động theo cuộn (GSAP ScrollTrigger + Lenis) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const SVG = "http://www.w3.org/2000/svg";
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => innerWidth < 700;

  /* ---------- Tách chữ ---------- */
  // Từng ký tự (tiêu đề hero)
  const splitChars = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((word) => {
            if (!word) return;
            if (/^\s+$/.test(word)) return frag.append(" ");
            const w = document.createElement("span");
            w.style.whiteSpace = "nowrap";
            w.style.display = "inline-block";
            [...word].forEach((c) => {
              const s = document.createElement("span");
              s.className = "ch";
              s.textContent = c;
              w.append(s);
            });
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return $$(".ch", el);
  };
  // Từng từ (đoạn văn sáng dần)
  const splitWords = (el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
    return $$(".w", el);
  };
  // Từng từ có mặt nạ (tiêu đề trượt lên)
  const splitMasked = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((word) => {
            if (!word) return;
            if (/^\s+$/.test(word)) return frag.append(" ");
            const m = document.createElement("span");
            m.className = "ln";
            m.innerHTML = `<span></span>`;
            m.firstChild.textContent = word;
            frag.append(m);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    return $$(".ln > span", el);
  };

  const brandWords = splitWords($(".brand__text"));

  /* ---------- Không có hiệu ứng (giảm chuyển động / thiếu thư viện) ---------- */
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    root.classList.add("no-motion");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Cuộn mượt ---------- */
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : id.length > 1 && document.querySelector(id);
      if (target === null || target === false) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: target === 0 ? 0 : -70, duration: 1.4 });
    });
  }

  /* =========================================================
     1. HERO: chuỗi ảnh lat pulldown + vòng chia độ xoay theo cuộn
     ========================================================= */
  const canvas = $(".hero__canvas");
  const ctx = canvas.getContext("2d");
  const FRAMES = 116;
  const dir = isMobile() ? "assets/frames-m/" : "assets/frames/";
  const imgs = [];
  let curFrame = -1;
  const sizeCanvas = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    const f = curFrame;
    curFrame = -1;
    drawFrame(Math.max(f, 0));
  };
  const drawFrame = (i) => {
    i = Math.max(0, Math.min(FRAMES - 1, Math.round(i)));
    // dùng khung gần nhất đã tải xong
    let k = i;
    while (k > 0 && !(imgs[k] && imgs[k].complete && imgs[k].naturalWidth)) k--;
    const img = imgs[k];
    if (!img || !img.complete || !img.naturalWidth || k === curFrame) return;
    curFrame = k;
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };
  for (let i = 0; i < FRAMES; i++) {
    const im = new Image();
    im.decoding = "async";
    im.src = `${dir}f${String(i + 1).padStart(3, "0")}.webp`;
    if (i === 0) im.onload = () => { sizeCanvas(); $(".hero__poster").style.visibility = "hidden"; };
    imgs.push(im);
  }
  addEventListener("resize", sizeCanvas);

  // Vòng chia độ (vẽ theo hình tròn, ép dẹt để có phối cảnh)
  const ticks = $("#dialTicks");
  for (let deg = 0; deg < 360; deg += 1.5) {
    const major = Math.round(deg / 1.5) % 6 === 0;
    const a = (deg * Math.PI) / 180;
    const r1 = 1318, r2 = 1318 - (major ? 520 : 300);
    const l = document.createElementNS(SVG, "line");
    l.setAttribute("x1", Math.sin(a) * r1);
    l.setAttribute("y1", -Math.cos(a) * r1);
    l.setAttribute("x2", Math.sin(a) * r2);
    l.setAttribute("y2", -Math.cos(a) * r2);
    l.setAttribute("stroke", "#fff");
    l.setAttribute("stroke-width", major ? 4 : 3);
    l.setAttribute("vector-effect", "non-scaling-stroke");
    ticks.append(l);
  }
  const WORDS = ["LIVE STRONG", "LIVE LONG", "FIT FOR LIFE"];
  const STEP = 52; // độ giữa các chữ
  const wordsG = $("#dialWords");
  WORDS.forEach((w, k) => {
    const t = document.createElementNS(SVG, "text");
    t.setAttribute("font-size", isMobile() ? 46 : 118);
    if (isMobile()) t.style.letterSpacing = "7px";
    t.setAttribute("text-anchor", "middle");
    const tp = document.createElementNS(SVG, "textPath");
    tp.setAttribute("href", "#dialPath");
    tp.setAttribute("startOffset", `${25 + (k * STEP * 100) / 360}%`);
    tp.textContent = w;
    t.append(tp);
    wordsG.append(t);
  });
  const dialRot = $("#dialRot");
  const dial = { rot: 0 };
  const setDial = () => dialRot.setAttribute("transform", `rotate(${-dial.rot})`);

  const headChars = splitChars($(".hero__headline"));
  gsap.set(".hero__headline", { autoAlpha: 1 });
  gsap.set(headChars, { opacity: 0, yPercent: 120, rotateX: -60 });

  const frame = { f: 0 };
  const heroTl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: () => "+=" + innerHeight * (isMobile() ? 2.2 : 2.8),
      pin: ".hero__pin",
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  heroTl
    .to(frame, { f: FRAMES - 1, duration: 0.72, onUpdate: () => drawFrame(frame.f) }, 0)
    .to(dial, { rot: STEP * (WORDS.length - 1), duration: 0.62, onUpdate: setDial, ease: "power1.inOut" }, 0.04)
    .to(".hero__scroll", { autoAlpha: 0, duration: 0.08 }, 0)
    .to(".hero__dark", { opacity: 1, duration: 0.18 }, 0.66)
    .to(".dial", { opacity: 0, yPercent: 12, duration: 0.16 }, 0.68)
    .to(headChars, { opacity: 1, yPercent: 0, rotateX: 0, duration: 0.16, stagger: { amount: 0.12 }, ease: "power2.out" }, 0.76)
    .to({}, { duration: 0.06 });

  /* =========================================================
     2. BRAND: chữ O → logo GỌN → ảnh bay vào → video mở ra
     ========================================================= */
  const logo = $(".brand__logo");
  const vid = $(".brand__video video");
  const soundBtn = $(".tour__sound");
  const vw = () => innerWidth, vh = () => innerHeight;
  const cardBox = () => {
    const w = isMobile() ? vw() * 0.92 : Math.min(vw() * 0.72, 1120);
    const h = (w * 9) / 16;
    return { x: (vw() - w) / 2, y: Math.max((vh() - h) / 2, 70) };
  };
  const setCardVars = () => {
    const c = cardBox();
    root.style.setProperty("--card-x", c.x + "px");
    root.style.setProperty("--card-y", c.y + "px");
  };
  setCardVars();
  addEventListener("resize", setCardVars);

  // vị trí bắt đầu của ảnh collage: đẩy ra xa khỏi tâm
  const pinEl = $(".brand__pin");
  const collage = $$(".cl").map((el) => {
    const dx = el.offsetLeft + el.offsetWidth / 2 - pinEl.clientWidth / 2;
    const dy = el.offsetTop + el.offsetHeight / 2 - pinEl.clientHeight / 2;
    return { el, dx, dy };
  });

  // tâm xoay đặt ở giữa chữ O của logo
  gsap.set(logo, { xPercent: -50, yPercent: -31.7, transformOrigin: "50% 31.7%", x: 0, y: 0, scale: isMobile() ? 2.6 : 1.9, color: "#3a3536" });
  gsap.set(".bl-g", { x: -620, opacity: 0 });
  gsap.set(".bl-n", { x: 620, opacity: 0 });
  gsap.set(".bl-sub", { opacity: 0, y: 40 });
  // hàng chấm hiện dần từ chấm giữa (dấu nặng của Ọ) ra hai bên
  const dotEls = $$(".bl-dot").sort((a, b) => Math.abs(a.dataset.x) - Math.abs(b.dataset.x));
  gsap.set(dotEls, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
  gsap.set(brandWords, { opacity: 0.15 });
  collage.forEach(({ el, dx, dy }) => gsap.set(el, { x: dx * 0.9, y: dy * 0.9, scale: 0.6, opacity: 0, rotate: dx > 0 ? 6 : -6 }));

  const brandTl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".brand",
      start: "top top",
      end: () => "+=" + innerHeight * (isMobile() ? 3.2 : 4),
      pin: ".brand__pin",
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (st) => {
        const show = st.progress > 0.58;
        if (show && vid.paused) vid.play().catch(() => {});
        if (!show && !vid.paused) vid.pause();
        soundBtn.classList.toggle("is-on", st.progress > 0.9);
      },
      onLeaveBack: () => vid.pause(),
    },
  });
  const card = () => {
    const c = cardBox();
    const px = (c.x / vw()) * 100, py = (c.y / vh()) * 100;
    return `inset(${py}% ${px}% ${py}% ${px}% round ${isMobile() ? 18 : 32}px)`;
  };
  brandTl
    .to(logo, { scale: isMobile() ? 2.3 : 1.7, color: "#5a5354", duration: 0.24 }, 0)
    .to(brandWords, { opacity: 1, duration: 0.2, stagger: { amount: 0.06 } }, 0.02)
    .to(".brand__text", { opacity: 0, y: -60, duration: 0.08 }, 0.27)
    .to(".bl-g, .bl-n", { x: 0, opacity: 1, duration: 0.16, ease: "power2.out" }, 0.3)
    .to(logo, { scale: 1, color: "#a29b97", duration: 0.16, ease: "power2.inOut" }, 0.3)
    .to(dotEls, { scale: 1, opacity: 1, duration: 0.05, stagger: 0.008, ease: "back.out(3)" }, 0.38)
    .to(".bl-sub", { opacity: 1, y: 0, duration: 0.1 }, 0.42)
    .to(logo, { scale: 0.5, color: "#ffffff", duration: 0.14, ease: "power2.inOut" }, 0.5)
    .to($$(".cl"), { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0, duration: 0.14, stagger: 0.015, ease: "power2.out" }, 0.5)
    .fromTo(".brand__video", { clipPath: "inset(50% 50% 50% 50% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.2, ease: "power2.inOut" }, 0.64)
    .to(".brand__video", { clipPath: card, duration: 0.12, ease: "power2.inOut" }, 0.86)
    .to({}, { duration: 0.04 });

  // dừng video khi cuộn qua hẳn
  new IntersectionObserver(([e]) => { if (!e.isIntersecting) vid.pause(); else if (brandTl.scrollTrigger.progress > 0.58) vid.play().catch(() => {}); }, { threshold: 0.05 }).observe($(".brand__pin"));

  /* =========================================================
     3. Các hiệu ứng khác
     ========================================================= */
  // Tiêu đề trượt lên từng chữ
  $$("[data-split]").forEach((el) => {
    const parts = splitMasked(el);
    gsap.from(parts, {
      yPercent: 110, duration: 1, ease: "power4.out", stagger: 0.05,
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  // Ảnh bộ môn mở rộng dần
  $$("[data-reveal-img]").forEach((el, i) => {
    gsap.fromTo(el, { clipPath: "inset(0% 42% 0% 42%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out",
      scrollTrigger: { trigger: ".classes__grid", start: `top ${92 - i * 4}%`, end: "top 35%", scrub: 0.6 },
    });
    gsap.fromTo($("img", el), { scale: 1.35 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: ".classes__grid", start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // Thẻ dịch vụ xếp chồng: thẻ trước thu nhỏ, tối dần
  const cards = $$(".stack__card");
  cards.forEach((c, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(c, {
      scale: 0.9, filter: "brightness(.45)", ease: "none",
      scrollTrigger: { trigger: next, start: "top bottom", end: "top 25%", scrub: true },
    });
  });

  // Thẻ Platinum xoay vào
  gsap.fromTo(".member__card", { rotate: -28, x: 120, y: 160, opacity: 0 }, {
    rotate: -6, x: 0, y: 0, opacity: 1, ease: "power2.out",
    scrollTrigger: { trigger: ".member", start: "top 85%", end: "center 60%", scrub: 0.8 },
  });

  // Parallax ảnh nền
  $$("[data-parallax]").forEach((el) => {
    gsap.fromTo(el, { yPercent: -10, scale: 1.2 }, {
      yPercent: 10, ease: "none",
      scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // Tiêu đề PT
  gsap.from(".pt__title", { y: 80, opacity: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".pt", start: "top 60%" } });

  /* ---------- Vòng ảnh 3D trước / sau ---------- */
  const ring = $("[data-ring]");
  if (ring) {
    const figs = $$("figure", ring);
    const step = 360 / figs.length;
    let rot = 0, vel = 0, running = false, last = 0;
    // bán kính sao cho các thẻ đứng sát nhau (khoảng cách ≈ 1.15 bề rộng thẻ)
    const R = () => (figs[0].offsetWidth * 1.15) / ((step * Math.PI) / 180);
    const render = () => {
      const r = R();
      figs.forEach((f, i) => {
        let a = ((i * step + rot) % 360 + 540) % 360 - 180;
        if (Math.abs(a) > 78) { f.style.visibility = "hidden"; return; }
        f.style.visibility = "visible";
        const rad = (a * Math.PI) / 180;
        const x = Math.sin(rad) * r;
        const z = -Math.cos(rad) * r + r * 0.82;
        f.style.transform = `translate3d(${x}px,0,${z}px) rotateY(${-a}deg)`;
        f.style.zIndex = Math.round(z + 2000);
      });
    };
    const tick = (t) => {
      if (!running) return;
      const dt = Math.min(t - last, 50); last = t;
      rot -= (0.012 + vel) * dt;
      vel *= 0.92;
      render();
      requestAnimationFrame(tick);
    };
    ScrollTrigger.create({
      trigger: ring, start: "top bottom", end: "bottom top",
      onToggle: (st) => { running = st.isActive; if (running) { last = performance.now(); requestAnimationFrame(tick); } },
      onUpdate: (st) => { vel = Math.max(-0.4, Math.min(0.4, st.getVelocity() / 9000)); },
    });
    render();
    addEventListener("resize", render);
  }

  // Tính lại vị trí sau khi ảnh/font tải xong
  addEventListener("load", () => ScrollTrigger.refresh());
})();
