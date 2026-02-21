/**
 * FindMySens - FPS Mouse Sensitivity Checker
 */

class SensGame {
  constructor() {
    this.gridContainer = document.getElementById('grid-container');
    this.hitsDisplay = document.getElementById('hits-count');
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
    this.finalHits = document.getElementById('final-hits');
    this.finalTime = document.getElementById('final-time');
    this.finalGrade = document.getElementById('final-grade');

    this.modes = {
      standard: { cols: 16, rows: 9, side: 70 }, // 1120 / 16
      small: { cols: 32, rows: 18, side: 35 }    // 1120 / 32
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

    this.offsets = []; 
    this.pixelDistances = []; 
    this.graphData = { labels: [], accuracy: [], avgDistance: [] };
    this.accuracyChart = null;
    this.distanceChart = null;

    this.init();
  }

  init() {
    this.createGrid();
    this.startBtn.addEventListener('click', () => this.startGame());
    this.stopBtn.addEventListener('click', () => this.stopGame());
    this.restartBtn.addEventListener('click', () => {
      this.resultOverlay.classList.add('hidden');
      this.startOverlay.classList.remove('hidden');
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
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    this.timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  recordGraphSnapshot() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const totalAttempts = this.hits + this.misses;
    const currentAccuracy = totalAttempts === 0 ? 0 : (this.hits / totalAttempts) * 100;
    
    const recentDistances = this.pixelDistances.slice(-5);
    const avgDist = recentDistances.length === 0 ? 0 : recentDistances.reduce((a, b) => a + b, 0) / recentDistances.length;

    this.graphData.labels.push(`${elapsed}s`);
    this.graphData.accuracy.push(currentAccuracy.toFixed(1));
    this.graphData.avgDistance.push(avgDist.toFixed(1));
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
    
    // Calculate grade based on pixel distance relative to side length
    // Grade 1 (SSS): < 8% of side length
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

    if (this.offsets.length < 5) {
      this.analysisText.textContent = "More data needed for precision analysis.";
      this.recDisplay.textContent = "";
      return;
    }

    const avgOffset = this.offsets.reduce((a, b) => a + b, 0) / this.offsets.length;
    let rec = "";
    
    // Sensitivity advice only if not Grade 1 or 2
    if (isElite) {
      this.analysisText.textContent = `Excellent precision (Avg Error: ${avgPxDist.toFixed(1)}px).`;
      rec = "SENSITIVITY IS OPTIMAL";
      this.recDisplay.className = "recommendation";
    } else {
      let percent = 0;
      if (avgOffset > 1.01) {
        percent = Math.round((avgOffset - 1) * 100);
        this.analysisText.textContent = `Trend: Overshooting (Avg Error: ${avgPxDist.toFixed(1)}px).`;
        rec = `LOWER SENSITIVITY BY ~${percent}%`;
        this.recDisplay.className = "recommendation adjust";
      } else if (avgOffset < 0.99) {
        percent = Math.round((1 - avgOffset) * 100);
        this.analysisText.textContent = `Trend: Undershooting (Avg Error: ${avgPxDist.toFixed(1)}px).`;
        rec = `HIGHER SENSITIVITY BY ~${percent}%`;
        this.recDisplay.className = "recommendation adjust";
      } else {
        this.analysisText.textContent = `Centered but imprecise (Avg Error: ${avgPxDist.toFixed(1)}px).`;
        rec = "SENSITIVITY IS OPTIMAL";
        this.recDisplay.className = "recommendation";
      }
    }
    this.recDisplay.textContent = rec;
  }

  renderGraphs() {
    const ctxAcc = document.getElementById('accuracy-chart').getContext('2d');
    const ctxDist = document.getElementById('distance-chart').getContext('2d');
    
    if (this.accuracyChart) this.accuracyChart.destroy();
    if (this.distanceChart) this.distanceChart.destroy();

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
      options: { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: 0, max: 100 } } }
    });

    this.distanceChart = new Chart(ctxDist, {
      type: 'line',
      data: {
        labels: this.graphData.labels,
        datasets: [{
          label: 'Avg Center Offset (px)',
          data: this.graphData.avgDistance,
          borderColor: '#ff4d00',
          backgroundColor: 'rgba(255, 77, 0, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: chartOptions
    });
  }

  stopGame() {
    this.endGame();
  }
}

document.addEventListener('DOMContentLoaded', () => new SensGame());
