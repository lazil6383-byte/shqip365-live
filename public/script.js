// Tabs
document.querySelectorAll(".tabs button").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(s=>s.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

function fmtTime(dateStr, timeStr){
  const t = timeStr && timeStr !== "00:00:00" ? `${dateStr}T${timeStr}Z` : `${dateStr}T00:00:00Z`;
  const d = new Date(t);
  const dd = d.toLocaleDateString([], { day:"2-digit", month:"2-digit" });
  const hh = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${dd} • ${hh}`;
}

function card(match, type){
  const statusClass = type === "live" ? "live" : (type==="finished"?"finished":"upcoming");
  const score = (match.homeScore ?? "-") + " : " + (match.awayScore ?? "-");
  const when = match.date ? fmtTime(match.date, match.time) : "";

  return `
    <div class="match">
      <div class="left">
        <div class="league">${match.league || match.country || ""}</div>
        <div class="teams">${match.homeTeam} vs ${match.awayTeam}</div>
        <div class="meta">${when}</div>
      </div>
      <div class="right">
        <div class="badge ${statusClass}">${type.toUpperCase()}</div>
        <div class="score">${score}</div>
      </div>
    </div>
  `;
}

async function load(endpoint, container, type){
  container.innerHTML = "<div class='meta'>Po ngarkohet...</div>";
  try{
    const r = await fetch(endpoint, { cache: "no-store" });
    const data = await r.json();
    const arr = Array.isArray(data?.matches) ? data.matches : [];
    if (!arr.length){
      container.innerHTML = "<div class='meta'>S'ka ndeshje për momentin.</div>";
      return;
    }
    container.innerHTML = arr.map(m => card(m, type)).join("");
  }catch(e){
    container.innerHTML = "<div class='meta'>Gabim gjatë ngarkimit.</div>";
  }
}

const liveBox = document.getElementById("live-list");
const upcBox  = document.getElementById("upcoming-list");
const finBox  = document.getElementById("finished-list");

async function refreshAll(){
  await Promise.all([
    load("/api/live", liveBox, "live"),
    load("/api/upcoming", upcBox, "upcoming"),
    load("/api/finished", finBox, "finished")
  ]);
}

refreshAll();
// Rifresko LIVE çdo 20s; të tjerat çdo 2 min
setInterval(()=> load("/api/live", liveBox, "live"), 20000);
setInterval(()=> load("/api/upcoming", upcBox, "upcoming"), 120000);
setInterval(()=> load("/api/finished", finBox, "finished"), 180000);
