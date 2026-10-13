(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var CONTACT_EMAIL = 'anna@annavie.fr';
  // Service d'envoi du formulaire (FormSubmit) : le message arrive directement sur CONTACT_EMAIL.
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + CONTACT_EMAIL;

  // En-tête : ombre au défilement
  var header = document.getElementById('header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menu mobile
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  function setNav(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  }
  toggle.addEventListener('click', function () {
    setNav(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  // Apparition des blocs au défilement
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Vidéo : YouTube n'est chargé qu'au clic
  document.querySelectorAll('.video[data-video]').forEach(function (box) {
    box.querySelector('.video__play').addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + box.dataset.video + '?autoplay=1&rel=0';
      frame.title = box.dataset.title || 'Vidéo';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(frame);
    });
  });

  // Formulaire : envoi direct par e-mail
  var form = document.getElementById('contactForm');
  var hint = document.getElementById('formHint');
  var submit = form.querySelector('[type="submit"]');
  var submitLabel = submit.textContent;

  function setHint(state, html) {
    hint.className = 'form__hint' + (state ? ' is-' + state : '');
    hint.innerHTML = html;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      var ok = field.checkValidity();
      field.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      setHint('error', 'Merci de renseigner votre nom et une adresse e-mail valide.');
      return;
    }

    var data = new FormData(form);
    if (data.get('_honey')) return;

    var payload = {
      _subject: 'Demande de rendez-vous — ' + data.get('soin'),
      _template: 'table',
      Nom: data.get('name'),
      'Téléphone': data.get('phone') || '—',
      email: data.get('email'),
      'Soin souhaité': data.get('soin'),
      Message: data.get('message') || '—'
    };

    submit.disabled = true;
    submit.textContent = 'Envoi en cours…';
    setHint('', 'Envoi de votre demande…');

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (json) {
          if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || 'Erreur');
        });
      })
      .then(function () {
        form.reset();
        setHint('success', 'Merci ! Votre demande a bien été envoyée. Nous vous recontactons très vite.');
      })
      .catch(function () {
        setHint('error', 'L’envoi n’a pas abouti. Vous pouvez nous écrire à <a href="mailto:' + CONTACT_EMAIL + '">' +
          CONTACT_EMAIL + '</a> ou nous appeler au <a href="tel:+33647428877">06 47 42 88 77</a>.');
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = submitLabel;
      });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
