/**
 * GÉNÉRATEUR DE RAPPORTS D'EXPLOITATION & BILANS ÉNERGÉTIQUES
 * Conforme aux rapports périodiques ISO 50001 (DEPA - Port d'Agadir)
 */

import { DB } from '../storage/db.js';
import { Aggregations } from '../calculs/aggregations.js';
import { SimEngine } from '../simulation/engine.js';
import { IPEEngine } from '../calculs/ipe.js';
import { SEREngine } from '../calculs/ser.js';

export const ReportGenerator = {
  generateEnergyReport(type = 'JOURNALIER', dateStr = new Date().toLocaleDateString('fr-FR')) {
    const postes = DB.get(DB.keys.POSTES, []);
    const ipes = DB.get(DB.keys.IPES, []);
    const ser = DB.get(DB.keys.SER, {});
    const alerts = DB.get(DB.keys.ALERTES, []);

    const totals = Aggregations.calculateSiteTotals(postes, SimEngine.latestReadings);
    const ipesEvaluated = IPEEngine.calculateAll(ipes, SimEngine.latestReadings);
    const serComparison = SEREngine.generateMonthlyComparison(ser);

    return {
      titre: `Bilan Énergétique ${type} — Port d'Agadir`,
      referenceAO: "Appel d'Offres n° 12/DEPA/2026",
      dateRapport: dateStr,
      horodatageGen: new Date().toISOString(),
      mentionLegale: "Données générées par simulation — Démonstration SME Marsa Maroc",
      totauxSite: totals,
      ipes: ipesEvaluated,
      ser: {
        baselineMWh: (serComparison.totalBaseline_kWh / 1000).toFixed(1),
        observeMWh: (serComparison.totalObserved_kWh / 1000).toFixed(1),
        economiesMWh: (serComparison.totalSavings_kWh / 1000).toFixed(1),
        economiesMAD: serComparison.totalSavings_MAD.toLocaleString('fr-FR')
      },
      alertesActivesCount: alerts.filter(a => a.statut !== 'CLOTUREE').length,
      qualiteDonnees: {
        tauxDisponibilPct: 98.6,
        tauxMesuresValidesPct: 99.4,
        tramesModbusTotal: 86400,
        tramesRejetees: 12
      }
    };
  }
};
