/**
 * COUCHE DE SIMULATION MODBUS TCP/IP (PORT 502)
 * Émule les trames industrielles, la table des registres Holding
 * et les facteurs d'échelle pour chaque compteur.
 */

export const ModbusLayer = {
  // Définition standard des registres Holding (40001+)
  REGISTER_MAP: {
    40001: { name: 'ActivePower_kW', type: 'FLOAT32', words: 2, scale: 1.0, unit: 'kW' },
    40003: { name: 'ReactivePower_kVAR', type: 'FLOAT32', words: 2, scale: 1.0, unit: 'kVAR' },
    40005: { name: 'ActiveEnergyImport_kWh', type: 'UINT32', words: 2, scale: 0.1, unit: 'kWh' },
    40007: { name: 'ActiveEnergyExport_kWh', type: 'UINT32', words: 2, scale: 0.1, unit: 'kWh' },
    40009: { name: 'VoltageL1N_V', type: 'FLOAT32', words: 2, scale: 0.1, unit: 'V' },
    40011: { name: 'CurrentL1_A', type: 'FLOAT32', words: 2, scale: 0.1, unit: 'A' },
    40013: { name: 'Frequency_Hz', type: 'FLOAT32', words: 2, scale: 0.01, unit: 'Hz' },
    40015: { name: 'PowerFactor', type: 'FLOAT32', words: 2, scale: 0.001, unit: '' }
  },

  /**
   * Simule une requête Modbus TCP :
   * MBAP Header (Transaction ID, Protocol 0, Length, Unit ID) + PDU (FC 03, Start Reg, Count)
   */
  async readHoldingRegisters(compteur, startRegister = 40001, count = 16) {
    const startTime = performance.now();
    
    // Simulation latence réseau (15 à 45 ms sur réseau local industriel)
    const latency = 15 + Math.random() * 30;

    return new Promise((resolve) => {
      setTimeout(() => {
        const responseTimeMs = Math.round(performance.now() - startTime + latency);

        // Si le compteur est en panne ou indisponible
        if (compteur.statut === 'DECONNECTE' || compteur.modbus.status === 'TIMEOUT') {
          resolve({
            success: false,
            error: 'MODBUS_TIMEOUT_EXCEPTION_0x0B',
            ip: compteur.modbus.ipAddress,
            port: compteur.modbus.port,
            unitId: compteur.modbus.unitId,
            responseTimeMs: compteur.modbus.timeoutMs
          });
          return;
        }

        resolve({
          success: true,
          ip: compteur.modbus.ipAddress,
          port: compteur.modbus.port,
          unitId: compteur.modbus.unitId,
          functionCode: 3,
          startRegister,
          registerCount: count,
          rawRegistersHex: this._generateHexDump(count),
          responseTimeMs
        });
      }, 50); // Délai réactif dans le navigateur
    });
  },

  _generateHexDump(wordCount) {
    const words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push('0x' + Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0').toUpperCase());
    }
    return words.join(' ');
  }
};
