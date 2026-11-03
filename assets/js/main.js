(function () {
  'use strict';

  var WHATSAPP = '559233049909';

  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
  }

  function brl(n) {
    return 'R$ ' + Number(n).toLocaleString('pt-BR');
  }

  function onlyDigits(s) { return (s || '').replace(/\D/g, ''); }

  function maskPhone(input) {
    input.addEventListener('input', function () {
      var d = onlyDigits(input.value).slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      input.value = out;
    });
  }

  /* Ano no rodapé */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Menu mobile */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.querySelector('.nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Revelar ao rolar */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  document.querySelectorAll('input[type="tel"]').forEach(maskPhone);

  /* Carrossel de modelos: desliza sozinho, arrasta com o mouse/dedo e volta ao início sem emenda */
  var track = document.querySelector('[data-slider]');
  if (track) {
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (el) {
      var clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      track.appendChild(clone);
    });
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pos = 0, paused = false, resumeTimer = null, speed = 0.5;
    var half = function () { return track.scrollWidth / 2; };
    var wrap = function () {
      var h = half();
      if (pos >= h) pos -= h;
      if (pos < 0) pos += h;
    };
    var pause = function () { paused = true; clearTimeout(resumeTimer); };
    var resume = function (delay) {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { pos = track.scrollLeft; paused = false; }, delay || 0);
    };
    (function tick() {
      if (!paused && !reduce) {
        pos += speed; wrap(); track.scrollLeft = pos;
      }
      requestAnimationFrame(tick);
    })();
    track.addEventListener('mouseenter', pause);
    track.addEventListener('mouseleave', function () { if (!dragging) resume(300); });
    track.addEventListener('focusin', pause);
    track.addEventListener('focusout', function () { resume(1500); });
    track.addEventListener('touchstart', pause, { passive: true });
    track.addEventListener('touchend', function () { resume(2500); }, { passive: true });
    track.addEventListener('scroll', function () {
      if (!paused) return;
      var h = half();
      if (track.scrollLeft >= h) track.scrollLeft -= h;
      else if (track.scrollLeft <= 0) track.scrollLeft += h;
    }, { passive: true });

    /* Arrastar com o mouse */
    var dragging = false, moved = false, startX = 0, startScroll = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      dragging = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft; pause();
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
      track.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      setTimeout(function () { track.classList.remove('is-dragging'); }, 0);
      if (!track.matches(':hover')) resume(1500);
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    /* Setas */
    document.querySelectorAll('[data-slide]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pause();
        var card = track.querySelector('.model');
        var step = card ? card.getBoundingClientRect().width + 20 : 300;
        if (track.scrollLeft < step && btn.dataset.slide === '-1') track.scrollLeft += half();
        track.scrollBy({ left: step * Number(btn.dataset.slide), behavior: 'smooth' });
        resume(2500);
      });
    });
  }

  /* Simulador */
  var sim = document.getElementById('simulador');
  if (sim) {
    var RANGES = {
      chevrolet: { min: 50000, max: 600000, step: 5000, value: 120000 },
      carro: { min: 30000, max: 300000, step: 5000, value: 80000 },
      moto: { min: 10000, max: 100000, step: 1000, value: 25000 },
      imovel: { min: 80000, max: 1000000, step: 10000, value: 250000 },
      servicos: { min: 10000, max: 100000, step: 1000, value: 20000 }
    };
    var PRODUCT_LABEL = { carro: 'Carro', moto: 'Moto', imovel: 'Imóvel', servicos: 'Serviços' };

    var state = { brand: 'chevrolet', product: 'carro' };
    var tabs = sim.querySelectorAll('.sim__tab');
    var chevroletFields = sim.querySelector('[data-for="chevrolet"]');
    var uniaoFields = sim.querySelector('[data-for="uniao"]');
    var productChips = sim.querySelectorAll('[data-product]');
    var modelSelect = sim.querySelector('#sim-modelo');
    var range = sim.querySelector('#sim-credito');
    var rangeValue = sim.querySelector('[data-range-value]');
    var rangeMin = sim.querySelector('[data-range-min]');
    var rangeMax = sim.querySelector('[data-range-max]');

    function rangeKey() { return state.brand === 'chevrolet' ? 'chevrolet' : state.product; }

    function paintRange() {
      var p = ((range.value - range.min) / (range.max - range.min)) * 100;
      range.style.setProperty('--p', p + '%');
      rangeValue.textContent = brl(range.value);
    }

    function applyRange() {
      var r = RANGES[rangeKey()];
      range.min = r.min; range.max = r.max; range.step = r.step; range.value = r.value;
      rangeMin.textContent = brl(r.min);
      rangeMax.textContent = brl(r.max);
      paintRange();
    }

    function setBrand(brand) {
      state.brand = brand;
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.brand === brand ? 'true' : 'false'); });
      chevroletFields.hidden = brand !== 'chevrolet';
      uniaoFields.hidden = brand !== 'uniao';
      applyRange();
    }

    function setProduct(product) {
      state.product = product;
      productChips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.product === product ? 'true' : 'false'); });
      applyRange();
    }

    tabs.forEach(function (t) { t.addEventListener('click', function () { setBrand(t.dataset.brand); }); });
    productChips.forEach(function (c) { c.addEventListener('click', function () { setProduct(c.dataset.product); }); });
    range.addEventListener('input', paintRange);

    /* Atalhos vindos da página (modelos Chevrolet e produtos União) */
    document.querySelectorAll('[data-simular-modelo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setBrand('chevrolet');
        modelSelect.value = btn.getAttribute('data-simular-modelo');
        sim.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { sim.querySelector('#sim-nome').focus({ preventScroll: true }); }, 600);
      });
    });
    document.querySelectorAll('[data-simular-uniao]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setBrand('uniao');
        setProduct(btn.getAttribute('data-simular-uniao'));
        sim.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { sim.querySelector('#sim-nome').focus({ preventScroll: true }); }, 600);
      });
    });

    sim.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!sim.reportValidity()) return;
      var nome = sim.querySelector('#sim-nome').value.trim();
      var cidade = sim.querySelector('#sim-cidade').value;
      var o = state.brand === 'chevrolet'
        ? 'Chevrolet Consórcio' + (modelSelect.value ? ' – ' + modelSelect.value : '')
        : 'Consórcio União – ' + PRODUCT_LABEL[state.product];
      var msg = 'Olá! Quero fazer uma simulação de consórcio.\n\n' +
        '• Nome: ' + nome + '\n' +
        '• Consórcio: ' + o + '\n' +
        '• Crédito desejado: ' + brl(range.value) + '\n' +
        '• Cidade: ' + cidade;
      window.open(waLink(msg), '_blank', 'noopener');
    });

    setBrand('chevrolet');
  }

  /* Ficha de representante */
  var rep = document.getElementById('form-representante');
  if (rep) {
    rep.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!rep.reportValidity()) return;
      var v = function (id) { return rep.querySelector('#' + id).value.trim(); };
      var msg = 'Olá! Quero ser representante da Valcar Consórcio.\n\n' +
        '• Nome: ' + v('rep-nome') + '\n' +
        '• WhatsApp: ' + v('rep-whats') + '\n' +
        '• E-mail: ' + v('rep-email') + '\n' +
        '• Cidade/UF: ' + v('rep-cidade') + '\n' +
        '• Experiência com vendas: ' + v('rep-exp');
      window.open(waLink(msg), '_blank', 'noopener');
    });
  }
})();
