document.addEventListener("DOMContentLoaded", function () {
  // 戻るボタン
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', function () {
      window.location.href = 'stats.html';
    });
  }

  const games = JSON.parse(localStorage.getItem("games")) || [];

  const tableBody = document.getElementById("game-list");
  const summary = document.getElementById("summary");

  let totalGames = games.length;
  let totalAtBats = 0;
  let totalPlateAppearances = 0;
  let totalHits = 0;
  let totalDoubles = 0;
  let totalTriples = 0;
  let totalHomeRuns = 0;
  let totalRBIs = 0;
  let totalRuns = 0;
  let totalWalks = 0;
  let totalStrikeouts = 0;
  let totalStolenBases = 0;
  let totalSacrifices = 0;
  let totalSacrificeFlies = 0;

  games.forEach((game, index) => {
    let gameAtBats = 0;
    let gamePlateAppearances = 0;
    let gameHits = 0;
    let gameDoubles = 0;
    let gameTriples = 0;
    let gameHomeRuns = 0;
    let gameRBIs = 0;
    let gameRuns = 0;
    let gameWalks = 0;
    let gameStrikeouts = 0;
    let gameStolenBases = 0;
    let gameSacrifices = 0;
    let gameSacrificeFlies = 0;

    game.details.forEach((detail) => {
      const result = detail.result;
      gamePlateAppearances++;

      switch (result) {
        case "ヒット":
          gameAtBats++;
          gameHits++;
          break;
        case "ツーベース":
          gameAtBats++;
          gameHits++;
          gameDoubles++;
          break;
        case "スリーベース":
          gameAtBats++;
          gameHits++;
          gameTriples++;
          break;
        case "ホームラン":
          gameAtBats++;
          gameHits++;
          gameHomeRuns++;
          break;
        case "四球":
        case "死球":
          gameWalks++;
          break;
        case "三振":
          gameAtBats++;
          gameStrikeouts++;
          break;
        case "犠打":
          gameSacrifices++;
          break;
        case "犠飛":
          gameSacrificeFlies++;
          break;
        case "ゴロアウト":
        case "フライアウト":
        case "その他":
          gameAtBats++;
          break;
        default:
          break;
      }

      gameRBIs += detail.rbi;
      gameRuns += detail.run;
      gameStolenBases += detail.sb;
    });

    totalAtBats += gameAtBats;
    totalPlateAppearances += gamePlateAppearances;
    totalHits += gameHits;
    totalDoubles += gameDoubles;
    totalTriples += gameTriples;
    totalHomeRuns += gameHomeRuns;
    totalRBIs += gameRBIs;
    totalRuns += gameRuns;
    totalWalks += gameWalks;
    totalStrikeouts += gameStrikeouts;
    totalStolenBases += gameStolenBases;
    totalSacrifices += gameSacrifices;
    totalSacrificeFlies += gameSacrificeFlies;

    const battingAverage = gameAtBats > 0 ? (gameHits / gameAtBats).toFixed(3) : "0.000";
    const onBasePercentage =
      gamePlateAppearances > 0
        ? ((gameHits + gameWalks) / gamePlateAppearances).toFixed(3)
        : "0.000";
    const sluggingPercentage =
      gameAtBats > 0
        ? (
          (gameHits -
            gameDoubles -
            gameTriples -
            gameHomeRuns +
            gameDoubles * 2 +
            gameTriples * 3 +
            gameHomeRuns * 4) /
          gameAtBats
        ).toFixed(3)
        : "0.000";
    const ops = (parseFloat(onBasePercentage) + parseFloat(sluggingPercentage)).toFixed(3);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border px-4 py-2">${game.date}</td>
      <td class="border px-4 py-2">${game.opponent}</td>
      <td class="border px-4 py-2">${gameAtBats}</td>
      <td class="border px-4 py-2">${gameHits}</td>
      <td class="border px-4 py-2">${gameRBIs}</td>
      <td class="border px-4 py-2">${gameRuns}</td>
      <td class="border px-4 py-2">${gameWalks}</td>
      <td class="border px-4 py-2">${gameStrikeouts}</td>
      <td class="border px-4 py-2">${gameStolenBases}</td>
      <td class="border px-4 py-2">${battingAverage}</td>
      <td class="border px-4 py-2">${onBasePercentage}</td>
      <td class="border px-4 py-2">${sluggingPercentage}</td>
      <td class="border px-4 py-2">${ops}</td>
    `;
    tableBody.appendChild(row);
  });

  const totalBattingAverage =
    totalAtBats > 0 ? (totalHits / totalAtBats).toFixed(3) : "0.000";
  const totalOnBasePercentage =
    totalPlateAppearances > 0
      ? ((totalHits + totalWalks) / totalPlateAppearances).toFixed(3)
      : "0.000";
  const totalSluggingPercentage =
    totalAtBats > 0
      ? (
        (totalHits -
          totalDoubles -
          totalTriples -
          totalHomeRuns +
          totalDoubles * 2 +
          totalTriples * 3 +
          totalHomeRuns * 4) /
        totalAtBats
      ).toFixed(3)
      : "0.000";
  const totalOPS = (
    parseFloat(totalOnBasePercentage) + parseFloat(totalSluggingPercentage)
  ).toFixed(3);

  const summaryStats = [
    { label: "試合数", value: totalGames },
    { label: "打席数", value: totalPlateAppearances },
    { label: "打数", value: totalAtBats },
    { label: "安打", value: totalHits },
    { label: "二塁打", value: totalDoubles },
    { label: "三塁打", value: totalTriples },
    { label: "本塁打", value: totalHomeRuns },
    { label: "打点", value: totalRBIs },
    { label: "得点", value: totalRuns },
    { label: "四死球", value: totalWalks },
    { label: "三振", value: totalStrikeouts },
    { label: "盗塁", value: totalStolenBases },
    { label: "出塁率", value: totalOnBasePercentage },
    { label: "長打率", value: totalSluggingPercentage },
    { label: "打率", value: totalBattingAverage },
    { label: "OPS", value: totalOPS }
  ];

  const summaryGrid = document.getElementById("summary-grid");

  summaryStats.forEach(stat => {
    const card = document.createElement("div");
    card.className = "stats-card";
    card.innerHTML = `
  <div class="stats-label">${stat.label}</div>
    <div class="stats-value">${stat.value}</div>
    
  `;
    summaryGrid.appendChild(card);
  });

});