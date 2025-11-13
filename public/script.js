const list = document.getElementById("list");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const tabs = document.querySelectorAll(".tab");

let activeTab = "live";

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeTab = btn.dataset.tab;
    loadMatches();
  });
});

function cardLeagueName(league) {
  if (!league) return "Futboll";
  return league;
}

function fmtStatus(status) {
  if (!status) return "";
  const s = status.toUpperCase();
  if (s.includes("LIVE")) return "LIVE";
  if (s.includes("FT")) return "FT";
  return status;
}

async function loadMatches() {
  loading.classList.remove("hidden");
  empty.classList.add("hidden");
  list.innerHTML = "";

  let endpoint = "/api/live";
  if (activeTab === "upcoming") endpoint = "/api/upcoming";
  if (activeTab === "finished") endpoint = "/api/finished";

  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    const data = await res.json();

    const matches = Array.isArray(data) ? data : [];

    if (!matches.length) {
      empty.classList.remove("hidden");
      empty.textContent = "S’ka ndeshje për momentin.";
      return;
    }

    for (const m of matches) {
      const card = document.createElement("div");
      card.className = "card" + (activeTab === "live" ? " live" : "");

      card.innerHTML = `
        <div class="league">
          ${cardLeagueName(m.league)}
        </div>
        <div class="row">
          <div class="team">${m.home || "-"}</div>
          <div class="vs">vs</div>
          <div class="team">${m.away || "-"}</div>
        </div>
        <div class="row bottom">
          <div class="status">${fmtStatus(m.status)}</div>
          <div class="time">${m.scoreOrTime || ""}</div>
        </div>
      `;

      list.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    empty.classList.remove("hidden");
    empty.textContent = "Gabim gjatë marrjes së ndeshjeve.";
  } finally {
    loading.classList.add("hidden");
  }
}

// Ngarko në fillim dhe rifresko çdo 60 sekonda
loadMatches();
setInterval(loadMatches, 60000);
