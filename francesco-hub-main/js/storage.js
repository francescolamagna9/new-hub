/* =============================================
   EVOLVE PROJECT MANAGER — storage.js
   Unico punto di accesso a localStorage
   ============================================= */

const STORAGE_KEY = 'evolve_pm_v1';

function storageGet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { projects: [] };
  } catch(e) {
    console.error('storageGet error:', e);
    return { projects: [] };
  }
}

function storageSet(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch(e) {
    console.error('storageSet error:', e);
    return false;
  }
}

function storageGetRaw() {
  return localStorage.getItem(STORAGE_KEY) || '{"projects":[]}';
}

function storageSetRaw(raw) {
  localStorage.setItem(STORAGE_KEY, raw);
}
