export class GameManager {
  constructor() {
    this.isPlaying = false;
    this.isLifeMode = false;
    this.hits = 0;
    this.misses = 0;
    this.startTime = null;
    this.initialInterval = 1000;
    this.currentInterval = 1000;
    this.minInterval = 300;
    this.intervalDecrease = 10;
    this.intervalPenalty = 50; // Slow down penalty
    
    this.activeCellIndex = null;
    this.prevCellIndex = null;
    this.timerIntervalId = null;
    this.targetTimeoutId = null;
    
    this.lastHitTime = 0;
    this.HIT_COOLDOWN = 150;
    
    this.consecutiveNoClicks = 0;
    this.MAX_NO_CLICKS = 10;
    this.missLoggedThisFlash = false; // Prevent multiple misses per target flash
    
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
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);
    if (this.targetTimeoutId) clearTimeout(this.targetTimeoutId);

    this.isLifeMode = config.isLifeMode;
    this.hits = 0;
    this.misses = 0;
    this.consecutiveNoClicks = 0;
    this.currentInterval = this.initialInterval;
    this.isPlaying = true;
    this.startTime = Date.now();
    this.lastHitTime = 0;
    
    this.emit('gameStarted', { isLifeMode: this.isLifeMode });
    this.spawnTarget();
    
    this.timerIntervalId = setInterval(() => {
      this.emit('timerUpdated', this.getElapsedString());
    }, 100);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);
    if (this.targetTimeoutId) clearTimeout(this.targetTimeoutId);
    this.emit('gameEnded', {
      hits: this.hits,
      misses: this.misses,
      finalInterval: this.currentInterval,
      timeString: this.getElapsedString()
    });
  }

  spawnTarget() {
    if (!this.isPlaying) return;
    
    this.missLoggedThisFlash = false; // Reset for new target
    this.prevCellIndex = this.activeCellIndex;
    this.emit('targetExpired', this.activeCellIndex);
    
    this.emit('targetSpawned', (cellCount) => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * cellCount);
      } while (newIndex === this.activeCellIndex);
      this.activeCellIndex = newIndex;
      return newIndex;
    });

    this.targetTimeoutId = setTimeout(() => {
      if (!this.missLoggedThisFlash) {
        this.handleMiss(); // Handle AFK miss
      }
      this.spawnTarget();
    }, this.currentInterval);
  }

  handleHit() {
    if (!this.isPlaying) return;
    
    const now = Date.now();
    if (now - this.lastHitTime < this.HIT_COOLDOWN) return;
    
    this.lastHitTime = now;
    this.consecutiveNoClicks = 0; // Reset AFK counter
    this.missLoggedThisFlash = true; // Mark as processed
    
    clearTimeout(this.targetTimeoutId);
    this.hits++;
    this.currentInterval = Math.max(this.minInterval, this.currentInterval - this.intervalDecrease);
    this.emit('hit', { hits: this.hits, interval: this.currentInterval });
    this.spawnTarget();
  }

  handleMiss() {
    if (!this.isPlaying || this.missLoggedThisFlash) return;
    
    this.missLoggedThisFlash = true;
    this.misses++;
    this.consecutiveNoClicks++;
    
    // Slow down penalty
    this.currentInterval = Math.min(this.initialInterval, this.currentInterval + this.intervalPenalty);
    
    this.emit('miss', { misses: this.misses, interval: this.currentInterval });
    
    if (this.consecutiveNoClicks >= this.MAX_NO_CLICKS) {
      this.stop();
      return;
    }

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
