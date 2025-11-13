const API_URL = "/api/matches";

document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
});

async function loadMatches() {
  const container = document.getElementById("matches-container");
  container.innerHTML = `<div class="loading">Duke ngarkuar ndeshjet...</div>`;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Gabim nga serveri");

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `<div class="error">S’ka ndeshje për momentin.</div>`;
      return;
    }

    renderMatches(data);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="error">Nuk u lexuan ndeshjet. Provo prap më vonë.</div>`;
  }
}

function renderMatches(matches) {
  const container = document.getElementById("matches-container");
  container.innerHTML = "";

  // Grupi sipas datës (Thu 13 Nov, Fri 14 Nov, ...)
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

      const scoreEl = node.querySelector(".score");
      const timeEl = node.querySelector(".time");

      if (m.live) {
        scoreEl.textContent = m.score || "0 - 0";
        timeEl.textContent = m.time || "LIVE";
        timeEl.style.color = "#ff4d4f";
      } else {
        scoreEl.textContent = "";
        timeEl.textContent = m.time || "";
      }

      const oddHome = node.querySelector(".odd-home");
      const oddDraw = node.querySelector(".odd-draw");
      const oddAway = node.querySelector(".odd-away");

      setOddButton(oddHome, "1", m.odds?.home);
      setOddButton(oddDraw, "X", m.odds?.draw);
      setOddButton(oddAway, "2", m.odds?.away);

      list.appendChild(node);
    });

    container.appendChild(dayNode);
  });
}

function setOddButton(btn, label, value) {
  btn.innerHTML = "";
  const spanLabel = document.createElement("span");
  spanLabel.className = "label";
  spanLabel.textContent = label;

  const spanValue = document.createElement("span");
  spanValue.textContent = value != null ? value.toFixed(2) : "--";

  btn.appendChild(spanLabel);
  btn.appendChild(spanValue);
}
