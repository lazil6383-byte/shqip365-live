const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function card(m){
  const home = m.homeTeam?.name || "—";
  const away = m.awayTeam?.name || "—";
  const scH = m.score?.fullTime?.home ?? "";
  const scA = m.score?.fullTime?.away ?? "";
  const score = (["IN_PLAY","PAUSED","FINISHED"].includes(m.status)) ? `${scH} - ${scA}` : "—";
  const status = m.status;
  const when = new Date(m.utcDate).toLocaleString("sq-AL",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"short"});
  const badge = status==="FINISHED"?"fin":(status==="SCHEDULED"?"soon":"live");
  return `
  <div class="card">
    <div class="row"><strong>${m.competition?.name || ""}</strong><span class="badge ${badge}">${status}</span></div>
    <div class="row">
      <div class="team">${home}</div>
      <div class="score">${score}</div>
      <div class="team" style="text-align:right">${away}</div>
    </div>
    <div style="font-size:12px;color:#aaa">${when}</div>
  </div>`;
}

async function load(endpoint, target){
  const el = $(target);
  el.innerHTML = `<div class="card">Duke ngarkuar...</div>`;
  try{
    const r = await fetch(endpoint);
    const data = await r.json();
    const list = data.matches || [];
    el.innerHTML = list.length ? list.map(card).join("") : `<div class="card">S’ka ndeshje për momentin.</div>`;
  }catch{
    el.innerHTML = `<div class="card">Gabim gjatë ngarkimit.</div>`;
  }
}

function tabs(){
  $$(".tab").forEach(b=>{
    b.onclick = ()=>{
      $$(".tab").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      const t = b.dataset.target;
      $$(".panel").forEach(p=>p.classList.remove("visible"));
      $("#"+t).classList.add("visible");
      if(t==="live") load("/api/live","#liveList");
      if(t==="upcoming") load("/api/upcoming","#upcomingList");
      if(t==="finished") load("/api/finished","#finishedList");
    }
  });
}

async function init(){
  tabs();
  await load("/api/live","#liveList");
  await load("/api/upcoming","#upcomingList");
  await load("/api/finished","#finishedList");
  setInterval(()=>load("/api/live","#liveList"),120000); // rifresko çdo 2 min
}

init();
