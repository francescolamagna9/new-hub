/* =========================================
   EVOLVE PROJECT MANAGER — render/assets.js
   Render Tab Assets & Note
   ========================================= */

let assetsDebounceTimer = null;

function renderAssets(project) {
  const container = document.getElementById('assets-content');
  const assets = project.assets || {};
  const links = assets.links || [];

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">Assets & Note</div>
    </div>

    <div class="brief-card" style="margin-bottom:20px">
      <div class="brief-card-title">Link Utili</div>
      <div id="assets-links-list">
        ${renderLinksList(links)}
      </div>
      <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
        <input type="text" id="new-link-label" placeholder="Etichetta (es. Google Drive Media)" style="flex:1;min-width:160px" />
        <input type="url"  id="new-link-url"   placeholder="https://..." style="flex:2;min-width:200px" />
        <button class="btn btn-primary btn-sm" id="btn-add-link">+ Aggiungi</button>
      </div>
    </div>

    <div class="brief-card" style="margin-bottom:20px">
      <div class="brief-card-title">Aggiornamenti Brief</div>
      <textarea id="assets-brief-updates" placeholder="Modifiche post-brief: es. cliente ha cambiato colore primario, aggiunta pagina Blog...">${escHtml(assets.briefUpdates || '')}</textarea>
    </div>

    <div class="brief-card">
      <div class="brief-card-title">Note Generali</div>
      <textarea id="assets-notes" placeholder="Note libere sul progetto...">${escHtml(assets.notes || '')}</textarea>
    </div>
  `;

  // Add link
  document.getElementById('btn-add-link').addEventListener('click', () => {
    const label = document.getElementById('new-link-label').value.trim();
    const url   = document.getElementById('new-link-url').value.trim();
    if (!label || !url) { showToast('Inserisci etichetta e URL', 'error'); return; }
    addAssetLink(project.id, label, url);
    document.getElementById('new-link-label').value = '';
    document.getElementById('new-link-url').value = '';
    const updated = getProject(project.id);
    document.getElementById('assets-links-list').innerHTML = renderLinksList(updated.assets.links);
    bindDeleteLinks(project.id);
    showToast('Link aggiunto', 'success');
  });

  bindDeleteLinks(project.id);

  // Auto-save debounced
  const autoSave = () => {
    clearTimeout(assetsDebounceTimer);
    assetsDebounceTimer = setTimeout(() => {
      updateAssets(project.id, {
        briefUpdates: document.getElementById('assets-brief-updates').value,
        notes:        document.getElementById('assets-notes').value
      });
      showToast('Salvato', 'success');
    }, 600);
  };

  document.getElementById('assets-brief-updates').addEventListener('input', autoSave);
  document.getElementById('assets-notes').addEventListener('input', autoSave);
}

function renderLinksList(links) {
  if (!links || !links.length) {
    return '<div style="color:var(--muted);font-size:0.85rem;padding:8px 0">Nessun link aggiunto.</div>';
  }
  return `<div style="display:flex;flex-direction:column;gap:0">
    ${links.map(link => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="flex:1;min-width:0">
          <div style="font-size:0.85rem;font-weight:500;margin-bottom:2px;color:var(--text)">${escHtml(link.label)}</div>
          <a href="${escHtml(link.url)}" target="_blank" rel="noopener"
             style="font-size:0.78rem;color:var(--info);word-break:break-all">${escHtml(link.url)} ↗</a>
        </div>
        <button class="btn btn-ghost btn-icon btn-del-link" data-link="${link.id}" title="Rimuovi">✕</button>
      </div>
    `).join('')}
  </div>`;
}

function bindDeleteLinks(projectId) {
  document.querySelectorAll('.btn-del-link').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Rimuovere questo link?')) return;
      deleteAssetLink(projectId, btn.dataset.link);
      const updated = getProject(projectId);
      document.getElementById('assets-links-list').innerHTML = renderLinksList(updated.assets.links);
      bindDeleteLinks(projectId);
      showToast('Link rimosso', 'info');
    });
  });
}
