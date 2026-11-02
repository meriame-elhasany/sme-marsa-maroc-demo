/**
 * VUE FORMATION & QUIZ D'ÉVALUATION DES EXPLOITANTS
 * Programme pédagogique structuré (Section 9) et questionnaire interactif certifiant.
 */

import { DB } from '../storage/db.js';

export const ViewFormation = {
  userAnswers: {},
  submitted: false,

  render(container) {
    const quizList = DB.get(DB.keys.QUIZ, []);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Transfert de Compétences & Formation des Équipes</h1>
          <div class="page-subtitle">Programme pédagogique (Section 9 du CdC) et quiz interactif d'évaluation des exploitants</div>
        </div>
      </div>

      <!-- PARCOURS DE FORMATION STRUCTURE EN 4 MODULES -->
      <h2 style="font-size:1.15rem; font-weight:700; margin-bottom:1rem; color:var(--text-primary);">
        Programme Pédagogique (6 Jours — 3 Publics Cibles)
      </h2>
      <div class="grid-cards" style="margin-bottom:2rem;">
        <div class="card">
          <div class="card-title">Module 1 : Management ISO 50001</div>
          <div style="font-size:11px; color:var(--marsa-blue); font-weight:700; margin-bottom:4px;">Durée : 1 Jour • Public : Responsable Énergie</div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
            Définition de la politique énergétique portuaire, fixation des IPE (kWh/EVP, kWh/Tonne), construction de la Situation Énergétique de Référence (SER) et audits périodiques.
          </p>
        </div>

        <div class="card">
          <div class="card-title">Module 2 : Équipements & Modbus TCP</div>
          <div style="font-size:11px; color:var(--marsa-blue); font-weight:700; margin-bottom:4px;">Durée : 2 Jours • Public : Électriciens & Automaticiens</div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
            Câblage des compteurs, raccordement des tores TC, paramétrage IP/port 502, cartographie des registres holding et diagnostic des pannes de communication.
          </p>
        </div>

        <div class="card">
          <div class="card-title">Module 3 : Exploitation SCADA & Alertes</div>
          <div style="font-size:11px; color:var(--marsa-blue); font-weight:700; margin-bottom:4px;">Durée : 2 Jours • Public : Exploitants de Quai</div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
            Navigation sur le tableau de bord, analyse des courbes de charge, acquittement et traitement des alarmes, édition des bilans journaliers et exports CSV.
          </p>
        </div>

        <div class="card">
          <div class="card-title">Module 4 : Administration & Sécurité</div>
          <div style="font-size:11px; color:var(--marsa-blue); font-weight:700; margin-bottom:4px;">Durée : 1 Jour • Public : Administrateurs Système</div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
            Gestion des profils RBAC, journal d'audit, procédures de sauvegarde/restauration JSON, synchronisation NTP et sécurité réseau OT/IT.
          </p>
        </div>
      </div>

      <!-- QUIZ D'ÉVALUATION INTERACTIF -->
      <div class="card">
        <div class="card-title">
          <span>Quiz d'Évaluation des Connaissances (4 Questions)</span>
          <span style="font-size:11px; color:var(--text-muted);">Validation des acquis techniques</span>
        </div>

        <div id="quiz-container">
          ${quizList.map((q, idx) => this._renderQuizItem(q, idx)).join('')}
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:space-between; align-items:center;">
          <button id="btn-submit-quiz" class="btn btn-primary">
            ${this.submitted ? 'Recommencer le Quiz' : 'Valider mes Réponses & Calculer mon Score'}
          </button>
          <div id="quiz-score-display" style="font-size:1.1rem; font-weight:700; color:var(--status-ok);"></div>
        </div>
      </div>
    `;

    this._bindEvents(container, quizList);
  },

  _renderQuizItem(q, idx) {
    const selected = this.userAnswers[q.id];
    const isSubmitted = this.submitted;

    return `
      <div class="quiz-card" style="margin-bottom:1rem; padding:1.25rem;">
        <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:0.75rem;">
          Question ${idx + 1} : ${q.question}
        </div>

        <div>
          ${q.options.map((opt, optIdx) => {
            let optClass = "";
            if (selected === optIdx) optClass = "selected";

            if (isSubmitted) {
              if (optIdx === q.reponseCorrecte) optClass = "correct";
              else if (selected === optIdx) optClass = "incorrect";
            }

            return `
              <div class="quiz-option ${optClass}" data-qid="${q.id}" data-opt="${optIdx}">
                <div style="width:18px; height:18px; border-radius:50%; border:2px solid var(--border-color); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; flex-shrink:0;">
                  ${String.fromCharCode(65 + optIdx)}
                </div>
                <div style="font-size:12px; line-height:1.4;">${opt}</div>
              </div>
            `;
          }).join('')}
        </div>

        ${isSubmitted ? `
          <div style="margin-top:0.75rem; padding:0.75rem; background-color:var(--bg-input); border-radius:var(--radius-sm); font-size:11px; color:var(--text-secondary); border-left:3px solid var(--marsa-blue);">
            💡 <strong>Explication :</strong> ${q.explication}
          </div>
        ` : ''}
      </div>
    `;
  },

  _bindEvents(container, quizList) {
    container.querySelectorAll('.quiz-option').forEach(el => {
      el.addEventListener('click', (e) => {
        if (this.submitted) return;
        const qid = parseInt(e.currentTarget.getAttribute('data-qid'), 10);
        const opt = parseInt(e.currentTarget.getAttribute('data-opt'), 10);
        this.userAnswers[qid] = opt;
        this.render(container);
      });
    });

    const btnSubmit = container.querySelector('#btn-submit-quiz');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        if (this.submitted) {
          this.submitted = false;
          this.userAnswers = {};
          this.render(container);
          return;
        }

        let correct = 0;
        quizList.forEach(q => {
          if (this.userAnswers[q.id] === q.reponseCorrecte) {
            correct++;
          }
        });

        this.submitted = true;
        this.render(container);

        const scoreEl = container.querySelector('#quiz-score-display');
        if (scoreEl) {
          const pct = Math.round((correct / quizList.length) * 100);
          scoreEl.textContent = `Score final : ${correct} / ${quizList.length} (${pct} %) — ${pct >= 75 ? '✓ Attestation Délivrée !' : 'À approfondir'}`;
        }
      });
    }
  }
};
