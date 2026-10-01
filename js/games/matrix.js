/**
 * OYUN 1: ZİHİN MATRİSİ (Hafıza Egzersizi)
 * Kullanıcının ilettiği orijinal oyun mantığı korunarak, modern ses efektleri,
 * 3x3 ve 4x4 zorluk seçeneği, combo katsayısı ve bilişsel skor entegrasyonu eklenmiştir.
 */
class MatrixGame {
  constructor(containerElement, hudElements) {
    this.container = containerElement;
    this.hud = hudElements; // { level, score, message, actionBtn }

    this.sequence = [];
    this.playerSequence = [];
    this.level = 1;
    this.score = 0;
    this.combo = 0;
    this.gridSize = 3; // 3x3 (varsayılan) veya 4x4
    this.isPlaying = false;
    this.isPlayerTurn = false;
    this.intervalId = null;

    this.render();
  }

  setGridSize(size) {
    if (this.isPlaying) return;
    this.gridSize = size;
    this.render();
  }

  render() {
    const totalTiles = this.gridSize * this.gridSize;
    const gridClass = this.gridSize === 4 ? 'matrix-grid grid-4x4' : 'matrix-grid';

    this.container.innerHTML = `
      <div class="matrix-container">
        <div style="display:flex; justify-content:center; gap:0.5rem; margin-bottom:1rem;">
          <button class="stat-chip ${this.gridSize === 3 ? 'active' : ''}" id="matrix-size-3" style="cursor:pointer; border:1px solid var(--border-color);">3x3 Klasik</button>
          <button class="stat-chip ${this.gridSize === 4 ? 'active' : ''}" id="matrix-size-4" style="cursor:pointer; border:1px solid var(--border-color);">4x4 Gelişmiş</button>
        </div>
        <div class="matrix-feedback-msg" id="matrix-msg">Başlamak için butona tıklayın</div>
        <div class="${gridClass}" id="matrix-tiles-board">
          ${Array.from({ length: totalTiles }, (_, i) => `<div class="matrix-tile" data-id="${i}"></div>`).join('')}
        </div>
        <button class="btn-primary" id="matrix-main-btn" style="width:100%; max-width:320px;">Oyunu Başlat</button>
      </div>
    `;

    this.tiles = this.container.querySelectorAll('.matrix-tile');
    this.mainBtn = this.container.querySelector('#matrix-main-btn');
    this.msgDisplay = this.container.querySelector('#matrix-msg');

    this.container.querySelector('#matrix-size-3').onclick = () => this.setGridSize(3);
    this.container.querySelector('#matrix-size-4').onclick = () => this.setGridSize(4);

    this.mainBtn.addEventListener('click', () => {
      if (!this.isPlaying) {
        this.startGame();
      }
    });

    this.tiles.forEach(tile => {
      tile.addEventListener('click', (e) => {
        if (!this.isPlayerTurn) return;
        const tileId = parseInt(e.target.dataset.id, 10);
        this.handleTileClick(tileId, e.target);
      });
    });
  }

  startGame() {
    this.sequence = [];
    this.playerSequence = [];
    this.level = 1;
    this.score = 0;
    this.combo = 0;
    this.isPlaying = true;
    this.updateStats();

    this.mainBtn.style.display = 'none';
    this.msgDisplay.textContent = "Sırayı dikkatle izle...";
    this.nextRound();
  }

  nextRound() {
    this.playerSequence = [];
    this.isPlayerTurn = false;
    this.msgDisplay.textContent = `Seviye ${this.level}: Sırayı dikkatle izle...`;

    // Yeni rastgele kare ekle (Kullanıcının ilettiği mantık)
    const totalTiles = this.gridSize * this.gridSize;
    const randomTile = Math.floor(Math.random() * totalTiles);
    this.sequence.push(randomTile);

    // Diziyi oyuncuya göster
    setTimeout(() => {
      this.playSequence();
    }, 400);
  }

  playSequence() {
    let i = 0;
    const speed = Math.max(300, 600 - (this.level * 25)); // Seviye arttıkça hızlanan akış

    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      const tileIndex = this.sequence[i];
      const targetTile = this.tiles[tileIndex];
      if (targetTile) {
        this.flashTile(targetTile, tileIndex);
      }
      i++;
      if (i >= this.sequence.length) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        setTimeout(() => {
          this.isPlayerTurn = true;
          this.msgDisplay.textContent = "Şimdi sıra sende!";
          if (window.soundEngine) window.soundEngine.playTick();
        }, 500);
      }
    }, speed);
  }

  flashTile(tile, index = 0) {
    if (!tile) return;
    tile.classList.add('active');
    if (window.soundEngine) {
      window.soundEngine.playTileTone(index, 0.22);
    }
    setTimeout(() => {
      tile.classList.remove('active');
    }, 280);
  }

  handleTileClick(id, element) {
    this.playerSequence.push(id);
    this.flashTile(element, id);

    const currentStep = this.playerSequence.length - 1;

    // Kullanıcının mantığı: Sıradaki adım kontrolü
    if (this.playerSequence[currentStep] !== this.sequence[currentStep]) {
      // Hatalı hamle
      element.classList.add('error');
      if (window.soundEngine) window.soundEngine.playErrorTone();
      setTimeout(() => element.classList.remove('error'), 400);
      this.gameOver();
      return;
    }

    // Doğru adım
    if (this.playerSequence.length === this.sequence.length) {
      // Tur tamamlandı!
      this.combo++;
      const bonus = this.combo > 2 ? this.combo * 5 : 0;
      this.score += (this.level * 10) + bonus;
      this.level++;
      this.updateStats();
      this.isPlayerTurn = false;

      if (window.soundEngine) window.soundEngine.playSuccessArpeggio();
      this.msgDisplay.textContent = `Harika! Kombo x${this.combo}`;

      // Hafif başarı animasyonu
      this.tiles.forEach(t => t.classList.add('success-round'));
      setTimeout(() => {
        this.tiles.forEach(t => t.classList.remove('success-round'));
        this.nextRound();
      }, 900);
    }
  }

  updateStats() {
    if (this.hud.level) this.hud.level.textContent = this.level;
    if (this.hud.score) this.hud.score.textContent = this.score;
  }

  gameOver() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPlaying = false;
    this.isPlayerTurn = false;
    this.msgDisplay.textContent = "Oyun Bitti! Toplam Skor: " + this.score;
    this.mainBtn.style.display = 'inline-flex';
    this.mainBtn.textContent = "Yeniden Başla";

    // Skoru ve hafıza metriğini kaydet
    if (window.storageManager) {
      window.storageManager.recordGameResult('matrix', this.score, 'memory', {
        levelReached: this.level,
        gridSize: this.gridSize
      });
    }
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isPlaying = false;
  }
}

window.MatrixGame = MatrixGame;
