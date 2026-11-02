/**
 * VUE INDICATEURS DE PERFORMANCE ÉNERGÉTIQUE (IPE / EnPI) — ISO 50001
 * Formules documentées, suivi des dérives et gestion des versions.
 */

import { DB } from '../storage/db.js';
import { IPEEngine } from '../calculs/ipe.js';
import { SimEngine } from '../simulation/engine.js';
import { Auth } from '../auth/auth.js';

export const ViewIPE = {
  render(container) {
    const ipes = DB.get(DB.keys.IPES, []);
    const evaluatedIPEs = IPEEngine.calculateAll(ipes, SimEngine.latestReadings);
    const canEdit = Auth.hasPermission('EDIT_IPE');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Indicateurs de Performance Énergétique (IPE / EnPI)</h1>
          <div class="page-subtitle">Conformité ISO 50001:2018 — Suivi de l'efficacité par unité d'activité portuaire</div>
        </div>
        ${canEdit ? `
          <button id="btn-add-ipe" class="btn btn-primary btn-sm">
            ➕ Configurer un nouvel IPE
          </button>
        ` : ''}
      </div>

      <!-- BANDEAU MENTION LÉGALE -->
      <div style="background-color:rgba(234, 179, 8, 0.1); border:1px solid rgba(234, 179, 8, 0.3); border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.75rem;">
        <span style="font-size:1.2rem;">ℹ️</span>
        <span style="font-size:12px; color:#fef08a;">
          <strong>Cadre ISO 50001 :</strong> Les 3 indicateurs ci-dessous sont des <em>exemples illustratifs à valider formellement avec la DEPA Marsa Maroc</em> lors de l'établissement du plan de mesurage officiel.
        </span>
      </div>

      <!-- GRILLE DES IPE -->
      <div class="grid-cards">
        ${evaluatedIPEs.map(ipe => this._renderIPECard(ipe, canEdit)).join('')}
      </div>

      <!-- TABLEAU RÉCAPITULATIF & TRAÇABILITÉ DES VERSIONS -->
      <div class="card">
        <div class="card-title">
          <span>Spécifications & Historique des Versions des IPE</span>
        </div>
        <div class="table-responsive">
          <table class="scada-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Désignation</th>
                <th>Formule Documentée</th>
                <th>Périmètre</th>
                <th>Traitement Manquants</th>
                <th>Version Actuelle</th>
                <th>Date d'Effet</th>
              </tr>
            </thead>
            <tbody>
              ${evaluatedIPEs.map(ipe => `
                <tr>
                  <td class="mono" style="font-weight:700; color:var(--marsa-blue);">${ipe.code}</td>
                  <td><strong>${ipe.nom}</strong></td>
                  <td class="mono" style="font-size:11px;">${ipe.formule}</td>
                  <td>${ipe.perimetre.join(', ')}</td>
                  <td><span class="badge-ref" style="font-size:10px;">${ipe.gestionDonneesManquantes}</span></td>
                  <td>${ipe.versions ? ipe.versions[ipe.versions.length - 1].version : '1.0'}</td>
                  <td>${ipe.dateEntreeVigueur}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this._bindEvents(container);
  },

  _renderIPECard(ipe, canEdit) {
    let statusClass = "ok";
    let statusLabel = "CONFORME AUX OBJECTIFS";
    if (ipe.statut === 'ALERTE') {
      statusClass = "critical";
      statusLabel = "DÉPASSEMENT SEUIL ALERTE";
    } else if (ipe.statut === 'ATTENTION') {
      statusClass = "warning";
      statusLabel = "DÉRIVE PAR RAPPORT À LA CIBLE";
    }

    return `
      <div class="card" style="border-top:4px solid var(--${statusClass === 'ok' ? 'status-ok' : (statusClass === 'warning' ? 'status-warning' : 'status-critical')});">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
          <div>
            <span class="badge-ref" style="font-size:10px; font-weight:700;">${ipe.code}</span>
            <h3 style="font-size:1.05rem; font-weight:700; color:var(--text-primary); margin-top:4px;">${ipe.nom}</h3>
          </div>
          <span class="freshness-badge ${statusClass === 'ok' ? 'realtime' : (statusClass === 'warning' ? 'delayed' : 'stale')}">
            <span class="scada-led ${statusClass}"></span>
            ${statusLabel}
          </span>
        </div>

        <p style="font-size:12px; color:var(--text-muted); margin-bottom:1rem;">${ipe.description}</p>

        <div style="background-color:var(--bg-input); padding:0.75rem 1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:baseline;">
            <span class="scada-metric-label">Valeur Constatée</span>
            <span class="scada-metric-val" style="color:var(--${statusClass === 'ok' ? 'status-ok' : (statusClass === 'warning' ? 'status-warning' : 'status-critical')});">
              ${ipe.valeurCalculee} <span class="scada-metric-unit">${ipe.unite}</span>
            </span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-top:4px;">
            <span>Cible : ${ipe.seuilCible} ${ipe.unite}</span>
            <span>Alerte : ${ipe.seuilAlerte} ${ipe.unite}</span>
            <span>Écart : <strong>${ipe.ecartSeuilPct > 0 ? '+' : ''}${ipe.ecartSeuilPct} %</strong></span>
          </div>
        </div>

        <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-family-mono); background-color:var(--bg-secondary); padding:4px 8px; border-radius:4px;">
          Formule : ${ipe.formule}
        </div>
      </div>
    `;
  },

  _bindEvents(container) {
    const btnAdd = container.querySelector('#btn-add-ipe');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        alert("Formulaire d'ajout d'IPE : Permet de documenter une nouvelle formule selon la norme ISO 50001 (réservé Responsable Énergie).");
      });
    }
  }
};
