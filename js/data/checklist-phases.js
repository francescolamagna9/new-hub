/* =============================================
   EVOLVE PROJECT MANAGER — checklist-phases.js
   Dati statici: 10 fasi con gruppi e voci
   ============================================= */

const PHASES = [
  {
    id: 'fase1',
    num: '01',
    title: 'Brief & Setup',
    groups: [
      {
        id: 'documento-brief',
        title: 'Documento Brief',
        items: [
          { id: 'b1',  text: 'Raccogliere logo, brand kit, colori ufficiali del cliente' },
          { id: 'b2',  text: 'Raccogliere screenshot feed Instagram e materiali social' },
          { id: 'b3',  text: 'Definire elenco completo delle pagine necessarie' },
          { id: 'b4',  text: 'Documentare email del cliente (form contatto + notifiche)', tags: ['critico'], nota: 'Da usare subito nel CF7 — mai la propria mail' },
          { id: 'b5',  text: 'Documentare numero di telefono con prefisso +39', tags: ['warn'], nota: 'Usare sempre +39 in tutti i link tel:' },
          { id: 'b6',  text: 'Raccogliere URL sito esistente e fare analisi slug via site:dominio.it su Google', tags: ['seo'] },
          { id: 'b7',  text: 'Elencare tutte le pagine indicizzate esistenti da non eliminare (o da redirezionare)' },
          { id: 'b8',  text: 'Definire slug definitivi per tutte le pagine' },
        ]
      }
    ]
  },
  {
    id: 'fase2',
    num: '02',
    title: 'Template & WordPress',
    groups: [
      {
        id: 'template-design',
        title: 'Template & Design',
        items: [
          { id: 's1',  text: 'Scegliere design e template con reference visive' },
          { id: 's2',  text: 'Scaricare template da Envato e caricare su WordPress' },
          { id: 's3',  text: 'Importare le pagine necessarie da Elementor' },
          { id: 's4',  text: 'Importare header e footer del template' },
        ]
      },
      {
        id: 'impostazioni-wp',
        title: 'Impostazioni WordPress',
        items: [
          { id: 'sw1', text: 'Impostare titolo sito e tagline' },
          { id: 'sw2', text: 'Impostare struttura permalink (es. /nome-post/)' },
          { id: 'sw3', text: 'Caricare e impostare la favicon', tags: ['warn'] },
          { id: 'sw4', text: 'Controllare tutti i campi in Aspetto → Personalizza' },
          { id: 'sw5', text: 'Verificare impostazioni di lettura (homepage statica ecc.)' },
        ]
      }
    ]
  },
  {
    id: 'fase3',
    num: '03',
    title: 'Stile Globale',
    groups: [
      {
        id: 'colori-tipografia',
        title: 'Colori & Tipografia Globale',
        items: [
          { id: 'g1',  text: 'Impostare colori globali in Elementor (primario, secondario, accento, testo, sfondo)' },
          { id: 'g2',  text: 'Impostare font globali (heading + body) in Elementor' },
          { id: 'g3',  text: 'Verificare coerenza icone (stessa famiglia/stile in tutto il sito)', tags: ['warn'] },
          { id: 'g4',  text: 'Verificare coerenza hover sui pulsanti (stile uniforme)', tags: ['warn'] },
          { id: 'g5',  text: 'Verificare coerenza animazioni/transizioni nelle sezioni' },
          { id: 'g6',  text: 'Mai usare testo giustificato — allinearlo sempre a sinistra o centrato', tags: ['critico'] },
        ]
      },
      {
        id: 'header',
        title: 'Header',
        items: [
          { id: 'gh1', text: 'Inserire logo' },
          { id: 'gh2', text: 'Impostare navigazione principale' },
          { id: 'gh3', text: 'Aggiungere CTA (pulsante prenotazione / contatto)' },
          { id: 'gh4', text: 'Inserire link telefono con prefisso +39 (tel:+39...)' },
          { id: 'gh5', text: 'Link social: apertura in nuova scheda (target="_blank")', tags: ['critico'] },
          { id: 'gh6', text: 'Verificare header su mobile (menu hamburger, logo, CTA)' },
        ]
      }
    ]
  },
  {
    id: 'fase4',
    num: '04',
    title: 'Costruzione Pagine',
    groups: [
      {
        id: 'home',
        title: 'Home',
        items: [
          { id: 'ph1', text: 'Hero: link telefono con +39, immagine sfondo non ripetuta (background-size: cover)', tags: ['warn'] },
          { id: 'ph2', text: 'Verificare che ogni sezione abbia contenuto reale (no placeholder)' },
          { id: 'ph3', text: 'Controllare padding/margin coerenti tra le sezioni' },
          { id: 'ph4', text: 'Verificare bordi indesiderati negli elementi', tags: ['warn'] },
          { id: 'ph5', text: 'Caricare foto reali e pertinenti per ogni sezione' },
        ]
      },
      {
        id: 'pagine-interne',
        title: 'Pagine Interne',
        items: [
          { id: 'po1', text: 'Costruire ogni pagina definita nel brief' },
          { id: 'po2', text: 'Ogni pagina ha un solo H1', tags: ['critico'] },
          { id: 'po3', text: 'H1 di ogni pagina include keyword principale + località (se locale)', tags: ['seo'] },
          { id: 'po4', text: 'Nessuna pagina duplicata o pagina con titolo errato' },
          { id: 'po5', text: 'Slug delle pagine corrispondono a quelli definiti nel brief' },
          { id: 'po6', text: 'Impostare redirect 301 per le pagine rimosse/rinominate', tags: ['seo'] },
        ]
      },
      {
        id: 'pagine-servizi',
        title: 'Pagine Servizi & Sottopagine',
        items: [
          { id: 'ps1', text: 'Link telefono e contatti presenti in ogni CTA di servizio' },
          { id: 'ps2', text: 'Sidebar (se presente): tutti i link di contatto collegati e funzionanti' },
          { id: 'ps3', text: 'H1 di ogni sottopagina include keyword specifica + località', tags: ['seo'] },
          { id: 'ps4', text: 'Testo non giustificato, allineato a sinistra', tags: ['critico'] },
          { id: 'ps5', text: 'Spazio adeguato tra ultima sezione e footer' },
        ]
      }
    ]
  },
  {
    id: 'fase5',
    num: '05',
    title: 'Copy & SEO',
    groups: [
      {
        id: 'copywriting',
        title: 'Copywriting',
        items: [
          { id: 'cp1', text: 'Scrivere copy con AI+prompt, sezione per sezione, pagina per pagina' },
          { id: 'cp2', text: 'Rileggere tutto il copy per coerenza e tono di voce' },
          { id: 'cp3', text: 'Nessun testo placeholder rimasto (Lorem ipsum, testi template ecc.)', tags: ['critico'] },
        ]
      },
      {
        id: 'seo-on-page',
        title: 'SEO On-Page',
        items: [
          { id: 'cs1', text: 'Creare H1 keyword per ogni pagina (nascosto con classe CSS)', tags: ['seo'] },
          { id: 'cs2', text: 'Meta title e meta description impostati per ogni pagina' },
          { id: 'cs3', text: 'Alt text sulle immagini principali' },
          { id: 'cs4', text: 'Struttura heading corretta (H1 → H2 → H3) senza salti' },
        ]
      }
    ]
  },
  {
    id: 'fase6',
    num: '06',
    title: 'Link & Navigazione',
    groups: [
      {
        id: 'menu-nav',
        title: 'Menu & Navigazione',
        items: [
          { id: 'ln1', text: 'Menu principale: tutte le voci collegate correttamente' },
          { id: 'ln2', text: 'Nessun link "#" rimasto dal template', tags: ['critico'] },
          { id: 'ln3', text: 'Link logo → homepage' },
        ]
      },
      {
        id: 'cta-contatti',
        title: 'CTA, Telefono, Email, Mappa',
        items: [
          { id: 'lc1', text: 'Tutti i link telefono usano tel:+39...', tags: ['critico'] },
          { id: 'lc2', text: 'Tutti i link email usano mailto:...' },
          { id: 'lc3', text: 'Link Google Maps apertura in nuova scheda', tags: ['warn'] },
          { id: 'lc4', text: 'Link social: apertura in nuova scheda in header e footer', tags: ['critico'] },
          { id: 'lc5', text: 'Tutti i pulsanti CTA collegati alla pagina/azione corretta' },
          { id: 'lc6', text: 'Testare ogni link cliccabile manualmente (nessun link rotto)' },
        ]
      }
    ]
  },
  {
    id: 'fase7',
    num: '07',
    title: 'Form di Contatto',
    groups: [
      {
        id: 'config-cf7',
        title: 'Configurazione CF7',
        items: [
          { id: 'fc1', text: 'Campo "A" (destinatario): email del cliente — MAI la propria', tags: ['critico'] },
          { id: 'fc2', text: 'Campo "Da": usare dominio del cliente (non prod-evolve o staging)', tags: ['critico'] },
          { id: 'fc3', text: 'Oggetto email impostato con nome sito' },
          { id: 'fc4', text: 'Tutti i campi obbligatori impostati come required', tags: ['warn'] },
          { id: 'fc5', text: 'Messaggio di errore visibile se un campo obbligatorio non è compilato', tags: ['critico'] },
          { id: 'fc6', text: 'Messaggio di conferma visibile dopo invio' },
        ]
      },
      {
        id: 'test-invio',
        title: 'Test Invio',
        items: [
          { id: 'ft1', text: 'Fare test invio con dati reali' },
          { id: 'ft2', text: 'Verificare ricezione email di notifica al cliente', tags: ['critico'] },
          { id: 'ft3', text: 'Dopo il test: sostituire propria email con email cliente in tutti i campi', tags: ['critico'] },
          { id: 'ft4', text: 'Verificare che il form funzioni anche con il dominio finale (non staging)' },
        ]
      }
    ]
  },
  {
    id: 'fase8',
    num: '08',
    title: 'Footer & Legale',
    groups: [
      {
        id: 'contenuto-footer',
        title: 'Contenuto Footer',
        items: [
          { id: 'fo1', text: 'Logo Evolve nel footer' },
          { id: 'fo2', text: 'Link social: apertura in nuova scheda', tags: ['critico'] },
          { id: 'fo3', text: 'Icone social allineate e con padding coerente', tags: ['warn'] },
          { id: 'fo4', text: 'Colori testi del footer coerenti e leggibili' },
          { id: 'fo5', text: 'Link telefono, email, mappa presenti e funzionanti' },
          { id: 'fo6', text: 'Controllo coerenza colori colonne (es. Info Utili testo bianco)' },
        ]
      },
      {
        id: 'pagine-legali',
        title: 'Pagine Legali',
        items: [
          { id: 'fl1', text: 'Creare pagina Privacy Policy' },
          { id: 'fl2', text: 'Creare pagina Cookie Policy' },
          { id: 'fl3', text: 'Creare pagina Copyright' },
          { id: 'fl4', text: 'Collegare tutte le pagine legali nel footer' },
          { id: 'fl5', text: 'Installare e configurare banner cookie (es. Cookiebot)' },
        ]
      }
    ]
  },
  {
    id: 'fase9',
    num: '09',
    title: 'Responsive',
    groups: [
      {
        id: 'tablet',
        title: 'Tablet',
        items: [
          { id: 'rt1', text: 'Verificare layout e spaziature su tablet' },
          { id: 'rt2', text: 'Nessun testo o elemento che fuoriesce dai contenitori' },
          { id: 'rt3', text: 'Immagini proporzionate' },
        ]
      },
      {
        id: 'mobile',
        title: 'Mobile',
        items: [
          { id: 'rm1', text: 'Header mobile: menu hamburger funzionante, logo visibile, CTA accessibile' },
          { id: 'rm2', text: 'Hero: testo leggibile, CTA accessibile' },
          { id: 'rm3', text: 'Padding/margin adeguati in tutte le sezioni', tags: ['warn'] },
          { id: 'rm4', text: 'Nessun testo giustificato — solo sinistro o centrato', tags: ['critico'] },
          { id: 'rm5', text: 'Spazio adeguato tra pulsanti e sezione successiva' },
          { id: 'rm6', text: 'Form di contatto: campi usabili e submit funzionante' },
          { id: 'rm7', text: 'Footer: colonne impilate correttamente, testi leggibili' },
          { id: 'rm8', text: 'Nessun overflow orizzontale nella pagina' },
          { id: 'rm9', text: 'Spazio sufficiente tra ultima sezione delle pagine interne e footer' },
        ]
      }
    ]
  },
  {
    id: 'fase10',
    num: '10',
    title: 'Pre-Consegna',
    groups: [
      {
        id: 'checklist-finale',
        title: 'Checklist Finale',
        items: [
          { id: 'pf1',  text: 'Verificare slug di tutte le pagine vs. site:dominio.it', tags: ['seo'] },
          { id: 'pf2',  text: 'Ricontrollare pagine nascoste: nessun H1 duplicato, nessuna pagina duplicata', tags: ['critico'] },
          { id: 'pf3',  text: 'Rileggere copy di tutto il sito una volta finale' },
          { id: 'pf4',  text: 'Controllare 404: tutte le pagine rispondono correttamente' },
          { id: 'pf5',  text: 'Design review completa: coerenza colori, font, spaziature, icone' },
          { id: 'pf6',  text: 'Tutte le impostazioni generali di WordPress verificate' },
          { id: 'pf7',  text: 'Favicon impostata e visibile', tags: ['warn'] },
          { id: 'pf8',  text: 'Form di contatto: email cliente impostata, test superato', tags: ['critico'] },
          { id: 'pf9',  text: 'Tutti i link social aprono in nuova scheda (header + footer)', tags: ['critico'] },
          { id: 'pf10', text: 'Tutti i link tel: hanno +39' },
          { id: 'pf11', text: 'Nessun link rotto in tutto il sito' },
          { id: 'pf12', text: 'Test su mobile reale (non solo DevTools)' },
          { id: 'pf13', text: 'Velocità pagina verificata (GTmetrix o PageSpeed Insights)' },
          { id: 'pf14', text: 'Consegnare al cliente credenziali WordPress e riepilogo lavoro' },
        ]
      }
    ]
  }
];
