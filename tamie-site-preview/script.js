/* Este arquivo tem duas partes: (1) menu hambúrguer do celular (no fim do arquivo) e
   (2) vídeo do YouTube "sob demanda" da página Agendar, descrita abaixo.

   Página Agendar: vídeo do YouTube "sob demanda".
   O YouTube só é carregado quando a pessoa clica no botão ▶ — assim nenhum
   cookie/rastreador de terceiros é usado antes disso.
   Para colocar o seu vídeo: em book.html e pt/book.html, preencha
   data-youtube-id="" com o código do vídeo (a parte depois de "v=" no link).
   Ex.: https://www.youtube.com/watch?v=AbC123xyz  ->  data-youtube-id="AbC123xyz" */
(function () {
  document.querySelectorAll('.video').forEach(function (box) {
    var btn = box.querySelector('.video__play');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var id = (box.getAttribute('data-youtube-id') || '').trim();
      if (!id) return;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      iframe.title = box.getAttribute('data-title') || 'YouTube video';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      box.innerHTML = '';
      box.appendChild(iframe);
    });
  });
})();

/* Menu hambúrguer (celular): abre/fecha a gaveta do menu.
   Fecha ao clicar num link, ao apertar Esc, ao clicar fora ou ao voltar para tela grande. */
(function () {
  var header = document.querySelector('.site-header');
  var btn = header && header.querySelector('.site-header__toggle');
  var nav = header && header.querySelector('.site-nav');
  if (!btn || !nav) return;
  function setOpen(open) {
    header.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', btn.getAttribute(open ? 'data-label-close' : 'data-label-open'));
  }
  btn.addEventListener('click', function () { setOpen(!header.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('is-open')) { setOpen(false); btn.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (header.classList.contains('is-open') && !header.contains(e.target)) setOpen(false);
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 860) setOpen(false); });
})();

/* Sombra no menu ao rolar + elementos que surgem suavemente ao entrar na tela. */
(function () {
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // "Reduzir movimento" ligado no sistema, ou navegador antigo: não anima nada
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  // Quais elementos surgem suavemente? Para incluir/excluir algo, mexa nesta lista de seletores.
  var SEL = '.section-heading, .card, .step, .msg, .timeline__item, .figure-pair figure, .video, .callout, .prose > *, .quote, .accordion__item';
  var all = Array.prototype.slice.call(document.querySelectorAll(SEL)).filter(function (el) {
    return !el.closest('.hero, .site-header, .site-footer') && !(el.parentElement && el.parentElement.closest(SEL));
  });
  var vh = window.innerHeight || 800;
  var targets = all.filter(function (el) { return el.getBoundingClientRect().top > vh * 0.92; }); // o que já aparece na 1ª tela não anima

  targets.forEach(function (el) {
    el.classList.add('reveal');
    // irmãos entram em sequência (até 3 passos de 80 ms)
    var idx = 0, prev = el.previousElementSibling;
    while (prev) { if (targets.indexOf(prev) > -1) idx++; prev = prev.previousElementSibling; }
    if (idx) el.style.transitionDelay = Math.min(idx, 3) * 80 + 'ms';
  });

  function done(el) { el.classList.remove('reveal', 'is-visible'); el.style.transitionDelay = ''; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      io.unobserve(el);
      el.classList.add('is-visible');
      setTimeout(function () { done(el); }, 1400); // devolve o elemento ao estado normal (hover etc.)
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(function (el) { io.observe(el); });
})();
