/* =========================================
   EVOLVE PROJECT MANAGER — render/brief.js v3
   Render UI Brief (6 tab interne)

   MIGLIORAMENTI v3:
   - Fallback UI: mostra info diagnostica sezioni trovate/mancanti
   - Pulsante "Sostituisci Brief" presente anche in stato di errore
   - Badge sezioni trovate in header
   - Indicatore di parsing parziale (alcune sezioni ok, altre no)
   ========================================= */

function renderBrief(project) {
  window._currentBriefRaw = project.brief?.raw || '';
  const container = document.getElementById('brief-content');
  const parsed = project.brief?.parsed;

  /* ---- FALLBACK: parseError completo o brief assente ---- */
  if (!parsed || parsed.parseError) {
    container.innerHTML = `
      <div class="brief-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div class="brief-card-title" style="margin:0">⚠️ Formato Brief non riconosciuto</div>
          <button class="btn btn-ghost btn-sm" id="btn-replace-brief-fallback">Sostituisci Brief</button>
        </div>
        <p style="font-size:0.85rem;color:var(--muted);margin-bottom:16px;line-height:1.6">
          Il file caricato non è stato riconosciuto dal parser.<br>
          Assicurati che sia un <strong style="color:var(--text)">.txt</strong> generato dal template Claude/AI con le sezioni:
          <strong style="color:var(--accent)">1. Scheda Progetto, 2. Brand, 3. Target, 4. Struttura, 5. Keyword Map, 6. Stile</strong>.
        </p>
        <pre class="brief-raw-fallback">${escHtml(project.brief?.raw || 'Nessun brief caricato.')}</pre>
      </div>`;

    document.getElementById('btn-replace-brief-fallback')?.addEventListener('click', () => {
      triggerBriefReplace(project);
    });
    return;
  }

  /* ---- HEADER con badge sezioni trovate ---- */
  const found   = parsed._sectionsFound || [];
  const allKeys = ['scheda','brand','target','struttura','keywords','stile'];
  const missing = allKeys.filter(k => !found.includes(k));
  const isPartial = missing.length > 0 && missing.length < allKeys.length;

  const warningBadge = isPartial
    ? `<span style="font-size:0.75rem;background:var(--warn);color:#fff;padding:2px 8px;border-radius:20px;margin-left:8px">
         ${missing.length} sezione${missing.length > 1 ? 'i' : ''} mancante${missing.length > 1 ? 'i' : ''}
       </span>`
    : '';

  container.innerHTML = `
    <div class="section-header">
      <div>
        <div class="section-title">Project Brief ${warningBadge}</div>
        <div class="text-muted" style="font-size:0.8rem;margin-top:4px">
          ${escHtml(project.brief?.filename || '')} — ${formatDate(project.brief?.uploadedAt)}
          ${found.length > 0 ? `<span style="color:var(--success);margin-left:8px">✓ ${found.length}/${allKeys.length} sezioni</span>` : ''}
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" id="btn-replace-brief">Sostituisci Brief</button>
    </div>

    ${isPartial ? `
    <div style="background:var(--surface2);border:1px solid var(--warn);border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:0.82rem;color:var(--muted)">
      ⚠️ Sezioni non trovate: <strong style="color:var(--text)">${missing.join(', ')}</strong>.
      Il file potrebbe avere intestazioni diverse da quelle attese. Le tab corrispondenti mostreranno un messaggio di avviso.
    </div>` : ''}

    <nav class="inner-tab-nav" id="brief-inner-nav">
      <button class="inner-tab-btn active" data-btab="scheda">Scheda</button>
      <button class="inner-tab-btn" data-btab="brand">Brand</button>
      <button class="inner-tab-btn" data-btab="target">Target</button>
      <button class="inner-tab-btn" data-btab="struttura">Struttura</button>
      <button class="inner-tab-btn" data-btab="keywords">Keywords</button>
      <button class="inner-tab-btn" data-btab="stile">Stile</button>
    </nav>

    <div id="brief-tab-scheda"    class="brief-inner-panel">${renderBriefScheda(parsed)}</div>
    <div id="brief-tab-brand"     class="brief-inner-panel" hidden>${renderBriefBrand(parsed)}</div>
    <div id="brief-tab-target"    class="brief-inner-panel" hidden>${renderBriefTarget(parsed)}</div>
    <div id="brief-tab-struttura" class="brief-inner-panel" hidden>${renderBriefStruttura(parsed)}</div>
    <div id="brief-tab-keywords"  class="brief-inner-panel" hidden>${renderBriefKeywords(parsed)}</div>
    <div id="brief-tab-stile"     class="brief-inner-panel" hidden>${renderBriefStile(parsed)}</div>
  `;

  // Inner tab switching
  container.querySelectorAll('[data-btab]').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-btab]').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.brief-inner-panel').forEach(p => p.hidden = true);
      btn.classList.add('active');
      container.querySelector('#brief-tab-' + btn.dataset.btab).hidden = false;
    });
  });

  // Replace brief
  document.getElementById('btn-replace-brief')?.addEventListener('click', () => {
    triggerBriefReplace(project);
  });

  // Palette copy
  container.querySelectorAll('.swatch-hex').forEach(el => {
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(el.dataset.hex || el.textContent)
        .then(() => showToast('Colore copiato', 'success'));
    });
  });

  // Struttura accordion
  container.querySelectorAll('.struttura-item-header').forEach(h => {
    h.addEventListener('click', () => h.closest('.struttura-item').classList.toggle('open'));
  });
}

/* ---- REPLACE BRIEF — funzione condivisa ---- */
function triggerBriefReplace(project) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,text/plain';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validazione
    const validationError = validateBriefFile(file);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    showToast('Analisi del brief in corso...', 'info');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed2 = parseBrief(ev.target.result);
      replaceBrief(project.id, ev.target.result, parsed2, file.name);
      const updated = getProject(project.id);
      renderBrief(updated);
      updateClientHeader(updated);

      const found = parsed2._sectionsFound || [];
      if (found.length === 6) {
        showToast('Brief aggiornato ✓ — tutte le sezioni trovate', 'success');
      } else if (found.length > 0) {
        showToast(`Brief aggiornato — ${found.length}/6 sezioni riconosciute`, 'info');
      } else {
        showToast('Brief caricato ma nessuna sezione riconosciuta', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ---- TAB: SCHEDA ---- */
function renderBriefScheda(parsed) {
  const { fields = {}, noteOperative = [] } = parsed.scheda || {};
  const fieldDefs = [
    ['Cliente (Ragione Sociale)'], ['Nome Commerciale'], ['Settore'],
    ['Tipo Sito'], ['Obiettivo Principale'], ['Dominio'], ['Partita IVA'],
    ['Indirizzo'], ['Telefono'], ['Email'], ['Facebook'], ['Instagram'],
    ['Competitor di Riferimento'], ['Titolare Trattamento Dati'],
    ['Sede Legale Titolare'], ['Email Titolare / Responsabile'],
    ['Telefono Titolare / Responsabile'], ['Data Ricezione Task']
  ];

  const fieldsHtml = fieldDefs.filter(([k]) => fields[k]).map(([k]) => {
    let val = escHtml(fields[k]);
    if (k === 'Telefono' || k === 'Telefono Titolare / Responsabile') {
      val = `<a href="tel:${fields[k].replace(/\s/g,'')}">${escHtml(fields[k])}</a>`;
    } else if (k === 'Email' || k === 'Email Titolare / Responsabile') {
      val = `<a href="mailto:${escHtml(fields[k])}">${escHtml(fields[k])}</a>`;
    } else if (k === 'Dominio') {
      const url = fields[k].startsWith('http') ? fields[k] : 'https://' + fields[k];
      val = `<a href="${escHtml(url)}" target="_blank" rel="noopener">${escHtml(fields[k])} ↗</a>`;
    } else if ((k === 'Facebook' || k === 'Instagram') && fields[k].startsWith('http')) {
      val = `<a href="${escHtml(fields[k])}" target="_blank" rel="noopener">${escHtml(fields[k])} ↗</a>`;
    }
    return `<div class="field-item">
      <span class="field-label">${escHtml(k)}</span>
      <span class="field-value">${val}</span>
    </div>`;
  }).join('');

  const notesHtml = noteOperative.length ? `
    <div class="brief-card mt-16">
      <div class="brief-card-title">Note Operative — Asset da Gestire</div>
      <ul class="note-operative-list">
        ${noteOperative.map(n => `<li class="note-operative-item">${escHtml(n)}</li>`).join('')}
      </ul>
    </div>` : '';

  if (!fieldsHtml) {
    return `<div class="brief-card">
      <div class="brief-card-title">Dati Cliente</div>
      ${renderSectionNotFound('scheda', 'Scheda Progetto')}
    </div>${notesHtml}`;
  }

  return `<div class="brief-card"><div class="brief-card-title">Dati Cliente</div>
    <div class="field-grid">${fieldsHtml}</div>
  </div>${notesHtml}`;
}

/* ---- TAB: BRAND ---- */
function renderBriefBrand(parsed) {
  const b = parsed.brand || {};
  let html = '';
  if (b.chiEIlCliente) html += `<div class="brief-card"><div class="brief-card-title">Chi è il Cliente</div><p class="brand-para">${escHtml(b.chiEIlCliente)}</p></div>`;
  if (b.propostaValore) html += `<div class="brand-proposta">${escHtml(b.propostaValore)}</div>`;
  html += `<div class="brief-card"><div class="brief-card-title">Tono di Voce</div>`;
  if (b.tonoRegistro) html += `<span class="brand-tono-label">Registro: ${escHtml(b.tonoRegistro)}</span>`;
  if (b.aggettivi?.length) html += `<div class="brief-card-title" style="margin-top:14px">Aggettivi</div><div class="chip-list">${b.aggettivi.map(a=>`<span class="chip">${escHtml(a)}</span>`).join('')}</div>`;
  if (b.frasiGiuste?.length) html += `<div class="brief-card-title" style="margin-top:14px">Tono GIUSTO</div><ul class="frasi-list">${b.frasiGiuste.map(f=>`<li class="frase-item frase-ok">${escHtml(f)}</li>`).join('')}</ul>`;
  if (b.frasiEvitare?.length) html += `<div class="brief-card-title" style="margin-top:14px">Da EVITARE</div><ul class="frasi-list">${b.frasiEvitare.map(f=>`<li class="frase-item frase-no">${escHtml(f)}</li>`).join('')}</ul>`;
  html += '</div>';
  return html || renderSectionNotFound('brand', 'Posizionamento & Brand');
}

/* ---- TAB: TARGET ---- */
function renderBriefTarget(parsed) {
  const personas = parsed.target?.personas || [];
  if (!personas.length) return renderSectionNotFound('target', 'Target & Personas');
  return `<div class="personas-grid">${personas.map(p => `
    <div class="persona-card">
      <div class="persona-card-header">${escHtml(p.nome)}</div>
      <div class="persona-fields">${Object.entries(p.fields).map(([k,v]) => `
        <div class="persona-field">
          <span class="persona-field-label">${escHtml(k)}</span>
          <span class="persona-field-value">${escHtml(v)}</span>
        </div>`).join('')}
      </div>
    </div>`).join('')}</div>`;
}

/* ---- TAB: STRUTTURA ---- */
function renderBriefStruttura(parsed) {
  const pagine = parsed.struttura?.pagine || [];
  const riepilogo = parsed.struttura?.riepilogo || [];
  if (!pagine.length) return renderSectionNotFound('struttura', 'Struttura Sito');

  const accordionHtml = `<div class="struttura-list">${pagine.map(p => `
    <div class="struttura-item">
      <div class="struttura-item-header">
        <span class="struttura-pagina-name">${escHtml(p.nome)}</span>
        ${p.keyword ? `<span class="struttura-keyword-badge">${escHtml(p.keyword)}</span>` : ''}
        <span class="struttura-chevron">▼</span>
      </div>
      <div class="struttura-item-body">
        <ul class="struttura-sezioni-list">
          ${p.sezioni.map(s => `<li class="struttura-sezioni-item">${escHtml(s)}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('')}</div>`;

  const riepilogoHtml = riepilogo.length ? `
    <div class="brief-card" style="margin-top:24px">
      <div class="brief-card-title">Riepilogo Struttura</div>
      <table class="riepilogo-table">
        ${riepilogo.map(r=>`<tr><td>${escHtml(r.key)}</td><td>${escHtml(r.value)}</td></tr>`).join('')}
      </table>
    </div>` : '';

  return `<div style="display:flex;flex-direction:column;gap:0">${accordionHtml}</div>${riepilogoHtml}`;
}

/* ---- TAB: KEYWORDS ---- */
function renderBriefKeywords(parsed) {
  const rows = parsed.keywords?.rows || [];
  if (!rows.length) {
    const rawBrief = window._currentBriefRaw || '';
    let debugHint = '';
    if (rawBrief) {
      const allLines = rawBrief.split('\n').map(l => l.trim()).filter(l => l);
      const kwIdx = allLines.findIndex(l => /keyword\s*map/i.test(l));
      if (kwIdx !== -1) {
        const snippet = allLines.slice(kwIdx, kwIdx + 12).map(l => escHtml(l)).join('<br>');
        debugHint = `
          <div style="margin-top:16px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:14px">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--warn);letter-spacing:.06em;margin-bottom:8px">⚠ Sezione trovata ma dati non parsati — prime righe:</div>
            <code style="font-size:12px;color:var(--muted);line-height:1.8">${snippet}</code>
            <div style="font-size:12px;color:var(--muted);margin-top:10px">
              Il parser si aspetta 3 righe per riga dati: <strong style="color:var(--text)">Pagina</strong>, poi <strong style="color:var(--text)">Keyword Principale</strong>, poi <strong style="color:var(--text)">Keyword Secondarie</strong> (una cella per riga).
            </div>
          </div>`;
      }
    }
    return `<div class="brief-empty">${renderSectionNotFound('keywords', 'Keyword Map')}${debugHint}</div>`;
  }
  return `<table class="keywords-table">
    <thead><tr><th>Pagina</th><th>Keyword Principale</th><th>Keyword Secondarie</th></tr></thead>
    <tbody>${rows.map(r => `
      <tr>
        <td>${escHtml(r.pagina)}</td>
        <td>${escHtml(r.keywordPrincipale)}</td>
        <td class="kw-secondary">${escHtml(r.keywordSecondarie)}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

/* ---- TAB: STILE ---- */
function renderBriefStile(parsed) {
  const s = parsed.stile || {};
  let html = '';

  if (s.moodVisivo) html += `<div class="brief-card"><div class="brief-card-title">Mood Visivo</div><p class="brand-para">${escHtml(s.moodVisivo)}</p></div>`;

  if (s.palette?.length) html += `<div class="brief-card"><div class="brief-card-title">Palette Cromatica</div>
    <div class="palette-grid">${s.palette.map(c => `
      <div class="swatch-card">
        <div class="swatch-color" style="background:${escHtml(c.hex)}"></div>
        <div class="swatch-info">
          <span class="swatch-ruolo">${escHtml(c.ruolo)}</span>
          <span class="swatch-nome">${escHtml(c.nome)}</span>
          <span class="swatch-hex" data-hex="${escHtml(c.hex)}" title="Copia HEX">${escHtml(c.hex)}</span>
        </div>
      </div>`).join('')}
    </div></div>`;

  if (s.tipografia?.length) html += `<div class="brief-card"><div class="brief-card-title">Tipografia</div>
    <ul class="tipografia-list">${s.tipografia.map(t => `
      <li class="tipografia-item">
        <span class="tipografia-ruolo">${escHtml(t.ruolo)}</span>
        <div><div class="tipografia-font">${escHtml(t.font)}</div>
        ${t.motivazione ? `<div class="tipografia-mot">${escHtml(t.motivazione)}</div>` : ''}</div>
      </li>`).join('')}
    </ul></div>`;

  if (s.templateQuery?.length) html += `<div class="brief-card"><div class="brief-card-title">Query Template</div>
    <ul class="template-list">${s.templateQuery.map(q => {
      const url = 'https://themeforest.net/search/' + encodeURIComponent(q);
      return `<li class="template-item"><a href="${url}" target="_blank" rel="noopener">${escHtml(q)} ↗</a></li>`;
    }).join('')}</ul></div>`;

  return html || renderSectionNotFound('stile', 'Indicazioni Stile');
}

/* ---- HELPER: sezione non trovata ---- */
function renderSectionNotFound(key, label) {
  return `
    <div style="padding:20px;text-align:center;color:var(--muted)">
      <div style="font-size:1.5rem;margin-bottom:8px">📄</div>
      <div style="font-weight:600;margin-bottom:6px;color:var(--text)">Sezione "${label}" non trovata</div>
      <div style="font-size:0.82rem;line-height:1.6">
        Il parser non ha trovato l'intestazione corrispondente nel file.<br>
        Usa <strong style="color:var(--accent)">Sostituisci Brief</strong> per caricare un file aggiornato.
      </div>
    </div>`;
}
