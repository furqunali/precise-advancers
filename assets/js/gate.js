/* Access-code screen (GitHub copy only). */
(function () {
  "use strict";
  var KEY = "pa-unlocked", HASH = "0de6abef2d546bf997871012310dcd71561650ac2d95656c2f62d693a88cfe2e", SCHOOL = "A Project Of Dehli Goverment Boy's Secondary School";
  var root = document.documentElement;
  function ok() { try { return sessionStorage.getItem(KEY) === HASH; } catch (e) { return false; } }
  if (ok()) return;
  root.classList.add("locked");
  var css = document.createElement("style");
  css.textContent =
    "html.locked body > *:not(.gate){display:none!important}" +
    ".gate{position:fixed;inset:0;z-index:999;display:grid;place-items:center;padding:16px;" +
    "background:radial-gradient(900px 600px at 50% 0%,rgba(80,120,160,.35),transparent 70%)," +
    "repeating-linear-gradient(135deg,rgba(0,0,0,.3) 0 2px,transparent 2px 9px),linear-gradient(180deg,#20303c,#0b131b);" +
    "color:#f6f5f1;font-family:'Open Sans','Segoe UI',sans-serif}" +
    ".gate-box{width:min(440px,100%);text-align:center;padding:32px 28px;border-radius:22px;" +
    "background:linear-gradient(140deg,rgba(255,255,255,.2),rgba(255,255,255,.06) 42%,rgba(255,255,255,.12));" +
    "border:1px solid rgba(255,255,255,.38);backdrop-filter:blur(16px);" +
    "box-shadow:0 1px 0 rgba(255,255,255,.55) inset,0 40px 80px -30px rgba(0,0,0,.8)}" +
    ".gate-box img{width:96px;height:96px;border-radius:22px;margin:0 auto 18px;box-shadow:0 18px 30px -14px #000}" +
    ".gate-school{font:800 1.25rem/1.3 'Exo 2','Segoe UI',sans-serif;margin:0 0 6px;color:#fff}" +
    ".gate-sub{margin:0 0 22px;color:#b9c6d3;font-size:.9rem}" +
    ".gate-box label{display:block;text-align:left;font:700 .8rem 'Exo 2',sans-serif;letter-spacing:.12em;color:#cfd9e3;margin-bottom:6px}" +
    ".gate-box input{width:100%;box-sizing:border-box;font:600 1.1rem 'Open Sans',sans-serif;letter-spacing:.2em;text-align:center;" +
    "padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.4);background:rgba(0,0,0,.3);color:#fff}" +
    ".gate-box button{margin-top:14px;width:100%;font:700 1rem 'Exo 2',sans-serif;color:#fff;padding:12px;border-radius:999px;cursor:pointer;" +
    "border:1px solid rgba(255,255,255,.35);background:linear-gradient(180deg,#ff6274,#e8364a 50%,#b8202f);" +
    "box-shadow:0 1px 0 rgba(255,255,255,.45) inset,0 12px 22px -10px #000}" +
    ".gate-err{min-height:1.3em;margin:10px 0 0;color:#ff8a97;font-size:.9rem}";
  document.head.appendChild(css);

  function sha256(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }
  function build() {
    var base = (document.querySelector('link[rel="icon"]') || {}).href || "";
    var logo = base.replace(/favicon\.png$/, "logo-badge.webp");
    var g = document.createElement("div");
    g.className = "gate"; g.setAttribute("role", "dialog"); g.setAttribute("aria-modal", "true"); g.setAttribute("aria-labelledby", "gate-school");
    g.innerHTML =
      '<form class="gate-box">' +
      (logo ? '<img src="' + logo + '" alt="Precise Advancers logo" width="96" height="96">' : "") +
      '<p class="gate-school" id="gate-school"></p>' +
      '<p class="gate-sub">Precise Advancers website · enter the access code to continue</p>' +
      '<label for="gate-code">ACCESS CODE</label>' +
      '<input id="gate-code" type="password" autocomplete="off" autocapitalize="characters" spellcheck="false" required>' +
      '<button type="submit">Enter</button><p class="gate-err" role="alert"></p></form>';
    g.querySelector(".gate-school").textContent = SCHOOL;
    document.body.appendChild(g);
    var form = g.querySelector("form"), input = g.querySelector("input"), err = g.querySelector(".gate-err");
    input.focus();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sha256(input.value.trim().toUpperCase()).then(function (h) {
        if (h === HASH) {
          try { sessionStorage.setItem(KEY, HASH); } catch (x) {}
          root.classList.remove("locked"); g.remove();
        } else { err.textContent = "Wrong code — please try again."; input.select(); }
      });
    });
  }
  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
})();
