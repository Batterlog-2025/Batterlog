document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-account-form');
  const nameInput = document.getElementById('name');
  const positionInput = document.getElementById('position');
  const teamInput = document.getElementById('team');
  const imageInput = document.getElementById('profile-image');
  const preview = document.getElementById('preview');

  // 画像プレビュー
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // フォーム送信処理
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const position = positionInput.value.trim();
    const team = teamInput.value.trim();

    if (!name) {
      alert('名前を入力してください');
      return;
    }

    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        saveAccount(name, position, team, e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      saveAccount(name, position, team, 'assets/img/default-profile.png');
    }
  });

  function saveAccount(name, position, team, image) {
    const id = 'id-' + Date.now(); // 一意なID
    const newAccount = { id, name, position, team, image };

    // 既存メンバー一覧に追加
    const members = JSON.parse(localStorage.getItem('members')) || [];
    members.push(newAccount);
    localStorage.setItem('members', JSON.stringify(members));

    // このアカウントを選択状態に
    localStorage.setItem('account', JSON.stringify(newAccount));

    alert('アカウントを作成しました');
    window.location.href = 'index.html';
  }
});