/* ==============================================
   main.js — Init, page routing, events, animations
   ============================================== */

/* ----- Notes View State (internal to Notes page) ----- */
const notesState = {
  view: 'chapters',     // 'chapters' | 'titles' | 'content'
  chapterIndex: 0,
  noteIndex: 0
};

/* ----- Render the notes container based on current state ----- */
function refreshNotesView() {
  const container = document.getElementById('notesContainer');
  const header = document.getElementById('notesHeader');
  let html = '';

  switch (notesState.view) {
    case 'chapters':
      html = renderChapters();
      if (header) header.style.display = '';
      break;
    case 'titles':
      html = renderTitles(notesState.chapterIndex);
      if (header) header.style.display = 'none';
      break;
    case 'content':
      html = renderContent(notesState.chapterIndex, notesState.noteIndex);
      if (header) header.style.display = 'none';
      break;
  }

  container.classList.add('switching');
  setTimeout(() => {
    container.innerHTML = html;
    container.classList.remove('switching');
    setupRevealForContainer(container);
    // Render LaTeX math with KaTeX
    if (typeof renderMathInElement !== 'undefined') {
      renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }, 150);
}

/* ----- Page Switching ----- */
function switchPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show target
  const target = document.querySelector('[data-page="' + pageId + '"]');
  if (!target) return;
  target.classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + pageId);
  });

  // Update URL hash (no pushState if already matching, to avoid duplicate history entries)
  if (location.hash !== '#' + pageId) {
    history.pushState({ page: pageId }, '', '#' + pageId);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Reset notes to chapter view when navigating to Notes page
  if (pageId === 'notes') {
    notesState.view = 'chapters';
    refreshNotesView();
  }
}

/* ----- Event Delegation: nav clicks + notes internal navigation ----- */
document.addEventListener('click', function(e) {
  // --- Nav links: page switching ---
  const navLink = e.target.closest('.nav-links a');
  if (navLink) {
    e.preventDefault();
    const href = navLink.getAttribute('href');
    if (href && href.startsWith('#')) {
      const pageId = href.slice(1);
      switchPage(pageId);
    }
    return;
  }

  // --- Logo click: go to About ---
  const logo = e.target.closest('.nav-logo');
  if (logo) {
    e.preventDefault();
    switchPage('about');
    return;
  }

  // --- Notes internal actions ---
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.getAttribute('data-action');
  const container = document.getElementById('notesContainer');

  switch (action) {
    case 'open-chapter':
      notesState.view = 'titles';
      notesState.chapterIndex = parseInt(actionEl.getAttribute('data-chapter-index'));
      notesState.noteIndex = 0;
      refreshNotesView();
      document.getElementById('notes').scrollIntoView({ behavior: 'smooth' });
      break;

    case 'open-note':
      notesState.view = 'content';
      notesState.noteIndex = parseInt(actionEl.getAttribute('data-note-index'));
      refreshNotesView();
      document.getElementById('notes').scrollIntoView({ behavior: 'smooth' });
      break;

    case 'back-to-chapters':
      notesState.view = 'chapters';
      refreshNotesView();
      document.getElementById('notes').scrollIntoView({ behavior: 'smooth' });
      break;

    case 'back-to-titles':
      notesState.view = 'titles';
      refreshNotesView();
      document.getElementById('notes').scrollIntoView({ behavior: 'smooth' });
      break;
  }
});

/* ----- Browser back/forward (popstate) ----- */
window.addEventListener('popstate', function(e) {
  const hash = location.hash.replace('#', '');
  const pageId = hash || 'about';
  // Update without pushing new history
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.querySelector('[data-page="' + pageId + '"]');
  if (target) {
    target.classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + pageId);
    });
    if (pageId === 'notes') {
      notesState.view = 'chapters';
      refreshNotesView();
    }
  }
});

/* ----- Scroll Reveal Animation ----- */
function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    observer.observe(el);
  });
}

function setupRevealForContainer(container) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  container.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    observer.observe(el);
  });
}

/* ----- Mobile Nav Toggle ----- */
function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav')) links.classList.remove('open');
  });
}

/* ----- Back to Top Button ----- */
function setupBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ----- Render Static Sections ----- */
function renderStaticSections() {
  document.getElementById('projectsContainer').innerHTML = renderProjects();
  document.getElementById('pubsContainer').innerHTML = renderPublications();
  refreshNotesView();
}

/* ----- Init ----- */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  renderStaticSections();
  setupReveal();
  setupMobileNav();
  setupBackToTop();

  // Determine initial page from URL hash
  const hash = location.hash.replace('#', '');
  const initialPage = hash || 'about';
  switchPage(initialPage);
  // Replace state so the initial hash doesn't create a history entry
  if (!hash) {
    history.replaceState({ page: 'about' }, '', '#about');
  }
});
