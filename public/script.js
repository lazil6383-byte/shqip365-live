const list = document.getElementById("list");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const tabs = document.querySelectorAll(".tab");

let currentTab = "live";
let lastScores = new Map(); // për efekt GOL

tabs.forEach(b => b.addEventListener("click", () => {
  tabs.forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  currentTab = b.dataset.tab;
  load();
}));

function fmtTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
}

function badgeFor(status) {
  const s = (status || "").toUpperCase();
  if (s === "LIVE" || s === "IN_PLAY" || s === "PAUSED") return `<span class="badge live">LIVE</span>`;
  if (s === "FINISHED" || s === "FT") return `<span class="badge finished">Përfunduar</span>`;
  return `<span class="badge upcoming">UPCOMING</span>`;
}

function renderGroups(groups) {
  list.innerHTML = "";
  if (!groups || !groups.length) { empty.classList.remove("hidden"); return; }
  empty.classList.add("hidden");

  groups.forEach(g => {
    const wrap = document.createElement("section");
    wrap.className = "league";
    wrap.innerHTML = `<h3>${g.league}</h3>`;
    g.matches.forEach(m => {
      const key = `${m.home}__${m.away}`;
      const prev = lastScores.get(key) || "x";
      const cur = `${m.score?.fullTime?.home ?? "-"}:${m.score?.fullTime?.away ?? "-"}`;
      const goalFx = prev !== "x" && prev !== cur ? " goal" : "";
      lastScores.set(key, cur);

      const el = document.createElement("div");
      el.className = "card" + (goalFx ? " goal" : "");
      el.innerHTML = `
        <div class="row">
          <div class="teams">
            <div>${m.home}</div>
            <div>${m.away}</div>
          </div>
          <div class="score">${m.score?.fullTime?.home ?? "-"} : ${m.score?.fullTime?.away ?? "-"}</div>
        </div>
        <div class="row" style="margin-top:8px">
          <div class="kick">${fmtTime(m.utcDate)}</div>
          <div>${badgeFor(m.status)}</div>
        </div>
      `;
      wrap.appendChild(el);
    });
    list.appendChild(wrap);
  });
}

async function fetchJSON(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("net");
  return r.json();
}

async function load() {
  loading.classList.remove("hidden");
  list.innerHTML = "";
  empty.classList.add("hidden");

  try {
    const data = await fetchJSON(`/api/${currentTab}`);
    renderGroups(data.groups || []);
  } catch {
    empty.textContent = "Gabim gjatë ngarkimit.";
    empty.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
}

// Auto-refresh: LIVE çdo 20s, të tjerat çdo 90s
setInterval(() => {
  if (currentTab === "live") load();
}, 20000);
setInterval(() => {
  if (currentTab !== "live") load();
}, 90000);

load();
