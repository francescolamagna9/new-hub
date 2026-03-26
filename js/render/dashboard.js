/* =========================================
   EVOLVE PROJECT MANAGER — render/dashboard.js v2
   ========================================= */

function renderDashboard() {
  const projects = getAllProjects();
  const grid  = document.getElementById('dashboard-grid');
  const empty = document.getElementById('dashboard-empty');

  if (!projects.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.innerHTML = projects.map(p => renderProjectCard(p)).join('');

  grid.querySelectorAll('[data-open]').forEach(btn =>
    btn.addEventListener('click', () => navigateTo('#project/' + btn.dataset.open))
  );
  grid.querySelectorAll('[data-delete]').forEach(btn =>
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDeleteModal(btn.dataset.delete, btn.dataset.name);
    })
  );
}

function renderProjectCard(project) {
  const { total, done, pct } = getChecklistProgress(project);
  const typeLabel = { wordpress: 'WordPress', ecommerce: 'E-commerce', landing: 'Landing' }[project.type] || project.type;
  const domain = project.brief?.parsed?.scheda?.fields?.['Dominio'] || '';
  const date = new Date(project.createdAt).toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' });
  const logoHtml = project.logoDataUrl
    ? `<img src="${project.logoDataUrl}" alt="${escHtml(project.name)}" />`
    : `<span class="card-logo-ph">●</span>`;
  const pctColor = pct >= 80 ? 'var(--success)' : pct >= 40 ? 'var(--accent)' : 'var(--warn)';

  return `
    <div class="project-card">
      <div class="card-accent-bar type-${project.type}"></div>
      <div class="card-body">
        <div class="card-header">
          <div class="card-logo-title">
            <div class="card-logo">${logoHtml}</div>
            <div class="card-title-wrap">
              <div class="card-title">${escHtml(project.name)}</div>
              ${domain ? `<div class="card-domain">${escHtml(domain)}</div>` : ''}
            </div>
          </div>
          <span class="badge badge-${project.type}">${typeLabel}</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-label">
            <span>Checklist</span>
            <span style="color:${pctColor}">${done}/${total} — ${pct}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%;background:${pctColor}"></div>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <span class="card-date">${date}</span>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm" data-open="${project.id}">Apri →</button>
          <button class="btn btn-ghost btn-icon btn-sm" data-delete="${project.id}" data-name="${escHtml(project.name)}" title="Elimina">🗑</button>
        </div>
      </div>
    </div>`;
}

/* ---- DELETE MODAL ---- */
let pendingDeleteId = null;

function openDeleteModal(projectId, projectName) {
  pendingDeleteId = projectId;
  document.getElementById('delete-project-name').textContent = projectName;
  document.getElementById('modal-confirm-delete').hidden = false;
}

function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('modal-confirm-delete').hidden = true;
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  deleteProject(pendingDeleteId);
  closeDeleteModal();
  renderDashboard();
  showToast('Progetto eliminato', 'info');
}

/* ---- UTIL ---- */
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
