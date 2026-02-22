import { mouseDatabase } from '../infrastructure/MouseDatabase.js';
import { translations } from '../infrastructure/Translations.js';

export class UIController {
  constructor(gameManager, sensitivityCalculator, scoreSystem, rankingRepository) {
    this.gameManager = gameManager;
    this.calculator = sensitivityCalculator;
    this.scoreSystem = scoreSystem;
    this.rankingRepo = rankingRepository;

    this.translations = translations;
    this.userInfo = { brand: '', model: '', dpi: '', game: '', sens: '' };
    this.pixelDistances = [];
    this.graphData = { labels: [], accuracy: [], avgDistance: [] };
    this.currentMode = 'standard';
    this.cells = [];
    
    this.accuracyChart = null;
    this.distanceChart = null;

    this.cacheDOM();
    this.bindEvents();
    this.setupGameManagerListeners();
    this.createGrid();
  }

  cacheDOM() {
    this.gridContainer = document.getElementById('grid-container');
    this.hitsDisplay = document.getElementById('hits-count');
    this.missesDisplay = document.getElementById('misses-count');
    this.lifeDisplay = document.getElementById('life-left');
    this.timerDisplay = document.getElementById('timer-display');
    this.startBtn = document.getElementById('start-btn');
    this.stopBtn = document.getElementById('stop-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.startOverlay = document.getElementById('overlay-start');
    this.resultOverlay = document.getElementById('overlay-result');
    this.lifeToggle = document.getElementById('life-mode-toggle');
    this.langSelect = document.getElementById('lang-select');
    this.setupModal = document.getElementById('setup-modal');
    this.modelSelect = document.getElementById('mouse-model-select');
    this.sidebar = document.getElementById('user-info-sidebar');
    this.leaderboardModal = document.getElementById('leaderboard-modal');
    this.gameSelect = document.getElementById('game-select');
    this.sensInput = document.getElementById('current-sens');
    this.resultsDiv = document.getElementById('converted-results');
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.userInfo.brand ? this.gameManager.start({ isLifeMode: this.lifeToggle.checked }) : this.openSetupModal());
    this.stopBtn.addEventListener('click', () => this.gameManager.stop());
    this.restartBtn.addEventListener('click', () => this.resetUI());
    this.langSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
    
    document.getElementById('view-leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
    document.getElementById('edit-info-btn').addEventListener('click', () => this.openSetupModal());
    document.getElementById('submit-rank-btn').addEventListener('click', () => this.submitRank());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (this.gameManager.isPlaying) { e.preventDefault(); this.gameManager.stop(); }
        else if (!this.resultOverlay.classList.contains('hidden')) { e.preventDefault(); this.resetUI(); }
      }
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        document.getElementById('grid-size-text').textContent = btn.textContent;
        this.createGrid();
      });
    });

    this.gridContainer.addEventListener('mousedown', (e) => {
      if (this.gameManager.isPlaying) {
        const cell = e.target.closest('.grid-cell');
        if (cell) {
          const rect = cell.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
          
          if (cell.classList.contains('active')) {
            this.pixelDistances.push(dist);
            this.gameManager.handleHit();
          } else {
            this.gameManager.handleMiss();
          }
        } else {
          this.gameManager.handleMiss();
        }
      }
    });

    this.setupModal.addEventListener('mousedown', (e) => {
      if (e.target === this.setupModal) {
        this.setupModal.classList.add('hidden');
      }
    });

    this.initSetupModal();
    this.initConverter();
  }

  setupGameManagerListeners() {
    this.gameManager.on('gameStarted', (data) => {
      this.pixelDistances = [];
      this.graphData = { labels: [], accuracy: [], avgDistance: [] };
      this.startOverlay.classList.add('hidden');
      this.resultOverlay.classList.add('hidden');
      this.stopBtn.classList.remove('hidden');
      document.querySelector('.key-hint-container').classList.remove('hidden');
      this.lifeDisplay.textContent = data.isLifeMode ? '5' : '∞';
      this.hitsDisplay.textContent = '0';
      this.missesDisplay.textContent = '0';
      
      this.snapshotInterval = setInterval(() => this.recordGraphSnapshot(), 2000);
    });

    this.gameManager.on('timerUpdated', (timeStr) => {
      this.timerDisplay.textContent = timeStr;
    });

    this.gameManager.on('targetSpawned', (pickIndexFn) => {
      const idx = pickIndexFn(this.cells.length);
      this.cells[idx].classList.add('active');
    });

    this.gameManager.on('targetExpired', (idx) => {
      if (idx !== null) this.cells[idx].classList.remove('active');
    });

    this.gameManager.on('hit', (data) => {
      this.hitsDisplay.textContent = data.hits;
      document.getElementById('interval-text').textContent = (data.interval / 1000).toFixed(2) + 's';
    });

    this.gameManager.on('miss', (data) => {
      this.missesDisplay.textContent = data.misses;
      document.getElementById('interval-text').textContent = (data.interval / 1000).toFixed(2) + 's';
    });

    this.gameManager.on('lifeUpdated', (life) => {
      this.lifeDisplay.textContent = life;
    });

    this.gameManager.on('gameEnded', (data) => {
      clearInterval(this.snapshotInterval);
      this.stopBtn.classList.add('hidden');
      this.resultOverlay.classList.remove('hidden');
      this.renderResults(data);
      this.renderGraphs();
    });
  }

  recordGraphSnapshot() {
    if (!this.gameManager.isPlaying) return;
    const elapsed = this.gameManager.getElapsedString();
    const total = this.gameManager.hits + this.gameManager.misses;
    const accuracy = total === 0 ? 0 : (this.gameManager.hits / total) * 100;
    const recentDists = this.pixelDistances.slice(-5);
    const avgDist = recentDists.length === 0 ? 0 : recentDists.reduce((a, b) => a + b, 0) / recentDists.length;

    this.graphData.labels.push(elapsed);
    this.graphData.accuracy.push(accuracy);
    this.graphData.avgDistance.push(avgDist);

    if (this.graphData.labels.length > 100) {
      this.graphData.labels = this.graphData.labels.slice(-100);
      this.graphData.accuracy = this.graphData.accuracy.slice(-100);
      this.graphData.avgDistance = this.graphData.avgDistance.slice(-100);
    }
  }

  createGrid() {
    const modes = { standard: { cols: 16, rows: 9 }, small: { cols: 32, rows: 18 } };
    const config = modes[this.currentMode];
    this.gridContainer.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    this.gridContainer.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
    this.gridContainer.innerHTML = '';
    this.gridContainer.appendChild(this.startOverlay);
    this.gridContainer.appendChild(this.resultOverlay);

    this.cells = [];
    for (let i = 0; i < config.cols * config.rows; i++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      this.gridContainer.appendChild(cell);
      this.cells.push(cell);
    }
  }

  changeLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.translations[lang][key]) el.textContent = this.translations[lang][key];
    });
    document.getElementById('rank-name').placeholder = this.translations[lang].name;
  }

  renderResults(data) {
    const avgDist = this.pixelDistances.reduce((a, b) => a + b, 0) / (this.pixelDistances.length || 1);
    const accuracy = (data.hits / (data.hits + data.misses || 1)) * 100;
    const grade = this.calculator.calculateGrade(accuracy, avgDist);
    
    const gradeEl = document.getElementById('final-grade');
    gradeEl.textContent = grade;
    gradeEl.className = `grade-value ${grade.toLowerCase()}`;
    
    document.getElementById('final-hits').textContent = data.hits;
    document.getElementById('final-time').textContent = data.timeString;

    if (this.gameManager.isLifeMode) {
      const score = this.scoreSystem.calculateScore(data.hits, data.misses, data.finalInterval);
      document.getElementById('life-mode-score-box').classList.remove('hidden');
      document.getElementById('final-score-value').textContent = score;
      document.getElementById('ranking-reg-section').classList.remove('hidden');
    } else {
      document.getElementById('life-mode-score-box').classList.add('hidden');
      document.getElementById('ranking-reg-section').classList.add('hidden');
    }

    this.syncConverter();
  }

  renderGraphs() {
    const ctxAcc = document.getElementById('accuracy-chart').getContext('2d');
    const ctxDist = document.getElementById('distance-chart').getContext('2d');

    if (this.accuracyChart) this.accuracyChart.destroy();
    if (this.distanceChart) this.distanceChart.destroy();

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      }
    };

    this.accuracyChart = new Chart(ctxAcc, {
      type: 'line',
      data: {
        labels: this.graphData.labels,
        datasets: [{
          data: this.graphData.accuracy,
          borderColor: '#00f2ff',
          backgroundColor: 'rgba(0, 242, 255, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { ...commonOptions, scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, max: 100 } } }
    });

    this.distanceChart = new Chart(ctxDist, {
      type: 'line',
      data: {
        labels: this.graphData.labels,
        datasets: [{
          data: this.graphData.avgDistance,
          borderColor: '#ff4d00',
          backgroundColor: 'rgba(255, 77, 0, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: commonOptions
    });
  }

  syncConverter() {
    const map = { 'Valorant': 'valorant', 'CS2': 'cs2', 'Apex': 'apex', 'Overwatch 2': 'ow2' };
    if (map[this.userInfo.game]) this.gameSelect.value = map[this.userInfo.game];
    this.sensInput.value = this.userInfo.sens;
    this.updateConversion();
  }

  initConverter() {
    const update = () => {
      const s = parseFloat(this.sensInput.value);
      if (!s) return;
      const gameNames = { valorant: 'Valorant', cs2: 'CS2', apex: 'Apex', ow2: 'OW2', cod: 'CoD', r6: 'R6', destiny2: 'D2', tf2: 'TF2' };
      const converted = this.calculator.calculateAdjustedSens(s, this.gameSelect.value, 0); 
      this.resultsDiv.innerHTML = `<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">` + 
        Object.entries(converted).map(([k, v]) => `
          <div class="converter-result-card">
            ${gameNames[k] || k}<br><b class="converter-result-value">${v.toFixed(3)}</b>
          </div>
        `).join('') + `</div>`;
    };
    this.gameSelect.addEventListener('change', update);
    this.sensInput.addEventListener('input', update);
    this.updateConversion = update;
  }

  initSetupModal() {
    document.querySelectorAll('.brand-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.userInfo.brand = btn.dataset.brand;
        const models = mouseDatabase[this.userInfo.brand].sort();
        this.modelSelect.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('') + '<option value="Other">Other</option>';
        document.querySelector('.modal-step[data-step="1"]').classList.add('hidden');
        document.querySelector('.modal-step[data-step="2"]').classList.remove('hidden');
      });
    });
    document.querySelector('.next-step-btn').addEventListener('click', () => {
      this.userInfo.model = this.modelSelect.value;
      document.querySelector('.modal-step[data-step="2"]').classList.add('hidden');
      document.querySelector('.modal-step[data-step="3"]').classList.remove('hidden');
    });
    document.getElementById('finish-setup-btn').addEventListener('click', () => {
      this.userInfo.game = document.getElementById('setup-game-select').value;
      this.userInfo.sens = document.getElementById('setup-sens-input').value;
      this.userInfo.dpi = document.getElementById('setup-dpi-input').value;
      this.updateSidebar();
      this.setupModal.classList.add('hidden');
    });
  }

  updateSidebar() {
    document.getElementById('side-brand').textContent = this.userInfo.brand;
    document.getElementById('side-model').textContent = this.userInfo.model;
    document.getElementById('side-dpi').textContent = `${this.userInfo.dpi} DPI`;
    document.getElementById('side-game').textContent = this.userInfo.game;
    document.getElementById('side-sens').textContent = this.userInfo.sens;
    this.sidebar.classList.remove('hidden');
  }

  openSetupModal() {
    this.setupModal.classList.remove('hidden');
    document.querySelectorAll('.modal-step').forEach(s => s.classList.add('hidden'));
    document.querySelector('.modal-step[data-step="1"]').classList.remove('hidden');
  }

  submitRank() {
    const entry = {
      name: document.getElementById('rank-name').value || 'Anonymous',
      country: document.getElementById('rank-country').value,
      score: parseInt(document.getElementById('final-score-value').textContent)
    };
    this.rankingRepo.saveRanking(entry);
    alert('Rank Registered!');
    document.getElementById('ranking-reg-section').classList.add('hidden');
  }

  showLeaderboard() {
    const leaderboard = this.rankingRepo.getTopRankings();
    const body = document.getElementById('leaderboard-body');
    const flags = { KR: '🇰🇷', US: '🇺🇸', JP: '🇯🇵', CN: '🇨🇳', TW: '🇹🇼', FR: '🇫🇷', DE: '🇩🇪', BR: '🇧🇷', Global: '🌐' };
    body.innerHTML = leaderboard.map((entry, i) => `
      <tr>
        <td>#${i + 1}</td>
        <td>${flags[entry.country] || '🌐'} ${entry.name}</td>
        <td class="rank-score">${entry.score.toLocaleString()}</td>
      </tr>
    `).join('');
    this.leaderboardModal.classList.remove('hidden');
  }

  resetUI() {
    this.resultOverlay.classList.add('hidden');
    this.startOverlay.classList.remove('hidden');
    this.hitsDisplay.textContent = '0';
    this.missesDisplay.textContent = '0';
    this.timerDisplay.textContent = '00:00';
    this.cells.forEach(c => c.classList.remove('active'));
  }
}
