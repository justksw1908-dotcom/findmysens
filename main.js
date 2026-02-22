/**
 * FindMySens - FPS Mouse Sensitivity Checker
 */

class SensGame {
  constructor() {
    this.mouseData = {
      'Logitech': ['G Pro X Superlight', 'G Pro X Superlight 2', 'G304', 'G502 Hero', 'G703', 'G Pro Wireless'],
      'Razer': ['DeathAdder V3 Pro', 'Viper V2 Pro', 'Basilisk V3', 'DeathAdder Essential', 'Viper Mini', 'Orochi V2'],
      'Zowie': ['EC2-C', 'FK2-B', 'ZA13-C', 'S2-C', 'EC1-CW'],
      'SteelSeries': ['Aerox 3', 'Rival 3', 'Sensei Ten', 'Prime Wireless', 'Aerox 5'],
      'Pulsar': ['X2 V2', 'X2H', 'Xlite V3', 'X2 Mini', 'Xlite V2'],
      'Finalmouse': ['UltralightX', 'Starlight-12', 'Air58'],
      'VGN/VXE': ['Dragonfly F1 Pro', 'VXE R1 Pro']
    };

    this.userInfo = {
      brand: '',
      model: '',
      dpi: '',
      game: '',
      sens: ''
    };

    this.gridContainer = document.getElementById('grid-container');
    this.hitsDisplay = document.getElementById('hits-count');
    // ... rest of constructor initialization
    this.missesDisplay = document.getElementById('misses-count');
    this.lifeDisplay = document.getElementById('life-left');
    this.timerDisplay = document.getElementById('timer-display');
    this.intervalText = document.getElementById('interval-text');
    this.modeText = document.getElementById('grid-size-text');
    
    this.startBtn = document.getElementById('start-btn');
    this.stopBtn = document.getElementById('stop-btn');
    this.keyHint = document.querySelector('.key-hint-container');
    this.restartBtn = document.getElementById('restart-btn');
    this.startOverlay = document.getElementById('overlay-start');
    this.resultOverlay = document.getElementById('overlay-result');
    this.modeBtns = document.querySelectorAll('.mode-btn');
    this.lifeToggle = document.getElementById('life-mode-toggle');

    this.analysisText = document.getElementById('analysis-text');
    this.recDisplay = document.getElementById('sens-recommendation');
    this.deviationDisplay = document.getElementById('avg-deviation-value');
    this.finalHits = document.getElementById('final-hits');
    this.finalTime = document.getElementById('final-time');
    this.finalGrade = document.getElementById('final-grade');

    // Setup Modal Elements
    this.setupModal = document.getElementById('setup-modal');
    this.modalSteps = document.querySelectorAll('.modal-step');
    this.nextBtns = document.querySelectorAll('.next-step-btn');
    this.brandBtns = document.querySelectorAll('.brand-btn');
    this.modelSelect = document.getElementById('mouse-model-select');
    this.finishBtn = document.getElementById('finish-setup-btn');
    
    // Sidebar Elements
    this.sidebar = document.getElementById('user-info-sidebar');
    this.editBtn = document.getElementById('edit-info-btn');

    this.modes = {
      standard: { cols: 16, rows: 9, side: 70 }, 
      small: { cols: 32, rows: 18, side: 35 }    
    };
    this.currentMode = 'standard';
    
    this.maxMisses = 5;
    this.initialInterval = 1000;
    this.minInterval = 300;
    this.intervalDecrease = 10;
    this.intervalPenalty = 50;

    this.isPlaying = false;
    this.isLifeMode = true;
    this.cells = [];
    this.activeCellIndex = null;
    this.prevCellIndex = null;
    this.targetProcessed = false;
    
    this.hits = 0;
    this.misses = 0;
    this.startTime = null;
    this.currentInterval = 1000;
    
    this.timeoutId = null;
    this.timerInterval = null;
    this.graphUpdateInterval = null;

    this.offsets = []; // Ratio of (actual movement / target distance)
    this.pixelDistances = []; // Raw px from center
    this.graphData = { labels: [], accuracy: [], avgDistance: [] };
    this.accuracyChart = null;
    this.distanceChart = null;

    this.init();
    this.initConverter();
    this.initSetupModal();
  }

  init() {
    this.createGrid();
    this.startBtn.addEventListener('click', () => {
      if (!this.userInfo.brand) {
        this.openSetupModal();
      } else {
        this.startGame();
      }
    });
    this.stopBtn.addEventListener('click', () => this.stopGame());
    this.restartBtn.addEventListener('click', () => {
      this.resultOverlay.classList.add('hidden');
      this.startOverlay.classList.remove('hidden');
      this.startBtn.textContent = 'START TEST';
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.isPlaying) {
        e.preventDefault();
        this.stopGame();
      }
    });

    this.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        this.modeText.textContent = this.currentMode.charAt(0).toUpperCase() + this.currentMode.slice(1);
        this.createGrid();
      });
    });

    this.gridContainer.addEventListener('mousedown', (e) => {
      if (!this.isPlaying) return;
      const cell = e.target.closest('.grid-cell');
      if (cell) this.handleCellClick(cell, e);
    });

    this.editBtn.addEventListener('click', () => this.openSetupModal());
  }

  initSetupModal() {
    // Step 1: Brand Selection
    this.brandBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const brand = btn.dataset.brand;
        this.userInfo.brand = brand;
        this.brandBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateModelDropdown(brand);
        this.goToStep(2);
      });
    });

    // Step 2 & 3 Navigation
    this.nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentStep = parseInt(btn.dataset.currentStep);
        if (currentStep === 2 && !this.modelSelect.value) return;
        this.goToStep(currentStep + 1);
      });
    });

    // Step 3: Finish
    this.finishBtn.addEventListener('click', () => {
      this.userInfo.model = this.modelSelect.value;
      this.userInfo.game = document.getElementById('setup-game-select').value;
      this.userInfo.sens = document.getElementById('setup-sens-input').value;
      this.userInfo.dpi = document.getElementById('setup-dpi-input').value;

      if (!this.userInfo.sens || !this.userInfo.dpi) {
        alert('모든 정보를 입력해주세요.');
        return;
      }

      this.updateSidebar();
      this.closeSetupModal();
    });
  }

  goToStep(step) {
    this.modalSteps.forEach(s => s.classList.add('hidden'));
    document.querySelector(`.modal-step[data-step="${step}"]`).classList.remove('hidden');
  }

  updateModelDropdown(brand) {
    const models = this.mouseData[brand] || [];
    const sortedModels = [...models].sort();
    this.modelSelect.innerHTML = '<option value="" disabled selected>마우스 모델 선택</option>';
    sortedModels.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      this.modelSelect.appendChild(option);
    });
  }

  openSetupModal() {
    this.setupModal.classList.remove('hidden');
    this.goToStep(1);
  }

  closeSetupModal() {
    this.setupModal.classList.add('hidden');
  }

  updateSidebar() {
    document.getElementById('side-brand').textContent = this.userInfo.brand;
    document.getElementById('side-model').textContent = this.userInfo.model;
    document.getElementById('side-dpi').textContent = `${this.userInfo.dpi} DPI`;
    document.getElementById('side-game').textContent = this.userInfo.game;
    document.getElementById('side-sens').textContent = this.userInfo.sens;
    this.sidebar.classList.remove('hidden');
  }

  initConverter() {
    this.gameSelect = document.getElementById('game-select');
    this.sensInput = document.getElementById('current-sens');
    this.resultsDiv = document.getElementById('converted-results');

    if (!this.gameSelect || !this.sensInput || !this.resultsDiv) return;

    // CS2 (Source Engine)를 기준(1.0)으로 했을 때의 각 게임별 변환 상수
    const multipliers = {
      'cs2': 1,
      'apex': 1,
      'tf2': 1,
      'valorant': 1 / 3.181818,
      'ow2': 3.333333,
      'cod': 3.333333,
      'destiny2': 3.333333,
      'r6': 3.839 // default multiplier 0.02 기준
    };

    const gameNames = {
      'valorant': '발로란트', 'cs2': 'CS2', 'apex': '에이펙스', 
      'ow2': '오버워치 2', 'cod': '콜옵 워존', 'r6': '레인보우 식스', 
      'destiny2': '데스티니 2', 'tf2': '팀포 2'
    };

    const updateConversion = () => {
      if (!this.sensInput.value) {
        this.resultsDiv.innerHTML = '';
        return;
      }

      const currentSens = parseFloat(this.sensInput.value);
      const selectedGame = this.gameSelect.value;
      
      // 분석된 오차값 가져오기 (오버플릭은 감도를 낮추고, 언더플릭은 높임)
      const deviationText = this.deviationDisplay.textContent.replace('%', '').replace('+', '');
      const deviationPercent = parseFloat(deviationText) || 0;
      const adjustmentFactor = 1 - (deviationPercent / 100); 
      const perfectSens = currentSens * adjustmentFactor;

      // 1. 현재 입력된 게임의 감도를 공통 기준(CS2)으로 역산
      const baseCs2Sens = perfectSens / multipliers[selectedGame];

      // 2. 결과를 동적 HTML로 생성
      let resultsHtml = `
        <div style="color: #00f2ff; margin-bottom: 15px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
          💡 내 에임 오차가 보정된 게임별 추천 감도
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center; font-size: 11px;">
      `;

      for (const [key, multi] of Object.entries(multipliers)) {
        const convertedSens = baseCs2Sens * multi;
        // 선택한 게임은 강조 표시
        const bg = key === selectedGame ? 'rgba(0, 242, 255, 0.2)' : 'rgba(255,255,255,0.05)';
        const border = key === selectedGame ? '1px solid #00f2ff' : '1px solid rgba(255,255,255,0.1)';
        
        resultsHtml += `
          <div style="background: ${bg}; padding: 8px 4px; border-radius: 6px; border: ${border};">
            ${gameNames[key]}<br><strong style="font-size: 14px; color: #fff;">${convertedSens.toFixed(3)}</strong>
          </div>
        `;
      }

      resultsHtml += `</div>`;
      this.resultsDiv.innerHTML = resultsHtml;
    };

    this.gameSelect.addEventListener('change', updateConversion);
    this.sensInput.addEventListener('input', updateConversion);
  }

  createGrid() {
    const config = this.modes[this.currentMode];
    this.gridContainer.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    this.gridContainer.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
    this.gridContainer.innerHTML = '';
    this.gridContainer.appendChild(this.startOverlay);
    this.gridContainer.appendChild(this.resultOverlay);

    this.cells = [];
    for (let i = 0; i < config.cols * config.rows; i++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      cell.dataset.index = i;
      this.gridContainer.appendChild(cell);
      this.cells.push(cell);
    }
  }

  startGame() {
    this.isLifeMode = this.lifeToggle.checked;
    this.resetStats();
    this.isPlaying = true;
    this.startOverlay.classList.add('hidden');
    this.resultOverlay.classList.add('hidden');
    this.stopBtn.classList.remove('hidden');
    this.keyHint.classList.remove('hidden');
    
    this.startTime = Date.now();
    this.currentInterval = this.initialInterval;
    this.intervalText.textContent = `${(this.currentInterval / 1000).toFixed(2)}s`;

    this.nextTarget();
    this.timerInterval = setInterval(() => this.updateTimer(), 100);
    this.graphUpdateInterval = setInterval(() => this.recordGraphSnapshot(), 2000);
  }

  resetStats() {
    this.hits = 0;
    this.misses = 0;
    this.offsets = [];
    this.pixelDistances = [];
    this.graphData = { labels: [], accuracy: [], avgDistance: [] };
    this.hitsDisplay.textContent = '0';
    this.missesDisplay.textContent = '0';
    this.lifeDisplay.textContent = this.isLifeMode ? this.maxMisses : '∞';
    this.timerDisplay.textContent = '00:00';
    this.cells.forEach(cell => {
      cell.classList.remove('active');
      cell.style.backgroundColor = '';
    });
    this.activeCellIndex = null;
    this.prevCellIndex = null;
    this.targetProcessed = false;
    if (this.resultsDiv) this.resultsDiv.innerHTML = '';
    if (this.sensInput) this.sensInput.value = '';
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    this.timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  recordGraphSnapshot() {
    if (!this.isPlaying) return;
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const totalAttempts = this.hits + this.misses;
    const currentAccuracy = totalAttempts === 0 ? 0 : (this.hits / totalAttempts) * 100;
    
    const recentDistances = this.pixelDistances.slice(-5);
    const avgDist = recentDistances.length === 0 ? 0 : recentDistances.reduce((a, b) => a + b, 0) / recentDistances.length;

    this.graphData.labels.push(`${elapsed}s`);
    this.graphData.accuracy.push(parseFloat(currentAccuracy.toFixed(1)));
    this.graphData.avgDistance.push(parseFloat(avgDist.toFixed(1)));
  }

  nextTarget() {
    if (!this.isPlaying) return;

    if (this.activeCellIndex !== null && !this.targetProcessed) {
      if (this.cells[this.activeCellIndex].classList.contains('active')) {
        this.applyMissPenalty();
      }
    }

    this.cells.forEach(c => c.classList.remove('active'));
    this.targetProcessed = false;
    this.prevCellIndex = this.activeCellIndex;
    
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.cells.length);
    } while (newIndex === this.activeCellIndex);

    this.activeCellIndex = newIndex;
    this.cells[this.activeCellIndex].classList.add('active');

    this.timeoutId = setTimeout(() => this.nextTarget(), this.currentInterval);
  }

  handleCellClick(cell, event) {
    if (cell.classList.contains('active')) {
      if (!this.targetProcessed) {
        this.analyzeClick(event);
        this.hits++;
        this.hitsDisplay.textContent = this.hits;
        this.targetProcessed = true;
        
        if (this.currentInterval > this.minInterval) {
          this.currentInterval -= this.intervalDecrease;
        }
        this.intervalText.textContent = `${(this.currentInterval / 1000).toFixed(2)}s`;
      }
      cell.classList.remove('active');
    } else {
      if (!this.targetProcessed) {
        this.applyMissPenalty();
        this.targetProcessed = true;
      }
      cell.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
      setTimeout(() => cell.style.backgroundColor = '', 100);
    }
  }

  applyMissPenalty() {
    this.misses++;
    this.missesDisplay.textContent = this.misses;
    
    if (this.isLifeMode) {
      const remaining = Math.max(0, this.maxMisses - this.misses);
      this.lifeDisplay.textContent = remaining;
      if (remaining === 0) {
        this.endGame();
        return;
      }
    }

    this.currentInterval = Math.min(this.initialInterval, this.currentInterval + this.intervalPenalty);
    this.intervalText.textContent = `${(this.currentInterval / 1000).toFixed(2)}s`;
  }

  analyzeClick(event) {
    if (this.activeCellIndex === null) return;
    
    const currRect = this.cells[this.activeCellIndex].getBoundingClientRect();
    const currCenter = { x: currRect.left + currRect.width / 2, y: currRect.top + currRect.height / 2 };
    
    const distFromCenter = Math.sqrt(Math.pow(event.clientX - currCenter.x, 2) + Math.pow(event.clientY - currCenter.y, 2));
    this.pixelDistances.push(distFromCenter);

    if (this.prevCellIndex === null) return;
    const prevRect = this.cells[this.prevCellIndex].getBoundingClientRect();
    const prevCenter = { x: prevRect.left + prevRect.width / 2, y: prevRect.top + prevRect.height / 2 };
    
    const dx = currCenter.x - prevCenter.x;
    const dy = currCenter.y - prevCenter.y;
    const targetDist = Math.sqrt(dx * dx + dy * dy);
    
    if (targetDist < 10) return;

    const vcx = event.clientX - prevCenter.x;
    const vcy = event.clientY - prevCenter.y;

    // overshootRatio: 1.0 means perfect distance, > 1.0 means too far
    const overshootRatio = (vcx * dx + vcy * dy) / (targetDist * targetDist);
    this.offsets.push(overshootRatio);
  }

  endGame() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    clearTimeout(this.timeoutId);
    clearInterval(this.timerInterval);
    clearInterval(this.graphUpdateInterval);
    
    this.stopBtn.classList.add('hidden');
    this.keyHint.classList.add('hidden');
    this.resultOverlay.classList.remove('hidden');
    this.finalHits.textContent = this.hits;
    this.finalTime.textContent = this.timerDisplay.textContent;

    this.showAnalysis();
    this.renderGraphs();
  }

  showAnalysis() {
    const avgPxDist = this.pixelDistances.length === 0 ? 999 : this.pixelDistances.reduce((a, b) => a + b, 0) / this.pixelDistances.length;
    const config = this.modes[this.currentMode];
    const errorRatio = (avgPxDist / config.side) * 100;
    
    let grade = "";
    let gradeClass = "";
    let isElite = false;

    if (errorRatio < 8) { grade = "SSS"; gradeClass = "sss"; isElite = true; }
    else if (errorRatio < 12) { grade = "SS"; gradeClass = "ss"; isElite = true; }
    else if (errorRatio < 16) { grade = "S"; gradeClass = "s"; }
    else if (errorRatio < 20) { grade = "A"; gradeClass = "a"; }
    else if (errorRatio < 25) { grade = "B"; gradeClass = "b"; }
    else if (errorRatio < 30) { grade = "C"; gradeClass = "c"; }
    else { grade = "D"; gradeClass = "d"; }

    this.finalGrade.textContent = grade;
    this.finalGrade.className = `grade-value ${gradeClass}`;

    if (this.offsets.length < 3) {
      this.analysisText.textContent = "More sessions required for precision feedback.";
      this.deviationDisplay.textContent = "0%";
      return;
    }

    const avgOffsetRatio = this.offsets.reduce((a, b) => a + b, 0) / this.offsets.length;
    const deviationPercent = (avgOffsetRatio - 1) * 100;
    
    // Always show the deviation percentage
    const sign = deviationPercent >= 0 ? "+" : "";
    this.deviationDisplay.textContent = `${sign}${deviationPercent.toFixed(1)}%`;
    this.deviationDisplay.className = "deviation-value " + (deviationPercent > 1 ? "plus" : (deviationPercent < -1 ? "minus" : "perfect"));

    let rec = "";
    
    if (isElite) {
      this.analysisText.textContent = `Excellent precision. No adjustment required.`;
      rec = "SENSITIVITY IS OPTIMAL";
      this.recDisplay.className = "recommendation";
    } else {
      const absPercent = Math.abs(Math.round(deviationPercent));
      if (deviationPercent > 1) {
        this.analysisText.textContent = `Your aim consistently overshoots the center dot.`;
        rec = `LOWER SENSITIVITY BY ~${absPercent}%`;
        this.recDisplay.className = "recommendation adjust";
      } else if (deviationPercent < -1) {
        this.analysisText.textContent = `Your aim consistently stops before the center dot.`;
        rec = `HIGHER SENSITIVITY BY ~${absPercent}%`;
        this.recDisplay.className = "recommendation adjust";
      } else {
        this.analysisText.textContent = `Centered but loose (Avg Error: ${avgPxDist.toFixed(1)}px).`;
        rec = "FOCUS ON STEADINESS";
        this.recDisplay.className = "recommendation";
      }
    }
    this.recDisplay.textContent = rec;
  }

  renderGraphs() {
    const ctxAcc = document.getElementById('accuracy-chart').getContext('2d');
    const ctxDist = document.getElementById('distance-chart').getContext('2d');
    const config = this.modes[this.currentMode];
    const targetBoundary = config.side / 2;

    if (this.accuracyChart) this.accuracyChart.destroy();
    if (this.distanceChart) this.distanceChart.destroy();

    const minAcc = Math.max(0, Math.min(...this.graphData.accuracy) - 10);
    const maxAcc = Math.min(100, Math.max(...this.graphData.accuracy) + 10);

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
      },
      plugins: {
        legend: { labels: { color: '#ffffff', font: { family: 'Orbitron', size: 10 } } }
      }
    };

    this.accuracyChart = new Chart(ctxAcc, {
      type: 'line',
      data: {
        labels: this.graphData.labels,
        datasets: [{
          label: 'Accuracy (%)',
          data: this.graphData.accuracy,
          borderColor: '#00f2ff',
          backgroundColor: 'rgba(0, 242, 255, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: minAcc, max: maxAcc } } }
    });

    this.distanceChart = new Chart(ctxDist, {
      type: 'line',
      data: {
        labels: this.graphData.labels,
        datasets: [
          {
            label: 'Avg Center Offset (px)',
            data: this.graphData.avgDistance,
            borderColor: '#ff4d00',
            backgroundColor: 'rgba(255, 77, 0, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value > targetBoundary ? '#ff0000' : '#ff4d00';
            }
          },
          {
            label: 'Target Boundary Edge',
            data: Array(this.graphData.labels.length).fill(targetBoundary),
            borderColor: 'rgba(239, 68, 68, 0.5)',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: chartOptions
    });
  }

  stopGame() {
    this.endGame();
  }
}

document.addEventListener('DOMContentLoaded', () => new SensGame());
