/**
 * OYUN 2: AKINTI & ROTA (Bilişsel Esneklik & Görev Değiştirme)
 * Lumosity'deki "Ebb and Flow" mantığından ilham alınarak geliştirilmiştir.
 * Oyuncunun kural değişimine (YÖN vs RENK) hızlı adapte olmasını ölçer.
 */
class StreamGame {
  constructor(containerElement, hudElements) {
    this.container = containerElement;
    this.hud = hudElements;

    this.score = 0;
    this.round = 0;
    this.lives = 3;
    this.isPlaying = false;
    this.currentRule = 'direction'; // 'direction' veya 'color'
    this.currentTarget = null;
    this.startTime = 0;
    this.reactionTimes = [];

    this.colors = [
      { id: 'emerald', name: 'Zümrüt', hex: '#10b981', arrow: '↑' },
      { id: 'cyan', name: 'Turkuaz', hex: '#06b6d4', arrow: '→' },
      { id: 'amber', name: 'Kehribar', hex: '#f59e0b', arrow: '↓' },
      { id: 'rose', name: 'Mercan', hex: '#f43f5e', arrow: '←' }
    ];

    this.directions = [
      { id: 'up', symbol: '↑', key: 'ArrowUp', deg: 0 },
      { id: 'right', symbol: '→', key: 'ArrowRight', deg: 90 },
      { id: 'down', symbol: '↓', key: 'ArrowDown', deg: 180 },
      { id: 'left', symbol: '←', key: 'ArrowLeft', deg: 270 }
    ];

    this.keyHandler = this.handleKeyDown.bind(this);
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="stream-arena">
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
          <div class="stream-cue-card" id="stream-cue">KURAL: YÖNE ODAKLAN</div>
          <div style="font-weight:700; color:var(--accent-danger);" id="stream-lives">❤️❤️❤️</div>
        </div>

        <div class="stream-visual-stage" id="stream-visual">
          <div class="stream-arrow-icon" id="stream-arrow">➔</div>
        </div>

        <div style="font-size:0.85rem; color:var(--text-dim); text-align:center;">
          Yön Tuşları veya Aşağıdaki Butonları Kullanabilirsiniz
        </div>

        <div class="stream-buttons-grid">
          <button class="stream-btn" data-dir="left">←</button>
          <button class="stream-btn" data-dir="up">↑</button>
          <button class="stream-btn" data-dir="down">↓</button>
          <button class="stream-btn" data-dir="right">→</button>
        </div>

        <button class="btn-primary" id="stream-start-btn" style="width:100%; max-width:280px;">Egzersizi Başlat</button>
      </div>
    `;

    this.cueEl = this.container.querySelector('#stream-cue');
    this.livesEl = this.container.querySelector('#stream-lives');
    this.visualEl = this.container.querySelector('#stream-visual');
    this.arrowEl = this.container.querySelector('#stream-arrow');
    this.startBtn = this.container.querySelector('#stream-start-btn');

    this.startBtn.onclick = () => this.startGame();

    this.container.querySelectorAll('.stream-btn').forEach(btn => {
      btn.onclick = () => {
        if (!this.isPlaying) return;
        this.submitAnswer(btn.dataset.dir);
      };
    });
  }

  startGame() {
    this.score = 0;
    this.round = 0;
    this.lives = 3;
    this.reactionTimes = [];
    this.isPlaying = true;
    this.startBtn.style.display = 'none';

    window.addEventListener('keydown', this.keyHandler);
    this.updateStats();
    this.nextTrial();
  }

  nextTrial() {
    if (this.lives <= 0) {
      this.gameOver();
      return;
    }

    this.round++;
    // Her 3-4 turda bir kuralı değiştir (Bilişsel esneklik testi)
    if (this.round % 3 === 0 || Math.random() < 0.35) {
      this.currentRule = this.currentRule === 'direction' ? 'color' : 'direction';
    }

    if (this.currentRule === 'direction') {
      this.cueEl.textContent = 'KURAL: OKUN YÖNÜ';
      this.cueEl.style.borderColor = 'var(--accent-primary)';
      this.cueEl.style.color = 'var(--accent-primary)';
    } else {
      this.cueEl.textContent = 'KURAL: RENK EŞLEŞTİRME';
      this.cueEl.style.borderColor = 'var(--accent-warm)';
      this.cueEl.style.color = 'var(--accent-warm)';
    }

    // Rastgele yön ve rastgele renk seç
    const randomDir = this.directions[Math.floor(Math.random() * this.directions.length)];
    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];

    this.currentTarget = {
      direction: randomDir.id,
      colorId: randomColor.id,
      // Renk kuralında doğru yön: Zümrüt: Up, Turkuaz: Right, Kehribar: Down, Mercan: Left
      colorCorrectDir: randomColor.id === 'emerald' ? 'up' : (randomColor.id === 'cyan' ? 'right' : (randomColor.id === 'amber' ? 'down' : 'left'))
    };

    // Oku güncelle
    this.arrowEl.style.color = randomColor.hex;
    this.arrowEl.style.transform = `rotate(${randomDir.deg}deg)`;

    this.startTime = performance.now();
  }

  submitAnswer(chosenDir) {
    if (!this.isPlaying) return;

    const reactionTime = Math.round(performance.now() - this.startTime);
    this.reactionTimes.push(reactionTime);

    let isCorrect = false;
    if (this.currentRule === 'direction') {
      isCorrect = chosenDir === this.currentTarget.direction;
    } else {
      isCorrect = chosenDir === this.currentTarget.colorCorrectDir;
    }

    if (isCorrect) {
      // Hız bonusu
      const speedBonus = Math.max(0, Math.round((1200 - reactionTime) / 30));
      this.score += 25 + speedBonus;
      if (window.soundEngine) window.soundEngine.playTileTone(8, 0.15);

      this.visualEl.style.borderColor = 'var(--accent-primary)';
      setTimeout(() => {
        this.visualEl.style.borderColor = 'var(--border-color)';
      }, 150);
    } else {
      this.lives--;
      if (window.soundEngine) window.soundEngine.playErrorTone();
      this.visualEl.style.borderColor = 'var(--accent-danger)';
      setTimeout(() => {
        this.visualEl.style.borderColor = 'var(--border-color)';
      }, 150);
    }

    this.updateStats();
    setTimeout(() => {
      this.nextTrial();
    }, 200);
  }

  handleKeyDown(e) {
    if (!this.isPlaying) return;
    const map = {
      'ArrowUp': 'up',
      'ArrowRight': 'right',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'w': 'up',
      'd': 'right',
      's': 'down',
      'a': 'left'
    };
    if (map[e.key]) {
      e.preventDefault();
      this.submitAnswer(map[e.key]);
    }
  }

  updateStats() {
    if (this.hud.score) this.hud.score.textContent = this.score;
    if (this.hud.level) this.hud.level.textContent = `Tur ${this.round}`;
    if (this.livesEl) {
      this.livesEl.textContent = '❤️'.repeat(Math.max(0, this.lives));
    }
  }

  gameOver() {
    this.isPlaying = false;
    window.removeEventListener('keydown', this.keyHandler);

    const avgReaction = this.reactionTimes.length
      ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
      : 0;

    this.cueEl.textContent = 'EGZERSİZ TAMAMLANDI';
    this.arrowEl.textContent = '🏆';
    this.arrowEl.style.transform = 'none';

    this.startBtn.style.display = 'inline-flex';
    this.startBtn.textContent = 'Tekrar Oyna';

    if (window.soundEngine) window.soundEngine.playSuccessArpeggio();

    if (window.storageManager) {
      window.storageManager.recordGameResult('stream', this.score, 'flexibility', {
        avgReactionMs: avgReaction,
        rounds: this.round
      });
    }
  }

  destroy() {
    this.isPlaying = false;
    window.removeEventListener('keydown', this.keyHandler);
  }
}

window.StreamGame = StreamGame;
