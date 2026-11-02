/**
 * CONTRÔLE D'ACCÈS BASÉ SUR LES RÔLES (RBAC)
 * 4 profils conformes aux exigences du cahier des charges :
 * - Administrateur technique (Droits totaux, modbus, utilisateurs, sauvegarde)
 * - Responsable énergie (IPE, SER, seuils, rapports)
 * - Exploitant (Supervision, acquittement alarmes, recette SAT)
 * - Lecteur (Consultation seule)
 */

import { DB } from '../storage/db.js';

export const PROFILES = {
  ADMIN: {
    id: "admin",
    role: "ADMIN",
    nom: "Karim Tazi (Administrateur Technique)",
    libelle: "Administrateur technique",
    permissions: [
      "READ",
      "WRITE_CONFIG",
      "WRITE_THRESHOLDS",
      "ACK_ALARM",
      "COMMISSIONING",
      "BACKUP_RESTORE",
      "TEST_RECETTE"
    ]
  },
  ENERGY_MGR: {
    id: "energy_manager",
    role: "ENERGY_MGR",
    nom: "Fatima Zahra Bennani (Responsable Énergie)",
    libelle: "Responsable énergie",
    permissions: [
      "READ",
      "WRITE_THRESHOLDS",
      "EDIT_IPE",
      "EDIT_SER",
      "ACK_ALARM",
      "EXPORT_REPORTS"
    ]
  },
  OPERATOR: {
    id: "operator",
    role: "OPERATOR",
    nom: "Youssef El Amrani (Exploitant Portuaire)",
    libelle: "Exploitant",
    permissions: [
      "READ",
      "ACK_ALARM",
      "EXPORT_DATA",
      "TEST_RECETTE"
    ]
  },
  VIEWER: {
    id: "viewer",
    role: "VIEWER",
    nom: "Visiteur / Auditeur externe",
    libelle: "Lecteur",
    permissions: [
      "READ"
    ]
  }
};

export const Auth = {
  getCurrentUser() {
    const saved = DB.get(DB.keys.USER);
    if (saved && PROFILES[saved.role]) {
      return PROFILES[saved.role];
    }
    return PROFILES.ADMIN;
  },

  switchUser(roleKey) {
    const profile = PROFILES[roleKey];
    if (profile) {
      DB.set(DB.keys.USER, {
        id: profile.id,
        nom: profile.nom,
        role: profile.role,
        libelle: profile.libelle
      });
      DB.logAudit("CHANGEMENT_PROFIL", `Session basculée vers le profil ${profile.libelle} (${profile.nom})`);
      window.dispatchEvent(new CustomEvent('auth:change', { detail: profile }));
      return profile;
    }
    return null;
  },

  hasPermission(perm) {
    const user = this.getCurrentUser();
    return user.permissions.includes(perm);
  }
};
