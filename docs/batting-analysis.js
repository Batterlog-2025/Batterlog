document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'stats.html';
  });

  const selectedYear = localStorage.getItem('selectedYear');
  const account = JSON.parse(localStorage.getItem("account"));
  const gamesData = JSON.parse(localStorage.getItem("games")) || {};
  const games = (gamesData[account?.id] || []).filter(game =>
    new Date(game.date).getFullYear() == selectedYear
  );

  const validMonths = ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const monthStatsMap = {};

  for (const game of games) {
    const monthIndex = new Date(game.date).getMonth();
    if (monthIndex < 3) continue;

    const label = `${monthIndex + 1}月`;
    if (!monthStatsMap[label]) {
      monthStatsMap[label] = {
        label,
        ab: 0, h: 0, hr: 0, rbi: 0, r: 0, so: 0, bb: 0
      };
    }

    const stat = monthStatsMap[label];
    stat.ab += game.atBats;
    stat.h += game.hits;
    stat.hr += game.homeRuns;
    stat.rbi += game.rbis;
    stat.r += game.runs;
    stat.so += game.strikeouts;
    stat.bb += game.walks;
  }

  for (const stat of Object.values(monthStatsMap)) {
    stat.avg = stat.ab ? stat.h / stat.ab : 0;
  }

  function renderMonthlyCards(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    validMonths.forEach(month => {
      const stat = monthStatsMap[month];
      const card = document.createElement("div");
      card.className = "p-4 rounded-2xl shadow border divide-y divide-gray-200";

      if (stat) {
        card.innerHTML = `
          <h3 class="text-md font-semibold mb-2">${stat.label}</h3>
          <div class="grid grid-cols-2 text-sm gap-y-1 pt-2">
            <div>打率: ${stat.avg.toFixed(3)}</div>
            <div>打数: ${stat.ab}</div>
            <div>安打: ${stat.h}</div>
            <div>本塁打: ${stat.hr}</div>
            <div>打点: ${stat.rbi}</div>
            <div>得点: ${stat.r}</div>
            <div>三振: ${stat.so}</div>
            <div>四球: ${stat.bb}</div>
          </div>
        `;
      } else {
        card.innerHTML = `
          <h3 class="text-md font-semibold mb-2">${month}</h3>
          <p class="text-center text-gray-500 pt-4">データがありません</p>
        `;
      }

      container.appendChild(card);
    });
  }

  function computeStatsByCondition(label, filterFn) {
    const stats = { label, ab: 0, h: 0, hr: 0, rbi: 0, r: 0, so: 0, bb: 0 };

    for (const game of games) {
      for (const detail of game.details) {
        if (!filterFn(detail)) continue;

        const result = detail.result;
        const isHit = ["ヒット", "ツーベース", "スリーベース", "ホームラン"].includes(result);
        const isAtBat = !["四球", "死球", "犠打", "犠飛"].includes(result);

        if (isAtBat) stats.ab++;
        if (isHit) stats.h++;
        if (result === "ホームラン") stats.hr++;
        if (result === "三振") stats.so++;
        if (result === "四球") stats.bb++;

        stats.rbi += detail.rbi;
        stats.r += detail.run;
      }
    }

    stats.avg = stats.ab ? stats.h / stats.ab : 0;
    return stats;
  }

  const runnerStats = [
    computeStatsByCondition("ランナーなし", d => !d.runners.runner1 && !d.runners.runner2 && !d.runners.runner3),
    computeStatsByCondition("一塁", d => d.runners.runner1 && !d.runners.runner2 && !d.runners.runner3),
    computeStatsByCondition("得点圏", d => d.runners.runner2 || d.runners.runner3),
  ];

  const outCountStats = [0, 1, 2].map(n =>
    computeStatsByCondition(`${n}アウト`, d => d.outCount === n)
  );

  function renderCards(containerId, stats) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    stats.forEach(stat => {
      const card = document.createElement("div");
      card.className = "p-4 rounded-2xl shadow border divide-y divide-gray-200";

      if (stat.ab === 0) {
        card.innerHTML = `
          <h3 class="text-md font-semibold mb-2">${stat.label}</h3>
          <p class="text-center text-gray-500 pt-4">データがありません</p>
        `;
      } else {
        card.innerHTML = `
          <h3 class="text-md font-semibold mb-2">${stat.label}</h3>
          <div class="grid grid-cols-2 text-sm gap-y-1 pt-2">
            <div>打率: ${stat.avg.toFixed(3)}</div>
            <div>打数: ${stat.ab}</div>
            <div>安打: ${stat.h}</div>
            <div>本塁打: ${stat.hr}</div>
            <div>打点: ${stat.rbi}</div>
            <div>得点: ${stat.r}</div>
            <div>三振: ${stat.so}</div>
            <div>四球: ${stat.bb}</div>
          </div>
        `;
      }

      container.appendChild(card);
    });
  }

  renderMonthlyCards("monthly-section");
  renderCards("runner-section", runnerStats);
  renderCards("outcount-section", outCountStats);
});