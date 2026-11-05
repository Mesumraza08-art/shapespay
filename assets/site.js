/* ShapesPay site behaviour. Everything is visible without JS; GSAP only adds motion. */
(function () {
  var d = document, w = window, html = d.documentElement;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = !!(w.gsap && w.ScrollTrigger);
  var store = {
    get: function (k) { try { return w.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { w.sessionStorage.setItem(k, v); } catch (e) {} }
  };
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  if (hasG) {
    gsap.registerPlugin(ScrollTrigger);
    if (w.SplitText) gsap.registerPlugin(SplitText);
  }

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (hasG && w.Lenis && !reduce) {
    try {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } catch (e) { lenis = null; }
  }

  /* ---------- nav ---------- */
  var nav = $('.nav'), lastY = 0;
  if (nav && $('.shero')) nav.classList.add('over-hero');
  w.addEventListener('scroll', function () {
    var y = w.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (nav && !d.body.classList.contains('menu-open')) nav.classList.toggle('hide', y > 260 && y > lastY + 4);
    if (y < lastY - 4 || y < 260) nav && nav.classList.remove('hide');
    lastY = y;
  }, { passive: true });
  var burger = $('.burger'), mnav = $('.mnav');
  if (burger && mnav) burger.addEventListener('click', function () {
    var open = !mnav.classList.contains('open');
    mnav.classList.toggle('open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) open ? lenis.stop() : lenis.start();
    html.style.overflow = open ? 'hidden' : '';
  });

  /* ---------- reveal helpers ---------- */
  function splitReveal(el, opts) {
    opts = opts || {};
    if (!hasG || reduce) return null;
    var targets;
    if (w.SplitText) {
      var st = new SplitText(el, { type: 'lines', linesClass: 'split-line', mask: 'lines', autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, { yPercent: 110, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: opts.delay || 0,
            scrollTrigger: opts.noTrigger ? null : { trigger: el, start: 'top 88%', once: true } });
        } });
      return st;
    }
    targets = el;
    return gsap.from(targets, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', delay: opts.delay || 0,
      scrollTrigger: opts.noTrigger ? null : { trigger: el, start: 'top 88%', once: true } });
  }
  function initReveals(scope) {
    if (!hasG || reduce) return;
    $$('[data-split]', scope).forEach(function (el) { if (!el.closest('[data-hero]')) splitReveal(el); });
    $$('[data-reveal]', scope).forEach(function (el) {
      if (el.closest('[data-hero]')) return;
      gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    $$('[data-stagger]', scope).forEach(function (el) {
      gsap.from(el.children, { y: 40, opacity: 0, duration: .9, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    $$('[data-parallax]', scope).forEach(function (el) {
      var amt = parseFloat(el.getAttribute('data-parallax')) || 10;
      gsap.fromTo(el, { yPercent: -amt / 2, scale: 1.08 }, { yPercent: amt / 2, scale: 1.08, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-count]', scope).forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-count')), dec = (el.getAttribute('data-count').split('.')[1] || '').length;
      var suf = el.getAttribute('data-suffix') || '', o = { v: 0 };
      gsap.to(o, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: function () { el.textContent = (dec ? o.v.toFixed(dec) : Math.round(o.v).toLocaleString('en-CA')) + suf; } });
    });
    $$('.manifesto [data-lines] .split-line > span').forEach(function (s, i) {
      gsap.from(s, { yPercent: 105, ease: 'none', scrollTrigger: { trigger: s.closest('.manifesto'), start: 'top ' + (80 - i * 12) + '%', end: 'top ' + (40 - i * 12) + '%', scrub: .6 } });
    });
  }

  /* ---------- hero entrance ---------- */
  function heroIn(delay) {
    var sh = $('[data-shero]');
    if (sh && hasG && !reduce) {
      gsap.from($$('.sw', sh), { yPercent: 70, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .07, delay: delay + .05 });
      gsap.from($('.shero-dev', sh), { y: 120, opacity: 0, scale: .94, duration: 1.5, ease: 'expo.out', delay: delay + .35 });
      gsap.from($('.shero-foot', sh).children, { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1, delay: delay + .8 });
      gsap.to($('.shero-dev img', sh), { y: -10, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: delay + 1.8 });
      $$('.shero-bg i', sh).forEach(function (o, i) { gsap.to(o, { x: [60, -50, 40][i], y: [-40, 30, -20][i], duration: 10 + i * 3, ease: 'sine.inOut', yoyo: true, repeat: -1 }); });
      gsap.to($('.shero-in', sh), { yPercent: -10, opacity: .35, ease: 'none', scrollTrigger: { trigger: sh, start: 'top top', end: 'bottom top', scrub: true } });
    }
    var hero = $('[data-hero]');
    if (!hero || !hasG || reduce) return;
    var bg = $('.hero-bg', hero);
    if (bg) gsap.fromTo(bg, { scale: 1.12 }, { scale: 1, duration: 2.4, ease: 'expo.out', delay: delay });
    $$('[data-split]', hero).forEach(function (el, i) { splitReveal(el, { noTrigger: true, delay: delay + .15 + i * .1 }); });
    gsap.from($$('[data-reveal]', hero), { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1, delay: delay + .45 });
    if (bg) gsap.to(bg, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    $$('.hero-orb', hero).forEach(function (o, i) {
      gsap.to(o, { x: i ? -60 : 70, y: i ? 40 : -50, duration: 9 + i * 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
  }

  /* ---------- GSAP logo intro (home only) ---------- */
  function runIntro(done) {
    var intro = $('.lintro');
    if (!intro) return done(0);
    var internal = false; try { internal = !!d.referrer && new URL(d.referrer).origin === location.origin; } catch (e) {}
    if (internal || reduce || !hasG) { intro.remove(); return done(0); }
    intro.classList.add('on');
    html.classList.add('intro-lock'); if (lenis) lenis.stop();
    var mark = $('.lmark', intro), bars = $$('.lb', intro), gleam = $$('.lg', intro), letters = $$('.lw', intro), ring = $('.lring', intro), bg = $$('.lintro-bg i', intro);
    var finished = false, tl;
    function finish(fast) {
      if (finished) return; finished = true;
      if (tl) tl.kill();
      html.classList.remove('intro-lock'); if (lenis) lenis.start();
      var navLogo = $('.nav-logo img'), out = gsap.timeline({ onComplete: function () { intro.remove(); ScrollTrigger.refresh(); } });
      if (!fast && navLogo) {
        // fly the logo into the nav
        var r1 = mark.getBoundingClientRect(), r2 = navLogo.getBoundingClientRect();
        var sc = r2.height / r1.height * 1.15;
        out.to(mark, { x: (r2.left + r2.width / 2) - (r1.left + r1.width / 2), y: (r2.top + r2.height / 2) - (r1.top + r1.height / 2), scale: sc, duration: 1.05, ease: 'expo.inOut' }, 0)
           .to(mark, { opacity: 0, duration: .25 }, .85)
           .to($('.lintro-bg', intro), { opacity: 0, duration: .8, ease: 'power2.inOut' }, .35)
           .to($('.skip-intro', intro), { opacity: 0, duration: .2 }, 0);
        gsap.set(navLogo, { opacity: 0 }); out.to(navLogo, { opacity: 1, duration: .3 }, .85);
        done(.45);
      } else {
        out.to(intro, { opacity: 0, duration: .5 });
        done(.1);
      }
    }
    $('.skip-intro', intro).addEventListener('click', function () { finish(true); });
    d.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { d.removeEventListener('keydown', esc); finish(true); } });
    bg.forEach(function (o, i) { gsap.fromTo(o, { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: 'power2.out', delay: i * .1 }); });
    tl = gsap.timeline({ delay: .25, onComplete: function () { finish(false); } });
    tl.set(mark, { x: function () { return $('.lword', intro).offsetWidth * .5 + 18; } })
      .from(bars, { scaleX: 0, opacity: 0, duration: .9, ease: 'expo.out', stagger: .12 })
      .from(bars, { x: -40, duration: 1.1, ease: 'expo.out', stagger: .12 }, '<')
      .fromTo(gleam, { xPercent: -150 }, { xPercent: 650, duration: .8, ease: 'power2.inOut', stagger: .06 }, '-=.55')
      .to(mark, { x: 0, duration: 1, ease: 'expo.inOut' }, '-=.45')
      .from(letters, { yPercent: 150, opacity: 0, duration: .8, ease: 'expo.out', stagger: .045 }, '-=.6')
      .from(ring, { scale: 0, rotate: -180, duration: .7, ease: 'back.out(3)' }, '-=.35')
      .to(bars, { x: 6, duration: .25, ease: 'power1.inOut', yoyo: true, repeat: 1, stagger: .05 }, '-=.3')
      .to({}, { duration: .45 });
  }

  /* ---------- home video hero ---------- */
  function initVhero() {
    var hero = $('.vhero'); if (!hero) return;
    var v = $('video', hero), foot = $('.vhero-foot', hero);
    v.muted = true; v.defaultMuted = true; v.setAttribute('muted', ''); v.playsInline = true;
    function play(fromStart) {
      try { if (fromStart) v.currentTime = 0; } catch (e) {}
      var p = v.play && v.play();
      if (p && p.catch) p.catch(function () {
        // autoplay refused: start on the first touch, click, key or scroll
        var go = function () { ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(function (ev) { w.removeEventListener(ev, go, true); }); v.play().catch(function () {}); };
        ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(function (ev) { w.addEventListener(ev, go, { capture: true, passive: true }); });
      });
    }
    if (hasG) {
      gsap.set(foot.children, { y: 26, opacity: 0 });
      var shown = false;
      var show = function () { if (shown) return; shown = true; gsap.to(foot.children, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: .12 }); };
      v.addEventListener('ended', show);
      v.addEventListener('timeupdate', function () { if (v.duration && v.currentTime > v.duration - .45) show(); });
      setTimeout(show, 3200);
      gsap.to(v, { scale: 1.08, yPercent: 6, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true,
        onEnterBack: function () { play(true); } } });
    }
    if (v.readyState >= 2) play(true);
    else { v.addEventListener('canplay', function () { play(false); }, { once: true }); play(false); }
  }

  /* ---------- solution rows ---------- */
  function initSolutions() {
    if (!hasG || reduce) return;
    $$('.srow').forEach(function (r) {
      var st = { trigger: r, start: 'top 78%', once: true };
      var tl = gsap.timeline({ scrollTrigger: st });
      tl.from($('.sb', r), { y: 16, opacity: 0, duration: .6, ease: 'power3.out' })
        .from($$('.st1, .hl-t', r), { y: 34, opacity: 0, duration: .9, ease: 'expo.out', stagger: .08 }, '-=.35')
        .from($('.hl-bg', r), { scaleX: 0, duration: .8, ease: 'expo.inOut' }, '-=.75')
        .from($$('.sd, .sk, .sbtn', r), { y: 20, opacity: 0, duration: .7, ease: 'power3.out', stagger: .08 }, '-=.5')
        .from($$('.sf li', r), { y: 24, opacity: 0, duration: .6, ease: 'back.out(1.6)', stagger: .07 }, '-=.6');
      var sh = $('.sm-shape', r), im = $('.sm img', r);
      gsap.from(sh, { scale: .55, opacity: 0, duration: 1.3, ease: 'expo.out', transformOrigin: '100% 0%', scrollTrigger: st });
      gsap.from(im, { y: 70, opacity: 0, duration: 1.3, ease: 'expo.out', delay: .15, scrollTrigger: st });
      gsap.fromTo(sh, { yPercent: -4 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: r, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- about block ---------- */
  function initAbout() {
    var ab = $('.about-blk'); if (!ab || !hasG || reduce) return;
    var st = { trigger: ab, start: 'top 75%', once: true };
    gsap.from($$('.ab-l1, .ab-l2', ab), { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: .12, scrollTrigger: st });
    gsap.from($('.ab-hex', ab), { scale: .7, rotate: -18, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: st });
    gsap.from($('.ab-dev', ab), { y: 90, rotate: 8, opacity: 0, duration: 1.5, ease: 'expo.out', delay: .15, scrollTrigger: st });
    gsap.to($('.ab-dev', ab), { y: -14, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 });
    gsap.to($('.ab-hex', ab), { rotate: 6, ease: 'none', scrollTrigger: { trigger: ab, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- product film ---------- */
  function initFilm() {
    var film = $('.film');
    if (!film) return;
    var v = $('video', film), caps = $$('.film-cap', film), dots = $$('.film-steps i', film), shade = $('.film-shade', film);
    if (shade) shade.style.opacity = 1;
    v.muted = true; v.loop = true;
    var times = caps.map(function (c) { return [parseFloat(c.getAttribute('data-from')), parseFloat(c.getAttribute('data-to'))]; });
    function showCaps(t) {
      caps.forEach(function (c, i) {
        var on = t >= times[i][0] && t < times[i][1];
        if (c._on === on) return;
        c._on = on;
        if (dots[i]) dots[i].classList.toggle('on', on);
        if (hasG && !reduce) gsap.to(c, { opacity: on ? 1 : 0, y: on ? 0 : 12, duration: on ? .7 : .35, ease: on ? 'power3.out' : 'power2.in', overwrite: true });
        else c.style.opacity = on ? 1 : 0;
      });
    }
    showCaps(0);
    v.addEventListener('timeupdate', function () { showCaps(v.currentTime); });
    // plain playback: play while on screen, pause when off screen
    if ('IntersectionObserver' in w) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) v.play().catch(function () {}); else v.pause(); }); }, { threshold: .25 }).observe(v);
    } else { v.play().catch(function () {}); }
  }

  /* ---------- forms ---------- */
  var FORM_FAILED = 'Sorry, we could not send that. Please call 1 (855) 556-7433.';
  function submitForm(f, kind) {
    var btn = $('button[type=submit]', f), data = new FormData(f);
    data.append('form', kind);
    data.append('page', w.location.pathname);
    if (btn) btn.disabled = true;
    return fetch('/api/lead.php', { method: 'POST', body: data, headers: { 'X-Requested-With': 'shapespay-site' } })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (!r.ok) throw new Error('rejected'); })
      .finally(function () { if (btn) btn.disabled = false; });
  }
  // Hidden from people; bots that fill in every field get filtered out by api/lead.php.
  $$('form[data-quote], form[data-news]').forEach(function (f) {
    var trap = d.createElement('input');
    trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off';
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    f.appendChild(trap);
  });
  $$('form[data-quote]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('[required]', f).forEach(function (i) {
        var err = i.parentElement.querySelector('.err'), bad = !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value));
        if (err) err.textContent = bad ? (i.type === 'email' ? 'Enter a valid email address.' : 'This field is required.') : '';
        i.setAttribute('aria-invalid', bad); if (bad) ok = false;
      });
      if (!ok) { var first = $('[aria-invalid=true]', f); first && first.focus(); return; }
      var okBox = f.parentElement.querySelector('.form-ok');
      var fail = $('.form-fail', f);
      if (!fail) { fail = d.createElement('p'); fail.className = 'form-fail'; fail.setAttribute('role', 'alert'); fail.style.cssText = 'color:#B4235A;margin-top:12px'; f.appendChild(fail); }
      fail.textContent = '';
      submitForm(f, 'quote').then(function () {
        f.hidden = true; if (okBox) { okBox.hidden = false; okBox.focus && okBox.focus(); }
      }, function () { fail.textContent = FORM_FAILED; });
    });
  });
  $$('[data-again]').forEach(function (b) { b.addEventListener('click', function () { var c = b.closest('.form-card'); var f = $('form', c); f.reset(); f.hidden = false; $('.form-ok', c).hidden = true; }); });
  var toast = $('.toast');
  function say(msg) { if (!toast) return; toast.textContent = msg; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('on'); }, 3200); }
  $$('form[data-news]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var i = $('input', f);
      if (!/^\S+@\S+\.\S+$/.test(i.value)) { say('Enter a valid email address.'); i.focus(); return; }
      submitForm(f, 'newsletter').then(function () { f.reset(); say('Thanks for subscribing.'); }, function () { say(FORM_FAILED); });
    });
  });
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy');
      var fallback = function () { var r = d.createRange(); r.selectNodeContents(b.previousElementSibling); var s = w.getSelection(); s.removeAllRanges(); s.addRange(r); say('Selected. Press Ctrl/Cmd + C to copy.'); };
      try { navigator.clipboard.writeText(t).then(function () { say('Copied ' + t); }, fallback); } catch (e) { fallback(); }
    });
  });

  /* ---------- blog filter ---------- */
  var fb = $$('.filter button');
  fb.forEach(function (b) {
    b.addEventListener('click', function () {
      fb.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var c = b.getAttribute('data-cat');
      $$('.posts .post').forEach(function (p) { p.hidden = !(c === 'all' || p.getAttribute('data-cat') === c); });
      if (hasG) ScrollTrigger.refresh();
    });
  });

  /* ---------- faq: one open at a time per group ---------- */
  $$('.faq').forEach(function (g) {
    $$('details', g).forEach(function (dt) {
      dt.addEventListener('toggle', function () {
        if (dt.open) $$('details', g).forEach(function (o) { if (o !== dt) o.open = false; });
        if (hasG) ScrollTrigger.refresh();
      });
    });
  });

  /* ---------- in-page anchors with lenis ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = d.getElementById(id.slice(1)); if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -90 }); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- boot ---------- */
  function boot() {
    initVhero();
    runIntro(function (delay) { heroIn(delay); });
    if (!$('.intro')) {/* inner pages */}
    initFilm();
    initAbout();
    initSolutions();
    initReveals(d);
    $$('[data-hero]').forEach(function (h) { if (!$('.hero-bg', h) && !$('.intro')) heroInInner(h); });
    if (hasG) w.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  function heroInInner(h) {
    if (!hasG || reduce) return;
    $$('[data-split]', h).forEach(function (el, i) { splitReveal(el, { noTrigger: true, delay: .1 + i * .12 }); });
    gsap.from($$('[data-reveal]', h), { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .09, delay: .35 });
    $$('.glow', h).forEach(function (o, i) { gsap.to(o, { x: i ? -50 : 60, y: i ? 30 : -40, duration: 10 + i * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(boot); else boot();
})();
