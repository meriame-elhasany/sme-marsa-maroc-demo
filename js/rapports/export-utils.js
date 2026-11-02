/**
 * UTILITAIRES D'EXPORTATION & IMPRESSION PDF
 * Système de Monitoring Énergétique Marsa Maroc — Port d'Agadir
 */

export const ExportUtils = {
  downloadCSV(filename, headers, rows) {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [
      headers.join(';'),
      ...rows.map(r => r.map(val => `"${(val !== undefined && val !== null ? val : '').toString().replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  printDocument() {
    window.print();
  }
};
