/**
 * FindMySens - FPS Mouse Sensitivity Checker
 * Logic for dynamic grids, click vector analysis, and sensitivity recommendations.
 */

class SensGame {
  constructor() {
    // UI Elements
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

    // Analysis UI
    this.analysisText = document.getElementById('analysis-text');
    this.recDisplay = document.getElementById('sens-recommendation');
    this.finalHits = document.getElementById('final-hits');
    this.finalTime = document.getElementById('final-time');

    // Game Config
    this.modes = {
      standard: { cols: 16, rows: 9 },
      small: { cols: 32, rows: 18 }
    };
    this.currentMode = 'standard';
    
    this.maxMisses = 5;
    this.initialInterval = 1000;
    this.minInterval = 300;
    this.intervalDecrease = 15;

    // State
    this.isPlaying = false;
    this.cells = [];
    this.activeCellIndex = null;
    this.prevCellIndex = null;
    
    this.hits = 0;
    this.misses = 0;
    this.startTime = null;
    this.currentInterval = 1000;
    
    // Timer Handles
    this.timeoutId = null;
    this.timerInterval = null;

    // Analysis Data
    this.offsets = []; // Array of { overshoot: float } where > 1 is overshoot, < 1 is undershoot

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
    
    this.gridContainer.innerHTML = ''; // Clear but keep overlays? No, overlays are separate
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
  }

  resetStats() {
    this.hits = 0;
    this.misses = 0;
    this.offsets = [];
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
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    this.timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  nextTarget() {
    if (!this.isPlaying) return;

    if (this.activeCellIndex !== null) {
      const currentActive = this.cells[this.activeCellIndex];
      if (currentActive.classList.contains('active')) {
        this.handleMiss();
        currentActive.classList.remove('active');
      }
    }

    this.prevCellIndex = this.activeCellIndex;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.cells.length);
    } while (newIndex === this.activeCellIndex);

    this.activeCellIndex = newIndex;
    this.cells[this.activeCellIndex].classList.add('active');

    if (this.currentInterval > this.minInterval) {
      this.currentInterval -= this.intervalDecrease;
    }
    this.intervalText.textContent = `${(this.currentInterval / 1000).toFixed(2)}s`;

    this.timeoutId = setTimeout(() => this.nextTarget(), this.currentInterval);
  }

  handleMiss() {
    this.misses++;
    this.missesDisplay.textContent = this.misses;
    this.lifeDisplay.textContent = Math.max(0, this.maxMisses - this.misses);
    
    if (this.misses >= this.maxMisses) {
      this.endGame();
    }
  }

  handleCellClick(cell, event) {
    if (cell.classList.contains('active')) {
      this.analyzeClick(event);
      this.hits++;
      this.hitsDisplay.textContent = this.hits;
      cell.classList.remove('active');
      cell.style.backgroundColor = 'rgba(16, 185, 129, 0.4)';
      setTimeout(() => cell.style.backgroundColor = '', 100);
    } else {
      this.handleMiss();
      cell.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
      setTimeout(() => cell.style.backgroundColor = '', 100);
    }
  }

  analyzeClick(event) {
    if (this.prevCellIndex === null) return;

    const prevRect = this.cells[this.prevCellIndex].getBoundingClientRect();
    const currRect = this.cells[this.activeCellIndex].getBoundingClientRect();
    
    const prevCenter = { x: prevRect.left + prevRect.width / 2, y: prevRect.top + prevRect.height / 2 };
    const currCenter = { x: currRect.left + currRect.width / 2, y: currRect.top + currRect.height / 2 };
    
    const clickX = event.clientX;
    const clickY = event.clientY;

    // Vector from Prev to Curr
    const dx = currCenter.x - prevCenter.x;
    const dy = currCenter.y - prevCenter.y;
    const targetDist = Math.sqrt(dx * dx + dy * dy);
    
    if (targetDist < 10) return; // Ignore very small movements

    // Vector from Prev to Click
    const vcx = clickX - prevCenter.x;
    const vcy = clickY - prevCenter.y;

    // Dot product to find projection of Click onto Path
    const dot = (vcx * dx + vcy * dy) / targetDist;
    const overshootRatio = dot / targetDist;

    this.offsets.push(overshootRatio);
  }

  endGame() {
    this.isPlaying = false;
    clearTimeout(this.timeoutId);
    clearInterval(this.timerInterval);
    
    this.stopBtn.classList.add('hidden');
    this.resultOverlay.classList.remove('hidden');
    
    this.finalHits.textContent = this.hits;
    this.finalTime.textContent = this.timerDisplay.textContent;

    this.showAnalysis();
  }

  showAnalysis() {
    if (this.offsets.length < 3) {
      this.analysisText.textContent = "Not enough data collected. Try to hit more targets!";
      this.recDisplay.textContent = "";
      return;
    }

    const avgOffset = this.offsets.reduce((a, b) => a + b, 0) / this.offsets.length;
    let feedback = "";
    let rec = "";
    
    // avgOffset > 1 means consistently clicking past the center (Overshoot)
    // avgOffset < 1 means consistently clicking before the center (Undershoot)
    
    if (avgOffset > 1.05) {
      feedback = `You are consistently OVERSHOOTING targets (Average: ${((avgOffset - 1) * 100).toFixed(1)}% past center).`;
      rec = "REDUCE YOUR SENSITIVITY";
      this.recDisplay.className = "recommendation adjust";
    } else if (avgOffset < 0.95) {
      feedback = `You are consistently UNDERSHOOTING targets (Average: ${((1 - avgOffset) * 100).toFixed(1)}% before center).`;
      rec = "INCREASE YOUR SENSITIVITY";
      this.recDisplay.className = "recommendation adjust";
    } else {
      feedback = "Your aim is very well centered relative to your movement vector.";
      rec = "YOUR SENSITIVITY IS OPTIMAL";
      this.recDisplay.className = "recommendation";
    }

    this.analysisText.textContent = feedback;
    this.recDisplay.textContent = rec;
  }

  stopGame() {
    this.endGame();
    this.resultOverlay.classList.add('hidden');
    this.startOverlay.classList.remove('hidden');
    this.startBtn.textContent = 'RESTART TEST';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SensGame();
});
