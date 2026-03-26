/* =========================================
   EVOLVE PROJECT MANAGER — render/access.js
   Render Tab Accessi WP
   ========================================= */

let accessDebounceTimer = null;

function renderAccess(project) {
  const container = document.getElementById('access-content');
  const a = project.access || {};

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">Accessi WordPress</div>
    </div>
    <div class="brief-card">
      <div class="brief-card-title">Pannello di Amministrazione</div>

      <div class="form-group" style="margin-bottom:16px">
        <label>URL WP-Admin</label>
        <div style="display:flex;gap:8px">
          <input type="url" id="access-wp-url" value="${escHtml(a.wpUrl || '')}" placeholder="https://cliente.it/wp-admin" />
          <button class="btn btn-ghost btn-sm" id="btn-access-open" ${!a.wpUrl ? 'disabled' : ''}>Apri ↗</button>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:16px">
        <label>Username</label>
        <div style="display:flex;gap:8px">
          <input type="text" id="access-username" value="${escHtml(a.username || '')}" placeholder="admin" autocomplete="off" />
          <button class="btn btn-ghost btn-sm btn-copy" data-copy="access-username" title="Copia">⎘</button>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:16px">
        <label>Password</label>
        <div style="display:flex;gap:8px">
          <input type="password" id="access-password" value="${escHtml(a.password || '')}" placeholder="••••••••" autocomplete="new-password" />
          <button class="btn btn-ghost btn-sm btn-toggle-pw">👁</button>
          <button class="btn btn-ghost btn-sm btn-copy" data-copy="access-password" title="Copia">⎘</button>
        </div>
      </div>

      <div class="form-group">
        <label>Note Accessi</label>
        <textarea id="access-notes" placeholder="Hosting, FTP, SSH, note generali...">${escHtml(a.notes || '')}</textarea>
      </div>
    </div>
  `;

  const autoSave = () => {
    clearTimeout(accessDebounceTimer);
    accessDebounceTimer = setTimeout(() => {
      updateAccess(project.id, {
        wpUrl:    document.getElementById('access-wp-url').value,
        username: document.getElementById('access-username').value,
        password: document.getElementById('access-password').value,
        notes:    document.getElementById('access-notes').value
      });
      // Aggiorna link WP in header
      updateClientHeader(getProject(project.id));
      showToast('Salvato', 'success');
    }, 600);
  };

  ['access-wp-url','access-username','access-password','access-notes'].forEach(id =>
    document.getElementById(id).addEventListener('input', autoSave)
  );

  document.getElementById('btn-access-open').addEventListener('click', () => {
    const url = document.getElementById('access-wp-url').value;
    if (url) window.open(url, '_blank');
  });

  document.getElementById('access-wp-url').addEventListener('input', (e) => {
    document.getElementById('btn-access-open').disabled = !e.target.value;
  });

  container.querySelector('.btn-toggle-pw').addEventListener('click', () => {
    const pw = document.getElementById('access-password');
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  container.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = document.getElementById(btn.dataset.copy);
      if (el?.value) navigator.clipboard.writeText(el.value)
        .then(() => showToast('Copiato', 'success'));
    });
  });
}
