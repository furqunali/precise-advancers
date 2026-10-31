/* Precise Advancers — site behaviour (no libraries, no build step) */
(function () {
  "use strict";
  var EMAIL = "preciseadvancers@gmail.com";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header shrink on scroll */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* mobile menu */
  var btn = document.querySelector(".menu-btn"), nav = document.querySelector(".nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.focus(); }
    });
  }

  /* home slider: 3D cube that turns up and down, like the 2016 WOWSlider ("cube_over") */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slides picture"));
  var dotsBox = document.querySelector(".dots");
  if (slides.length && dotsBox) {
    var i = 0, timer = null, dots = [], turning = [], flip = 1;
    var box = document.querySelector(".slides");
    slides.forEach(function (_, n) {
      var d = document.createElement("button");
      d.type = "button"; d.setAttribute("aria-label", "Show slide " + (n + 1));
      d.addEventListener("click", function () { if (n !== i) go(n, n > i ? 1 : -1); restart(); });
      dotsBox.appendChild(d); dots.push(d);
    });
    /* dir 1 = cube turns up (next face comes from below), -1 = turns down */
    function cube(from, to, dir) {
      /* a new turn (fast clicks) first stops and tidies the previous one */
      turning.forEach(function (a) { a.cancel(); });
      turning = [];
      slides.forEach(function (s) { s.classList.remove("turning"); s.style.transformOrigin = ""; });
      if (reduce || !from.animate || from === to) return;
      var origin = "50% 50% -" + box.offsetHeight / 2 + "px";
      var t = { duration: 1800, easing: "cubic-bezier(.68,-0.3,.27,1.3)" };
      [from, to].forEach(function (s) { s.style.transformOrigin = origin; s.classList.add("turning"); });
      turning = [
        from.animate([{ transform: "scale(1) rotateX(0deg)" },
                      { transform: "scale(.82) rotateX(" + 45 * dir + "deg)", offset: .5 },
                      { transform: "scale(1) rotateX(" + 90 * dir + "deg)" }], t),
        to.animate([{ transform: "scale(1) rotateX(" + -90 * dir + "deg)" },
                    { transform: "scale(.82) rotateX(" + -45 * dir + "deg)", offset: .5 },
                    { transform: "scale(1) rotateX(0deg)" }], t)
      ];
      turning[1].onfinish = function () {
        turning = [];
        [from, to].forEach(function (s) { s.classList.remove("turning"); s.style.transformOrigin = ""; });
      };
    }
    function go(n, dir) {
      var from = slides[i];
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("on", k === i); s.setAttribute("aria-hidden", k === i ? "false" : "true"); });
      dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
      box.style.cursor = slides[i].hasAttribute("data-href") ? "pointer" : "";
      if (dir) cube(from, slides[i], dir);
    }
    /* a slide with data-href (the game website sample) opens its page when clicked */
    box.addEventListener("click", function () { var h = slides[i].getAttribute("data-href"); if (h) location.href = h; });
    /* plays on its own, non-stop: turns up, then down, then up ... (2 s turn + 2 s still, as in 2016) */
    function restart() { clearInterval(timer); timer = setInterval(function () { go(i + 1, flip); flip = -flip; }, 4000); }
    /* manual control too: arrows + dots; auto-play carries on afterwards */
    var prev = document.querySelector("[data-prev]"), next = document.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function () { go(i - 1, -1); restart(); });
    if (next) next.addEventListener("click", function () { go(i + 1, 1); restart(); });
    go(0); restart();
  }

  /* 3D tilt on crystal cards (pointer devices only) */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (-y * 8).toFixed(2) + "deg) rotateY(" + (x * 10).toFixed(2) + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* reveal on scroll */
  var rev = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add("in"); }); }

  /* contact form: "Send" opens Gmail compose, pre-filled */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements, msg = document.getElementById("form-msg");
      var name = f.name.value.trim(), from = f.email.value.trim(), phone = f.phone.value.trim();
      var subject = f.subject.value.trim() || "Enquiry from website", body = f.message.value.trim();
      if (!name || !body) { msg.textContent = "Please add your name and a message."; return; }
      var text = body + "\n\n— " + name + (from ? "\nEmail: " + from : "") + (phone ? "\nPhone: " + phone : "");
      var compose = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(EMAIL) +
        "&su=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      /* general Google sign-in first (login / create account), then the ready message */
      var url = "https://accounts.google.com/AddSession?service=mail&continue=" + encodeURIComponent(compose);
      var w = window.open(url, "_blank", "noopener");
      msg.textContent = w ? "Gmail opened in a new tab — sign in (or create an account), then press Send." : "Opening Gmail…";
      if (!w) window.location.href = url;
    });
  }

  /* portfolio lightbox */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img"), close = lb.querySelector("button"), last = null;
    document.querySelectorAll(".shot").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault(); last = a;
        lbImg.src = a.getAttribute("href"); lbImg.alt = a.querySelector("img").alt;
        lb.classList.add("open"); close.focus();
      });
    });
    function shut() { lb.classList.remove("open"); lbImg.src = ""; if (last) last.focus(); }
    close.addEventListener("click", shut);
    lb.addEventListener("click", function (e) { if (e.target === lb) shut(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) shut(); });
  }

  /* ---------- sound: background music + loud click sounds ----------
     Everything is played by the browser itself (Web Audio) - no audio files, no copyright, works offline.
     Music auto-plays on every page. If the browser blocks sound until the visitor touches the page
     (Chrome/Edge rule for a first visit), it starts on the first click / tap / key press instead.
     It stops while a video plays and when a button opens another page; it starts again by itself
     after the video and on the page that opens (or when coming back). Music button = on/off (remembered). */
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, musicBus = null, noise = null;
  function pref(v) { try { if (v) localStorage.setItem("pa-music", v); return localStorage.getItem("pa-music"); } catch (e) { return null; } }
  var musicOn = pref() !== "off";

  function audio() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12; comp.ratio.value = 4;
      master = ctx.createGain(); master.gain.value = 1;
      master.connect(comp); comp.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
      noise = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      var d = noise.getChannelData(0);
      for (var n = 0; n < d.length; n++) d[n] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  /* one note: frequency, start time, length, wave, loudness, pitch bend (x), output */
  function tone(f, t, dur, type, vol, bend, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (bend) o.frequency.exponentialRampToValueAtTime(f * bend, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out || master); o.start(t); o.stop(t + dur + 0.05);
  }
  function hiss(t, dur, vol, freq, out) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; f.type = "bandpass"; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(out || master); s.start(t); s.stop(t + dur + 0.02);
  }
  function indexIn(el) { return Array.prototype.indexOf.call(el.parentNode.children, el); }

  /* a different, loud sound for each kind of button */
  var CHIME = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];   /* PD ... PO: six notes going up */
  var SOUNDS = {
    tile: function (t, el) {
      var f = CHIME[indexIn(el)] || 660;
      tone(f, t, 0.9, "triangle", 0.9); tone(f * 1.5, t + 0.07, 0.8, "sine", 0.55); tone(f * 2, t + 0.14, 0.7, "sine", 0.4);
      tone(140, t, 0.12, "sine", 0.9, 0.5);
    },
    nav: function (t, el) {
      var k = indexIn(el);
      tone(440 + k * 110, t, 0.09, "square", 0.45, 1.5); tone(660 + k * 165, t + 0.08, 0.16, "square", 0.4, 1.2);
    },
    btn: function (t) { [392, 523.25, 659.25, 783.99].forEach(function (f, n) { tone(f, t + n * 0.06, 0.35, "sawtooth", 0.32); }); },
    next: function (t) { tone(280, t, 0.32, "sine", 0.9, 3.2); hiss(t, 0.3, 0.5, 2500); },
    prev: function (t) { tone(900, t, 0.32, "sine", 0.9, 0.3); hiss(t, 0.3, 0.5, 1200); },
    dot: function (t, el) { tone(700 + indexIn(el) * 140, t, 0.14, "sine", 0.9, 1.3); },
    social: function (t) { tone(300, t, 0.16, "sine", 0.95, 2.6); tone(600, t + 0.09, 0.14, "sine", 0.7, 2); },
    more: function (t) { tone(784, t, 0.25, "sine", 0.8); tone(1568, t, 0.12, "sine", 0.35); tone(587.33, t + 0.1, 0.3, "sine", 0.8); },
    card: function (t) { tone(220, t, 0.25, "triangle", 0.9, 2); tone(1320, t + 0.05, 0.3, "sine", 0.45); },
    music: function (t) { tone(523.25, t, 0.15, "triangle", 0.7); tone(musicOn ? 783.99 : 392, t + 0.1, 0.25, "triangle", 0.7); },
    click: function (t) { tone(1000, t, 0.05, "square", 0.5, 0.6); hiss(t, 0.05, 0.6, 3000); }
  };
  function kindOf(el) {
    if (el.classList.contains("tile")) return "tile";
    if (el.classList.contains("music-btn")) return "music";
    if (el.matches("[data-next]")) return "next";
    if (el.matches("[data-prev]")) return "prev";
    if (el.closest(".dots")) return "dot";
    if (el.closest(".nav")) return "nav";
    if (el.closest(".social")) return "social";
    if (el.closest(".next")) return "more";
    if (el.classList.contains("card") || el.classList.contains("shot")) return "card";
    if (el.classList.contains("btn")) return "btn";
    return "click";
  }
  function clickSound(el) {
    if (!audio()) return;
    SOUNDS[kindOf(el)](ctx.currentTime + 0.01, el);
  }

  /* background music: calm, upbeat loop (C - Am - F - G), made note by note */
  var CHORDS = [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]];
  var BASS = [65.41, 55, 87.31, 98], ARP = [0, 1, 2, 1, 2, 1, 0, 1];
  var STEP = 60 / 100 / 2, step = 0, nextT = 0, loop = null;      /* 100 beats a minute, 8th notes */
  function pad(f, t, dur) {
    var flt = ctx.createBiquadFilter(), g = ctx.createGain();
    flt.type = "lowpass"; flt.frequency.value = 1100;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.07, t + 0.5); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    flt.connect(g); g.connect(musicBus);
    [-6, 6].forEach(function (cents) {
      var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = cents;
      o.connect(flt); o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function musicTick() {
    while (nextT < ctx.currentTime + 0.3) {
      var bar = Math.floor(step / 8) % 4, s = step % 8, ch = CHORDS[bar];
      if (s === 0) ch.forEach(function (f) { pad(f, nextT, STEP * 8); });
      if (s === 0 || s === 4) { tone(BASS[bar], nextT, STEP * 3.5, "triangle", 0.5, 0, musicBus); tone(110, nextT, 0.25, "sine", 0.6, 0.4, musicBus); }
      if (s === 2 || s === 6) hiss(nextT, 0.12, 0.25, 1800, musicBus);
      if (s % 2) hiss(nextT, 0.04, 0.12, 7000, musicBus);
      tone(ch[ARP[s]] * 2, nextT, STEP * 1.8, "triangle", 0.16, 0, musicBus);
      step++; nextT += STEP;
    }
  }
  var mBtn = document.createElement("button");
  mBtn.type = "button"; mBtn.className = "music-btn"; mBtn.innerHTML = "&#9835;";
  function showState() {
    var playing = musicOn && !!loop;
    mBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    mBtn.setAttribute("aria-label", playing ? "Music on - click to turn off" : "Music off - click to turn on");
    mBtn.title = mBtn.getAttribute("aria-label");
  }
  var videosPlaying = 0;
  function startMusic() {
    if (!musicOn || loop || videosPlaying || !audio()) return;
    step = 0; nextT = ctx.currentTime + 0.1;
    loop = setInterval(musicTick, 80); musicTick();
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(0.6, ctx.currentTime, 0.6);
    showState();
  }
  function stopMusic() {
    clearInterval(loop); loop = null;
    if (ctx) { musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.15); }
    showState();
  }
  mBtn.addEventListener("click", function () {
    if (musicOn && loop) { musicOn = false; pref("off"); stopMusic(); }
    else { musicOn = true; pref("on"); startMusic(); }
  });
  document.body.appendChild(mBtn); showState();

  /* auto-play: try straight away; if the browser holds the sound back, the first touch releases it */
  var TOUCH = ["pointerdown", "keydown", "touchstart"];
  function firstTouch(e) {
    if (e && e.target.closest && e.target.closest(".music-btn")) return;   /* the music button handles itself */
    TOUCH.forEach(function (ev) { document.removeEventListener(ev, firstTouch, true); });
    startMusic();
  }
  TOUCH.forEach(function (ev) { document.addEventListener(ev, firstTouch, true); });
  if (musicOn && AC) {
    startMusic();
    if (ctx && ctx.state !== "running") {                  /* blocked for now: drop the silent loop, wait for a touch */
      stopMusic();
      ctx.resume().then(function () { if (ctx.state === "running") firstTouch(); });
    }
  }
  /* coming back to the page (Back button / switching tabs) starts the music again */
  window.addEventListener("pageshow", function (e) { if (e.persisted) { stopMusic(); startMusic(); } });
  document.addEventListener("visibilitychange", function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
  /* videos: music stops while one plays, comes back when it pauses or ends */
  document.querySelectorAll("video").forEach(function (v) {
    var on = false;
    v.addEventListener("play", function () { if (!on) { on = true; videosPlaying++; } stopMusic(); });
    function off() { if (on) { on = false; videosPlaying--; } startMusic(); }
    v.addEventListener("pause", off); v.addEventListener("ended", off);
  });

  /* every click on a link or button makes its sound; links to our own pages wait a moment so the sound is heard */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("a, button") : null;
    if (!el) return;
    clickSound(el);
    if (el.tagName !== "A" || e.defaultPrevented || el.target || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    var href = el.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:)/i.test(href)) return;
    e.preventDefault();
    stopMusic();                                            /* music stops; the new page starts it again */
    setTimeout(function () { location.href = el.href; }, 220);
  });

  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
