#!/usr/bin/env node
/* ==============================================
   build-notes.js — Compile notes/*.md into JS data
   Supports: headings, bold, italic, code, links,
             lists, and LaTeX math ($...$ / $$...$$)
   Usage: node scripts/build-notes.js
   ============================================== */

const fs = require('fs');
const path = require('path');

const NOTES_DIR = path.join(__dirname, '..', 'notes');
const OUTPUT_FILE = path.join(__dirname, '..', 'js', 'notes-data.js');

// ----- Simple Markdown to HTML converter -----
function mdToHTML(md) {
  const ph = [];

  function protect(regex, wrapFn) {
    md = md.replace(regex, (...args) => {
      const i = ph.length;
      const captured = args.slice(1, args.length - 2);
      ph.push({ marker: '\x00PH' + i + '\x00', html: wrapFn.apply(null, captured) });
      return '\x00PH' + i + '\x00';
    });
  }

  // Order matters: display math first, then inline math
  protect(/\$\$([\s\S]+?)\$\$/g, (content) =>
    '$$' + escapeHTML(content.trim()) + '$$');

  protect(/\$(.+?)\$/g, (content) =>
    '$' + escapeHTML(content) + '$');

  protect(/`([^`]+)`/g, (content) =>
    '<code>' + escapeHTML(content) + '</code>');

  protect(/\[([^\]]+)\]\(([^)]+)\)/g, (text, url) =>
    '<a href="' + url + '" target="_blank" rel="noopener">' + escapeHTML(text) + '</a>');

  // Split into blocks by blank lines
  const blocks = md.split(/\n\s*\n/).filter(b => b.trim());

  const result = blocks.map(block => {
    const lines = block.split('\n');
    const nonEmpty = lines.filter(l => l.trim());

    // List detection — skip display math placeholder lines when checking
    const isPlaceholderLine = (l) => /^\x00PH\d+\x00$/.test(l.trim());
    const contentLines = nonEmpty.filter(l => !isPlaceholderLine(l));
    const isUnordered = contentLines.length > 0 && /^\s*-\s/.test(contentLines[0].trim());
    const isOrdered = contentLines.length > 0 && /^\s*\d+\.\s/.test(contentLines[0].trim());

    if (isUnordered || isOrdered) {
      const marker = isUnordered ? /^\s*-\s*/ : /^\s*\d+\.\s*/;
      const items = [];
      let itemContent = [];

      function flushItem() {
        if (itemContent.length > 0) {
          items.push('<li>' + itemContent.join('') + '</li>');
          itemContent = [];
        }
      }

      for (const line of nonEmpty) {
        const text = line.trim();
        if (marker.test(text)) {
          flushItem();
          itemContent.push(processInline(text.replace(marker, '')));
        } else if (isPlaceholderLine(text)) {
          const placeholder = ph[parseInt(text.match(/^\x00PH(\d+)\x00$/)[1])];
          itemContent.push(placeholder.html.startsWith('$$')
            ? '<p>' + text + '</p>'
            : '<br>' + text);
        } else {
          itemContent.push('<br>' + processInline(text));
        }
      }
      flushItem();

      const tag = isUnordered ? 'ul' : 'ol';
      return '<' + tag + '>\n' + items.join('\n') + '\n</' + tag + '>';
    }

    // Heading
    const hMatch = lines[0].trim().match(/^(#{1,6})\s+(.+)$/);
    if (hMatch && lines.length === 1) {
      const level = hMatch[1].length;
      return '<h' + level + '>' + processInline(hMatch[2]) + '</h' + level + '>';
    }

    // Complex block: split by display math placeholders at line level
    const segments = [];
    let textAccum = [];

    for (const line of lines) {
      const t = line.trim();
      const dm = t.match(/^\x00PH(\d+)\x00$/);
      if (dm) {
        // Flush accumulated text
        if (textAccum.length > 0) {
          segments.push('<p>' + processInline(textAccum.join(' ')) + '</p>');
          textAccum = [];
        }
        // Output display math wrapped in <p> to prevent HTML parser
        // from interpreting literal '<' as tag openers (e.g. <k in \min_{0\le j<k})
        segments.push('<p>' + ph[parseInt(dm[1])].html + '</p>');
      } else {
        textAccum.push(t);
      }
    }

    // Flush remaining text
    if (textAccum.length > 0) {
      segments.push('<p>' + processInline(textAccum.join(' ')) + '</p>');
    }

    return segments.join('\n');
  }).join('\n');

  // Restore any remaining placeholders inside inline contexts
  // NOTE: Use split/join rather than String.replace() because
  // .replace() treats $ in the replacement string as special
  // (e.g. $$ → $), which would break display math delimiters.
  let final = result;
  for (const p of ph) {
    final = final.split(p.marker).join(p.html);
  }

  return final;
}

function processInline(text) {
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return text;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ----- Main -----
function build() {
  if (!fs.existsSync(NOTES_DIR)) {
    console.error('Error: notes/ directory not found at', NOTES_DIR);
    process.exit(1);
  }

  const topics = [];

  const topicDirs = fs.readdirSync(NOTES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .sort();

  for (const dir of topicDirs) {
    const topicPath = path.join(NOTES_DIR, dir.name);
    const mdFiles = fs.readdirSync(topicPath)
      .filter(f => f.endsWith('.md'))
      .sort();

    const notes = {};
    for (const file of mdFiles) {
      const title = file.replace(/\.md$/, '');
      const content = fs.readFileSync(path.join(topicPath, file), 'utf-8');
      notes[title] = mdToHTML(content);
    }

    // Check for cover image
    let image = '';
    const coverFiles = fs.readdirSync(topicPath)
      .filter(f => /^cover\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    if (coverFiles.length > 0) {
      image = 'notes/' + dir.name + '/' + coverFiles[0];
    }

    if (Object.keys(notes).length > 0) {
      topics.push({ name: dir.name, image, notes });
    }
  }

  const output = `/* ==============================================
   notes-data.js — AUTO-GENERATED by build-notes.js
   DO NOT EDIT BY HAND. Run: node scripts/build-notes.js
   ============================================== */

const notesData = ${JSON.stringify(Object.fromEntries(topics.map(t => [t.name, { image: t.image, notes: t.notes }])), null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
  console.log('✓ Built', topics.length, 'topic(s) with',
    topics.reduce((sum, t) => sum + Object.keys(t.notes).length, 0),
    'note(s) → js/notes-data.js');
}

build();
