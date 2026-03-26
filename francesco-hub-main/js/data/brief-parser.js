/* =============================================
   EVOLVE PROJECT MANAGER — brief-parser.js v3
   Parser Project Bible .txt -> oggetto strutturato

   MIGLIORAMENTI v3:
   - Normalizzazione linee: rimuove emoji, numeri prefisso, simboli
   - Anchor regex più tolleranti: accettano varianti comuni
   - Rilevamento sezioni anche parziale (non richiede match esatto)
   - Parsing robusto per Scheda: cerca "Label: Valore" e "Label\nValore"
   - Diagnostica: conteggio sezioni trovate, mai parseError totale
   - Validazione file: tipo e dimensione
   ============================================= */

/* ---- NORMALIZZAZIONE ---- */

function stripEmoji(str) {
  return str.replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
            .replace(/[\u{2600}-\u{27BF}]/gu, '')
            .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
            .trim();
}

function normalizeLine(line) {
  return stripEmoji(line)
    .replace(/^[\d]+[\.\)]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---- ANCHOR REGEX — tolleranti ---- */
const SECTION_ANCHORS = {
  scheda:    /scheda\s*(progetto|cliente|iniziale)?/i,
  brand:     /(posizionamento|brand|identit[àa]|voce|tono\s*di\s*voce)/i,
  target:    /(target|persona|pubblico|audience)/i,
  struttura: /(struttura|pagine?\s*del\s*sito|architettura|mappa\s*sito)/i,
  keywords:  /(keyword|parole?\s*chiave|seo|keyword\s*map)/i,
  stile:     /(stile|grafica|visual|palette|colori|tipograf|indicazioni)/i
};

const SECTION_NUM_ANCHORS = {
  scheda:    /^1[\.\)]/,
  brand:     /^2[\.\)]/,
  target:    /^3[\.\)]/,
  struttura: /^4[\.\)]/,
  keywords:  /^5[\.\)]/,
  stile:     /^6[\.\)]/
};

/* ---- ENTRY POINT ---- */

function parseBrief(rawText) {
  try {
    const lines     = rawText.split('\n').map(l => l.trim()).filter(l => l);
    const normLines = lines.map(normalizeLine);

    const result = {
      meta:      extractMeta(lines),
      scheda:    extractScheda(lines, normLines),
      brand:     extractBrand(lines, normLines),
      target:    extractTarget(lines, normLines),
      struttura: extractStruttura(lines, normLines),
      keywords:  extractKeywords(lines, normLines),
      stile:     extractStile(lines, normLines),
      _sectionsFound: []
    };

    const keys = ['scheda','brand','target','struttura','keywords','stile'];
    keys.forEach(k => {
      const sec = result[k];
      let found = false;
      if (k === 'scheda')    found = Object.keys(sec.fields || {}).length > 0;
      if (k === 'brand')     found = !!(sec.chiEIlCliente || sec.aggettivi?.length);
      if (k === 'target')    found = (sec.personas?.length > 0);
      if (k === 'struttura') found = (sec.pagine?.length > 0);
      if (k === 'keywords')  found = (sec.rows?.length > 0);
      if (k === 'stile')     found = !!(sec.palette?.length || sec.moodVisivo);
      if (found) result._sectionsFound.push(k);
    });

    return result;
  } catch(e) {
    console.error('Errore parsing brief:', e);
    return { parseError: true, raw: rawText };
  }
}

/* ---- VALIDAZIONE FILE ---- */

function validateBriefFile(file) {
  if (!file) return 'Nessun file selezionato.';
  const isText = file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md');
  if (!isText) return 'Il brief deve essere un file .txt (testo semplice).';
  if (file.size > 300 * 1024) return 'Il file è troppo grande (max 300KB).';
  if (file.size < 50) return 'Il file sembra vuoto o troppo corto.';
  return null;
}

/* ---- META ---- */
function extractMeta(lines) {
  return {
    titolo:   lines[0] || '',
    cliente:  lines[1] || '',
    tipoSito: lines[2] || '',
    data:     lines[3] || ''
  };
}

/* ---- SCHEDA ---- */
const SCHEDA_FIELDS = [
  'Cliente (Ragione Sociale)', 'Nome Commerciale', 'Settore',
  'Tipo Sito', 'Obiettivo Principale', 'Dominio', 'Partita IVA',
  'Indirizzo', 'Telefono', 'Email', 'Facebook', 'Instagram',
  'Competitor di Riferimento', 'Titolare Trattamento Dati',
  'Sede Legale Titolare', 'Email Titolare / Responsabile',
  'Telefono Titolare / Responsabile', 'Data Ricezione Task'
];

const SCHEDA_FIELDS_NORM = SCHEDA_FIELDS.map(f =>
  f.toLowerCase().replace(/\s+/g,' ').replace(/[()\/]/g,'')
);

function findSchedaField(line) {
  const lineNorm = line.toLowerCase().replace(/\s+/g,' ').replace(/[()\/]/g,'');
  let idx = SCHEDA_FIELDS_NORM.findIndex(f => lineNorm === f || lineNorm.startsWith(f + ':'));
  if (idx !== -1) return SCHEDA_FIELDS[idx];
  idx = SCHEDA_FIELDS_NORM.findIndex(f => lineNorm.startsWith(f) || f.startsWith(lineNorm));
  return idx !== -1 ? SCHEDA_FIELDS[idx] : null;
}

function extractScheda(lines, normLines) {
  const section = getSectionLines(lines, normLines, 'scheda', 'brand');
  const fields = {};
  const noteOperative = [];
  let inNote = false;
  let i = 0;

  while (i < section.length) {
    const line = section[i];

    if (/Note Operative/i.test(line)) { inNote = true; i++; continue; }
    if (inNote) {
      if (/^[*•\-]/.test(line)) noteOperative.push(line.replace(/^[*•\-]\s*/, ''));
      i++; continue;
    }

    // Prova match "Label: Valore" inline
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const keyPart = line.slice(0, colonIdx).trim();
      const valPart = line.slice(colonIdx + 1).trim();
      const matchedKey = findSchedaField(keyPart);
      if (matchedKey && valPart) {
        fields[matchedKey] = cleanFieldValue(valPart);
        i++; continue;
      }
    }

    // Prova match campo su riga, valore riga successiva
    const matchedKey = findSchedaField(line);
    if (matchedKey) {
      const inlineVal = line.slice(matchedKey.length).replace(/^[\s:]+/, '').trim();
      if (inlineVal) {
        fields[matchedKey] = cleanFieldValue(inlineVal);
        i++;
      } else if (i + 1 < section.length) {
        const nextLine = section[i + 1];
        if (!findSchedaField(nextLine)) {
          fields[matchedKey] = cleanFieldValue(nextLine);
          i += 2;
        } else { i++; }
      } else { i++; }
    } else { i++; }
  }
  return { fields, noteOperative };
}

function cleanFieldValue(val) {
  return val.replace(/\*(stimato)\*/g, '(stimato)').trim();
}

/* ---- BRAND ---- */
function extractBrand(lines, normLines) {
  const section = getSectionLines(lines, normLines, 'brand', 'target');
  const secNorm = getSectionLines(normLines, normLines, 'brand', 'target');
  return {
    chiEIlCliente:  extractNextParagraph(section, secNorm, 'Chi è il Cliente'),
    propostaValore: extractNextParagraph(section, secNorm, 'Proposta di Valore'),
    tonoRegistro:   extractNextLine(section, 'Registro'),
    aggettivi:      extractBulletList(section, 'Aggettivi Brand'),
    comeNonSuonare: extractBulletList(section, 'Come NON deve suonare'),
    frasiGiuste:    extractArrowList(section, 'tono GIUSTO'),
    frasiEvitare:   extractArrowList(section, 'da EVITARE')
  };
}

/* ---- TARGET / PERSONAS ---- */
const PERSONA_FIELDS = [
  'Età', 'Professione', 'Obiettivo sul sito',
  'Pain Point', 'Come parla / cosa cerca'
];

function extractTarget(lines, normLines) {
  const section = getSectionLines(lines, normLines, 'target', 'struttura');
  const personas = [];
  let currentPersona = null;

  for (let i = 0; i < section.length; i++) {
    const line = section[i];
    if (/^Persona\s+\d+\s*[—\-:]/i.test(line) || /^Persona\s*[—\-]\s*\w/i.test(line)) {
      if (currentPersona) personas.push(currentPersona);
      currentPersona = { nome: line, fields: {} };
      continue;
    }
    if (!currentPersona) continue;
    const field = PERSONA_FIELDS.find(f =>
      line === f || line.toLowerCase().startsWith(f.toLowerCase())
    );
    if (field && i + 1 < section.length) {
      const next = section[i + 1];
      if (next !== 'Dettaglio' && next !== 'Campo') {
        currentPersona.fields[field] = next;
      }
    }
  }
  if (currentPersona) personas.push(currentPersona);
  return { personas };
}

/* ---- STRUTTURA ---- */
function extractStruttura(lines, normLines) {
  const section = getSectionLines(lines, normLines, 'struttura', 'keywords');
  const pagine = [];
  let currentPage = null;

  section.forEach(line => {
    if (/^Pagina\s+\d+\s*[—\-:]/i.test(line) || /^Pagina\s*[—\-]\s*\w/i.test(line)) {
      if (currentPage) pagine.push(currentPage);
      currentPage = { nome: line, keyword: '', sezioni: [] };
      return;
    }
    if (!currentPage) return;
    if (/^Keyword SEO[\s:]/i.test(line)) {
      currentPage.keyword = line.replace(/^Keyword SEO[\s:]+/i, '').trim();
      return;
    }
    if (/^[*•]/.test(line)) {
      currentPage.sezioni.push(line.replace(/^[*•]\s*/, ''));
    }
  });
  if (currentPage) pagine.push(currentPage);

  const riepilogo = extractVerticalTable(section, ['Metrica', 'Valore']);
  return { pagine, riepilogo };
}

/* ---- KEYWORDS ---- */
function extractKeywords(lines, normLines) {
  const section = getSectionLines(lines, normLines, 'keywords', 'stile');
  const rows = [];
  const HEADERS = ['Pagina', 'Keyword Principale', 'Keyword Secondarie'];

  let dataStart = 0;
  const foundH = [];
  for (let i = 0; i < section.length; i++) {
    const norm = normalizeLine(section[i]).toLowerCase();
    if (!foundH.includes('pagina')     && norm === 'pagina')               foundH.push('pagina');
    if (!foundH.includes('principale') && /keyword principale/i.test(norm)) foundH.push('principale');
    if (!foundH.includes('secondarie') && /keyword secondarie/i.test(norm)) foundH.push('secondarie');
    if (foundH.length === 3) { dataStart = i + 1; break; }
  }

  if (dataStart === 0 && section.length > 0) {
    const first = section.findIndex(l => !HEADERS.includes(l) && l.length > 0);
    if (first >= 0) dataStart = first;
  }

  const dataLines = section.slice(dataStart).filter(l =>
    !l.startsWith('Nota:') && l.length > 0 && !HEADERS.includes(l)
  );

  for (let i = 0; i + 2 < dataLines.length; i += 3) {
    const pagina       = dataLines[i];
    const kwPrincipale = dataLines[i + 1];
    const kwSecondarie = dataLines[i + 2];
    if (pagina.startsWith('Nota:') || pagina.length > 80) break;
    rows.push({
      pagina:            pagina.replace(/\*(stimate?)\*/g, '').trim(),
      keywordPrincipale: kwPrincipale.replace(/\*(stimate?)\*/g, '').trim(),
      keywordSecondarie: kwSecondarie.replace(/\*(stimate?)\*/g, '').trim()
    });
  }
  return { rows };
}

/* ---- STILE ---- */
function extractStile(lines, normLines) {
  const section = getSectionLines(lines, normLines, 'stile', null);
  const moodVisivo = extractNextParagraph(section, section.map(normalizeLine), 'Mood Visivo');

  const palette = extractVerticalTableAs(section, ['Ruolo', 'Nome', 'HEX', 'Uso'],
    cols => {
      if (!cols[2]) return null;
      const hexMatch = cols[2].match(/#[0-9A-Fa-f]{3,6}/);
      if (!hexMatch) return null;
      return { ruolo: cols[0], nome: cols[1], hex: hexMatch[0], uso: cols[3] || '' };
    }
  );

  const tipografia = extractVerticalTableAs(section, ['Ruolo', 'Font', 'Motivazione'],
    cols => ({ ruolo: cols[0], font: cols[1], motivazione: cols[2] || '' })
  );

  const templateQuery = extractBulletList(section, 'Parole Chiave per Ricerca Template');
  return { moodVisivo, palette, tipografia, templateQuery };
}

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

function getSectionLines(lines, normLines, from, to) {
  const fromAnchor = SECTION_ANCHORS[from];
  const fromNum    = SECTION_NUM_ANCHORS[from];
  const toAnchor   = to ? SECTION_ANCHORS[to]   : null;
  const toNum      = to ? SECTION_NUM_ANCHORS[to] : null;

  let start = -1, end = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const raw  = lines[i]   || '';
    const norm = (normLines && normLines[i]) ? normLines[i] : normalizeLine(raw);

    if (start === -1) {
      if ((fromAnchor && (fromAnchor.test(raw) || fromAnchor.test(norm))) ||
          (fromNum    && (fromNum.test(raw)    || fromNum.test(norm)))) {
        start = i + 1;
        continue;
      }
    } else {
      if (to && ((toAnchor && (toAnchor.test(raw) || toAnchor.test(norm))) ||
                 (toNum    && (toNum.test(raw)    || toNum.test(norm))))) {
        end = i;
        break;
      }
    }
  }
  if (start === -1) return [];
  return lines.slice(start, end);
}

function extractNextParagraph(lines, normLines, label) {
  const labelNorm = label.toLowerCase();
  const idx = lines.findIndex((l, i) => {
    const n = (normLines && normLines[i]) ? normLines[i].toLowerCase() : normalizeLine(l).toLowerCase();
    return n === labelNorm || n.startsWith(labelNorm) || l === label || l.startsWith(label);
  });
  if (idx === -1) return '';
  const result = [];
  let i = idx + 1;
  while (i < lines.length) {
    const l = lines[i];
    if (/^[A-ZÀÈÌÒÙ][A-ZÀÈÌÒÙ\s&\/]+$/.test(l) && l.length < 60) break;
    if (/^\d+[\.\)]/.test(l)) break;
    if (/^[*•\->]/.test(l)) break;
    result.push(l);
    i++;
    if (result.length >= 6) break;
  }
  return result.join(' ');
}

function extractNextLine(lines, label) {
  const idx = lines.findIndex(l => l === label || l.includes(label));
  if (idx === -1 || idx + 1 >= lines.length) return '';
  return lines[idx + 1];
}

function extractBulletList(lines, label) {
  const idx = lines.findIndex(l => l.includes(label));
  if (idx === -1) return [];
  const result = [];
  let i = idx + 1;
  while (i < lines.length && /^[*•\-]/.test(lines[i])) {
    result.push(lines[i].replace(/^[*•\-]\s*/, ''));
    i++;
  }
  return result;
}

function extractArrowList(lines, label) {
  const idx = lines.findIndex(l => l.includes(label));
  if (idx === -1) return [];
  const result = [];
  let i = idx + 1;
  while (i < lines.length && (lines[i].startsWith('->') || lines[i].startsWith('→'))) {
    result.push(lines[i].replace(/^[-→>]+\s*/, '').replace(/^"/, '').replace(/"$/, ''));
    i++;
  }
  return result;
}

function extractVerticalTable(lines, skipHeaders) {
  const rows = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const key = lines[i], val = lines[i + 1];
    if (skipHeaders.includes(key) || skipHeaders.includes(val)) continue;
    if (/^[-|]+$/.test(key)) continue;
    rows.push({ key, value: val });
  }
  return rows;
}

function extractVerticalTableAs(lines, headers, transform) {
  const result = [];
  const n = headers.length;
  let dataStart = 0;

  for (let i = 0; i <= lines.length - n; i++) {
    const window = lines.slice(i, i + n);
    if (headers.every((h, j) => window[j] === h || window[j].toLowerCase() === h.toLowerCase())) {
      dataStart = i + n;
      break;
    }
  }

  const dataLines = lines.slice(dataStart);
  for (let i = 0; i + n <= dataLines.length; i += n) {
    const cols = dataLines.slice(i, i + n);
    if (headers.includes(cols[0])) break;
    if (/^\d+[\.\)]/.test(cols[0])) break;
    if (cols[0].length === 0) continue;
    const obj = transform(cols);
    if (obj) result.push(obj);
  }
  return result;
}
