/* =============================================
   EVOLVE PROJECT MANAGER — revision-parser.js
   Parser revisioni .txt -> array sezioni dinamiche
   ============================================= */

const REVISION_COLOR_PALETTE = [
  '#7c6af7', '#38bdf8', '#fb923c', '#f472b6', '#34c77b',
  '#fbbf24', '#2dd4bf', '#f87171', '#c4b5fd', '#a3e635'
];

function parseRevision(rawText) {
  try {
    const lines = rawText.split('\n');
    const sections = [];
    let current = null;
    let colorIndex = 0;

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      const sectionMatch = line.match(/^\[(.+)\]$/);
      if (sectionMatch) {
        const label = sectionMatch[1].trim();
        current = {
          id:    slugifyRevision(label),
          label: label,
          color: REVISION_COLOR_PALETTE[colorIndex % REVISION_COLOR_PALETTE.length],
          items: []
        };
        colorIndex++;
        sections.push(current);
        return;
      }

      if (current && line.length > 0) {
        current.items.push({
          id:   current.id + '__' + current.items.length,
          text: line,
          done: false
        });
      }
    });

    if (sections.length === 0) {
      return {
        parseError: true,
        message: 'Nessuna sezione trovata. Verifica il formato del file (sezioni tra [PARENTESI QUADRE]).'
      };
    }

    return sections;

  } catch(e) {
    return { parseError: true, message: 'Errore nella lettura del file.' };
  }
}

function slugifyRevision(str) {
  return str
    .toLowerCase()
    .replace(/\s*>\s*/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
