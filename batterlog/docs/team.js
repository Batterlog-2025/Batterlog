document.addEventListener("DOMContentLoaded", () => {
    const teamSelector = document.getElementById("team-selector");
    const members = JSON.parse(localStorage.getItem("members")) || [];
    const games = JSON.parse(localStorage.getItem("games")) || {};

    const teams = [...new Set(members.map(m => m.team).filter(t => t))];
    teams.forEach(team => {
        const option = document.createElement("option");
        option.value = team;
        option.textContent = team;
        teamSelector.appendChild(option);
    });

    teamSelector.addEventListener("change", () => {
        const selectedTeam = teamSelector.value;
        renderRankings(selectedTeam);
    });

    if (teams.length > 0) {
        teamSelector.value = teams[0];
        renderRankings(teams[0]);
    }

    // タブの遷移
    document.getElementById("home-tab").addEventListener("click", () => location.href = "index.html");
    document.getElementById("stats-tab").addEventListener("click", () => location.href = "stats.html");
    document.getElementById("settings-tab").addEventListener("click", () => location.href = "settings.html");
});

function renderRankings(team) {
    const members = JSON.parse(localStorage.getItem("members")) || [];
    const games = JSON.parse(localStorage.getItem("games")) || {};
    const teamMembers = members.filter(m => m.team === team);

    const stats = teamMembers.map(member => {
        const playerGames = games[member.id] || [];
        let hits = 0, hr = 0, atBats = 0, rbis = 0, sb = 0;
        let doubles = 0, triples = 0, runs = 0, walks = 0, hbp = 0;

        playerGames.forEach(g => {
            hits += g.hits || 0;
            hr += g.homeRuns || 0;
            atBats += g.atBats || 0;
            rbis += g.rbis || 0;
            sb += g.steals || 0;
            doubles += g.doubles || 0;
            triples += g.triples || 0;
            runs += g.runs || 0;
            walks += g.walks || 0;
            hbp += g.hbp || 0;
        });

        const avg = atBats ? (hits / atBats).toFixed(3) : "0.000";

        return {
            name: member.name,
            avg,
            hr,
            rbis,
            sb,
            hits,
            doubles,
            triples,
            runs,
            walks,
            hbp
        };
    });

    const rankingContainer = document.getElementById("ranking-overall");
    rankingContainer.innerHTML = "";

    const categories = [
        ["打率", "avg"],
        ["本塁打", "hr"],
        ["打点", "rbis"],
        ["盗塁", "sb"],
        ["安打", "hits"],
        ["二塁打", "doubles"],
        ["三塁打", "triples"],
        ["得点", "runs"],
        ["四球", "walks"],
        ["死球", "hbp"]
    ];

    categories.forEach(([label, key]) => {
        const section = document.createElement("section");
        section.className = "mb-6";

        const title = document.createElement("h3");
        title.className = "text-md font-bold mb-2 text-blue-600";
        title.textContent = label;
        section.appendChild(title);

        // テーブル作成部分だけ再掲
        const table = document.createElement("table");
        table.className = "table-fixed w-full text-sm border border-gray-300";

        const thead = document.createElement("thead");
        thead.innerHTML = `
  <tr class="bg-gray-100 border-b border-gray-300">
    <th class="px-2 py-1 border border-gray-300 w-1/6">順位</th>
    <th class="px-2 py-1 border border-gray-300 w-3/6">選手名</th>
    <th class="px-2 py-1 border border-gray-300 text-right w-2/6">${label}</th>
  </tr>`;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        const sorted = [...stats].sort((a, b) => b[key] - a[key]);
        sorted.forEach((player, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
    <td class="px-2 py-1 border border-gray-300 w-1/6">${i + 1}</td>
    <td class="px-2 py-1 border border-gray-300 w-3/6">${player.name}</td>
    <td class="px-2 py-1 border border-gray-300 text-right w-2/6">${player[key]}</td>
  `;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        section.appendChild(table);
        rankingContainer.appendChild(section);
    });
}