/**
 * VUE POSTES & COMPTEURS — MESURES INSTANTANÉES ET HISTORIQUES
 * Filtrage par poste, compteur, grandeur physique, badge de fraîcheur et export CSV.
 */

import { DB } from '../storage/db.js';
import { SimEngine } from '../simulation/engine.js';
import { ExportUtils } from '../rapports/export-utils.js';

export const ViewPostes = {
  selectedPosteId: 'P1',
  selectedCompteurId: 'CMP-P1-001',
  selectedMetric: 'puissanceActive_kW',
  chartInstance: null,

  render(container) {
    const postes = DB.get(DB.keys.POSTES, []);
    const compteurs = DB.get(DB.keys.COMPTEURS, []);
    const selectedPoste = postes.find(p => p.id === this.selectedPosteId) || postes[0];
    const posteCompteurs = compteurs.filter(c => c.posteId === this.selectedPosteId);
    const selectedCompteur = posteCompteurs.find(c => c.id === this.selectedCompteurId) || posteCompteurs[0] || compteurs[0];
    
    const reading = SimEngine.getReading(selectedCompteur.id);
    const freshness = reading ? SimEngine.getFreshness(reading.timestampReception) : { status: 'stale', label: 'Aucune donnée' };

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Mesures Instantanées & Historiques</h1>
          <div class="page-subtitle">Exploration détaillée des compteurs et départs électriques</div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button id="btn-export-meter-csv" class="btn btn-secondary btn-sm">
            📥 Exporter les données (CSV)
          </button>
        </div>
      </div>

      <!-- BARRE DE FILTRES -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="form-row">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Poste Électrique :</label>
            <select id="select-poste" class="form-control">
              ${postes.map(p => `<option value="${p.id}" ${p.id === this.selectedPosteId ? 'selected' : ''}>${p.nom}</option>`).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Point de Comptage / Départ :</label>
            <select id="select-compteur" class="form-control">
              ${posteCompteurs.map(c => `<option value="${c.id}" ${c.id === this.selectedCompteurId ? 'selected' : ''}>${c.designation} (${c.id})</option>`).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Grandeur à Tracer :</label>
            <select id="select-grandeur" class="form-control">
              <option value="puissanceActive_kW" ${this.selectedMetric === 'puissanceActive_kW' ? 'selected' : ''}>Puissance Active (kW)</option>
              <option value="puissanceReactive_kVAR" ${this.selectedMetric === 'puissanceReactive_kVAR' ? 'selected' : ''}>Puissance Réactive (kVAR)</option>
              <option value="courantL1_A" ${this.selectedMetric === 'courantL1_A' ? 'selected' : ''}>Courant Phase L1 (A)</option>
              <option value="tensionL1_V" ${this.selectedMetric === 'tensionL1_V' ? 'selected' : ''}>Tension L1-N (V)</option>
              <option value="facteurPuissance" ${this.selectedMetric === 'facteurPuissance' ? 'selected' : ''}>Facteur de Puissance (cos φ)</option>
              <option value="frequence_Hz" ${this.selectedMetric === 'frequence_Hz' ? 'selected' : ''}>Fréquence Réseau (Hz)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- BLOC MESURES EN TEMPS RÉEL DU COMPTEUR -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-title">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span>${selectedCompteur.designation}</span>
            <span class="freshness-badge ${freshness.status}" id="meter-freshness-badge">
              <span class="scada-led ${freshness.status === 'realtime' ? 'ok' : (freshness.status === 'delayed' ? 'warning' : 'critical')}"></span>
              ${freshness.label}
            </span>
            <span style="font-size:11px; color:var(--text-muted); font-weight:400;">
              Qualité de donnée : <strong id="meter-quality-tag" style="color:${reading && reading.qualite === 'OK' ? 'var(--status-ok)' : 'var(--status-critical)'};">${reading ? reading.qualite : 'INDISPONIBLE'}</strong>
            </span>
          </div>
          <span style="font-size:11px; color:var(--text-muted);">
            Modbus TCP : ${selectedCompteur.modbus.ipAddress}:502 (Unit ID: ${selectedCompteur.modbus.unitId})
          </span>
        </div>

        <div class="grid-cards" style="margin-bottom:0;" id="meter-live-metrics">
          ${this._renderLiveMetrics(reading)}
        </div>
      </div>

      <!-- GRAPHIQUE HISTORIQUE -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-title">
          <span>Évolution Temporelle — ${this._getMetricLabel(this.selectedMetric)}</span>
          <div style="font-size:11px; color:var(--text-muted);">
            Dernière réception : <span id="meter-last-comm" class="mono">${reading ? new Date(reading.timestampReception).toLocaleTimeString() : '--:--:--'}</span>
          </div>
        </div>
        <div style="height:280px; width:100%; position:relative;">
          <canvas id="meterHistoryChart"></canvas>
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._initChart();
  },

  _getMetricLabel(metricKey) {
    const map = {
      puissanceActive_kW: 'Puissance Active (kW)',
      puissanceReactive_kVAR: 'Puissance Réactive (kVAR)',
      courantL1_A: 'Courant L1 (A)',
      tensionL1_V: 'Tension L1-N (V)',
      facteurPuissance: 'Facteur de Puissance (cos φ)',
      frequence_Hz: 'Fréquence (Hz)'
    };
    return map[metricKey] || metricKey;
  },

  _renderLiveMetrics(reading) {
    const v = reading ? reading.valeurs : {
      puissanceActive_kW: 0,
      puissanceReactive_kVAR: 0,
      energieActiveImport_kWh: 0,
      courantL1_A: 0,
      tensionL1_V: 0,
      facteurPuissance: 0,
      frequence_Hz: 0
    };

    return `
      <div style="padding:0.75rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
        <div class="scada-metric-label">Puissance Active</div>
        <div class="scada-metric-val" id="val-kw">${v.puissanceActive_kW.toLocaleString('fr-FR')} <span class="scada-metric-unit">kW</span></div>
      </div>
      <div style="padding:0.75rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
        <div class="scada-metric-label">Puissance Réactive</div>
        <div class="scada-metric-val" id="val-kvar">${v.puissanceReactive_kVAR.toLocaleString('fr-FR')} <span class="scada-metric-unit">kVAR</span></div>
      </div>
      <div style="padding:0.75rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
        <div class="scada-metric-label">Index Énergie Active</div>
        <div class="scada-metric-val" id="val-kwh" style="font-size:1.3rem;">${Math.round(v.energieActiveImport_kWh).toLocaleString('fr-FR')} <span class="scada-metric-unit">kWh</span></div>
      </div>
      <div style="padding:0.75rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
        <div class="scada-metric-label">Courant L1</div>
        <div class="scada-metric-val" id="val-i">${v.courantL1_A.toLocaleString('fr-FR')} <span class="scada-metric-unit">A</span></div>
      </div>
      <div style="padding:0.75rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
        <div class="scada-metric-label">Tension L1-N</div>
        <div class="scada-metric-val" id="val-u">${v.tensionL1_V.toLocaleString('fr-FR')} <span class="scada-metric-unit">V</span></div>
      </div>
      <div style="padding:0.75rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
        <div class="scada-metric-label">Facteur Puissance</div>
        <div class="scada-metric-val" id="val-cosphi">${v.facteurPuissance.toFixed(3)}</div>
      </div>
    `;
  },

  _initChart() {
    const ctx = document.getElementById('meterHistoryChart');
    if (!ctx || !window.Chart) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Génération d'une courbe historique représentative sur 24 points
    const labels = [];
    const values = [];
    const baseVal = this.selectedMetric === 'facteurPuissance' ? 0.96 : (this.selectedMetric === 'tensionL1_V' ? 230 : 280);

    for (let i = 23; i >= 0; i--) {
      labels.push(`${(24 - i).toString().padStart(2, '0')}:00`);
      values.push(Math.round((baseVal + (Math.random() - 0.5) * (baseVal * 0.2)) * 10) / 10);
    }

    this.chartInstance = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: this._getMetricLabel(this.selectedMetric),
          data: values,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
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
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9db2cc', font: { size: 11 } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  _bindEvents(container) {
    // Changement de poste
    const selectPoste = container.querySelector('#select-poste');
    if (selectPoste) {
      selectPoste.addEventListener('change', (e) => {
        this.selectedPosteId = e.target.value;
        const compteurs = DB.get(DB.keys.COMPTEURS, []);
        const firstCompteur = compteurs.find(c => c.posteId === this.selectedPosteId);
        if (firstCompteur) this.selectedCompteurId = firstCompteur.id;
        this.render(container);
      });
    }

    // Changement de compteur
    const selectCompteur = container.querySelector('#select-compteur');
    if (selectCompteur) {
      selectCompteur.addEventListener('change', (e) => {
        this.selectedCompteurId = e.target.value;
        this.render(container);
      });
    }

    // Changement de grandeur
    const selectGrandeur = container.querySelector('#select-grandeur');
    if (selectGrandeur) {
      selectGrandeur.addEventListener('change', (e) => {
        this.selectedMetric = e.target.value;
        this._initChart();
      });
    }

    // Export CSV
    const btnExport = container.querySelector('#btn-export-meter-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const reading = SimEngine.getReading(this.selectedCompteurId);
        const headers = ["Compteur_ID", "Horodatage_Mesure", "Horodatage_Reception", "Qualite", "P_Active_kW", "Q_Reactive_kVAR", "Energie_kWh", "Courant_L1_A", "Tension_L1_V", "Cos_Phi", "Frequence_Hz"];
        const rows = [
          [
            this.selectedCompteurId,
            reading ? reading.timestampMesure : new Date().toISOString(),
            reading ? reading.timestampReception : new Date().toISOString(),
            reading ? reading.qualite : 'INDISPONIBLE',
            reading ? reading.valeurs.puissanceActive_kW : 0,
            reading ? reading.valeurs.puissanceReactive_kVAR : 0,
            reading ? reading.valeurs.energieActiveImport_kWh : 0,
            reading ? reading.valeurs.courantL1_A : 0,
            reading ? reading.valeurs.tensionL1_V : 0,
            reading ? reading.valeurs.facteurPuissance : 0,
            reading ? reading.valeurs.frequence_Hz : 0
          ]
        ];
        ExportUtils.downloadCSV(`mesures_${this.selectedCompteurId}_${Date.now()}`, headers, rows);
      });
    }

    // Abonnement simulation pour rafraîchir les mesures instantanées
    this.unsubscribe = SimEngine.subscribe((data) => {
      if (data.type === 'TICK') {
        const reading = SimEngine.getReading(this.selectedCompteurId);
        if (!reading) return;

        const freshness = SimEngine.getFreshness(reading.timestampReception);
        const badgeEl = container.querySelector('#meter-freshness-badge');
        const qualityEl = container.querySelector('#meter-quality-tag');
        const commEl = container.querySelector('#meter-last-comm');

        if (badgeEl) {
          badgeEl.className = `freshness-badge ${freshness.status}`;
          badgeEl.innerHTML = `<span class="scada-led ${freshness.status === 'realtime' ? 'ok' : (freshness.status === 'delayed' ? 'warning' : 'critical')}"></span>${freshness.label}`;
        }
        if (qualityEl) {
          qualityEl.textContent = reading.qualite;
          qualityEl.style.color = reading.qualite === 'OK' ? 'var(--status-ok)' : 'var(--status-critical)';
        }
        if (commEl) {
          commEl.textContent = new Date(reading.timestampReception).toLocaleTimeString();
        }

        const metricsEl = container.querySelector('#meter-live-metrics');
        if (metricsEl) {
          metricsEl.innerHTML = this._renderLiveMetrics(reading);
        }
      }
    });
  },

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
};
