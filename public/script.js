const API_URL = "/api/matches";

document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
});

async function loadMatches() {
  const container = document.getElementById("matches-container");
  container.innerHTML = `<div class="loading">Duke ngarkuar ndeshjet...</div>`;

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = `<div class="error">S’ka ndeshje për momentin.</div>`;
      return;
    }

    renderMatches(data);
  } catch (err) {
    container.innerHTML = `<div class="error">Gabim gjatë marrjes së të dhënave.</div>`;
  }
}

function renderMatches(matches) {
  const container = document.getElementById("matches-container");
  container.innerHTML = "";

  matches.forEach((m) => {
    container.innerHTML += `
      <div class="match-card">
        <div class="teams-row">
          <strong>${m.home}</strong> vs <strong>${m.away}</strong>
        </div>
        <div class="info-row">
          <span>${m.date}</span>
          <span>${m.time}</span>
        </div>
      </div>
    `;
  });
}
