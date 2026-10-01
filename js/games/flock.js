/**
 * OYUN 4: SÜRÜ ALGISI (Görsel Seçici Dikkat & Uzamsal Odaklanma)
 * Lumosity "Lost in Migration" konseptinin fütüristik ve dinamik bir yorumudur.
 * Etraftaki yanıltıcı oklara (sürü) rağmen merkezdeki lider okun yönünü tespit etmeyi ölçer.
 */
class FlockGame {
  constructor(containerElement, hudElements) {
    this.container = containerElement;
    this.hud = hudElements;

    this.score = 0;
    this.streak = 0;
    this.round = 0;
    this.isPlaying = false;
    this.leaderDirection = 'up';

    this.dirMap = {
      'up': { symbol: '▲', key: 'ArrowUp', deg: 0 },
      'right': { symbol: '▶', key: 'ArrowRight', deg: 90 },
      'down': { symbol: '▼', key: 'ArrowDown', deg: 180 },
      'left': { symbol: '◀', key: 'ArrowLeft', deg: 270 }
    };
    this.directions = ['up', 'right', 'down', 'left'];

    this.keyHandler = this.handleKeyDown.bind(this);
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:1.5rem; width:100%; max-width:440px;">
        <div style="text-align:center; font-size:0.95rem; color:var(--text-muted);">
          Merkezdeki parlayan <strong>LİDER OKUN</strong> baktığı yönü tuşlayın!
        </div>

        <div class="flock-board" id="flock-board">
          ${Array.from({ length: 25 }, (_, i) => `
            <div class="flock-item ${i === 12 ? 'leader' : ''}" data-idx="${i}">▲</div>
          `).join('')}
        </div>

        <div class="stream-buttons-grid">
          <button class="stream-btn" data-dir="left">◀</button>
          <button class="stream-btn" data-dir="up">▲</button>
          <button class="stream-btn" data-dir="down">▼</button>
          <button class="stream-btn" data-dir="right">▶</button>
        </div>

        <button class="btn-primary" id="flock-start-btn" style="width:100%; max-width:280px;">Sürü Algısını Başlat</button>
      </div>
    `;

    this.boardEl = this.container.querySelector('#flock-board');
    this.items = this.container.querySelectorAll('.flock-item');
    this.startBtn = this.container.querySelector('#flock-start-btn');

    this.startBtn.onclick = () => this.startGame();

    this.container.querySelectorAll('.stream-btn').forEach(btn => {
      btn.onclick = () => {
        if (!this.isPlaying) return;
        this.submitDirection(btn.dataset.dir);
      };
    });
  }

  startGame() {
    this.score = 0;
    this.streak = 0;
    this.round = 0;
    this.isPlaying = true;
    this.startBtn.style.display = 'none';

    window.addEventListener('keydown', this.keyHandler);
    this.updateStats();
    this.nextRound();
  }

  nextRound() {
    if (this.round >= 30) {
      this.gameOver();
      return;
    }
    this.round++;

    // Lider yönü
    this.leaderDirection = this.directions[Math.floor(Math.random() * this.directions.length)];

    // Sürü yönü (%70 ihtimalle yanıltıcı farklı bir yön)
    let flockDir = this.leaderDirection;
    if (Math.random() < 0.75) {
      const otherDirs = this.directions.filter(d => d !== this.leaderDirection);
      flockDir = otherDirs[Math.floor(Math.random() * otherDirs.length)];
    }

    // Merkez indeks (seviyeye göre merkez veya hafif komşu)
    const leaderIndex = 12;

    this.items.forEach((item, idx) => {
      if (idx === leaderIndex) {
        item.textContent = this.dirMap[this.leaderDirection].symbol;
        item.className = 'flock-item leader';
      } else {
        item.textContent = this.dirMap[flockDir].symbol;
        item.className = 'flock-item';
      }
    });

    if (this.hud.level) this.hud.level.textContent = `${this.round}/30`;
  }

  submitDirection(chosenDir) {
    if (!this.isPlaying) return;

    if (chosenDir === this.leaderDirection) {
      this.streak++;
      const bonus = Math.min(20, this.streak * 2);
      this.score += 20 + bonus;
      if (window.soundEngine) window.soundEngine.playTileTone(10, 0.12);
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - 10);
      if (window.soundEngine) window.soundEngine.playErrorTone();
    }

    this.updateStats();
    this.nextRound();
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
      this.submitDirection(map[e.key]);
    }
  }

  updateStats() {
    if (this.hud.score) this.hud.score.textContent = this.score;
  }

  gameOver() {
    this.isPlaying = false;
    window.removeEventListener('keydown', this.keyHandler);

    this.items[12].textContent = '★';
    this.startBtn.style.display = 'inline-flex';
    this.startBtn.textContent = 'Yeniden Oyna';

    if (window.soundEngine) window.soundEngine.playSuccessArpeggio();

    if (window.storageManager) {
      window.storageManager.recordGameResult('flock', this.score, 'attention', {
        rounds: this.round,
        streak: this.streak
      });
    }
  }

  destroy() {
    this.isPlaying = false;
    window.removeEventListener('keydown', this.keyHandler);
  }
}

window.FlockGame = FlockGame;
