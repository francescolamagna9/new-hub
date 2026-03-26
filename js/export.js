/* =============================================
   EVOLVE PROJECT MANAGER — export.js
   Export JSON backup + Import JSON
   ============================================= */

function exportBackup() {
  const data = storageGetRaw();
  const blob = new Blob([data], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'evolve-backup-' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup scaricato', 'success');
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.projects) throw new Error('Struttura non valida');
      if (confirm('Importare il backup? I dati attuali verranno sovrascritti.')) {
        storageSetRaw(JSON.stringify(data));
        showToast('Backup importato', 'success');
        setTimeout(() => location.reload(), 600);
      }
    } catch {
      showToast('File non valido. Assicurati di importare un backup Evolve.', 'error');
    }
  };
  reader.readAsText(file);
}
