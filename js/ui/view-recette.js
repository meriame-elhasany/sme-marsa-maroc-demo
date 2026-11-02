/**
 * VUE PLAN DE RECETTE SAT — CHECKLIST INTERACTIVE DES 15 TESTS (T01 À T15)
 * Suivi de conformité, mise à jour des statuts, commentaires d'essais et jauge globale.
 */

import { DB } from '../storage/db.js';
import { Auth } from '../auth/auth.js';

export const ViewRecette = {
  render(container) {
    const tests = DB.get(DB.keys.RECETTE, []);
    const canTest = Auth.hasPermission('TEST_RECETTE');

    const conformeCount = tests.filter(t => t.statut === 'CONFORME').length;
    const scorePct = Math.round((conformeCount / tests.length) * 100);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Cahier de Recette Technique (Essais SAT T01 à T15)</h1>
          <div class="page-subtitle">Grille d'évaluation technique conforme à l'article 11 du Règlement de Consultation (RC)</div>
        </div>
        <div class="anti-doublon-badge" style="background-color:rgba(16, 185, 129, 0.15); border-color:rgba(16, 185, 129, 0.4); color:#34d399;">
          <span>Score de Conformité : <strong>${conformeCount} / ${tests.length} (${scorePct} %)</strong></span>
        </div>
      </div>

      <!-- JAUGE DE PROGRESSION GLOBALE -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span style="font-weight:700; color:var(--text-primary);">Avancement Global de la Recette Technique</span>
          <span style="font-size:12px; font-weight:700; color:var(--status-ok);">${scorePct} % Validé</span>
        </div>
        <div class="progress-bar-container" style="height:12px;">
          <div class="progress-bar-fill" style="width:${scorePct}%; background-color:var(--status-ok);"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-top:4px;">
          <span>${conformeCount} tests conformes</span>
          <span>${tests.filter(t => t.statut === 'RESERVE').length} sous réserve</span>
          <span>${tests.filter(t => t.statut === 'NON_CONFORME').length} non conformes</span>
        </div>
      </div>

      <!-- LISTE DES 15 TESTS T01 À T15 -->
      <div class="card">
        <div class="card-title">Checklist Interactive des Essais d'Acceptation sur Site (SAT)</div>
        <div class="table-responsive">
          <table class="scada-table sat-table">
            <thead>
              <tr>
                <th style="width:60px;">Réf.</th>
                <th>Désignation de l'Essai</th>
                <th style="width:140px;">Statut Recette</th>
                <th style="width:110px;">Date d'Essai</th>
                <th>Observations & Résultats de Contrôle</th>
                ${canTest ? '<th style="width:90px;">Action</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${tests.map(t => {
                let badgeClass = "realtime";
                let badgeLabel = "CONFORME";
                if (t.statut === 'NON_CONFORME') { badgeClass = "stale"; badgeLabel = "NON CONFORME"; }
                else if (t.statut === 'RESERVE') { badgeClass = "delayed"; badgeLabel = "RÉSERVÉ"; }

                return `
                  <tr class="${t.statut ? t.statut.toLowerCase().replace('_', '-') : ''}">
                    <td class="mono" style="font-weight:700; color:var(--marsa-blue);">${t.id}</td>
                    <td><strong>${t.titre}</strong></td>
                    <td>
                      <span class="freshness-badge ${badgeClass}">
                        <span class="scada-led ${badgeClass === 'realtime' ? 'ok' : (badgeClass === 'delayed' ? 'warning' : 'critical')}"></span>
                        ${badgeLabel}
                      </span>
                    </td>
                    <td class="mono" style="font-size:11px;">${t.date}</td>
                    <td style="font-size:12px;">${t.commentaire}</td>
                    ${canTest ? `
                      <td>
                        <button class="btn btn-secondary btn-sm btn-toggle-test" data-id="${t.id}" title="Changer le statut du test">
                          Éditer
                        </button>
                      </td>
                    ` : ''}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this._bindEvents(container);
  },

  _bindEvents(container) {
    container.querySelectorAll('.btn-toggle-test').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const tests = DB.get(DB.keys.RECETTE, []);
        const t = tests.find(item => item.id === id);
        if (!t) return;

        const nextStatus = t.statut === 'CONFORME' ? 'RESERVE' : (t.statut === 'RESERVE' ? 'NON_CONFORME' : 'CONFORME');
        const newComment = prompt(`Nouveau commentaire pour l'essai ${id} (${t.titre}) :`, t.commentaire);
        if (newComment !== null) {
          t.statut = nextStatus;
          t.commentaire = newComment;
          t.date = new Date().toISOString().slice(0, 10);
          DB.set(DB.keys.RECETTE, tests);
          DB.logAudit("MODIFICATION_RECETTE", `Mise à jour test SAT ${id} vers le statut ${nextStatus}`);
          this.render(container);
        }
      });
    });
  }
};
