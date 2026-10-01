/**
 * NEUROFORGE ANALİTİK & BİLİŞSEL RADAR GRAFİĞİ
 * Kullanıcının 5 ana bilişsel alanını interaktif SVG radar grafiği ve metrik kartlarıyla görselleştirir.
 */
class AnalyticsModule {
  constructor(containerElement) {
    this.container = containerElement;
  }

  render() {
    const data = window.storageManager ? window.storageManager.data : {};
    const metrics = data.cognitiveMetrics || {
      memory: 70,
      attention: 65,
      speed: 75,
      flexibility: 68,
      problemSolving: 60
    };

    // Toplam Bilişsel İndeks (CSI - Cognitive Score Index)
    const avgScore = Math.round(
      (metrics.memory + metrics.attention + metrics.speed + metrics.flexibility + metrics.problemSolving) / 5
    );
    const csi = avgScore * 10;

    const streak = data.streak || 1;
    const streakFreezes = data.streakFreezes !== undefined ? data.streakFreezes : 2;
    const pvpStats = data.pvpStats || { wins: 0, matches: 0 };
    const pvpWinRate = pvpStats.matches > 0 ? Math.round((pvpStats.wins / pvpStats.matches) * 100) : 0;

    this.container.innerHTML = `
      <div class="analytics-grid">
        <!-- BİLİŞSEL RADAR GRAFİĞİ -->
        <div class="chart-card">
          <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:0.25rem;">Nöro-Bilişsel Denge Haritası</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">5 Temel Zihinsel Boyuttaki Performansınız</p>
          
          <div class="radar-chart-container" id="radar-container">
            ${this.generateRadarSVG(metrics)}
          </div>

          <div style="display:flex; justify-content:space-around; width:100%; margin-top:1.5rem; text-align:center;">
            <div>
              <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Genel Bilişsel İndeks</div>
              <div style="font-size:1.6rem; font-weight:800; color:var(--accent-primary); font-family:var(--font-mono);">${csi} CSI</div>
            </div>
            <div>
              <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Gelişim Düzeyi</div>
              <div style="font-size:1.6rem; font-weight:800; color:var(--accent-secondary); font-family:var(--font-mono);">${avgScore > 75 ? 'Usta' : 'Aktif'}</div>
            </div>
          </div>
        </div>

        <!-- PERFORMANS METRİKLERİ VE STREAK KARTLARI -->
        <div class="chart-card" style="align-items:stretch;">
          <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:0.25rem;">Zihinsel Yetenek Dökümü</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Antrenmanlarla güncellenen anlık veriler</p>

          <div class="metrics-list">
            <div class="metric-row">
              <div class="metric-info">
                <span style="font-size:1.2rem;">🧠</span>
                <div>
                  <div style="font-weight:700; font-size:0.9rem;">Hafıza & Sıralama (Zihin Matrisi)</div>
                  <div style="font-size:0.75rem; color:var(--text-dim);">Kısa süreli çalışma belleği</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div class="metric-bar-container">
                  <div class="metric-bar-fill" style="width:${metrics.memory}%;"></div>
                </div>
                <span style="font-family:var(--font-mono); font-weight:700; font-size:0.88rem;">${metrics.memory}%</span>
              </div>
            </div>

            <div class="metric-row">
              <div class="metric-info">
                <span style="font-size:1.2rem;">🔄</span>
                <div>
                  <div style="font-weight:700; font-size:0.9rem;">Bilişsel Esneklik (Akıntı & Rota)</div>
                  <div style="font-size:0.75rem; color:var(--text-dim);">Kural değişimi adaptasyonu</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div class="metric-bar-container">
                  <div class="metric-bar-fill" style="width:${metrics.flexibility}%; background:var(--accent-secondary);"></div>
                </div>
                <span style="font-family:var(--font-mono); font-weight:700; font-size:0.88rem;">${metrics.flexibility}%</span>
              </div>
            </div>

            <div class="metric-row">
              <div class="metric-info">
                <span style="font-size:1.2rem;">⚡</span>
                <div>
                  <div style="font-weight:700; font-size:0.9rem;">Refleks & Ketleme (Kromatik Çatışma)</div>
                  <div style="font-size:0.75rem; color:var(--text-dim);">Stroop reaksiyon hızı</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div class="metric-bar-container">
                  <div class="metric-bar-fill" style="width:${metrics.speed}%; background:var(--accent-warm);"></div>
                </div>
                <span style="font-family:var(--font-mono); font-weight:700; font-size:0.88rem;">${metrics.speed}%</span>
              </div>
            </div>

            <div class="metric-row">
              <div class="metric-info">
                <span style="font-size:1.2rem;">🎯</span>
                <div>
                  <div style="font-weight:700; font-size:0.9rem;">Seçici Dikkat (Sürü Algısı)</div>
                  <div style="font-size:0.75rem; color:var(--text-dim);">Çeldiricileri filtreleme gücü</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div class="metric-bar-container">
                  <div class="metric-bar-fill" style="width:${metrics.attention}%; background:#a855f7;"></div>
                </div>
                <span style="font-family:var(--font-mono); font-weight:700; font-size:0.88rem;">${metrics.attention}%</span>
              </div>
            </div>
          </div>

          <!-- STREAK & PVP ÖZETİ -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1.5rem;">
            <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-subtle); padding:1rem; border-radius:var(--radius-md);">
              <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">🔥 Antrenman Serisi</div>
              <div style="font-size:1.4rem; font-weight:800; color:var(--accent-warm);">${streak} Gün</div>
              <div style="font-size:0.72rem; color:var(--accent-primary); margin-top:0.25rem;">❄️ ${streakFreezes} Seri Dondurma Koruması</div>
            </div>

            <div style="background:rgba(0,0,0,0.25); border:1px solid var(--border-subtle); padding:1rem; border-radius:var(--radius-md);">
              <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">⚔️ 1v1 PvP Arenası</div>
              <div style="font-size:1.4rem; font-weight:800; color:var(--accent-danger);">${pvpStats.wins} G / ${pvpStats.matches} M</div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.25rem;">Kazanma Oranı: %${pvpWinRate}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  generateRadarSVG(metrics) {
    const size = 300;
    const center = size / 2;
    const radius = 100;
    const axes = [
      { key: 'memory', label: 'Hafıza' },
      { key: 'flexibility', label: 'Esneklik' },
      { key: 'speed', label: 'Hız' },
      { key: 'attention', label: 'Dikkat' },
      { key: 'problemSolving', label: 'Mantık' }
    ];

    const angleStep = (Math.PI * 2) / axes.length;

    // Arka plan çokgen ızgaraları (20%, 40%, 60%, 80%, 100%)
    let gridPolygons = '';
    [0.2, 0.4, 0.6, 0.8, 1.0].forEach(level => {
      const points = axes.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * level * Math.cos(angle);
        const y = center + radius * level * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
      gridPolygons += `<polygon points="${points}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.2" />`;
    });

    // Eksen çizgileri ve etiketler
    let axisLines = '';
    let labels = '';
    axes.forEach((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      axisLines += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.12)" stroke-dasharray="3,3" />`;

      const labelRadius = radius + 22;
      const lx = center + labelRadius * Math.cos(angle);
      const ly = center + labelRadius * Math.sin(angle);
      labels += `<text x="${lx}" y="${ly + 4}" text-anchor="middle" fill="var(--text-muted)" font-size="11" font-weight="700">${axis.label}</text>`;
    });

    // Oyuncu Değerleri Çokgeni
    const playerPoints = axes.map((axis, i) => {
      const val = Math.min(100, Math.max(10, metrics[axis.key] || 50)) / 100;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * val * Math.cos(angle);
      const y = center + radius * val * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${gridPolygons}
        ${axisLines}
        <polygon points="${playerPoints}" fill="var(--accent-primary-glow)" stroke="var(--accent-primary)" stroke-width="2.5" />
        ${axes.map((axis, i) => {
          const val = Math.min(100, Math.max(10, metrics[axis.key] || 50)) / 100;
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * val * Math.cos(angle);
          const y = center + radius * val * Math.sin(angle);
          return `<circle cx="${x}" cy="${y}" r="4" fill="var(--accent-primary)" stroke="#fff" stroke-width="1.5" />`;
        }).join('')}
        ${labels}
      </svg>
    `;
  }
}

window.AnalyticsModule = AnalyticsModule;
