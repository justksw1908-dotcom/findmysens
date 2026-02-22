/**
 * FindMySens - FPS Mouse Sensitivity Checker
 */

class SensGame {
  constructor() {
    this.mouseData = {
      'Logitech': ['G Pro Wireless', 'G Pro X Superlight', 'G Pro X Superlight 2', 'G304', 'G102', 'G402', 'G403', 'G502 Hero', 'G502 X', 'G502 X Plus', 'G502 Lightspeed', 'G603', 'G604', 'G703', 'G903'],
      'Razer': ['Viper', 'Viper Mini', 'Viper V2 Pro', 'Viper V3 Pro', 'DeathAdder V2', 'DeathAdder V3 Pro', 'Basilisk V3', 'Cobra', 'Orochi V2'],
      'Zowie': ['EC1-C', 'EC2-C', 'EC3-C', 'EC1-CW', 'EC2-CW', 'FK1-C', 'FK2-C', 'ZA11-C', 'ZA12-C', 'ZA13-C', 'S1-C', 'S2-C'],
      'SteelSeries': ['Aerox 3', 'Aerox 5', 'Rival 3', 'Rival 5', 'Sensei Ten', 'Prime Wireless'],
      'Pulsar': ['Xlite V3', 'Xlite V3 Mini', 'X2 V2', 'X2 V2 Mini', 'X2H', 'X2H Mini'],
      'Vaxee': ['NP-01', 'NP-01S', 'AX', 'XE', 'OUTSET AX'],
      'Finalmouse': ['UltralightX', 'Starlight-12', 'Air58'],
      'VGN/VXE': ['Dragonfly F1 Pro', 'VXE R1 Pro'],
      'LAMZU': ['Atlantis', 'Atlantis Mini', 'Thorn', 'Maya']
    };

    this.translations = {
      en: {
        hits: "HITS", misses: "MISSES", time: "TIME", stop_test: "STOP TEST", to_stop: "TO STOP",
        user_info: "USER INFO", mouse: "MOUSE", game_sens: "GAME / SENS", edit_info: "EDIT INFO",
        life_mode: "LIFE MODE (5 MISSES LIMIT)", start_test: "START TEST", hint_text: "Precision analysis based on target center dot.",
        view_leaderboard: "View Top 50 Leaderboard", test_summary: "TEST SUMMARY", precision_grade: "PRECISION GRADE",
        final_score: "FINAL SCORE", sens_analysis: "SENSITIVITY ANALYSIS", avg_aim_deviation: "AVG AIM DEVIATION",
        register_ranking: "Register Your Score", submit: "SUBMIT", global_converter: "🎮 Global Sensitivity Converter",
        restart_test: "RESTART TEST (Space)", select_brand: "Select your mouse brand", select_model: "Select your mouse model",
        select_mouse_model: "Select Model", next: "NEXT", enter_settings: "Enter your game settings",
        main_game: "MAIN GAME", ingame_sens: "IN-GAME SENSITIVITY", mouse_dpi: "MOUSE DPI", complete: "COMPLETE",
        top_50_leaderboard: "TOP 50 LEADERBOARD", rank: "Rank", name: "Name", score: "Score"
      },
      ko: {
        hits: "명중", misses: "빗나감", time: "시간", stop_test: "테스트 중단", to_stop: "중단하려면",
        user_info: "사용자 정보", mouse: "마우스", game_sens: "게임 / 감도", edit_info: "정보 수정",
        life_mode: "라이프 모드 (5회 실수 제한)", start_test: "테스트 시작", hint_text: "타겟 중앙 점을 기준으로 정확도를 분석합니다.",
        view_leaderboard: "TOP 50 랭킹 보기", test_summary: "테스트 결과", precision_grade: "정확도 등급",
        final_score: "최종 점수", sens_analysis: "감도 분석", avg_aim_deviation: "평균 에임 오차",
        register_ranking: "랭킹 등록하기", submit: "등록", global_converter: "🎮 글로벌 게임 감도 변환기",
        restart_test: "다시 시작 (Space)", select_brand: "마우스 브랜드를 선택하세요", select_model: "모델을 선택하세요",
        select_mouse_model: "마우스 모델 선택", next: "다음", enter_settings: "게임 설정을 입력하세요",
        main_game: "주 플레이 게임", ingame_sens: "인게임 감도", mouse_dpi: "마우스 DPI", complete: "완료",
        top_50_leaderboard: "TOP 50 리더보드", rank: "순위", name: "이름", score: "점수"
      },
      ja: {
        hits: "ヒット", misses: "ミス", time: "時間", stop_test: "テスト終了", to_stop: "終了するには",
        user_info: "ユーザー情報", mouse: "マウス", game_sens: "ゲーム / 感度", edit_info: "情報修正",
        life_mode: "ライフモード (5回ミスで終了)", start_test: "テスト開始", hint_text: "ターゲットの中心点に基づいて精度を分析します。",
        view_leaderboard: "TOP 50 ランキングを表示", test_summary: "テスト結果", precision_grade: "精度ランク",
        final_score: "最終スコア", sens_analysis: "感度分析", avg_aim_deviation: "平均エイム偏差",
        register_ranking: "スコアを登録", submit: "送信", global_converter: "🎮 感度コンバーター",
        restart_test: "再試行 (Space)", select_brand: "マウスブランドを選択", select_model: "モデルを選択",
        select_mouse_model: "マウスモデルを選択", next: "次へ", enter_settings: "ゲーム設定を入力",
        main_game: "メインゲーム", ingame_sens: "インゲーム感度", mouse_dpi: "マウスDPI", complete: "完了",
        top_50_leaderboard: "TOP 50 リーダーボード", rank: "順位", name: "名前", score: "スコア"
      },
      zh: {
        hits: "命中", misses: "失误", time: "时间", stop_test: "停止测试", to_stop: "停止",
        user_info: "用户信息", mouse: "鼠标", game_sens: "游戏 / 灵敏度", edit_info: "编辑信息",
        life_mode: "生命模式 (5次失误限制)", start_test: "开始测试", hint_text: "基于目标中心点的精度分析。",
        view_leaderboard: "查看前50名排行榜", test_summary: "测试摘要", precision_grade: "精度等级",
        final_score: "最终得分", sens_analysis: "灵敏度分析", avg_aim_deviation: "平均瞄准偏差",
        register_ranking: "注册您的分数", submit: "提交", global_converter: "🎮 全球灵敏度转换器",
        restart_test: "重新开始 (Space)", select_brand: "选择您的鼠标品牌", select_model: "选择您的鼠标型号",
        select_mouse_model: "选择鼠标型号", next: "下一步", enter_settings: "输入您的游戏设置",
        main_game: "主要游戏", ingame_sens: "游戏内灵敏度", mouse_dpi: "鼠标DPI", complete: "完成",
        top_50_leaderboard: "前50名排行榜", rank: "排名", name: "姓名", score: "得分"
      }
    };

    this.userInfo = { brand: '', model: '', dpi: '', game: '', sens: '' };
    this.currentLang = 'en';
    this.isPlaying = false;
    this.isLifeMode = false;
    this.hits = 0;
    this.misses = 0;
    this.currentInterval = 1000;
    this.offsets = [];
    this.pixelDistances = [];
    this.graphData = { labels: [], accuracy: [], avgDistance: [] };

    this.initDOM();
    this.initEvents();
    this.initConverter();
    this.initSetupModal();
    this.loadLeaderboard();
  }

  initDOM() {
    this.gridContainer = document.getElementById('grid-container');
    this.hitsDisplay = document.getElementById('hits-count');
    this.missesDisplay = document.getElementById('misses-count');
    this.lifeDisplay = document.getElementById('life-left');
    this.timerDisplay = document.getElementById('timer-display');
    this.startBtn = document.getElementById('start-btn');
    this.stopBtn = document.getElementById('stop-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.startOverlay = document.getElementById('overlay-start');
    this.resultOverlay = document.getElementById('overlay-result');
    this.lifeToggle = document.getElementById('life-mode-toggle');
    this.langSelect = document.getElementById('lang-select');
    this.setupModal = document.getElementById('setup-modal');
    this.modelSelect = document.getElementById('mouse-model-select');
    this.sidebar = document.getElementById('user-info-sidebar');
    this.leaderboardModal = document.getElementById('leaderboard-modal');
  }

  initEvents() {
    this.startBtn.addEventListener('click', () => this.userInfo.brand ? this.startGame() : this.openSetupModal());
    this.stopBtn.addEventListener('click', () => this.stopGame());
    this.restartBtn.addEventListener('click', () => this.resetGame());
    this.langSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
    
    document.getElementById('view-leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
    document.getElementById('edit-info-btn').addEventListener('click', () => this.openSetupModal());
    document.getElementById('submit-rank-btn').addEventListener('click', () => this.submitRank());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (this.isPlaying) { e.preventDefault(); this.stopGame(); }
        else if (!this.resultOverlay.classList.contains('hidden')) { e.preventDefault(); this.resetGame(); }
      }
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        document.getElementById('grid-size-text').textContent = btn.textContent;
        this.createGrid();
      });
    });

    this.gridContainer.addEventListener('mousedown', (e) => {
      if (this.isPlaying) {
        const cell = e.target.closest('.grid-cell');
        if (cell) this.handleCellClick(cell, e);
      }
    });

    this.currentMode = 'standard';
    this.createGrid();
  }

  changeLanguage(lang) {
    this.currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.translations[lang][key]) {
        el.textContent = this.translations[lang][key];
      }
    });
    // Update placeholders
    document.getElementById('rank-name').placeholder = lang === 'ko' ? '이름' : (lang === 'ja' ? '名前' : (lang === 'zh' ? '姓名' : 'Name'));
  }

  createGrid() {
    const modes = { standard: { cols: 16, rows: 9, side: 70 }, small: { cols: 32, rows: 18, side: 35 } };
    const config = modes[this.currentMode];
    this.gridContainer.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    this.gridContainer.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
    this.gridContainer.innerHTML = '';
    this.gridContainer.appendChild(this.startOverlay);
    this.gridContainer.appendChild(this.resultOverlay);

    this.cells = [];
    for (let i = 0; i < config.cols * config.rows; i++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
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
    document.querySelector('.key-hint-container').classList.remove('hidden');
    
    this.startTime = Date.now();
    this.nextTarget();
    this.timerInterval = setInterval(() => this.updateTimer(), 100);
    this.graphUpdateInterval = setInterval(() => this.recordGraphSnapshot(), 2000);
  }

  resetStats() {
    this.hits = 0; this.misses = 0; this.offsets = []; this.pixelDistances = [];
    this.graphData = { labels: [], accuracy: [], avgDistance: [] };
    this.hitsDisplay.textContent = '0';
    this.missesDisplay.textContent = '0';
    this.lifeDisplay.textContent = this.isLifeMode ? '5' : '∞';
    this.timerDisplay.textContent = '00:00';
    this.currentInterval = 1000;
    this.cells.forEach(c => c.classList.remove('active'));
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    this.timerDisplay.textContent = `${m}:${s}`;
  }

  nextTarget() {
    if (!this.isPlaying) return;
    this.cells.forEach(c => c.classList.remove('active'));
    this.activeCellIndex = Math.floor(Math.random() * this.cells.length);
    this.cells[this.activeCellIndex].classList.add('active');
    this.timeoutId = setTimeout(() => {
      this.applyMiss();
      this.nextTarget();
    }, this.currentInterval);
  }

  handleCellClick(cell, e) {
    if (cell.classList.contains('active')) {
      clearTimeout(this.timeoutId);
      this.analyzeClick(e);
      this.hits++;
      this.hitsDisplay.textContent = this.hits;
      this.currentInterval = Math.max(300, this.currentInterval - 10);
      this.nextTarget();
    } else {
      this.applyMiss();
    }
  }

  applyMiss() {
    this.misses++;
    this.missesDisplay.textContent = this.misses;
    if (this.isLifeMode) {
      const life = 5 - this.misses;
      this.lifeDisplay.textContent = life;
      if (life <= 0) this.endGame();
    }
  }

  analyzeClick(e) {
    const rect = this.cells[this.activeCellIndex].getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
    this.pixelDistances.push(dist);
  }

  endGame() {
    this.isPlaying = false;
    clearTimeout(this.timeoutId);
    clearInterval(this.timerInterval);
    clearInterval(this.graphUpdateInterval);
    this.stopBtn.classList.add('hidden');
    this.resultOverlay.classList.remove('hidden');
    this.showAnalysis();
    
    if (this.isLifeMode) {
      const score = this.calculateScore();
      document.getElementById('life-mode-score-box').classList.remove('hidden');
      document.getElementById('final-score-value').textContent = score;
      document.getElementById('ranking-reg-section').classList.remove('hidden');
    } else {
      document.getElementById('life-mode-score-box').classList.add('hidden');
      document.getElementById('ranking-reg-section').classList.add('hidden');
    }
    this.syncConverter();
  }

  calculateScore() {
    const accuracy = (this.hits / (this.hits + this.misses)) * 100;
    return Math.floor((this.hits * 100) + (accuracy * 50) + Math.max(0, 1000 - (this.currentInterval)));
  }

  showAnalysis() {
    const avgDist = this.pixelDistances.reduce((a, b) => a + b, 0) / (this.pixelDistances.length || 1);
    const accuracy = (this.hits / (this.hits + this.misses || 1)) * 100;
    let grade = 'D';
    if (accuracy > 95 && avgDist < 10) grade = 'SSS';
    else if (accuracy > 90 && avgDist < 15) grade = 'SS';
    else if (accuracy > 85) grade = 'S';
    else if (accuracy > 75) grade = 'A';
    else if (accuracy > 60) grade = 'B';
    
    const finalGradeEl = document.getElementById('final-grade');
    finalGradeEl.textContent = grade;
    finalGradeEl.className = `grade-value ${grade.toLowerCase()}`;
    document.getElementById('final-hits').textContent = this.hits;
    document.getElementById('final-time').textContent = this.timerDisplay.textContent;
  }

  submitRank() {
    const name = document.getElementById('rank-name').value || 'Anonymous';
    const country = document.getElementById('rank-country').value;
    const score = parseInt(document.getElementById('final-score-value').textContent);
    const leaderboard = JSON.parse(localStorage.getItem('fms_leaderboard') || '[]');
    leaderboard.push({ name, country, score, date: Date.now() });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('fms_leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
    alert('Rank Registered!');
    document.getElementById('ranking-reg-section').classList.add('hidden');
  }

  showLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('fms_leaderboard') || '[]');
    const body = document.getElementById('leaderboard-body');
    body.innerHTML = leaderboard.map((entry, i) => `
      <tr>
        <td>#${i + 1}</td>
        <td>${this.getFlag(entry.country)} ${entry.name}</td>
        <td style="color: #ffd700; font-weight: bold;">${entry.score.toLocaleString()}</td>
      </tr>
    `).join('');
    this.leaderboardModal.classList.remove('hidden');
  }

  getFlag(code) {
    const flags = { KR: '🇰🇷', US: '🇺🇸', JP: '🇯🇵', CN: '🇨🇳', TW: '🇹🇼', FR: '🇫🇷', DE: '🇩🇪', BR: '🇧🇷', Global: '🌐' };
    return flags[code] || '🌐';
  }

  loadLeaderboard() {} 

  initSetupModal() {
    document.querySelectorAll('.brand-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.userInfo.brand = btn.dataset.brand;
        const models = this.mouseData[this.userInfo.brand].sort();
        this.modelSelect.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('') + '<option value="Other">Other</option>';
        document.querySelector('.modal-step[data-step="1"]').classList.add('hidden');
        document.querySelector('.modal-step[data-step="2"]').classList.remove('hidden');
      });
    });
    document.querySelector('.next-step-btn').addEventListener('click', () => {
      this.userInfo.model = this.modelSelect.value;
      document.querySelector('.modal-step[data-step="2"]').classList.add('hidden');
      document.querySelector('.modal-step[data-step="3"]').classList.remove('hidden');
    });
    document.getElementById('finish-setup-btn').addEventListener('click', () => {
      this.userInfo.game = document.getElementById('setup-game-select').value;
      this.userInfo.sens = document.getElementById('setup-sens-input').value;
      this.userInfo.dpi = document.getElementById('setup-dpi-input').value;
      this.updateSidebar();
      this.setupModal.classList.add('hidden');
    });
  }

  updateSidebar() {
    document.getElementById('side-brand').textContent = this.userInfo.brand;
    document.getElementById('side-model').textContent = this.userInfo.model;
    document.getElementById('side-dpi').textContent = `${this.userInfo.dpi} DPI`;
    document.getElementById('side-game').textContent = this.userInfo.game;
    document.getElementById('side-sens').textContent = this.userInfo.sens;
    this.sidebar.classList.remove('hidden');
  }

  openSetupModal() {
    this.setupModal.classList.remove('hidden');
    document.querySelectorAll('.modal-step').forEach(s => s.classList.add('hidden'));
    document.querySelector('.modal-step[data-step="1"]').classList.remove('hidden');
  }

  resetGame() {
    this.resultOverlay.classList.add('hidden');
    this.startOverlay.classList.remove('hidden');
    this.resetStats();
  }

  initConverter() {
    this.gameSelect = document.getElementById('game-select');
    this.sensInput = document.getElementById('current-sens');
    this.resultsDiv = document.getElementById('converted-results');
    const update = () => {
      const s = parseFloat(this.sensInput.value);
      if (!s) return;
      const base = s / this.multipliers[this.gameSelect.value];
      this.resultsDiv.innerHTML = `<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">` + 
        Object.entries(this.multipliers).map(([k, v]) => `
          <div style="background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px; font-size: 10px;">
            ${this.gameNames[k]}<br><b style="color: #fff; font-size: 12px;">${(base * v).toFixed(3)}</b>
          </div>
        `).join('') + `</div>`;
    };
    this.gameSelect.addEventListener('change', update);
    this.sensInput.addEventListener('input', update);
    this.updateConversion = update;
  }

  syncConverter() {
    const map = { 'Valorant': 'valorant', 'CS2': 'cs2', 'Apex': 'apex', 'Overwatch 2': 'ow2' };
    if (map[this.userInfo.game]) this.gameSelect.value = map[this.userInfo.game];
    this.sensInput.value = this.userInfo.sens;
    if (this.updateConversion) this.updateConversion();
  }

  recordGraphSnapshot() {} 
}

document.addEventListener('DOMContentLoaded', () => new SensGame());
