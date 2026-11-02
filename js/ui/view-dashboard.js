/**
 * VUE TABLEAU DE BORD SITE — SUPERVISION TEMPS RÉEL
 * Synthèse globale, KPI industriels, 6 postes électriques et barre d'injection de pannes.
 */

import { DB } from '../storage/db.js';
import { Aggregations } from '../calculs/aggregations.js';
import { SimEngine } from '../simulation/engine.js';
import { FaultInjector } from '../simulation/fault-injector.js';

export const ViewDashboard = {
  chartInstance: null,

  render(container) {
    const postes = DB.get(DB.keys.POSTES, []);
    const totals = Aggregations.calculateSiteTotals(postes, SimEngine.latestReadings);
    const alerts = DB.get(DB.keys.ALERTES, []);
    const activeAlerts = alerts.filter(a => a.statut !== 'CLOTUREE');

    // Calcul du taux de communication
    const compteurs = DB.get(DB.keys.COMPTEURS, []);
    const commOkCount = compteurs.filter(c => c.modbus && c.modbus.status === 'CONNECTED').length;
    const commRate = Math.round((commOkCount / compteurs.length) * 100);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Tableau de Bord Énergétique du Site</h1>
          <div class="page-subtitle">Supervision en direct des 6 postes électriques — Port d'Agadir (DEPA)</div>
        </div>
        <div class="anti-doublon-badge" title="Règle métrologique : Seules les arrivées générales sont sommées">
          <span>🛡️ Contrôle Anti-Doublon : ACTIF</span>
          <span style="font-weight:400; font-size:10px;">(${totals.antiDoubleCountProof.avoidedDuplicatePower_kW} kW sous-comptage écartés)</span>
        </div>
      </div>

      <!-- BARRE D'INJECTION DE PANNES POUR DÉMONSTRATION -->
      <div class="fault-injector-bar">
        <div class="fault-title">
          <span>🧪 Banc d'Injection d'Incidents (Simulation de Défauts) :</span>
        </div>
        <div class="fault-buttons-group">
          <button id="btn-fault-disconnect-p2" class="btn-fault ${FaultInjector.isDisconnected('CMP-P2-001') ? 'active' : ''}">
            ⚡ Couper Comm Modbus P2
          </button>
          <button id="btn-fault-spike-p1" class="btn-fault ${FaultInjector.getAbnormalValue('CMP-P1-001') ? 'active' : ''}">
            ⚠️ Injecter Pic Aberrant (4250 kW)
          </button>
          <button id="btn-fault-drop" class="btn-fault ${FaultInjector.isPacketDropped('CMP-P4-001') ? 'active' : ''}">
            ❌ Paquet Perdu P4
          </button>
          <button id="btn-fault-restore" class="btn-fault restore">
            ✅ Rétablir Tout (Nominal)
          </button>
        </div>
      </div>

      <!-- CARTES KPI DU SITE -->
      <div class="grid-cards">
        <div class="card">
          <div class="card-title">
            <span>Puissance Active Totale</span>
            <span class="scada-led ok"></span>
          </div>
          <div class="scada-metric">
            <div class="scada-metric-val" id="metric-site-kw">${totals.totalPower_kW.toLocaleString('fr-FR')} <span class="scada-metric-unit">kW</span></div>
            <div class="form-help">Somme métrologique exacte des 6 arrivées TR</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            <span>Facteur de Puissance Moyen</span>
            <span class="scada-led ${totals.cosPhi < 0.90 ? 'warning' : 'ok'}"></span>
          </div>
          <div class="scada-metric">
            <div class="scada-metric-val" id="metric-site-cosphi">${totals.cosPhi.toFixed(3)} <span class="scada-metric-unit">cos φ</span></div>
            <div class="form-help">${totals.cosPhi >= 0.90 ? 'Zone optimale (sans pénalité ONEE)' : 'Pénalité réactive imminente'}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            <span>Taux de Communication Modbus</span>
            <span class="scada-led ${commRate >= 95 ? 'ok' : 'warning'}"></span>
          </div>
          <div class="scada-metric">
            <div class="scada-metric-val" id="metric-site-comm">${commRate} <span class="scada-metric-unit">%</span></div>
            <div class="form-help">${commOkCount} / ${compteurs.length} compteurs interrogés (port 502)</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            <span>Alertes Actives</span>
            <span class="scada-led ${activeAlerts.length > 0 ? 'critical' : 'ok'}"></span>
          </div>
          <div class="scada-metric">
            <div class="scada-metric-val" id="metric-site-alerts">${activeAlerts.length} <span class="scada-metric-unit">alarme(s)</span></div>
            <div class="form-help"><a href="#/alertes" style="color:var(--marsa-blue);">Accéder à la console d'alertes &rarr;</a></div>
          </div>
        </div>
      </div>

      <!-- COURBE TEMPS RÉEL (CHART.JS) -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-title">
          <span>Courbe de Puissance Totale du Port (Temps Réel)</span>
          <span style="font-size:11px; color:var(--text-muted);">Fréquence d'échantillonnage : 1s — Glissant 60 points</span>
        </div>
        <div style="height:260px; width:100%; position:relative;">
          <canvas id="realtimeSiteChart"></canvas>
        </div>
      </div>

      <!-- SYNTHÈSE DES 6 POSTES ÉLECTRIQUES -->
      <h2 style="font-size:1.15rem; font-weight:700; margin-bottom:1rem; color:var(--text-primary);">
        État d'Exploitation des 6 Postes Électriques
      </h2>
      <div class="grid-cards" id="substations-grid">
        ${this._renderSubstationsCards(totals.substations)}
      </div>
    `;

    this._bindEvents(container);
    this._initChart();
  },

  _renderSubstationsCards(substations) {
    return substations.map(s => {
      let statusClass = "ok";
      let statusLabel = "NOMINAL";
      if (s.status === 'CRITICAL') { statusClass = "critical"; statusLabel = "SURCHARGE"; }
      else if (s.status === 'WARNING') { statusClass = "warning"; statusLabel = "COS Φ BAS"; }
      else if (s.status === 'OFFLINE') { statusClass = "offline"; statusLabel = "COMM TIMEOUT"; }

      return `
        <div class="substation-card ${statusClass}">
          <div class="substation-header">
            <div>
              <div class="substation-title">${s.nom}</div>
              <div class="substation-zone">${s.zone}</div>
            </div>
            <span class="freshness-badge ${statusClass === 'offline' ? 'stale' : 'realtime'}">
              <span class="scada-led ${statusClass}"></span>
              ${statusLabel}
            </span>
          </div>

          <div class="substation-metrics-grid">
            <div class="scada-metric">
              <span class="scada-metric-label">Charge Actuelle</span>
              <span class="scada-metric-val" style="font-size:1.25rem;">${s.puissance_kW.toLocaleString('fr-FR')} <span class="scada-metric-unit">kW</span></span>
            </div>
            <div class="scada-metric">
              <span class="scada-metric-label">Facteur Puissance</span>
              <span class="scada-metric-val" style="font-size:1.25rem;">${s.cosPhi.toFixed(3)}</span>
            </div>
          </div>

          <div style="margin-top:4px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted);">
              <span>Souscription : ${s.puissanceSouscrite_kVA} kVA</span>
              <span>${s.tauxChargePct} %</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill ${s.tauxChargePct > 90 ? 'danger' : (s.tauxChargePct > 75 ? 'warning' : '')}" style="width: ${Math.min(100, s.tauxChargePct)}%;"></div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; font-size:11px;">
            <span style="color:var(--text-muted);">Sous-départs : ${s.subMetersPower_kW} kW</span>
            <a href="#/postes" style="font-weight:600; color:var(--marsa-blue);">Détails poste &rarr;</a>
          </div>
        </div>
      `;
    }).join('');
  },

  _initChart() {
    const ctx = document.getElementById('realtimeSiteChart');
    if (!ctx || !window.Chart) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const history = SimEngine.siteHistory;
    const labels = history.map(h => h.time);
    const dataKw = history.map(h => h.totalPower_kW);

    this.chartInstance = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['00:00:00'],
        datasets: [{
          label: 'Puissance Active Site (kW)',
          data: dataKw.length ? dataKw : [0],
          borderColor: '#0284c7',
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9db2cc', font: { size: 10 }, maxTicksLimit: 10 }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9db2cc', font: { size: 11 } },
            beginAtZero: false
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  _bindEvents(container) {
    // Boutons de fautes
    const btnDiscP2 = container.querySelector('#btn-fault-disconnect-p2');
    if (btnDiscP2) {
      btnDiscP2.addEventListener('click', () => {
        if (FaultInjector.isDisconnected('CMP-P2-001')) {
          FaultInjector.reconnectMeter('CMP-P2-001');
        } else {
          FaultInjector.disconnectMeter('CMP-P2-001');
        }
        btnDiscP2.classList.toggle('active', FaultInjector.isDisconnected('CMP-P2-001'));
      });
    }

    const btnSpikeP1 = container.querySelector('#btn-fault-spike-p1');
    if (btnSpikeP1) {
      btnSpikeP1.addEventListener('click', () => {
        if (FaultInjector.getAbnormalValue('CMP-P1-001')) {
          FaultInjector.clearSpike('CMP-P1-001');
        } else {
          FaultInjector.injectSpike('CMP-P1-001', 'puissanceActive_kW', 4250.0);
        }
        btnSpikeP1.classList.toggle('active', !!FaultInjector.getAbnormalValue('CMP-P1-001'));
      });
    }

    const btnDrop = container.querySelector('#btn-fault-drop');
    if (btnDrop) {
      btnDrop.addEventListener('click', () => {
        if (FaultInjector.isPacketDropped('CMP-P4-001')) {
          FaultInjector.activeFaults.droppedPackets.delete('CMP-P4-001');
        } else {
          FaultInjector.dropPackets('CMP-P4-001');
        }
        btnDrop.classList.toggle('active', FaultInjector.isPacketDropped('CMP-P4-001'));
      });
    }

    const btnRestore = container.querySelector('#btn-fault-restore');
    if (btnRestore) {
      btnRestore.addEventListener('click', () => {
        FaultInjector.restoreAll();
        container.querySelectorAll('.btn-fault').forEach(b => {
          if (!b.classList.contains('restore')) b.classList.remove('active');
        });
      });
    }

    // Mise à jour continue via le moteur de simulation
    this.unsubscribe = SimEngine.subscribe((data) => {
      if (data.type === 'TICK') {
        const kwEl = container.querySelector('#metric-site-kw');
        const cosEl = container.querySelector('#metric-site-cosphi');
        if (kwEl) kwEl.innerHTML = `${data.siteTotalPower_kW.toLocaleString('fr-FR')} <span class="scada-metric-unit">kW</span>`;
        if (cosEl) cosEl.innerHTML = `${data.globalCosPhi.toFixed(3)} <span class="scada-metric-unit">cos φ</span>`;

        // Mise à jour de la grille des 6 postes
        const postes = DB.get(DB.keys.POSTES, []);
        const totals = Aggregations.calculateSiteTotals(postes, SimEngine.latestReadings);
        const gridEl = container.querySelector('#substations-grid');
        if (gridEl) {
          gridEl.innerHTML = this._renderSubstationsCards(totals.substations);
        }

        // Mise à jour du graphique Chart.js
        if (this.chartInstance) {
          const history = SimEngine.siteHistory;
          this.chartInstance.data.labels = history.map(h => h.time);
          this.chartInstance.data.datasets[0].data = history.map(h => h.totalPower_kW);
          this.chartInstance.update('none'); // Update performante sans animation
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
