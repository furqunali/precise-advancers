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

  /* home slider (replaces the 2016 WOWSlider) */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slides picture"));
  var dotsBox = document.querySelector(".dots");
  if (slides.length && dotsBox) {
    var i = 0, timer = null, dots = [];
    slides.forEach(function (_, n) {
      var d = document.createElement("button");
      d.type = "button"; d.setAttribute("aria-label", "Show slide " + (n + 1));
      d.addEventListener("click", function () { go(n); restart(); });
      dotsBox.appendChild(d); dots.push(d);
    });
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("on", k === i); s.setAttribute("aria-hidden", k === i ? "false" : "true"); });
      dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
    }
    function restart() { if (reduce) return; clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 4500); }
    var prev = document.querySelector("[data-prev]"), next = document.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function () { go(i - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(i + 1); restart(); });
    var sl = document.querySelector(".slider");
    if (sl) { sl.addEventListener("mouseenter", function () { clearInterval(timer); }); sl.addEventListener("mouseleave", restart); }
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
      var url = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(EMAIL) +
        "&su=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      var w = window.open(url, "_blank", "noopener");
      msg.textContent = w ? "Gmail opened in a new tab — press Send there." : "Opening Gmail…";
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

  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
