/* =========================================
   EVOLVE PROJECT MANAGER — app.js v3

   MIGLIORAMENTI v3:
   - Validazione file brief (tipo, dimensione) prima del parsing
   - Toast "Analisi in corso..." durante il caricamento
   - Toast finale con conteggio sezioni trovate
   - Validazione logo migliorata con feedback specifico
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  bindGlobalEvents();
});

function bindGlobalEvents() {
  const modalNewProject = document.getElementById('modal-new-project');
  let selectedBriefFile = null;
  let selectedLogoDataUrl = null;
  let selectedLogoFilename = null;

  /* ---- LOGO UPLOAD ---- */
  const logoInput = document.getElementById('input-logo-file');
  const logoBox   = document.getElementById('logo-preview-box');
  const logoImg   = document.getElementById('logo-preview-img');
  const logoPh    = document.getElementById('logo-preview-ph');
  const logoName  = document.getElementById('logo-upload-filename');
  const btnPick   = document.getElementById('btn-pick-logo');
  const btnRemove = document.getElementById('btn-remove-logo');

  function setLogo(dataUrl, filename) {
    selectedLogoDataUrl  = dataUrl;
    selectedLogoFilename = filename;
    logoImg.src          = dataUrl;
    logoImg.style.display = '';
    logoPh.style.display  = 'none';
    logoName.textContent  = '✓ ' + filename;
    logoName.style.display = '';
    btnRemove.style.display = '';
  }

  function clearLogo() {
    selectedLogoDataUrl  = null;
    selectedLogoFilename = null;
    logoImg.src          = '';
    logoImg.style.display  = 'none';
    logoPh.style.display   = '';
    logoName.style.display = 'none';
    btnRemove.style.display = 'none';
  }

  logoBox.addEventListener('click',    () => logoInput.click());
  btnPick.addEventListener('click',    () => logoInput.click());
  btnRemove.addEventListener('click',  (e) => { e.stopPropagation(); clearLogo(); });

  logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg','image/png','image/svg+xml','image/gif','image/webp'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|svg|gif|webp)$/i)) {
      showToast('Formato logo non supportato (usa JPG, PNG, SVG)', 'error');
      e.target.value = ''; return;
    }
    if (file.size > 600 * 1024) {
      showToast('Logo troppo grande (max 600KB)', 'error');
      e.target.value = ''; return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result, file.name);
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  /* ---- NUOVO PROGETTO ---- */
  function openNewProjectModal() {
    selectedBriefFile = null;
    clearLogo();
    document.getElementById('input-client-name').value  = '';
    document.getElementById('input-project-type').value = 'wordpress';
    document.getElementById('file-drop-text').textContent = 'Trascina il file qui oppure clicca per selezionare';
    document.getElementById('file-drop-zone').classList.remove('has-file');
    modalNewProject.hidden = false;
    setTimeout(() => document.getElementById('input-client-name').focus(), 50);
  }

  function closeNewProjectModal() {
    modalNewProject.hidden = true;
    selectedBriefFile      = null;
    clearLogo();
  }

  document.getElementById('btn-new-project').addEventListener('click', openNewProjectModal);
  document.getElementById('btn-new-project-empty')?.addEventListener('click', openNewProjectModal);
  document.getElementById('btn-modal-close').addEventListener('click', closeNewProjectModal);
  document.getElementById('btn-modal-cancel').addEventListener('click', closeNewProjectModal);
  modalNewProject.addEventListener('click', (e) => {
    if (e.target === modalNewProject) closeNewProjectModal();
  });

  /* ---- FILE DROP ZONE ---- */
  const dropZone  = document.getElementById('file-drop-zone');
  const fileInput = document.getElementById('input-brief-file');

  dropZone.addEventListener('click',    () => fileInput.click());
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) setSelectedBriefFile(file);
  });
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) setSelectedBriefFile(file);
    e.target.value = '';
  });

  function setSelectedBriefFile(file) {
    // Valida subito al momento della selezione
    const err = validateBriefFile(file);
    if (err) {
      showToast(err, 'error');
      return;
    }
    selectedBriefFile = file;
    document.getElementById('file-drop-text').textContent = '✓ ' + file.name;
    document.getElementById('file-drop-zone').classList.add('has-file');
    document.getElementById('file-drop-zone').classList.remove('drag-over');
  }

  /* ---- CREATE PROJECT ---- */
  document.getElementById('btn-modal-confirm').addEventListener('click', () => {
    const name = document.getElementById('input-client-name').value.trim();
    const type = document.getElementById('input-project-type').value;

    if (!name) {
      showToast('Inserisci il nome del cliente', 'error');
      document.getElementById('input-client-name').focus(); return;
    }
    if (!selectedBriefFile) {
      showToast('Carica il file Project Bible (.txt)', 'error'); return;
    }

    showToast('Analisi del brief in corso...', 'info');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const project = createProject({
        name, type,
        briefRaw:      ev.target.result,
        briefFilename: selectedBriefFile.name,
        logoDataUrl:   selectedLogoDataUrl
      });
      closeNewProjectModal();

      // Feedback intelligente sulle sezioni trovate
      const found = project.brief?.parsed?._sectionsFound || [];
      if (found.length === 6) {
        showToast('Progetto creato ✓ — tutte le sezioni trovate', 'success');
      } else if (found.length > 0) {
        showToast(`Progetto creato — ${found.length}/6 sezioni riconosciute`, 'info');
      } else {
        showToast('Progetto creato — brief non riconosciuto (formato diverso?)', 'error');
      }

      navigateTo('#project/' + project.id);
    };
    reader.readAsText(selectedBriefFile);
  });

  /* ---- TAB NAVIGATION ---- */
  document.getElementById('tab-nav').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn || !currentProjectId) return;
    const tabId   = btn.dataset.tab;
    const project = getProject(currentProjectId);
    if (project) activateTab(tabId, project);
  });

  /* ---- DELETE MODAL ---- */
  document.getElementById('btn-delete-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('btn-delete-confirm').addEventListener('click', confirmDelete);
  document.getElementById('modal-confirm-delete').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-confirm-delete')) closeDeleteModal();
  });

  /* ---- EXPORT / IMPORT ---- */
  document.getElementById('btn-export-json').addEventListener('click', exportBackup);
  document.getElementById('btn-import-json').addEventListener('click', () => {
    document.getElementById('input-import-json').click();
  });
  document.getElementById('input-import-json').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importBackup(file);
    e.target.value = '';
  });

  /* ---- KEYBOARD SHORTCUTS ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!document.getElementById('modal-new-project').hidden)    closeNewProjectModal();
      if (!document.getElementById('modal-confirm-delete').hidden) closeDeleteModal();
    }
  });
}

/* ---- TOAST ---- */
let toastTimer = null;

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast toast-' + type + ' visible';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove('visible'); }, 2800);
}

/* ---- UTILS ---- */
function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}
