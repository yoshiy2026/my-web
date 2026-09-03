/* =========================================================
   Loko Pono LP  /  main.js
   ========================================================= */
(function () {
  'use strict';

  /* ---------- ローディング ---------- */
  var loader = document.getElementById('loader');
  function hideLoader() {
    if (!loader) return;
    setTimeout(function () { loader.classList.add('is-hidden'); }, 260);
  }
  window.addEventListener('load', hideLoader);
  // フォント読込などで load が遅れた場合の保険
  setTimeout(hideLoader, 2200);

  /* ---------- ヘッダーの背景切り替え ＋ スマホ固定CTA ---------- */
  var header   = document.getElementById('header');
  var fixedCta = document.getElementById('fixedCta');
  var hero     = document.getElementById('hero');
  var ticking  = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (header) header.classList.toggle('is-scrolled', y > 60);

    if (fixedCta) {
      // ファーストビューを抜けたら固定CTAを出す
      var threshold = hero ? hero.offsetHeight * 0.7 : 500;
      fixedCta.classList.toggle('is-shown', y > threshold);
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- ハンバーガーメニュー ---------- */
  var hamburger = document.getElementById('hamburger');
  var gnav      = document.getElementById('gnav');
  var overlay   = document.getElementById('navOverlay');
  var scrollY   = 0;

  function openNav() {
    scrollY = window.pageYOffset;
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'メニューを閉じる');
    gnav.classList.add('is-open');
    overlay.hidden = false;
    // 次フレームで transition を効かせる
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    // 背面スクロールのロック
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollY + 'px';
    document.body.style.width = '100%';
  }

  function closeNav() {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
    gnav.classList.remove('is-open');
    overlay.classList.remove('is-open');
    setTimeout(function () { overlay.hidden = true; }, 400);

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
  }

  function isNavOpen() {
    return gnav && gnav.classList.contains('is-open');
  }

  if (hamburger && gnav && overlay) {
    hamburger.addEventListener('click', function () {
      isNavOpen() ? closeNav() : openNav();
    });
    overlay.addEventListener('click', closeNav);

    // メニュー内リンクをタップしたら閉じてから移動
    gnav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (isNavOpen()) closeNav();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isNavOpen()) closeNav();
    });

    // PC 幅に戻したらリセット
    var mq = window.matchMedia('(min-width: 1081px)');
    var onMq = function (e) { if (e.matches && isNavOpen()) closeNav(); };
    mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);
  }

  /* ---------- ページ内スムーススクロール ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      var go = function () {
        var headerH = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;
        window.scrollTo({
          top: top,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
      };

      // ドロワーが開いていれば、閉じてスクロール位置が戻ってから移動
      isNavOpen() ? setTimeout(go, 60) : go();
    });
  });

  /* ---------- スクロールで表示アニメーション ---------- */
  var targets = document.querySelectorAll('[data-anim]');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    targets.forEach(function (el, i) {
      // 同じグループ内の要素を少しずつ遅らせる
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > [data-anim]') : [];
      if (siblings.length > 1) {
        var index = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = Math.min(index, 5) * 0.09 + 's';
      }
      io.observe(el);
    });
  } else {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 現在地に応じたナビのハイライト ---------- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.gnav__link');

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + entry.target.id;
          a.style.opacity = on ? '1' : '';
          a.classList.toggle('is-current', on);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }
})();
