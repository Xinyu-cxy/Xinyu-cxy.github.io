/* ==============================================
   render.js — DOM rendering functions
   ============================================== */

/* ----- Utility ----- */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ----- Generate gradient placeholder for chapter cards ----- */
const CHAPTER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
];

function getChapterGradient(index) {
  return CHAPTER_GRADIENTS[index % CHAPTER_GRADIENTS.length];
}

/* ----- Chapter Cards Grid ----- */
function renderChapters() {
  const chapters = Object.entries(notesData);

  if (chapters.length === 0) {
    return '<div class="notes-empty" style="text-align:center;padding:48px;color:var(--color-text-muted)">No chapters yet. Edit <code>notesData</code> in <code>js/data.js</code>.</div>';
  }

  const cardsHTML = chapters.map(([name, data], i) => {
    const noteCount = Object.keys(data.notes).length;
    const hasImage = data.image && data.image.trim() !== '';

    const imageHTML = hasImage
      ? `<img class="chapter-card-image" src="${escapeHTML(data.image)}" alt="${escapeHTML(name)}" loading="lazy">`
      : `<div class="chapter-card-placeholder" style="background:${getChapterGradient(i)}">
           <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1" stroke-linecap="round">
             <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
             <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
             <line x1="8" y1="7" x2="16" y2="7"/>
             <line x1="8" y1="11" x2="14" y2="11"/>
           </svg>
         </div>`;

    return `
      <div class="chapter-card" data-chapter-index="${i}" data-action="open-chapter">
        ${imageHTML}
        <div class="chapter-card-label">
          <h3>${escapeHTML(name)}</h3>
          <p class="note-count">${noteCount} note${noteCount !== 1 ? 's' : ''}</p>
        </div>
      </div>`;
  }).join('');

  return `<div class="notes-chapters-grid">${cardsHTML}</div>`;
}

/* ----- Titles View (list of note titles in a chapter) ----- */
function renderTitles(chapterIndex) {
  const chapters = Object.entries(notesData);
  const [chapterName, chapterData] = chapters[chapterIndex];
  const notes = Object.entries(chapterData.notes);

  const itemsHTML = notes.map(([title], noteIndex) => `
    <div class="note-title-card" data-note-index="${noteIndex}" data-action="open-note">
      <span class="note-title-card-text">${escapeHTML(title)}</span>
      <svg class="note-title-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    </div>
  `).join('');

  return `
    <button class="notes-back" data-action="back-to-chapters">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      All Chapters
    </button>
    <h3 class="notes-chapter-heading">${escapeHTML(chapterName)}</h3>
    <div class="notes-titles-list">${itemsHTML}</div>
  `;
}

/* ----- Content View (full note body) ----- */
function renderContent(chapterIndex, noteIndex) {
  const chapters = Object.entries(notesData);
  const [chapterName, chapterData] = chapters[chapterIndex];
  const notes = Object.entries(chapterData.notes);
  const [noteTitle, noteContent] = notes[noteIndex];

  return `
    <button class="notes-back" data-action="back-to-titles">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      ${escapeHTML(chapterName)}
    </button>
    <div class="notes-content-header">
      <div class="notes-breadcrumb">
        <span data-action="back-to-chapters">Notes</span>
        <span class="sep">/</span>
        <span data-action="back-to-titles">${escapeHTML(chapterName)}</span>
        <span class="sep">/</span>
        <span class="current">${escapeHTML(noteTitle)}</span>
      </div>
    </div>
    <h1 class="note-title-heading">${escapeHTML(noteTitle)}</h1>
    <div class="note-body">${noteContent}</div>
  `;
}

/* ----- Projects ----- */
function renderProjects() {
  return projectsData.map(p => `
    <div class="project-card">
      <h3 class="project-name">${escapeHTML(p.name)}</h3>
      <p class="project-desc">${escapeHTML(p.description)}</p>
      <div class="project-tags">${p.tags.map(t => `<span class="project-tag">${escapeHTML(t)}</span>`).join('')}</div>
      <div class="project-links">
        ${p.link ? `<a href="${escapeHTML(p.link)}" target="_blank" rel="noopener">Project &rarr;</a>` : ''}
        ${p.github ? `<a href="${escapeHTML(p.github)}" target="_blank" rel="noopener">GitHub &rarr;</a>` : ''}
      </div>
    </div>
  `).join('');
}

/* ----- Publications ----- */
function renderPublications() {
  const byYear = {};
  publicationsData.forEach(pub => {
    if (!byYear[pub.year]) byYear[pub.year] = [];
    byYear[pub.year].push(pub);
  });

  const years = Object.keys(byYear).sort((a, b) => b - a);

  return years.map(year => {
    const pubs = byYear[year];
    const pubsHTML = pubs.map(p => `
      <div class="pub-item">
        <div class="pub-title">${escapeHTML(p.title)}</div>
        <div class="pub-meta">
          <span class="authors">${escapeHTML(p.authors)}</span>
          <br><span class="venue">${escapeHTML(p.venue)}</span>
        </div>
        ${p.links && p.links.length > 0 ? `
          <div class="pub-links">
            ${p.links.map(l => `<a href="${escapeHTML(l.url)}" target="_blank" rel="noopener">${escapeHTML(l.label)}</a>`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
      <div class="pub-year-divider">
        <span class="pub-year">${year}</span>
        <div class="pub-year-line"></div>
      </div>
      ${pubsHTML}
    `;
  }).join('');
}
