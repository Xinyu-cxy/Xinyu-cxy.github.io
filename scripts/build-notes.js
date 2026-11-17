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
  const placeholders = [];
  md = md.replace(/\r\n?/g, '\n');

  function protect(html, type) {
    const marker = '\x00PH' + placeholders.length + '\x00';
    placeholders.push({ marker, html, type });
    return marker;
  }

  // Protect code before math so delimiters inside code are left untouched.
  md = md.replace(/^(```+|~~~+)([^\n]*)\n([\s\S]*?)^\1[ \t]*$/gm,
    (_match, fence, info, content) => {
      const language = info.trim().split(/\s+/)[0];
      if (language === 'algorithm') {
        return protect('<div class="algorithm-block">' +
          escapeHTML(content.replace(/\n$/, '')) + '</div>', 'algorithm');
      }
      const className = language ? ' class="language-' + escapeHTML(language) + '"' : '';
      return protect('<pre><code' + className + '>' +
        escapeHTML(content.replace(/\n$/, '')) + '</code></pre>', 'code');
    });

  md = md.replace(/\$\$([\s\S]+?)\$\$/g, (_match, content) =>
    protect('$$' + escapeHTML(content.trim()) + '$$', 'display-math'));
  md = md.replace(/\$(.+?)\$/g, (_match, content) =>
    protect('$' + escapeHTML(content) + '$', 'inline-math'));
  md = md.replace(/`([^`]+)`/g, (_match, content) =>
    protect('<code>' + escapeHTML(content) + '</code>', 'inline-code'));
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) =>
    protect('<a href="' + url + '" target="_blank" rel="noopener">' +
      escapeHTML(text) + '</a>', 'link'));

  const lines = md.split('\n');
  const output = [];
  let paragraph = [];
  let listTag = '';
  let listItems = [];
  let pendingListBlank = false;

  function flushParagraph() {
    if (paragraph.length) {
      output.push('<p>' + processInline(paragraph.join(' ')) + '</p>');
      paragraph = [];
    }
  }

  function flushList() {
    if (listTag) {
      output.push('<' + listTag + '>\n' + listItems.join('\n') + '\n</' + listTag + '>');
      listTag = '';
      listItems = [];
    }
  }

  function flushTextBlocks() {
    flushParagraph();
    flushList();
  }

  function tableCells(line) {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|')
      .map(cell => cell.trim());
  }

  function isTableSeparator(line) {
    return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      if (listTag) pendingListBlank = true;
      else flushList();
      continue;
    }

    const listMatch = trimmed.match(/^([-*+]|\d+\.)\s+(.+)$/);
    if (listTag && pendingListBlank) {
      const nextListTag = listMatch
        ? (/^\d/.test(listMatch[1]) ? 'ol' : 'ul')
        : '';
      if (nextListTag && nextListTag !== listTag ||
          !nextListTag && !/^\s/.test(line)) {
        flushList();
      }
      pendingListBlank = false;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushTextBlocks();
      const level = heading[1].length;
      output.push('<h' + level + '>' + processInline(heading[2]) + '</h' + level + '>');
      continue;
    }

    if (/^(---+|___+|\*\*\*+)\s*$/.test(trimmed)) {
      flushTextBlocks();
      output.push('<hr>');
      continue;
    }

    if (i + 1 < lines.length && trimmed.includes('|') && isTableSeparator(lines[i + 1].trim())) {
      flushTextBlocks();
      const headers = tableCells(trimmed);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().includes('|')) {
        rows.push(tableCells(lines[i]));
        i++;
      }
      i--;
      output.push('<table><thead><tr>' +
        headers.map(cell => '<th>' + processInline(cell) + '</th>').join('') +
        '</tr></thead><tbody>' +
        rows.map(row => '<tr>' + headers.map((_header, index) =>
          '<td>' + processInline(row[index] || '') + '</td>').join('') + '</tr>').join('') +
        '</tbody></table>');
      continue;
    }

    if (listMatch) {
      flushParagraph();
      const tag = /^\d/.test(listMatch[1]) ? 'ol' : 'ul';
      if (listTag && listTag !== tag) flushList();
      if (!listTag) listTag = tag;
      listItems.push('<li>' + processInline(listMatch[2]) + '</li>');
      pendingListBlank = false;
      continue;
    }

    const placeholderMatch = trimmed.match(/^\x00PH(\d+)\x00$/);
    if (placeholderMatch) {
      const placeholder = placeholders[Number(placeholderMatch[1])];
      if (placeholder.type === 'code' || placeholder.type === 'algorithm' ||
          placeholder.type === 'display-math') {
        if (placeholder.type === 'display-math' && listTag) {
          listItems[listItems.length - 1] = listItems[listItems.length - 1]
            .replace('</li>', '<p>' + trimmed + '</p></li>');
          pendingListBlank = false;
          continue;
        }
        flushTextBlocks();
        output.push(placeholder.type === 'display-math'
          ? '<p>' + trimmed + '</p>'
          : trimmed);
        continue;
      }
    }

    if (listTag) {
      listItems[listItems.length - 1] = listItems[listItems.length - 1]
        .replace('</li>', (pendingListBlank ? '<p>' : '<br>') +
          processInline(trimmed) + (pendingListBlank ? '</p>' : '') + '</li>');
      pendingListBlank = false;
    } else {
      paragraph.push(trimmed);
    }
  }

  flushTextBlocks();

  let result = output.join('\n');
  for (const placeholder of placeholders) {
    result = result.split(placeholder.marker).join(placeholder.html);
  }
  return result;
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
