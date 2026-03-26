/* =========================================
   EVOLVE PROJECT MANAGER — router.js v2
   ========================================= */

let currentProjectId = null;

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = location.hash || '#dashboard';
  const parts = hash.replace('#', '').split('/');
  const view  = parts[0];

  if (view === 'project' && parts[1]) {
    const projectId = parts[1];
    const tab = parts[2] || 'brief';
    showProjectView(projectId, tab);
  } else {
    showDashboardView();
  }
}

function navigateTo(hash) {
  location.hash = hash;
}

/* ---- DASHBOARD ---- */
function showDashboardView() {
  currentProjectId = null;
  document.getElementById('view-dashboard').hidden = false;
  document.getElementById('view-project').hidden = true;
  renderDashboard();
}

/* ---- PROJECT ---- */
function showProjectView(projectId, tab) {
  const project = getProject(projectId);
  if (!project) { navigateTo('#dashboard'); return; }

  currentProjectId = projectId;
  document.getElementById('view-dashboard').hidden = true;
  document.getElementById('view-project').hidden = false;

  updateClientHeader(project);
  activateTab(tab || 'brief', project);
}

function updateClientHeader(project) {
  const parsed = project.brief?.parsed;
  const f = parsed?.scheda?.fields || {};
  const typeLabel = { wordpress: 'WordPress', ecommerce: 'E-commerce', landing: 'Landing Page' }[project.type] || project.type;

  document.getElementById('client-name-header').textContent   = project.name;
  document.getElementById('client-type-badge').textContent    = typeLabel;
  document.getElementById('client-domain-header').textContent = f['Dominio'] || '';

  // Logo avatar in client header
  const avatarEl = document.getElementById('client-logo-avatar');
  const avatarPh = document.getElementById('client-logo-avatar-ph');
  if (avatarEl) {
    let existingImg = avatarEl.querySelector('img');
    if (project.logoDataUrl) {
      if (!existingImg) {
        existingImg = document.createElement('img');
        existingImg.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:3px;';
        avatarEl.appendChild(existingImg);
      }
      existingImg.src = project.logoDataUrl;
      existingImg.alt = project.name;
      if (avatarPh) avatarPh.style.display = 'none';
    } else {
      if (existingImg) existingImg.remove();
      if (avatarPh) {
        avatarPh.style.display = '';
        avatarPh.textContent = project.name.charAt(0).toUpperCase();
      }
    }
  }

  const telEl   = document.getElementById('client-tel-header');
  const emailEl = document.getElementById('client-email-header');
  const wpEl    = document.getElementById('client-wp-header');

  if (f['Telefono']) {
    telEl.textContent = '📞 ' + f['Telefono'];
    telEl.href = 'tel:' + f['Telefono'].replace(/\s/g, '');
    telEl.hidden = false;
  } else { telEl.hidden = true; }

  if (f['Email']) {
    emailEl.textContent = '✉ ' + f['Email'];
    emailEl.href = 'mailto:' + f['Email'];
    emailEl.hidden = false;
  } else { emailEl.hidden = true; }

  if (project.access?.wpUrl) {
    wpEl.href = project.access.wpUrl;
    wpEl.hidden = false;
  } else { wpEl.hidden = true; }
}

/* ---- TAB ACTIVATION ---- */
function activateTab(tabId, project) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => panel.hidden = true);
  const panel = document.getElementById('tab-' + tabId);
  if (panel) panel.hidden = false;

  switch (tabId) {
    case 'brief':      renderBrief(project);     break;
    case 'access':     renderAccess(project);    break;
    case 'checklist':  renderChecklist(project); break;
    case 'assets':     renderAssets(project);    break;
    case 'revisions':  renderRevisions(project); break;
  }
}
