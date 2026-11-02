/**
 * VUE ÉQUIPEMENTS & MÉTROLOGIE LÉGALE
 * Fiches des compteurs, classes de précision (CEI 62053-22), rapports TC/TT et suivi des étalonnages.
 */

import { DB } from '../storage/db.js';

export const ViewMetrologie = {
  render(container) {
    const compteurs = DB.get(DB.keys.COMPTEURS, []);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Parc d'Équipements & Métrologie Légale</h1>
          <div class="page-subtitle">Suivi métrologique, classes de précision (CEI 62053-22) et conformité des étalonnages</div>
        </div>
      </div>

      <!-- SYNTHÈSE MÉTROLOGIQUE -->
      <div class="grid-cards">
        <div class="card">
          <div class="card-title">Comptage de Facturation / Arrivées</div>
          <div style="font-size:1.4rem; font-weight:700; color:var(--text-primary); margin-bottom:4px;">Classe 0.2S</div>
          <div style="font-size:11px; color:var(--text-muted);">
            6 compteurs d'arrivée générale (TR1 à TR6) avec transformateurs de courant haute précision.
          </div>
        </div>

        <div class="card">
          <div class="card-title">Comptage Divisionnaire / Départs</div>
          <div style="font-size:1.4rem; font-weight:700; color:var(--text-primary); margin-bottom:4px;">Classe 0.5S</div>
          <div style="font-size:11px; color:var(--text-muted);">
            8 sous-compteurs alimentant les grues, prises frigorifiques reefers et convoyeurs.
          </div>
        </div>

        <div class="card">
          <div class="card-title">Périodicité d'Étalonnage</div>
          <div style="font-size:1.4rem; font-weight:700; color:var(--status-ok); margin-bottom:4px;">24 Mois</div>
          <div style="font-size:11px; color:var(--text-muted);">
            Vérification périodique par laboratoire accrédité (Iso/CEI 17025).
          </div>
        </div>
      </div>

      <!-- TABLEAU DES COMPTEURS & VALIDITÉ DES ÉTALONNAGES -->
      <div class="card">
        <div class="card-title">
          <span>Registre du Parc des Compteurs Électriques (${compteurs.length})</span>
        </div>
        <div class="table-responsive">
          <table class="scada-table">
            <thead>
              <tr>
                <th>N° Série</th>
                <th>Désignation / Point de Mesure</th>
                <th>Poste</th>
                <th>Classe Active</th>
                <th>Classe Réactive</th>
                <th>Rapport TC</th>
                <th>Dernier Étalonnage</th>
                <th>Prochaine Échéance</th>
                <th>Validité Métrologique</th>
              </tr>
            </thead>
            <tbody>
              ${compteurs.map(c => {
                const dateEtalonnage = new Date(c.dateDernierEtalonnage);
                const dateEcheance = new Date(dateEtalonnage.getTime() + (c.periodiciteEtalonnageMois || 24) * 30.5 * 86400 * 1000);
                const isValide = dateEcheance > new Date();

                return `
                  <tr>
                    <td class="mono" style="font-weight:700; color:var(--marsa-blue);">${c.numeroSerie}</td>
                    <td><strong>${c.designation}</strong></td>
                    <td class="mono">${c.posteId}</td>
                    <td><span class="badge-ref" style="font-size:10px;">${c.classePrecisionActive}</span></td>
                    <td><span class="badge-ref" style="font-size:10px;">${c.classePrecisionReactive}</span></td>
                    <td class="mono">${c.rapportTC}</td>
                    <td>${c.dateDernierEtalonnage}</td>
                    <td>${dateEcheance.toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span class="freshness-badge ${isValide ? 'realtime' : 'stale'}">
                        <span class="scada-led ${isValide ? 'ok' : 'critical'}"></span>
                        ${isValide ? 'CONFORME' : 'EXPIRÉ'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};
