document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('account-form');
    const nameInput = document.getElementById('name');
    const positionInput = document.getElementById('position');
    const teamInput = document.getElementById('team');
    const imageInput = document.getElementById('profile-image');
    const profilePreview = document.getElementById('profile-preview');

    // 初期データ取得
    const raw = JSON.parse(localStorage.getItem('account')) || {};
    const account = {
        name: raw.name || '',
        position: raw.position || '',
        team: raw.team || '',
        image: raw.image || '',
        id: raw.id || 'id-' + Date.now() // ← IDも保持
    };

    // 初期値を画面に表示
    nameInput.value = account.name;
    positionInput.value = account.position;
    teamInput.value = account.team;
    if (account.image) {
        profilePreview.src = account.image;
    }

    // 画像変更プレビュー
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            profilePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 保存ボタン
    form.addEventListener('submit', e => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const position = positionInput.value.trim();
        const team = teamInput.value.trim();

        if (!name || name.length > 20) {
            alert('名前は1〜20文字で入力してください。');
            return;
        }
        if (!team || team.length > 30) {
            alert('チーム名は1〜30文字で入力してください。');
            return;
        }

        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                saveAccount(name, position, team, e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            saveAccount(name, position, team, account.image);
        }
    });

    function saveAccount(name, position, team, image) {
        const id = account.id;
        const updatedAccount = { id, name, position, team, image };

        const membersList = JSON.parse(localStorage.getItem('members')) || [];
        const existingIndex = membersList.findIndex(m => m.id === id);
        if (existingIndex !== -1) {
            membersList[existingIndex] = updatedAccount;
        } else {
            membersList.push(updatedAccount);
        }

        localStorage.setItem('account', JSON.stringify(updatedAccount));
        localStorage.setItem('members', JSON.stringify(membersList));

        alert('アカウント情報を保存しました');
        window.location.href = 'index.html';
    }

    // キャンセルボタン
    document.getElementById('cancel').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // アカウント削除処理
    const deleteBtn = document.getElementById('delete-account');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const confirmed = confirm('本当にこのアカウントを削除しますか？この操作は取り消せません。');
            if (!confirmed) return;

            const storedAccount = JSON.parse(localStorage.getItem('account')) || {};
            const membersList = JSON.parse(localStorage.getItem('members')) || [];

            const updatedMembers = membersList.filter(m => m.id !== storedAccount.id);
            localStorage.setItem('members', JSON.stringify(updatedMembers));

            const allGames = JSON.parse(localStorage.getItem('games')) || {};
            delete allGames[storedAccount.id];
            localStorage.setItem('games', JSON.stringify(allGames));

            if (updatedMembers.length > 0) {
                localStorage.setItem('account', JSON.stringify(updatedMembers[0]));
            } else {
                localStorage.removeItem('account');
            }

            alert('アカウントを削除しました');
            window.location.href = 'index.html';
        });
    }
});