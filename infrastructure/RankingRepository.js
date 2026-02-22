export class RankingRepository {
  constructor() {
    this.STORAGE_KEY = 'fms_leaderboard';
  }

  saveRanking(entry) {
    const leaderboard = this.getTopRankings(100);
    leaderboard.push({ ...entry, date: Date.now() });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leaderboard.slice(0, 50)));
  }

  getTopRankings(limit = 50) {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data).slice(0, limit) : [];
  }
}
