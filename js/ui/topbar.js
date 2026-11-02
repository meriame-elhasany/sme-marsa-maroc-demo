/**
 * BARRE SUPÉRIEURE (TOPBAR) & BANDEAU PERMANENT
 * Gestion de la vitesse de simulation, profil utilisateur actif et thème.
 */

import { Auth, PROFILES } from '../auth/auth.js';
import { SimEngine } from '../simulation/engine.js';
import { DB } from '../storage/db.js';

export const Topbar = {
  render(container) {
    const user = Auth.getCurrentUser();
    const currentTheme = localStorage.getItem(DB.keys.THEME) || 'dark';
    if (currentTheme === 'light') {
      document.body.classList.add('light-theme');
    }

    container.innerHTML = `
      <!-- BANDEAU PERMANENT D'HONNÊTETÉ DES DONNÉES -->
      <div class="demo-banner">
        <span>⚠️ DONNÉES SIMULÉES — DÉMONSTRATION DU SYSTÈME DE MONITORING ÉNERGÉTIQUE</span>
        <span class="badge-ref">AO 12/DEPA/2026 — PORT D'AGADIR</span>
      </div>

      <!-- BARRE SUPÉRIEURE SCADA -->
      <header class="topbar">
        <div class="topbar-left">
          <div class="brand-logo">
            <div class="logo-icon">MM</div>
            <span>MARSA MAROC <span style="font-weight:400; font-size:0.95em;">| SME AGADIR</span></span>
            <span class="tag-iso">ISO 50001</span>
          </div>
        </div>

        <div class="topbar-right">
          <!-- CONTRÔLE VITESSE SIMULATION -->
          <div class="sim-controls">
            <span class="sim-clock" id="sim-clock-display">00:00:00</span>
            <span style="font-size:11px; color:var(--text-muted); margin-right:4px;">Vitesse :</span>
            <button class="sim-speed-btn ${SimEngine.speed === 1 ? 'active' : ''}" data-speed="1" title="Temps réel (1s = 1s)">x1</button>
            <button class="sim-speed-btn ${SimEngine.speed === 10 ? 'active' : ''}" data-speed="10" title="Accéléré (1s = 10s)">x10</button>
            <button class="sim-speed-btn ${SimEngine.speed === 60 ? 'active' : ''}" data-speed="60" title="Très rapide (1s = 1 minute)">x60</button>
          </div>

          <!-- SÉLECTION DU PROFIL UTILISATEUR (RBAC) -->
          <div style="display:flex; align-items:center; gap:6px;">
            <label for="select-user-profile" style="font-size:11px; color:var(--text-muted);">Profil :</label>
            <select id="select-user-profile" class="form-control" style="width:auto; padding:3px 8px; font-size:12px; font-weight:600;">
              <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>Admin technique</option>
              <option value="ENERGY_MGR" ${user.role === 'ENERGY_MGR' ? 'selected' : ''}>Resp. énergie</option>
              <option value="OPERATOR" ${user.role === 'OPERATOR' ? 'selected' : ''}>Exploitant</option>
              <option value="VIEWER" ${user.role === 'VIEWER' ? 'selected' : ''}>Lecteur</option>
            </select>
          </div>

          <!-- BASCULE CLAIR / SOMBRE -->
          <button id="theme-toggle-btn" class="btn btn-secondary btn-sm" title="Basculer thème clair/sombre">
            ${currentTheme === 'light' ? '🌙 Sombre' : '☀️ Clair'}
          </button>
        </div>
      </header>
    `;

    this._bindEvents(container);
  },

  _bindEvents(container) {
    // Boutons de vitesse
    container.querySelectorAll('.sim-speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const speed = parseInt(e.currentTarget.getAttribute('data-speed'), 10);
        SimEngine.setSpeed(speed);
        container.querySelectorAll('.sim-speed-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Sélecteur de profil
    const selectProfile = container.querySelector('#select-user-profile');
    if (selectProfile) {
      selectProfile.addEventListener('change', (e) => {
        Auth.switchUser(e.target.value);
      });
    }

    // Toggle Thème
    const themeBtn = container.querySelector('#theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem(DB.keys.THEME, isLight ? 'light' : 'dark');
        themeBtn.innerHTML = isLight ? '🌙 Sombre' : '☀️ Clair';
      });
    }

    // Abonnement horloge temps réel
    SimEngine.subscribe((data) => {
      if (data.type === 'TICK' && data.simulatedTime) {
        const clockEl = container.querySelector('#sim-clock-display');
        if (clockEl) {
          clockEl.textContent = data.simulatedTime.toLocaleTimeString();
        }
      }
    });
  }
};
