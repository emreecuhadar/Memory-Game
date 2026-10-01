/**
 * NEUROFORGE VERİ VE İSTATİSTİK YÖNETİMİ
 * Lumosity geri bildirimlerindeki eksiklikleri (Streak Dondurma, Serbest İstatistikler, Detaylı Bilişsel Skor) çözer.
 */
class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'neuroforge_user_data_v1';
    this.data = this.loadData();
  }

  getDefaultData() {
    return {
      theme: 'default',
      soundEnabled: true,
      streak: 1,
      lastPlayDate: new Date().toISOString().split('T')[0],
      streakFreezes: 2, // Geri bildirimlerde en çok istenen streak freeze desteği
      highScores: {
        matrix: 0,
        stream: 0,
        stroop: 0,
        flock: 0,
        pvpWins: 0
      },
      cognitiveMetrics: {
        memory: 65,      // Hafıza (Zihin Matrisi)
        flexibility: 60, // Bilişsel Esneklik (Akıntı & Rota)
        speed: 70,       // Hız & Ketleme (Kromatik Çatışma)
        attention: 62,   // Odaklanma & Görsel Seçicilik (Sürü Algısı)
        problemSolving: 58
      },
      gameLogs: [],
      pvpStats: {
        matches: 0,
        wins: 0,
        losses: 0
      }
    };
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return Object.assign(this.getDefaultData(), JSON.parse(stored));
      }
    } catch (e) {
      console.warn('LocalStorage okunamadı:', e);
    }
    return this.getDefaultData();
  }

  saveData() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage yazılamadı:', e);
    }
  }

  recordGameResult(gameId, score, metricCategory = null, additionalStats = {}) {
    // Yüksek skor güncelle
    if (!this.data.highScores[gameId] || score > this.data.highScores[gameId]) {
      this.data.highScores[gameId] = score;
    }

    // Bilişsel Metrikleri dinamik güncelle (Neuro-Adaptive)
    if (metricCategory && this.data.cognitiveMetrics[metricCategory] !== undefined) {
      const current = this.data.cognitiveMetrics[metricCategory];
      const delta = Math.min(10, Math.max(-5, Math.round((score - current * 5) / 10)));
      this.data.cognitiveMetrics[metricCategory] = Math.min(100, Math.max(20, current + (delta > 0 ? 3 : -1)));
    }

    // Tarih ve streak kontrolü
    this.updateStreak();

    // Log kaydet
    this.data.gameLogs.push({
      gameId,
      score,
      timestamp: new Date().toISOString(),
      ...additionalStats
    });

    if (this.data.gameLogs.length > 50) {
      this.data.gameLogs.shift();
    }

    this.saveData();
  }

  updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    if (this.data.lastPlayDate !== today) {
      const lastDate = new Date(this.data.lastPlayDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.data.streak += 1;
      } else if (diffDays > 1) {
        if (this.data.streakFreezes > 0) {
          this.data.streakFreezes -= 1;
          // Streak donduruldu, seri bozulmadı!
        } else {
          this.data.streak = 1;
        }
      }
      this.data.lastPlayDate = today;
    }
  }

  recordPvP(isWin) {
    this.data.pvpStats.matches += 1;
    if (isWin) {
      this.data.pvpStats.wins += 1;
      this.data.highScores.pvpWins = (this.data.highScores.pvpWins || 0) + 1;
    } else {
      this.data.pvpStats.losses += 1;
    }
    this.saveData();
  }
}

window.storageManager = new StorageManager();
