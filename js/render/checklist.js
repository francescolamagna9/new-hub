/* =========================================
   EVOLVE PROJECT MANAGER — render/checklist.js v2
   FIX: sidebar links usano scroll JS invece di href hash
   ========================================= */

function renderChecklist(project) {
  const container = document.getElementById('checklist-content');
  const checklist = project.checklist || {};
  const { total, done, pct } = getChecklistProgress(project);

  const sidebarItems = PHASES.map(phase => {
    let phaseDone = 0, phaseTotal = 0;
    phase.groups.forEach(g => g.items.forEach(item => {
      phaseTotal++;
      if (checklist[item.id]) phaseDone++;
    }));
    const phasePct = phaseTotal === 0 ? 0 : Math.round(phaseDone / phaseTotal * 100);
    return `
      <li>
        <button class="sidebar-phase-item" data-phase-target="phase-${phase.id}" id="sidebar-${phase.id}">
          <span class="sidebar-phase-name">${phase.num}. ${escHtml(phase.title)}</span>
          <span class="sidebar-phase-pct">${phasePct}%</span>
        </button>
      </li>
    `;
  }).join('');

  const phasesHtml = PHASES.map(phase => renderPhase(phase, checklist)).join('');

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">Checklist Sviluppo</div>
      <button class="btn btn-ghost btn-sm" id="btn-reset-checklist">Reset</button>
    </div>

    <div class="checklist-global-progress">
      <div class="global-progress-header">
        <span class="global-progress-label">Completamento Globale</span>
        <span class="global-progress-pct" id="global-pct-label">${pct}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct}%" id="global-progress-fill"></div>
      </div>
      <div style="font-size:0.78rem;color:var(--muted);margin-top:4px" id="global-progress-count">${done} di ${total} voci completate</div>
    </div>

    <div class="checklist-layout">
      <aside class="checklist-sidebar">
        <div class="sidebar-title">FASI</div>
        <ul class="sidebar-phases">${sidebarItems}</ul>
      </aside>
      <div class="checklist-phases" id="checklist-phases">
        ${phasesHtml}
      </div>
    </div>
  `;

  // ---- SIDEBAR: scroll to phase (NO hash change) ----
  container.querySelectorAll('.sidebar-phase-item[data-phase-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.phaseTarget;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        // Offset for sticky headers (client-header 58px + nav-bar 44px + small gap)
        const offset = 58 + 44 + 12;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        // Highlight active
        container.querySelectorAll('.sidebar-phase-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Bind checkboxes
  container.querySelectorAll('.checklist-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const itemId = e.target.dataset.item;
      updateChecklist(project.id, itemId, e.target.checked);
      e.target.closest('.checklist-item').classList.toggle('done', e.target.checked);
      updateChecklistProgressUI(project.id);
    });
  });

  // Groups collapsible
  container.querySelectorAll('.group-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.group-block').classList.toggle('open');
    });
  });

  // Reset
  document.getElementById('btn-reset-checklist').addEventListener('click', () => {
    if (confirm('Resettare tutta la checklist? Le spunte verranno rimosse.')) {
      resetChecklist(project.id);
      renderChecklist(getProject(project.id));
      showToast('Checklist resettata', 'info');
    }
  });

  // Intersection Observer: highlight sidebar item as user scrolls
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const phaseId = entry.target.id.replace('phase-', '');
        container.querySelectorAll('.sidebar-phase-item').forEach(b => b.classList.remove('active'));
        const sidebarBtn = container.querySelector(`[data-phase-target="phase-${phaseId}"]`);
        if (sidebarBtn) sidebarBtn.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  document.querySelectorAll('.phase-block').forEach(block => observer.observe(block));
}

function renderPhase(phase, checklist) {
  let phaseDone = 0, phaseTotal = 0;
  phase.groups.forEach(g => g.items.forEach(item => {
    phaseTotal++;
    if (checklist[item.id]) phaseDone++;
  }));
  const phasePct = phaseTotal === 0 ? 0 : Math.round(phaseDone / phaseTotal * 100);
  const groupsHtml = phase.groups.map(group => renderGroup(group, checklist)).join('');

  return `
    <div class="phase-block" id="phase-${phase.id}">
      <div class="phase-header">
        <span class="phase-number">${escHtml(phase.num)}</span>
        <span class="phase-name">${escHtml(phase.title)}</span>
        <span class="phase-pct" id="phasepct-${phase.id}">${phasePct}%</span>
      </div>
      <div class="phase-progress-bar">
        <div class="phase-progress-fill" id="phasefill-${phase.id}" style="width:${phasePct}%"></div>
      </div>
      ${groupsHtml}
    </div>
  `;
}

function renderGroup(group, checklist) {
  const itemsHtml = group.items.map(item => renderChecklistItem(item, checklist)).join('');
  const doneCount = group.items.filter(i => checklist[i.id]).length;

  return `
    <div class="group-block open" id="group-${group.id}">
      <div class="group-header">
        <span class="group-name">${escHtml(group.title)}</span>
        <span class="group-count" id="groupcount-${group.id}">${doneCount}/${group.items.length}</span>
        <span class="group-chevron">▼</span>
      </div>
      <div class="group-body">
        ${itemsHtml}
      </div>
    </div>
  `;
}

function renderChecklistItem(item, checklist) {
  const isDone = !!checklist[item.id];
  const tags = item.tags || [];
  const tagsHtml = tags.map(t => `<span class="tag tag-${t}">${t === 'critico' ? 'CRITICO' : t === 'warn' ? 'ATTENZIONE' : 'SEO'}</span>`).join('');
  const noteText = item.note || item.nota || '';
  const noteHtml = noteText ? `<div class="checklist-note">${escHtml(noteText)}</div>` : '';

  return `
    <div class="checklist-item${isDone ? ' done' : ''}">
      <input type="checkbox" class="checklist-checkbox" data-item="${item.id}" ${isDone ? 'checked' : ''} />
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap">
          <span class="checklist-text">${escHtml(item.text)}</span>
          ${tags.length ? `<div class="checklist-tags">${tagsHtml}</div>` : ''}
        </div>
        ${noteHtml}
      </div>
    </div>
  `;
}

function updateChecklistProgressUI(projectId) {
  const project = getProject(projectId);
  const { total, done, pct } = getChecklistProgress(project);

  const fill = document.getElementById('global-progress-fill');
  if (fill) fill.style.width = pct + '%';
  const pctLabel = document.getElementById('global-pct-label');
  if (pctLabel) pctLabel.textContent = pct + '%';
  const countLabel = document.getElementById('global-progress-count');
  if (countLabel) countLabel.textContent = `${done} di ${total} voci completate`;

  PHASES.forEach(phase => {
    let phaseDone = 0, phaseTotal = 0;
    phase.groups.forEach(g => g.items.forEach(item => {
      phaseTotal++;
      if (project.checklist[item.id]) phaseDone++;
    }));
    const phasePct = phaseTotal === 0 ? 0 : Math.round(phaseDone / phaseTotal * 100);

    const sidebarPct = document.querySelector(`[data-phase-target="phase-${phase.id}"] .sidebar-phase-pct`);
    if (sidebarPct) sidebarPct.textContent = phasePct + '%';

    const phasePctEl = document.getElementById('phasepct-' + phase.id);
    if (phasePctEl) phasePctEl.textContent = phasePct + '%';

    const phaseFill = document.getElementById('phasefill-' + phase.id);
    if (phaseFill) phaseFill.style.width = phasePct + '%';

    phase.groups.forEach(group => {
      const doneCount = group.items.filter(i => project.checklist[i.id]).length;
      const countEl = document.getElementById('groupcount-' + group.id);
      if (countEl) countEl.textContent = `${doneCount}/${group.items.length}`;
    });
  });
}
