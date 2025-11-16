const API_URL = "/api/matches";

document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
});

// =====================================================
//  NGARKO NDESHJET LIVE NGA SERVERI YT (SOFASCORE API)
// =====================================================
async function loadMatches() {
  const container = document.getElementById("matches-container");
  container.innerHTML = `<div class="loading">Duke ngarkuar ndeshjet...</div>`;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Gabim nga serveri");

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `<div class="error">S’ka ndeshje live për momentin.</div>`;
      return;
    }

    renderMatches(data);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="error">Gabim gjatë marrjes së të dhënave.</div>`;
  }
}

// =====================================================
//  SHFAQ NDESHJET NGA API
// =====================================================
function renderMatches(matches) {
  const container = document.getElementById("matches-container");
  container.innerHTML = "";

  const byDate = {};
  for (const m of matches) {
    const key = m.date || "Today";
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(m);
  }

  const dayTemplate = document.getElementById("day-group-template");
  const matchTemplate = document.getElementById("match-card-template");

  Object.keys(byDate).forEach((dateKey) => {
    const dayNode = dayTemplate.content.cloneNode(true);
    const header = dayNode.querySelector(".day-header");
    const list = dayNode.querySelector(".matches-list");

    header.textContent = dateKey;

    byDate[dateKey].forEach((m) => {
      const node = matchTemplate.content.cloneNode(true);

      node.querySelector(".home-name").textContent = m.home;
      node.querySelector(".away-name").textContent = m.away;
      node.querySelector(".score").textContent = m.score || "";
      node.querySelector(".time").textContent = m.time || "";

      // Ndalo odds sepse nuk ka odds nga SofaScore
      node.querySelector(".odd-home").innerHTML = "--";
      node.querySelector(".odd-draw").innerHTML = "--";
      node.querySelector(".odd-away").innerHTML = "--";

      list.appendChild(node);
    });

    container.appendChild(dayNode);
  });
}
