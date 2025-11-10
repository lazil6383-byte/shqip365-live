const tabs = document.querySelectorAll(".tabs button");
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

async function loadMatches(endpoint, containerId) {
  const box = document.getElementById(containerId);
  box.innerHTML = "<p>Ngarko...</p>";
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    const matches = data.matches || [];
    box.innerHTML = matches.length
      ? matches.map(m => `
        <div class="match">
          <div>
            <div>${m.homeTeam.name}</div>
            <div>${m.awayTeam.name}</div>
          </div>
          <div class="score">${m.score.fullTime.home ?? "-"} - ${m.score.fullTime.away ?? "-"}</div>
        </div>`).join("")
      : "<p>S'ka ndeshje</p>";
  } catch {
    box.innerHTML = "<p>Gabim gjatë ngarkimit</p>";
  }
}

async function refreshAll() {
  await loadMatches("/api/live", "live-list");
  await loadMatches("/api/upcoming", "upcoming-list");
  await loadMatches("/api/finished", "finished-list");
}

refreshAll();
setInterval(() => loadMatches("/api/live", "live-list"), 20000);
