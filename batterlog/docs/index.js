// ==============================
// ✅ アカウント情報の表示（マイページ上部に）
// ==============================
function renderAccountInfo() {
    const account = JSON.parse(localStorage.getItem('account'));
    const members = JSON.parse(localStorage.getItem('members')) || [];

    const isValid = account && members.find(m => m.id === account.id);
    const nameEl = document.getElementById('profile-name');
    const positionEl = document.getElementById('profile-position');
    const teamEl = document.getElementById('profile-team');
    const imageEl = document.getElementById('profile-image');

    if (!isValid) {
        nameEl.textContent = 'アカウント未登録';
        positionEl.textContent = '';
        teamEl.textContent = '';
        imageEl.src = 'assets/img/default-profile.png';
        return;
    }

    nameEl.textContent = account.name;
    positionEl.textContent = `ポジション: ${account.position}`;
    teamEl.textContent = `チーム: ${account.team}`;
    imageEl.src = account.image || 'assets/img/default-profile.png';
}
// ==============================
// ✅ アカウント切り替えドロップダウンを表示
// ==============================
function renderAccountSwitcher() {
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const account = JSON.parse(localStorage.getItem('account'));
    const switcher = document.getElementById('account-switcher');

    switcher.innerHTML = '';

    if (members.length === 0) {
        localStorage.removeItem('account'); // ← ゴーストアカウント削除
        const option = document.createElement('option');
        option.textContent = 'アカウント未登録';
        option.disabled = true;
        option.selected = true;
        switcher.appendChild(option);
        return;
    }

    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        if (account && account.id === member.id) {
            option.selected = true;
        }
        switcher.appendChild(option);
    });

    switcher.addEventListener('change', function () {
        const selectedId = this.value;
        const selectedMember = members.find(m => m.id === selectedId);
        if (selectedMember) {
            localStorage.setItem('account', JSON.stringify(selectedMember));
            renderAccountInfo();
            renderRecentGames();
            renderBattingStats();
            showNoAccountMessageIfNeeded();
        }
    });
}

function showNoAccountMessageIfNeeded() {
    const account = JSON.parse(localStorage.getItem('account'));
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const msg = document.getElementById('no-account-message');

    const found = members.find(m => m.id === account?.id);

    if (!account || !found) {
        msg?.classList.remove('hidden');
    } else {
        msg?.classList.add('hidden');
    }
}

// ==============================
// ✅ 成績統計の表示
// ==============================
function renderBattingStats() {
    const account = JSON.parse(localStorage.getItem('account'));
    const members = JSON.parse(localStorage.getItem('members')) || [];

    const isValid = account && members.find(m => m.id === account.id);
    if (!isValid) {
        document.getElementById('batting-stats').innerHTML = `
            <p class="text-gray-500 text-sm">アカウント未登録のため、成績は表示できません。</p>
        `;
        return;
    }

    const allGames = JSON.parse(localStorage.getItem('games')) || {};
    const games = allGames[account.id] || [];

    let plateAppearances = 0;
    let atBats = 0;
    let hits = 0;
    let homeRuns = 0;

    games.forEach(game => {
        if (game.details && Array.isArray(game.details)) {
            game.details.forEach(detail => {
                plateAppearances++;
                if (!['四球', '死球', '犠打', '犠飛'].includes(detail.result)) {
                    atBats++;
                }
                if (['ヒット', 'ツーベース', 'スリーベース', 'ホームラン'].includes(detail.result)) {
                    hits++;
                }
                if (detail.result === 'ホームラン') {
                    homeRuns++;
                }
            });
        }
    });

    const avg = atBats > 0 ? (hits / atBats).toFixed(3) : '0.000';

    document.getElementById('batting-stats').innerHTML = `
        <div class="grid grid-cols-2 gap-4 text-sm">
            <div>打席数：<span class="font-bold">${plateAppearances}</span></div>
            <div>打数：<span class="font-bold">${atBats}</span></div>
            <div>安打：<span class="font-bold">${hits}</span></div>
            <div>本塁打：<span class="font-bold">${homeRuns}</span></div>
            <div class="col-span-2">打率：<span class="font-bold text-blue-600">${avg}</span></div>
        </div>
    `;
}

// ==============================
// ✅ 最近の試合表示（アカウントごとに）
// ==============================
function renderRecentGames() {
    const recentGamesSection = document.getElementById('recent-games');
    recentGamesSection.innerHTML = '';

    const account = JSON.parse(localStorage.getItem('account'));
    const members = JSON.parse(localStorage.getItem('members')) || [];

    const isValid = account && members.find(m => m.id === account.id);
    if (!isValid) {
        recentGamesSection.innerHTML = '<p class="text-gray-500 text-sm">アカウント未登録のため、試合データは表示できません。</p>';
        return;
    }

    const allGames = JSON.parse(localStorage.getItem('games')) || {};
    const gamesData = allGames[account.id] || [];

    if (gamesData.length === 0) {
        recentGamesSection.innerHTML = '<p class="text-gray-500 text-sm">試合データがありません。</p>';
        return;
    }

gamesData.forEach((game, index) => {
    const gameDiv = document.createElement('div');
    gameDiv.classList.add('bg-white', 'rounded-lg', 'shadow-sm', 'mb-3', 'p-4', 'border-l-4', 'border-blue-400');

    gameDiv.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="font-semibold">vs ${game.opponent || ''} @ ${game.location || ''}</span>
                <span class="text-sm text-gray-500">${game.date}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
                <span>${game.details?.length || 0}打席 ${game.atBats}打数 ${game.hits}安打</span>
                <span class="text-blue-600 font-medium">打率 ${game.battingAverage}</span>
            </div>
        `;

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

        gameDiv.appendChild(resultDiv);
    }

    const notesDiv = document.createElement('div');
    notesDiv.className = 'mt-2 text-xs text-gray-500';
    notesDiv.innerHTML =
        (game.notes && game.notes.length > 0)
            ? game.notes.map(note =>
                `<span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">${note}</span>`
            ).join('')
            : 'ノートなし';
    gameDiv.appendChild(notesDiv);

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

// 削除イベント
recentGamesSection.querySelectorAll('button[data-delete-index]').forEach(button => {
    button.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-delete-index'));
        if (confirm("この試合の成績を削除してもよろしいですか？")) {
            gamesData.splice(index, 1);
            const allGames = JSON.parse(localStorage.getItem('games')) || {};
            allGames[account.id] = gamesData;
            localStorage.setItem('games', JSON.stringify(allGames));
            renderRecentGames();
            renderBattingStats();
        }
    });
});

// 詳細イベント
recentGamesSection.querySelectorAll('button[data-detail-index]').forEach(button => {
    button.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-detail-index'));
        window.location.href = `game-detail.html?index=${index}`;
    });
});
}

// ==============================
// ✅ ページ読み込み時に実行
// ==============================
document.addEventListener('DOMContentLoaded', function () {
    renderAccountSwitcher();     // ← 先にこれ（ドロップダウンが先）
    renderAccountInfo();         // ← 次にこれ（選ばれたアカウントを表示）
    renderRecentGames();
    renderBattingStats();
    showNoAccountMessageIfNeeded();

    // タブ・ボタン
    document.getElementById('home-tab').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    document.getElementById('stats-tab').addEventListener('click', () => {
        window.location.href = 'stats.html';
    });
    document.getElementById('team-tab').addEventListener('click', () => {
        window.location.href = 'team.html';
    });
    document.getElementById('settings-tab').addEventListener('click', () => {
        window.location.href = 'settings.html';
    });
    document.getElementById('record-button').addEventListener('click', () => {
        window.location.href = 'game-entry.html';
    });
});