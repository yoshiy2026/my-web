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
  var reserve  = document.getElementById('reserve');
  var ticking  = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (header) header.classList.toggle('is-scrolled', y > 60);

    if (fixedCta) {
      // ファーストビューを抜けたら固定CTAを出す（フォームが見えている間は隠す）
      var threshold = hero ? hero.offsetHeight * 0.7 : 500;
      var formInView = false;
      if (reserve) {
        var r = reserve.getBoundingClientRect();
        formInView = r.top < window.innerHeight && r.bottom > 0;
      }
      fixedCta.classList.toggle('is-shown', y > threshold && !formInView);
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

  /* ---------- よくあるご質問（アコーディオン） ---------- */
  var faqList = document.getElementById('faqList');

  if (faqList) {
    // JS が動く環境でだけ折りたたむ（動かない場合は開いた状態で読めるようにする）
    faqList.classList.add('is-enhanced');

    faqList.querySelectorAll('.faq-item__q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.parentElement.parentElement; // .faq-item__head -> .faq-item
        var isOpen = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
  }

  /* ---------- 予約希望・お問い合わせフォーム ---------- */
  var form = document.getElementById('reserveForm');

  if (form) {
    var endpoint  = (window.FORM_ENDPOINT || '').trim();
    var mailTo    = (window.CONTACT_EMAIL || '').trim();
    var submitBtn = document.getElementById('rformSubmit');
    var statusEl  = document.getElementById('rformStatus');
    var doneEl    = document.getElementById('rformDone');
    var date1     = document.getElementById('fDate1');
    var reserveOnly = form.querySelectorAll('[data-for-reserve]');

    // 表示用のメールアドレスを設定値にそろえる
    if (mailTo) {
      document.querySelectorAll('[data-contact-email]').forEach(function (el) { el.textContent = mailTo; });
    }

    function purpose() {
      var checked = form.querySelector('input[name="ご用件"]:checked');
      return checked ? checked.value : '';
    }
    function isInquiry() { return purpose() === 'お問い合わせのみ'; }

    // 「お問い合わせのみ」のときは希望日時・確認事項を隠す
    function syncPurpose() {
      var inquiry = isInquiry();
      reserveOnly.forEach(function (el) { el.hidden = inquiry; });
      date1.required = !inquiry;
    }
    form.querySelectorAll('input[name="ご用件"]').forEach(function (r) {
      r.addEventListener('change', syncPurpose);
    });
    syncPurpose();

    // 全角数字を半角にし、ハイフン・空白を除いた数字だけにする
    function telDigits(v) {
      return v.replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
              .replace(/[^0-9]/g, '');
    }

    var rules = [
      { id: 'fName',  msg: 'お名前をご入力ください。' },
      { id: 'fKana',  msg: 'フリガナをご入力ください。' },
      { id: 'fEmail', msg: 'メールアドレスをご入力ください。',
        check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'メールアドレスの形式をご確認ください。'; } },
      { id: 'fTel',   msg: '携帯電話番号をご入力ください。',
        check: function (v) { var d = telDigits(v).length; return (d >= 10 && d <= 11) || '電話番号は10〜11桁の数字でご入力ください。'; } },
      { id: 'fDate1', msg: 'セッションのご希望日時をご入力ください。',
        skip: isInquiry },
      { id: 'fAgree', msg: 'ご利用規約・キャンセルポリシーとプライバシーポリシーへの同意が必要です。', checkbox: true }
    ];

    function setError(field, message) {
      var err = document.getElementById(field.id + '-err');
      if (err) err.textContent = message || '';
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }

    function validate() {
      var first = null;
      rules.forEach(function (rule) {
        var field = document.getElementById(rule.id);
        if (!field) return;
        var message = '';
        if (!(rule.skip && rule.skip())) {
          if (rule.checkbox) {
            if (!field.checked) message = rule.msg;
          } else {
            var v = field.value.trim();
            if (!v) message = rule.msg;
            else if (rule.check) {
              var result = rule.check(v);
              if (result !== true) message = result;
            }
          }
        }
        setError(field, message);
        if (message && !first) first = field;
      });
      return first;
    }

    // 入力し直したらエラー表示を消す
    rules.forEach(function (rule) {
      var field = document.getElementById(rule.id);
      if (!field) return;
      field.addEventListener(rule.checkbox ? 'change' : 'input', function () {
        if (field.getAttribute('aria-invalid') === 'true') setError(field, '');
      });
    });

    function setStatus(html, isError) {
      statusEl.innerHTML = html;
      statusEl.classList.toggle('is-error', !!isError);
    }

    // 送信する項目（隠れている欄は除く）
    function collect() {
      var data = new FormData(form);
      data.delete('_gotcha');
      if (isInquiry()) {
        data.delete('第1希望日時');
        data.delete('第2希望日時');
      }
      return data;
    }

    function subjectText() {
      return '【Loko Pono】' + purpose() + '（' + document.getElementById('fName').value.trim() + ' 様）';
    }

    function mailtoHref(data) {
      var lines = [];
      data.forEach(function (value, key) {
        lines.push((key === 'email' ? 'メールアドレス' : key) + '：' + value);
      });
      return 'mailto:' + mailTo +
        '?subject=' + encodeURIComponent(subjectText()) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    }

    function showDone() {
      form.hidden = true;
      doneEl.hidden = false;
      doneEl.focus();
    }

    function fallbackMessage(data) {
      return '送信できませんでした。お手数ですが、<a href="' + mailtoHref(data) + '">こちら</a>から、または ' +
        mailTo + ' 宛てに直接メールでご連絡ください。';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('');

      var firstInvalid = validate();
      if (firstInvalid) {
        firstInvalid.focus();
        setStatus('入力内容をご確認ください。', true);
        return;
      }

      // 迷惑メール対策の隠し欄に入力がある場合は、送信したように見せて終える
      var hp = form.querySelector('input[name="_gotcha"]');
      if (hp && hp.value) { showDone(); return; }

      var data = collect();

      // 送信先が未設定のときは、メールソフトを開く
      if (!endpoint) {
        window.location.href = mailtoHref(data);
        setStatus('メールソフトが開きます。内容をご確認のうえ、そのまま送信してください。<br>' +
          '開かない場合は、お手数ですが ' + mailTo + ' 宛てに直接メールでご連絡ください。');
        return;
      }

      data.append('_subject', subjectText());
      submitBtn.disabled = true;
      setStatus('送信しています…');

      fetch(endpoint, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('status ' + res.status);
          setStatus('');
          form.reset();
          syncPurpose();
          showDone();
        })
        .catch(function () {
          setStatus(fallbackMessage(data), true);
        })
        .then(function () {
          submitBtn.disabled = false;
        });
    });
  }
})();
