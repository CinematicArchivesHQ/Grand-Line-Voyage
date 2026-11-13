/* Grand Line Voyage — tap a wanted poster to hold it up to the light.
   Full-screen viewer: the poster tilts with the phone (gyroscope), or follows a finger / mouse,
   and a glossy sheen slides across it as it moves. */
(function () {
  "use strict";
  const MAX = 10;            // max tilt in degrees
  let box, stage, card, glare, raf = 0, active = false;
  let tx = 0, ty = 0, cx = 0, cy = 0;   // target / current tilt (x = rotateY, y = rotateX)
  let base = null, usingGyro = false, lastFocus = null;

  const reduced = () => {
    const S = window.GLL && GLL.S && GLL.S();
    return (S && S.settings && S.settings.reduceMotion) || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  };
  const clamp = (v) => Math.max(-MAX, Math.min(MAX, v));

  function build() {
    box = document.createElement("div");
    box.id = "tiltView";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Wanted poster");
    box.innerHTML = '<button class="tv-close" type="button" aria-label="Close">✕</button>' +
      '<div class="tv-stage"><div class="tv-card"><div class="tv-glare"></div></div></div>' +
      '<p class="tv-hint"></p>';
    document.body.appendChild(box);
    stage = box.querySelector(".tv-stage");
    card = box.querySelector(".tv-card");
    glare = box.querySelector(".tv-glare");
    box.querySelector(".tv-close").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box || e.target === stage) close(); });
    // finger / mouse fallback
    const point = (x, y) => {
      if (usingGyro) return;
      const r = card.getBoundingClientRect();
      tx = clamp(((x - (r.left + r.width / 2)) / (r.width / 2)) * MAX);
      ty = clamp(-((y - (r.top + r.height / 2)) / (r.height / 2)) * MAX);
    };
    box.addEventListener("pointermove", (e) => point(e.clientX, e.clientY));
    box.addEventListener("touchmove", (e) => { if (e.touches[0]) point(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    box.addEventListener("pointerleave", () => { if (!usingGyro) { tx = 0; ty = 0; } });
    box.addEventListener("touchend", () => { if (!usingGyro) { tx = 0; ty = 0; } });
  }

  function onOrient(e) {
    if (e.beta == null || e.gamma == null) return;
    if (!base) base = { b: e.beta, g: e.gamma };       // whatever angle you're holding it at = flat
    usingGyro = true;
    tx = clamp((e.gamma - base.g) * 0.9);
    ty = clamp(-(e.beta - base.b) * 0.9);
  }

  function loop() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    card.style.transform = "rotateY(" + cx.toFixed(2) + "deg) rotateX(" + cy.toFixed(2) + "deg)";
    // sheen position + strength follow the tilt
    const px = 50 + cx * 3.2, py = 50 - cy * 3.2, k = Math.min(1, (Math.abs(cx) + Math.abs(cy)) / MAX);
    glare.style.backgroundPosition = px + "% " + py + "%";
    glare.style.opacity = (0.35 + k * 0.65).toFixed(2);
    card.style.setProperty("--sx", (-cx * 1.4).toFixed(1) + "px");
    card.style.setProperty("--sy", (cy * 1.4 + 26).toFixed(1) + "px");
    raf = active ? requestAnimationFrame(loop) : 0;
  }

  function startMotion() {
    const hint = box.querySelector(".tv-hint");
    const coarse = window.matchMedia && matchMedia("(pointer: coarse)").matches;
    hint.textContent = coarse ? "Tilt your phone" : "Move your mouse over the poster";
    if (!coarse || !("DeviceOrientationEvent" in window)) return;
    const listen = () => window.addEventListener("deviceorientation", onOrient);
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      // iOS asks once; must be called straight from the tap
      DeviceOrientationEvent.requestPermission().then((r) => {
        if (r === "granted") listen(); else hint.textContent = "Drag your finger across the poster";
      }).catch(() => { hint.textContent = "Drag your finger across the poster"; });
    } else listen();
  }

  function open(src) {
    if (!box) build();
    lastFocus = document.activeElement;
    card.querySelectorAll(".tv-content").forEach((n) => n.remove());
    const clone = src.cloneNode(true);
    clone.removeAttribute("loading");
    clone.classList.add("tv-content");
    clone.removeAttribute("id");
    card.insertBefore(clone, glare);
    card.classList.toggle("is-img", src.tagName === "IMG");
    tx = ty = cx = cy = 0; base = null; usingGyro = false;
    box.classList.add("open");
    document.documentElement.classList.add("tv-lock");
    const still = reduced();
    box.classList.toggle("still", !!still);
    if (!still) {
      startMotion();
      active = true;
      if (!raf) raf = requestAnimationFrame(loop);
      card.classList.remove("sweep"); void card.offsetWidth; card.classList.add("sweep");
    } else box.querySelector(".tv-hint").textContent = "";
    box.querySelector(".tv-close").focus({ preventScroll: true });
  }

  function close() {
    if (!box || !box.classList.contains("open")) return;
    active = false;
    window.removeEventListener("deviceorientation", onOrient);
    box.classList.remove("open");
    document.documentElement.classList.remove("tv-lock");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest(".poster .p-art, .poster .p-pic, .mw-poster");
    if (!t || (box && box.contains(t))) return;
    e.preventDefault();
    open(t);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    const t = e.target;
    if ((e.key === "Enter" || e.key === " ") && t && t.matches && t.matches(".poster .p-art, .poster .p-pic, .mw-poster")) { e.preventDefault(); open(t); }
  });
  // make posters reachable by keyboard
  const mark = () => document.querySelectorAll(".poster .p-art:not([tabindex]), .poster .p-pic:not([tabindex]), .mw-poster:not([tabindex])").forEach((n) => {
    n.tabIndex = 0; n.setAttribute("role", "button"); n.setAttribute("aria-label", (n.alt || "Your wanted poster") + " — view up close");
  });
  new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("hashchange", close);
})();
