/**
 * INJECTEUR DE DÉFAUTS — DÉMONSTRATION INTERACTIVE
 * Permet d'éprouver la résilience du SME Marsa Maroc :
 * - Coupure de communication Modbus (timeout)
 * - Valeur aberrante (hors plage physique)
 * - Paquet de mesure manquant
 * - Reprise après coupure sans doublons
 */

export const FaultInjector = {
  activeFaults: {
    disconnectedMeters: new Set(),
    abnormalValues: new Map(), // meterId -> { field, value }
    droppedPackets: new Set()
  },

  listeners: [],

  subscribe(callback) {
    this.listeners.push(callback);
  },

  notify() {
    this.listeners.forEach(cb => cb(this.activeFaults));
  },

  disconnectMeter(meterId) {
    this.activeFaults.disconnectedMeters.add(meterId);
    this.notify();
  },

  reconnectMeter(meterId) {
    this.activeFaults.disconnectedMeters.delete(meterId);
    this.notify();
  },

  injectSpike(meterId, field = 'puissanceActive_kW', val = 4250.0) {
    this.activeFaults.abnormalValues.set(meterId, { field, val });
    this.notify();
  },

  clearSpike(meterId) {
    this.activeFaults.abnormalValues.delete(meterId);
    this.notify();
  },

  dropPackets(meterId) {
    this.activeFaults.droppedPackets.add(meterId);
    this.notify();
  },

  restoreAll() {
    this.activeFaults.disconnectedMeters.clear();
    this.activeFaults.abnormalValues.clear();
    this.activeFaults.droppedPackets.clear();
    this.notify();
  },

  isDisconnected(meterId) {
    return this.activeFaults.disconnectedMeters.has(meterId);
  },

  getAbnormalValue(meterId) {
    return this.activeFaults.abnormalValues.get(meterId);
  },

  isPacketDropped(meterId) {
    return this.activeFaults.droppedPackets.has(meterId);
  }
};
