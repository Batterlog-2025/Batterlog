document.addEventListener("DOMContentLoaded", () => {
    const gameInfoDiv = document.getElementById("game-info");
    const atBatsContainer = document.getElementById("at-bats-container");
    const editButton = document.getElementById("edit-button");
    const backButton = document.getElementById("back-button");

    const params = new URLSearchParams(window.location.search);
    const gameId = parseInt(params.get("index"), 10);

    let games = JSON.parse(localStorage.getItem("games")) || [];
    let game = games[gameId];

    if (!game) {
        gameInfoDiv.innerHTML = "<p>試合データが見つかりません。</p>";
        return;
    }

    let editMode = false;

    function renderView() {
        const atBats = game.details || game.atBats || [];

        gameInfoDiv.innerHTML = `
            <p><strong>日付:</strong> ${game.date}</p>
            <p><strong>対戦相手:</strong> ${game.opponent}</p>
            <p><strong>場所:</strong> ${game.location || '不明'}</p>
        `;

        atBatsContainer.innerHTML = '';
        atBats.forEach((atBat, index) => {
            const atBatDiv = document.createElement("div");
            atBatDiv.className = "bg-gray-100 p-4 rounded mb-4";
            atBatDiv.innerHTML = `
                <h3 class="text-lg font-semibold mb-2">第${index + 1}打席</h3>
                <p><strong>結果:</strong> ${atBat.result}</p>
                <p><strong>打点:</strong> ${atBat.rbi}</p>
                <p><strong>盗塁:</strong> ${atBat.sb}</p>
                <p><strong>得点:</strong> ${atBat.run}</p>
                <p><strong>アウトカウント:</strong> ${atBat.outCount}</p>
                <p><strong>ランナー状況:</strong> 1塁: ${atBat.runners.runner1 ? "○" : "×"}, 2塁: ${atBat.runners.runner2 ? "○" : "×"}, 3塁: ${atBat.runners.runner3 ? "○" : "×"}</p>
            `;
            atBatsContainer.appendChild(atBatDiv);
        });

        editButton.textContent = "編集";
        editMode = false;
    }

    function renderEdit() {
        const atBats = game.details || game.atBats || [];

        gameInfoDiv.innerHTML = `
            <label class="block mb-2"><strong>日付:</strong>
                <input type="date" id="input-date" class="border rounded px-2 py-1 w-full" value="${game.date}">
            </label>
            <label class="block mb-2"><strong>対戦相手:</strong>
                <input type="text" id="input-opponent" class="border rounded px-2 py-1 w-full" value="${game.opponent}">
            </label>
            <label class="block mb-4"><strong>場所:</strong>
                <input type="text" id="input-location" class="border rounded px-2 py-1 w-full" value="${game.location || ''}">
            </label>
        `;

        atBatsContainer.innerHTML = '';

        atBats.forEach((atBat, index) => {
            const atBatDiv = document.createElement("div");
            atBatDiv.className = "bg-gray-100 p-4 rounded mb-4";
            atBatDiv.innerHTML = `
                <h3 class="text-lg font-semibold mb-2">第${index + 1}打席</h3>
                <label class="block mb-1">結果:
                    <input type="text" class="input-result border rounded px-2 py-1 w-full" data-index="${index}" value="${atBat.result}">
                </label>
                <label class="block mb-1">打点:
                    <input type="number" min="0" class="input-rbi border rounded px-2 py-1 w-full" data-index="${index}" value="${atBat.rbi}">
                </label>
                <label class="block mb-1">盗塁:
                    <input type="number" min="0" class="input-sb border rounded px-2 py-1 w-full" data-index="${index}" value="${atBat.sb}">
                </label>
                <label class="block mb-1">得点:
                    <input type="number" min="0" class="input-run border rounded px-2 py-1 w-full" data-index="${index}" value="${atBat.run}">
                </label>
                <label class="block mb-1">アウトカウント:
                    <input type="number" min="0" max="3" class="input-outCount border rounded px-2 py-1 w-full" data-index="${index}" value="${atBat.outCount}">
                </label>
                <fieldset class="mb-2">
                    <legend>ランナー状況</legend>
                    <label><input type="checkbox" class="input-runner1" data-index="${index}" ${atBat.runners.runner1 ? 'checked' : ''}> 1塁</label>
                    <label class="ml-4"><input type="checkbox" class="input-runner2" data-index="${index}" ${atBat.runners.runner2 ? 'checked' : ''}> 2塁</label>
                    <label class="ml-4"><input type="checkbox" class="input-runner3" data-index="${index}" ${atBat.runners.runner3 ? 'checked' : ''}> 3塁</label>
                </fieldset>
            `;
            atBatsContainer.appendChild(atBatDiv);
        });

        editButton.textContent = "保存";
        editMode = true;
    }

    editButton.addEventListener("click", () => {
        if (!editMode) {
            renderEdit();
        } else {
            // 保存処理
            game.date = document.getElementById("input-date").value;
            game.opponent = document.getElementById("input-opponent").value;
            game.location = document.getElementById("input-location").value;

            let atBats = game.details || game.atBats || [];
            let atBatsCount = 0;
            let hits = 0;
            let rbis = 0;

            atBats.forEach((atBat, index) => {
                atBat.result = document.querySelector(`.input-result[data-index="${index}"]`).value;
                atBat.rbi = parseInt(document.querySelector(`.input-rbi[data-index="${index}"]`).value) || 0;
                atBat.sb = parseInt(document.querySelector(`.input-sb[data-index="${index}"]`).value) || 0;
                atBat.run = parseInt(document.querySelector(`.input-run[data-index="${index}"]`).value) || 0;
                atBat.outCount = parseInt(document.querySelector(`.input-outCount[data-index="${index}"]`).value) || 0;
                atBat.runners.runner1 = document.querySelector(`.input-runner1[data-index="${index}"]`).checked;
                atBat.runners.runner2 = document.querySelector(`.input-runner2[data-index="${index}"]`).checked;
                atBat.runners.runner3 = document.querySelector(`.input-runner3[data-index="${index}"]`).checked;

                // 再集計
                if (!["四球", "死球", "犠打", "犠飛"].includes(atBat.result)) {
                    atBatsCount++;
                }
                if (["ヒット", "ツーベース", "スリーベース", "ホームラン"].includes(atBat.result)) {
                    hits++;
                }
                rbis += atBat.rbi;
            });

            // 保存
            game.details = atBats;
            game.atBats = atBats;
            game.atBatsCount = atBatsCount;
            game.hits = hits;
            game.rbis = rbis;
            game.average = atBatsCount > 0 ? (hits / atBatsCount).toFixed(3) : "0.000";

            games[gameId] = game;
            localStorage.setItem("games", JSON.stringify(games));

            renderView();
        }
    });

    backButton.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    renderView();
});
