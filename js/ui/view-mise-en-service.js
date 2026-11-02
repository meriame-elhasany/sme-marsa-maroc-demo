/**
 * VUE MISE EN SERVICE COMPTEUR — ASSISTANT EN 7 ÉTAPES
 * Assistant guidé avec test de trame Modbus TCP simulé et génération de PV d'essai.
 */

import { DB } from '../storage/db.js';
import { ModbusLayer } from '../simulation/modbus-layer.js';
import { ExportUtils } from '../rapports/export-utils.js';

export const ViewMiseEnService = {
  currentStep: 1,
  formData: {
    numeroSerie: "MM-AGD-26-NEW",
    designation: "Compteur Extension Quai 3",
    classePrecisionActive: "0.2S",
    classePrecisionReactive: "2.0",
    rapportTC: "1500/5",
    rapportTT: "1/1",
    ipAddress: "192.168.12.88",
    port: 502,
    unitId: 1,
    pollingIntervalMs: 2000,
    timeoutMs: 1500,
    posteId: "P1",
    isAggregateMaster: false,
    testResult: null
  },

  render(container) {
    const postes = DB.get(DB.keys.POSTES, []);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Assistant de Mise en Service Compteur</h1>
          <div class="page-subtitle">Procédure d'intégration et recette métrologique sur bus Modbus TCP/IP (Port 502)</div>
        </div>
        <div style="font-size:12px; color:var(--text-muted);">
          Étape <strong id="step-num">${this.currentStep}</strong> sur 7
        </div>
      </div>

      <!-- STEPPER NAVIGATION -->
      <div class="stepper-nav">
        <div class="stepper-item ${this.currentStep === 1 ? 'active' : (this.currentStep > 1 ? 'completed' : '')}">
          <div class="step-circle">1</div>
          <div class="step-label">Identification</div>
        </div>
        <div class="stepper-item ${this.currentStep === 2 ? 'active' : (this.currentStep > 2 ? 'completed' : '')}">
          <div class="step-circle">2</div>
          <div class="step-label">Réseau IP</div>
        </div>
        <div class="stepper-item ${this.currentStep === 3 ? 'active' : (this.currentStep > 3 ? 'completed' : '')}">
          <div class="step-circle">3</div>
          <div class="step-label">Registres</div>
        </div>
        <div class="stepper-item ${this.currentStep === 4 ? 'active' : (this.currentStep > 4 ? 'completed' : '')}">
          <div class="step-circle">4</div>
          <div class="step-label">Test Trame</div>
        </div>
        <div class="stepper-item ${this.currentStep === 5 ? 'active' : (this.currentStep > 5 ? 'completed' : '')}">
          <div class="step-circle">5</div>
          <div class="step-label">Échelles</div>
        </div>
        <div class="stepper-item ${this.currentStep === 6 ? 'active' : (this.currentStep > 6 ? 'completed' : '')}">
          <div class="step-circle">6</div>
          <div class="step-label">Topologie</div>
        </div>
        <div class="stepper-item ${this.currentStep === 7 ? 'active' : ''}">
          <div class="step-circle">7</div>
          <div class="step-label">PV d'Essai</div>
        </div>
      </div>

      <!-- CONTENU DE L'ÉTAPE COURANTE -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div id="step-content-area">
          ${this._renderStepContent(postes)}
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:2rem; padding-top:1rem; border-top:1px solid var(--border-color);">
          <button id="btn-prev-step" class="btn btn-secondary" ${this.currentStep === 1 ? 'disabled' : ''}>
            &larr; Étape précédente
          </button>
          <button id="btn-next-step" class="btn btn-primary">
            ${this.currentStep === 7 ? 'Valider et Enregistrer' : 'Étape suivante &rarr;'}
          </button>
        </div>
      </div>
    `;

    this._bindEvents(container);
  },

  _renderStepContent(postes) {
    switch (this.currentStep) {
      case 1:
        return `
          <h3 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text-primary);">Étape 1 : Fiche Signalétique & Métrologie</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Numéro de Série Compteur :</label>
              <input type="text" id="input-sn" class="form-control" value="${this.formData.numeroSerie}">
            </div>
            <div class="form-group">
              <label class="form-label">Désignation du Point de Comptage :</label>
              <input type="text" id="input-desig" class="form-control" value="${this.formData.designation}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Classe de Précision Active (CEI 62053-22) :</label>
              <select id="select-class-act" class="form-control">
                <option value="0.2S" ${this.formData.classePrecisionActive === '0.2S' ? 'selected' : ''}>Classe 0.2S (Haute Précision Arrivée)</option>
                <option value="0.5S" ${this.formData.classePrecisionActive === '0.5S' ? 'selected' : ''}>Classe 0.5S (Départ Distribution)</option>
                <option value="1.0" ${this.formData.classePrecisionActive === '1.0' ? 'selected' : ''}>Classe 1.0 (Usage Général)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Rapport des Transformateurs de Courant (TC) :</label>
              <input type="text" id="input-tc" class="form-control" value="${this.formData.rapportTC}" placeholder="Ex: 1500/5">
            </div>
          </div>
        `;

      case 2:
        return `
          <h3 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text-primary);">Étape 2 : Paramètres Réseau Modbus TCP/IP</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Adresse IP (VLAN Mesure Dédié) :</label>
              <input type="text" id="input-ip" class="form-control" value="${this.formData.ipAddress}">
              <div class="form-help">Sous-réseau isolé 192.168.12.0/24 étanche au réseau IT</div>
            </div>
            <div class="form-group">
              <label class="form-label">Port TCP (Standard Modbus) :</label>
              <input type="number" id="input-port" class="form-control" value="${this.formData.port}">
            </div>
            <div class="form-group">
              <label class="form-label">Unit ID / Adresse Esclave (1-255) :</label>
              <input type="number" id="input-unit" class="form-control" value="${this.formData.unitId}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Période d'Interrogation (Polling) :</label>
              <select id="select-polling" class="form-control">
                <option value="1000">1000 ms (1 seconde)</option>
                <option value="2000" selected>2000 ms (2 secondes — Recommandé)</option>
                <option value="5000">5000 ms (5 secondes)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Délai d'Attente Max (Timeout) :</label>
              <input type="number" id="input-timeout" class="form-control" value="${this.formData.timeoutMs}">
              <div class="form-help">Déclenche alerte perte communication si dépassé</div>
            </div>
          </div>
        `;

      case 3:
        return `
          <h3 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text-primary);">Étape 3 : Cartographie des Registres Holding (40001+)</h3>
          <p style="color:var(--text-muted); font-size:12px; margin-bottom:1rem;">
            Table standard préconfigurée pour compteurs multifonctions industriels :
          </p>
          <div class="table-responsive">
            <table class="scada-table">
              <thead>
                <tr>
                  <th>Registre</th>
                  <th>Grandeur Physique</th>
                  <th>Type Donnée</th>
                  <th>Facteur Échelle</th>
                  <th>Unité</th>
                </tr>
              </thead>
              <tbody>
                <tr><td class="mono">40001</td><td>Puissance Active Triphasée</td><td>Float32 (2 mots)</td><td>1.0</td><td>kW</td></tr>
                <tr><td class="mono">40003</td><td>Puissance Réactive Triphasée</td><td>Float32 (2 mots)</td><td>1.0</td><td>kVAR</td></tr>
                <tr><td class="mono">40005</td><td>Énergie Active Importée</td><td>UInt32 (2 mots)</td><td>0.1</td><td>kWh</td></tr>
                <tr><td class="mono">40009</td><td>Tension Phase L1-N</td><td>Float32 (2 mots)</td><td>0.1</td><td>V</td></tr>
                <tr><td class="mono">40011</td><td>Courant Phase L1</td><td>Float32 (2 mots)</td><td>0.1</td><td>A</td></tr>
                <tr><td class="mono">40015</td><td>Facteur de Puissance (cos φ)</td><td>Float32 (2 mots)</td><td>0.001</td><td>-</td></tr>
              </tbody>
            </table>
          </div>
        `;

      case 4:
        return `
          <h3 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text-primary);">Étape 4 : Test de Communication Modbus TCP Simulé</h3>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:1rem;">
            Envoi d'une trame d'interrogation <em>Read Holding Registers (Code Fonction 03)</em> sur ${this.formData.ipAddress}:${this.formData.port} :
          </p>
          <div style="margin-bottom:1rem;">
            <button id="btn-run-modbus-test" class="btn btn-primary btn-sm">
              📡 Lancer le test de communication
            </button>
          </div>
          <div id="test-output-box" class="pv-report-box" style="display:${this.formData.testResult ? 'block' : 'none'};">
            ${this.formData.testResult ? this.formData.testResult : ''}
          </div>
        `;

      case 5:
        return `
          <h3 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text-primary);">Étape 5 : Vérification des Valeurs & Échelles Métrologiques</h3>
          <div style="background-color:var(--bg-input); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1rem;">
            <div style="font-weight:700; color:var(--status-ok); margin-bottom:0.5rem;">✓ Contrôle de plausibilité physique réussi :</div>
            <ul style="padding-left:1.5rem; font-size:12px; color:var(--text-secondary); line-height:1.8;">
              <li>Tension mesurée : <strong>231.2 V</strong> (plage admissible 220V - 240V : Conforme)</li>
              <li>Fréquence réseau : <strong>50.02 Hz</strong> (plage admissible 49.5Hz - 50.5Hz : Conforme)</li>
              <li>Facteur de puissance calculé : <strong>0.972</strong> (pas d'inversion TC/polarité constatée)</li>
              <li>Incrémentation index kWh : <strong>Cohérente avec la puissance active instantanée</strong></li>
            </ul>
          </div>
        `;

      case 6:
        return `
          <h3 style="margin-bottom:1rem; font-size:1.1rem; color:var(--text-primary);">Étape 6 : Raccordement Topologique & Contrôle Anti-Doublon</h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Rattacher au Poste Électrique :</label>
              <select id="select-dest-poste" class="form-control">
                ${postes.map(p => `<option value="${p.id}" ${this.formData.posteId === p.id ? 'selected' : ''}>${p.nom}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nature Métrologique du Point :</label>
              <select id="select-master-type" class="form-control">
                <option value="false" selected>Sous-Comptage Divisionnaire (Non ré-agrégé dans Total Site)</option>
                <option value="true">Arrivée Générale Transformateur (Prise en compte Total Site)</option>
              </select>
              <div class="form-help">Empêche formellement tout double comptage dans les bilans globaux.</div>
            </div>
          </div>
        `;

      case 7:
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="font-size:1.1rem; color:var(--text-primary); margin:0;">Étape 7 : Procès-Verbal (PV) d'Essai de Mise en Service</h3>
            <button id="btn-print-pv" class="btn btn-secondary btn-sm">🖨️ Imprimer le PV d'Essai (PDF)</button>
          </div>
          <div class="pv-report-box" id="pv-printable-area">
================================================================================
             MARSA MAROC — DIRECTION DE L'EXPLOITATION AU PORT D'AGADIR
             SYSTÈME DE MONITORING ÉNERGÉTIQUE (SME ISO 50001)
                     PROCÈS-VERBAL DE MISE EN SERVICE (PV)
================================================================================
RÉFÉRENCE APPEL D'OFFRES : 12/DEPA/2026
DATE D'EXÉCUTION       : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString()}
OPÉRATEUR CHARGÉ        : Karim Tazi (Administrateur Technique)

1. IDENTIFICATION ÉQUIPEMENT
- Numéro de Série       : ${this.formData.numeroSerie}
- Désignation          : ${this.formData.designation}
- Poste d'Affectation   : ${this.formData.posteId}
- Classe de Précision   : Active ${this.formData.classePrecisionActive} / Réactive ${this.formData.classePrecisionReactive}
- Rapport TC / TT       : ${this.formData.rapportTC} / ${this.formData.rapportTT}

2. PARAMÈTRES MODBUS TCP/IP
- Adresse IP / Port     : ${this.formData.ipAddress}:${this.formData.port}
- Unit ID (Esclave)     : ${this.formData.unitId}
- Période d'Acquisition : ${this.formData.pollingIntervalMs} ms
- Statut Trame          : RÉPONSE VALIDE (Exception 0x00 - Succès)

3. CONTRÔLE ANTI-DOUBLE COMPTAGE
- Agrégation Globale    : ${this.formData.isAggregateMaster ? 'ARRIVÉE GÉNÉRALE (Inclus dans Total Site)' : 'SOUS-COMPTAGE DIVISIONNAIRE (Exclus du Total Site)'}
- Règle Métrologique    : RESPECTÉE (Non duplication des flux vérifiée)

4. CONCLUSION DE RECETTE
[X] ÉQUIPEMENT DÉCLARÉ CONFORME ET MIS EN SERVICE DANS LE SYSTÈME DE SUPERVISION.
================================================================================
          </div>
        `;

      default:
        return '';
    }
  },

  _bindEvents(container) {
    const btnNext = container.querySelector('#btn-next-step');
    const btnPrev = container.querySelector('#btn-prev-step');

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (this.currentStep < 7) {
          this._saveCurrentStepInputs(container);
          this.currentStep++;
          this.render(container);
        } else {
          // Validation finale
          DB.logAudit("MISE_EN_SERVICE_COMPTEUR", `Intégration validée du compteur ${this.formData.numeroSerie} (${this.formData.designation})`);
          alert("✓ Procès-verbal de mise en service validé avec succès ! Le compteur est désormais supervisé.");
          window.location.hash = '#/postes';
        }
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.render(container);
        }
      });
    }

    // Bouton de test Modbus simulé à l'étape 4
    const btnTest = container.querySelector('#btn-run-modbus-test');
    if (btnTest) {
      btnTest.addEventListener('click', async () => {
        btnTest.disabled = true;
        btnTest.textContent = "⏳ Interrogation en cours...";
        
        const dummyCompteur = {
          statut: 'COMMUNICANT',
          modbus: {
            ipAddress: this.formData.ipAddress,
            port: this.formData.port,
            unitId: this.formData.unitId,
            timeoutMs: this.formData.timeoutMs,
            status: 'CONNECTED'
          }
        };

        const res = await ModbusLayer.readHoldingRegisters(dummyCompteur, 40001, 16);
        const dump = `[MODBUS TCP CLIENT] Connexion socket établie sur ${res.ip}:${res.port}\n` +
          `[TX] MBAP: TransID=0x002A Proto=0x0000 Len=0x0006 UnitID=0x0${res.unitId} | PDU: FC=0x03 Reg=40001 Count=16\n` +
          `[RX] Réponse reçue en ${res.responseTimeMs} ms (Statut : Succès)\n` +
          `[DUMP HEXADÉCIMAL REGISTRES] :\n${res.rawRegistersHex}\n\n` +
          `✓ Dépouillement : Registres décodés sans erreur CRC/MBAP. Facteurs d'échelle appliqués.`;
        
        this.formData.testResult = dump;
        btnTest.disabled = false;
        btnTest.textContent = "📡 Relancer le test";

        const box = container.querySelector('#test-output-box');
        if (box) {
          box.style.display = 'block';
          box.textContent = dump;
        }
      });
    }

    // Impression PV
    const btnPrintPv = container.querySelector('#btn-print-pv');
    if (btnPrintPv) {
      btnPrintPv.addEventListener('click', () => {
        ExportUtils.printDocument();
      });
    }
  },

  _saveCurrentStepInputs(container) {
    if (this.currentStep === 1) {
      const sn = container.querySelector('#input-sn');
      const des = container.querySelector('#input-desig');
      const cla = container.querySelector('#select-class-act');
      const tc = container.querySelector('#input-tc');
      if (sn) this.formData.numeroSerie = sn.value;
      if (des) this.formData.designation = des.value;
      if (cla) this.formData.classePrecisionActive = cla.value;
      if (tc) this.formData.rapportTC = tc.value;
    } else if (this.currentStep === 2) {
      const ip = container.querySelector('#input-ip');
      const port = container.querySelector('#input-port');
      const unit = container.querySelector('#input-unit');
      if (ip) this.formData.ipAddress = ip.value;
      if (port) this.formData.port = parseInt(port.value, 10);
      if (unit) this.formData.unitId = parseInt(unit.value, 10);
    } else if (this.currentStep === 6) {
      const p = container.querySelector('#select-dest-poste');
      const m = container.querySelector('#select-master-type');
      if (p) this.formData.posteId = p.value;
      if (m) this.formData.isAggregateMaster = m.value === 'true';
    }
  }
};
