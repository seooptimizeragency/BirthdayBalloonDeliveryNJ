// Shared interactivity: FAQ accordion, corporate carousel, scroll-spy nav,
// YouTube click-to-load facades, hero video data-saver, validated form submission.
document.addEventListener('DOMContentLoaded', () => {
  // FAQ accordion (with aria-expanded)
  document.querySelectorAll('.faq-item .faq-q').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  // Scroll-spy for nav highlight
  const sections = [...document.querySelectorAll('[data-spy]')];
  const links = [...document.querySelectorAll('.main-nav a[data-spy-link]')];
  if (sections.length && links.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active',
            (l.getAttribute('href') || '').endsWith('#' + e.target.id)));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  // YouTube facades: load the real player only on click
  document.querySelectorAll('.yt-facade').forEach(btn => {
    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + btn.dataset.yt + '?autoplay=1&rel=0';
      iframe.title = btn.dataset.title || 'Balloons Lane video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });


  /* Inquiry forms: validate in the browser, submit in-page through a hidden iframe. */
  (function () {
    var forms = document.querySelectorAll('form.inquiry-form');
    if (!forms.length) return;
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function note(form, msg, ok) {
      var n = form.querySelector('.form-note');
      if (!n) return;
      n.textContent = msg || '';
      n.style.color = ok ? '#1b5e20' : '#b71c1c';
    }
    function mark(input, bad) {
      if (!input) return;
      input.classList.toggle('field-invalid', !!bad);
      if (bad) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
    forms.forEach(function (form) {
      var btn = form.querySelector('button[type="submit"]');
      var frame = form.querySelector('iframe[name$="-form-target"]');
      var submitted = false;
      var timer = null;
      var poller = null;
      function finish(ok) {
        if (!submitted) return;
        submitted = false;
        if (timer) clearTimeout(timer);
        if (poller) clearInterval(poller);
        if (btn) { btn.disabled = false; btn.textContent = 'Send'; }
        if (ok) {
          form.reset();
          note(form, 'Thank you! Your inquiry has been submitted successfully.', true);
        } else {
          note(form, 'Sorry, your inquiry could not be sent. Please try again.', false);
        }
      }
      function checkFrame() {
        if (!frame || !frame.contentWindow) return false;
        try {
          var path = frame.contentWindow.location.pathname || '';
          if (path.indexOf('/form-sent') !== -1) { finish(true); return true; }
        } catch (e) {}
        return false;
      }
      if (frame) frame.addEventListener('load', function () { if (submitted) checkFrame(); });
      form.addEventListener('input', function (e) { mark(e.target, false); });
      form.addEventListener('change', function (e) { mark(e.target, false); });
      form.addEventListener('submit', function (e) {
        var honey = form.querySelector('[name="_honey"]');
        if (honey && honey.value) { e.preventDefault(); return; }
        var email = form.querySelector('[name="email"]');
        var date = form.querySelector('[name="event_date"]');
        var zip = form.querySelector('[name="delivery_zip"]');
        var msg = form.querySelector('[name="message"]');
        var phone = form.querySelector('[name="phone"]');
        var human = form.querySelector('[name="verify_human"]');
        var file = form.querySelector('[name="attachment"]');
        var firstBad = null;
        var firstMsg = '';
        function bad(input, message) {
          mark(input, true);
          if (!firstBad) { firstBad = input; firstMsg = message; }
        }
        if (!email || !emailRe.test(email.value.trim())) bad(email, 'Please enter a valid email address.');
        if (phone && phone.value.trim() && phone.value.replace(/\D/g, '').length < 7) bad(phone, 'Please enter a valid phone number.');
        if (!date || !date.value.trim()) bad(date, 'Please enter your event date.');
        if (!zip || !/^\d{4,5}(-\d{4})?$/.test(zip.value.trim())) bad(zip, 'Please enter a valid delivery zip code.');
        if (!msg || !msg.value.trim()) bad(msg, 'Please write your message.');
        if (file && file.files && file.files[0] && file.files[0].size > 10 * 1024 * 1024) bad(file, 'Please attach a file smaller than 10 MB.');
        if (!human || !human.checked) {
          e.preventDefault();
          mark(human, true);
          note(form, 'Please verify you are human before sending.', false);
          if (human) human.focus();
          return;
        }
        if (firstBad) {
          e.preventDefault();
          note(form, firstMsg, false);
          firstBad.focus();
          return;
        }
        submitted = true;
        note(form, '', true);
        if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
        poller = setInterval(checkFrame, 250);
        timer = setTimeout(function () { finish(false); }, 30000);
      });
    });
  })();
});

/* Hero video: desktop only — on mobile the pane is hidden and the video is never downloaded */
(function () {
  var hv = document.getElementById('heroVideo');
  if (!hv) return;
  if (window.matchMedia('(max-width: 860px)').matches) { hv.remove(); return; }
  var so = hv.querySelector('source[data-src]');
  if (so) { so.src = so.getAttribute('data-src'); hv.load(); var pr = hv.play(); if (pr) pr.catch(function () {}); }
})();

/* Copyright year stays current automatically */
(function(){var y=document.getElementById('copy-year');if(y)y.textContent=new Date().getFullYear();})();

/* Mobile nav: hamburger toggle */
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.textContent = open ? '✕' : '☰';
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '☰';
    }
  });
})();
