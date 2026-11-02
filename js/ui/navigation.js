/**
 * BARRE LATÉRALE DE NAVIGATION (SIDEBAR)
 * Liens vers l'ensemble des modules du SME Marsa Maroc (Hash Routing)
 */

import { DB } from '../storage/db.js';
import { Auth } from '../auth/auth.js';

export const Navigation = {
  render(container, currentHash = '#/dashboard') {
    const alerts = DB.get(DB.keys.ALERTES, []);
    const activeAlertsCount = alerts.filter(a => a.statut !== 'CLOTUREE').length;
    const user = Auth.getCurrentUser();

    container.innerHTML = `
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div class="nav-section-title">Supervision Électrique</div>
          <a href="#/dashboard" class="nav-link ${currentHash === '#/dashboard' ? 'active' : ''}">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Tableau de bord</span>
          </a>
          <a href="#/postes" class="nav-link ${currentHash === '#/postes' ? 'active' : ''}">
            <span class="nav-icon">⚡</span>
            <span class="nav-text">Postes & Mesures</span>
          </a>
          <a href="#/mise-en-service" class="nav-link ${currentHash === '#/mise-en-service' ? 'active' : ''}">
            <span class="nav-icon">🔧</span>
            <span class="nav-text">Mise en service</span>
          </a>

          <div class="nav-section-title">Performance (ISO 50001)</div>
          <a href="#/ipe" class="nav-link ${currentHash === '#/ipe' ? 'active' : ''}">
            <span class="nav-icon">📈</span>
            <span class="nav-text">Indicateurs (IPE)</span>
          </a>
          <a href="#/ser" class="nav-link ${currentHash === '#/ser' ? 'active' : ''}">
            <span class="nav-icon">🎯</span>
            <span class="nav-text">Référence (SER)</span>
          </a>
          <a href="#/alertes" class="nav-link ${currentHash === '#/alertes' ? 'active' : ''}">
            <span class="nav-icon">🚨</span>
            <span class="nav-text">Alertes & Seuils</span>
            ${activeAlertsCount > 0 ? `<span class="nav-badge danger">${activeAlertsCount}</span>` : ''}
          </a>
          <a href="#/reporting" class="nav-link ${currentHash === '#/reporting' ? 'active' : ''}">
            <span class="nav-icon">📄</span>
            <span class="nav-text">Rapports & Bilans</span>
          </a>

          <div class="nav-section-title">Ingénierie & Conformité</div>
          <a href="#/architecture" class="nav-link ${currentHash === '#/architecture' ? 'active' : ''}">
            <span class="nav-icon">🏛️</span>
            <span class="nav-text">Architecture 7 Couches</span>
          </a>
          <a href="#/metrologie" class="nav-link ${currentHash === '#/metrologie' ? 'active' : ''}">
            <span class="nav-icon">📐</span>
            <span class="nav-text">Équipements & Métrologie</span>
          </a>
          <a href="#/cybersecurite" class="nav-link ${currentHash === '#/cybersecurite' ? 'active' : ''}">
            <span class="nav-icon">🛡️</span>
            <span class="nav-text">Cybersécurité & Données</span>
          </a>
          <a href="#/recette" class="nav-link ${currentHash === '#/recette' ? 'active' : ''}">
            <span class="nav-icon">✅</span>
            <span class="nav-text">Plan de Recette (T01-T15)</span>
          </a>
          <a href="#/planning" class="nav-link ${currentHash === '#/planning' ? 'active' : ''}">
            <span class="nav-icon">📅</span>
            <span class="nav-text">Planning Gantt</span>
          </a>
          <a href="#/formation" class="nav-link ${currentHash === '#/formation' ? 'active' : ''}">
            <span class="nav-icon">🎓</span>
            <span class="nav-text">Formation & Quiz</span>
          </a>
          <a href="#/audit" class="nav-link ${currentHash === '#/audit' ? 'active' : ''}">
            <span class="nav-icon">📜</span>
            <span class="nav-text">Journal d'Audit</span>
          </a>
        </nav>

        <div style="padding:0.75rem 1rem; border-top:1px solid var(--border-color); background-color:var(--bg-input);">
          <div style="font-size:11px; font-weight:700; color:var(--text-primary);">${user.nom}</div>
          <div style="font-size:10px; color:var(--marsa-blue);">${user.libelle}</div>
        </div>
      </aside>
    `;
  }
};
