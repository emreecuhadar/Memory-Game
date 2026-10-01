/**
 * OYUN 3: KROMATİK ÇATIŞMA (Hız & Bilişsel Ketleme / Stroop Testi)
 * Lumosity "Color Match" konseptinin refleks ve dikkat odaklı modern bir versiyonudur.
 * Beynin otomatik okuma dürtüsünü kontrol altına almasını (İnhibisyon) ölçer.
 */
class StroopGame {
  constructor(containerElement, hudElements) {
    this.container = containerElement;
    this.hud = hudElements;

    this.score = 0;
    this.combo = 0;
    this.timeLeft = 45; // 45 saniyelik refleks maratonu
    this.timerId = null;
    this.isPlaying = false;
    this.currentMatch = false;

    this.colorPalette = [
      { name: 'KIRMIZI', hex: '#f43f5e' },
      { name: 'YEŞİL', hex: '#10b981' },
      { name: 'MAVİ', hex: '#0284c7' },
      { name: 'SARI', hex: '#f59e0b' }
    ];

    this.keyHandler = this.handleKeyDown.bind(this);
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="stroop-stage">
        <div class="stroop-question" id="stroop-q">
          Kelimenin <strong>anlamı</strong> ile yazıldığı <strong>renk</strong> eşleşiyor mu?
        </div>

        <div class="stroop-word-display" id="stroop-word">
          HAZIR
        </div>

        <div class="stroop-action-row">
          <button class="stroop-choice-btn btn-danger" id="stroop-no-btn">
            HAYIR (Sol Ok / A)
          </button>
          <button class="stroop-choice-btn btn-primary" id="stroop-yes-btn">
            EVET (Sağ Ok / D)
          </button>
        </div>

        <button class="btn-primary" id="stroop-start-btn" style="width:100%; max-width:280px;">Maratonu Başlat</button>
      </div>
    `;

    this.wordEl = this.container.querySelector('#stroop-word');
    this.yesBtn = this.container.querySelector('#stroop-yes-btn');
    this.noBtn = this.container.querySelector('#stroop-no-btn');
    this.startBtn = this.container.querySelector('#stroop-start-btn');

    this.startBtn.onclick = () => this.startGame();
    this.yesBtn.onclick = () => this.handleAnswer(true);
    this.noBtn.onclick = () => this.handleAnswer(false);
  }

  startGame() {
    this.score = 0;
    this.combo = 0;
    this.timeLeft = 45;
    this.isPlaying = true;
    this.startBtn.style.display = 'none';

    window.addEventListener('keydown', this.keyHandler);
    this.updateStats();

    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.timeLeft--;
      if (this.hud.level) this.hud.level.textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        this.gameOver();
      }
    }, 1000);

    this.nextChallenge();
  }

  nextChallenge() {
    if (!this.isPlaying) return;

    // %50 ihtimalle eşleşen, %50 ihtimalle eşleşmeyen üret
    this.currentMatch = Math.random() > 0.5;

    const wordItem = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    let inkColor;

    if (this.currentMatch) {
      inkColor = wordItem.hex;
    } else {
      const otherColors = this.colorPalette.filter(c => c.hex !== wordItem.hex);
      inkColor = otherColors[Math.floor(Math.random() * otherColors.length)].hex;
    }

    this.wordEl.textContent = wordItem.name;
    this.wordEl.style.color = inkColor;
    this.wordEl.style.transform = 'scale(1.08)';
    setTimeout(() => {
      this.wordEl.style.transform = 'scale(1)';
    }, 100);
  }

  handleAnswer(userSaidYes) {
    if (!this.isPlaying) return;

    if (userSaidYes === this.currentMatch) {
      // Doğru
      this.combo++;
      const points = 20 + (this.combo * 4);
      this.score += points;
      if (window.soundEngine) window.soundEngine.playTileTone(7 + (this.combo % 5), 0.12);
    } else {
      // Hatalı
      this.combo = 0;
      this.score = Math.max(0, this.score - 15);
      if (window.soundEngine) window.soundEngine.playErrorTone();
    }

    this.updateStats();
    this.nextChallenge();
  }

  handleKeyDown(e) {
    if (!this.isPlaying) return;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
      e.preventDefault();
      this.handleAnswer(true);
    } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
      e.preventDefault();
      this.handleAnswer(false);
    }
  }

  updateStats() {
    if (this.hud.score) this.hud.score.textContent = this.score;
    if (this.hud.level) this.hud.level.textContent = `${this.timeLeft}s`;
  }

  gameOver() {
    this.isPlaying = false;
    if (this.timerId) clearInterval(this.timerId);
    window.removeEventListener('keydown', this.keyHandler);

    this.wordEl.textContent = `SKOR: ${this.score}`;
    this.wordEl.style.color = 'var(--accent-primary)';
    this.startBtn.style.display = 'inline-flex';
    this.startBtn.textContent = 'Yeniden Dene';

    if (window.soundEngine) window.soundEngine.playSuccessArpeggio();

    if (window.storageManager) {
      window.storageManager.recordGameResult('stroop', this.score, 'speed', {
        timeLeft: 0
      });
    }
  }

  destroy() {
    this.isPlaying = false;
    if (this.timerId) clearInterval(this.timerId);
    window.removeEventListener('keydown', this.keyHandler);
  }
}

window.StroopGame = StroopGame;
