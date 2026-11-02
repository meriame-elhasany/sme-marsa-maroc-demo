/**
 * MOTEUR DE SURVEILLANCE DES ALERTES — SCADA & ISO 50001
 * Évalue en temps réel les dérives et déclenche les alarmes normalisées.
 */

import { DB } from '../storage/db.js';

export const AlarmEngine = {
  checkAll(postes, latestReadings) {
    const activeAlerts = DB.get(DB.keys.ALERTES, []);
    let newAlertsAdded = false;

    postes.forEach(poste => {
      poste.tableaux.forEach(tableau => {
        tableau.departs.forEach(depart => {
          const reading = latestReadings.get(depart.compteurId);
          if (!reading) return;

          // 1. Détection de coupure Modbus
          if (reading.qualite === 'ABSENTE') {
            const alertKey = `ALT-COMM-${depart.compteurId}`;
            if (!activeAlerts.find(a => a.id === alertKey && a.statut !== 'CLOTUREE')) {
              activeAlerts.unshift({
                id: alertKey,
                compteurId: depart.compteurId,
                posteId: poste.id,
                type: "PERTE_COMMUNICATION",
                severite: "CRITIQUE",
                message: `Perte de communication Modbus TCP sur ${depart.nom} (${depart.compteurId})`,
                statut: "NOUVELLE",
                timestamp: new Date().toISOString(),
                historique: [
                  { timestamp: new Date().toISOString(), user: "SYSTÈME_SCADA", action: "Détection timeout Modbus > 1500 ms" }
                ]
              });
              newAlertsAdded = true;
            }
          }

          // 2. Détection de pic anormal / valeur aberrante
          if (reading.qualite === 'INVALIDE') {
            const alertKey = `ALT-VAL-${depart.compteurId}`;
            if (!activeAlerts.find(a => a.id === alertKey && a.statut !== 'CLOTUREE')) {
              activeAlerts.unshift({
                id: alertKey,
                compteurId: depart.compteurId,
                posteId: poste.id,
                type: "VALEUR_ABERRANTE",
                severite: "CRITIQUE",
                message: `Mesure hors gabarit physique détectée sur ${depart.compteurId} : ${reading.valeurs.puissanceActive_kW} kW`,
                statut: "NOUVELLE",
                timestamp: new Date().toISOString(),
                historique: [
                  { timestamp: new Date().toISOString(), user: "FILTRE_METROLOGIQUE", action: "Rejet automatique valeur hors plage" }
                ]
              });
              newAlertsAdded = true;
            }
          }

          // 3. Dépassement de seuil de puissance sur arrivée générale
          if (depart.isAggregateMaster && reading.qualite === 'OK') {
            const kw = reading.valeurs.puissanceActive_kW;
            if (kw > poste.seuilPuissance_kW) {
              const alertKey = `ALT-PWR-${poste.id}`;
              if (!activeAlerts.find(a => a.id === alertKey && a.statut !== 'CLOTUREE')) {
                activeAlerts.unshift({
                  id: alertKey,
                  compteurId: depart.compteurId,
                  posteId: poste.id,
                  type: "DEPASSEMENT_PUISSANCE",
                  severite: "MAJEURE",
                  message: `Seuil de puissance dépassé sur ${poste.nom} : ${kw} kW (Seuil : ${poste.seuilPuissance_kW} kW)`,
                  statut: "NOUVELLE",
                  timestamp: new Date().toISOString(),
                  historique: [
                    { timestamp: new Date().toISOString(), user: "SURVEILLANCE_CHARGE", action: "Dépassement seuil d'exploitation" }
                  ]
                });
                newAlertsAdded = true;
              }
            }
          }
        });
      });
    });

    if (newAlertsAdded) {
      DB.set(DB.keys.ALERTES, activeAlerts);
    }

    return activeAlerts;
  }
};
