/**
 * POINT D'ENTRÉE PRINCIPAL — APPLICATION SME MARSA MAROC (PORT D'AGADIR)
 * Initialisation de la base de stockage, moteur de simulation et routage.
 */

import { DB } from './storage/db.js';
import { SimEngine } from './simulation/engine.js';
import { AlarmEngine } from './alertes/alarm-engine.js';
import { Topbar } from './ui/topbar.js';
import { Router } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialisation de la couche de stockage (localStorage)
  DB.init();

  // 2. Initialisation du moteur de simulation temps réel (vitesse x1 par défaut)
  SimEngine.init();

  // 3. Surveillance cyclique des alertes (dépassements seuils, pannes)
  setInterval(() => {
    const postes = DB.get(DB.keys.POSTES, []);
    AlarmEngine.checkAll(postes, SimEngine.latestReadings);
  }, 2000);

  // 4. Rendu de la barre supérieure (bandeau permanent, horloge, contrôles)
  const topbarContainer = document.getElementById('topbar-container');
  if (topbarContainer) {
    Topbar.render(topbarContainer);
  }

  // 5. Initialisation du routeur par hash (#/dashboard, #/postes, etc.)
  const sidebarContainer = document.getElementById('sidebar-container');
  const contentContainer = document.getElementById('content-container');
  if (sidebarContainer && contentContainer) {
    Router.init(sidebarContainer, contentContainer);
  }
});
