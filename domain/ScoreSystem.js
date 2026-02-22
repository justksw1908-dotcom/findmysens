export class ScoreSystem {
  calculateScore(hits, misses, currentInterval) {
    if (hits + misses === 0) return 0;
    const accuracy = (hits / (hits + misses)) * 100;
    // (Hits * 100) + (Accuracy * 50) + Reaction Speed Bonus
    const baseScore = hits * 100;
    const accuracyBonus = accuracy * 50;
    const speedBonus = Math.max(0, 1000 - currentInterval);
    
    return Math.floor(baseScore + accuracyBonus + speedBonus);
  }
}
