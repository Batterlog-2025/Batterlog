document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'stats.html';
  });

  const selectedYear = localStorage.getItem('selectedYear');
  const account = JSON.parse(localStorage.getItem("account"));
  const gamesData = JSON.parse(localStorage.getItem("games")) || {};
  const games = gamesData[account?.id] || [];
  const tableBody = document.getElementById("game-list");
  const summaryGrid = document.getElementById("summary-grid");

  const filteredGames = games.filter(g => new Date(g.date).getFullYear() == selectedYear);
  let totalGames = filteredGames.length;
  let totalAtBats = 0, totalPlateAppearances = 0, totalHits = 0;
  let totalDoubles = 0, totalTriples = 0, totalHomeRuns = 0;
  let totalRBIs = 0, totalRuns = 0, totalWalks = 0;
  let totalStrikeouts = 0, totalStolenBases = 0;
  let totalSacrifices = 0, totalSacrificeFlies = 0;
  let totalHitByPitch = 0;
  let totalBases = 0;
  let totalStolenBaseOuts = 0;

  filteredGames.forEach(game => {
    let ab = 0, pa = 0, hits = 0, doubles = 0, triples = 0, hr = 0;
    let rbi = 0, runs = 0, walks = 0, hbp = 0, so = 0, sb = 0, sbOut = 0, sac = 0, sf = 0;

    game.details.forEach(detail => {
      const result = detail.result;
      pa++;

      switch (result) {
        case "ヒット": ab++; hits++; totalBases += 1; break;
        case "ツーベース": ab++; hits++; doubles++; totalBases += 2; break;
        case "スリーベース": ab++; hits++; triples++; totalBases += 3; break;
        case "ホームラン": ab++; hits++; hr++; totalBases += 4; break;
        case "四球": walks++; break;
        case "死球": hbp++; break;
        case "三振": ab++; so++; break;
        case "犠打": sac++; break;
        case "犠飛": sf++; break;
        case "ゴロアウト":
        case "フライアウト":
        case "その他": ab++; break;
      }

      rbi += detail.rbi;
      runs += detail.run;
      sb += detail.sb;
      sbOut += detail.sbOut || 0;
    });

    totalAtBats += ab;
    totalPlateAppearances += pa;
    totalHits += hits;
    totalDoubles += doubles;
    totalTriples += triples;
    totalHomeRuns += hr;
    totalRBIs += rbi;
    totalRuns += runs;
    totalWalks += walks;
    totalHitByPitch += hbp;
    totalStrikeouts += so;
    totalStolenBases += sb;
    totalStolenBaseOuts += sbOut;
    totalSacrifices += sac;
    totalSacrificeFlies += sf;

    const ba = ab ? (hits / ab).toFixed(3) : "0.000";
    const obp = pa ? ((hits + walks + hbp) / pa).toFixed(3) : "0.000";
    const slg = ab ? (totalBases / ab).toFixed(3) : "0.000";
    const ops = (parseFloat(obp) + parseFloat(slg)).toFixed(3);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border px-4 py-2">${game.date}</td>
      <td class="border px-4 py-2">${game.opponent}</td>
      <td class="border px-4 py-2">${ab}</td>
      <td class="border px-4 py-2">${hits}</td>
      <td class="border px-4 py-2">${rbi}</td>
      <td class="border px-4 py-2">${runs}</td>
      <td class="border px-4 py-2">${walks}</td>
      <td class="border px-4 py-2">${so}</td>
      <td class="border px-4 py-2">${sb}</td>
      <td class="border px-4 py-2">${ba}</td>
      <td class="border px-4 py-2">${obp}</td>
      <td class="border px-4 py-2">${slg}</td>
      <td class="border px-4 py-2">${ops}</td>
    `;
    tableBody.appendChild(row);
  });

  const totalBA = totalAtBats ? (totalHits / totalAtBats).toFixed(3) : "0.000";
  const totalOBP = totalPlateAppearances ? ((totalHits + totalWalks + totalHitByPitch) / totalPlateAppearances).toFixed(3) : "0.000";
  const totalSLG = totalAtBats ? (totalBases / totalAtBats).toFixed(3) : "0.000";
  const totalOPS = (parseFloat(totalOBP) + parseFloat(totalSLG)).toFixed(3);

  const stats = [
    { label: "打率", value: totalBA },
    { label: "打数", value: totalAtBats },
    { label: "安打", value: totalHits },
    { label: "本塁打", value: totalHomeRuns },
    { label: "打点", value: totalRBIs },
    { label: "得点", value: totalRuns },
    { label: "四球", value: totalWalks },
    { label: "三振", value: totalStrikeouts },
    { label: "盗塁", value: totalStolenBases },
    { label: "出塁率", value: totalOBP },
    { label: "長打率", value: totalSLG },
    { label: "OPS", value: totalOPS }
  ];

  summaryGrid.innerHTML = ""; // tbodyを初期化

  for (let i = 0; i < stats.length; i += 2) {
    const stat1 = stats[i];
    const stat2 = stats[i + 1];

    const row = document.createElement("tr");
    row.innerHTML = `
    <td class="border px-2 py-1 font-semibold bg-gray-50">${stat1.label}</td>
    <td class="border px-2 py-1 text-right bg-white">${stat1.value}</td>
    <td class="border px-2 py-1 font-semibold bg-gray-50">${stat2?.label || ""}</td>
    <td class="border px-2 py-1 text-right bg-white">${stat2?.value || ""}</td>
  `;
    summaryGrid.appendChild(row);
  }
});