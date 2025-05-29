let atBatCount = 0;

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("at-bats-container");
  const addBtn = document.getElementById("add-at-bat-btn");
  const form = document.getElementById("batter-form");

  function createAtBatBlock(index) {
    const wrapper = document.createElement("div");
    wrapper.className = "at-bat border rounded p-4 shadow-sm";

    wrapper.innerHTML = `
      <h3 class="text-md font-semibold mb-2">第${index + 1}打席</h3>

      <div class="mb-4">
          <label class="block font-medium mb-1" for="result-${index}">打撃結果</label>
          <select name="result-${index}" id="result-${index}" class="w-full p-2 border rounded">
              <option value="">選択してください</option>
              <option value="ヒット">ヒット</option>
              <option value="ツーベース">ツーベース</option>
              <option value="スリーベース">スリーベース</option>
              <option value="ホームラン">ホームラン</option>
              <option value="四球">四球</option>
              <option value="死球">死球</option>
              <option value="三振">三振</option>
              <option value="ゴロアウト">ゴロアウト</option>
              <option value="フライアウト">フライアウト</option>
              <option value="犠打">犠打</option>
              <option value="犠飛">犠飛</option>
              <option value="その他">その他</option>
          </select>
      </div>

      <div class="mb-4 grid grid-cols-3 gap-4">
          <div>
              <label class="block font-medium mb-1" for="rbi-${index}">打点 (RBI)</label>
              <input type="number" name="rbi-${index}" id="rbi-${index}" min="0" class="w-full p-2 border rounded" />
          </div>
          <div>
              <label class="block font-medium mb-1" for="sb-${index}">盗塁 (SB)</label>
              <input type="number" name="sb-${index}" id="sb-${index}" min="0" class="w-full p-2 border rounded" />
          </div>
          <div>
              <label class="block font-medium mb-1" for="run-${index}">得点 (Run)</label>
              <input type="number" name="run-${index}" id="run-${index}" min="0" class="w-full p-2 border rounded" />
          </div>
      </div>

      <div class="mb-4">
          <label class="block font-medium mb-1" for="out-count-${index}">アウトカウント</label>
          <select name="out-count-${index}" id="out-count-${index}" class="w-full p-2 border rounded">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
          </select>
      </div>

      <fieldset class="mb-4">
          <legend class="font-medium mb-2">ランナー状況</legend>
          <div class="flex gap-4">
              <label class="inline-flex items-center">
                  <input type="checkbox" name="runner1-${index}" id="runner1-${index}" class="form-checkbox" />
                  <span class="ml-2">1塁ランナー</span>
              </label>
              <label class="inline-flex items-center">
                  <input type="checkbox" name="runner2-${index}" id="runner2-${index}" class="form-checkbox" />
                  <span class="ml-2">2塁ランナー</span>
              </label>
              <label class="inline-flex items-center">
                  <input type="checkbox" name="runner3-${index}" id="runner3-${index}" class="form-checkbox" />
                  <span class="ml-2">3塁ランナー</span>
              </label>
          </div>
      </fieldset>
    `;

    container.appendChild(wrapper);
  }

  createAtBatBlock(atBatCount);
  atBatCount++;

  addBtn.addEventListener("click", () => {
    createAtBatBlock(atBatCount);
    atBatCount++;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!confirm("入力内容を確認しましたか？ 保存しますか？")) return;

    const gameDate = form.querySelector("[name='game-date']").value;
    const opponent = form.querySelector("[name='opponent']").value;
    const location = form.querySelector("[name='location']").value;

    const details = [];
    let plateAppearances = 0;
    let atBats = 0;
    let hits = 0;
    let doubles = 0;
    let triples = 0;
    let homeRuns = 0;
    let walks = 0;
    let hbp = 0;
    let strikeouts = 0;
    let rbis = 0;
    let runs = 0;
    let steals = 0;
    let totalBases = 0;

    for (let i = 0; i < atBatCount; i++) {
      const result = form.querySelector(`[name="result-${i}"]`)?.value || "";
      const rbi = Number(form.querySelector(`[name="rbi-${i}"]`)?.value || 0);
      const sb = Number(form.querySelector(`[name="sb-${i}"]`)?.value || 0);
      const run = Number(form.querySelector(`[name="run-${i}"]`)?.value || 0);
      const outCount = Number(form.querySelector(`[name="out-count-${i}"]`)?.value || 0);
      const runner1 = form.querySelector(`[name="runner1-${i}"]`)?.checked || false;
      const runner2 = form.querySelector(`[name="runner2-${i}"]`)?.checked || false;
      const runner3 = form.querySelector(`[name="runner3-${i}"]`)?.checked || false;

      // カウント処理
      plateAppearances++;
      if (!["四球", "死球", "犠打", "犠飛"].includes(result)) atBats++;

      switch (result) {
        case "ヒット":
          hits++;
          totalBases += 1;
          break;
        case "ツーベース":
          hits++;
          doubles++;
          totalBases += 2;
          break;
        case "スリーベース":
          hits++;
          triples++;
          totalBases += 3;
          break;
        case "ホームラン":
          hits++;
          homeRuns++;
          totalBases += 4;
          break;
        case "四球":
          walks++;
          break;
        case "死球":
          hbp++;
          break;
        case "三振":
          strikeouts++;
          break;
      }

      rbis += rbi;
      steals += sb;
      runs += run;

      details.push({
        result,
        rbi,
        sb,
        run,
        outCount,
        runners: {
          runner1,
          runner2,
          runner3
        }
      });
    }

    // 成績の計算
    const battingAverage = atBats ? (hits / atBats).toFixed(3) : "0.000";
    const obpDenominator = atBats + walks + hbp;
    const onBasePercentage = obpDenominator ? ((hits + walks + hbp) / obpDenominator).toFixed(3) : "0.000";
    const sluggingPercentage = atBats ? (totalBases / atBats).toFixed(3) : "0.000";
    const ops = (parseFloat(onBasePercentage) + parseFloat(sluggingPercentage)).toFixed(3);

    const newGame = {
      date: gameDate,
      opponent,
      location,
      plateAppearances,
      atBats,
      hits,
      doubles,
      triples,
      homeRuns,
      walks,
      hbp,
      strikeouts,
      steals,
      runs,
      rbis,
      battingAverage,
      onBasePercentage,
      sluggingPercentage,
      ops,
      details
    };

    const storedGames = JSON.parse(localStorage.getItem("games")) || [];
    storedGames.unshift(newGame);
    localStorage.setItem("games", JSON.stringify(storedGames));

    alert("保存しました。マイページに移動します。");
    window.location.href = "index.html";
  });
});
