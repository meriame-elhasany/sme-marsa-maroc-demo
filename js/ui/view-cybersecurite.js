/**
 * VUE CYBERSÉCURITÉ & FIABILITÉ DES DONNÉES
 * Résumé des contre-mesures industrielles, export & restauration complète de sauvegarde JSON.
 */

import { DB } from '../storage/db.js';
import { Auth } from '../auth/auth.js';

export const ViewCybersecurite = {
  render(container) {
    const canManageBackup = Auth.hasPermission('BACKUP_RESTORE');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Cybersécurité Industrielle & Intégrité des Données</h1>
          <div class="page-subtitle">Protection du bus Modbus TCP, politique de cloisonnement et gestion des sauvegardes</div>
        </div>
      </div>

      <!-- MATRICE DES MESURES DE SÉCURITÉ -->
      <div class="grid-cards">
        <div class="card">
          <div class="card-title">
            <span>Cloisonnement Réseau (OT vs IT)</span>
            <span class="scada-led ok"></span>
          </div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6; margin-bottom:0.75rem;">
            Le bus Modbus TCP (port 502) est strictement confiné au <strong>VLAN 12 industriel</strong>. Aucun paquet Modbus ne traverse le pare-feu vers le réseau d'entreprise ou vers l'extérieur.
          </p>
          <div class="badge-ref" style="font-size:10px;">Isolation Physique & Logique DMZ</div>
        </div>

        <div class="card">
          <div class="card-title">
            <span>Vulnérabilités Modbus TCP & Mitigations</span>
            <span class="scada-led warning"></span>
          </div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6; margin-bottom:0.75rem;">
            Le protocole Modbus ne supportant nativement ni chiffrement ni authentification, la sécurité repose sur le filtrage strict des adresses MAC sur les switches industriels et l'interdiction de tout routage direct.
          </p>
          <div class="badge-ref" style="font-size:10px;">Port Security & Whitelisting MAC</div>
        </div>

        <div class="card">
          <div class="card-title">
            <span>Synchronisation Horaire (NTP)</span>
            <span class="scada-led ok"></span>
          </div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6; margin-bottom:0.75rem;">
            Tous les équipements, concentrateurs et postes de supervision sont asservis à un serveur de temps NTP interne de référence (Stratum 1), garantissant une précision d'horodatage inférieure à 100 ms.
          </p>
          <div class="badge-ref" style="font-size:10px;">NTP Synchro &lt; 100 ms</div>
        </div>

        <div class="card">
          <div class="card-title">
            <span>Contrôle d'Accès & Traçabilité (RBAC)</span>
            <span class="scada-led ok"></span>
          </div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6; margin-bottom:0.75rem;">
            Principe de moindre privilège appliqué aux 4 profils (Admin, Énergéticien, Exploitant, Lecteur). Toutes les modifications de configuration ou de seuils font l'objet d'une trace inaltérable dans le journal d'audit.
          </p>
          <div class="badge-ref" style="font-size:10px;">Audit Trail Horodaté</div>
        </div>
      </div>

      <!-- MODULE DE SAUVEGARDE & RESTAURATION -->
      <div class="card" style="margin-top:1rem;">
        <div class="card-title">
          <span>Gestion des Sauvegardes de Configuration & d'Historique</span>
          <span style="font-size:11px; color:var(--text-muted);">Format standard JSON portable</span>
        </div>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:1.5rem;">
          Permet d'exporter l'intégralité de l'état du système (paramètres des 6 postes, compteurs, cartographie Modbus, règles d'alertes, IPE, SER et journal d'audit) ou de restaurer une configuration antérieure en cas d'incident.
        </p>

        <div style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center;">
          <button id="btn-export-backup" class="btn btn-primary" ${!canManageBackup ? 'disabled' : ''}>
            💾 Exporter la sauvegarde complète (JSON)
          </button>

          <label class="btn btn-secondary ${!canManageBackup ? 'disabled' : ''}" style="margin:0; cursor:pointer;">
            📂 Restaurer depuis un fichier JSON
            <input type="file" id="file-restore-backup" accept=".json" style="display:none;" ${!canManageBackup ? 'disabled' : ''}>
          </label>

          <button id="btn-reset-factory" class="btn btn-danger btn-sm" ${!canManageBackup ? 'disabled' : ''} style="margin-left:auto;">
            ⚠️ Réinitialiser aux valeurs d'usine
          </button>
        </div>
        ${!canManageBackup ? `
          <div class="form-help" style="color:#f87171; margin-top:0.75rem;">
            * Action restreinte : Vous devez être connecté en tant qu'<strong>Administrateur technique</strong> pour effectuer des sauvegardes ou restaurations.
          </div>
        ` : ''}
      </div>
    `;

    this._bindEvents(container);
  },

  _bindEvents(container) {
    // Export JSON
    const btnExport = container.querySelector('#btn-export-backup');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const json = DB.exportBackup();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sme_marsa_maroc_backup_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        DB.logAudit("EXPORT_SAUVEGARDE", "Téléchargement d'une sauvegarde complète du système en format JSON");
        alert("✓ Sauvegarde JSON générée et téléchargée avec succès !");
      });
    }

    // Import JSON
    const fileInput = container.querySelector('#file-restore-backup');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const res = DB.restoreBackup(event.target.result);
          if (res.success) {
            alert("✓ Configuration restaurée avec succès ! L'application va se recharger.");
            window.location.reload();
          } else {
            alert(`❌ Erreur lors de la restauration : ${res.error}`);
          }
        };
        reader.readAsText(file);
      });
    }

    // Réinitialisation usine
    const btnReset = container.querySelector('#btn-reset-factory');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm("⚠️ Êtes-vous sûr de vouloir réinitialiser l'ensemble des données du système aux valeurs d'usine ? Toutes les modifications locales seront perdues.")) {
          DB.resetToDefaults();
          alert("✓ Système réinitialisé aux valeurs par défaut !");
          window.location.reload();
        }
      });
    }
  }
};
