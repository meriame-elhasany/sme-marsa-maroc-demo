/**
 * VUE CONSOLE DES ALERTES & GESTION DES SEUILS — SCADA & ISO 50001
 * Cycle de vie complet des alertes et configuration des seuils critiques.
 */

import { DB } from '../storage/db.js';
import { AlarmManager } from '../alertes/alarm-manager.js';
import { Auth } from '../auth/auth.js';

export const ViewAlertes = {
  filterStatus: 'ALL',
  filterSeverity: 'ALL',

  render(container) {
    const alerts = AlarmManager.getAlerts(this.filterStatus, this.filterSeverity);
    const postes = DB.get(DB.keys.POSTES, []);
    const canAck = Auth.hasPermission('ACK_ALARM');
    const canEditThresholds = Auth.hasPermission('WRITE_THRESHOLDS');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Console des Alarmes & Gestion des Seuils</h1>
          <div class="page-subtitle">Détection des anomalies de mesurage, coupures de communication et dérives énergétiques</div>
        </div>
      </div>

      <!-- BANDEAU CANAUX NOTIFICATION -->
      <div style="background-color:rgba(6, 182, 212, 0.1); border:1px solid rgba(6, 182, 212, 0.3); border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.75rem;">
        <span style="font-size:1.2rem;">📧</span>
        <span style="font-size:12px; color:#a5f3fc;">
          <strong>Canaux de notification externes :</strong> Les relais E-mail (serveur SMTP Marsa Maroc) et SMS d'astreinte sont pré-câblés dans l'architecture et marqués <em>« à confirmer avec la DEPA »</em>.
        </span>
      </div>

      <!-- FILTRES D'AFFICHAGE DES ALERTES -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem;">
          <div style="display:flex; gap:0.75rem; align-items:center;">
            <label class="form-label" style="margin:0;">Filtrer par statut :</label>
            <select id="select-filter-status" class="form-control" style="width:auto; padding:3px 8px;">
              <option value="ALL" ${this.filterStatus === 'ALL' ? 'selected' : ''}>Toutes les alertes</option>
              <option value="NOUVELLE" ${this.filterStatus === 'NOUVELLE' ? 'selected' : ''}>Nouvelles uniquement</option>
              <option value="PRISE_EN_CHARGE" ${this.filterStatus === 'PRISE_EN_CHARGE' ? 'selected' : ''}>Prises en charge</option>
              <option value="CLOTUREE" ${this.filterStatus === 'CLOTUREE' ? 'selected' : ''}>Clôturées (Historique)</option>
            </select>
          </div>

          <div style="display:flex; gap:0.75rem; align-items:center;">
            <label class="form-label" style="margin:0;">Sévérité :</label>
            <select id="select-filter-sev" class="form-control" style="width:auto; padding:3px 8px;">
              <option value="ALL" ${this.filterSeverity === 'ALL' ? 'selected' : ''}>Toutes sévérités</option>
              <option value="CRITIQUE" ${this.filterSeverity === 'CRITIQUE' ? 'selected' : ''}>Critique (Rouge)</option>
              <option value="MAJEURE" ${this.filterSeverity === 'MAJEURE' ? 'selected' : ''}>Majeure (Ambre)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- TABLEAU DES ALERTES SCADA -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-title">
          <span>Journal des Alarmes Actives & Historique (${alerts.length})</span>
        </div>
        <div class="table-responsive">
          <table class="scada-table">
            <thead>
              <tr>
                <th>Statut</th>
                <th>Sévérité</th>
                <th>Horodatage</th>
                <th>Poste / Compteur</th>
                <th>Description de l'Anomalie</th>
                <th>Action Opérateur</th>
              </tr>
            </thead>
            <tbody>
              ${alerts.length ? alerts.map(a => this._renderAlertRow(a, canAck)).join('') : `
                <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">Aucune alerte correspondant aux filtres.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- PANNEAU DE CONFIGURATION DES SEUILS D'EXPLOITATION -->
      <div class="card">
        <div class="card-title">
          <span>Paramétrage des Seuils de Déclenchement par Poste</span>
          <span style="font-size:11px; color:var(--text-muted);">Réservé aux profils autorisés (Admin & Resp. Énergie)</span>
        </div>
        <div class="table-responsive">
          <table class="scada-table">
            <thead>
              <tr>
                <th>Poste Électrique</th>
                <th>Puissance Souscrite (kVA)</th>
                <th>Seuil d'Alerte Actuel (kW)</th>
                <th>Seuil Min cos φ</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${postes.map(p => `
                <tr>
                  <td><strong>${p.nom}</strong></td>
                  <td class="mono">${p.puissanceSouscrite_kVA} kVA</td>
                  <td>
                    <input type="number" class="form-control threshold-input" data-poste="${p.id}" value="${p.seuilPuissance_kW}" style="width:110px; display:inline-block;" ${!canEditThresholds ? 'disabled' : ''}> kW
                  </td>
                  <td class="mono">0.900 (Fixe CEI)</td>
                  <td>
                    ${canEditThresholds ? `
                      <button class="btn btn-secondary btn-sm btn-save-threshold" data-poste="${p.id}">
                        Enregistrer seuil
                      </button>
                    ` : `<span style="font-size:11px; color:var(--text-muted);">Lecture seule</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this._bindEvents(container);
  },

  _renderAlertRow(a, canAck) {
    let sevBadge = `<span class="badge-ref" style="background-color:rgba(239,68,68,0.2); color:#f87171;">CRITIQUE</span>`;
    if (a.severite === 'MAJEURE') {
      sevBadge = `<span class="badge-ref" style="background-color:rgba(245,158,11,0.2); color:#fbbf24;">MAJEURE</span>`;
    }

    let statusBadge = `<span class="freshness-badge stale">NOUVELLE</span>`;
    if (a.statut === 'PRISE_EN_CHARGE') {
      statusBadge = `<span class="freshness-badge delayed">EN COURS</span>`;
    } else if (a.statut === 'CLOTUREE') {
      statusBadge = `<span class="freshness-badge realtime">CLÔTURÉE</span>`;
    }

    return `
      <tr>
        <td>${statusBadge}</td>
        <td>${sevBadge}</td>
        <td class="mono" style="font-size:11px;">${new Date(a.timestamp).toLocaleTimeString()}</td>
        <td><strong>${a.posteId}</strong> <span style="font-size:11px; color:var(--text-muted);">(${a.compteurId})</span></td>
        <td>${a.message}</td>
        <td>
          ${canAck && a.statut === 'NOUVELLE' ? `
            <button class="btn btn-primary btn-sm btn-ack-alarm" data-id="${a.id}">
              Prendre en charge
            </button>
          ` : ''}
          ${canAck && a.statut === 'PRISE_EN_CHARGE' ? `
            <button class="btn btn-success btn-sm btn-close-alarm" data-id="${a.id}">
              Clôturer
            </button>
          ` : ''}
          ${a.statut === 'CLOTUREE' ? `
            <span style="font-size:11px; color:var(--text-muted);">Archivée</span>
          ` : ''}
        </td>
      </tr>
    `;
  },

  _bindEvents(container) {
    // Filtres
    const selStatus = container.querySelector('#select-filter-status');
    if (selStatus) {
      selStatus.addEventListener('change', (e) => {
        this.filterStatus = e.target.value;
        this.render(container);
      });
    }

    const selSev = container.querySelector('#select-filter-sev');
    if (selSev) {
      selSev.addEventListener('change', (e) => {
        this.filterSeverity = e.target.value;
        this.render(container);
      });
    }

    // Prise en charge
    container.querySelectorAll('.btn-ack-alarm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const comment = prompt("Commentaire de prise en charge (action immédiate entreprise) :", "Contrôle visuel TGBT et analyse charge");
        if (comment !== null) {
          AlarmManager.acknowledge(id, comment);
          this.render(container);
        }
      });
    });

    // Clôture
    container.querySelectorAll('.btn-close-alarm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const comment = prompt("Commentaire de clôture (justification de résolution) :", "Paramètre rétabli dans la plage nominale");
        if (comment !== null) {
          AlarmManager.close(id, comment);
          this.render(container);
        }
      });
    });

    // Enregistrement des seuils
    container.querySelectorAll('.btn-save-threshold').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const posteId = e.currentTarget.getAttribute('data-poste');
        const input = container.querySelector(`.threshold-input[data-poste="${posteId}"]`);
        if (input) {
          const newVal = parseInt(input.value, 10);
          const postes = DB.get(DB.keys.POSTES, []);
          const poste = postes.find(p => p.id === posteId);
          if (poste) {
            const oldVal = poste.seuilPuissance_kW;
            poste.seuilPuissance_kW = newVal;
            DB.set(DB.keys.POSTES, postes);
            DB.logAudit("MODIFICATION_SEUIL", `Ajustement seuil de puissance sur ${poste.nom} : ${oldVal} kW -> ${newVal} kW`);
            alert(`✓ Seuil d'alerte du ${poste.nom} mis à jour à ${newVal} kW.`);
          }
        }
      });
    });
  }
};
