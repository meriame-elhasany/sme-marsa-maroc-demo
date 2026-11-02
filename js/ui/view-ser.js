/**
 * VUE SITUATION ÉNERGÉTIQUE DE RÉFÉRENCE (SER / BASELINE) — ISO 50001
 * Écart Réel vs Théorique, Courbe CUSUM et justification des révisions de référence.
 */

import { DB } from '../storage/db.js';
import { SEREngine } from '../calculs/ser.js';

export const ViewSER = {
  chartInstance: null,

  render(container) {
    const serConfig = DB.get(DB.keys.SER, {});
    const serResults = SEREngine.generateMonthlyComparison(serConfig);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Situation Énergétique de Référence (SER / Baseline)</h1>
          <div class="page-subtitle">Modélisation de référence ISO 50001:2018 — Port d'Agadir (Année de base 2025)</div>
        </div>
        <div class="anti-doublon-badge" style="background-color:rgba(16, 185, 129, 0.12); color:#34d399; border-color:rgba(16, 185, 129, 0.4);">
          <span>Économies Cumulées : <strong>+${(serResults.totalSavings_kWh / 1000).toFixed(1)} MWh</strong></span>
          <span style="font-weight:400; font-size:10px;">(~${serResults.totalSavings_MAD.toLocaleString('fr-FR')} MAD)</span>
        </div>
      </div>

      <!-- MENTION MÉTHODE ILLUSTRATIVE -->
      <div style="background-color:rgba(2, 132, 199, 0.1); border:1px solid rgba(2, 132, 199, 0.3); border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.75rem;">
        <span style="font-size:1.2rem;">📌</span>
        <span style="font-size:12px; color:#bae6fd;">
          <strong>Méthode à valider avec la DEPA :</strong> Le modèle de référence retenu est une régression multi-variables liant la consommation journalière au terme fixe talon, aux mouvements de conteneurs EVP et au tonnage de vrac manutentionné.
        </span>
      </div>

      <!-- CARTES DES PARAMÈTRES SER -->
      <div class="grid-cards">
        <div class="card">
          <div class="card-title">Équation de Référence (Baseline)</div>
          <div style="font-family:var(--font-family-mono); font-size:12px; color:var(--marsa-blue); background-color:var(--bg-input); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:0.5rem;">
            ${serConfig.formuleRegression}
          </div>
          <div style="font-size:11px; color:var(--text-muted);">
            Terme fixe talon : 18 500 kWh/j | Coef EVP : 14.2 | Coef Tonne : 0.85
          </div>
        </div>

        <div class="card">
          <div class="card-title">Bilan sur 30 Jours Glissants</div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span style="color:var(--text-muted); font-size:12px;">Consommation Théorique :</span>
            <strong style="color:var(--text-primary); font-family:var(--font-family-mono);">${(serResults.totalBaseline_kWh / 1000).toFixed(1)} MWh</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span style="color:var(--text-muted); font-size:12px;">Consommation Constatée :</span>
            <strong style="color:var(--status-ok); font-family:var(--font-family-mono);">${(serResults.totalObserved_kWh / 1000).toFixed(1)} MWh</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:0.5rem; border-top:1px solid var(--border-color);">
            <span style="color:var(--text-muted); font-size:12px;">Gain Énergétique Net :</span>
            <strong style="color:#38bdf8; font-family:var(--font-family-mono);">${(serResults.totalSavings_kWh / 1000).toFixed(1)} MWh (${((serResults.totalSavings_kWh / serResults.totalBaseline_kWh) * 100).toFixed(1)} %)</strong>
          </div>
        </div>
      </div>

      <!-- GRAPHIQUE COMPARATIF & COURBE CUSUM -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-title">
          <span>Comparaison Réel vs Baseline & Courbe CUSUM (Somme Cumulée des Économies)</span>
          <span style="font-size:11px; color:var(--text-muted);">30 Derniers Jours d'Exploitation</span>
        </div>
        <div style="height:300px; width:100%; position:relative;">
          <canvas id="serCusumChart"></canvas>
        </div>
      </div>

      <!-- HISTORIQUE DES VERSIONS DE LA SER -->
      <div class="card">
        <div class="card-title">Gouvernance & Historique des Versions de la Référence</div>
        <div class="table-responsive">
          <table class="scada-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Date d'Approbation</th>
                <th>Auteur / Organisme</th>
                <th>Période de Référence</th>
                <th>Motif de Révision</th>
              </tr>
            </thead>
            <tbody>
              ${serConfig.versions ? serConfig.versions.map(v => `
                <tr>
                  <td class="mono" style="font-weight:700; color:var(--marsa-blue);">${v.version}</td>
                  <td>${v.date}</td>
                  <td>${v.auteur || 'Comité Énergie Marsa Maroc'}</td>
                  <td>${serConfig.periodeDebut} au ${serConfig.periodeFin}</td>
                  <td>${v.motif}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this._initChart(serResults.history);
  },

  _initChart(history) {
    const ctx = document.getElementById('serCusumChart');
    if (!ctx || !window.Chart) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const labels = history.map(h => h.date);
    const baselineData = history.map(h => Math.round(h.baseline_kWh / 1000));
    const observedData = history.map(h => Math.round(h.observed_kWh / 1000));
    const cusumData = history.map(h => Math.round(h.cusum_kWh / 1000));

    this.chartInstance = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Consommation Réelle (MWh)',
            data: observedData,
            backgroundColor: 'rgba(2, 132, 199, 0.6)',
            borderColor: '#0284c7',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Référence Baseline (MWh)',
            data: baselineData,
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'CUSUM Économies Cumulées (MWh)',
            data: cusumData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderWidth: 2,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9db2cc', font: { size: 10 } }
          },
          y: {
            type: 'linear',
            position: 'left',
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9db2cc' },
            title: { display: true, text: 'Consommation Journalière (MWh)', color: '#9db2cc' }
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#10b981' },
            title: { display: true, text: 'CUSUM Cumulé (MWh)', color: '#10b981' }
          }
        }
      }
    });
  },

  destroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
};
