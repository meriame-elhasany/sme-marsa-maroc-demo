/**
 * JOURNAL D'AUDIT ET TRAÇABILITÉ (ISO 50001 / SCADA)
 * Enregistrement inaltérable des actions sensibles.
 */

import { DB } from '../storage/db.js';

export const AuditService = {
  getLogs() {
    return DB.get(DB.keys.AUDIT, []);
  },

  exportCSV() {
    const logs = this.getLogs();
    const headers = ["ID", "Horodatage (UTC)", "Utilisateur", "Rôle", "Action", "Détails"];
    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.utilisateur}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_trail_sme_marsa_maroc_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
