/**
 * COUCHE D'ABSTRACTION STOCKAGE LOCAL (LocalStorage)
 * Système de Monitoring Énergétique Marsa Maroc — Port d'Agadir
 */

import {
  DEFAULT_POSTES,
  DEFAULT_COMPTEURS,
  DEFAULT_IPES,
  DEFAULT_SER,
  DEFAULT_ALERTES,
  DEFAULT_RECETTE_TESTS,
  DEFAULT_GANTT,
  DEFAULT_QUIZ,
  DEFAULT_AUDIT_LOG
} from './default-data.js';

const STORAGE_KEYS = {
  POSTES: 'sme_marsa_postes',
  COMPTEURS: 'sme_marsa_compteurs',
  IPES: 'sme_marsa_ipes',
  SER: 'sme_marsa_ser',
  ALERTES: 'sme_marsa_alertes',
  RECETTE: 'sme_marsa_recette',
  GANTT: 'sme_marsa_gantt',
  QUIZ: 'sme_marsa_quiz',
  AUDIT: 'sme_marsa_audit',
  USER: 'sme_marsa_current_user',
  THEME: 'sme_marsa_theme'
};

export const DB = {
  keys: STORAGE_KEYS,

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.POSTES)) {
      this.resetToDefaults();
    }
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.POSTES, JSON.stringify(DEFAULT_POSTES));
    localStorage.setItem(STORAGE_KEYS.COMPTEURS, JSON.stringify(DEFAULT_COMPTEURS));
    localStorage.setItem(STORAGE_KEYS.IPES, JSON.stringify(DEFAULT_IPES));
    localStorage.setItem(STORAGE_KEYS.SER, JSON.stringify(DEFAULT_SER));
    localStorage.setItem(STORAGE_KEYS.ALERTES, JSON.stringify(DEFAULT_ALERTES));
    localStorage.setItem(STORAGE_KEYS.RECETTE, JSON.stringify(DEFAULT_RECETTE_TESTS));
    localStorage.setItem(STORAGE_KEYS.GANTT, JSON.stringify(DEFAULT_GANTT));
    localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(DEFAULT_QUIZ));
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(DEFAULT_AUDIT_LOG));
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
        id: "admin",
        nom: "M. Tazi (Admin Système)",
        role: "ADMIN",
        libelle: "Administrateur technique"
      }));
    }
  },

  get(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Erreur lecture storage [${key}]:`, e);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Erreur écriture storage [${key}]:`, e);
      return false;
    }
  },

  logAudit(action, details) {
    try {
      const user = this.get(STORAGE_KEYS.USER, { nom: "Utilisateur inconnu", libelle: "Lecteur" });
      const logs = this.get(STORAGE_KEYS.AUDIT, []);
      const newEntry = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        utilisateur: user.nom,
        role: user.libelle,
        action,
        details
      };
      logs.unshift(newEntry);
      if (logs.length > 200) logs.pop(); // Conserve les 200 derniers événements
      this.set(STORAGE_KEYS.AUDIT, logs);
      return newEntry;
    } catch (e) {
      console.error("Erreur logAudit:", e);
    }
  },

  exportBackup() {
    const backup = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      site: "Marsa Maroc — Port d'Agadir (12/DEPA/2026)",
      data: {
        postes: this.get(STORAGE_KEYS.POSTES),
        compteurs: this.get(STORAGE_KEYS.COMPTEURS),
        ipes: this.get(STORAGE_KEYS.IPES),
        ser: this.get(STORAGE_KEYS.SER),
        alertes: this.get(STORAGE_KEYS.ALERTES),
        recette: this.get(STORAGE_KEYS.RECETTE),
        gantt: this.get(STORAGE_KEYS.GANTT),
        audit: this.get(STORAGE_KEYS.AUDIT)
      }
    };
    return JSON.stringify(backup, null, 2);
  },

  restoreBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !parsed.data.postes || !parsed.data.compteurs) {
        throw new Error("Format de fichier de sauvegarde invalide.");
      }
      this.set(STORAGE_KEYS.POSTES, parsed.data.postes);
      this.set(STORAGE_KEYS.COMPTEURS, parsed.data.compteurs);
      if (parsed.data.ipes) this.set(STORAGE_KEYS.IPES, parsed.data.ipes);
      if (parsed.data.ser) this.set(STORAGE_KEYS.SER, parsed.data.ser);
      if (parsed.data.alertes) this.set(STORAGE_KEYS.ALERTES, parsed.data.alertes);
      if (parsed.data.recette) this.set(STORAGE_KEYS.RECETTE, parsed.data.recette);
      if (parsed.data.gantt) this.set(STORAGE_KEYS.GANTT, parsed.data.gantt);
      if (parsed.data.audit) this.set(STORAGE_KEYS.AUDIT, parsed.data.audit);
      this.logAudit("RESTAURATION_SAUVEGARDE", "Restauration complète de la configuration depuis un fichier JSON");
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
