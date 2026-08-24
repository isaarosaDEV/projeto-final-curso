/* ============================================================
   DUAS LUAS, UM DESTINO — animações de scroll (JS puro)
   Sem dependências externas. Funciona em qualquer navegador
   moderno (usa IntersectionObserver + requestAnimationFrame).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------
     1. Revelação suave de cada capítulo ao entrar na tela
     ------------------------------------------------------------ */
  const revealEls = document.querySelectorAll(
    '.scene:not(.scene-hero) .scene-art, .scene-content > *'
  );

  revealEls.forEach(el => el.classList.add('will-reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ------------------------------------------------------------
     2. Indicador fixo — atualiza o número do capítulo conforme
        a cena mais visível na tela, e guarda o índice atual
        para os botões de navegação das luas
     ------------------------------------------------------------ */
  const chapterLabel = document.getElementById('chapterNum');
  const scenesInOrder = Array.from(document.querySelectorAll('.scene'))
    .sort((a, b) => Number(a.dataset.chapter) - Number(b.dataset.chapter));

  let currentIndex = 0;

  if (chapterLabel && scenesInOrder.length) {
    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const chapter = entry.target.dataset.chapter || '0';
          chapterLabel.textContent = chapter.padStart(2, '0');
          currentIndex = scenesInOrder.indexOf(entry.target);
        }
      });
    }, { threshold: 0.5 });

    scenesInOrder.forEach(scene => chapterObserver.observe(scene));
  }

  /* ------------------------------------------------------------
     3. Navegação pelas luas do indicador fixo
        (crescente = capítulo anterior · cheia = próximo capítulo)
     ------------------------------------------------------------ */
  const prevBtn = document.getElementById('prevChapterBtn');
  const nextBtn = document.getElementById('nextChapterBtn');

  function goToChapter(index) {
    const clamped = Math.max(0, Math.min(scenesInOrder.length - 1, index));
    scenesInOrder[clamped].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToChapter(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToChapter(currentIndex + 1));

  /* ------------------------------------------------------------
     4. Botão "voltar ao início", no rodapé
     ------------------------------------------------------------ */
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------
     5. Parallax suave nas fotos de cada capítulo, via variável
        CSS --parallax-y (não sobrescreve os transforms já
        existentes no style.css, como translateX(-50%))
     ------------------------------------------------------------ */
  const parallaxEls = document.querySelectorAll(
    '.art-hologram, .art-home, .art-luke, .art-han, .art-starwars, ' +
    '.art-deathstar, .art-force, .art-heroluke, .art-darth, ' +
    '.hero-photo, .figure-silhouette'
  );

  let ticking = false;

  function updateParallax() {
    const viewportH = window.innerHeight;

    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportH) return; // fora da tela, ignora

      const center = rect.top + rect.height / 2;
      const offset = (center - viewportH / 2) / viewportH; // aprox. -0.5 a 0.5
      const move = offset * 26; // até ~26px de deslocamento
      el.style.setProperty('--parallax-y', `${move.toFixed(1)}px`);
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateParallax();

});