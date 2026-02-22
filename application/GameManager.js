export class GameManager {
  constructor() {
    this.isPlaying = false;
    this.isLifeMode = false;
    this.hits = 0;
    this.misses = 0;
    this.startTime = null;
    this.currentInterval = 1000;
    this.minInterval = 300;
    this.intervalDecrease = 10;
    
    this.activeCellIndex = null;
    this.prevCellIndex = null;
    this.timerIntervalId = null;
    this.targetTimeoutId = null;
    
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  start(config) {
    this.isLifeMode = config.isLifeMode;
    this.hits = 0;
    this.misses = 0;
    this.currentInterval = 1000;
    this.isPlaying = true;
    this.startTime = Date.now();
    
    this.emit('gameStarted', { isLifeMode: this.isLifeMode });
    this.spawnTarget();
    
    this.timerIntervalId = setInterval(() => {
      this.emit('timerUpdated', this.getElapsedString());
    }, 100);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    clearInterval(this.timerIntervalId);
    clearTimeout(this.targetTimeoutId);
    this.emit('gameEnded', {
      hits: this.hits,
      misses: this.misses,
      finalInterval: this.currentInterval,
      timeString: this.getElapsedString()
    });
  }

  spawnTarget() {
    if (!this.isPlaying) return;
    
    this.prevCellIndex = this.activeCellIndex;
    this.emit('targetExpired', this.activeCellIndex);
    
    // Logic for picking new target index should be informed by total cells
    this.emit('targetSpawned', (cellCount) => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * cellCount);
      } while (newIndex === this.activeCellIndex);
      this.activeCellIndex = newIndex;
      return newIndex;
    });

    this.targetTimeoutId = setTimeout(() => {
      this.handleMiss();
      this.spawnTarget();
    }, this.currentInterval);
  }

  handleHit() {
    if (!this.isPlaying) return;
    clearTimeout(this.targetTimeoutId);
    this.hits++;
    this.currentInterval = Math.max(this.minInterval, this.currentInterval - this.intervalDecrease);
    this.emit('hit', { hits: this.hits, interval: this.currentInterval });
    this.spawnTarget();
  }

  handleMiss() {
    if (!this.isPlaying) return;
    this.misses++;
    this.emit('miss', { misses: this.misses });
    
    if (this.isLifeMode) {
      const life = 5 - this.misses;
      this.emit('lifeUpdated', life);
      if (life <= 0) {
        this.stop();
      }
    }
  }

  getElapsedString() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
