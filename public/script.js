const list = document.getElementById("list");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const tabs = document.querySelectorAll(".tab");

let activeTab = "live";

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeTab = btn.dataset.tab;
    load();
  });
});

function fmt(d) {
  try {
    return new Date(d).toLocaleString("sq-AL", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short"
    });
  } catch {
    return d;
  }
}

async function load() {
  loading.classList.remove("hidden");
  empty.classList.add("hidden");
  list.innerHTML = "";

  let url = "/" + activeTab;

  const res = await fetch(url);
  const data = await res.json();

  const arr =
    data.live ||
    data.upcoming ||
    data.finished ||
    [];

  if (!arr.length) {
    empty.classList.remove("hidden");
    loading.classList.add("hidden");
    return;
  }

  arr.forEach(m => {
    const card = document.createElement("div");
    card.className = "card";

    const home =
      m.homeTeam || m.strHomeTeam || m.home_name || "-";
    const away =
      m.awayTeam || m.strAwayTeam || m.away_name || "-";

    const status =
      m.status || m.matchview?.status || m.strStatus || "";

    const score = m.score || m.goalscorers || "";

    const time =
      score
        ? score
        : fmt(m.time || m.dateEvent || m.matchview?.kickoff);

    card.innerHTML = `
      <div class="league">${m.league || m.strLeague || ""}</div>
      <div class="row">
        <div class="team">${home}</div>
        <div class="vs">vs</div>
        <div class="team">${away}</div>
      </div>
      <div class="row">
        <div class="status">${status}</div>
        <div class="time">${time}</div>
      </div>
    `;
    list.appendChild(card);
  });

  loading.classList.add("hidden");
}

load();
setInterval(load, 30000); // refresh çdo 30 sekonda
