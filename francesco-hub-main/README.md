# Evolve Project Manager

Gestionale statico per la gestione di progetti web in agenzia.

## Stack
- HTML + CSS + Vanilla JS (ES6+)
- Zero dipendenze — nessun npm, nessun framework
- Font: Syne + DM Sans (Google Fonts)
- Storage: localStorage (`evolve_pm_v1`)
- Deploy: GitHub Pages

## Struttura
```
index.html
css/   app.css · project.css · brief.css · checklist.css
js/
  data/    checklist-phases.js · brief-parser.js · revision-parser.js
  render/  dashboard.js · brief.js · access.js · checklist.js · assets.js · revisions.js
  storage.js · projects.js · export.js · router.js · app.js
assets/  logo-evolve.svg · favicon.ico
```

## Come usare

1. Apri `index.html` nel browser (o deploya su GitHub Pages)
2. Crea un nuovo progetto caricando il Project Bible `.txt`
3. Inserisci accessi WP nella tab Accessi
4. Spunta la checklist di sviluppo (10 fasi)
5. Aggiungi link Drive, note e revisioni
6. Esporta il backup JSON regolarmente

## Formato Project Bible
Il file `.txt` deve seguire la struttura del `PROMPT_BRIEF_ARRICCHITO`:
```
PROJECT BIBLE
[Nome Cliente]
[Tipo Sito] . [Dominio]
Data: [data]

1. Scheda Progetto
...
2. Posizionamento & Brand
...
3. Target & Personas
...
4. Struttura Sito
...
5. Keyword Map
...
6. Indicazioni Stile
...
```

## Formato Revisioni
```
[GENERALE]
Voce revisione uno
Voce revisione due

[HOME > HERO]
Inserire +39 nel link del telefono
```

## Note
- Password salvata in chiaro nel localStorage — solo uso locale
- Backup JSON: esportare dopo ogni progetto completato
- Per aggiornare la checklist: modificare solo `js/data/checklist-phases.js`

---
*Evolve — uso interno v2.0*
