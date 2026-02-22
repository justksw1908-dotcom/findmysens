export class SensitivityCalculator {
  constructor() {
    this.multipliers = {
      'cs2': 1,
      'apex': 1,
      'tf2': 1,
      'valorant': 1 / 3.181818,
      'ow2': 3.333333,
      'cod': 3.333333,
      'destiny2': 3.333333,
      'r6': 3.839 
    };
  }

  calculateGrade(accuracy, avgDist) {
    if (accuracy > 95 && avgDist < 10) return 'SSS';
    if (accuracy > 90 && avgDist < 15) return 'SS';
    if (accuracy > 85) return 'S';
    if (accuracy > 75) return 'A';
    if (accuracy > 60) return 'B';
    if (accuracy > 40) return 'C';
    return 'D';
  }

  calculateAdjustedSens(currentSens, gameKey, deviationPercent) {
    const adjustmentFactor = 1 - (deviationPercent / 100);
    const perfectSens = currentSens * adjustmentFactor;
    const baseCs2Sens = perfectSens / this.multipliers[gameKey];
    
    const results = {};
    for (const [key, multi] of Object.entries(this.multipliers)) {
      results[key] = baseCs2Sens * multi;
    }
    return results;
  }

  calculateDeviation(offsets) {
    if (offsets.length === 0) return 0;
    const avgOffsetRatio = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    return (avgOffsetRatio - 1) * 100;
  }
}
