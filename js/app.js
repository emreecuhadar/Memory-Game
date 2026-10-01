/**
 * NEUROFORGE ANA UYGULAMA YÖNETİCİSİ (APP CONTROLLER)
 * Tüm sekmeleri, tema motorunu, ses ayarlarını ve oyun modallarını yönetir.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Sayfa Görünüm Elemanları
  const navLinks = document.querySelectorAll('.nav-link');
  const viewSections = document.querySelectorAll('.view-section');

  // Tema ve Ses Kontrolleri
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeMenu = document.getElementById('theme-menu');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');

  // Oyun Modalı Elemanları
  const stageModal = document.getElementById('game-stage-modal');
  const stageCloseBtn = document.getElementById('stage-close-btn');
  const stageTitle = document.getElementById('stage-game-title');
  const stageLevel = document.getElementById('stage-level-val');
  const stageScore = document.getElementById('stage-score-val');
  const stageBody = document.getElementById('stage-body-content');

  let activeGameInstance = null;
  let pvpArenaInstance = null;
  let analyticsInstance = null;

  // 1. TEMA YÖNETİMİ
  const currentTheme = window.storageManager.data.theme || 'default';
  applyTheme(currentTheme);

  themeToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    themeMenu.classList.remove('show');
  });

  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedTheme = btn.dataset.theme;
      applyTheme(selectedTheme);
      themeMenu.classList.remove('show');
      window.storageManager.data.theme = selectedTheme;
      window.storageManager.saveData();
    });
  });

  function applyTheme(themeName) {
    if (themeName === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }
  }

  // 2. SES MOTORU YÖNETİMİ
  soundToggleBtn.addEventListener('click', () => {
    const isEnabled = window.soundEngine.toggleSound();
    soundIcon.textContent = isEnabled ? '🔊' : '🔇';
    soundToggleBtn.title = isEnabled ? 'Sesi Kapat' : 'Sesi Aç';
    window.storageManager.data.soundEnabled = isEnabled;
    window.storageManager.saveData();
  });

  // 3. SEKME DEĞİŞTİRME MANTIĞI
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetView = link.dataset.view;
      switchView(targetView);
    });
  });

  function switchView(viewId) {
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.view === viewId));
    viewSections.forEach(v => v.classList.toggle('active', v.id === `view-${viewId}`));

    // PvP sekmesine geçilince arenayı başlat
    if (viewId === 'pvp') {
      if (!pvpArenaInstance) {
        const pvpContainer = document.getElementById('pvp-mount-point');
        pvpArenaInstance = new window.PvPArena(pvpContainer);
      }
    }

    // Analitik sekmesine geçilince radar grafiğini render et
    if (viewId === 'analytics') {
      const analyticsContainer = document.getElementById('analytics-mount-point');
      if (!analyticsInstance) {
        analyticsInstance = new window.AnalyticsModule(analyticsContainer);
      }
      analyticsInstance.render();
    }
  }

  // 4. OYUN BAŞLATMA MODAL SİSTEMİ
  document.querySelectorAll('[data-play-game]').forEach(card => {
    card.addEventListener('click', () => {
      const gameId = card.dataset.playGame;
      openGameModal(gameId);
    });
  });

  // Hızlı antrenman butonu (Kullanıcının Zihin Matrisi oyununu başlatır)
  const quickStartBtn = document.getElementById('quick-start-btn');
  if (quickStartBtn) {
    quickStartBtn.addEventListener('click', () => {
      openGameModal('matrix');
    });
  }

  function openGameModal(gameId) {
    // Önceki açık oyun varsa temizle
    if (activeGameInstance && activeGameInstance.destroy) {
      activeGameInstance.destroy();
    }

    stageLevel.textContent = '1';
    stageScore.textContent = '0';
    stageBody.innerHTML = '';

    const hud = {
      level: stageLevel,
      score: stageScore
    };

    if (gameId === 'matrix') {
      stageTitle.textContent = '🧠 Zihin Matrisi (Hafıza Egzersizi)';
      activeGameInstance = new window.MatrixGame(stageBody, hud);
    } else if (gameId === 'stream') {
      stageTitle.textContent = '🔄 Akıntı & Rota (Bilişsel Esneklik)';
      activeGameInstance = new window.StreamGame(stageBody, hud);
    } else if (gameId === 'stroop') {
      stageTitle.textContent = '⚡ Kromatik Çatışma (Hız & Ketleme)';
      activeGameInstance = new window.StroopGame(stageBody, hud);
    } else if (gameId === 'flock') {
      stageTitle.textContent = '🎯 Sürü Algısı (Seçici Dikkat)';
      activeGameInstance = new window.FlockGame(stageBody, hud);
    }

    stageModal.classList.add('active');
  }

  // Modal Kapatma
  stageCloseBtn.addEventListener('click', () => {
    closeGameModal();
  });

  stageModal.addEventListener('click', (e) => {
    if (e.target === stageModal) {
      closeGameModal();
    }
  });

  function closeGameModal() {
    if (activeGameInstance && activeGameInstance.destroy) {
      activeGameInstance.destroy();
      activeGameInstance = null;
    }
    stageModal.classList.remove('active');
    updateDashboardStats();
  }

  // Dashboard İstatistiklerini Tazele
  function updateDashboardStats() {
    const data = window.storageManager.data;
    const streakEl = document.getElementById('dash-streak-count');
    const csiEl = document.getElementById('dash-csi-count');
    const pvpWinsEl = document.getElementById('dash-pvp-wins');

    if (streakEl) streakEl.textContent = `${data.streak} Gün`;
    if (pvpWinsEl) pvpWinsEl.textContent = `${data.highScores.pvpWins || 0} Zafer`;

    if (csiEl && data.cognitiveMetrics) {
      const avg = Math.round(
        (data.cognitiveMetrics.memory +
         data.cognitiveMetrics.attention +
         data.cognitiveMetrics.speed +
         data.cognitiveMetrics.flexibility +
         data.cognitiveMetrics.problemSolving) / 5
      );
      csiEl.textContent = `${avg * 10} CSI`;
    }

    // Kartlardaki en yüksek skorları güncelle
    const matrixBest = document.getElementById('best-matrix');
    const streamBest = document.getElementById('best-stream');
    const stroopBest = document.getElementById('best-stroop');
    const flockBest = document.getElementById('best-flock');

    if (matrixBest) matrixBest.textContent = data.highScores.matrix || 0;
    if (streamBest) streamBest.textContent = data.highScores.stream || 0;
    if (stroopBest) stroopBest.textContent = data.highScores.stroop || 0;
    if (flockBest) flockBest.textContent = data.highScores.flock || 0;
  }

  updateDashboardStats();
});
