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
    this.restartBtn = document.getElementById('restart-btn');
    this.startOverlay = document.getElementById('overlay-start');
    this.resultOverlay = document.getElementById('overlay-result');
    this.modeBtns = document.querySelectorAll('.mode-btn');

    this.analysisText = document.getElementById('analysis-text');
    this.recDisplay = document.getElementById('sens-recommendation');
    this.finalHits = document.getElementById('final-hits');
    this.finalTime = document.getElementById('final-time');

    this.modes = {
      standard: { cols: 16, rows: 9 },
      small: { cols: 32, rows: 18 }
    };
    this.currentMode = 'standard';
    
    this.maxMisses = 5;
    this.initialInterval = 1000;
    this.minInterval = 300;
    this.intervalDecrease = 10; // Reduced acceleration
    this.intervalPenalty = 50;  // Miss penalty (slower)

    this.isPlaying = false;
    this.cells = [];
    this.activeCellIndex = null;
    this.prevCellIndex = null;
    this.targetProcessed = false; // Flag to prevent multiple life deductions
    
    this.hits = 0;
    this.misses = 0;
    this.startTime = null;
    this.currentInterval = 1000;
    
    this.timeoutId = null;
    this.timerInterval = null;
    this.graphUpdateInterval = null;

    this.offsets = [];
    this.graphData = { labels: [], hits: [], accuracy: [] };
    this.chart = null;

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
    this.resetStats();
    this.isPlaying = true;
    this.startOverlay.classList.add('hidden');
    this.resultOverlay.classList.add('hidden');
    this.stopBtn.classList.remove('hidden');
    
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
    this.graphData = { labels: [], hits: [], accuracy: [] };
    this.hitsDisplay.textContent = '0';
    this.missesDisplay.textContent = '0';
    this.lifeDisplay.textContent = this.maxMisses;
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
    
    this.graphData.labels.push(`${elapsed}s`);
    this.graphData.hits.push(this.hits);
    this.graphData.accuracy.push(currentAccuracy.toFixed(1));
  }

  nextTarget() {
    if (!this.isPlaying) return;

    // Timeout miss
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
        
        // Progressive difficulty
        if (this.currentInterval > this.minInterval) {
          this.currentInterval -= this.intervalDecrease;
        }
        this.intervalText.textContent = `${(this.currentInterval / 1000).toFixed(2)}s`;
      }
      cell.classList.remove('active');
      cell.style.backgroundColor = 'rgba(16, 185, 129, 0.4)';
      setTimeout(() => cell.style.backgroundColor = '', 100);
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
    this.lifeDisplay.textContent = Math.max(0, this.maxMisses - this.misses);
    
    // Penalty: Slower interval
    this.currentInterval = Math.min(this.initialInterval, this.currentInterval + this.intervalPenalty);
    this.intervalText.textContent = `${(this.currentInterval / 1000).toFixed(2)}s`;

    if (this.misses >= this.maxMisses) {
      this.endGame();
    }
  }

  analyzeClick(event) {
    if (this.prevCellIndex === null) return;
    const prevRect = this.cells[this.prevCellIndex].getBoundingClientRect();
    const currRect = this.cells[this.activeCellIndex].getBoundingClientRect();
    const prevCenter = { x: prevRect.left + prevRect.width / 2, y: prevRect.top + prevRect.height / 2 };
    const currCenter = { x: currRect.left + currRect.width / 2, y: currRect.top + currRect.height / 2 };
    const dx = currCenter.x - prevCenter.x;
    const dy = currCenter.y - prevCenter.y;
    const targetDist = Math.sqrt(dx * dx + dy * dy);
    if (targetDist < 20) return;
    const vcx = event.clientX - prevCenter.x;
    const vcy = event.clientY - prevCenter.y;
    const overshootRatio = (vcx * dx + vcy * dy) / (targetDist * targetDist);
    this.offsets.push(overshootRatio);
  }

  endGame() {
    this.isPlaying = false;
    clearTimeout(this.timeoutId);
    clearInterval(this.timerInterval);
    clearInterval(this.graphUpdateInterval);
    
    this.stopBtn.classList.add('hidden');
    this.resultOverlay.classList.remove('hidden');
    this.finalHits.textContent = this.hits;
    this.finalTime.textContent = this.timerDisplay.textContent;

    this.showAnalysis();
    this.renderGraph();
  }

  showAnalysis() {
    if (this.offsets.length < 3) {
      this.analysisText.textContent = "Not enough data for a precise recommendation.";
      this.recDisplay.textContent = "";
      return;
    }

    const avgOffset = this.offsets.reduce((a, b) => a + b, 0) / this.offsets.length;
    let rec = "";
    let percent = 0;
    
    if (avgOffset > 1.02) {
      percent = Math.round((avgOffset - 1) * 100);
      this.analysisText.textContent = `Pattern: Consistent Overshooting (Avg: ${percent}% past center).`;
      rec = `REDUCE SENSITIVITY BY ~${percent}%`;
      this.recDisplay.className = "recommendation adjust";
    } else if (avgOffset < 0.98) {
      percent = Math.round((1 - avgOffset) * 100);
      this.analysisText.textContent = `Pattern: Consistent Undershooting (Avg: ${percent}% before center).`;
      rec = `INCREASE SENSITIVITY BY ~${percent}%`;
      this.recDisplay.className = "recommendation adjust";
    } else {
      this.analysisText.textContent = "Pattern: Highly accurate centering.";
      rec = "SENSITIVITY IS OPTIMAL";
      this.recDisplay.className = "recommendation";
    }
    this.recDisplay.textContent = rec;
  }

  renderGraph() {
    const ctx = document.getElementById('accuracy-chart').getContext('2d');
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
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
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        },
        plugins: {
          legend: { labels: { color: '#ffffff', font: { family: 'Orbitron' } } }
        }
      }
    });
  }

  stopGame() {
    this.endGame();
    this.resultOverlay.classList.add('hidden');
    this.startOverlay.classList.remove('hidden');
    this.startBtn.textContent = 'RESTART TEST';
  }
}

document.addEventListener('DOMContentLoaded', () => new SensGame());
