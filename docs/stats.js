document.addEventListener('DOMContentLoaded', function () {
  // 戻るボタン
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }

 // ページ遷移（年を保存してから移動する！）
document.getElementById('yearly-stats').addEventListener('click', () => {
  const selectedYear = document.getElementById('period-select').value;
  localStorage.setItem('selectedYear', selectedYear); // ← ここがポイント！
  window.location.href = 'annual-stats-detail.html';
});

document.getElementById('batting-analysis').addEventListener('click', () => {
  const selectedYear = document.getElementById('period-select').value;
  localStorage.setItem('selectedYear', selectedYear); // ← これも！
  window.location.href = 'batting-analysis.html';
});


  // プルダウン変更時に再描画
  document.getElementById('period-select').addEventListener('change', function () {
  const selectedYear = this.value;
  localStorage.setItem('selectedYear', selectedYear); // ← メモする！
  renderMainStats();
});

  renderMainStats();
});

function renderMainStats() {
  const mainStatsEl = document.getElementById('main-stats');
  const stats = calculateStatsFromGames();

  const createCard = (label, value, trend, isUp) => `
    <div class="stats-card">
      <div class="stats-label">${label}</div>
      <div class="stats-value">${value}</div>
      <div class="trend ${isUp ? 'trend-up' : 'trend-down'}">
        <span>${isUp ? '↑' : '↓'}</span>
        <span>${trend}</span>
      </div>
    </div>
  `;

  mainStatsEl.innerHTML = `
    ${createCard('打率', stats.average, stats.trend.average, stats.trend.average >= 0)}
    ${createCard('出塁率', stats.obp, stats.trend.obp, stats.trend.obp >= 0)}
    ${createCard('長打率', stats.slg, stats.trend.slg, stats.trend.slg >= 0)}
    ${createCard('OPS', stats.ops, stats.trend.ops, stats.trend.ops >= 0)}
  `;
}

function calculateStatsFromGames() {
  const selectedPeriod = document.getElementById('period-select').value;
  const gamesByMember = JSON.parse(localStorage.getItem('games')) || {};
  const account = JSON.parse(localStorage.getItem('account'));
  if (!account || !gamesByMember[account.id]) {
    return {
      average: '0.000',
      obp: '0.000',
      slg: '0.000',
      ops: '0.000',
      trend: {
        average: 0,
        obp: 0,
        slg: 0,
        ops: 0
      }
    };
  }

  const games = gamesByMember[account.id];

  let atBats = 0, hits = 0, walks = 0, hbp = 0, totalBases = 0;

  games.forEach(game => {
    if (!game.details || !game.date) return;

    const gameDate = new Date(game.date);
    const year = gameDate.getFullYear();

    if (selectedPeriod === '2025' && year !== 2025) return;
    if (selectedPeriod === '2024' && year !== 2024) return;

    game.details.forEach(atBat => {
      const result = atBat.result;
      switch (result) {
        case 'ヒット': hits++; totalBases += 1; atBats++; break;
        case 'ツーベース': hits++; totalBases += 2; atBats++; break;
        case 'スリーベース': hits++; totalBases += 3; atBats++; break;
        case 'ホームラン': hits++; totalBases += 4; atBats++; break;
        case '四球': walks++; break;
        case '死球': hbp++; break;
        case '犠飛': break; // 打数・安打・出塁に含まない
        case '犠打': break;
        default: atBats++; break;
      }
    });
  });

  const average = atBats ? (hits / atBats).toFixed(3) : '0.000';
  const obp = (hits + walks + hbp) / (atBats + walks + hbp) || 0;
  const slg = atBats ? (totalBases / atBats).toFixed(3) : '0.000';
  const ops = (parseFloat(obp.toFixed(3)) + parseFloat(slg)).toFixed(3);

  return {
    average,
    obp: obp.toFixed(3),
    slg,
    ops,
    trend: {
      average: 0.015, // ダミー
      obp: 0.010,
      slg: -0.008,
      ops: 0.002
    }
  };
}
