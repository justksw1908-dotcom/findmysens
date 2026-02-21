/**
 * FindMySens - FPS Mouse Sensitivity Checker
 * Logic for grid generation, target cycling, and score tracking.
 */

class SensGame {
  constructor() {
    this.gridContainer = document.getElementById('grid-container');
    this.hitsDisplay = document.getElementById('hits-count');
    this.missesDisplay = document.getElementById('misses-count');
    this.timerDisplay = document.getElementById('timer-display');
    this.startBtn = document.getElementById('start-btn');
    this.stopBtn = document.getElementById('stop-btn');
    this.overlay = document.getElementById('overlay-start');

    // Monitor ratio 16:9, but cells are square
    this.cols = 16;
    this.rows = 9;
    this.interval = 1000; // 1 second
    this.cells = [];
    this.activeCellIndex = null;
    
    this.hits = 0;
    this.misses = 0;
    this.startTime = null;
    this.gameInterval = null;
    this.timerInterval = null;
    this.isPlaying = false;

    this.init();
  }

  init() {
    this.createGrid();
    this.startBtn.addEventListener('click', () => this.startGame());
    this.stopBtn.addEventListener('click', () => this.stopGame());
    
    // Global click listener for the grid to track misses
    this.gridContainer.addEventListener('mousedown', (e) => {
      if (!this.isPlaying) return;
      
      const target = e.target;
      if (target.classList.contains('grid-cell')) {
        this.handleCellClick(target);
      }
    });
  }

  createGrid() {
    // Clear existing cells (except overlay)
    const existingCells = this.gridContainer.querySelectorAll('.grid-cell');
    existingCells.forEach(cell => cell.remove());
    this.cells = [];

    for (let i = 0; i < this.cols * this.rows; i++) {
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
    this.overlay.classList.add('hidden');
    this.stopBtn.classList.remove('hidden');
    this.startTime = Date.now();

    // Start target cycle
    this.nextTarget();
    this.gameInterval = setInterval(() => this.nextTarget(), this.interval);
    
    // Start timer display
    this.timerInterval = setInterval(() => this.updateTimer(), 100);
  }

  resetStats() {
    this.hits = 0;
    this.misses = 0;
    this.hitsDisplay.textContent = '0';
    this.missesDisplay.textContent = '0';
    this.timerDisplay.textContent = '00:00';
    this.cells.forEach(cell => {
      cell.classList.remove('active');
      cell.style.backgroundColor = '';
    });
    this.activeCellIndex = null;
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    this.timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  nextTarget() {
    // If there was an active target that wasn't clicked, it's a miss
    if (this.activeCellIndex !== null) {
      const currentActive = this.cells[this.activeCellIndex];
      if (currentActive.classList.contains('active')) {
        this.misses++;
        this.missesDisplay.textContent = this.misses;
        currentActive.classList.remove('active');
      }
    }

    // Pick new random index
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.cells.length);
    } while (newIndex === this.activeCellIndex);

    this.activeCellIndex = newIndex;
    this.cells[this.activeCellIndex].classList.add('active');
  }

  handleCellClick(cell) {
    if (cell.classList.contains('active')) {
      this.hits++;
      this.hitsDisplay.textContent = this.hits;
      cell.classList.remove('active');
      
      // Visual feedback for hit
      cell.style.backgroundColor = 'rgba(16, 185, 129, 0.5)';
      setTimeout(() => {
        if (cell) cell.style.backgroundColor = '';
      }, 100);

    } else {
      this.misses++;
      this.missesDisplay.textContent = this.misses;
      
      // Visual feedback for miss
      cell.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
      setTimeout(() => {
        if (cell) cell.style.backgroundColor = '';
      }, 100);
    }
  }

  stopGame() {
    this.isPlaying = false;
    clearInterval(this.gameInterval);
    clearInterval(this.timerInterval);
    this.overlay.classList.remove('hidden');
    this.stopBtn.classList.add('hidden');
    this.startBtn.textContent = 'RESTART TEST';
    
    // Clear active target
    if (this.activeCellIndex !== null) {
      this.cells[this.activeCellIndex].classList.remove('active');
    }
  }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
  new SensGame();
});
