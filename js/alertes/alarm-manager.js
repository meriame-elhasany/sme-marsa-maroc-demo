/**
 * GESTIONNAIRE DU CYCLE DE VIE DES ALERTES
 * Transitions : NOUVELLE -> PRISE_EN_CHARGE -> CLÔTURÉE
 */

import { DB } from '../storage/db.js';

export const AlarmManager = {
  getAlerts(filterStatus = 'ALL', filterSeverity = 'ALL') {
    const list = DB.get(DB.keys.ALERTES, []);
    return list.filter(a => {
      const matchStatus = filterStatus === 'ALL' || a.statut === filterStatus;
      const matchSeverity = filterSeverity === 'ALL' || a.severite === filterSeverity;
      return matchStatus && matchSeverity;
    });
  },

  acknowledge(alertId, userComment = "") {
    const alerts = DB.get(DB.keys.ALERTES, []);
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return false;

    const user = DB.get(DB.keys.USER, { nom: "Exploitant" });
    alert.statut = "PRISE_EN_CHARGE";
    alert.historique.push({
      timestamp: new Date().toISOString(),
      user: user.nom,
      action: `Prise en charge${userComment ? ' : ' + userComment : ''}`
    });

    DB.set(DB.keys.ALERTES, alerts);
    DB.logAudit("ACQUITTEMENT_ALARME", `Prise en charge alarme ${alertId} (${alert.type}) par ${user.nom}`);
    return true;
  },

  close(alertId, resolutionComment = "") {
    const alerts = DB.get(DB.keys.ALERTES, []);
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return false;

    const user = DB.get(DB.keys.USER, { nom: "Exploitant" });
    alert.statut = "CLOTUREE";
    alert.historique.push({
      timestamp: new Date().toISOString(),
      user: user.nom,
      action: `Clôture de l'alarme${resolutionComment ? ' : ' + resolutionComment : ''}`
    });

    DB.set(DB.keys.ALERTES, alerts);
    DB.logAudit("CLOTURE_ALARME", `Clôture de l'alarme ${alertId} par ${user.nom}. Motif: ${resolutionComment || 'Non spécifié'}`);
    return true;
  }
};
