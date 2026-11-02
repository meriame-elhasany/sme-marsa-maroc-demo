/**
 * ROUTEUR CLIENT PAR HASH (#/ROUTE) — SINGLE PAGE APPLICATION
 * Aucun appel serveur, 100 % statique, compatible GitHub Pages sous sous-chemin.
 */

import { Navigation } from './ui/navigation.js';
import { ViewDashboard } from './ui/view-dashboard.js';
import { ViewPostes } from './ui/view-postes.js';
import { ViewMiseEnService } from './ui/view-mise-en-service.js';
import { ViewIPE } from './ui/view-ipe.js';
import { ViewSER } from './ui/view-ser.js';
import { ViewAlertes } from './ui/view-alertes.js';
import { ViewReporting } from './ui/view-reporting.js';
import { ViewArchitecture } from './ui/view-architecture.js';
import { ViewMetrologie } from './ui/view-metrologie.js';
import { ViewCybersecurite } from './ui/view-cybersecurite.js';
import { ViewRecette } from './ui/view-recette.js';
import { ViewPlanning } from './ui/view-planning.js';
import { ViewFormation } from './ui/view-formation.js';
import { ViewAudit } from './ui/view-audit.js';

export const Router = {
  routes: {
    '#/dashboard': ViewDashboard,
    '#/postes': ViewPostes,
    '#/mise-en-service': ViewMiseEnService,
    '#/ipe': ViewIPE,
    '#/ser': ViewSER,
    '#/alertes': ViewAlertes,
    '#/reporting': ViewReporting,
    '#/architecture': ViewArchitecture,
    '#/metrologie': ViewMetrologie,
    '#/cybersecurite': ViewCybersecurite,
    '#/recette': ViewRecette,
    '#/planning': ViewPlanning,
    '#/formation': ViewFormation,
    '#/audit': ViewAudit
  },

  currentView: null,

  init(sidebarContainer, contentContainer) {
    this.sidebarContainer = sidebarContainer;
    this.contentContainer = contentContainer;

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('auth:change', () => {
      this.handleRoute(); // Rafraîchit l'écran et la sidebar avec les nouveaux privilèges
    });

    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    } else {
      this.handleRoute();
    }
  },

  handleRoute() {
    const hash = window.location.hash || '#/dashboard';
    const view = this.routes[hash] || ViewDashboard;

    // Nettoyage de l'ancienne vue (timers, charts)
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      try {
        this.currentView.destroy();
      } catch (e) {
        console.error("Erreur destruction vue:", e);
      }
    }

    this.currentView = view;

    // Mise à jour de la barre latérale
    Navigation.render(this.sidebarContainer, hash);

    // Rendu de la vue courante
    this.contentContainer.scrollTop = 0;
    view.render(this.contentContainer);
  }
};
