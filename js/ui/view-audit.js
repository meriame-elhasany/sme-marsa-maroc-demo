/**
 * VUE JOURNAL D'AUDIT ET TRAÇABILITÉ (ISO 50001)
 * Registre inaltérable des actions sensibles avec avant/après et export CSV.
 */

import { AuditService } from '../auth/audit.js';

export const ViewAudit = {
  render(container) {
    const logs = AuditService.getLogs();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Journal d'Audit & Traçabilité des Actions</h1>
          <div class="page-subtitle">Piste d'audit inaltérable pour le management de l'énergie (ISO 50001 / SCADA)</div>
        </div>
        <button id="btn-export-audit-csv" class="btn btn-secondary btn-sm">
          📥 Exporter le Journal (CSV)
        </button>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Historique des Événements & Modifications Enregistrées (${logs.length})</span>
          <span style="font-size:11px; color:var(--text-muted);">Horodatage UTC haute précision</span>
        </div>

        <div class="table-responsive">
          <table class="scada-table">
            <thead>
              <tr>
                <th style="width:90px;">ID Log</th>
                <th style="width:160px;">Date & Heure</th>
                <th style="width:180px;">Utilisateur</th>
                <th style="width:140px;">Rôle RBAC</th>
                <th style="width:170px;">Type d'Action</th>
                <th>Détails & Valeurs Avant/Après</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td class="mono" style="font-weight:700; color:var(--marsa-blue);">${l.id}</td>
                  <td class="mono" style="font-size:11px;">${new Date(l.timestamp).toLocaleString('fr-FR')}</td>
                  <td><strong>${l.utilisateur}</strong></td>
                  <td><span class="badge-ref" style="font-size:10px;">${l.role}</span></td>
                  <td><span class="badge-ref" style="font-size:10px; background-color:rgba(2,132,199,0.15); color:#38bdf8;">${l.action}</span></td>
                  <td style="font-size:12px;">${l.details}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this._bindEvents(container);
  },

  _bindEvents(container) {
    const btnExport = container.querySelector('#btn-export-audit-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        AuditService.exportCSV();
      });
    }
  }
};
