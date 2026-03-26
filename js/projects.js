/* =========================================
   EVOLVE PROJECT MANAGER — projects.js
   CRUD Progetti
   ========================================= */

function generateId(prefix) {
  return prefix + '_' + Date.now();
}

function getAllProjects() {
  return storageGet().projects || [];
}

function getProject(id) {
  return getAllProjects().find(p => p.id === id) || null;
}

function createProject({ name, type, briefRaw, briefFilename, logoDataUrl }) {
  const now = new Date().toISOString();
  const parsed = parseBrief(briefRaw);
  const project = {
    id: generateId('proj'),
    name,
    type,
    createdAt: now,
    updatedAt: now,
    brief: { raw: briefRaw, parsed, filename: briefFilename || 'brief.txt', uploadedAt: now },
    access: { wpUrl: '', username: '', password: '', notes: '' },
    checklist: {},
    assets: { links: [], briefUpdates: '', notes: '' },
    revisions: [],
    logoDataUrl: logoDataUrl || null
  };
  const data = storageGet();
  data.projects.unshift(project);
  storageSet(data);
  return project;
}

function deleteProject(id) {
  const data = storageGet();
  data.projects = data.projects.filter(p => p.id !== id);
  storageSet(data);
}

function updateChecklist(projectId, itemId, done) {
  const data = storageGet();
  const p = data.projects.find(p => p.id === projectId);
  if (!p) return;
  p.checklist[itemId] = done;
  p.updatedAt = new Date().toISOString();
  storageSet(data);
}

function resetChecklist(projectId) {
  const data = storageGet();
  const p = data.projects.find(p => p.id === projectId);
  if (!p) return;
  p.checklist = {};
  p.updatedAt = new Date().toISOString();
  storageSet(data);
}

function updateAccess(projectId, accessData) {
  const data = storageGet();
  const p = data.projects.find(p => p.id === projectId);
  if (!p) return;
  p.access = { ...p.access, ...accessData };
  p.updatedAt = new Date().toISOString();
  storageSet(data);
}

function addAssetLink(projectId, label, url) {
  const data = storageGet();
  const p = data.projects.find(p => p.id === projectId);
  if (!p) return;
  p.assets.links.push({ id: generateId('lnk'), label, url, createdAt: new Date().toISOString() });
  p.updatedAt = new Date().toISOString();
  storageSet(data);
}

function deleteAssetLink(projectId, linkId) {
  const data = storageGet();
  const p = data.projects.find(p => p.id === projectId);
  if (!p) return;
  p.assets.links = p.assets.links.filter(l => l.id !== linkId);
  p.updatedAt = new Date().toISOString();
  storageSet(data);
}

function updateAssets(projectId, { briefUpdates, notes }) {
  const data = storageGet();
  const p = data.projects.find(p => p.id === projectId);
  if (!p) return;
  if (briefUpdates !== undefined) p.assets.briefUpdates = briefUpdates;
  if (notes !== undefined) p.assets.notes = notes;
  p.updatedAt = new Date().toISOString();
  storageSet(data);
}

function addRevisionRound(projectId, rawText, filename) {
  const sections = parseRevision(rawText);
  if (sections.parseError) return sections;
  const data = storageGet();
  const p = data.projects.find(p => p.id === projectId);
  if (!p) return null;
  const round = {
    id: generateId('rev'),
    round: p.revisions.length + 1,
    filename: filename || 'revisioni.txt',
    uploadedAt: new Date().toISOString(),
    sections
  };
  p.revisions.push(round);
  p.updatedAt = new Date().toISOString();
  storageSet(data);
  return round;
}

function toggleRevisionItem(projectId, roundId, itemId) {
  const data = storageGet();
  const p = data.projects.find(p => p.id === projectId);
  if (!p) return;
  const round = p.revisions.find(r => r.id === roundId);
  if (!round) return;
  for (const section of round.sections) {
    const item = section.items.find(i => i.id === itemId);
    if (item) { item.done = !item.done; break; }
  }
  p.updatedAt = new Date().toISOString();
  storageSet(data);
}

function replaceBrief(projectId, rawText, parsedData, filename) {
  const data = storageGet();
  const p = data.projects.find(p => p.id === projectId);
  if (!p) return;
  p.brief = {
    raw: rawText,
    parsed: parsedData || parseBrief(rawText),
    filename: filename || 'brief.txt',
    uploadedAt: new Date().toISOString()
  };
  p.updatedAt = new Date().toISOString();
  storageSet(data);
}

function getChecklistProgress(project) {
  let total = 0, done = 0;
  PHASES.forEach(phase => phase.groups.forEach(group => group.items.forEach(item => {
    total++;
    if (project.checklist[item.id]) done++;
  })));
  return { total, done, pct: total === 0 ? 0 : Math.round(done / total * 100) };
}

function updateProjectLogo(projectId, logoDataUrl) {
  const data = storageGet();
  const p = data.projects.find(p => p.id === projectId);
  if (!p) return;
  p.logoDataUrl = logoDataUrl;
  p.updatedAt = new Date().toISOString();
  storageSet(data);
}
