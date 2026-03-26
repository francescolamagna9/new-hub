/* =========================================
   EVOLVE PROJECT MANAGER — render/revisions.js
   Render round revisioni + checklist interattiva
   ========================================= */

function renderRevisions(project) {
  const container = document.getElementById('revisions-content');
  const revisions = project.revisions || [];

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">Revisioni</div>
      <button class="btn btn-primary btn-sm" id="btn-add-round">+ Aggiungi Round</button>
    </div>
    <div class="revision-rounds" id="revision-rounds-list">
      ${revisions.length ? revisions.map(round => renderRoundCard(round, project.id)).join('') : '<div style="color:var(--muted);font-size:0.875rem;padding:20px 0">Nessuna revisione ancora. Carica il primo round.</div>'}
    </div>
  `;

  // Add round
  document.getElementById('btn-add-round').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = addRevisionRound(project.id, ev.target.result, file.name);
        if (result?.parseError) {
          showToast(result.message || 'Errore parsing revisioni', 'error');
          return;
        }
        const updated = getProject(project.id);
        renderRevisions(updated);
        showToast('Round ' + updated.revisions.length + ' aggiunto', 'success');
      };
      reader.readAsText(file);
    };
    input.click();
  });

  // Bind round toggles
  bindRoundToggles(project.id);
}

function renderRoundCard(round, projectId) {
  const sections = round.sections || [];
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
  const doneItems  = sections.reduce((acc, s) => acc + s.items.filter(i => i.done).length, 0);
  const pct = totalItems === 0 ? 0 : Math.round(doneItems / totalItems * 100);
  const isDone = pct === 100 && totalItems > 0;
  const date = formatDate(round.uploadedAt);

  return `
    <div class="round-card" id="round-${round.id}">
      <div class="round-card-header">
        <span class="round-number">Round ${round.round}</span>
        <span class="round-date">${date}</span>
        <span class="round-progress-text">${doneItems}/${totalItems}</span>
        ${isDone ? '<span class="round-badge-done">✓ Completato</span>' : ''}
        <span class="round-chevron">▼</span>
      </div>
      <div class="round-card-body">
        <div class="round-global-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%" id="round-fill-${round.id}"></div>
          </div>
        </div>
        ${renderRevisionFilters(sections, round.id)}
        <div class="rev-items-wrap" id="rev-items-${round.id}">
          ${renderRevisionItems(sections, round.id, 'all')}
        </div>
      </div>
    </div>
  `;
}

function renderRevisionFilters(sections, roundId) {
  const filters = [{ id: 'all', label: 'Tutte' }, ...sections.map(s => ({ id: s.id, label: s.label }))];
  return `
    <div class="revision-filters" id="rev-filters-${roundId}">
      ${filters.map((f, i) => `
        <button class="rev-filter-btn${i === 0 ? ' active' : ''}"
          data-filter="${f.id}" data-round="${roundId}"
          ${sections[i - 1] ? `style="color:${sections[i - 1].color};border-color:${sections[i - 1].color}"` : ''}>
          ${escHtml(f.label)}
        </button>
      `).join('')}
    </div>
  `;
}

function renderRevisionItems(sections, roundId, activeFilter) {
  if (activeFilter === 'all') {
    return sections.map(section => `
      <div class="rev-section">
        <div class="rev-section-header">
          <span class="rev-section-dot" style="background:${section.color}"></span>
          <span class="rev-section-label">${escHtml(section.label)}</span>
        </div>
        ${section.items.map(item => renderRevItem(item, section, roundId, false)).join('')}
      </div>
    `).join('');
  }

  const section = sections.find(s => s.id === activeFilter);
  if (!section) return '';
  return `
    <div class="rev-section">
      ${section.items.map(item => renderRevItem(item, section, roundId, true)).join('')}
    </div>
  `;
}

function renderRevItem(item, section, roundId, hideBadge) {
  return `
    <div class="rev-item${item.done ? ' done' : ''}" id="rev-item-${item.id}">
      ${!hideBadge ? `<span class="rev-item-badge" style="color:${section.color}">${escHtml(section.label)}</span>` : ''}
      <span class="rev-item-text">${escHtml(item.text)}</span>
      <input type="checkbox" class="checklist-checkbox rev-checkbox"
        data-item="${item.id}" data-round="${roundId}"
        ${item.done ? 'checked' : ''} style="flex-shrink:0;margin-top:2px" />
    </div>
  `;
}

function bindRoundToggles(projectId) {
  // Collapse/expand
  document.querySelectorAll('.round-card-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.classList.contains('rev-filter-btn') || e.target.classList.contains('rev-checkbox')) return;
      header.closest('.round-card').classList.toggle('open');
    });
  });

  // Filters
  document.querySelectorAll('.rev-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const roundId = btn.dataset.round;
      const filter  = btn.dataset.filter;
      const filtersEl = document.getElementById('rev-filters-' + roundId);
      filtersEl.querySelectorAll('.rev-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const project = getProject(projectId);
      const round = project.revisions.find(r => r.id === roundId);
      if (!round) return;
      document.getElementById('rev-items-' + roundId).innerHTML =
        renderRevisionItems(round.sections, roundId, filter);
      bindRevCheckboxes(projectId);
    });
  });

  bindRevCheckboxes(projectId);
}

function bindRevCheckboxes(projectId) {
  document.querySelectorAll('.rev-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      const itemId  = e.target.dataset.item;
      const roundId = e.target.dataset.round;
      toggleRevisionItem(projectId, roundId, itemId);

      // Update done class
      const itemEl = document.getElementById('rev-item-' + itemId);
      if (itemEl) itemEl.classList.toggle('done', e.target.checked);

      // Update progress bar
      const project = getProject(projectId);
      const round = project.revisions.find(r => r.id === roundId);
      if (round) {
        const totalItems = round.sections.reduce((acc, s) => acc + s.items.length, 0);
        const doneItems  = round.sections.reduce((acc, s) => acc + s.items.filter(i => i.done).length, 0);
        const pct = totalItems === 0 ? 0 : Math.round(doneItems / totalItems * 100);
        const fill = document.getElementById('round-fill-' + roundId);
        if (fill) fill.style.width = pct + '%';
      }
    });
  });
}
