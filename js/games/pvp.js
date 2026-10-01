/**
 * 1v1 ZİHİN DÜELLOSU (LUMOSITY'DE HİÇ OLMAYAN BÜYÜK YENİLİK)
 * Gerçek Zamanlı Bölünmüş Ekran PvP ve Yapay Zeka Ghost Karşılaşması.
 * Kombolar rakipler arasında "Bilişsel Saldırılar" (Bulanıklık, Ters Kontrol, Glitch Titremesi) tetikler.
 */
class PvPArena {
  constructor(containerElement) {
    this.container = containerElement;

    this.mode = 'ai'; // 'ai' veya 'local2p'
    this.isPlaying = false;
    this.timeLeft = 60;
    this.timerId = null;

    // Oyuncu Durumları
    this.p1 = {
      score: 0,
      combo: 0,
      target: null,
      element: null,
      disrupted: false,
      inverted: false
    };

    this.p2 = {
      score: 0,
      combo: 0,
      target: null,
      element: null,
      disrupted: false,
      inverted: false
    };

    this.aiInterval = null;
    this.directions = ['up', 'right', 'down', 'left'];
    this.symbols = { 'up': '▲', 'right': '▶', 'down': '▼', 'left': '◀' };

    this.render();
  }

  setMode(mode) {
    if (this.isPlaying) return;
    this.mode = mode;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="pvp-arena-container">
        <div class="pvp-top-hud">
          <div style="display:flex; gap:0.6rem;">
            <button class="stat-chip ${this.mode === 'ai' ? 'active' : ''}" id="pvp-mode-ai" style="cursor:pointer; border:1px solid var(--border-color);">
              🤖 Yapay Zeka Düellosu
            </button>
            <button class="stat-chip ${this.mode === 'local2p' ? 'active' : ''}" id="pvp-mode-2p" style="cursor:pointer; border:1px solid var(--border-color);">
              👥 Aynı Klavyede 1v1 (2 Oyuncu)
            </button>
          </div>

          <div class="pvp-timer-box" id="pvp-timer">60s</div>

          <button class="btn-primary btn-danger" id="pvp-start-action">
            ⚡ Düelloyu Başlat
          </button>
        </div>

        <div class="pvp-split-screen">
          <!-- OYUNCU 1 (SOL) -->
          <div class="pvp-player-pane p1" id="p1-pane">
            <div class="pvp-player-header">
              <div class="pvp-player-name">
                <span style="color:var(--accent-primary);">●</span> OYUNCU 1 (W, A, S, D)
              </div>
              <div class="pvp-score-box" id="p1-score" style="color:var(--accent-primary);">0</div>
            </div>

            <div class="pvp-meter-bar">
              <div class="pvp-meter-fill" id="p1-meter"></div>
            </div>

            <div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:1rem;" id="p1-status">
              Hazır...
            </div>

            <div class="stream-visual-stage" id="p1-stage" style="width:160px; height:160px; font-size:4rem; margin-bottom:1.5rem;">
              ?
            </div>

            <div class="stream-buttons-grid" style="max-width:260px;">
              <button class="stream-btn p1-btn" data-dir="left">A (◀)</button>
              <button class="stream-btn p1-btn" data-dir="up">W (▲)</button>
              <button class="stream-btn p1-btn" data-dir="down">S (▼)</button>
              <button class="stream-btn p1-btn" data-dir="right">D (▶)</button>
            </div>
          </div>

          <!-- OYUNCU 2 / YAPAY ZEKA (SAĞ) -->
          <div class="pvp-player-pane p2" id="p2-pane">
            <div class="pvp-player-header">
              <div class="pvp-player-name">
                <span style="color:var(--accent-secondary);">●</span>
                <span id="p2-name-label">${this.mode === 'ai' ? 'NÖRO-BOT v2.4 (YZ)' : 'OYUNCU 2 (YÖN TUŞLARI)'}</span>
              </div>
              <div class="pvp-score-box" id="p2-score" style="color:var(--accent-secondary);">0</div>
            </div>

            <div class="pvp-meter-bar">
              <div class="pvp-meter-fill" id="p2-meter" style="background:var(--accent-secondary);"></div>
            </div>

            <div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:1rem;" id="p2-status">
              Hazır...
            </div>

            <div class="stream-visual-stage" id="p2-stage" style="width:160px; height:160px; font-size:4rem; margin-bottom:1.5rem;">
              ?
            </div>

            <div class="stream-buttons-grid" style="max-width:260px;">
              <button class="stream-btn p2-btn" data-dir="left">← (◀)</button>
              <button class="stream-btn p2-btn" data-dir="up">↑ (▲)</button>
              <button class="stream-btn p2-btn" data-dir="down">↓ (▼)</button>
              <button class="stream-btn p2-btn" data-dir="right">→ (▶)</button>
            </div>
          </div>
        </div>

        <div style="text-align:center; padding:0.75rem; background:rgba(0,0,0,0.2); border-radius:var(--radius-md); font-size:0.85rem; color:var(--text-muted);">
          🔥 <strong>Bozucu Dalga Kuralı:</strong> 3x Kombo yapan oyuncu, rakibinin ekranını 2.5 saniyeliğine bulandırır ve tuşlarını tersine çevirir!
        </div>
      </div>
    `;

    // Eleman bağlama
    this.p1.pane = this.container.querySelector('#p1-pane');
    this.p1.scoreEl = this.container.querySelector('#p1-score');
    this.p1.meterEl = this.container.querySelector('#p1-meter');
    this.p1.stageEl = this.container.querySelector('#p1-stage');
    this.p1.statusEl = this.container.querySelector('#p1-status');

    this.p2.pane = this.container.querySelector('#p2-pane');
    this.p2.scoreEl = this.container.querySelector('#p2-score');
    this.p2.meterEl = this.container.querySelector('#p2-meter');
    this.p2.stageEl = this.container.querySelector('#p2-stage');
    this.p2.statusEl = this.container.querySelector('#p2-status');

    this.timerEl = this.container.querySelector('#pvp-timer');
    this.startActionBtn = this.container.querySelector('#pvp-start-action');

    // Mod seçiciler
    this.container.querySelector('#pvp-mode-ai').onclick = () => this.setMode('ai');
    this.container.querySelector('#pvp-mode-2p').onclick = () => this.setMode('local2p');

    this.startActionBtn.onclick = () => {
      if (!this.isPlaying) {
        this.startDuel();
      } else {
        this.endDuel(true);
      }
    };

    // Tıklama butonları
    this.container.querySelectorAll('.p1-btn').forEach(btn => {
      btn.onclick = () => this.handlePlayerInput(1, btn.dataset.dir);
    });
    this.container.querySelectorAll('.p2-btn').forEach(btn => {
      btn.onclick = () => this.handlePlayerInput(2, btn.dataset.dir);
    });

    // Klavye dinleyici
    if (this.boundKeyHandler) {
      window.removeEventListener('keydown', this.boundKeyHandler);
    }
    this.boundKeyHandler = this.onKeyDown.bind(this);
    window.addEventListener('keydown', this.boundKeyHandler);
  }

  onKeyDown(e) {
    if (!this.isPlaying) return;

    // Oyuncu 1: W, A, S, D
    const p1Keys = { 'w': 'up', 'd': 'right', 's': 'down', 'a': 'left' };
    const p1Key = e.key.toLowerCase();
    if (p1Keys[p1Key]) {
      e.preventDefault();
      this.handlePlayerInput(1, p1Keys[p1Key]);
    }

    // Oyuncu 2: Yön Tuşları (Eğer 2 Oyuncu Modundaysa)
    if (this.mode === 'local2p') {
      const p2Keys = { 'ArrowUp': 'up', 'ArrowRight': 'right', 'ArrowDown': 'down', 'ArrowLeft': 'left' };
      if (p2Keys[e.key]) {
        e.preventDefault();
        this.handlePlayerInput(2, p2Keys[e.key]);
      }
    }
  }

  startDuel() {
    this.isPlaying = true;
    this.timeLeft = 60;
    this.p1.score = 0;
    this.p1.combo = 0;
    this.p1.disrupted = false;
    this.p1.inverted = false;

    this.p2.score = 0;
    this.p2.combo = 0;
    this.p2.disrupted = false;
    this.p2.inverted = false;

    this.startActionBtn.textContent = '⏹ Düelloyu Durdur';
    this.startActionBtn.classList.remove('btn-danger');
    this.startActionBtn.classList.add('btn-secondary');

    this.updateHUD();
    this.nextTarget(1);
    this.nextTarget(2);

    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.timeLeft--;
      this.timerEl.textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        this.endDuel();
      }
    }, 1000);

    // AI Döngüsü (Eğer AI modundaysa)
    if (this.mode === 'ai') {
      this.startAILoop();
    }
  }

  nextTarget(playerNum) {
    const player = playerNum === 1 ? this.p1 : this.p2;
    const randomDir = this.directions[Math.floor(Math.random() * this.directions.length)];
    player.target = randomDir;

    player.stageEl.textContent = this.symbols[randomDir];
    player.stageEl.style.transform = 'scale(1.15)';
    setTimeout(() => {
      player.stageEl.style.transform = 'scale(1)';
    }, 100);
  }

  handlePlayerInput(playerNum, dir) {
    if (!this.isPlaying) return;

    const player = playerNum === 1 ? this.p1 : this.p2;
    const opponent = playerNum === 1 ? this.p2 : this.p1;

    // Eğer ters kontrol (inverted) cezası altındaysa yönü ters çevir!
    let actualDir = dir;
    if (player.inverted) {
      const opposites = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
      actualDir = opposites[dir] || dir;
    }

    if (actualDir === player.target) {
      // Doğru vuruş!
      player.score += 20;
      player.combo++;
      if (window.soundEngine) window.soundEngine.playTileTone(playerNum === 1 ? 5 : 9, 0.1);

      // Kombo 3 olunca rakibe sabotaj fırlat!
      if (player.combo >= 3 && player.combo % 3 === 0) {
        this.triggerAttack(playerNum, opponent);
      }

      this.nextTarget(playerNum);
    } else {
      // Hatalı
      player.combo = 0;
      player.score = Math.max(0, player.score - 10);
      if (window.soundEngine) window.soundEngine.playErrorTone();
      player.statusEl.textContent = '❌ Istırap / Hata!';
      setTimeout(() => {
        if (!player.disrupted) player.statusEl.textContent = 'Odaklanıyor...';
      }, 600);
    }

    this.updateHUD();
  }

  triggerAttack(attackerNum, victim) {
    if (window.soundEngine) window.soundEngine.playAttackSound();

    victim.disrupted = true;
    victim.inverted = true;
    victim.pane.classList.add('under-attack');
    victim.statusEl.textContent = '⚠️ GLITCH VE TERS KONTROL ETKİSİNDE!';

    setTimeout(() => {
      victim.disrupted = false;
      victim.inverted = false;
      victim.pane.classList.remove('under-attack');
      victim.statusEl.textContent = 'Normale döndü.';
    }, 2600);
  }

  startAILoop() {
    if (this.aiInterval) clearInterval(this.aiInterval);

    // Bot tepki süresi: 400ms - 900ms arası insansı değişkenlik
    const aiStep = () => {
      if (!this.isPlaying) return;

      const delay = this.p2.disrupted ? 1400 : Math.floor(Math.random() * 450) + 400;

      this.aiTimeout = setTimeout(() => {
        if (!this.isPlaying) return;

        // %90 doğru yanıt verir, bozulmuşsa %40 hata yapar
        const accuracy = this.p2.disrupted ? 0.6 : 0.92;
        let chosenDir = this.p2.target;

        if (Math.random() > accuracy) {
          const others = this.directions.filter(d => d !== this.p2.target);
          chosenDir = others[Math.floor(Math.random() * others.length)];
        }

        this.handlePlayerInput(2, chosenDir);
        aiStep();
      }, delay);
    };

    aiStep();
  }

  updateHUD() {
    this.p1.scoreEl.textContent = this.p1.score;
    this.p2.scoreEl.textContent = this.p2.score;

    const total = this.p1.score + this.p2.score || 1;
    const p1Pct = Math.min(100, Math.max(0, Math.round((this.p1.score / total) * 100)));
    const p2Pct = 100 - p1Pct;

    this.p1.meterEl.style.width = `${p1Pct}%`;
    this.p2.meterEl.style.width = `${p2Pct}%`;

    if (this.p1.combo > 1) this.p1.statusEl.textContent = `🔥 Kombo x${this.p1.combo}`;
    if (this.p2.combo > 1) this.p2.statusEl.textContent = `🔥 Kombo x${this.p2.combo}`;
  }

  endDuel(forced = false) {
    this.isPlaying = false;
    if (this.timerId) clearInterval(this.timerId);
    if (this.aiTimeout) clearTimeout(this.aiTimeout);

    this.startActionBtn.textContent = '⚡ Yeniden Başlat';
    this.startActionBtn.classList.remove('btn-secondary');
    this.startActionBtn.classList.add('btn-danger');

    let winnerMsg = '';
    const p1Wins = this.p1.score > this.p2.score;

    if (p1Wins) {
      winnerMsg = '🎉 1. OYUNCU KAZANDI!';
      if (window.soundEngine) window.soundEngine.playSuccessArpeggio();
    } else if (this.p2.score > this.p1.score) {
      winnerMsg = this.mode === 'ai' ? '🤖 NÖRO-BOT KAZANDI!' : '🎉 2. OYUNCU KAZANDI!';
      if (window.soundEngine) window.soundEngine.playErrorTone();
    } else {
      winnerMsg = '🤝 BERABERE!';
    }

    this.timerEl.textContent = 'BİTTİ';
    this.p1.statusEl.textContent = winnerMsg;
    this.p2.statusEl.textContent = winnerMsg;

    if (!forced && window.storageManager) {
      window.storageManager.recordPvP(p1Wins);
    }
  }

  destroy() {
    this.isPlaying = false;
    if (this.timerId) clearInterval(this.timerId);
    if (this.aiTimeout) clearTimeout(this.aiTimeout);
    if (this.boundKeyHandler) {
      window.removeEventListener('keydown', this.boundKeyHandler);
    }
  }
}

window.PvPArena = PvPArena;
