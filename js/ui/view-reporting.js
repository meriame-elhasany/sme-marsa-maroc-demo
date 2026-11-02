/**
 * VUE REPORTING & BILANS ÉNERGÉTIQUES
 * Génération de rapports périodiques, export CSV et impression PDF (@media print).
 */

import { ReportGenerator } from '../rapports/report-generator.js';
import { ExportUtils } from '../rapports/export-utils.js';

export const ViewReporting = {
  currentReportType: 'JOURNALIER',

  render(container) {
    const report = ReportGenerator.generateEnergyReport(this.currentReportType);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Rapports d'Exploitation & Bilans Énergétiques</h1>
          <div class="page-subtitle">Édition des bilans périodiques conformes aux exigences de management ISO 50001</div>
        </div>
        <div style="display:flex; gap:0.5rem;" class="no-print">
          <button id="btn-export-report-csv" class="btn btn-secondary btn-sm">
            📥 Télécharger CSV
          </button>
          <button id="btn-print-report-pdf" class="btn btn-primary btn-sm">
            🖨️ Imprimer en PDF
          </button>
        </div>
      </div>

      <!-- SÉLECTEUR DE TYPE DE RAPPORT -->
      <div class="card no-print" style="margin-bottom:1.5rem;">
        <div class="form-row">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Type de Bilan Énergétique :</label>
            <select id="select-report-type" class="form-control">
              <option value="JOURNALIER" ${this.currentReportType === 'JOURNALIER' ? 'selected' : ''}>Bilan Journalier d'Exploitation</option>
              <option value="MENSUEL" ${this.currentReportType === 'MENSUEL' ? 'selected' : ''}>Bilan Mensuel & Suivi de la SER</option>
              <option value="QUALITE" ${this.currentReportType === 'QUALITE' ? 'selected' : ''}>Audit de Complétude & Qualité Métrologique</option>
            </select>
          </div>
        </div>
      </div>

      <!-- EN-TÊTE SPÉCIFIQUE POUR IMPRESSION PDF -->
      <div class="print-header">
        <div class="print-header-top">
          <div>
            <div class="print-title">MARSA MAROC — PORT D'AGADIR (DEPA)</div>
            <div class="print-subtitle">${report.titre}</div>
            <div class="print-meta">Réf : ${report.referenceAO} | Date d'édition : ${report.dateRapport}</div>
          </div>
          <div style="font-size:24pt; font-weight:bold; color:#0284c7;">SME</div>
        </div>
      </div>

      <!-- FEUILLE DE RAPPORT MISE EN PAGE -->
      <div class="card" id="report-view-card" style="padding:2rem;">
        <div style="border-bottom:2px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:flex-end;">
          <div>
            <h2 style="font-size:1.3rem; font-weight:800; color:var(--text-primary); margin-bottom:4px;">${report.titre}</h2>
            <div style="font-size:12px; color:var(--text-muted);">${report.mentionLegale}</div>
          </div>
          <div style="text-align:right; font-size:11px; color:var(--text-muted);">
            <div>Généré le : <strong class="mono">${new Date(report.horodatageGen).toLocaleString('fr-FR')}</strong></div>
            <div>Périmètre : <strong>Ensemble des 6 Postes Électriques</strong></div>
          </div>
        </div>

        <!-- SYNTHÈSE TOTAUX SITE -->
        <h3 style="font-size:1rem; font-weight:700; color:var(--marsa-blue); margin-bottom:0.75rem;">1. Synthèse de la Puissance et de la Qualité Réseau</h3>
        <div class="grid-cards" style="margin-bottom:1.5rem;">
          <div style="padding:1rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <div class="scada-metric-label">Puissance Appelée Totale</div>
            <div class="scada-metric-val" style="font-size:1.4rem;">${report.totauxSite.totalPower_kW.toLocaleString('fr-FR')} <span class="scada-metric-unit">kW</span></div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Garantie sans double comptage</div>
          </div>
          <div style="padding:1rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <div class="scada-metric-label">Facteur de Puissance Moyen</div>
            <div class="scada-metric-val" style="font-size:1.4rem;">${report.totauxSite.cosPhi.toFixed(3)}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Seuil réglementaire : 0.900</div>
          </div>
          <div style="padding:1rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <div class="scada-metric-label">Disponibilité Acquisition</div>
            <div class="scada-metric-val" style="font-size:1.4rem; color:var(--status-ok);">${report.qualiteDonnees.tauxDisponibilPct} <span class="scada-metric-unit">%</span></div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Trames Modbus valides</div>
          </div>
        </div>

        <!-- DÉTAIL PAR POSTE -->
        <h3 style="font-size:1rem; font-weight:700; color:var(--marsa-blue); margin-bottom:0.75rem;">2. Répartition de la Consommation par Poste Électrique</h3>
        <div class="table-responsive" style="margin-bottom:1.5rem;">
          <table class="scada-table">
            <thead>
              <tr>
                <th>Poste</th>
                <th>Zone Portuaire</th>
                <th>Puissance Mesurée (kW)</th>
                <th>Souscription (kVA)</th>
                <th>Taux de Charge (%)</th>
                <th>cos φ</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${report.totauxSite.substations.map(s => `
                <tr>
                  <td><strong>${s.nom}</strong></td>
                  <td>${s.zone}</td>
                  <td class="mono"><strong>${s.puissance_kW.toLocaleString('fr-FR')}</strong></td>
                  <td class="mono">${s.puissanceSouscrite_kVA}</td>
                  <td class="mono">${s.tauxChargePct} %</td>
                  <td class="mono">${s.cosPhi.toFixed(3)}</td>
                  <td><span class="scada-led ${s.status === 'OK' ? 'ok' : (s.status === 'WARNING' ? 'warning' : 'critical')}"></span>${s.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- BILAN IPE ET SER -->
        <h3 style="font-size:1rem; font-weight:700; color:var(--marsa-blue); margin-bottom:0.75rem;">3. Performance Énergétique (ISO 50001) & Situation de Référence</h3>
        <div class="table-responsive">
          <table class="scada-table">
            <thead>
              <tr>
                <th>Indicateur / Équipement</th>
                <th>Valeur Mesurée</th>
                <th>Valeur Cible</th>
                <th>Écart (%)</th>
                <th>Statut Conformité</th>
              </tr>
            </thead>
            <tbody>
              ${report.ipes.map(ipe => `
                <tr>
                  <td><strong>${ipe.nom}</strong></td>
                  <td class="mono">${ipe.valeurCalculee} ${ipe.unite}</td>
                  <td class="mono">${ipe.seuilCible} ${ipe.unite}</td>
                  <td class="mono">${ipe.ecartSeuilPct > 0 ? '+' : ''}${ipe.ecartSeuilPct} %</td>
                  <td><span class="badge-ref" style="font-size:10px;">${ipe.statut}</span></td>
                </tr>
              `).join('')}
              <tr style="background-color:rgba(2, 132, 199, 0.05);">
                <td><strong>Bilan SER (vs Baseline 2025)</strong></td>
                <td class="mono"><strong>${report.ser.observeMWh} MWh</strong></td>
                <td class="mono">${report.ser.baselineMWh} MWh</td>
                <td class="mono" style="color:var(--status-ok);"><strong>-${report.ser.economiesMWh} MWh</strong></td>
                <td><strong style="color:var(--status-ok);">+${report.ser.economiesMAD} MAD économisés</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    this._bindEvents(container, report);
  },

  _bindEvents(container, report) {
    const selType = container.querySelector('#select-report-type');
    if (selType) {
      selType.addEventListener('change', (e) => {
        this.currentReportType = e.target.value;
        this.render(container);
      });
    }

    const btnPrint = container.querySelector('#btn-print-report-pdf');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        ExportUtils.printDocument();
      });
    }

    const btnExport = container.querySelector('#btn-export-report-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const headers = ["Poste_ID", "Designation", "Zone", "Puissance_kW", "Souscription_kVA", "Cos_Phi", "Statut"];
        const rows = report.totauxSite.substations.map(s => [
          s.id,
          s.nom,
          s.zone,
          s.puissance_kW,
          s.puissanceSouscrite_kVA,
          s.cosPhi,
          s.status
        ]);
        ExportUtils.downloadCSV(`bilan_energetique_${this.currentReportType}_${Date.now()}`, headers, rows);
      });
    }
  }
};
