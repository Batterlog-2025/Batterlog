function renderRecentGames() {
    const recentGamesSection = document.getElementById('recent-games');
    recentGamesSection.innerHTML = '';

    const gamesData = JSON.parse(localStorage.getItem('games')) || [];

    gamesData.forEach((game, index) => {
        const gameDiv = document.createElement('div');
        gameDiv.classList.add('bg-white', 'rounded-lg', 'shadow-sm', 'mb-3', 'p-4', 'border-l-4', 'border-blue-400');

        // 基本情報（対戦相手、場所、日付、成績）
        gameDiv.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="font-semibold">vs ${game.opponent} @ ${game.location || ''}</span>
                <span class="text-sm text-gray-500">${game.date}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
                <span>${game.details?.length || 0}打席 ${game.atBats}打数 ${game.hits}安打</span>
                <span class="text-blue-600 font-medium">打率 ${game.average}</span>
            </div>
        `;

        // 打席ごとの結果（色分けバッジ）
        if (game.details && game.details.length > 0) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'mt-2 text-sm text-gray-700 flex flex-wrap gap-2';

            game.details.forEach(atBat => {
                const result = atBat.result || '不明';
                let colorClass = '';

                if (['ホームラン', 'スリーベース', 'ツーベース', 'ヒット'].includes(result)) {
                    colorClass = 'bg-green-100 text-green-800';
                } else if (['四球', '死球', '犠打', '犠飛'].includes(result)) {
                    colorClass = 'bg-yellow-100 text-yellow-800';
                } else {
                    colorClass = 'bg-gray-100 text-gray-700';
                }

                const badge = document.createElement('span');
                badge.className = `px-2 py-1 rounded ${colorClass} text-xs font-medium`;
                badge.textContent = result;
                resultDiv.appendChild(badge);
            });

            gameDiv.appendChild(resultDiv);  // ← ノートより前に追加
        }

        // ノート表示
        const notesDiv = document.createElement('div');
        notesDiv.className = 'mt-2 text-xs text-gray-500';
        notesDiv.innerHTML =
            (game.notes && game.notes.length > 0)
                ? game.notes.map(note =>
                    `<span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">${note}</span>`
                ).join('')
                : 'ノートなし';
        gameDiv.appendChild(notesDiv);

        // 詳細・削除ボタン
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'mt-3 flex space-x-2';
        buttonDiv.innerHTML = `
            <button class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600" data-detail-index="${index}">
                詳細
            </button>
            <button class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600" data-delete-index="${index}">
                削除
            </button>
        `;
        gameDiv.appendChild(buttonDiv);

        recentGamesSection.appendChild(gameDiv);
    });

    // 削除ボタンイベント
    recentGamesSection.querySelectorAll('button[data-delete-index]').forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-delete-index'));
            if (confirm("この試合の成績を削除してもよろしいですか？")) {
                gamesData.splice(index, 1);
                localStorage.setItem('games', JSON.stringify(gamesData));
                renderRecentGames();
            }
        });
    });

    // 詳細ボタンイベント
    recentGamesSection.querySelectorAll('button[data-detail-index]').forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-detail-index'));
            window.location.href = `game-detail.html?index=${index}`;
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    renderRecentGames();

    document.getElementById('home-tab').addEventListener('click', function () {
        window.location.href = 'index.html';
    });
    document.getElementById('stats-tab').addEventListener('click', function () {
        window.location.href = 'stats.html';
    });
    document.getElementById('team-tab').addEventListener('click', function () {
        window.location.href = 'team.html';
    });
    document.getElementById('settings-tab').addEventListener('click', function () {
        window.location.href = 'settings.html';
    });

    document.getElementById('record-button').addEventListener('click', function () {
        window.location.href = 'game-entry.html';
    });
});
